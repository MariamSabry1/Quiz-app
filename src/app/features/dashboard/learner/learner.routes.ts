import { Routes } from '@angular/router';
export const LEARNER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/learner-home/learner-home').then((c) => c.LearnerHome),
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./modules/learner-quiz/components/quiz-home/quiz-home').then((c) => c.QuizHome),
    data: {
      title: 'navigation.quizzes',
    },
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./modules/learner-results/components/learner-resaults-list/learner-resaults-list').then(
        (c) => c.LearnerResaultsList,
      ),
       data: {
      title: 'navigation.results',
    },
  },
  {
    path: 'results/:id',
    loadComponent: () =>
      import('../learner/modules/learner-results/components/learner-result-details/learner-result-details').then(
        (c) => c.LearnerResultDetails,
      ),
    data: {
      title: 'navigation.view_result',
    },
  },
];
