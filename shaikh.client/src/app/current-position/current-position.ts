import { Component, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';

@Component({
  selector: 'app-current-position',
  standalone: false,
  styleUrl: './current-position.css',
  templateUrl: './current-position.html',
})
export class CurrentPositionComponent {
  readonly i18n = inject(LanguageService);
}
