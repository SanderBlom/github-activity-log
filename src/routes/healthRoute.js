// Catch-all route handler
import {Router} from "express";
import { readinessController } from '../controllers/healthController.js';

const router = Router();

router.get('/ready', readinessController);

export default router;