import { z } from 'zod';
import { organizationService } from '../services/organizationService.js';

export const organizationCreateSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional()
});

export const organizationUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional()
});

export const organizationController = {
  list: async (req, res, next) => {
    try {
      const orgs = await organizationService.listAll();
      res.status(200).json(orgs);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const org = await organizationService.getById(req.params.id);
      res.status(200).json(org);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const org = await organizationService.create(req.body);
      res.status(201).json(org);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const org = await organizationService.update(req.params.id, req.body);
      res.status(200).json(org);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await organizationService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
