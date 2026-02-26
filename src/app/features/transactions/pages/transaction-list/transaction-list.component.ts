import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../../services/transaction/transaction.service';
import { CategoryService } from '../../../../services/category/category.service';
import { Transaction } from '../../../../models/interfaces/transaction.interface';
import { Category } from '../../../../models/interfaces/category.interface';
import { TransactionType } from '../../../../models/enums/transaction-type.enum';

/* PrimeNG Imports */
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';

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
    InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #categoryService = inject(CategoryService);
  readonly #transationService = inject(TransactionService);
  readonly #messageService = inject(MessageService);

  public transactionForm!: FormGroup;
  public transactions = signal<Transaction[]>([]);
  public categories = signal<Category[]>([]);
  public displayDialog = signal<boolean>(false);


  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadTransactions();
  }

  private initForm(): void {
    this.transactionForm = this.#fb.group({
      description: ['', [Validators.required, Validators.minLength(5)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), [Validators.required]],
      type: [null, [Validators.required, this.typeEnumValidator]],
      category: [null, [Validators.required]]
    });
  }

  private typeEnumValidator(control: any) {
    const validValues = Object.values(TransactionType);
    return validValues.includes(control.value) ? null : { invalidType: true };
  }

  public loadTransactions(): void {
    this.#transationService.listAll().subscribe({
      next: (response: Transaction[]) => {
        this.transactions.set(response);
      },
      error: () => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load transactions failed' });
      }
    })
  }

  public loadCategories(): void {
    this.#categoryService.listAll().subscribe({
      next: (response) => this.categories.set(response),
      error: () => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load categories failed' });
      }
    })
  }

  public saveTransaction(): void {
    if (this.transactionForm.valid) {
      const transactionPayload: Partial<Transaction> = {
        ...this.transactionForm.value,
        date: this.transactionForm.value.date instanceof Date
          ? this.transactionForm.value.date.toISOString()
          : this.transactionForm.value.date
      };

      this.#transationService.create(transactionPayload).subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.transactionForm.reset({ date: new Date() });
          this.loadTransactions();
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transaction successfully synchronized with the database.'
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
    this.transactionForm.reset();
    this.displayDialog.set(true);
  }
}
