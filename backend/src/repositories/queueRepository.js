import prisma from '../config/db.js';

export const queueRepository = {
  findOrCreateTodayQueue: async (serviceId) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let queue = await prisma.queue.findFirst({
      where: {
        service_id: serviceId,
        date: today
      }
    });

    if (!queue) {
      queue = await prisma.queue.create({
        data: {
          service_id: serviceId,
          date: today,
          status: 'OPEN'
        }
      });
    }

    return queue;
  },

  getLatestTokenForServiceToday: async (queueId) => {
    return prisma.queueEntry.findFirst({
      where: { queue_id: queueId },
      orderBy: { joined_at: 'desc' }
    });
  },

  createEntry: async (data) => {
    return prisma.queueEntry.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        queue: {
          include: {
            service: true
          }
        }
      }
    });
  },

  findEntryById: async (id) => {
    return prisma.queueEntry.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        counter: true,
        queue: {
          include: {
            service: true
          }
        }
      }
    });
  },

  findNextWaitingEntry: async (queueId) => {
    return prisma.queueEntry.findFirst({
      where: {
        queue_id: queueId,
        status: 'WAITING'
      },
      orderBy: [
        { priority_score: 'desc' },
        { joined_at: 'asc' }
      ],
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  updateEntry: async (id, data) => {
    return prisma.queueEntry.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        counter: true,
        queue: {
          include: {
            service: true
          }
        }
      }
    });
  },

  getQueueEntries: async (queueId, options = {}) => {
    const where = { queue_id: queueId };
    if (options.status) {
      where.status = options.status;
    }

    return prisma.queueEntry.findMany({
      where,
      orderBy: [
        { priority_score: 'desc' },
        { joined_at: 'asc' }
      ],
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        counter: true
      }
    });
  },

  countWaitingAhead: async (queueId, priorityScore, joinedAt) => {
    return prisma.queueEntry.count({
      where: {
        queue_id: queueId,
        status: 'WAITING',
        OR: [
          { priority_score: { gt: priorityScore } },
          {
            priority_score: priorityScore,
            joined_at: { lt: joinedAt }
          }
        ]
      }
    });
  },

  countTotalWaiting: async (queueId) => {
    return prisma.queueEntry.count({
      where: {
        queue_id: queueId,
        status: 'WAITING'
      }
    });
  },

  findCurrentlyServing: async (queueId) => {
    return prisma.queueEntry.findFirst({
      where: {
        queue_id: queueId,
        status: { in: ['CALLED', 'IN_SERVICE'] }
      },
      orderBy: { called_at: 'desc' },
      include: {
        counter: true,
        user: {
          select: { id: true, name: true }
        }
      }
    });
  },

  createHistoryLog: async (data) => {
    return prisma.queueEntryHistory.create({ data });
  }
};
