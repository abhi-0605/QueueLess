import { Router } from 'express';
import {
  counterController,
  counterUpdateSchema
} from '../controllers/counterController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.patch(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  validate(counterUpdateSchema),
  counterController.update
);

router.delete('/:id', authenticate, requireAdmin, counterController.delete);

router.post(
  '/:counterId/call-next',
  authenticate,
  requireStaffOrAdmin,
  counterController.callNext
);

export default router;
