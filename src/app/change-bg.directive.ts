import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appChangeBg]'
})
export class ChangeBgDirective {

  @Input() isCorrect : Boolean = false;
  @Input() question : any;
  @Input() selectedIndex : any;
  @Input() isQuestionAnswered : Boolean = false;
  constructor(private el : ElementRef, private render : Renderer2) { }

  @HostListener('click') answer(){
    if(this.isQuestionAnswered) return;

    if(this.isCorrect){
      // format the correct answer with green bg
      this.render.setStyle(this.el.nativeElement, 'background', 'green')
      this.render.setStyle(this.el.nativeElement, 'color', '#fff')
      this.render.setStyle(this.el.nativeElement, 'border', '2px solid grey')
    }else{
      // format the wrong answer with red bg
      this.render.setStyle(this.el.nativeElement, 'background', 'red')
      this.render.setStyle(this.el.nativeElement, 'color', '#fff')
      this.render.setStyle(this.el.nativeElement, 'border', '2px solid grey')

      // also display the correct answer to the user
      // find index of correct answer
      const answerIndex = this.question.options.findIndex((opt: { correct: boolean; }) => opt.correct === true);

      // get element of correct answer
      const answerElement = this.el.nativeElement.parentElement.parentElement.parentElement.children[answerIndex].querySelector("div");

      // format that element with green bg
      this.render.setStyle(answerElement, 'background', 'green')
      this.render.setStyle(answerElement, 'color', '#fff')
      this.render.setStyle(answerElement, 'border', '2px solid grey')
    }
  }
}
