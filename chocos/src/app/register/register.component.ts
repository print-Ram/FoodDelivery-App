import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  authForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  toastMessage: string = '';
  showToast: boolean = false;

  showPassword = false;

  // will hold /cart or any other redirect target
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute   // ✅ added
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // ✅ read redirectTo from query params: /register?redirectTo=/cart
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectTo');
  }

  togglePasswordVisibility(event: MouseEvent) {
    event.stopPropagation();
    this.showPassword = !this.showPassword;
  }

  buildForm(): void {
    this.authForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [' ', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  register(): void {
    this.isLoading = true;

    if (!this.authForm.valid) {
      this.isLoading = false;
      return;
    }

    const user = this.authForm.value;

    this.authService.register(user).subscribe({
      next: (res) => {
        const credentials = {
          username: user.email,
          password: user.password
        };

        // auto-login after successful register
        this.authService.login(credentials).subscribe({
          next: (loginRes) => {
            this.authService.saveToken(loginRes.token);

            if (loginRes.userId) {
          sessionStorage.setItem('userId', loginRes.userId);
          }
            // ✅ if redirectTo exists (like /cart), go there first
            const targetRoute =
              this.redirectUrl || (loginRes.role === 'ADMIN' ? '/admin' : '/user');

            this.router.navigateByUrl(targetRoute, { replaceUrl: true });
            this.isLoading = false;
          },
          error: () => {
            this.showToastMessage('Auto-login failed. Please login manually.');
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        if (err.status === 409) {
          this.showToastMessage('Email already exists');
        } else {
          this.showToastMessage('Registration failed. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }
}
