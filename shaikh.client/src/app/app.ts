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

  // Total visitor count shown in the footer (null until it has loaded)
  // A signal, because this app runs without zone.js: only signals tell Angular to redraw.
  public readonly viewerCount = signal<number | null>(null);

  constructor() { }

  // 3. Paste the ngOnInit method inside the class
  ngOnInit() {
    if (!sessionStorage.getItem('hasVisitedHomepage')) {
      // First visit in this tab: count it, and show the new total.
      fetch('/api/viewers/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) { throw new Error('increment failed: ' + response.status); }
          return response.json();
        })
        .then(data => {
          sessionStorage.setItem('hasVisitedHomepage', 'true');
          this.viewerCount.set(data.viewerCount);
        })
        .catch(error => {
          console.error('Error incrementing viewers:', error);
        });
    } else {
      // Already counted in this tab: just read the current total.
      fetch('/api/viewers/count')
        .then(response => {
          if (!response.ok) { throw new Error('count failed: ' + response.status); }
          return response.json();
        })
        .then(data => {
          this.viewerCount.set(data.viewerCount);
        })
        .catch(error => {
          console.error('Error loading viewer count:', error);
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
