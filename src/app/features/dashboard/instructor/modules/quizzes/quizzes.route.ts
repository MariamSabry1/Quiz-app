import { Routes } from '@angular/router';
export const QUIZZES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/quiz-list/quiz-list').then((c) => c.QuizList),
    data: {
      title: 'navigation.quizzes',
    },
  },
  {
    path: 'view-quiz/:id',
    loadComponent: () => import('./components/view-quiz/view-quiz').then((c) => c.ViewQuiz),
    data: {
      title: 'navigation.view_quiz',
    },
  },
];
