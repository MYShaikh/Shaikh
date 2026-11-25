import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class HomeComponent {
  showPopup = true;

  // Text shown when hovering each "Current Focus" card. Saved here so it appears
  // instantly (nothing is fetched). Mostly adapted from Wikipedia (CC BY-SA 4.0);
  // the Copilot Studio one was written by hand.
  readonly focusText = {
    angular:
      'Angular is a TypeScript-based free and open-source single-page web application framework. ' +
      'It is developed by Google and by a community of individuals and corporations.',
    dotnet:
      'ASP.NET Core is an open-source modular web-application framework. ' +
      'Blazor is a free and open-source web framework that enables developers to create web user interfaces (UI) based on components, using C# and HTML.',
    copilot:
      'Microsoft Copilot Studio is a low-code platform from Microsoft for building custom AI agents and chatbots. ' +
      'It lets you connect them to business data, apps and workflows without writing much code.',
    docker:
      'Docker is a set of products that uses operating system-level virtualization to deliver software in packages called containers. ' +
      'Linux is a family of free and open-source software Unix-like operating systems based on the Linux kernel.',
  };

  ngOnInit() {
    const roleSelected = sessionStorage.getItem('visitorRole');
    if (roleSelected) {
      this.showPopup = false;
    }
  }


  selectRole(role: string)
  {
    sessionStorage.setItem('visitorRole', role);
    const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch('/api/viewers/role', {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visitorType: role,
        timeZone: timezone
      })
    });
    this.showPopup = false;
  }
}
