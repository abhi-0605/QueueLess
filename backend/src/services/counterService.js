import { counterRepository } from '../repositories/counterRepository.js';
import { NotFound } from '../utils/errors.js';

export const counterService = {
  listByServiceId: async (serviceId) => {
    return counterRepository.findByServiceId(serviceId);
  },

  getById: async (id) => {
    const counter = await counterRepository.findById(id);
    if (!counter) {
      throw NotFound('Counter not found', 'COUNTER_NOT_FOUND');
    }
    return counter;
  },

  create: async (data) => {
    return counterRepository.create(data);
  },

  update: async (id, data) => {
    await counterService.getById(id);
    return counterRepository.update(id, data);
  },

  delete: async (id) => {
    await counterService.getById(id);
    return counterRepository.delete(id);
  }
};
