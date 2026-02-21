import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../../services/category.service';
import { Category } from '../../../../models/interfaces/category.interface';

@Component({
  selector: 'app-category-list',
  imports: [],
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit{

  readonly #categoryService = inject(CategoryService);

  public categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.#categoryService.listAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        console.log('Categorias carregadas:', this.categories());
      },
      error: (err) => {
        console.error('Erro no componente:', err);
      }
    });
  }
}
