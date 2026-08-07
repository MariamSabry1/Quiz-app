import { Routes } from '@angular/router';
export const INSTRUCTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/instructor-home/instructor-home').then((c) => c.InstructorHome),
    data: {
      title: 'navigation.dashboard',
    },
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('../instructor/modules/group/components/groups-list/groups-list').then(
        (c) => c.GroupsList,
      ),
    data: {
      title: 'navigation.groups',
    },
  },
  {
    path: 'students',
    loadComponent: () =>
      import('../instructor/modules/students/components/student-list/student-list').then(
        (c) => c.StudentList,
      ),
    data: {
      title: 'navigation.students',
    },
  },
  {
    path: 'quizzes',
    loadChildren: () => import('../instructor/modules/quizzes/quizzes.route').then((r) => r.QUIZZES_ROUTES),
    data: {
      title: 'navigation.quizzes',
    },
  },
  {
    path: 'results',
    loadChildren: () => import('../instructor/modules/results/results.route').then((r) => r.RESULTS_ROUTES),
  },
  {
    path: 'questions',
    loadComponent: () =>
      import('../instructor/modules/questions/components/questions-list/questions-list').then(
        (c) => c.QuestionsList,
      ),
    data: {
      title: 'navigation.questions',
    },
  },
];
