import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService } from './transaction.service';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../models/interfaces/transaction.interface';
import { TransactionType } from '../../models/enums/transaction-type.enum';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const API_URL = `${environment.apiUrl}/transactions`;

  const mockTransaction: Transaction = {
    id: 1,
    description: 'Test Transaction',
    amount: 100,
    date: new Date().toISOString(),
    type: TransactionType.INCOME,
    category: { id: 1, name: 'Salary', color: '#00FF00' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // --- listAll() Tests ---
  it('should return a list of transactions (Positive)', () => {
    service.listAll().subscribe(data => expect(data.length).toBe(1));

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush([mockTransaction]);
  });

  it('should throw custom error when listAll fails (Negative)', () => {
    service.listAll().subscribe({
      error: (err) => expect(err.message).toBe('Failed to load transaction history.')
    });

    const req = httpMock.expectOne(API_URL);
    req.error(new ProgressEvent('error'));
  });

  // --- create() Tests ---
  it('should create a transaction (Positive)', () => {
    service.create(mockTransaction).subscribe(data => expect(data).toEqual(mockTransaction));

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    req.flush(mockTransaction);
  });

  it('should throw custom error when create fails (Negative)', () => {
    service.create({}).subscribe({
      error: (err) => expect(err.message).toBe('Failed to register the transaction. Check your connection.')
    });

    const req = httpMock.expectOne(API_URL);
    req.error(new ProgressEvent('error'));
  });
});