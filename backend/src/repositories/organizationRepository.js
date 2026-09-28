import prisma from '../config/db.js';

export const organizationRepository = {
  findAll: async () => {
    return prisma.organization.findMany({
      include: {
        services: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            description: true,
            avg_service_time_seconds: true,
            is_active: true
          }
        },
        _count: {
          select: { services: true, users: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  findById: async (id) => {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            counters: true
          }
        }
      }
    });
  },

  create: async (data) => {
    return prisma.organization.create({ data });
  },

  update: async (id, data) => {
    return prisma.organization.update({
      where: { id },
      data
    });
  },

  delete: async (id) => {
    return prisma.organization.delete({
      where: { id }
    });
  }
};
