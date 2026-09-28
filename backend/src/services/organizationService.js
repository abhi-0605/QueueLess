import { organizationRepository } from '../repositories/organizationRepository.js';
import { NotFound } from '../utils/errors.js';

export const organizationService = {
  listAll: async () => {
    return organizationRepository.findAll();
  },

  getById: async (id) => {
    const org = await organizationRepository.findById(id);
    if (!org) {
      throw NotFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }
    return org;
  },

  create: async (data) => {
    return organizationRepository.create(data);
  },

  update: async (id, data) => {
    await organizationService.getById(id);
    return organizationRepository.update(id, data);
  },

  delete: async (id) => {
    await organizationService.getById(id);
    return organizationRepository.delete(id);
  }
};
