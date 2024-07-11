import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GtagModule } from 'angular-gtag';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { HeaderComponent } from './header/header.component';
import { QuestionComponent } from './question/question.component';
import { HttpClientModule } from '@angular/common/http';
import { ChangeBgDirective } from './change-bg.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { ShareComponent } from './share/share.component';
import { AboutusComponent } from './aboutus/aboutus.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    HeaderComponent,
    QuestionComponent,
    ChangeBgDirective,
    SidenavListComponent,
    ShareComponent,
    AboutusComponent,
  ],
  imports: [
    BrowserModule,
    GtagModule.forRoot({ trackingId: 'G-3ZF3DQD885', trackPageviews: true }),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
