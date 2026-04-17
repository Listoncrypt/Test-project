import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = '';
      const { email, password } = this.signupForm.value;

      this.authService.signup(email, password).subscribe({
        next: (user) => {
          this.loading = false;
          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Signup failed';
        },
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  signupWithTwitter() {
    this.loading = true;
    this.error = '';
    // In a real app, this would trigger OAuth flow
    // For now, we'll use a mock Twitter handle
    this.authService.signupWithTwitter('user_' + Date.now()).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Twitter signup failed';
      },
    });
  }
}
