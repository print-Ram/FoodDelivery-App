import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  isLoading: boolean = false;
  showPassword = false;

  // will hold /cart or any other redirect target
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // read redirectTo from query params: /login?redirectTo=/cart
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectTo');
  }

  buildForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(event: MouseEvent) {
    event.stopPropagation();
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
      const credentials = {
        username: this.authForm.value.email,
        password: this.authForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (res) => {
          // save JWT
          this.authService.saveToken(res.token);

          // ✅ OPTION A: store userId coming from backend response
          // make sure your backend returns: { token, role, userId }
          if (res.userId) {
            sessionStorage.setItem('userId', res.userId);
          }

          // if came from /login?redirectTo=/cart → go there
          if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl, { replaceUrl: true });
          } else {
            // otherwise use role-based redirect
            const targetRoute = res.role === 'ADMIN' ? '/admin' : '/user';
            this.router.navigateByUrl(targetRoute, { replaceUrl: true });
          }

          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Invalid email or password';
          this.isLoading = false;
        }
      });
    }
  }


  // Navigate to the Register page
navigateToRegister(): void {
  if (this.redirectUrl) {
    // preserve redirectTo (e.g. /cart)
    this.router.navigate(['/register'], {
      queryParams: { redirectTo: this.redirectUrl }
    });
  } else {
    this.router.navigate(['/register']);
  }
}

  

}
