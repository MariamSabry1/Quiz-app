import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DashboardWidget } from '../../../../../../../shared/components/dashboard/dashboard-widget/dashboard-widget';
import { QuizzesService } from '../../../../../instructor/modules/quizzes/services/quizzes.service';
import { GroupOption, IQuiz } from '../../../../../instructor/modules/quizzes/interfaces/quiz';
import { UpcomingQuizzesCard } from '../../../../../../../shared/components/dashboard/upcoming-quizzes-card/upcoming-quizzes-card';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Loader } from '../../../../../../../shared/components/general/loader/loader';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { CompletedQuizzesWidget } from '../../../../../../../shared/components/dashboard/completed-quizzes-widget/completed-quizzes-widget';
import { ButtonLinkerCard } from '../../../../../../../shared/components/dashboard/button-linker-card/button-linker-card';
@Component({
  imports: [
    DashboardWidget,
    UpcomingQuizzesCard,
    TranslatePipe,
    FormsModule,
    TableModule,
    Loader,
    Dialog,
    CompletedQuizzesWidget,
    ButtonLinkerCard,
    CompletedQuizzesWidget,
  ],
  templateUrl: './quiz-home.html',
  styleUrl: './quiz-home.scss',
})
export class QuizHome implements OnInit {
  private quizzesService = inject(QuizzesService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private examService = inject(ExamService);
  private router = inject(Router);
  isLoading = signal(true);
  upcomingQuizzes = signal<IQuiz[]>([]);
  completedQuizzes = signal<IQuiz[]>([]);
  groupsOptions = signal<GroupOption[]>([]);
  displayJoinDialog = signal(false);
  quizCode = signal('');
  isJoining = signal(false);
  joinError = signal('');

  completedQuizzesWithGroupNames = computed(() => {
    return this.completedQuizzes().map((quiz: any) => ({
      ...quiz,
      groupName:
        quiz.group?.name ||
        quiz.group_name ||
        (typeof quiz.group === 'string' ? '-' : quiz.group) ||
        '-',
    }));
  });
  ngOnInit(): void {
    this.loadUpcomingQuizzes();
    this.getCompletedQuizzes();
  }

  openJoinDialog() {
    this.displayJoinDialog.set(true);
    this.quizCode.set('');
    this.joinError.set('');
  }
  closeJoinDialog() {
    this.displayJoinDialog.set(false);
    this.quizCode.set('');
    this.joinError.set('');
  }

  confirmJoin() {
    const code = this.quizCode().trim();

    if (!code) {
      this.joinError.set(this.translate.instant('QUIZZES.PLEASE_ENTER_CODE'));
      return;
    }

    this.isJoining.set(true);
    this.joinError.set('');

    this.examService.joinQuiz({ code }).subscribe({
      next: (res) => {
        this.isJoining.set(false);
        this.closeJoinDialog();
        this.router.navigate(['current-quiz', res.data.quiz]);
      },
      error: (err) => {
        this.isJoining.set(false);
        this.joinError.set(err?.error?.message);
      },
    });
  }

  loadUpcomingQuizzes() {
    this.isLoading.set(true);
    this.quizzesService.getFirstFiveIncomming().subscribe({
      next: (quizzes) => {
        this.isLoading.set(false);
        this.upcomingQuizzes.set(quizzes);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: err?.error?.message || 'Failed to load upcoming quizzes',
        });
      },
    });
  }

  getCompletedQuizzes(): void {
    this.quizzesService.getLastFiveCompleted().subscribe({
      next: (res) => {
        this.completedQuizzes.set(res);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: err?.error?.message || 'Failed to load completed quizzes',
        });
      },
    });
  }
}
