import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
    let categoryService: CategoryService;
    let httpMock: HttpTestingController;
    const mockCategory = { id: 1, name: 'Health', color: '#FF0000' };

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

    it('should handle error when API fails', () => {
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

    it('should handle error when creation fails', () => {
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

    it('should update a category with PUT method', () => {
        categoryService.update(1, mockCategory).subscribe((data) => {
            expect(data).toEqual(mockCategory);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(mockCategory);
        req.flush(mockCategory);
    });

    it('should handle error when update fails', () => {
        categoryService.update(1, mockCategory).subscribe({
            next: () => fail('Should have failed'),
            error: (error) => {
                expect(error.message).toBe('Failed to update the category. Ensure the data is valid.');
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
        req.error(new ProgressEvent('error'));
    });

    it('should delete a category with DELETE method', () => {
        categoryService.delete(1).subscribe(() => {
            expect(true).toBe(true);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle error when delete fails', () => {
        categoryService.delete(1).subscribe({
            next: () => fail('Should have failed'),
            error: (error) => {
                expect(error.message).toBe('Failed to delete the category.');
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/categories/1`);
        req.error(new ProgressEvent('error'));
    });
});