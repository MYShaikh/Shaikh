import { Component, HostListener, OnInit, computed, signal } from '@angular/core';

type PopupState = 'open' | 'closing' | 'docked';

interface Project {
  title: string;
  meta?: string;      // event or date, when known
  summary: string;    // always shown: one short sentence
  more?: string;      // shown only after "Read more"
  tools: string[];
  devpost: string;
  github?: string;
  video: string;      // YouTube demo video
  image: string;      // cover image, saved in public/images/projects
  imageAlt: string;
}

@Component({
  selector: 'app-projects',
  standalone: false,
  styleUrl: './projects.css',
  templateUrl: './projects.html',
})
export class ProjectsComponent implements OnInit {
  readonly devpostProfile = 'https://devpost.com/myshaikh237';
  readonly githubProfile = 'https://github.com/MYShaikh';

  // ---- "Private projects" popup -------------------------------------------
  // Only the names are shown. Details are shared by email, on request.
  readonly contactEmail = 'myshaikh237@gmail.com';
  readonly privateProjects = [
    'Microsoft Imagine Cup Project',
    'Photogrammetry Drone',
    'Trapic Mobile App',
  ];

  // 'open' = popup showing, 'closing' = sliding to the side, 'docked' = small tab on the side.
  // Signals are used because this app runs without zone.js.
  readonly popupState = signal<PopupState>('docked');
  readonly selectedProject = signal('');

  // Opens a Gmail compose window addressed to me, with the project as the subject.
  readonly gmailLink = computed(() =>
    'https://mail.google.com/mail/?view=cm&fs=1' +
    '&to=' + encodeURIComponent(this.contactEmail) +
    '&su=' + encodeURIComponent(this.selectedProject())
  );

  // Fallback for visitors who don't use Gmail: opens their default mail app.
  readonly mailtoLink = computed(() =>
    'mailto:' + this.contactEmail + '?subject=' + encodeURIComponent(this.selectedProject())
  );

  ngOnInit(): void {
    // The popup opens by itself once per browser session. After that it stays
    // as a small tab on the side that visitors can click to open it again.
    if (!sessionStorage.getItem('privateProjectsPopupSeen')) {
      sessionStorage.setItem('privateProjectsPopupSeen', 'true');
      this.popupState.set('open');
    } else {
      this.popupState.set('docked');
    }
  }

  closePopup(): void {
    if (this.popupState() !== 'open') { return; }
    this.popupState.set('closing');                       // plays the slide-to-the-side animation
    setTimeout(() => this.popupState.set('docked'), 500); // then leaves just the side tab
  }

  openPopup(): void {
    this.popupState.set('open');
  }

  chooseProject(name: string): void {
    this.selectedProject.set(name);
  }

  // ---- "Read more" on each project card -----------------------------------
  readonly expanded = signal<ReadonlySet<string>>(new Set());

  isExpanded(title: string): boolean {
    return this.expanded().has(title);
  }

  toggleMore(title: string): void {
    const next = new Set(this.expanded());
    if (next.has(title)) { next.delete(title); } else { next.add(title); }
    this.expanded.set(next);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePopup();
  }

