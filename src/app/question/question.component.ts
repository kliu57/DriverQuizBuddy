import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { QuestionService } from '../service/question.service';
import { interval } from 'rxjs';
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
  @ViewChild('answerInput') answerInput!: ElementRef;
  public name: string = '';
  public quizName: string = '';
  public logoUrl: string = '';
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

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    const focusedElement = document.activeElement;
    const isInTextField =
      focusedElement?.tagName === 'INPUT' ||
      focusedElement?.tagName === 'TEXTAREA';

    // If we're in the text field, only handle Enter key
    if (isInTextField) {
      if (event.key === 'Tab' && this.isExactMatch) {
        event.preventDefault();
        if (this.answerInput) {
          this.answerInput.nativeElement.focus();
        }
        return;
      }

      if (event.key === 'Enter') {
        if (document.activeElement?.hasAttribute('data-index')) {
          event.preventDefault();
          const index = parseInt(
            document.activeElement.getAttribute('data-index') || '0'
          );
          const option = this.questionList[this.currentQuestion].options[index];
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          this.handleAnswer(this.currentQuestion, option, index, clickEvent);
        } else {
          this.submitTextAnswer();
          (document.activeElement as HTMLElement).blur();
        }
      }
      return;
    }

    // Handle left/right navigation for all other cases
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.currentQuestion > 0) {
        this.previousQuestion();
      }
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.currentQuestion < this.questionList.length - 1) {
        this.nextQuestion();
      }
      return;
    }

    // Only handle up/down/enter if we're not in exact match mode and question isn't answered
    if (this.isExactMatch || this.isQuestionAnswered) return;

    const numOptions =
      this.questionList[this.currentQuestion]?.options?.length || 0;

    // Only handle option navigation if we're not focused on navigation buttons
    const isNavigationButton = focusedElement?.tagName === 'BUTTON';

    if (!isNavigationButton) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.selectedOptionIndex =
            (this.selectedOptionIndex - 1 + numOptions) % numOptions;
          this.focusOption(this.selectedOptionIndex);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.selectedOptionIndex =
            (this.selectedOptionIndex + 1) % numOptions;
          this.focusOption(this.selectedOptionIndex);
          break;
        case 'Enter':
          if (document.activeElement?.hasAttribute('data-index')) {
            event.preventDefault();
            const index = parseInt(
              document.activeElement.getAttribute('data-index') || '0'
            );
            const option =
              this.questionList[this.currentQuestion].options[index];
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            this.handleAnswer(this.currentQuestion, option, index, clickEvent);
          }
          break;
      }
    }
  }

  focusOption(index: number) {
    if (index >= 0) {
      setTimeout(() => {
        const element = document.querySelector(
          `[data-index="${index}"]`
        ) as HTMLElement;
        if (element) {
          element.focus();
        }
      });
    }
  }

  handleAnswer(currentQno: number, option: any, index: number, event: Event) {
    if (this.isQuestionAnswered) return;
    if (!event || !event.target) return;

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
    if (!this.questionList[this.currentQuestion]?.needPreview) {
      this.formattedMathAnswer = '';
      return;
    }

    let formattedInput = '`' + input + '`';
    const mathHtml = `<div class="math-preview">${formattedInput}</div>`;
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
        this.logoUrl = res.logo;
        this.questionList = res.questions;
        this.questionList.forEach((question: any) =>
          this.shuffleOptions(question.options)
        );
      });
    } else if (this.quizName === 'Rules of the Road') {
      this.questionService.getRuleQuestionsJson().subscribe((res) => {
        this.logoUrl = res.logo;
        this.questionList = res.questions;
        this.questionList.forEach((question: any) =>
          this.shuffleOptions(question.options)
        );
      });
    } else if (this.quizName === 'MHF4U Formulas') {
      this.questionService.getMHF4UFormulasQuestionsJson().subscribe((res) => {
        this.logoUrl = res.logo;
        this.questionList = res.questions;
        if (!this.isExactMatch) {
          this.questionList.forEach((question: any) =>
            this.shuffleOptions(question.options)
          );
        }
      });
    } else {
      this.questionService.getMotorQuestionsJson().subscribe((res) => {
        this.logoUrl = res.logo;
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

    // Normalize answers by removing backticks for comparison purposes only
    const possibleAnswers = currentQ.options.map((opt: any) =>
      opt.text.replace(/`/g, '').toLowerCase().trim()
    );
    const userText = (this.userAnswer.value || '')
      .replace(/`/g, '')
      .toLowerCase()
      .trim();

    const correctOption = currentQ.options.find((opt: any) => opt.correct);
    this.isQuestionAnswered = true;

    if (possibleAnswers.includes(userText)) {
      this.points++;
      this.correctAnswer++;
      this.feedback = 'Correct!';
      this.isCorrect = true;
    } else {
      this.incorrectAnswer++;
      this.feedback = `Answer:&nbsp; ${correctOption.text}`;
      this.isCorrect = false;
    }

    this.stopCounter();

    setTimeout(() => {
      this.renderMath();
    }, 100);
  }

  nextQuestion() {
    this.currentQuestion++;
    this.feedback = '';

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
      (document.activeElement as HTMLElement)?.blur();

      setTimeout(() => {
        this.renderMath();
        this.selectedOptionIndex = -1;
      }, 100);
    }
    this.getProgressPercent();
  }

  previousQuestion() {
    this.currentQuestion--;

    if (this.isExactMatch) {
      this.userAnswer.setValue('');
      this.isCorrect = false;
    }

    this.feedback = '';
    this.isQuestionAnswered = false;
    (document.activeElement as HTMLElement).blur();

    setTimeout(() => {
      this.renderMath();
      this.selectedOptionIndex = -1;
    }, 100);
    this.getProgressPercent();
  }

  answer(currentQno: number, option: any, index: number, event: any) {
    if (this.isQuestionAnswered) return;

    if (option.correct) {
      this.points++;
      this.correctAnswer++;
      this.styleOption(event.target, true);
      this.feedback = '';
    } else {
      this.incorrectAnswer++;
      this.styleOption(event.target, false);

      const correctIndex = this.questionList[currentQno].options.findIndex(
        (opt: { correct: boolean }) => opt.correct === true
      );
      const correctElement = this.el.nativeElement
        .querySelector('.options')
        .children[correctIndex].querySelector('div');
      this.styleOption(correctElement, true);

      if (this.questionList[currentQno].info) {
        this.feedback = this.questionList[currentQno].info;
      } else {
        this.feedback = '';
      }
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
  }

  private styleOption(element: HTMLElement, isCorrect: boolean) {
    this.render.setStyle(element, 'padding', '9px');

    if (isCorrect) {
      this.render.setStyle(element, 'background', '#008f00');
      this.render.setStyle(element, 'color', '#fff');
    } else {
      this.render.setStyle(element, 'background', '#cc0000');
      this.render.setStyle(element, 'color', '#fff');
    }
    this.render.setStyle(element, 'border', '2px solid grey');
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
          this.feedback = `Time's up! Answer:&nbsp; \`${correctOption.text}\``;
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

  resetQuestion() {
    this.isQuestionAnswered = false;
    this.feedback = '';
    this.isCorrect = false;
    this.selectedOptionIndex = -1;

    if (this.isExactMatch) {
      this.userAnswer.setValue('');
      this.formattedMathAnswer = '';
    } else {
      const optionElements =
        this.el.nativeElement.querySelectorAll('.options .card');
      optionElements.forEach((element: HTMLElement) => {
        this.render.removeStyle(element, 'background');
        this.render.removeStyle(element, 'color');
        this.render.removeStyle(element, 'border');
        this.render.setStyle(element, 'padding', '10px');
      });

      this.shuffleOptions(this.questionList[this.currentQuestion].options);
    }

    if (this.useTimer) {
      this.resetCounter();
    }

    (document.activeElement as HTMLElement).blur();

    setTimeout(() => {
      this.renderMath();
    }, 100);
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
