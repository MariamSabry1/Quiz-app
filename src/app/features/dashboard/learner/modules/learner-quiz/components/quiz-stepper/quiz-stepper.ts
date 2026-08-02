import { Component, computed, effect, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { QuestionAnswer } from '../../../../../instructor/modules/questions/interfaces/questions';
import { IQuestionsData, IQuizQuestion, IQuestionResponse } from '../../interfaces/exam';
import { ExamService } from '../../services/exam.service';
import { QuizProgressService, IQuizProgress } from '../../services/quiz-progress.service';
import { QuizHeader } from '../../../../../../../shared/components/dashboard/learner-quiz/quiz-header/quiz-header';
import { QuizSuccessDialog } from '../../../../../../../shared/components/dashboard/learner-quiz/quiz-success-dialog/quiz-success-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Loader } from "../../../../../../../shared/components/general/loader/loader";

@Component({
  selector: 'quiz-app-quiz-stepper',
  imports: [Button, StepperModule, QuizHeader, TranslatePipe, QuizSuccessDialog, Loader],
  templateUrl: './quiz-stepper.html',
  styleUrl: './quiz-stepper.scss',
})
export class QuizStepper {
  private readonly examService = inject(ExamService);
  private readonly quizProgressService = inject(QuizProgressService);
  private readonly messageService = inject(MessageService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  readonly optionKeys: QuestionAnswer[] = ['A', 'B', 'C', 'D'];
  private route = inject(ActivatedRoute);

  quizData = signal<IQuestionsData>({} as IQuestionsData);
  currentQuestionIndex = 0;
  questions = signal<IQuizQuestion[]>([]);
  loadingQuestions = signal<boolean>(false)
  quizId!: string | null;

  /** based index of the step currently shown by p-stepper */
  activeStep = signal<number>(1);

  /** questionId -> selected option key */
  selectedAnswers = signal<Record<string, QuestionAnswer>>({});

  successDialogVisible = signal(false);
  isQuizStarted = signal(false);
  quizTimeInSeconds = signal(0);

  //Submitting responses actions
  isSubmitted = signal(false);
  isLoading = signal(false);

  totalResult = signal(0);
  studentResult = signal(0);

  timeLeft = signal(0)
  totalQuestions = computed(() => this.questions().length);
  answeredCount = computed(
    () => Object.keys(this.selectedAnswers()).length
  );

  constructor() {
    effect(() => {
      if (this.isSubmitted()) return;
      // reading signals makes the effect track them
      this.selectedAnswers();
      this.activeStep();
      this.timeLeft();
      this.saveState();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('id');
      if (this.quizId) {
        this.getQuestionsWithoutAnswers(this.quizId);
      }
    });
  }

  // ── Data loading ─────────────────────────────────────
  getQuestionsWithoutAnswers(id: string): void {
    this.loadingQuestions.set(true);
    this.examService.getQuestionsWithoutAnswers(id).subscribe({
      next: (res: IQuestionResponse) => {
        this.quizData.set(res.data);
        this.questions.set(this.quizData().questions);
        this.totalResult.set(this.quizData().questions_number * this.quizData().score_per_question);

        this.restoreOrInitProgress();
        this.startQuiz();
      },
      error: (err) => this.handleError(err),
      complete: () => this.loadingQuestions.set(false),
    });
  }

  private saveState(): void {
    if (!this.quizId || !this.isQuizStarted()) return;
    const state: IQuizProgress = {
      selectedAnswers: this.selectedAnswers(),
      activeStep: this.activeStep(),
      timeLeft: this.timeLeft(),
    };
    this.quizProgressService.save(this.quizId, state);
  }

  private restoreOrInitProgress(): void {
    if (!this.quizId) return;
    const stored = this.quizProgressService.load(this.quizId);
    if (stored) {
      this.selectedAnswers.set(stored.selectedAnswers);
      this.activeStep.set(stored.activeStep);
      this.timeLeft.set(stored.timeLeft);
      this.quizTimeInSeconds.set(stored.timeLeft); // resume timer from saved value
    } else {
      this.quizTimeInSeconds.set(this.quizData().duration * 60);
    }
  }

  // ── Answer selection ─────────────────────────────────
  selectOption(questionId: string, key: QuestionAnswer): void {
    this.selectedAnswers.update((answers) => ({
      ...answers,
      [questionId]: key,
    }));
  }

  isOptionSelected(questionId: string, key: QuestionAnswer): boolean {
    return this.selectedAnswers()[questionId] === key;
  }

  isAnswered(questionId: string): boolean {
    return !!this.selectedAnswers()[questionId];
  }

  // ── Timer ────────────────────────────────────────────
  onTimeUp(): void {
    this.submitQuiz();
  }

  onTimeChange(timeLeft: number) {
    this.timeLeft.set(timeLeft)
  }

  // ── Submission ───────────────────────────────────────
  submitQuiz(): void {
    const payload = this.questions()
    .filter((q) => !!this.selectedAnswers()[q._id]) // drop unanswered
    .map((q) => ({
      question: q._id,
      answer: this.selectedAnswers()[q._id] as QuestionAnswer,
    }));
    this.isLoading.set(true);
    this.examService.submitQuiz(this.quizId, { answers: payload }).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: res.message || this.translate.instant('quiz_details.result.submitted'),
        });
        this.studentResult.set(res.data.score);
        this.successDialogVisible.set(true);
        this.clearAfterSubmit()
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading.set(false);
        this.clearAfterSubmit();
        this.router.navigate(['/dashboard/learner/quizzes']);
      },
      complete: () => this.isLoading.set(false),
    })
  }
  clearAfterSubmit(): void {
    this.isSubmitted.set(true);
    if (this.quizId) {
      this.quizProgressService.clear(this.quizId);
    }
  }
  
  // ── Quiz flow ─────────────
  startQuiz() {
    this.isQuizStarted.set(true)
  }
  onStepChange(value: number | undefined): void {
    if (value !== undefined) {
      this.activeStep.set(value);
    }
  }

  // Shared error handling
  private handleError(err: any): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('common.error'),
      detail: err.error?.message || this.translate.instant('common.something_went_wrong'),
    });
  }
}
