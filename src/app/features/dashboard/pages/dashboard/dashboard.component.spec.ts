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
        transactionServiceMock.getDashboard.mockReturnValue(of({
            ...mockDashboard,
            transactions: []
        }));

        component.loadDashboard();

        expect(transactionServiceMock.getDashboard).toHaveBeenCalled();
        expect(component.dashboardData()).not.toBeNull();
        expect(component.dashboardData()?.transactions).toEqual([]);
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

    it('should build chart data with expanded window after dashboard loads', () => {
        const mockDashboardWithTransactions = {
            ...mockDashboard,
            transactions: [
                {
                    id: 1, amount: 100000,
                    date: new Date().toISOString(),
                    type: 'INCOME',
                    description: 'Test',
                    category: { id: 1, name: 'Food', color: '#000' }
                }
            ]
        };

        transactionServiceMock.getDashboard.mockReturnValue(of(mockDashboardWithTransactions));
        component.loadDashboard();

        expect(component.chartData()).not.toBeNull();
        expect(component.chartData().labels.length).toBeGreaterThanOrEqual(1);
        expect(component.chartData().datasets.length).toBe(2);
    });

    it('should pass expanded date range to getDashboard covering 2 months before startDate', () => {
        transactionServiceMock.getDashboard.mockReturnValue(of({
            ...mockDashboard, transactions: []
        }));

        component.loadDashboard();

        const [apiStart] = transactionServiceMock.getDashboard.mock.calls[0];
        const filterStart = component.filterForm.get('startDate')?.value as Date;
        const twoMonthsBefore = new Date(
            filterStart.getFullYear(),
            filterStart.getMonth() - 2,
            1
        );

        const expectedPrefix = `${twoMonthsBefore.getFullYear()}-${String(twoMonthsBefore.getMonth() + 1).padStart(2, '0')}-01`;
        expect(apiStart.startsWith(expectedPrefix)).toBe(true);
    });

    it('should calculate cards using only the original filter period, not the expanded window', () => {
        const oldDate = new Date();
        oldDate.setMonth(oldDate.getMonth() - 2);

        transactionServiceMock.getDashboard.mockReturnValue(of({
            ...mockDashboard,
            transactions: [
                {
                    id: 1, amount: 999999,
                    date: oldDate.toISOString(),
                    type: 'INCOME',
                    description: 'Old transaction outside filter',
                    category: { id: 1, name: 'Food', color: '#000' }
                }
            ]
        }));

        component.loadDashboard();

        expect(component.dashboardData()?.totalIncome).toBe(0);
    });

    it('should update minEndDate signal when a new startDate is selected', () => {
        const newStart = new Date(2026, 1, 15);
        component.filterForm.patchValue({ startDate: newStart });
        component.onStartDateSelect();

        expect(component.minEndDate()).toEqual(newStart);
    });

    it('should reset endDate to startDate when endDate is before new startDate', () => {
        component.filterForm.patchValue({
            startDate: new Date(2026, 2, 1),
            endDate: new Date(2026, 0, 1)
        });

        component.onStartDateSelect();

        const endDate = component.filterForm.get('endDate')?.value as Date;
        expect(endDate).toEqual(new Date(2026, 2, 1));
    });
});