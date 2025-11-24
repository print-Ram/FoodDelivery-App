import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authForm!: FormGroup;
  isLoginMode: boolean = true;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }


toggleMode(): void {
  this.isLoginMode = !this.isLoginMode;
  this.errorMessage = '';
  this.authForm.reset();
}


  buildForm(): void {
    this.authForm = this.fb.group({
      name: [{ value: '', disabled: this.isLoginMode }, this.isLoginMode ? [] : [Validators.required]],
      contact: [{ value: '', disabled: this.isLoginMode }, this.isLoginMode ? [] : [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: [{ value: '', disabled: this.isLoginMode }, this.isLoginMode ? [] : [Validators.required]]
    });
  }

  onSubmit(): void {
  if (this.authForm.valid) {
    if (this.isLoginMode) {
      const credentials = {
        username: this.authForm.value.email,
        password: this.authForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.router.navigate(['/']);
        },
        error: () => {
          this.errorMessage = 'Invalid email or password';
        }
      });
    } else {
      const user = this.authForm.value;
      this.authService.register(user).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token); // ✅ only after success
          this.router.navigate(['/']);
        },
        error: () => {
          this.errorMessage = 'Registration failed. Try again.';
        }
      });
    }
  }
}

}