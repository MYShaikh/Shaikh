import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../i18n/language.service';
import { MONTHS } from '../i18n/strings';

interface ContributionDay {
  date: string;   // yyyy-MM-dd
  level: number;  // 0-4, same shading levels GitHub uses
  count: number;
}

interface Contributions {
  profile: string;
  total: number;
  from: string;
  to: string;
  weeks: ContributionDay[][];
}

interface DreamCompany {
  key: string;
  name: string;
  emoji: string[];
}

interface Particle {
  id: number;
  key: string;     // which company card it floats around
  emoji: string;
  x: number;
  size: number;
  delay: number;
  drift: number;
}

@Component({
  selector: 'app-home',
  standalone: false,
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  readonly githubProfile = 'https://github.com/MYShaikh';

  // Strongest suits. The hover text is in i18n/strings.ts under home.tip.<key>.
  readonly suits = [
    { key: 'django', name: 'Django', icon: 'devicon-django-plain' },
    { key: 'unity', name: 'Unity Engine', icon: 'devicon-unity-plain' },
    { key: 'claude', name: '', icon: 'devicon-claude-plain' },   // name is translated
    { key: 'azure', name: 'Microsoft Azure', icon: 'devicon-azure-plain' },
    { key: 'dotnet', name: '.NET framework', icon: 'devicon-dotnetcore-plain' },
    { key: 'cloudflare', name: 'Cloudflare', icon: 'devicon-cloudflare-plain' },
  ];

  suitName(suit: { key: string; name: string }): string {
    return suit.key === 'claude' ? this.i18n.t('home.suit.claude') : suit.name;
  }

  // Dream companies, each with the emoji that float up when you hover or tap it
  readonly dreamCompanies: DreamCompany[] = [
    { key: 'microsoft', name: 'Microsoft', emoji: ['❤️', '💖', '💕', '💗'] },
    { key: 'xbox', name: 'Xbox', emoji: ['🎮'] },
    { key: 'ibm', name: 'IBM', emoji: ['📁'] },
    { key: 'cox', name: 'Cox Enterprises', emoji: ['🍑'] },
  ];

  readonly particles = signal<Particle[]>([]);
  private nextParticleId = 0;
  private lastBurst: Record<string, number> = {};

  burst(key: string): void {
    const co = this.dreamCompanies.find(c => c.key === key);
    if (!co) { return; }

    // Don't stack bursts when the mouse wiggles over the card
    const now = Date.now();
    if (now - (this.lastBurst[key] ?? 0) < 700) { return; }
    this.lastBurst[key] = now;

    const fresh: Particle[] = Array.from({ length: 9 }, (_, i) => ({
      id: this.nextParticleId++,
      key,
      emoji: co.emoji[i % co.emoji.length],
      x: 8 + Math.random() * 84,             // % across the card
      size: 18 + Math.round(Math.random() * 12),
      delay: Math.round(Math.random() * 450),
      drift: Math.round(Math.random() * 60 - 30),
    }));

    this.particles.update(list => [...list, ...fresh]);

    // Remove them once the float animation has finished
    const ids = new Set(fresh.map(p => p.id));
    setTimeout(() => this.particles.update(list => list.filter(p => !ids.has(p.id))), 2600);
  }

  // ---- GitHub contributions, last 6 months (signals: this app runs without zone.js) ----
  readonly contributions = signal<Contributions | null>(null);
  readonly contributionsFailed = signal(false);

  // One label per week column: the month name where a new month starts, otherwise ''.
  readonly monthLabels = computed(() => {
    const weeks = this.contributions()?.weeks ?? [];
    const names = MONTHS[this.i18n.lang()];
    const labels: string[] = [];
    let lastMonth = -1;
    let lastLabelAt = -10;
    weeks.forEach((week, i) => {
      const month = Number(week[0].date.slice(5, 7)) - 1;
      // Skip a label that would sit right on top of the previous one
      if (month !== lastMonth && i - lastLabelAt >= 3) {
        labels.push(names[month]);
        lastLabelAt = i;
      } else {
        labels.push('');
      }
      lastMonth = month;
    });
    return labels;
  });

  ngOnInit(): void {
    fetch('/api/github/contributions')
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Contributions) => this.contributions.set(data))
      .catch(() => this.contributionsFailed.set(true));
  }

  dayTitle(day: ContributionDay): string {
    const key = day.count === 0 ? 'home.ghDay0' : day.count === 1 ? 'home.ghDay1' : 'home.ghDayN';
    return this.i18n.t(key, { n: day.count, date: day.date });
  }
}
