import { z } from 'zod';
import { counterService } from '../services/counterService.js';
import { queueService } from '../services/queueService.js';

export const counterCreateSchema = z.object({
  name: z.string().min(2, 'Counter name is required'),
  status: z.enum(['OPEN', 'CLOSED', 'ON_BREAK']).default('CLOSED'),
  assigned_staff_id: z.string().uuid().nullable().optional()
});

export const counterUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'ON_BREAK']).optional(),
  assigned_staff_id: z.string().uuid().nullable().optional()
});

export const counterController = {
  listByService: async (req, res, next) => {
    try {
      const counters = await counterService.listByServiceId(req.params.serviceId);
      res.status(200).json(counters);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const counter = await counterService.create({
        ...req.body,
        service_id: req.params.serviceId
      });
      res.status(201).json(counter);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const counter = await counterService.update(req.params.id, req.body);
      res.status(200).json(counter);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await counterService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  callNext: async (req, res, next) => {
    try {
      const result = await queueService.callNextToken(req.params.counterId, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};
