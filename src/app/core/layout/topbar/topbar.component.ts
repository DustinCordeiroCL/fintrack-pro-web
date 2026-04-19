import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  transactions: 'Transacciones',
  categories: 'Categorías',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  readonly #router = inject(Router);
  readonly #authService = inject(AuthService);

  readonly user = this.#authService.getUser();

  readonly currentPage = toSignal(
    this.#router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => {
        const segment = e.urlAfterRedirects.split('/')[1] ?? 'dashboard';
        return PAGE_LABELS[segment] ?? 'FinTrack';
      }),
      startWith(this.#getPageFromUrl(this.#router.url))
    )
  );

  get userInitials(): string {
    const u = this.user;
    if (!u) return 'U';
    if (u.name) return u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return u.email.charAt(0).toUpperCase();
  }

  get displayName(): string {
    return this.user?.name ?? this.user?.email ?? 'User';
  }

  logout(): void {
    this.#authService.logout();
  }

  #getPageFromUrl(url: string): string {
    const segment = url.split('/')[1] ?? 'dashboard';
    return PAGE_LABELS[segment] ?? 'FinTrack';
  }
}
