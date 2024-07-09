import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { interval } from 'rxjs';
import { ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent {
  public name : string="";
  public quizName : string="";
  public questionList : any = [];
  public currentQuestion : number = 0;
  public points : number = 0;
  counter = 30;
  correctAnswer : number = 0;
  incorrectAnswer : number = 0;
  interval$ : any;
  progress : string = "0";
  isQuizCompleted : boolean = false;
  isQuestionAnswered : boolean = false;

  constructor(private questionService : QuestionService, private el : ElementRef, private render : Renderer2, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
        this.quizName = params['quiz'];
    });
  }

  ngOnInit(): void {
    this.name =  localStorage.getItem("name")!;
    this.getAllQuestions();
    this.startCounter();
  }

  getAllQuestions(){
    if (this.quizName === "Road Signs") {
      this.questionService.getSignQuestionsJson()
      .subscribe(res=>{
        this.questionList = res.questions;
        this.questionList.forEach((question: any) => this.shuffleOptions(question.options));
      })
    } else {
      this.questionService.getRuleQuestionsJson()
      .subscribe(res=>{
        this.questionList = res.questions;
        this.questionList.forEach((question: any) => this.shuffleOptions(question.options));
      })
    }
  }

  shuffleOptions(options: any[]): void {
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
  }

  nextQuestion(){
    this.currentQuestion++;

    if(this.currentQuestion === this.questionList.length){
      this.isQuizCompleted = true;
      this.stopCounter();
      this.getProgressPercent();
    } else {
      this.isQuestionAnswered = false;
      this.resetCounter();
      this.getProgressPercent();
    }
  }

  previousQuestion(){
    this.currentQuestion--;
  }

  answer(currentQno:number, option:any, index:number){
    if(option.correct){
      this.points++;
      this.correctAnswer++;
    } else {
      this.incorrectAnswer++;
    }

    this.stopCounter();
    this.isQuestionAnswered = true;

    // disable all the options

    // get index of correct answer
    const answerIndex = this.questionList[this.currentQuestion].options.findIndex((opt: { correct: boolean; }) => opt.correct === true);

    // get element of correct answer
    const answerElement = this.el.nativeElement.querySelector('.options').children[answerIndex].querySelector("div");

    // format that element with green bg
    this.render.setStyle(answerElement, 'background', 'green')
    this.render.setStyle(answerElement, 'color', '#fff')
    this.render.setStyle(answerElement, 'border', '2px solid grey')
  }

  startCounter(){
    this.interval$ = interval(1000)
    .subscribe(val=>{
      this.counter--;
      if(this.counter===0){

        this.interval$.unsubscribe();

        // time is up, show the correct answer
        this.isQuestionAnswered = true;

        // get index of correct answer
        const answerIndex = this.questionList[this.currentQuestion].options.findIndex((opt: { correct: boolean; }) => opt.correct === true);

        // get element of correct answer
        const answerElement = this.el.nativeElement.querySelector('.options').children[answerIndex].querySelector("div");

        // format that element with green bg
        this.render.setStyle(answerElement, 'background', 'green')
        this.render.setStyle(answerElement, 'color', '#fff')
        this.render.setStyle(answerElement, 'border', '2px solid grey')
      }
    });
    setTimeout(() => {
      this.interval$.unsubscribe();
    }, 100000);
  }

  stopCounter(){
    this.interval$.unsubscribe();
  }

  resetCounter(){
    this.stopCounter();
    this.counter=30;
    this.startCounter();
  }

  resetQuiz(){
    this.resetCounter();
    this.getAllQuestions();
    this.points=0;
    this.currentQuestion=0;
    this.progress="0";
  }

  getProgressPercent(){
    this.progress = ((this.currentQuestion/this.questionList.length)*100).toString();
    return this.progress;
  }
}
