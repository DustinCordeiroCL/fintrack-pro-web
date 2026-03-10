import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { DashboardResponse } from '../../../../models/interfaces/dashboard-response.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';

function getFirstDayOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getLastDayOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function toApiDateStart(date: Date): string {
    return date.toISOString().split('T')[0] + 'T00:00:00';
}

function toApiDateEnd(date: Date): string {
    return date.toISOString().split('T')[0] + 'T23:59:59';
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        DatePickerModule,
        ChartModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    readonly #transactionService = inject(TransactionService);
    readonly #fb = inject(FormBuilder);

    public dashboardData = signal<DashboardResponse | null>(null);
    public filterForm!: FormGroup;
    public chartData = signal<any>(null);
    public chartOptions = signal<any>(null);
    public today = new Date();
    public minEndDate = signal<Date>(getFirstDayOfMonth());


    ngOnInit(): void {
        this.initForm();
        this.initChartOptions();
        this.loadDashboard();
    }

    private initForm(): void {
        this.filterForm = this.#fb.group({
            startDate: [getFirstDayOfMonth()],
            endDate: [getLastDayOfMonth()]
        });
    }

    private initChartOptions(): void {
        this.chartOptions.set({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context: any) =>
                            ` ${context.dataset.label}: ${context.raw.toLocaleString('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                maximumFractionDigits: 0
                            })}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: number) =>
                            value.toLocaleString('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                maximumFractionDigits: 0
                            })
                    }
                }
            }
        });
    }

    public loadDashboard(): void {
        const { startDate, endDate } = this.filterForm.value;

        const chartStart = new Date(startDate.getFullYear(), startDate.getMonth() - 2, 1);
        const chartEnd = this.buildChartEndDate(startDate);

        const apiStart = toApiDateStart(chartStart);
        const apiEnd = toApiDateEnd(chartEnd);

        this.#transactionService.getDashboard(apiStart, apiEnd).subscribe({
            next: (data) => {
                const originalStart = startDate.getTime();
                const originalEnd = new Date(
                    endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59
                ).getTime();

                const filteredTransactions = data.transactions.filter(t => {
                    const tDate = new Date(t.date).getTime();
                    return tDate >= originalStart && tDate <= originalEnd;
                });

                const totalIncome = filteredTransactions
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + t.amount, 0);

                const totalExpense = filteredTransactions
                    .filter(t => t.type === 'EXPENSE')
                    .reduce((sum, t) => sum + t.amount, 0);

                this.dashboardData.set({
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                    transactions: filteredTransactions
                });

                this.buildChartData(data.transactions, startDate);
            },
            error: () => {
                this.dashboardData.set(null);
                this.chartData.set(null);
            }
        });
    }

    public onStartDateSelect(): void {
        const startDate = this.filterForm.get('startDate')?.value as Date;
        this.minEndDate.set(startDate);

        const endDate = this.filterForm.get('endDate')?.value as Date;
        if (endDate < startDate) {
            this.filterForm.patchValue({ endDate: startDate });
        }
    }

    private buildChartEndDate(startDate: Date): Date {
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        const monthsDiff = (currentMonth.getFullYear() - startMonth.getFullYear()) * 12
            + (currentMonth.getMonth() - startMonth.getMonth());

        const monthsAfter = Math.min(monthsDiff, 2);
        const endMonth = new Date(startDate.getFullYear(), startDate.getMonth() + monthsAfter + 1, 0);
        const cap = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return endMonth > cap ? cap : endMonth;
    }

    private buildChartData(transactions: any[], startDate: Date): void {
        const chartEnd = this.buildChartEndDate(startDate);
        const months = this.buildMonthWindow(startDate, chartEnd);

        const incomeMap = new Map<string, number>();
        const expenseMap = new Map<string, number>();

        months.forEach(m => {
            incomeMap.set(m, 0);
            expenseMap.set(m, 0);
        });

        transactions.forEach(t => {
            const key = this.getMonthKey(new Date(t.date));
            if (incomeMap.has(key)) {
                if (t.type === 'INCOME') {
                    incomeMap.set(key, (incomeMap.get(key) ?? 0) + t.amount);
                } else {
                    expenseMap.set(key, (expenseMap.get(key) ?? 0) + t.amount);
                }
            }
        });

        this.chartData.set({
            labels: months.map(m => {
                const [year, month] = m.split('-');
                return new Date(Number(year), Number(month) - 1)
                    .toLocaleString('en-US', { month: 'short' }) + ' ' + year.slice(2);
            }),
            datasets: [
                {
                    label: 'Income',
                    data: months.map(m => incomeMap.get(m) ?? 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.85)',
                    borderColor: '#16a34a',
                    borderWidth: 1
                },
                {
                    label: 'Expense',
                    data: months.map(m => expenseMap.get(m) ?? 0),
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }
            ]
        });
    }

    private buildMonthWindow(startDate: Date, endDate: Date): string[] {
        const months: string[] = [];
        const today = new Date();
        const cap = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const effectiveEnd = endDate > cap ? cap : endDate;
        const cursor = new Date(startDate.getFullYear(), startDate.getMonth() - 2, 1);

        while (cursor <= effectiveEnd) {
            months.push(this.getMonthKey(cursor));
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return months;
    }

    private getMonthKey(date: Date): string {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        return `${y}-${String(m).padStart(2, '0')}`;
    }
}