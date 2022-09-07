import { Router } from 'express';
import {
  createCustomerHandler,
  deleteCustomerHandler,
  showCustomerHandler,
  updateCustomerHandler,
} from '../modules/customers/controllers/customer.controller';

import { ensureAdmin } from '../shared/middlewares/ensureAdmin';
import { ensureAuthenticated as auth } from '../shared/middlewares/ensureAuthenticated';

const customersRouter = Router();
customersRouter.post('/', auth, createCustomerHandler);
customersRouter.patch('/:id', auth, updateCustomerHandler);
customersRouter.delete('/:id', auth, ensureAdmin, deleteCustomerHandler);
customersRouter.get('/:id', auth, showCustomerHandler);

export { customersRouter };
