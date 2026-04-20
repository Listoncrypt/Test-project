import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  appointmentForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  constructor(private router: Router, private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      company: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onGetStarted() {
    this.router.navigate(['/signup']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onBookAppointment() {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;

      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;

        setTimeout(() => {
          this.submitSuccess = false;
          this.appointmentForm.reset();
        }, 3000);
      }, 2000);
    } else {
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }
}
