import { Router } from 'express';
import { serviceController, serviceUpdateSchema } from '../controllers/serviceController.js';
import { counterController, counterCreateSchema } from '../controllers/counterController.js';
import { queueController, joinQueueSchema } from '../controllers/queueController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/:id', serviceController.getById);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(serviceUpdateSchema),
  serviceController.update
);
router.delete('/:id', authenticate, requireAdmin, serviceController.deactivate);

router.get('/:serviceId/counters', authenticate, requireStaffOrAdmin, counterController.listByService);
router.post(
  '/:serviceId/counters',
  authenticate,
  requireAdmin,
  validate(counterCreateSchema),
  counterController.create
);

router.get('/:serviceId/queue', queueController.getQueueState);
router.post(
  '/:serviceId/queue/join',
  authenticate,
  validate(joinQueueSchema),
  queueController.joinQueue
);
router.get(
  '/:serviceId/queue/entries',
  authenticate,
  requireStaffOrAdmin,
  queueController.listQueueEntries
);

export default router;
