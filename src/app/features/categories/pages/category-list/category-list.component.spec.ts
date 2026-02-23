import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '../../../../services/category/category.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ThemeConstants } from '../../../../core/constants/theme.constants';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let messageService: MessageService;

  const categoryServiceMock = {
    listAll: jest.fn(),
    create: jest.fn()
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

  // Test method: loadCategories()
  it('should load categories on init (Positive Path)', () => {
    const mockCategories = [{ id: 1, name: 'Food', color: '#hex' }];
    categoryServiceMock.listAll.mockReturnValue(of(mockCategories));

    component.loadCategories();

    expect(component.categories()).toEqual(mockCategories);
  });

  it('should show error toast when loadCategories fails (Negative Path)', () => {
    categoryServiceMock.listAll.mockReturnValue(throwError(() => new Error('API Error')));
    const messageSpy = jest.spyOn(messageService, 'add');

    component.loadCategories();

    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: 'Error'
    }));
  });

  //Test method: saveCategory()
  it('should call create and refresh list on valid form submit (Positive Path)', () => {
    component.categoryForm.setValue({ name: 'Travel', color: '#000000' });
    categoryServiceMock.create.mockReturnValue(of({ id: 1, name: 'Travel', color: '#000000' }));

    const loadSpy = jest.spyOn(component, 'loadCategories');
    const messageSpy = jest.spyOn(messageService, 'add');

    component.saveCategory();

    expect(categoryServiceMock.create).toHaveBeenCalledWith({ name: 'Travel', color: '#000000' });
    expect(loadSpy).toHaveBeenCalled();
    expect(component.displayDialog()).toBe(false);
    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success'
    }));
  });

  it('should show error toast when saveCategory fails (Negative Path)', () => {
    component.categoryForm.setValue({ name: 'Error', color: '#000' });
    categoryServiceMock.create.mockReturnValue(throwError(() => new Error('Save Error')));
    const messageSpy = jest.spyOn(messageService, 'add');

    component.saveCategory();

    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'Save failed'
    }));
  });

  //Test method: showDialog()
  it('should reset form and open dialog when showDialog is called', () => {
    component.categoryForm.get('name')?.setValue('Dirty Value');

    component.showDialog();

    expect(component.displayDialog()).toBe(true);
    expect(component.categoryForm.get('name')?.value).toBeFalsy();
    expect(component.categoryForm.get('color')?.value).toBe(ThemeConstants.DEFAULT_COLOR);
  });
});