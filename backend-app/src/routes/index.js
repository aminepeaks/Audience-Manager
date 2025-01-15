import { Router } from 'express';
const router = Router();
import { listAccounts, getAccount } from '../controllers/account.js';
import { listProperties } from '../controllers/property.js';
import { createAudience, listAudiences, getAudience } from '../controllers/audience.js';

// Account routes
router.get('/accounts', listAccounts);
router.get('/accounts/:accountName', getAccount);

// Property routes
router.get('/accounts/:accountName/properties', listProperties);
router.get('/accounts/:accountName/properties/:propertyId/audiences', listAudiences);




export default router;

