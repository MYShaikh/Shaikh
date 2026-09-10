import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  standalone: false
})
export class ContactComponent {
  showContactForm = false;

  public readonly phoneNumber: string = '4708866957';
  public phoneButtonText: string = 'Contact: (470) 886-6957';

  contactForm = {
    name: '',
    email: '',
    subject: '',
    body: ''
  };

  contactStatus: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

  constructor(private cdr: ChangeDetectorRef) { }

  handlePhoneClick(): void {
    navigator.clipboard.writeText(this.phoneNumber).then(() => {
      const originalText = this.phoneButtonText;
      this.phoneButtonText = 'Number Copied!';
      this.cdr.detectChanges();

      setTimeout(() => {
        this.phoneButtonText = originalText;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });

    window.location.href = `tel:${this.phoneNumber}`;
  }

  submitContact(): void {
    const { name, email, subject, body } = this.contactForm;

    if (!name.trim() || !email.trim() || !subject.trim() || !body.trim()) {
      this.contactStatus = 'error';
      return;
    }

    this.contactStatus = 'sending';
    this.cdr.detectChanges();

    fetch('https://localhost:7154/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, subject, body })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        this.contactStatus = 'sent';
        this.contactForm = { name: '', email: '', subject: '', body: '' };
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Failed to send message:', error);
        this.contactStatus = 'error';
        this.cdr.detectChanges();
      });
  }
}
