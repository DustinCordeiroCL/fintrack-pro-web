import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../../services/category/category.service';
import { Category } from '../../../../models/interfaces/category.interface';
import { ThemeConstants } from '../../../../core/constants/theme.constants';
import { CategoryType } from '../../../../models/enums/category-type.enum';

/* PrimeNG Imports */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ColorPickerModule,
    SelectModule,
    InputNumberModule,
    ConfirmDialogModule,
    SkeletonModule,
    MessageModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {

  readonly #fb = inject(FormBuilder);
  readonly #categoryService = inject(CategoryService);
  readonly #messageService = inject(MessageService);
  readonly #confirmationService = inject(ConfirmationService);
  readonly CategoryType = CategoryType;

  readonly categoryTypeOptions = Object.entries(CategoryType).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase(),
    value: value
  }));

  public categoryForm!: FormGroup;
  public categories = signal<Category[]>([]);
  public displayDialog = signal<boolean>(false);
  public editingId = signal<number | null>(null);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.categoryForm = this.#fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: [ThemeConstants.DEFAULT_COLOR, [Validators.required]],
      description: [''],
      categoryType: [null],
      spendingLimit: [null, [Validators.min(0)]]
    });
  }

  public loadCategories(): void {
    this.isLoading.set(true);
    this.#categoryService.listAll().subscribe({
      next: (response: Category[]) => {
        this.categories.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load failed' });
      }
    });
  }

  public saveCategory(): void {
    if (this.categoryForm.valid) {
      const payload = this.categoryForm.value;
      const isEditing = this.editingId();
      const request$ = isEditing
        ? this.#categoryService.update(isEditing, payload)
        : this.#categoryService.create(payload);

      request$.subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.editingId.set(null);
          this.loadCategories();
          this.#messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: isEditing ? 'Category updated.' : 'Category created.'
          });
        },
        error: () => {
          this.#messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Save failed'
          });
        }
      });
    }
  }

  public editCategory(category: Category): void {
    this.editingId.set(category.id!);
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color,
      description: category.description ?? '',
      categoryType: category.categoryType ?? null,
      spendingLimit: category.spendingLimit ?? null
    });
    this.displayDialog.set(true);
  }

  public deleteCategory(id: number): void {
    this.#confirmationService.confirm({
      message: 'Are you sure you want to delete this category?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.#categoryService.delete(id).subscribe({
          next: () => {
            this.loadCategories();
            this.#messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted.'
            });
          },
          error: () => {
            this.#messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Delete failed.'
            });
          }
        });
      }
    });
  }

  public showDialog(): void {
    this.editingId.set(null);
    this.categoryForm.reset({ color: ThemeConstants.DEFAULT_COLOR });
    this.displayDialog.set(true);
  }
}