import { Router } from 'express';
const router = Router();
import { listAccounts, getAccount } from '../controllers/account.js';
import { listProperties } from '../controllers/property.js';
import { createAudience, listAudiences, getAudience, deleteAudience, listAudiencesDataApi } from '../controllers/audience.js';
import {runReport} from '../controllers/reports.js';

// log all requests
router.use((req, res, next) => {
  console.log('Request:', req.method, req.originalUrl);
  next();
});

// Account routes
router.get('/accounts', listAccounts);
router.get('/accounts/:accountName', getAccount);

// Property routes
router.get('/accounts/:accountName/properties', listProperties);
router.get('/accounts/:accountName/properties/:propertyId/audiences', listAudiences);

// Add the new route that matches what the frontend is calling
router.post('/accounts/:accountName/properties/:propertyId/audiences', createAudience);

// Keep the original route for backward compatibility
router.post('/createAudience', createAudience);

// Audience routes
router.delete('/properties/:propertyId/audiences/:audienceId', deleteAudience);

// Also add this format to be consistent with the frontend
router.delete('/accounts/:accountName/properties/:propertyId/audiences/:audienceId', deleteAudience);

router.get('/data/accounts/:accountName/properties/:propertyId/audiences', listAudiencesDataApi);
router.get('/reports/properties/:propertyId/audiences', runReport);

// print the requests that are not handled
router.use('*', (req, res) => {
  console.log('Request not handled:', req.method, req.originalUrl);
  res.status(404).send('Not found');
});

export default router;

