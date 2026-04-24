import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  isMobileMenuOpen = false;
  private _observer: IntersectionObserver | null = null;

  constructor(private router: Router) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onBecomeAgent() {
    this.router.navigate(['/signup']);
  }

  joinTelegram() {
    window.open('https://t.me/Ungodlyachvportfolio', '_blank');
  }

  ngAfterViewInit(): void {
    const options = { root: null, rootMargin: '0px', threshold: 0.12 };
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        }
      });
    }, options);

    document.querySelectorAll('.reveal').forEach((el) => {
      this._observer?.observe(el);
    });
  }

  ngOnDestroy(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}