import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { DashboardResponse } from '../../../../models/interfaces/dashboard-response.interface';

/* PrimeNG Imports */
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

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
        DatePickerModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    readonly #transactionService = inject(TransactionService);
    readonly #fb = inject(FormBuilder);

    public dashboardData = signal<DashboardResponse | null>(null);
    public filterForm!: FormGroup;

    ngOnInit(): void {
        this.initForm();
        this.loadDashboard();
    }

    private initForm(): void {
        this.filterForm = this.#fb.group({
            startDate: [getFirstDayOfMonth()],
            endDate: [getLastDayOfMonth()]
        });
    }

    public loadDashboard(): void {
        const { startDate, endDate } = this.filterForm.value;
        const start = toApiDateStart(startDate);
        const end = toApiDateEnd(endDate);

        this.#transactionService.getDashboard(start, end).subscribe({
            next: (data) => this.dashboardData.set(data),
            error: () => this.dashboardData.set(null)
        });
    }
}