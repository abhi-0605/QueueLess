import { Router } from 'express';
import {
  organizationController,
  organizationCreateSchema,
  organizationUpdateSchema
} from '../controllers/organizationController.js';
import { serviceController, serviceCreateSchema } from '../controllers/serviceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', organizationController.list);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(organizationCreateSchema),
  organizationController.create
);

router.get('/:id', organizationController.getById);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(organizationUpdateSchema),
  organizationController.update
);
router.delete('/:id', authenticate, requireAdmin, organizationController.delete);

router.get('/:orgId/services', serviceController.listByOrg);
router.post(
  '/:orgId/services',
  authenticate,
  requireAdmin,
  validate(serviceCreateSchema),
  serviceController.create
);

export default router;
