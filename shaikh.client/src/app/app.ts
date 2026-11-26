import { Component, ElementRef, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LanguageService } from './i18n/language.service';

// Which nav label belongs to which address
const PAGE_KEYS: Record<string, string> = {
  '': 'nav.home',
  'home': 'nav.home',
  'skills': 'nav.skills',
  'projects': 'nav.projects',
  'work-experience': 'nav.work',
  'current-position': 'nav.work',
  'education': 'nav.education',
  'contact': 'nav.contact',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly i18n = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  @ViewChild('mainContent') private mainContent?: ElementRef<HTMLElement>;

  // Mobile menu
  readonly isMenuOpen = signal(false);

  // The page the visitor is on, shown beside the hamburger on phones
  // (on the homepage the bar shows my name instead of "Home")
  private readonly pageKey = signal('nav.home');
  readonly pageName = computed(() => this.i18n.t(this.pageKey()));
  readonly barTitle = computed(() =>
    this.pageKey() === 'nav.home' ? this.i18n.t('site.name') : this.pageName());

  // Text read out by screen readers when something changes (e.g. the language)
  readonly announcement = signal('');

  private firstNavigation = true;

  constructor() {
    // Keep the browser tab title in sync with the page and the language
    effect(() => {
      const page = this.pageName();
      const site = this.i18n.t('site.name');
      this.title.setTitle(this.pageKey() === 'nav.home' ? site : `${page} | ${site}`);
    });
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const path = e.urlAfterRedirects.split(/[?#]/)[0].replace(/^\/+/, '').split('/')[0];
        this.pageKey.set(PAGE_KEYS[path] ?? 'nav.home');
        this.isMenuOpen.set(false);

        // After moving to another page, put keyboard / screen-reader focus on the
        // new page's content instead of leaving it on the link that was clicked.
        if (this.firstNavigation) {
          this.firstNavigation = false;
        } else {
          setTimeout(() => this.mainContent?.nativeElement.focus({ preventScroll: true }));
          window.scrollTo({ top: 0 });
        }
      });

    if (!sessionStorage.getItem('hasVisitedHomepage')) {
      fetch('/api/viewers/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          if (response.ok) { sessionStorage.setItem('hasVisitedHomepage', 'true'); }
        })
        .catch(error => console.error('Error incrementing viewers:', error));
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleLanguage(): void {
    this.i18n.toggle();
    this.announcement.set(this.i18n.t('lang.announce'));
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    this.mainContent?.nativeElement.focus();
  }
}
