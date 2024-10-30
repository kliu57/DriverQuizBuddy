import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

declare global {
  interface Window {
    MathJax: any;
  }
}

@Component({
  selector: 'app-tvo-ilc',
  templateUrl: './tvo-ilc.component.html',
  styleUrl: './tvo-ilc.component.scss',
})

export class TvoIlcComponent {
  @ViewChild('name') nameKey!: ElementRef;
  constructor(private router: Router) {}

  renderMath() {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.()?.catch((err: any) => console.log('MathJax error:', err));
    }
  }

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

  ngOnInit(): void {
    setTimeout(() => {
      this.renderMath();
    }, 1000);
  }

  ngAfterViewInit() {
    this.renderMath();
  }
}
