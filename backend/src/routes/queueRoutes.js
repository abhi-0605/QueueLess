import { Router } from 'express';
import { queueController, transferSchema } from '../controllers/queueController.js';
import { authenticate } from '../middleware/auth.js';
import { requireStaffOrAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/:id', authenticate, queueController.getQueueEntry);
router.delete('/:id', authenticate, queueController.cancelQueueEntry);

router.post('/:id/skip', authenticate, requireStaffOrAdmin, queueController.skipQueueEntry);
router.post('/:id/recall', authenticate, requireStaffOrAdmin, queueController.recallQueueEntry);
router.post(
  '/:id/transfer',
  authenticate,
  requireStaffOrAdmin,
  validate(transferSchema),
  queueController.transferQueueEntry
);
router.post('/:id/complete', authenticate, requireStaffOrAdmin, queueController.completeQueueEntry);

export default router;
