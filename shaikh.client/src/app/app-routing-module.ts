import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact';
import { CurrentPositionComponent } from './current-position/current-position';
import { EducationComponent } from './education/education';
import { HomeComponent } from './home/home';
import { ProjectsComponent } from './projects/projects';
import { SkillsComponent } from './skills/skills';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'work-experience', component: CurrentPositionComponent },
  { path: 'current-position', redirectTo: 'work-experience', pathMatch: 'full' },  // old address still works
  { path: 'education', component: EducationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'skills', component: SkillsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
