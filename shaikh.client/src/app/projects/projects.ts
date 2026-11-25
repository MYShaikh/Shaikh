import { Component } from '@angular/core';

interface Project {
  title: string;
  meta?: string;      // event or date, when known
  summary: string;
  tools: string[];
  devpost: string;
  github?: string;
  demo?: string;
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
export class ProjectsComponent {
  readonly devpostProfile = 'https://devpost.com/myshaikh237';
  readonly githubProfile = 'https://github.com/MYShaikh';

  // All text is saved here, copied once from the public Devpost pages and
  // shortened. Nothing is fetched from Devpost while visitors browse.
  readonly projects: Project[] = [
    {
      title: 'Memo',
      meta: 'AI check-ins for dementia care · Oct 2026',
      summary:
        'A helper that calls a parent\'s kitchen iPad at drink, meal and pill times, sees whether they drank or took their pills, ' +
        'and tells their family live. If the answer is no, the family gets her exact words and three choices. ' +
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
        'Smart glasses for people who are visually impaired or have face blindness. They recognise a face in real time and speak the ' +
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
        'A sleep companion for people with insomnia or anxiety, built around a sleeping cat named Luma. It combines behaviour tools, ' +
        'emotional support, calming sounds, health reminders and community accountability in one app, instead of just one of them.',
      tools: ['React', 'Gemini', 'Claude', 'ElevenLabs', 'Figma'],
      devpost: 'https://devpost.com/software/good-night',
      github: 'https://github.com/debosmita09/Good-Night',
      demo: 'https://dash-cider-39465868.figma.site/',
      video: 'https://www.youtube.com/watch?v=Lp9T0rcODR4',
      image: 'images/projects/good-night.jpg',
      imageAlt: 'Good Night: the sleep companion app with Luma the cat',
    },
    {
      title: 'Whispering Witches',
      meta: 'UGAHacks 2026',
      summary:
        'A 3D battle-royale-style game where a witch restores a destroyed world by defeating goblins with spells from her Grimoire. ' +
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
        'Reads printed and handwritten prescriptions and explains the dose, side effects and risks, and can translate them. ' +
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
      summary:
        'A one-stop code interpreter for students and teams. Highlight any part of your code and it explains that exact section, ' +
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
