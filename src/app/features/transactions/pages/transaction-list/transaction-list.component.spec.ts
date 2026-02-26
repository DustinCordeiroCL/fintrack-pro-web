import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { CategoryService } from '../../../../services/category/category.service';
import { MessageService } from 'primeng/api';
import { of, throwError, Subject } from 'rxjs'; /* Comment: Added Subject here */
import { TransactionType } from '../../../../models/enums/transaction-type.enum';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  
  // Mocks dos Serviços
  const transactionServiceMock = {
    listAll: jest.fn().mockReturnValue(of([])),
    create: jest.fn()
  };
  const categoryServiceMock = {
    listAll: jest.fn().mockReturnValue(of([]))
  };
  
  /* Comment: Upgraded the mock to include RxJS Subjects. 
     PrimeNG's <p-toast> requires these to exist so it can subscribe to them on Init. */
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
    fixture.detectChanges(); // Comment: <p-toast> will now initialize without errors
  });

  it('should create the component and load initial data', () => {
    expect(component).toBeTruthy();
    expect(categoryServiceMock.listAll).toHaveBeenCalled();
    expect(transactionServiceMock.listAll).toHaveBeenCalled();
  });

  // --- Caso Positivo ---
  it('should call service and close dialog on valid form submission (Positive)', () => {
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
      expect.objectContaining({ severity: 'success' })
    );
  });

  // --- Caso Negativo ---
  it('should show error toast if transaction save fails (Negative)', () => {
    const mockData = { 
      description: 'Dinner Out', 
      amount: 50.00, 
      date: new Date(), 
      type: TransactionType.EXPENSE, 
      category: { id: 2, name: 'Food' } 
    };
    component.transactionForm.setValue(mockData);
    
    const errorMsg = 'Check backend connection.';
    transactionServiceMock.create.mockReturnValue(throwError(() => new Error(errorMsg)));

    component.saveTransaction();

    expect(transactionServiceMock.create).toHaveBeenCalled();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: errorMsg })
    );
  });

  // --- Caso de Lógica ---
  it('should invalidate form if type is not a valid Enum value', () => {
    const typeControl = component.transactionForm.controls['type'];
    typeControl.setValue('INVALID_VALUE');
    expect(typeControl.valid).toBeFalsy();
    expect(typeControl.errors?.['invalidType']).toBeTruthy();
  });
});