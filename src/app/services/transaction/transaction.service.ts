import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Transaction } from '../../models/interfaces/transaction.interface';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  readonly #http = inject(HttpClient);
  readonly #API_URL = `${environment.apiUrl}/transactions`;

  public listAll(): Observable<Transaction[]> {
    return this.#http.get<Transaction[]>(this.#API_URL).pipe(
      catchError((error) => {
        console.error('[TransactionService] listAll failed:', error);
        return throwError(() => new Error('Failed to load transaction history.'));
      })
    );
  }

  public create(transaction: Partial<Transaction>): Observable<Transaction> {
    return this.#http.post<Transaction>(this.#API_URL, transaction).pipe(
      catchError((error) => {
        console.error('[TransactionService] create failed:', error);
        return throwError(() => new Error('Failed to register the transaction. Check your connection.'));
      })
    );
  }

  public update(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.#http.put<Transaction>(`${this.#API_URL}/${id}`, transaction).pipe(
      catchError((error) => {
        console.error('[TransactionService] update failed:', error);
        return throwError(() => new Error('Failed to update the transaction. Ensure the data is valid.'));
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error('[TransactionService] delete failed:', error);
        return throwError(() => new Error('Failed to delete the transaction.'));
      })
    );
  }
}