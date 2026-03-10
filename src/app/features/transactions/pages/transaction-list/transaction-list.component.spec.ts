import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { CategoryService } from '../../../../services/category/category.service';
import { MessageService } from 'primeng/api';
import { of, throwError, Subject } from 'rxjs';
import { TransactionType } from '../../../../models/enums/transaction-type.enum';
import { ConfirmationService } from 'primeng/api';
import { Transaction } from '../../../../models/interfaces/transaction.interface';


describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;

  const transactionServiceMock = {
    listAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
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
        ConfirmationService, { useValue: { confirm: jest.fn() } },
        { provide: TransactionService, useValue: transactionServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
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

  it('should populate form and set editingId when editTransaction is called', () => {
    const mockTransaction = {
      id: 1,
      description: 'Salary',
      amount: 500000,
      date: '2024-01-15T00:00:00',
      type: TransactionType.INCOME,
      category: { id: 1, name: 'Investments', color: '#000' }
    };

    component.editTransaction(mockTransaction);

    expect(component.editingId()).toBe(1);
    expect(component.transactionForm.get('description')?.value).toBe('Salary');
    expect(component.transactionForm.get('date')?.value).toBeInstanceOf(Date);
    expect(component.displayDialog()).toBe(true);
  });

  it('should reset editingId to null when showDialog is called', () => {
    component.editingId.set(1);

    component.showDialog();

    expect(component.editingId()).toBeNull();
    expect(component.displayDialog()).toBe(true);
  });

  it('should call delete service and refresh list on confirm', () => {
    transactionServiceMock.delete.mockReturnValue(of(void 0));
    transactionServiceMock.listAll.mockReturnValue(of([]));

    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    jest.spyOn(confirmationService, 'confirm').mockImplementation((config: any) => {
      config.accept?.();
      return confirmationService;
    });

    const messageSpy = jest.spyOn(messageServiceMock, 'add');

    component.deleteTransaction(1);

    expect(transactionServiceMock.delete).toHaveBeenCalledWith(1);
    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Transaction deleted.' })
    );
  });

  it('should show error toast when delete fails', () => {
    transactionServiceMock.delete.mockReturnValue(throwError(() => new Error('Delete error')));

    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    jest.spyOn(confirmationService, 'confirm').mockImplementation((config: any) => {
      config.accept?.();
      return confirmationService;
    });

    component.deleteTransaction(1);

    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Delete failed.' })
    );
  });

  it('should set isLoading to false after transactions load successfully', () => {
    transactionServiceMock.listAll.mockReturnValue(of([]));

    component.loadTransactions();

    expect(component.isLoading()).toBe(false);
  });

  it('should set isLoading to false even when loadTransactions fails', () => {
    transactionServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));

    component.loadTransactions();

    expect(component.isLoading()).toBe(false);
  });

  it('should filter transactions by type when type filter is set', () => {
    const today = new Date().toISOString();
    const income: Transaction = { id: 1, description: 'A', amount: 100, date: today, type: TransactionType.INCOME, category: { id: 1, name: 'X', color: '#000' } as any };
    const expense: Transaction = { id: 2, description: 'B', amount: 200, date: today, type: TransactionType.EXPENSE, category: { id: 1, name: 'X', color: '#000' } as any };

    component.allTransactions.set([income, expense]);
    component.filterForm.patchValue({ type: 'INCOME', startDate: null, endDate: null, category: null });
    component.applyFilter();

    expect(component.filteredTransactions().length).toBe(1);
    expect(component.filteredTransactions()[0].type).toBe(TransactionType.INCOME);
  });

  it('should restore current month default when clearFilter is called', () => {
    component.filterForm.patchValue({
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 0, 31),
      type: 'EXPENSE',
      category: { id: 1, name: 'Food', color: '#000' }
    });

    component.clearFilter();

    expect(component.filterForm.get('type')?.value).toBeNull();
    expect(component.filterForm.get('category')?.value).toBeNull();
    expect(component.filterForm.get('startDate')?.value.getMonth()).toBe(new Date().getMonth());
  });
});