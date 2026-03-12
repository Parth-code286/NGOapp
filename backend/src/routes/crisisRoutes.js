import express from 'express';
import { createCrisis, getAllActiveCrises, donateToCrisis, closeCrisis } from '../controllers/crisisController.js';

const router = express.Router();

// Get all active crises to browse
router.get('/', getAllActiveCrises);

// Post a new crisis (NGO)
router.post('/', createCrisis);

// Donate to a specific crisis (Volunteer)
router.post('/:crisis_id/donate', donateToCrisis);

// Close a specific crisis (NGO)
router.patch('/:crisis_id/close', closeCrisis);

export default router;
