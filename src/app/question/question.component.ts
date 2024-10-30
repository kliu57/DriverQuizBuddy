import { Component, OnInit, HostListener } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { interval } from 'rxjs';
import { ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  useTimer: boolean = true;
  isExactMatch: boolean = false;
  userAnswer = new FormControl('');
  feedback: string = '';
  isCorrect: boolean = false;
  formattedMathAnswer: SafeHtml = '';
  selectedOptionIndex: number = 0;

  // Handle keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (this.isExactMatch || this.isQuestionAnswered) return;

    const numOptions =
      this.questionList[this.currentQuestion]?.options?.length || 0;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.selectedOptionIndex =
          (this.selectedOptionIndex - 1 + numOptions) % numOptions;
        this.focusOption(this.selectedOptionIndex);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % numOptions;
        this.focusOption(this.selectedOptionIndex);
        break;
    }
  }

  focusOption(index: number) {
    setTimeout(() => {
      const element = document.querySelector(
        `[data-index="${index}"]`
      ) as HTMLElement;
      if (element) {
        element.focus();
      }
    });
  }

  handleAnswer(currentQno: number, option: any, index: number, event: Event) {
    const element = event.target as HTMLElement;
    this.answer(currentQno, option, index, { target: element });
  }

  constructor(
    private questionService: QuestionService,
    private el: ElementRef,
    private render: Renderer2,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.route.queryParams.subscribe((params) => {
      this.quizName = params['quiz'];
      this.isExactMatch = this.quizName === 'MHF4U Formulas';
      this.useTimer = this.quizName !== 'MHF4U Formulas';
    });

    // Subscribe to user input changes
    this.userAnswer.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value) {
          this.formatMathAnswer(value);
        } else {
          this.formattedMathAnswer = '';
        }
      });
  }

  formatMathAnswer(input: string) {
    let formattedInput = input;

    // Convert \sqrt() to \sqrt{}
    formattedInput = formattedInput.replace(/\\sqrt\((.*?)\)/g, '\\sqrt{$1}');

    // Convert divisions to \frac
    formattedInput = formattedInput
      // First handle fully parenthesized expressions
      .replace(/\(([^()]*)\)\/\(([^()]*)\)/g, '\\frac{($1)}{($2)}')
      // Handle parenthesized numerator
      .replace(
        /\(([^()]*)\)\/([-]?[a-zA-Z0-9](\^[a-zA-Z0-9()]+)?)/g,
        '\\frac{($1)}{$2}'
      )
      // Handle parenthesized denominator
      .replace(
        /([-]?[a-zA-Z0-9](\^[a-zA-Z0-9()]+)?)\/\(([^()]*)\)/g,
        '\\frac{$1}{($3)}'
      )
      // Finally handle single terms on both sides (including optional negative signs and exponents)
      .replace(
        /([-]?[a-zA-Z0-9](\^[a-zA-Z0-9()]+)?)\/(-?[a-zA-Z0-9](\^[a-zA-Z0-9()]+)?)/g,
        '\\frac{$1}{$3}'
      );

    const mathHtml = `<div class="math-preview">\\(${formattedInput}\\)</div>`;
    this.formattedMathAnswer = this.sanitizer.bypassSecurityTrustHtml(mathHtml);

    setTimeout(() => {
      if (window.MathJax) {
        window.MathJax.typesetPromise?.([
          this.el.nativeElement.querySelector('.math-preview'),
        ]).catch((err: any) => console.log('MathJax error:', err));
      }
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

    setTimeout(() => {
      this.renderMath();
    }, 100);
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
    this.selectedOptionIndex = 0;
    this.focusOption(0);
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
    this.selectedOptionIndex = 0;
    this.focusOption(0);
  }

  answer(currentQno: number, option: any, index: number, event: any) {
    if (this.isQuestionAnswered) return;

    if (option.correct) {
      this.points++;
      this.correctAnswer++;
    } else {
      this.incorrectAnswer++;
    }

    this.stopCounter();
    this.isQuestionAnswered = true;

    setTimeout(() => {
      if (window.MathJax) {
        window.MathJax.typesetPromise?.().catch((err: any) =>
          console.log('MathJax error:', err)
        );
      }
    }, 100);

    // Get index of correct answer
    const answerIndex = this.questionList[
      this.currentQuestion
    ].options.findIndex((opt: { correct: boolean }) => opt.correct === true);

    // Get element of correct answer
    const answerElement = this.el.nativeElement
      .querySelector('.options')
      .children[answerIndex].querySelector('div');

    // Format that element with green bg
    this.render.setStyle(answerElement, 'background', 'green');
    this.render.setStyle(answerElement, 'color', '#fff');
    this.render.setStyle(answerElement, 'border', '2px solid grey');
  }

  startCounter() {
    if (!this.useTimer) return;

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

          setTimeout(() => this.renderMath(), 100);
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
    if (this.interval$) {
      this.interval$.unsubscribe();
    }
  }

  resetCounter() {
    if (!this.useTimer) return;
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
