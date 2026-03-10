import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '../../../../services/category/category.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ThemeConstants } from '../../../../core/constants/theme.constants';
import { CategoryType } from '../../../../models/enums/category-type.enum';
import { Category } from '../../../../models/interfaces/category.interface';
import { ConfirmationService } from 'primeng/api';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let messageService: MessageService;

  const categoryServiceMock = {
    listAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    categoryServiceMock.listAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CategoryListComponent,
        ReactiveFormsModule
      ],
      providers: [
        MessageService,
        { provide: CategoryService, useValue: categoryServiceMock }
      ]
    })
      .overrideComponent(CategoryListComponent, {
        set: {
          providers: [
            MessageService,
            ConfirmationService,
            { provide: CategoryService, useValue: categoryServiceMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;

    messageService = fixture.debugElement.injector.get(MessageService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    const mockCategories = [{ id: 1, name: 'Food', color: '#hex' }];
    categoryServiceMock.listAll.mockReturnValue(of(mockCategories));

    component.loadCategories();

    expect(component.categories()).toEqual(mockCategories);
  });

  it('should show error toast when loadCategories fails', () => {
    categoryServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));
    const messageSpy = jest.spyOn(messageService, 'add');

    component.loadCategories();

    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: 'Error'
    }));
  });

  it('should call create and refresh list on valid form submit', () => {
    component.categoryForm.setValue({
      name: 'Travel',
      color: '#000000',
      description: '',
      categoryType: CategoryType.DISCRETIONARY,
      spendingLimit: 50000
    });

    categoryServiceMock.create.mockReturnValue(of({ id: 1, name: 'Travel', color: '#000000' }));

    const loadSpy = jest.spyOn(component, 'loadCategories');
    const messageSpy = jest.spyOn(messageService, 'add');

    component.saveCategory();

    expect(categoryServiceMock.create).toHaveBeenCalledWith({
      name: 'Travel',
      color: '#000000',
      description: '',
      categoryType: CategoryType.DISCRETIONARY,
      spendingLimit: 50000
    });
    expect(loadSpy).toHaveBeenCalled();
    expect(component.displayDialog()).toBe(false);
    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('should show error toast when saveCategory fails', () => {
    component.categoryForm.setValue({
      name: 'Error',
      color: '#000',
      description: 'description test',
      categoryType: CategoryType.DISCRETIONARY,
      spendingLimit: 0
    });
    categoryServiceMock.create.mockReturnValue(throwError(() => new Error('Save Error')));
    const messageSpy = jest.spyOn(messageService, 'add');

    component.saveCategory();

    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'Save failed'
    }));
  });

  it('should reset form and open dialog when showDialog is called', () => {
    component.categoryForm.get('name')?.setValue('Dirty Value');

    component.showDialog();

    expect(component.displayDialog()).toBe(true);
    expect(component.categoryForm.get('name')?.value).toBeFalsy();
    expect(component.categoryForm.get('color')?.value).toBe(ThemeConstants.DEFAULT_COLOR);
    expect(component.categoryForm.get('categoryType')?.value).toBeFalsy();
    expect(component.categoryForm.get('spendingLimit')?.value).toBeFalsy();
  });

  it('should populate form and set editingId when editCategory is called', () => {
    const mockCategory: Category = {
      id: 1,
      name: 'Travel',
      color: '#000000',
      description: 'Trips',
      categoryType: CategoryType.DISCRETIONARY,
      spendingLimit: 100000
    };

    component.editCategory(mockCategory);

    expect(component.editingId()).toBe(1);
    expect(component.categoryForm.get('name')?.value).toBe('Travel');
    expect(component.categoryForm.get('categoryType')?.value).toBe(CategoryType.DISCRETIONARY);
    expect(component.displayDialog()).toBe(true);
  });

  it('should reset editingId to null when showDialog is called', () => {
    component.editingId.set(1);

    component.showDialog();

    expect(component.editingId()).toBeNull();
  });

  it('should call delete service and refresh list on confirm', () => {
    categoryServiceMock.delete.mockReturnValue(of(void 0));
    categoryServiceMock.listAll.mockReturnValue(of([]));

    const messageSpy = jest.spyOn(messageService, 'add');

    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    jest.spyOn(confirmationService, 'confirm').mockImplementation((config) => {
      config.accept?.();
      return confirmationService;
    });

    component.deleteCategory(1);

    expect(categoryServiceMock.delete).toHaveBeenCalledWith(1);
    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', detail: 'Category deleted.' })
    );
  });

  it('should show error toast when delete fails', () => {
    categoryServiceMock.delete.mockReturnValue(throwError(() => new Error('Delete error')));

    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    jest.spyOn(confirmationService, 'confirm').mockImplementation((config) => {
      config.accept?.();
      return confirmationService;
    });

    const messageSpy = jest.spyOn(messageService, 'add');

    component.deleteCategory(1);

    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'This category has linked transactions. Remove them first.' })
    );
  });

  it('should set isLoading to false after categories load successfully', () => {
    categoryServiceMock.listAll.mockReturnValue(of([]));

    component.loadCategories();

    expect(component.isLoading()).toBe(false);
  });

  it('should set isLoading to false even when loadCategories fails', () => {
    categoryServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));

    component.loadCategories();

    expect(component.isLoading()).toBe(false);
  });
});