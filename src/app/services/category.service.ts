import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Category } from '../models/interfaces/category.interface';
import { catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class CategoryService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/categories`;

    public listAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.API_URL).pipe(
            catchError((error) => {
                console.error('API Error:', error);

                return throwError(() => new Error('Something wen wrong: please try again later'));
            })
        )
    }
}