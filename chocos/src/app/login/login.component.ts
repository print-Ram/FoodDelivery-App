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
export class LoginComponent implements OnInit {
  authForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.authForm.valid) {
      const credentials = {
        username: this.authForm.value.email,
        password: this.authForm.value.password
      };

      this.authService.login(credentials).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        const targetRoute = res.role === 'ADMIN' ? '/admin' : '/';

        // Replace URL so login is not in history
        this.router.navigateByUrl(targetRoute, { replaceUrl: true });
      },
        error: () => {
          this.errorMessage = 'Invalid email or password';
        }
      });
    }
  }

  // Navigate to the Register page
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}