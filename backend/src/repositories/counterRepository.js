import prisma from '../config/db.js';

export const counterRepository = {
  findByServiceId: async (serviceId) => {
    return prisma.counter.findMany({
      where: { service_id: serviceId },
      include: {
        assigned_staff: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });
  },

  findById: async (id) => {
    return prisma.counter.findUnique({
      where: { id },
      include: {
        service: true,
        assigned_staff: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  create: async (data) => {
    return prisma.counter.create({
      data,
      include: {
        assigned_staff: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  update: async (id, data) => {
    return prisma.counter.update({
      where: { id },
      data,
      include: {
        assigned_staff: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  delete: async (id) => {
    return prisma.counter.delete({ where: { id } });
  }
};
