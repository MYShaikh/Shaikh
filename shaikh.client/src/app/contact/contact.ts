import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  standalone: false
})
export class ContactComponent {
  readonly i18n = inject(LanguageService);
  showContactForm = false;

  public readonly phoneNumber: string = '4708866957';
  phoneCopied = false;   // shows "Number Copied!" for 2 seconds

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
      this.phoneCopied = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.phoneCopied = false;
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

    fetch('/api/contact', {
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
