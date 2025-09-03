import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EngineerFormComponent } from './engineer-form.component';

describe('EngineerFormComponent', () => {
  let component: EngineerFormComponent;
  let fixture: ComponentFixture<EngineerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EngineerFormComponent],
      imports: [
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
        NoopAnimationsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form values', () => {
    const state = component.formState();
    expect(state.firstName).toBe('');
    expect(state.lastName).toBe('');
    expect(state.email).toBe('');
    expect(state.framework).toBe('');
    expect(state.version).toBe('');
    expect(state.hobbies).toEqual([]);
  });

  it('should update form state when fields are updated', () => {
    // Test firstName update
    component.updateField('firstName', 'John');
    expect(component.formState().firstName).toBe('John');
    
    // Test email update
    component.updateField('email', 'test@example.com');
    expect(component.formState().email).toBe('test@example.com');
  });

  it('should validate required fields', () => {
    const errors = component.formErrors();
    expect(errors['firstName']).toBe('First name is required');
    expect(errors['lastName']).toBe('Last name is required');
    expect(errors['email']).toBe('Email is required');
    expect(errors['framework']).toBe('Framework is required');
    expect(errors['version']).toBe('Version is required');
    expect(errors['hobbies']).toBe('At least one hobby is required');
  });

  it('should validate email format', () => {
    component.updateField('email', 'invalid-email');
    expect(component.formErrors()['email']).toBe('Please enter a valid email');
    
    component.updateField('email', 'valid@example.com');
    expect(component.formErrors()['email']).toBeUndefined();
  });

  it('should add and remove hobbies', () => {
    // Add a hobby
    component.newHobby.set('Reading');
    component.newHobbyDuration.set('2 years');
    component.addHobby();
    
    expect(component.formState().hobbies.length).toBe(1);
    expect(component.formState().hobbies[0]).toEqual({
      name: 'Reading',
      duration: '2 years'
    });

    // Remove the hobby
    component.removeHobby(0);
    expect(component.formState().hobbies.length).toBe(0);
  });

  it('should update framework and available versions', () => {
    // Select a framework
    component.onFrameworkChange('angular');
    expect(component.formState().framework).toBe('angular');
    expect(component.availableVersions().length).toBeGreaterThan(0);
    
    // Version should be reset when framework changes
    expect(component.formState().version).toBe('');
    
    // Select a version
    const version = component.availableVersions()[0];
    component.onVersionChange(version);
    expect(component.formState().version).toBe(version);
  });

  it('should format date correctly', () => {
    const date = new Date('1990-01-01');
    const formattedDate = component.formatDate(date.toISOString());
    expect(formattedDate).toBe('01.01.1990');
  });

  it('should be valid when all required fields are filled', () => {
    // Fill in required fields
    component.updateField('firstName', 'John');
    component.updateField('lastName', 'Doe');
    component.updateField('email', 'john.doe@example.com');
    component.onFrameworkChange('angular');
    component.onVersionChange('1.1.1');
    component.newHobby.set('Coding');
    component.newHobbyDuration.set('5 years');
    component.addHobby();
    
    // Set a valid date of birth
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 25);
    component.updateField('dateOfBirth', pastDate.toISOString());
    
    // Check form validity
    expect(component.isFormValid()).toBeTrue();
    expect(Object.keys(component.formErrors()).length).toBe(0);
  });

  it('should update available versions when framework changes', () => {
    // Select a framework
    component.onFrameworkChange('vue');
    
    // Check if available versions are updated
    const versions = component.availableVersions();
    expect(versions).toContain('3.3.1');
    expect(versions).toContain('5.2.1');
    expect(versions).toContain('5.1.3');
  });
});
