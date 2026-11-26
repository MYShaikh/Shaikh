import { Component, OnInit, computed, signal } from '@angular/core';

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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-home',
  standalone: false,
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly githubProfile = 'https://github.com/MYShaikh';

  // Hover text for the "strongest suits" cards
  readonly suitText = {
    django: '90% of my projects are made with Django',
    unity: 'Learning Unity since my first year of college! Know it better than the back of my hand',
    claude: 'Did 3 certifications, know all the extensions, skills and hooks!',
    dotnet: 'This website was made with .NET framework',
  };

  // GitHub contributions for the last 6 months (signals: this app runs without zone.js)
  readonly contributions = signal<Contributions | null>(null);
  readonly contributionsFailed = signal(false);

  // One label per week column: the month name where a new month starts, otherwise ''.
  readonly monthLabels = computed(() => {
    const weeks = this.contributions()?.weeks ?? [];
    const labels: string[] = [];
    let lastMonth = -1;
    let lastLabelAt = -10;
    weeks.forEach((week, i) => {
      const month = Number(week[0].date.slice(5, 7)) - 1;
      // Skip a label that would sit right on top of the previous one
      if (month !== lastMonth && i - lastLabelAt >= 3) {
        labels.push(MONTHS[month]);
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
    const n = day.count === 0 ? 'No' : day.count;
    return `${n} contribution${day.count === 1 ? '' : 's'} on ${day.date}`;
  }
}
