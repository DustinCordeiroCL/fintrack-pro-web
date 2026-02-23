import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Category } from '../../models/interfaces/category.interface';
import { catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class CategoryService {
    readonly #http = inject(HttpClient);
    readonly #API_URL = `${environment.apiUrl}/categories`;

    public listAll(): Observable<Category[]> {
        return this.#http.get<Category[]>(this.#API_URL).pipe(
            catchError((error) => {
                return throwError(() => new Error('Something wen wrong: please try again later'));
            })
        )
    }

    public create(category: Partial<Category>): Observable<Category> {
        return this.#http.post<Category>(this.#API_URL, category).pipe(
            catchError((error) => {
                return throwError(() => new Error('Failed to create category: please try again later'));
            })
        );
    }
}