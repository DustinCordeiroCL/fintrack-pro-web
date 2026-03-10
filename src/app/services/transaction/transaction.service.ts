import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Transaction } from '../../models/interfaces/transaction.interface';
import { DashboardResponse } from '../../models/interfaces/dashboard-response.interface';

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

  public getDashboard(start: string, end: string): Observable<DashboardResponse> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.#http.get<DashboardResponse>(`${this.#API_URL}/dashboard`, { params }).pipe(
      catchError((error) => {
        console.error('[TransactionService] getDashboard failed:', error);
        return throwError(() => new Error('Failed to load dashboard data.'));
      })
    );
  }
}