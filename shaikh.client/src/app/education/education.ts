import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-education',
  standalone: false,
  styleUrl: './education.css',
  templateUrl: './education.html',
})
export class EducationComponent {
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
