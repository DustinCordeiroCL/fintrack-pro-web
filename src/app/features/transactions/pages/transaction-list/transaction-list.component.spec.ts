import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { CategoryService } from '../../../../services/category/category.service';
import { MessageService } from 'primeng/api';
import { of, throwError, Subject } from 'rxjs';
import { TransactionType } from '../../../../models/enums/transaction-type.enum';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;

  const transactionServiceMock = {
    listAll: jest.fn(),
    create: jest.fn()
  };

  const categoryServiceMock = {
    listAll: jest.fn()
  };

  const messageServiceMock = {
    add: jest.fn(),
    messageObserver: new Subject(),
    clearObserver: new Subject()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [
        { provide: TransactionService, useValue: transactionServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock }
      ]
    })
      .overrideProvider(MessageService, { useValue: messageServiceMock })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;

    jest.clearAllMocks();

    transactionServiceMock.listAll.mockReturnValue(of([]));
    categoryServiceMock.listAll.mockReturnValue(of([]));

    fixture.detectChanges();
  });

  it('should create the component and initialize data', () => {
    expect(component).toBeTruthy();
    expect(transactionServiceMock.listAll).toHaveBeenCalled();
    expect(categoryServiceMock.listAll).toHaveBeenCalled();
    expect(component.transactionForm).toBeDefined();
  });

  it('should load transactions and update signal', () => {
    const mockTransactions = [{ id: 1, description: 'Test', amount: 100 }];
    transactionServiceMock.listAll.mockReturnValue(of(mockTransactions));

    component.loadTransactions();

    expect(transactionServiceMock.listAll).toHaveBeenCalled();
    expect(component.transactions()).toEqual(mockTransactions);
  });

  it('should show error toast when load transactions fails', () => {
    transactionServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));

    component.loadTransactions();

    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Load transactions failed' })
    );
  });

  it('should load categories and update signal', () => {
    const mockCategories = [{ id: 1, name: 'Food' }];
    categoryServiceMock.listAll.mockReturnValue(of(mockCategories));

    component.loadCategories();

    expect(categoryServiceMock.listAll).toHaveBeenCalled();
    expect(component.categories()).toEqual(mockCategories);
  });

  it('should show error toast when load categories fails', () => {
    categoryServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));

    component.loadCategories();

    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Load categories failed' })
    );
  });

  it('should call service, close dialog, refresh list, and show success toast on valid form submission', () => {
    const mockData = {
      description: 'Monthly Investment',
      amount: 500.00,
      date: new Date(),
      type: TransactionType.INCOME,
      category: { id: 1, name: 'Investments', color: '#000' }
    };

    component.transactionForm.setValue(mockData);

    transactionServiceMock.create.mockReturnValue(of(mockData));
    transactionServiceMock.listAll.mockReturnValue(of([]));

    component.saveTransaction();

    expect(transactionServiceMock.create).toHaveBeenCalled();
    expect(component.displayDialog()).toBe(false);
    expect(transactionServiceMock.listAll).toHaveBeenCalled();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Transaction successfully synchronized with the database.' })
    );
  });

  it('should show error toast if transaction save fails', () => {
    const mockData = {
      description: 'Monthly Investment',
      amount: 500.00,
      date: new Date(),
      type: TransactionType.INCOME,
      category: { id: 1, name: 'Investments', color: '#000' }
    };

    component.transactionForm.setValue(mockData);
    transactionServiceMock.create.mockReturnValue(throwError(() => new Error('Save error')));

    component.saveTransaction();

    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Save error' })
    );
  });

  it('should not call service if form is invalid on saveTransaction', () => {
    component.transactionForm.reset();

    component.saveTransaction();

    expect(transactionServiceMock.create).not.toHaveBeenCalled();
  });

  it('should reset form and open dialog on showDialog', () => {
    const resetSpy = jest.spyOn(component.transactionForm, 'reset');

    component.showDialog();

    expect(resetSpy).toHaveBeenCalled();
    expect(component.displayDialog()).toBe(true);
  });

  it('should validate form successfully with correct enum type', () => {
    const typeControl = component.transactionForm.controls['type'];

    typeControl.setValue(TransactionType.EXPENSE);

    expect(typeControl.errors).toBeNull();
  });

  it('should invalidate form with incorrect enum type', () => {
    const typeControl = component.transactionForm.controls['type'];

    typeControl.setValue('INVALID_TYPE');

    expect(typeControl.errors?.['invalidType']).toBe(true);
  });
});