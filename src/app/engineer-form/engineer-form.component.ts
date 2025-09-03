import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Hobby {
  name: string;
  duration: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  framework: string;
  version: string;
  email: string;
  hobbies: Hobby[];
}

@Component({
  selector: 'app-engineer-form',
  templateUrl: './engineer-form.component.html',
  styleUrls: ['./engineer-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class EngineerFormComponent {
  // Form state using signals
  readonly formState = signal<FormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    framework: '',
    version: '',
    email: '',
    hobbies: []
  });

  // New hobby form control
  newHobby = new FormControl('');
  newHobbyDuration = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]+$')
  ]);

  // New method to handle date changes
  onDateChange(event: any) {
    this.updateField('dateOfBirth', event.value);
  }
  
  // Expose form state as a readonly signal
  readonly formValues = this.formState.asReadonly();

  // Typing effect removed from this component; kept only in AppComponent header
  
  // Framework versions
  readonly frameworkVersions: { [key: string]: string[] } = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3']
  };
  
  readonly availableVersions = computed(() => {
    const framework = this.formState().framework;
    return framework ? this.frameworkVersions[framework] : [];
  });
  
  // Hobby management
  readonly hobbiesList = computed(() => {
    return this.formState().hobbies.map((hobby, index) => ({
      ...hobby,
      id: index
    }));
  });
  
  // Form validation
  readonly formErrors = computed(() => {
    const state = this.formState();
    const errors: Record<string, string> = {};

    if (!state.firstName) {
      errors['firstName'] = 'First name is required';
    } else if (state.firstName.length < 2) {
      errors['firstName'] = 'Minimum length is 2 characters';
    }

    if (!state.lastName) {
      errors['lastName'] = 'Last name is required';
    } else if (state.lastName.length < 2) {
      errors['lastName'] = 'Minimum length is 2 characters';
    }

    if (!state.dateOfBirth) {
      errors['dateOfBirth'] = 'Date of birth is required';
    } else {
      const birthDate = new Date(state.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors['dateOfBirth'] = 'Date of birth cannot be in the future';
      }
    }

    if (!state.framework) {
      errors['framework'] = 'Framework is required';
    }

    if (!state.version) {
      errors['version'] = 'Version is required';
    }

    if (!state.email) {
      errors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors['email'] = 'Please enter a valid email';
    }

    if (state.hobbies.length === 0) {
      errors['hobbies'] = 'At least one hobby is required';
    }

    return errors;
  });

  // Computed property to check if form is valid
  readonly isFormValid = computed(() => {
    const errors = this.formErrors();
    return Object.keys(errors).length === 0 && !this.emailError();
  });

  // Helper to check if a field has an error
  hasError(field: string): boolean {
    return field in this.formErrors();
  }

  // Helper to get error message for a field
  getErrorMessage(field: string): string {
    return this.formErrors()[field] || '';
  }

  // Email validation state
  readonly emailError = signal<string | null>(null);

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Load from localStorage if present
    try {
      const raw = localStorage.getItem('engineerFormData');
      if (raw) {
        const data = JSON.parse(raw) as FormState;
        // Basic validation of loaded data
        if (data && typeof data === 'object') {
          this.formState.set({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            framework: data.framework || '',
            version: data.version || '',
            email: data.email || '',
            hobbies: Array.isArray(data.hobbies) ? data.hobbies : []
          });
        }
      }
    } catch (e) {
      console.warn('Не удалось загрузить данные формы из localStorage:', e);
    }
  }

  private persistState() {
    try {
      const snapshot = this.formState();
      localStorage.setItem('engineerFormData', JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Не удалось сохранить данные формы в localStorage:', e);
    }
  }

  onFrameworkChange(framework: string): void {
    if (!framework) return;
    
    this.formState.update((state: FormState) => ({
      ...state,
      framework,
      version: '' // Reset version when framework changes
    }));
    this.persistState();
  }

  onVersionChange(version: string): void {
    if (!version) return;
    
    this.updateField('version', version);
  }

  async updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    this.formState.update(state => ({
      ...state,
      [field]: value
    }));
    this.persistState();

    // Special handling for email validation
    if (field === 'email') {
      await this.validateEmail(value as string);
    }
  }

  private async validateEmail(email: string) {
    if (!email) {
      this.emailError.set('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError.set('Please enter a valid email');
      return;
    }

    // Simulate async validation
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === 'test@test.test') {
        this.emailError.set('This email is already taken');
      } else {
        this.emailError.set(null);
      }
    } catch (error) {
      console.error('Error validating email:', error);
      this.emailError.set('Error validating email');
    }
  }

  addHobby() {
    const hobbyRaw = this.newHobby.value;
    const durationRaw = this.newHobbyDuration.value;
    const hobby = hobbyRaw == null ? '' : String(hobbyRaw).trim();
    const duration = durationRaw == null ? '' : String(durationRaw).trim();

    if (hobby && duration) {
      this.formState.update(state => ({
        ...state,
        hobbies: [...state.hobbies, { name: hobby, duration }]
      }));
      this.persistState();
      
      this.newHobby.reset();
      this.newHobbyDuration.reset();

      this.snackBar.open('Хобби добавлено', 'OK', { duration: 2000, panelClass: 'success-snackbar' });
    } else {
      this.snackBar.open('Заполните хобби и длительность (только числа)', 'OK', { duration: 3000, panelClass: 'error-snackbar' });
    }
  }

  removeHobby(index: number): void {
    this.formState.update((state: FormState) => {
      const newHobbies = [...state.hobbies];
      newHobbies.splice(index, 1);
      return {
        ...state,
        hobbies: newHobbies
      };
    });
    this.persistState();
  }

  onSubmit() {
    if (this.isFormValid()) {
      // Format date before submission
      const currentState = this.formState();
      const formData = {
        ...currentState,
        dateOfBirth: this.formatDate(currentState.dateOfBirth as Date | null)
      };
      
      try {
        // Эмулируем запись "в файл" — сохраняем последний сабмит отдельно
        localStorage.setItem('engineerFormLastSubmit', JSON.stringify(formData));
        console.log('Form submitted:', formData);
        this.snackBar.open('Данные успешно сохранены', 'OK', { duration: 2500, panelClass: 'success-snackbar' });
      } catch (e) {
        console.error('Ошибка при сохранении:', e);
        this.snackBar.open('Ошибка при сохранении данных', 'OK', { duration: 3000, panelClass: 'error-snackbar' });
        return;
      }
      
      // Reset form after submission
      this.formState.set({
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        framework: '',
        version: '',
        email: '',
        hobbies: []
      });
      this.persistState();
    }
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      
      // Simulate server call
      return of(control.value === 'test@test.test' ? { emailExists: true } : null)
        .pipe(delay(500));
    };
  }

  // Format date to DD-MM-YYYY
  private formatDate(date: Date | null): string {
    if (!date) return '';
    
    try {
      // Ensure we have a valid date object
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
}
