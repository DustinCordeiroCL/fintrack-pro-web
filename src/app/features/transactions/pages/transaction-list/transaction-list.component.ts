import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { CategoryService } from '../../../../services/category/category.service';
import { Transaction } from '../../../../models/interfaces/transaction.interface';
import { Category } from '../../../../models/interfaces/category.interface';
import { TransactionType } from '../../../../models/enums/transaction-type.enum';

import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

function typeEnumValidator(control: AbstractControl): ValidationErrors | null {
  const validValues = Object.values(TransactionType);
  return validValues.includes(control.value) ? null : { invalidType: true };
}

function getFirstDayOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getLastDayOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputNumberModule,
    InputTextModule,
    ConfirmDialogModule,
    SkeletonModule,
    MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #categoryService = inject(CategoryService);
  readonly #transactionService = inject(TransactionService);
  readonly #messageService = inject(MessageService);
  readonly #confirmationService = inject(ConfirmationService);

  public transactionForm!: FormGroup;
  public filterForm!: FormGroup;
  public transactions = signal<Transaction[]>([]);
  public allTransactions = signal<Transaction[]>([]);
  public filteredTransactions = signal<Transaction[]>([]);
  public categories = signal<Category[]>([]);
  public filterCategories = signal<Category[]>([]);
  public displayDialog = signal<boolean>(false);
  public editingId = signal<number | null>(null);
  public isLoading = signal<boolean>(true);
  public today = new Date();
  public typeOptions = ['INCOME', 'EXPENSE'];

  ngOnInit(): void {
    this.initForm();
    this.initFilterForm();
    this.loadCategories();
    this.loadTransactions();
  }

  private initForm(): void {
    this.transactionForm = this.#fb.group({
      description: ['', [Validators.required, Validators.minLength(5)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), [Validators.required]],
      type: [null, [Validators.required, typeEnumValidator]],
      category: [null, [Validators.required]]
    });
  }

  private initFilterForm(): void {
    this.filterForm = this.#fb.group({
      startDate: [getFirstDayOfMonth()],
      endDate: [getLastDayOfMonth()],
      category: [null],
      type: [null]
    });
  }

  public loadTransactions(): void {
    this.isLoading.set(true);
    this.#transactionService.listAll().subscribe({
      next: (response: Transaction[]) => {
        this.transactions.set(response);
        this.allTransactions.set(response);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load transactions failed' });
      }
    });
  }

  public loadCategories(): void {
    this.#categoryService.listAll().subscribe({
      next: (response) => {
        this.categories.set(response);
        this.filterCategories.set(response);
      },
      error: () => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load categories failed' });
      }
    });
  }

  public applyFilter(): void {
    const { startDate, endDate, category, type } = this.filterForm.value;

    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    this.filteredTransactions.set(
      this.allTransactions().filter(t => {
        const tDate = new Date(t.date).getTime();
        if (start && tDate < start) return false;
        if (end && tDate > end) return false;
        if (category && t.category.id !== category.id) return false;
        if (type && t.type !== type) return false;
        return true;
      })
    );
  }

  public clearFilter(): void {
    this.filterForm.patchValue({
      startDate: getFirstDayOfMonth(),
      endDate: getLastDayOfMonth(),
      category: null,
      type: null
    });
    this.applyFilter();
  }

  public onStartDateSelect(): void {
    const startDate = this.filterForm.get('startDate')?.value as Date;
    const endDate = this.filterForm.get('endDate')?.value as Date;
    if (endDate < startDate) {
      this.filterForm.patchValue({ endDate: startDate });
    }
  }

  public saveTransaction(): void {
    if (this.transactionForm.valid) {
      const isEditing = this.editingId();
      const transactionPayload = {
        ...this.transactionForm.value,
        date: this.transactionForm.value.date instanceof Date
          ? this.transactionForm.value.date.toISOString()
          : this.transactionForm.value.date,
        categoryId: this.transactionForm.value.category?.id,
        category: undefined
      };

      const request$ = isEditing
        ? this.#transactionService.update(isEditing, transactionPayload)
        : this.#transactionService.create(transactionPayload);

      request$.subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.editingId.set(null);
          this.transactionForm.reset({ date: new Date() });
          this.loadTransactions();
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: isEditing ? 'Transaction updated.' : 'Transaction successfully synchronized with the database.'
          });
        },
        error: (e) => {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: e.message || 'Check backend connection.'
          });
        }
      });
    }
  }

  public showDialog(): void {
    this.editingId.set(null);
    this.transactionForm.reset({ date: new Date() });
    this.displayDialog.set(true);
  }

  public editTransaction(transaction: Transaction): void {
    this.editingId.set(transaction.id!);
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date),
      type: transaction.type,
      category: transaction.category
    });
    this.displayDialog.set(true);
  }

  public deleteTransaction(id: number): void {
    this.#confirmationService.confirm({
      message: 'Are you sure you want to delete this transaction?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.#transactionService.delete(id).subscribe({
          next: () => {
            this.loadTransactions();
            this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction deleted.' });
          },
          error: () => {
            this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' });
          }
        });
      }
    });
  }
}