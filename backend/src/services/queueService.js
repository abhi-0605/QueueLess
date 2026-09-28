import { queueRepository } from '../repositories/queueRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { counterRepository } from '../repositories/counterRepository.js';
import { generateTokenNumber } from '../utils/tokenGenerator.js';
import { calculateEstimatedWaitMinutes } from './waitTimeService.js';
import { BadRequest, Forbidden, NotFound } from '../utils/errors.js';
import { socketEmitter } from '../sockets/socketHandler.js';

export const queueService = {
  getQueueState: async (serviceId) => {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw NotFound('Service not found', 'SERVICE_NOT_FOUND');
    }

    const queue = await queueRepository.findOrCreateTodayQueue(serviceId);
    const waitingCount = await queueRepository.countTotalWaiting(queue.id);
    const currentlyServing = await queueRepository.findCurrentlyServing(queue.id);
    const estimatedWaitMinutes = calculateEstimatedWaitMinutes(
      waitingCount,
      service.avg_service_time_seconds
    );

    return {
      queueId: queue.id,
      serviceId: service.id,
      serviceName: service.name,
      status: queue.status,
      queueSize: waitingCount,
      currentlyServing: currentlyServing ? {
        tokenNumber: currentlyServing.token_number,
        counterName: currentlyServing.counter?.name || 'Counter',
        status: currentlyServing.status
      } : null,
      estimatedWaitMinutes
    };
  },

  joinQueue: async ({ serviceId, userId, priorityAttributes = {} }) => {
    const service = await serviceRepository.findById(serviceId);
    if (!service || !service.is_active) {
      throw NotFound('Service not available for queueing', 'SERVICE_UNAVAILABLE');
    }

    const queue = await queueRepository.findOrCreateTodayQueue(serviceId);
    if (queue.status === 'CLOSED') {
      throw BadRequest('This queue is not currently accepting new entries.', 'QUEUE_CLOSED');
    }

    const activeUserEntries = await queueRepository.getQueueEntries(queue.id);
    const existingActive = activeUserEntries.find(
      (e) => e.user_id === userId && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(e.status)
    );

    if (existingActive) {
      const ahead = await queueRepository.countWaitingAhead(
        queue.id,
        existingActive.priority_score,
        existingActive.joined_at
      );
      const waitTime = calculateEstimatedWaitMinutes(ahead, service.avg_service_time_seconds);

      return {
        queueEntryId: existingActive.id,
        tokenNumber: existingActive.token_number,
        position: ahead + 1,
        estimatedWaitMinutes: waitTime,
        status: existingActive.status,
        alreadyActive: true
      };
    }

    let priorityScore = 0;
    if (service.priority_config && Array.isArray(service.priority_config.rules)) {
      for (const rule of service.priority_config.rules) {
        if (priorityAttributes[rule.attribute]) {
          priorityScore += Number(rule.boost || 0);
        }
      }
    }

    const latestEntry = await queueRepository.getLatestTokenForServiceToday(queue.id);
    const tokenNumber = generateTokenNumber(service.name, latestEntry?.token_number);

    const newEntry = await queueRepository.createEntry({
      queue_id: queue.id,
      user_id: userId,
      token_number: tokenNumber,
      status: 'WAITING',
      priority_score: priorityScore,
      joined_at: new Date()
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: newEntry.id,
      previous_status: 'NONE',
      new_status: 'WAITING',
      changed_by_user_id: userId
    });

    const ahead = await queueRepository.countWaitingAhead(
      queue.id,
      newEntry.priority_score,
      newEntry.joined_at
    );
    const position = ahead + 1;
    const estimatedWaitMinutes = calculateEstimatedWaitMinutes(ahead, service.avg_service_time_seconds);

    const waitingTotal = await queueRepository.countTotalWaiting(queue.id);
    const currentlyServing = await queueRepository.findCurrentlyServing(queue.id);

    socketEmitter.broadcastQueueUpdate(serviceId, {
      serviceId,
      queueSize: waitingTotal,
      currentlyServing: currentlyServing ? currentlyServing.token_number : null,
      estimatedWait: estimatedWaitMinutes
    });

    return {
      queueEntryId: newEntry.id,
      tokenNumber: newEntry.token_number,
      position,
      estimatedWaitMinutes,
      status: newEntry.status
    };
  },

  getQueueEntryById: async (entryId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    if (
      currentUser.role === 'ROLE_USER' &&
      entry.user_id !== currentUser.id
    ) {
      throw Forbidden('You do not have permission to view this token', 'FORBIDDEN_ENTRY_ACCESS');
    }

    let position = 0;
    let estimatedWaitMinutes = 0;

    if (entry.status === 'WAITING') {
      const ahead = await queueRepository.countWaitingAhead(
        entry.queue_id,
        entry.priority_score,
        entry.joined_at
      );
      position = ahead + 1;
      estimatedWaitMinutes = calculateEstimatedWaitMinutes(
        ahead,
        entry.queue.service.avg_service_time_seconds
      );
    }

    const currentlyServing = await queueRepository.findCurrentlyServing(entry.queue_id);

    return {
      id: entry.id,
      tokenNumber: entry.token_number,
      status: entry.status,
      priorityScore: entry.priority_score,
      position,
      estimatedWaitMinutes,
      joinedAt: entry.joined_at,
      calledAt: entry.called_at,
      startedAt: entry.started_at,
      completedAt: entry.completed_at,
      service: {
        id: entry.queue.service.id,
        name: entry.queue.service.name,
        description: entry.queue.service.description
      },
      counter: entry.counter ? {
        id: entry.counter.id,
        name: entry.counter.name
      } : null,
      currentlyServingToken: currentlyServing?.token_number || null,
      user: {
        id: entry.user.id,
        name: entry.user.name,
        email: entry.user.email
      }
    };
  },

  cancelQueueEntry: async (entryId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    if (
      currentUser.role === 'ROLE_USER' &&
      entry.user_id !== currentUser.id
    ) {
      throw Forbidden('You are not allowed to cancel this token', 'UNAUTHORIZED_ACTION');
    }

    const updated = await queueRepository.updateEntry(entryId, {
      status: 'CANCELLED'
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: entryId,
      previous_status: entry.status,
      new_status: 'CANCELLED',
      changed_by_user_id: currentUser.id
    });

    const serviceId = entry.queue.service_id;
    const waitingTotal = await queueRepository.countTotalWaiting(entry.queue_id);
    const currentlyServing = await queueRepository.findCurrentlyServing(entry.queue_id);

    socketEmitter.notifyTokenCancelled(serviceId, {
      tokenNumber: entry.token_number,
      serviceId,
      userId: entry.user_id
    });

    socketEmitter.broadcastQueueUpdate(serviceId, {
      serviceId,
      queueSize: waitingTotal,
      currentlyServing: currentlyServing ? currentlyServing.token_number : null,
      estimatedWait: calculateEstimatedWaitMinutes(waitingTotal, entry.queue.service.avg_service_time_seconds)
    });

    return updated;
  },

  callNextToken: async (counterId, currentUser) => {
    const counter = await counterRepository.findById(counterId);
    if (!counter) {
      throw NotFound('Counter not found', 'COUNTER_NOT_FOUND');
    }

    if (
      currentUser.role === 'ROLE_STAFF' &&
      counter.assigned_staff_id &&
      counter.assigned_staff_id !== currentUser.id
    ) {
      throw Forbidden('You are not assigned to this counter', 'COUNTER_MISMATCH');
    }

    const queue = await queueRepository.findOrCreateTodayQueue(counter.service_id);

    const currentActive = await queueRepository.getQueueEntries(queue.id);
    const activeAtCounter = currentActive.find(
      (e) => e.counter_id === counterId && ['CALLED', 'IN_SERVICE'].includes(e.status)
    );
    if (activeAtCounter) {
      await queueRepository.updateEntry(activeAtCounter.id, {
        status: 'COMPLETED',
        completed_at: new Date()
      });
      await queueRepository.createHistoryLog({
        queue_entry_id: activeAtCounter.id,
        previous_status: activeAtCounter.status,
        new_status: 'COMPLETED',
        changed_by_user_id: currentUser.id
      });
    }

    const nextEntry = await queueRepository.findNextWaitingEntry(queue.id);
    if (!nextEntry) {
      return {
        message: 'No waiting entries in queue',
        entry: null
      };
    }

    const updated = await queueRepository.updateEntry(nextEntry.id, {
      counter_id: counterId,
      status: 'CALLED',
      called_at: new Date()
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: nextEntry.id,
      previous_status: 'WAITING',
      new_status: 'CALLED',
      changed_by_user_id: currentUser.id
    });

    const waitingTotal = await queueRepository.countTotalWaiting(queue.id);

    socketEmitter.notifyTokenCalled(counter.service_id, {
      tokenNumber: updated.token_number,
      counterId,
      counterName: counter.name,
      userId: updated.user_id,
      entryId: updated.id
    });

    socketEmitter.broadcastQueueUpdate(counter.service_id, {
      serviceId: counter.service_id,
      queueSize: waitingTotal,
      currentlyServing: updated.token_number,
      estimatedWait: calculateEstimatedWaitMinutes(waitingTotal, counter.service.avg_service_time_seconds)
    });

    return {
      message: 'Token called successfully',
      entry: updated
    };
  },

  skipQueueEntry: async (entryId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    const updated = await queueRepository.updateEntry(entryId, {
      status: 'SKIPPED'
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: entryId,
      previous_status: entry.status,
      new_status: 'SKIPPED',
      changed_by_user_id: currentUser.id
    });

    const serviceId = entry.queue.service_id;
    const waitingTotal = await queueRepository.countTotalWaiting(entry.queue_id);
    const currentlyServing = await queueRepository.findCurrentlyServing(entry.queue_id);

    socketEmitter.broadcastQueueUpdate(serviceId, {
      serviceId,
      queueSize: waitingTotal,
      currentlyServing: currentlyServing ? currentlyServing.token_number : null,
      estimatedWait: calculateEstimatedWaitMinutes(waitingTotal, entry.queue.service.avg_service_time_seconds)
    });

    return updated;
  },

  recallQueueEntry: async (entryId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    const updated = await queueRepository.updateEntry(entryId, {
      status: 'CALLED',
      called_at: new Date()
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: entryId,
      previous_status: entry.status,
      new_status: 'CALLED',
      changed_by_user_id: currentUser.id
    });

    const serviceId = entry.queue.service_id;
    socketEmitter.notifyTokenCalled(serviceId, {
      tokenNumber: updated.token_number,
      counterId: updated.counter_id,
      counterName: updated.counter?.name || 'Counter',
      userId: updated.user_id,
      entryId: updated.id
    });

    return updated;
  },

  completeQueueEntry: async (entryId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    const updated = await queueRepository.updateEntry(entryId, {
      status: 'COMPLETED',
      completed_at: new Date()
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: entryId,
      previous_status: entry.status,
      new_status: 'COMPLETED',
      changed_by_user_id: currentUser.id
    });

    const serviceId = entry.queue.service_id;
    const waitingTotal = await queueRepository.countTotalWaiting(entry.queue_id);
    const currentlyServing = await queueRepository.findCurrentlyServing(entry.queue_id);

    socketEmitter.broadcastQueueUpdate(serviceId, {
      serviceId,
      queueSize: waitingTotal,
      currentlyServing: currentlyServing ? currentlyServing.token_number : null,
      estimatedWait: calculateEstimatedWaitMinutes(waitingTotal, entry.queue.service.avg_service_time_seconds)
    });

    return updated;
  },

  transferQueueEntry: async (entryId, targetCounterId, currentUser) => {
    const entry = await queueRepository.findEntryById(entryId);
    if (!entry) {
      throw NotFound('Queue entry not found', 'ENTRY_NOT_FOUND');
    }

    const targetCounter = await counterRepository.findById(targetCounterId);
    if (!targetCounter) {
      throw NotFound('Target counter not found', 'COUNTER_NOT_FOUND');
    }

    const updated = await queueRepository.updateEntry(entryId, {
      counter_id: targetCounterId,
      status: 'CALLED'
    });

    await queueRepository.createHistoryLog({
      queue_entry_id: entryId,
      previous_status: entry.status,
      new_status: `TRANSFERRED_TO_${targetCounter.name}`,
      changed_by_user_id: currentUser.id
    });

    const serviceId = entry.queue.service_id;
    socketEmitter.notifyTokenCalled(serviceId, {
      tokenNumber: updated.token_number,
      counterId: targetCounterId,
      counterName: targetCounter.name,
      userId: updated.user_id,
      entryId: updated.id
    });

    return updated;
  },

  listQueueEntriesByService: async (serviceId, statusFilter = null) => {
    const queue = await queueRepository.findOrCreateTodayQueue(serviceId);
    return queueRepository.getQueueEntries(queue.id, { status: statusFilter });
  }
};
