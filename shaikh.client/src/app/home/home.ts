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
    { key: 'claude', name: 'Claude Code', icon: 'devicon-claudecode-plain' },
    { key: 'cloudflare', name: 'Cloudflare', icon: 'devicon-cloudflare-plain' },
    { key: 'azure', name: 'Microsoft Azure', icon: 'devicon-azure-plain' },
    { key: 'dotnet', name: '.NET framework', icon: 'devicon-dotnetcore-plain' },
  ];

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

  // ---- GitHub contributions, last 4 months (signals: this app runs without zone.js) ----
  readonly contributions = signal<Contributions | null>(null);
  readonly contributionsFailed = signal(false);

  // One label per week column: the month name where a new month starts, otherwise ''.
  // Like GitHub: a month is labelled on the week that contains its 1st day.
  // The very first column only gets a label if there's room before the next one.
  readonly monthLabels = computed(() => {
    const weeks = this.contributions()?.weeks ?? [];
    const names = MONTHS[this.i18n.lang()];
    const labels: string[] = weeks.map(() => '');

    const starts: { col: number; month: number }[] = [];
    weeks.forEach((week, i) => {
      const firstOfMonth = week.find(d => d.date.endsWith('-01'));
      if (firstOfMonth) {
        starts.push({ col: i, month: Number(firstOfMonth.date.slice(5, 7)) - 1 });
      }
    });

    if (weeks.length && (starts.length === 0 || starts[0].col >= 3)) {
      labels[0] = names[Number(weeks[0][0].date.slice(5, 7)) - 1];
    }
    for (const s of starts) {
      labels[s.col] = names[s.month];
    }
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
