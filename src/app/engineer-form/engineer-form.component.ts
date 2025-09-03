import { Component, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
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
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipSet,
    MatChip,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './engineer-form.component.html',
})
export class EngineerFormComponent {
  // Loading state for skeleton
  readonly loading = signal<boolean>(true);
  // Controls transient display of aggregated errors under submit
  readonly showInlineErrors = signal<boolean>(false);
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
  newHobby = new FormControl('', [Validators.required, this.hobbyValidator.bind(this)]);
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

  // Get framework keys for template
  getFrameworkKeys(): string[] {
    return Object.keys(this.frameworkVersions);
  }
  
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

    // First name validation
    if (!state.firstName) {
      errors['firstName'] = 'First name is required';
    } else if (state.firstName.length < 2) {
      errors['firstName'] = 'Minimum length is 2 characters';
    } else if (!this.isValidName(state.firstName)) {
      errors['firstName'] = 'First name must contain only Latin letters, first letter uppercase';
    }

    // Last name validation
    if (!state.lastName) {
      errors['lastName'] = 'Last name is required';
    } else if (state.lastName.length < 2) {
      errors['lastName'] = 'Minimum length is 2 characters';
    } else if (!this.isValidName(state.lastName)) {
      errors['lastName'] = 'Last name must contain only Latin letters, first letter uppercase';
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
      errors['framework'] = 'Please select a framework';
    }

    if (!state.version) {
      errors['version'] = 'Please select a version';
    }

    if (!state.email) {
      errors['email'] = 'Email is required';
    } else if (!this.isValidEmail(state.email)) {
      errors['email'] = 'Please enter a valid email';
    } else if (this.emailError()) {
      errors['email'] = this.emailError()!;
    }

    if (state.hobbies.length === 0) {
      errors['hobbies'] = 'Please add at least one hobby';
    } else {
      // Validate each hobby
      const invalidHobbies = state.hobbies.filter(hobby => 
        !hobby.name || !this.isValidName(hobby.name) || !hobby.duration
      );
      if (invalidHobbies.length > 0) {
        errors['hobbies'] = 'All hobbies must contain only Latin letters, first letter uppercase';
      }
    }

