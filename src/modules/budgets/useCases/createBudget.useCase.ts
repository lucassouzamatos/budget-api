import { inject, injectable } from 'tsyringe';
import { IBudget } from '../../../entities/budget';
import { AppError } from '../../../shared/errors/AppError';
import { ICustomersRepository } from '../../customers/repositories/ICustomersRepository';
import { ISalesmenRepository } from '../../salesmen/repositories/ISalesmenRepository';
import { IBudgetsRepository } from '../repositories/IBudgetsRepository';
import {
  calculateProductTotalPrice,
  calculateTotalValue,
} from '../services/calculateTotalValue';

@injectable()
export default class CreateBudgetUseCase {
  constructor(
    @inject('BudgetsRepository')
    private budgetsRepository: IBudgetsRepository,
    @inject('SalesmenRepository')
    private salesmenRepository: ISalesmenRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository
  ) {}

  async execute(budget: IBudget) {
    const budgetAlreadyExists = await this.budgetsRepository.findByCode(
      budget.code
    );

    if (budgetAlreadyExists) {
      throw new AppError('Budget already exists!', 409);
    }

    if (!budget.customer_id) {
      throw new AppError('Budget must have a customer!', 400);
    }

    if (!budget.salesman_id) {
      throw new AppError('Budget must have a salesman!', 400);
    }

    const customerExists = await this.customersRepository.findById(
      budget.customer_id
    );

    const salesmenExists = await this.salesmenRepository.findById(
      budget.salesman_id
    );

    if (!salesmenExists) {
      throw new AppError('Salesman not found!', 404);
    }

    if (!customerExists) {
      throw new AppError('Customer not found!', 404);
    }

    if (!budget.products.length) {
      throw new AppError('Budget must have at least one product!', 400);
    }

    for (const product of budget.products) {
      product.total_price = calculateProductTotalPrice(
        product.unit_price,
        product.quantity,
        product.discount
      );
    }

    if (budget.additional_items) {
      for (const item of budget.additional_items) {
        item.total_price = calculateProductTotalPrice(
          item.unit_price,
          item.quantity,
          item.discount
        );
      }
    }

    const createdBudget = await this.budgetsRepository.create(budget);

    createdBudget.total_value = await calculateTotalValue(createdBudget);

    console.log('createdBudget', createdBudget);

    await this.budgetsRepository.save(createdBudget);
  }
}
