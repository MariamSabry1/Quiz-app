import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GroupOption, IQuiz, IQuizPayload } from '../../interfaces/quiz';
import { AddEditQuiz } from '../add-edit-quiz/add-edit-quiz';
import { GroupsService } from '../../../group/services/groups.service';
import { finalize } from 'rxjs';
import { QuizCodeDialog } from '../quiz-code-dialog/quiz-code-dialog';
import { CompletedQuizzesWidget } from '../../../../../../../shared/components/dashboard/completed-quizzes-widget/completed-quizzes-widget';
import { UpcomingQuizzesCard } from '../../../../../../../shared/components/dashboard/upcoming-quizzes-card/upcoming-quizzes-card';
import { ButtonLinkerCard } from '../../../../../../../shared/components/dashboard/button-linker-card/button-linker-card';
import { DashboardWidget } from '../../../../../../../shared/components/dashboard/dashboard-widget/dashboard-widget';
import { Loader } from '../../../../../../../shared/components/general/loader/loader';
@Component({
  selector: 'quiz-app-quiz-list',
  imports: [
    TableModule,
    CardModule,
    ButtonModule,
    CommonModule,
    RouterLink,
    Toast,
    TranslatePipe,
    AddEditQuiz,
    CompletedQuizzesWidget,
    UpcomingQuizzesCard,
    Loader,
    DashboardWidget,
    ButtonLinkerCard,
    QuizCodeDialog,
  ],
  providers: [MessageService],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.scss',
})
export class QuizList implements OnInit {
  private quizzesService = inject(QuizzesService);
  private groupsService = inject(GroupsService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  upcomingQuizzes = signal<IQuiz[]>([]);
  isLoading = signal(true);
  completedQuizzes = signal<IQuiz[]>([]);
  selectedQuizForEdit = signal<IQuiz | null>(null);
  groupsOptions = signal<GroupOption[]>([]);

  showDialog = signal(false);
  addEditLoad = signal(false);
  showSuccessDialog = signal(false);
  quizCode = signal<string>('');

  ngOnInit(): void {
    this.getIncomingQuizzes();
    this.getCompletedQuizzes();
    this.loadGroups();
  }
  completedQuizzesWithGroupNames = computed(() => {
    const groups = this.groupsOptions();
    return this.completedQuizzes().map((quiz) => ({
      ...quiz,
      groupName: this.getGroupName(quiz.group, groups),
    }));
  });

  private getGroupName(groupId: string, groups: GroupOption[]): string {
    return groups.find((g) => g.value === groupId)?.label || '-';
  }
  getIncomingQuizzes(): void {
    this.isLoading.set(true);
    this.quizzesService.getFirstFiveIncomming().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.upcomingQuizzes.set(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: err?.error?.message || 'Failed to load upcoming quizzes',
        });
      },
    });
  }

  getCompletedQuizzes(): void {
    this.isLoading.set(true);
    this.quizzesService.getLastFiveCompleted().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.completedQuizzes.set(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: err?.error?.message || 'Failed to load completed quizzes',
        });
      },
    });
  }
  loadGroups() {
    this.groupsService.getGroupOptions().subscribe({
      next: (options) => {
        this.groupsOptions.set(options);
      },
      error: (err) => console.error('Failed to load groups', err),
    });
  }
  openAddDialog(): void {
    this.selectedQuizForEdit.set(null);
    this.showDialog.set(true);
  }
  onQuizSaved(): void {
    this.showDialog.set(false);
  }
  openEditDialog(quiz: IQuiz): void {
    this.selectedQuizForEdit.set(quiz);
    this.showDialog.set(true);
  }

  saveQuiz(data: IQuizPayload): void {
    console.log('Saving quiz with data:', data);
    this.addEditLoad.set(true);
    const isEdit = !!this.selectedQuizForEdit();
    console.log(isEdit);

    const request$ = isEdit
      ? this.quizzesService.updateQuiz(this.selectedQuizForEdit()!._id!, data)
      : this.quizzesService.createQuiz(data);

    request$.pipe(finalize(() => this.addEditLoad.set(false))).subscribe({
      next: (res) => {
        this.showDialog.set(false);

        if (!isEdit) {
          console.log('Quiz created with code:', res.data.code);
          this.quizCode.set(res.data.code);
          this.showSuccessDialog.set(true);
        } else {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('quizzes.update_success'),
          });
        }

        this.getIncomingQuizzes();
        this.getCompletedQuizzes();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: err.error?.message || this.translate.instant('common.something_went_wrong'),
        });
        console.error(err);
      },
    });
  }
}
//GNU0ERL
