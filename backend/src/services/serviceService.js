import { serviceRepository } from '../repositories/serviceRepository.js';
import { calculateEstimatedWaitMinutes } from './waitTimeService.js';
import { NotFound } from '../utils/errors.js';

export const serviceService = {
  listByOrgId: async (organizationId) => {
    const services = await serviceRepository.findByOrgId(organizationId);

    return services.map((service) => {
      const activeQueue = service.queues[0];
      const waitingEntries = activeQueue ? activeQueue.entries.filter((e) => e.status === 'WAITING') : [];
      const servingEntry = activeQueue ? activeQueue.entries.find((e) => e.status === 'CALLED' || e.status === 'IN_SERVICE') : null;

      const queueSize = waitingEntries.length;
      const estimatedWaitMinutes = calculateEstimatedWaitMinutes(queueSize, service.avg_service_time_seconds);

      return {
        id: service.id,
        organization_id: service.organization_id,
        name: service.name,
        description: service.description,
        avg_service_time_seconds: service.avg_service_time_seconds,
        priority_config: service.priority_config,
        is_active: service.is_active,
        counters: service.counters,
        queueInfo: {
          queueId: activeQueue ? activeQueue.id : null,
          queueSize,
          currentlyServingToken: servingEntry ? servingEntry.token_number : null,
          estimatedWaitMinutes
        }
      };
    });
  },

  getById: async (id) => {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw NotFound('Service not found', 'SERVICE_NOT_FOUND');
    }
    return service;
  },

  create: async (data) => {
    return serviceRepository.create(data);
  },

  update: async (id, data) => {
    await serviceService.getById(id);
    return serviceRepository.update(id, data);
  },

  deactivate: async (id) => {
    await serviceService.getById(id);
    return serviceRepository.softDelete(id);
  }
};
