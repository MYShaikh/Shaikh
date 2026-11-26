import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../i18n/language.service';

@Component({
  selector: 'app-education',
  standalone: false,
  styleUrl: './education.css',
  templateUrl: './education.html',
})
export class EducationComponent {
  readonly i18n = inject(LanguageService);
  alumniStatus: { [key: string]: boolean } = {};

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  submitAlumni(school: string, isAlumni: boolean) {
    this.http.post('/api/alumni', { school, isAlumni })
      .subscribe({
        next: () => {
          this.alumniStatus[school] = true;
          this.cdr.detectChanges();
        },
        error: () => console.log('Failed to submit alumni response')
      });
  }
}
