import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-become-creator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './become-creator.component.html',
  styleUrls: ['./become-creator.component.css'],
})
export class BecomeCreatorComponent {
  constructor(private router: Router) {}

  onGetStarted() {
    this.router.navigate(['/signup']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