    return errors;
  });

  // Computed property to check if form is valid
  readonly isFormValid = computed(() => {
    const state = this.formState();
    const errors = this.formErrors();
    const hasHobbies = state.hobbies && state.hobbies.length > 0;
    return Object.keys(errors).length === 0 && hasHobbies;
  });

  // Expose flat list of errors for UI rendering
  readonly errorsList = computed(() => {
    return Object.values(this.formErrors());
  });

  // Helper to check if a field has an error
  hasError(field: string): boolean {
    return field in this.formErrors();
  }

  // Helper to get error message for a field
  getErrorMessage(field: string): string {
    return this.formErrors()[field] || '';
  }

  // Helper to validate name format (Latin letters only, first letter uppercase)
  isValidName(name: string): boolean {
    // Regular expression: starts with uppercase Latin letter, followed by lowercase Latin letters only
    const nameRegex = /^[A-Z][a-z]+$/;
    return nameRegex.test(name);
  }

  // Helper to format name (capitalize first letter, remove non-Latin characters)
  private formatName(name: string): string {
    if (!name) return '';
    
    // Remove all non-Latin characters and convert to lowercase
    const cleanedName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    // Capitalize first letter
    return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }

  // Helper to validate email format
  private isValidEmail(email: string): boolean {
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Custom validator for hobby names
  hobbyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const hobby = control.value.trim();
    if (!this.isValidName(hobby)) {
      return { invalidHobby: true };
    }
    return null;
  }

  // Email validation state
  readonly emailError = signal<string | null>(null);
  readonly emailValidating = signal<boolean>(false);
  
  // Set max date to today for date of birth
  maxDate = new Date();

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Simulate initial loading for skeleton, then reveal form smoothly
    setTimeout(() => this.loading.set(false), 700);
    // Load from localStorage if present
    try {
      const raw = localStorage.getItem('engineerFormData');
      if (raw) {
        const data = JSON.parse(raw) as FormState;
        // Basic validation of loaded data
        if (data && typeof data === 'object') {
          // Validate and fix hobbies
          const validHobbies = Array.isArray(data.hobbies) ? 
            data.hobbies.map(hobby => ({
              name: hobby.name ? this.formatName(hobby.name) : '',
              duration: hobby.duration || ''
            })).filter(hobby => hobby.name && hobby.duration) : [];

          this.formState.set({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            framework: data.framework || '',
            version: data.version || '',
            email: data.email || '',
            hobbies: validHobbies
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
    // Special formatting for name fields
    if (field === 'firstName' || field === 'lastName') {
      value = this.formatName(value as string) as FormState[K];
    }

    this.formState.update(state => ({
      ...state,
      [field]: value
    }));
    
    // Show errors immediately when typing
    if (value !== '' && value !== null) {
      this.showInlineErrors.set(true);
    }
    
    this.persistState();

    // Special handling for email validation
    if (field === 'email') {
      this.validateEmail(value as string);
    }
  }

  private async validateEmail(email: string) {
    // Sync checks
    if (!email) {
      this.emailError.set('Email is required');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.emailError.set('Please enter a valid email');
      return;
    }

    // Async validation with progress flag
    this.emailValidating.set(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (email === 'test@test.test') {
        this.emailError.set('This email is already taken');
      } else {
        this.emailError.set(null);
      }
    } catch (error) {
      console.error('Error validating email:', error);
      this.emailError.set('Error validating email');
    } finally {
      this.emailValidating.set(false);
    }
  }

  addHobby() {
    const hobby = typeof this.newHobby.value === 'string' ? this.newHobby.value.trim() : '';
    const duration = String(this.newHobbyDuration.value || '').trim();
    
    if (hobby && duration && this.newHobby.valid && this.newHobbyDuration.valid) {
      // Format hobby name (capitalize first letter, remove non-Latin characters)
      const formattedHobby = this.formatName(hobby);
      
      this.formState.update(state => ({
        ...state,
        hobbies: [...state.hobbies, { name: formattedHobby, duration: `${duration} month` }]
      }));
      
      // Сбрасываем поля ввода
      this.newHobby.reset();
      this.newHobbyDuration.reset();
      this.newHobby.markAsUntouched();
      this.newHobbyDuration.markAsUntouched();
      
      this.persistState();
      this.snackBar.open('Hobby added', 'OK', { duration: 2000, panelClass: 'success-snackbar' });
    } else {
      // Show errors if fields are empty or invalid
      this.newHobby.markAsTouched();
      this.newHobbyDuration.markAsTouched();
      
      if (!hobby || !duration) {
        this.snackBar.open('Please fill in both hobby and duration', 'OK', { duration: 3000, panelClass: 'error-snackbar' });
      } else if (!this.newHobbyDuration.valid) {
        this.snackBar.open('Please enter a valid duration (numbers only)', 'OK', { duration: 3000, panelClass: 'error-snackbar' });
      }
    }
  }

  removeHobby(index: number): void {
    console.log('Removing hobby at index:', index);
    console.log('Current hobbies:', this.formState().hobbies);
    
    this.formState.update((state: FormState) => {
      const newHobbies = [...state.hobbies];
      console.log('Before removal:', newHobbies);
      newHobbies.splice(index, 1);
      console.log('After removal:', newHobbies);
      return {
        ...state,
        hobbies: newHobbies
      };
    });
    
    this.persistState();
    this.snackBar.open(`Hobby removed (index: ${index})`, 'OK', { duration: 3000, panelClass: 'success-snackbar' });
  }

  onSubmit() {
    // Show all validation messages
    this.showInlineErrors.set(true);
    
    // Check if form is valid
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Format date before submission
    const currentState = this.formState();
    const formData = {
      firstName: currentState.firstName,
      lastName: currentState.lastName,
      dateOfBirth: this.formatDate(currentState.dateOfBirth as Date | null),
      framework: currentState.framework,
      frameworkVersion: currentState.version,
      email: currentState.email,
      hobbies: currentState.hobbies
    };
    
    try {
      // Save the submission
      localStorage.setItem('engineerFormLastSubmit', JSON.stringify(formData));
      localStorage.setItem('engineerFormData', JSON.stringify(formData));
      
      // Show success message
      this.snackBar.open('Form submitted successfully!', 'OK', { 
        duration: 2000,
        panelClass: 'success-snackbar'
      });
      
      // Show confetti effect
      this.launchConfetti();
      
      // Reset form controls
      this.newHobby.reset('');
      this.newHobby.markAsUntouched();
      this.newHobbyDuration.reset('');
      this.newHobbyDuration.markAsUntouched();
      
      this.persistState();
      
    } catch (e) {
      console.error('Error saving form data:', e);
      this.snackBar.open('Error saving form data', 'OK', { 
        duration: 3000, 
        panelClass: 'error-snackbar' 
      });
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

  // Simple confetti effect without external libraries
  private launchConfetti(durationMs: number = 1500, count: number = 120) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#03a9f4', '#4caf50', '#ff9800', '#ff5722'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size = 6 + Math.random() * 6;
      const left = Math.random() * 100; // vw
      const delay = Math.random() * 0.6;
      const rotate = Math.random() * 360;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.4}px`;
      piece.style.left = `${left}vw`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${delay}s`;
      piece.style.transform = `translateY(-120%) rotate(${rotate}deg)`;
      container.appendChild(piece);
    }

    // Auto-remove container after animation
    window.setTimeout(() => {
      try {
        document.body.removeChild(container);
      } catch {}
    }, durationMs);
  }
}
