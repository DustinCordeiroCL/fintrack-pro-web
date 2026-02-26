import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
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
      providers: [
        TransactionService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return a list of transactions', () => {
    service.listAll().subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data).toEqual([mockTransaction]);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');

    req.flush([mockTransaction]);
  });

  it('should throw custom error when listAll fails', () => {
    service.listAll().subscribe({
      next: () => fail('should have failed with the custom error'),
      error: (err) => {
        expect(err.message).toBe('Failed to load transaction history.');
      }
    });

    const req = httpMock.expectOne(API_URL);
    req.error(new ProgressEvent('error'));
  });

  it('should create a new transaction', () => {
    service.create(mockTransaction).subscribe((data) => {
      expect(data).toEqual(mockTransaction);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTransaction);

    req.flush(mockTransaction);
  });

  it('should throw custom error when create fails', () => {
    service.create(mockTransaction).subscribe({
      next: () => fail('should have failed with the custom error'),
      error: (err) => {
        expect(err.message).toBe('Failed to register the transaction. Check your connection.');
      }
    });

    const req = httpMock.expectOne(API_URL);
    req.error(new ProgressEvent('error'));
  });
});