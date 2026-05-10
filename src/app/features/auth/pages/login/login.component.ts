import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.#fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatch });

  constructor() {
    const mode = this.#route.snapshot.queryParamMap.get('mode');
    if (mode === 'register') {
      this.mode.set('register');
    }
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;
    this.#authService.login({ email: email!, password: password! }).subscribe({
      next: () => this.#router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Credenciais inválidas. Tente novamente.');
        this.loading.set(false);
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const { name, email, password } = this.registerForm.value;
    this.#authService.register({ name: name!, email: email!, password: password! }).subscribe({
      next: () => this.#router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Não foi possível criar a conta. Verifique os dados e tente novamente.');
        this.loading.set(false);
      }
    });
  }
}
