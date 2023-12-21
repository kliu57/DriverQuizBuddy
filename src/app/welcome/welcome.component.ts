import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  @ViewChild('name') nameKey!: ElementRef;
  constructor(private router: Router) { }

  navigate(quizName:string) {
    // Store user's name
    // localStorage.setItem("name",this.nameKey.nativeElement.value)

    // Pass quiz name to question component
    let navigationExtras: NavigationExtras = {
      queryParams: {
          quiz: quizName
      }
    }
    // Navigate to question component
    this.router.navigate(['question'], navigationExtras);
  }
  
  ngOnInit(): void{

  }

}
