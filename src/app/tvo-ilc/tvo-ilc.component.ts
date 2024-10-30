import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-tvo-ilc',
  templateUrl: './tvo-ilc.component.html',
  styleUrl: './tvo-ilc.component.scss',
})
export class TvoIlcComponent {
  @ViewChild('name') nameKey!: ElementRef;
  constructor(private router: Router) {}

  navigate(quizName: string) {
    // Store user's name
    // localStorage.setItem("name",this.nameKey.nativeElement.value)

    // Pass quiz name to question component
    let navigationExtras: NavigationExtras = {
      queryParams: {
        quiz: quizName,
      },
    };
    // Navigate to question component
    this.router.navigate(['question'], navigationExtras);
  }

  ngOnInit(): void {}
}
