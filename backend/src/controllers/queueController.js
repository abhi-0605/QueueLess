import { z } from 'zod';
import { queueService } from '../services/queueService.js';

export const joinQueueSchema = z.object({
  priorityAttributes: z.record(z.any()).optional().default({})
});

export const transferSchema = z.object({
  targetCounterId: z.string().uuid('Valid counter ID is required')
});

export const queueController = {
  getQueueState: async (req, res, next) => {
    try {
      const state = await queueService.getQueueState(req.params.serviceId);
      res.status(200).json(state);
    } catch (err) {
      next(err);
    }
  },

  listQueueEntries: async (req, res, next) => {
    try {
      const statusFilter = req.query.status || null;
      const entries = await queueService.listQueueEntriesByService(req.params.serviceId, statusFilter);
      res.status(200).json(entries);
    } catch (err) {
      next(err);
    }
  },

  joinQueue: async (req, res, next) => {
    try {
      const result = await queueService.joinQueue({
        serviceId: req.params.serviceId,
        userId: req.user.id,
        priorityAttributes: req.body.priorityAttributes || {}
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  getQueueEntry: async (req, res, next) => {
    try {
      const entry = await queueService.getQueueEntryById(req.params.id, req.user);
      res.status(200).json(entry);
    } catch (err) {
      next(err);
    }
  },

  cancelQueueEntry: async (req, res, next) => {
    try {
      const cancelled = await queueService.cancelQueueEntry(req.params.id, req.user);
      res.status(200).json({ message: 'Token cancelled successfully', entry: cancelled });
    } catch (err) {
      next(err);
    }
  },

  skipQueueEntry: async (req, res, next) => {
    try {
      const skipped = await queueService.skipQueueEntry(req.params.id, req.user);
      res.status(200).json({ message: 'Token skipped', entry: skipped });
    } catch (err) {
      next(err);
    }
  },

  recallQueueEntry: async (req, res, next) => {
    try {
      const recalled = await queueService.recallQueueEntry(req.params.id, req.user);
      res.status(200).json({ message: 'Token recalled', entry: recalled });
    } catch (err) {
      next(err);
    }
  },

  transferQueueEntry: async (req, res, next) => {
    try {
      const transferred = await queueService.transferQueueEntry(
        req.params.id,
        req.body.targetCounterId,
        req.user
      );
      res.status(200).json({ message: 'Token transferred', entry: transferred });
    } catch (err) {
      next(err);
    }
  },

  completeQueueEntry: async (req, res, next) => {
    try {
      const completed = await queueService.completeQueueEntry(req.params.id, req.user);
      res.status(200).json({ message: 'Service marked complete', entry: completed });
    } catch (err) {
      next(err);
    }
  }
};
