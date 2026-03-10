import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { of, throwError } from 'rxjs';
import { DashboardResponse } from '../../../../models/interfaces/dashboard-response.interface';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    const mockDashboard: DashboardResponse = {
        totalIncome: 1000000,
        totalExpense: 500000,
        balance: 500000,
        transactions: []
    };

    const transactionServiceMock = {
        getDashboard: jest.fn()
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        transactionServiceMock.getDashboard.mockReturnValue(of(mockDashboard));

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                { provide: TransactionService, useValue: transactionServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize form with first and last day of current month', () => {
        const startDate = component.filterForm.get('startDate')?.value as Date;
        const endDate = component.filterForm.get('endDate')?.value as Date;

        expect(startDate).toBeInstanceOf(Date);
        expect(endDate).toBeInstanceOf(Date);
        expect(startDate.getDate()).toBe(1);
        expect(startDate <= endDate).toBe(true);
    });

    it('should initialize form with non-null date values', () => {
        expect(component.filterForm.get('startDate')?.value).not.toBeNull();
        expect(component.filterForm.get('endDate')?.value).not.toBeNull();
    });

    it('should load dashboard data and update signal on success', () => {
        component.loadDashboard();

        expect(transactionServiceMock.getDashboard).toHaveBeenCalled();
        expect(component.dashboardData()).toEqual(mockDashboard);
    });

    it('should set dashboardData to null when loadDashboard fails', () => {
        transactionServiceMock.getDashboard.mockReturnValue(
            throwError(() => new Error('API Error'))
        );

        component.loadDashboard();

        expect(component.dashboardData()).toBeNull();
    });

    it('should call getDashboard with correct date strings when loadDashboard is called', () => {
        component.loadDashboard();

        const [start, end] = transactionServiceMock.getDashboard.mock.calls[0];
        expect(start).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00$/);
        expect(end).toMatch(/^\d{4}-\d{2}-\d{2}T23:59:59$/);
    });
});