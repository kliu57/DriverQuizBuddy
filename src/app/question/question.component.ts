import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { interval } from 'rxjs';
import { ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

declare global {
  interface Window {
    MathJax: any;
  }
}

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent {
  public name: string = '';
  public quizName: string = '';
  public questionList: any = [];
  public currentQuestion: number = 0;
  public points: number = 0;
  counter = 30;
  correctAnswer: number = 0;
  incorrectAnswer: number = 0;
  interval$: any;
  progress: string = '0';
  isQuizCompleted: boolean = false;
  isQuestionAnswered: boolean = false;

  // Properties for text input mode
  isExactMatch: boolean = false;
  userAnswer = new FormControl('');
  feedback: string = '';
  isCorrect: boolean = false;

  constructor(
    private questionService: QuestionService,
    private el: ElementRef,
    private render: Renderer2,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.quizName = params['quiz'];
      this.isExactMatch = this.quizName === 'MHF4U Formulas';
    });
  }

  renderMath() {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.()?.catch((err: any) =>
        console.log('MathJax error:', err)
      );
    }
  }

  ngOnInit(): void {
    this.name = localStorage.getItem('name')!;
    this.getAllQuestions();
    this.startCounter();
    setTimeout(() => {
      this.renderMath();
    }, 1000);
  }

  ngAfterViewInit() {
    this.renderMath();
  }

  getAllQuestions() {
    if (this.quizName === 'Road Signs') {
      this.questionService.getSignQuestionsJson().subscribe((res) => {
        this.questionList = res.questions;
        this.questionList.forEach((question: any) =>
          this.shuffleOptions(question.options)
        );
      });
    } else if (this.quizName === 'Rules of the Road') {
      this.questionService.getRuleQuestionsJson().subscribe((res) => {
        this.questionList = res.questions;
        this.questionList.forEach((question: any) =>
          this.shuffleOptions(question.options)
        );
      });
    } else if (this.quizName === 'MHF4U Formulas') {
      this.questionService.getMHF4UFormulasQuestionsJson().subscribe((res) => {
        this.questionList = res.questions;
        if (!this.isExactMatch) {
          this.questionList.forEach((question: any) =>
            this.shuffleOptions(question.options)
          );
        }
      });
    } else {
      this.questionService.getMotorQuestionsJson().subscribe((res) => {
        this.questionList = res.questions;
        this.questionList.forEach((question: any) =>
          this.shuffleOptions(question.options)
        );
      });
    }
  }

  shuffleOptions(options: any[]): void {
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
  }

  submitTextAnswer() {
    if (this.isQuestionAnswered) return;

    const currentQ = this.questionList[this.currentQuestion];
    // Get all option texts in lowercase for comparison
    const possibleAnswers = currentQ.options.map((opt: any) =>
      opt.text.toLowerCase().trim()
    );
    const userText = this.userAnswer.value?.toLowerCase().trim() || '';
    // Get the "correct" answer for feedback purposes
    const correctOption = currentQ.options.find((opt: any) => opt.correct);

    this.isQuestionAnswered = true;

    // Check if user's answer matches any of the possible answers
    if (possibleAnswers.includes(userText)) {
      this.points++;
      this.correctAnswer++;
      this.feedback = 'Correct!';
      this.isCorrect = true;
    } else {
      this.incorrectAnswer++;
      // Only show the official correct answer in feedback
      this.feedback = `Incorrect. The correct answer is: ${correctOption.text}`;
      this.isCorrect = false;
    }

    this.stopCounter();
  }

  nextQuestion() {
    this.currentQuestion++;

    if (this.currentQuestion === this.questionList.length) {
      this.isQuizCompleted = true;
      this.stopCounter();
    } else {
      this.isQuestionAnswered = false;

      if (this.isExactMatch) {
        this.userAnswer.setValue('');
        this.feedback = '';
        this.isCorrect = false;
      }

      this.resetCounter();
      setTimeout(() => this.renderMath(), 100);
    }
    this.getProgressPercent();
  }

  previousQuestion() {
    this.currentQuestion--;

    if (this.isExactMatch) {
      this.userAnswer.setValue('');
      this.feedback = '';
      this.isCorrect = false;
      this.isQuestionAnswered = false;
    }
    setTimeout(() => this.renderMath(), 100);
  }

  answer(currentQno: number, option: any, index: number) {
    if (this.isQuestionAnswered) return;

    if (option.correct) {
      this.points++;
      this.correctAnswer++;
    } else {
      this.incorrectAnswer++;
    }

    this.stopCounter();
    this.isQuestionAnswered = true;

    // disable all the options

    // get index of correct answer
    const answerIndex = this.questionList[
      this.currentQuestion
    ].options.findIndex((opt: { correct: boolean }) => opt.correct === true);

    // get element of correct answer
    const answerElement = this.el.nativeElement
      .querySelector('.options')
      .children[answerIndex].querySelector('div');

    // format that element with green bg
    this.render.setStyle(answerElement, 'background', 'green');
    this.render.setStyle(answerElement, 'color', '#fff');
    this.render.setStyle(answerElement, 'border', '2px solid grey');
  }

  startCounter() {
    this.interval$ = interval(1000).subscribe((val) => {
      this.counter--;
      if (this.counter === 0) {
        this.interval$.unsubscribe();

        // time is up, show the correct answer
        this.isQuestionAnswered = true;

        if (this.isExactMatch) {
          const correctOption = this.questionList[
            this.currentQuestion
          ].options.find((opt: any) => opt.correct);
          this.feedback = `Time's up! The correct answer is: ${correctOption.text}`;
          this.incorrectAnswer++;
        } else {
          // get index of correct answer
          const answerIndex = this.questionList[
            this.currentQuestion
          ].options.findIndex(
            (opt: { correct: boolean }) => opt.correct === true
          );

          // get element of correct answer
          const answerElement = this.el.nativeElement
            .querySelector('.options')
            .children[answerIndex].querySelector('div');

          // format that element with green bg
          this.render.setStyle(answerElement, 'background', 'green');
          this.render.setStyle(answerElement, 'color', '#fff');
          this.render.setStyle(answerElement, 'border', '2px solid grey');
        }
      }
    });
    setTimeout(() => {
      this.interval$.unsubscribe();
    }, 100000);
  }

  stopCounter() {
    this.interval$.unsubscribe();
  }

  resetCounter() {
    this.stopCounter();
    this.counter = 30;
    this.startCounter();
  }

  resetQuiz() {
    this.resetCounter();
    this.getAllQuestions();
    this.points = 0;
    this.currentQuestion = 0;
    this.progress = '0';

    this.isQuizCompleted = false;
    this.correctAnswer = 0;
    this.incorrectAnswer = 0;
    if (this.isExactMatch) {
      this.userAnswer.setValue('');
      this.feedback = '';
      this.isCorrect = false;
    }
    this.isQuestionAnswered = false;
  }

  getProgressPercent() {
    this.progress = (
      (this.currentQuestion / this.questionList.length) *
      100
    ).toString();
    return this.progress;
  }
}
