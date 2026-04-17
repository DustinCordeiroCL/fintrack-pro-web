import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;

    this.#authService.login({ email: email!, password: password! }).subscribe({
      next: () => this.#router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
