import { Component, OnInit } from '@angular/core';
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
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  showPassword = false;
  loading = false;
  error = '';
  twitterConnected = false;
  twitterUser: any = null;

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

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.twitterConnected = true;
        this.twitterUser = user;
        this.loading = false;
      }
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.twitterConnected = true;
      this.twitterUser = currentUser;
    }
  }

  async connectTwitter() {
    this.loading = true;
    this.error = '';
    try {
      await this.authService.initiateTwitterAuth();
    } catch (err) {
      this.loading = false;
      this.error = 'Unable to start Twitter authentication. Please try again.';
      console.error('Twitter auth start failed', err);
    }
  }

  async disconnectTwitter() {
    this.loading = true;
    try {
      await this.authService.logout();
      this.twitterConnected = false;
      this.twitterUser = null;
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.error = 'Failed to disconnect Twitter account.';
    }
  }

  onSubmit() {
    if (this.signupForm.valid && this.twitterConnected) {
      this.loading = true;
      this.error = '';
      const { email, password } = this.signupForm.value;

      this.authService.signup(email, password).subscribe({
        next: (user) => {
          this.loading = false;
          const combinedUser = {
            ...user,
            ...this.twitterUser,
            verified: true,
            boost: (user.boost || 0) + 10,
            balance: (user.balance || 0) + 5,
          };
          this.authService.updateUser(combinedUser);
          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Account creation failed: ' + (err.message || 'Unknown error');
        },
      });
    } else if (!this.twitterConnected) {
      this.error = 'Please connect your Twitter account first';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
