import { Router } from 'express';
import authRoutes from './authRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import counterRoutes from './counterRoutes.js';
import queueRoutes from './queueRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/services', serviceRoutes);
router.use('/counters', counterRoutes);
router.use('/queue-entries', queueRoutes);

export default router;
