import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DashboardWidget } from '../../../../../shared/components/dashboard/dashboard-widget/dashboard-widget';
import { WelcomeCard } from '../welcome-card/welcome-card';
import { GroupOption, IQuiz } from '../../../instructor/modules/quizzes/interfaces/quiz';
import { QuizzesService } from '../../../instructor/modules/quizzes/services/quizzes.service';
import { MessageService } from 'primeng/api';
import { UpcomingQuizCard } from '../upcoming-quiz-card/upcoming-quiz-card';
import { GroupsService } from '../../../instructor/modules/group/services/groups.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Loader } from '../../../../../shared/components/general/loader/loader';
import { Dialog } from 'primeng/dialog';
import { LearnerResaultsList } from '../../modules/learner-results/components/learner-resaults-list/learner-resaults-list';

@Component({
  selector: 'app-learner-home',
  imports: [
    TranslatePipe,
    DashboardWidget,
    WelcomeCard,
    UpcomingQuizCard,
    Loader,
    Dialog,
    LearnerResaultsList,
  ],
  providers: [MessageService],
  templateUrl: './learner-home.html',
  styleUrl: './learner-home.scss',
})
export class LearnerHome implements OnInit {
  private quizzesService = inject(QuizzesService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  upcomingQuizzes = signal<IQuiz[]>([]);
  isLoading = signal(true);
  fackImages = [
    'https://www.shutterstock.com/shutterstock/photos/2675682015/display_1500/stock-photo-smiling-high-school-teacher-standing-in-front-of-a-whiteboard-holding-homework-in-class-educator-2675682015.jpg',
    'https://www.shutterstock.com/shutterstock/photos/2519280093/display_1500/stock-photo-happy-teacher-teaching-how-to-do-the-column-additions-at-elementary-school-smiling-man-explaining-2519280093.jpg',
    'https://www.shutterstock.com/shutterstock/photos/2465904141/display_1500/stock-photo-medium-portrait-of-young-african-american-male-teacher-of-english-wearing-eyeglasses-sitting-at-2465904141.jpg',
    'https://www.shutterstock.com/shutterstock/photos/2323317607/display_1500/stock-photo-happy-female-teacher-with-group-of-elementary-school-students-int-he-classroom-looking-at-camera-2323317607.jpg',
    'https://www.shutterstock.com/shutterstock/photos/2708854355/display_1500/stock-photo-teacher-teaching-in-high-school-classroom-2708854355.jpg',
  ];

  extractImageSrc(): string {
    return this.fackImages[Math.floor(Math.random() * this.fackImages.length)];
  }

  ngOnInit(): void {
    this.loadUpcomingQuizzes();
  }

  loadUpcomingQuizzes() {
    this.isLoading.set(true);
    this.quizzesService.getFirstFiveIncomming().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.upcomingQuizzes.set(response);
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
}
