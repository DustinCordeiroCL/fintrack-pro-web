import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Category } from '../../models/interfaces/category.interface';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    readonly #http = inject(HttpClient);
    readonly #API_URL = `${environment.apiUrl}/categories`;

    public listAll(): Observable<Category[]> {
        return this.#http.get<Category[]>(this.#API_URL).pipe(
            catchError((error) => {
                console.error('[CategoryService] listAll failed:', error);
                return throwError(() => new Error('Failed to retrieve categories. Please try again later.'));
            })
        );
    }

    public create(category: Partial<Category>): Observable<Category> {
        return this.#http.post<Category>(this.#API_URL, category).pipe(
            catchError((error) => {
                console.error('[CategoryService] create failed:', error);
                return throwError(() => new Error('Failed to create the category. Ensure the data is valid.'));
            })
        );
    }
}