import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <a routerLink="/" class="inline-flex items-center gap-3">
            <span class="text-sm font-semibold tracking-[0.35em] uppercase text-slate-700">UNGODLY</span>
            <span class="text-2xl font-black text-[var(--brand-logo)]">ACHV</span>
            <span class="text-lg">💙</span>
          </a>
          <nav class="flex items-center gap-4 text-sm text-slate-600">
            <a routerLink="/login" class="hover:text-slate-900">Login</a>
            <a routerLink="/signup" class="hover:text-slate-900">Sign up</a>
            <a routerLink="/dashboard" class="hover:text-slate-900">Dashboard</a>
          </nav>
        </div>
      </header>
      <main class="pt-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'Engagement Platform';
}
