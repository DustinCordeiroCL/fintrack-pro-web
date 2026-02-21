import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryService } from './category.service';
import { environment } from '../../environments/environment';

describe('CategoryService', () => {
    let categoryService: CategoryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CategoryService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        categoryService = TestBed.inject(CategoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get data with GET method', () => {
        const mockData = [{ id: 1, name: 'Grocery' }];

        categoryService.listAll().subscribe((data) => {
            expect(data).toEqual(mockData);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories`);

        expect(req.request.method).toBe('GET');
        req.flush(mockData);
    });

    it('should handle error when API fails (Negative Path)', () => {
        const errorMessage = 'Internal Server Error';

        categoryService.listAll().subscribe({
            next: () => fail('O teste deveria ter falhado com um erro 500'),
            error: (error) => {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Server Error');
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories`);

        req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
});