  // All text is saved here, copied once from the public Devpost pages and
  // shortened. Nothing is fetched from Devpost while visitors browse.
  readonly projects: Project[] = [
    {
      title: 'Memo',
      meta: 'AI check-ins for dementia care · Oct 2026',
      summary:
        'A helper that calls a parent\'s kitchen iPad at drink, meal and pill times, sees whether they drank or took their pills, ' +
        'and tells their family live.',
      more:
        'If the answer is no, the family gets her exact words and three choices. ' +
        'I owned the week view, privacy page, doctor printout and CI, and led accessibility testing (0 violations in 59 axe-core scans).',
      tools: ['Gemini Live', 'LiveKit', 'FastAPI', 'Next.js', 'TypeScript', 'Docker', 'axe-core'],
      devpost: 'https://devpost.com/software/granny-o0vfrj',
      github: 'https://github.com/Davila-bit/memo',
      video: 'https://www.youtube.com/watch?v=Lc1gbXqbDP4',
      image: 'images/projects/memo.jpg',
      imageAlt: 'Memo: screenshot of the family check-in screen',
    },
    {
      title: 'FaceScan',
      meta: 'Smart glasses face recognition · Mar 2026',
      summary:
        'Smart glasses for people who are visually impaired or have face blindness.',
      more:
        'They recognise a face in real time and speak the ' +
        'person\'s name along with when and where you last met. New faces are named by voice and remembered across sessions.',
      tools: ['Python', 'OpenCV', 'AWS Rekognition', 'ElevenLabs', 'Raspberry Pi 5'],
      devpost: 'https://devpost.com/software/facescan',
      github: 'https://github.com/MYShaikh/FaceScan',
      video: 'https://www.youtube.com/watch?v=9hbFyD95ylU',
      image: 'images/projects/facescan.jpg',
      imageAlt: 'FaceScan: smart glasses prototype',
    },
    {
      title: 'Good Night',
      summary:
        'A sleep companion for people with insomnia or anxiety, built around a sleeping cat named Luma.',
      more:
        'It combines behaviour tools, ' +
        'emotional support, calming sounds, health reminders and community accountability in one app, instead of just one of them.',
      tools: ['React', 'Gemini', 'Claude', 'ElevenLabs', 'Figma'],
      devpost: 'https://devpost.com/software/good-night',
      github: 'https://github.com/debosmita09/Good-Night',
      video: 'https://www.youtube.com/watch?v=Lp9T0rcODR4',
      image: 'images/projects/good-night.jpg',
      imageAlt: 'Good Night: the sleep companion app with Luma the cat',
    },
    {
      title: 'Whispering Witches',
      meta: 'UGAHacks 2026',
      summary:
        'A 3D battle-royale-style game where a witch restores a destroyed world by defeating goblins with spells from her Grimoire.',
      more:
        'It uses LLM-driven characters you can talk to, plus NavMesh AI enemies, and is set in a ruined world to nudge players toward sustainability.',
      tools: ['C#', 'Unity', 'Gemini API', 'ElevenLabs', 'Blender', 'Mixamo'],
      devpost: 'https://devpost.com/software/whispering-witches',
      github: 'https://github.com/debosmita09/UGAHacks2026_whispering_witches',
      video: 'https://www.youtube.com/watch?v=bBjMmqgKy3M',
      image: 'images/projects/whispering-witches.jpg',
      imageAlt: 'Whispering Witches: screenshot of the game',
    },
    {
      title: 'MedScan',
      meta: 'Emory Hacks 2025 Fall · solo',
      summary:
        'Reads printed and handwritten prescriptions and explains the dose, side effects and risks, and can translate them.',
      more:
        'I built it after watching a pharmacist spend her time explaining the same things over and over, to save pharmacists time.',
      tools: ['Python', 'Django', 'Amazon Textract', 'Tesseract OCR'],
      devpost: 'https://devpost.com/software/medscan-7y0tze',
      github: 'https://github.com/MYShaikh/MedScan-',
      video: 'https://www.youtube.com/watch?v=spDsU8J_9xs',
      image: 'images/projects/medscan.jpg',
      imageAlt: 'MedScan: screenshot of the prescription scanner',
    },
    {
      title: 'ParserPro',
      meta: 'Emory Hacks 2024 Fall',
      summary:
        'A one-stop code interpreter for students and teams.',
      more:
        'Highlight any part of your code and it explains that exact section, ' +
        'with visualizations and binary trees, so you don\'t have to hunt through links and tabs to understand someone else\'s code.',
      tools: ['JavaScript', 'HTML', 'CSS', 'Groq'],
      devpost: 'https://devpost.com/software/parserpro',
      github: 'https://github.com/Carson-Lam/ParserPro',
      video: 'https://www.youtube.com/watch?v=VtjUT1SeZrQ',
      image: 'images/projects/parserpro.jpg',
      imageAlt: 'ParserPro: thumbnail of the demo video',
    },
  ];
}
