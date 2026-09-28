import prisma from '../config/db.js';

export const serviceRepository = {
  findByOrgId: async (organizationId) => {
    return prisma.service.findMany({
      where: {
        organization_id: organizationId,
        is_active: true
      },
      include: {
        counters: {
          select: {
            id: true,
            name: true,
            status: true,
            assigned_staff: {
              select: { id: true, name: true }
            }
          }
        },
        queues: {
          where: {
            status: 'OPEN'
          },
          orderBy: { date: 'desc' },
          take: 1,
          include: {
            entries: {
              where: {
                status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] }
              },
              select: {
                id: true,
                token_number: true,
                status: true,
                priority_score: true,
                joined_at: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });
  },

  findById: async (id) => {
    return prisma.service.findUnique({
      where: { id },
      include: {
        organization: true,
        counters: {
          include: {
            assigned_staff: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  },

  create: async (data) => {
    return prisma.service.create({ data });
  },

  update: async (id, data) => {
    return prisma.service.update({
      where: { id },
      data
    });
  },

  softDelete: async (id) => {
    return prisma.service.update({
      where: { id },
      data: { is_active: false }
    });
  }
};
