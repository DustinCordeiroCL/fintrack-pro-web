import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment';

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

    //Test method: listAll()
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
            next: () => fail('The test should have failed with a 500 error'),
            error: (error) => {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Server Error');
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories`);

        req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    //Test method: create()
    it('should create a new category with POST method', () => {
        const newCategory = { name: 'Health', color: '#FF0000' };
        const mockResponse = { id: 2, ...newCategory };

        categoryService.create(newCategory).subscribe((data) => {
            expect(data).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
        expect(req.request.method).toBe('POST');

        expect(req.request.body).toEqual(newCategory);

        req.flush(mockResponse, { status: 201, statusText: 'Created' });
    });

    it('should handle error when creation fails (Negative Path)', () => {
        const newCategory = { name: 'Error Case', color: '#000' };

        categoryService.create(newCategory).subscribe({
            next: () => fail('Should have failed when trying to create a category'),
            error: (error) => {
                expect(error).toBeTruthy();
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories`);

        req.flush('Invalid Data', { status: 400, statusText: 'Bad Request' });
    });
});