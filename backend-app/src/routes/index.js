import { Router } from 'express';
const router = Router();
import { listAccounts, getAccount } from '../controllers/account.js';
import { listProperties } from '../controllers/property.js';
import { createAudience, listAudiences, getAudience, deleteAudience } from '../controllers/audience.js';

// Account routes
router.get('/accounts', listAccounts);
router.get('/accounts/:accountName', getAccount);

// Property routes
router.get('/accounts/:accountName/properties', listProperties);
router.get('/accounts/:accountName/properties/:propertyId/audiences', listAudiences);

// Audience routes
// /api/properties/294329184/audiences/10170465508
router.delete('/properties/:propertyId/audiences/:audienceId', deleteAudience);


router.post('/createAudience', createAudience);
// print the requests that are not handled
router.use('*', (req, res) => {
  console.log('Request not handled:', req.method, req.originalUrl);
});

export default router;

