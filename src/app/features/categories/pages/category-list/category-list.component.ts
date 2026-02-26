import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../../services/category/category.service';
import { Category } from '../../../../models/interfaces/category.interface';
import { ThemeConstants } from '../../../../core/constants/theme.constants';

/* PrimeNG Imports */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';

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
    ColorPickerModule
  ],
  providers: [MessageService],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {

  readonly #fb = inject(FormBuilder);
  readonly #categoryService = inject(CategoryService);
  readonly #messageService = inject(MessageService);

  public categoryForm!: FormGroup;
  public categories = signal<Category[]>([]);
  public displayDialog = signal<boolean>(false);

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.categoryForm = this.#fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: [ThemeConstants.DEFAULT_COLOR, [Validators.required]]
    });
  }

  public loadCategories(): void {
    this.#categoryService.listAll().subscribe({
      next: (response: Category[]) => {
        this.categories.set(response); // DOM optimization happens here
      },
      error: () => {
        this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Load failed' });
      }
    });
  }

  public saveCategory(): void {
    if(this.categoryForm.valid) {
      this.#categoryService.create(this.categoryForm.value).subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.loadCategories();
          this.#messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved' });
        },
        error: () => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    }
  }

  public showDialog(): void {
    this.categoryForm.reset({ color: ThemeConstants.DEFAULT_COLOR });
    this.displayDialog.set(true);
  }
}