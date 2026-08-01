import { Component, computed, inject, input, OnInit } from '@angular/core';
import { IQuiz } from '../../../instructor/modules/quizzes/interfaces/quiz';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../../auth/services/auth.service';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'quiz-app-upcoming-quiz-card',
  imports: [DatePipe, RouterLink, TagModule],
  templateUrl: './upcoming-quiz-card.html',
  styleUrl: './upcoming-quiz-card.scss',
})
export class UpcomingQuizCard implements OnInit {
  private AuthService = inject(AuthService);
  quiz = input.required<IQuiz>();

  routingLink = input<string>('/view-quiz');
  showRouting = input<boolean>(true);
  imgSrc = input<string>('/images/quizImage.png');
  groupName = computed(() => {
    const user = this.AuthService.getCurrentUser();
    return user ? `${user.group?.name}` : '';
  });

  remainingTime = computed(() => {
    const now = new Date();
    const quizDate = new Date(this.quiz().schadule);
    const timeDifference = quizDate.getTime() - now.getTime();

    if (timeDifference == 0) {
      return 'Quiz has already started , Good luck!';
    }
    if (timeDifference < 0) {
      return 'Quiz has already  ended.';
    }
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);

    let remainingTimeString = '';
    if (days > 0) {
      remainingTimeString += `${days} day${days > 1 ? 's' : ''} `;
    }
    if (hours > 0) {
      remainingTimeString += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      remainingTimeString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return remainingTimeString.trim();
  });

  ngOnInit(): void {
    console.log('quiz', this.quiz());
    console.log('after ending ', formatDistanceToNow(this.quiz().schadule));
    console.log('after ending ', this.remainingTime());
  }
  //console.log(this.remaining); // Output: "in 3 days" (or similar, depending on the current date)
  // remainingTime = computed(() => {
  //   return formatDistanceToNow(this.quiz().schadule, {
  //     addSuffix: true,
  //   });
  // });
}
