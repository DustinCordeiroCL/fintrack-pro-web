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

const gradientFn = (r: number, g: number, b: number) => (context: any) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return `rgba(${r},${g},${b},0)`;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    return gradient;
};

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
    public donutData = signal<any>(null);
    public donutOptions = signal<any>(null);
    public today = new Date();
    public minEndDate = signal<Date>(getFirstDayOfMonth());

    ngOnInit(): void {
        this.initForm();
        this.initChartOptions();
        this.initDonutOptions();
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
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        padding: 20,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 12,
                    callbacks: {
                        label: (context: any) =>
                            ` ${context.dataset.label}: ${(context.raw as number).toLocaleString('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                maximumFractionDigits: 0
                            })}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(148, 163, 184, 0.06)' },
                    border: { display: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.06)' },
                    border: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
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

    private initDonutOptions(): void {
        this.donutOptions.set({
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        padding: 14,
                        font: { size: 11 },
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 12,
                    callbacks: {
                        label: (context: any) => {
                            const value = (context.raw as number).toLocaleString('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                maximumFractionDigits: 0
                            });
                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                            const pct = (((context.raw as number) / total) * 100).toFixed(1);
                            return ` ${context.label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        });
    }

    public loadDashboard(): void {
        const { startDate, endDate } = this.filterForm.value;

        const chartStart = new Date(startDate.getFullYear(), startDate.getMonth() - 2, 1);
        const chartEnd = this.buildChartEndDate(startDate);

        this.#transactionService.getDashboard(
            toApiDateStart(chartStart),
            toApiDateEnd(chartEnd)
        ).subscribe({
            next: (data) => {
                const startTs = startDate.getTime();
                const endTs = new Date(
                    endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59
                ).getTime();

                const filtered = data.transactions.filter(t => {
                    const d = new Date(t.date).getTime();
                    return d >= startTs && d <= endTs;
                });

                const totalIncome = filtered
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + t.amount, 0);

                const totalExpense = filtered
                    .filter(t => t.type === 'EXPENSE')
                    .reduce((sum, t) => sum + t.amount, 0);

                this.dashboardData.set({
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                    transactions: filtered
                });

                this.buildChartData(data.transactions, startDate);
                this.buildDonutData(data.transactions, startDate, endDate);
            },
            error: () => {
                this.dashboardData.set(null);
                this.chartData.set(null);
                this.donutData.set(null);
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

        const monthsDiff =
            (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 +
            (currentMonth.getMonth() - startMonth.getMonth());

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
        months.forEach(m => { incomeMap.set(m, 0); expenseMap.set(m, 0); });

        transactions.forEach(t => {
            const key = this.getMonthKey(new Date(t.date));
            if (t.type === 'INCOME' && incomeMap.has(key)) {
                incomeMap.set(key, (incomeMap.get(key) ?? 0) + t.amount);
            } else if (t.type === 'EXPENSE' && expenseMap.has(key)) {
                expenseMap.set(key, (expenseMap.get(key) ?? 0) + t.amount);
            }
        });

        this.chartData.set({
            labels: months.map(m => {
                const [year, month] = m.split('-');
                return new Date(Number(year), Number(month) - 1)
                    .toLocaleString('es-CL', { month: 'short' }) + ' \'' + year.slice(2);
            }),
            datasets: [
                {
                    label: 'Ingresos',
                    data: months.map(m => incomeMap.get(m) ?? 0),
                    borderColor: '#10b981',
                    backgroundColor: gradientFn(16, 185, 129),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#1e293b',
                    pointBorderWidth: 2
                },
                {
                    label: 'Gastos',
                    data: months.map(m => expenseMap.get(m) ?? 0),
                    borderColor: '#ef4444',
                    backgroundColor: gradientFn(239, 68, 68),
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#1e293b',
                    pointBorderWidth: 2
                }
            ]
        });
    }

    private buildDonutData(transactions: any[], startDate: Date, endDate: Date): void {
        const startTs = startDate.getTime();
        const endTs = new Date(
            endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59
        ).getTime();

        const categoryMap = new Map<string, { total: number; color: string }>();

        transactions
            .filter(t => {
                const d = new Date(t.date).getTime();
                return t.type === 'EXPENSE' && d >= startTs && d <= endTs;
            })
            .forEach(t => {
                const name = t.category?.name ?? 'Unknown';
                const color = t.category?.color || '#64748b';
                const entry = categoryMap.get(name);
                if (entry) {
                    entry.total += t.amount;
                } else {
                    categoryMap.set(name, { total: t.amount, color });
                }
            });

        if (categoryMap.size === 0) {
            this.donutData.set(null);
            return;
        }

        const sorted = [...categoryMap.entries()].sort((a, b) => b[1].total - a[1].total);
        const top = sorted.slice(0, 8);
        const rest = sorted.slice(8);
        const othersTotal = rest.reduce((sum, [, v]) => sum + v.total, 0);

        const labels = top.map(([name]) => name);
        const data = top.map(([, v]) => v.total);
        const colors = top.map(([, v]) => v.color);

        if (othersTotal > 0) {
            labels.push('Others');
            data.push(othersTotal);
            colors.push('#475569');
        }

        this.donutData.set({
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: '#1e293b',
                borderWidth: 2,
                hoverBorderWidth: 0,
                hoverOffset: 8
            }]
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
