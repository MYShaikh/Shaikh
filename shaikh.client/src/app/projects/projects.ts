import { Component, ElementRef, HostListener, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../i18n/language.service';

type PopupState = 'open' | 'closing' | 'docked';

interface ProjectText {
  meta?: string;      // event or date, when known
  summary: string;    // always shown: one short sentence
  more?: string;      // shown only after "Read more"
  imageAlt: string;
}

interface Project extends ProjectText {
  title: string;
  es: ProjectText;    // Spanish version of the text
  tools: string[];
  devpost: string;
  github?: string;
  video: string;      // YouTube demo video
  image: string;      // cover image, saved in public/images/projects
}

@Component({
  selector: 'app-projects',
  standalone: false,
  styleUrl: './projects.css',
  templateUrl: './projects.html',
})
export class ProjectsComponent {
  readonly i18n = inject(LanguageService);
  private readonly injector = inject(Injector);
  readonly devpostProfile = 'https://devpost.com/myshaikh237';
  readonly githubProfile = 'https://github.com/MYShaikh';

  @ViewChild('ppSelect') private ppSelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('ppTab') private ppTab?: ElementRef<HTMLButtonElement>;

  /** The project's text in the visitor's language. */
  text(p: Project): ProjectText {
    return this.i18n.lang() === 'es' ? p.es : p;
  }

  // ---- "Private projects" popup -------------------------------------------
  // Only the names are shown. Details are shared by email, on request.
  // `value` (English) is what goes in the email subject; `es` is what Spanish readers see.
  readonly contactEmail = 'myshaikh237@gmail.com';
  readonly privateProjects = [
    { value: 'Microsoft Imagine Cup Project', es: 'Proyecto de Microsoft Imagine Cup' },
    { value: 'Photogrammetry Drone', es: 'Dron de fotogrametría' },
    { value: 'Trapic Mobile App', es: 'App móvil Trapic' },
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

  // The popup never opens by itself: it stays as a small tab on the side,
  // and opens only when a visitor clicks that tab.

  closePopup(): void {
    if (this.popupState() !== 'open') { return; }
    this.popupState.set('closing');                       // plays the slide-to-the-side animation
    setTimeout(() => {
      this.popupState.set('docked');                       // then leaves just the side tab
      afterNextRender(() => this.ppTab?.nativeElement.focus(), { injector: this.injector }); // focus back to the tab
    }, 500);
  }

  openPopup(): void {
    this.popupState.set('open');
    afterNextRender(() => this.ppSelect?.nativeElement.focus(), { injector: this.injector }); // focus into the popup
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
      meta: 'Emory Hacks 2026 Fall',
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
      es: {
        meta: 'Emory Hacks 2026 (otoño)',
        summary: 'Un asistente que llama al iPad de la cocina de un padre o una madre a la hora de beber, comer y tomar sus pastillas, comprueba si lo hizo y avisa a la familia en tiempo real.',
        more: 'Si la respuesta es no, la familia recibe sus palabras exactas y tres opciones. Me encargué de la vista semanal, la página de privacidad, el informe para el médico y la CI, y dirigí las pruebas de accesibilidad (0 errores en 59 análisis con axe-core).',
        imageAlt: 'Memo: captura de la pantalla de seguimiento familiar',
      },
    },
    {
      title: 'FaceScan',
      meta: 'Georgia State University Hacklanta 2026 Spring',
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
      es: {
        meta: 'Georgia State University Hacklanta 2026 (primavera)',
        summary: 'Gafas inteligentes para personas con discapacidad visual o ceguera facial.',
        more: 'Reconocen un rostro en tiempo real y dicen en voz alta el nombre de la persona, además de cuándo y dónde se vieron por última vez. Las caras nuevas se nombran por voz y se recuerdan entre sesiones.',
        imageAlt: 'FaceScan: prototipo de gafas inteligentes',
      },
    },
    {
      title: 'Good Night',
      meta: '2026 Spring',
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
      es: {
        meta: '2026 (primavera)',
        summary: 'Una app de compañía para dormir, pensada para personas con insomnio o ansiedad, con una gata dormida llamada Luma.',
        more: 'Reúne en una sola app herramientas de conducta, apoyo emocional, sonidos relajantes, recordatorios de salud y compromiso con la comunidad, en lugar de solo una de esas cosas.',
        imageAlt: 'Good Night: la app para dormir con la gata Luma',
      },
    },
    {
      title: 'Whispering Witches',
      meta: 'UGAHacks 2026 Spring',
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
      es: {
        meta: 'UGAHacks 2026 (primavera)',
        summary: 'Un juego en 3D al estilo battle royale en el que una bruja restaura un mundo destruido venciendo a duendes con hechizos de su grimorio.',
        more: 'Tiene personajes con los que puedes hablar, impulsados por modelos de lenguaje, y enemigos con IA NavMesh, en un mundo en ruinas que anima a pensar en la sostenibilidad.',
        imageAlt: 'Whispering Witches: captura del juego',
      },
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
      es: {
        meta: 'Emory Hacks 2025 (otoño) · en solitario',
        summary: 'Lee recetas impresas y escritas a mano, explica la dosis, los efectos secundarios y los riesgos, y puede traducirlas.',
        more: 'Lo creé después de ver a una farmacéutica explicar lo mismo una y otra vez, para ahorrarles tiempo a los farmacéuticos.',
        imageAlt: 'MedScan: captura del lector de recetas',
      },
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
      es: {
        meta: 'Emory Hacks 2024 (otoño)',
        summary: 'Un intérprete de código todo en uno para estudiantes y equipos.',
        more: 'Selecciona cualquier parte de tu código y te explica exactamente esa sección, con visualizaciones y árboles binarios, para que no tengas que buscar entre enlaces y pestañas para entender el código de otra persona.',
        imageAlt: 'ParserPro: miniatura del video de demostración',
      },
    },
  ];
}
