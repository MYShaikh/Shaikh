import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-skills',
  standalone: false,
  styleUrl: './skills.css',
  templateUrl: './skills.html',
})
export class SkillsComponent {
  hoveredSkill = '';
  summary = '';
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  lookup(skillName: string) {
    this.hoveredSkill = skillName;
    this.summary = 'Getting text from Wikapedia with Webscraping!';

    this.http.get<any>(`/api/definition/${skillName}`)
      .subscribe({
        next: data => {
          setTimeout(() => {
            this.summary = data.summary;
            this.cdr.detectChanges();
          }, 1500);
        },
        error: () => {
          setTimeout(() => {
            this.summary = 'Something went wrong loading this.';
            this.cdr.detectChanges();
          }, 1500);
        }
      });
  }
}
