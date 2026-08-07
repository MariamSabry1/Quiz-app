import { Component, inject, OnInit, signal } from '@angular/core';
import { TopStudentsCard } from '../../../../../shared/components/dashboard/top-students-card/top-students-card';
import { UpcomingQuizzesCard } from '../../../../../shared/components/dashboard/upcoming-quizzes-card/upcoming-quizzes-card';
import { Loader } from '../../../../../shared/components/general/loader/loader';
import { DashboardWidget } from '../../../../../shared/components/dashboard/dashboard-widget/dashboard-widget';
import { IQuiz } from '../../modules/quizzes/interfaces/quiz';
import { QuizzesService } from '../../modules/quizzes/services/quizzes.service';
import { TranslatePipe } from '@ngx-translate/core';
export interface StudentSummary {
  id: string;
  name: string;
  classRank: string;
  averageScore: number;
  avatar: string;
}
@Component({
  selector: 'app-instructor-home',
  imports: [UpcomingQuizzesCard, Loader, DashboardWidget, TopStudentsCard, TranslatePipe],
  templateUrl: './instructor-home.html',
  styleUrl: './instructor-home.scss',
})
export class InstructorHome implements OnInit {
  private quizzesService = inject(QuizzesService);
  upcomingQuizzes = signal<IQuiz[]>([]);

  topStudents = signal<StudentSummary[]>([
    {
      id: '1',
      name: 'Emma Johnson',
      classRank: '1st',
      averageScore: 98,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: '2',
      name: 'Liam Anderson',
      classRank: '2nd',
      averageScore: 95,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: '3',
      name: 'Sophia Brown',
      classRank: '3rd',
      averageScore: 93,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      id: '4',
      name: 'Noah Wilson',
      classRank: '4th',
      averageScore: 91,
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      id: '5',
      name: 'Olivia Davis',
      classRank: '5th',
      averageScore: 89,
      avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    },
  ]);
  isLoadingQuizzes = signal(true);

  ngOnInit(): void {
    this.loadUpcomingQuizzes();
  }
  private loadUpcomingQuizzes(): void {
    this.isLoadingQuizzes.set(true);
    this.quizzesService.getFirstFiveIncomming().subscribe({
      next: (quizzes) => {
        this.isLoadingQuizzes.set(false);
        this.upcomingQuizzes.set(quizzes);
      },
      error: (err) => {
        console.error('Failed to load upcoming quizzes', err);
        this.isLoadingQuizzes.set(false);
      },
    });
  }
}
