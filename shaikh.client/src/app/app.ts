import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Phone variables
  public phoneButtonText: string = 'Contact: (470) 886-6957';
  public readonly phoneNumber: string = '4708866957';

  // Mobile menu variables
  public isMenuOpen: boolean = false;

  protected readonly title = signal('shaikh.client');

  constructor() { }

  // 3. Paste the ngOnInit method inside the class
  ngOnInit() {
    if (!sessionStorage.getItem('hasVisitedHomepage')) {
      fetch('/api/viewers/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log("New Total Viewers:", data.viewerCount);
          sessionStorage.setItem('hasVisitedHomepage', 'true');
        })
        .catch(error => {
          console.error('Error incrementing viewers:', error);
        });
    }
  }
  // Mobile menu click handlers
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // Portfolio phone click handler
  handlePhoneClick(): void {
    navigator.clipboard.writeText(this.phoneNumber).then(() => {
      const originalText = this.phoneButtonText;
      this.phoneButtonText = 'Number Copied!';

      setTimeout(() => {
        this.phoneButtonText = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });

    window.location.href = `tel:${this.phoneNumber}`;
  }
}
