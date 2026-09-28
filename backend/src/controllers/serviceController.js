import { z } from 'zod';
import { serviceService } from '../services/serviceService.js';

export const serviceCreateSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().optional(),
  avg_service_time_seconds: z.number().int().positive().default(300),
  priority_config: z.any().optional(),
  is_active: z.boolean().default(true)
});

export const serviceUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  avg_service_time_seconds: z.number().int().positive().optional(),
  priority_config: z.any().optional(),
  is_active: z.boolean().optional()
});

export const serviceController = {
  listByOrg: async (req, res, next) => {
    try {
      const services = await serviceService.listByOrgId(req.params.orgId);
      res.status(200).json(services);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const service = await serviceService.getById(req.params.id);
      res.status(200).json(service);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const service = await serviceService.create({
        ...req.body,
        organization_id: req.params.orgId
      });
      res.status(201).json(service);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const service = await serviceService.update(req.params.id, req.body);
      res.status(200).json(service);
    } catch (err) {
      next(err);
    }
  },

  deactivate: async (req, res, next) => {
    try {
      await serviceService.deactivate(req.params.id);
      res.status(200).json({ message: 'Service deactivated successfully' });
    } catch (err) {
      next(err);
    }
  }
};
