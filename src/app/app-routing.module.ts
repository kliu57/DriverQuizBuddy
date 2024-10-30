import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionComponent } from './question/question.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TvoIlcComponent } from './tvo-ilc/tvo-ilc.component';
import { ShareComponent } from './share/share.component';
import { AboutusComponent } from './aboutus/aboutus.component';

const routes: Routes = [
  {path:'', redirectTo:'welcome', pathMatch:"full"},
  {path:"welcome", component:WelcomeComponent},
  {path:"tvo-ilc", component:TvoIlcComponent},
  {path:"question", component:QuestionComponent},
  {path:"share", component:ShareComponent},
  {path:"aboutus", component:AboutusComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
