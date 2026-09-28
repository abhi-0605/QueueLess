import prisma from '../config/db.js';

export const userRepository = {
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        organization_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  },

  create: async (userData) => {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        organization_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    });
  }
};
