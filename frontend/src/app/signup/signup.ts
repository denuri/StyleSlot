import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  signupData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.signupData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.error && error.error.errors) {
          this.errorMessage = Object.values(error.error.errors).join(', ');
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
