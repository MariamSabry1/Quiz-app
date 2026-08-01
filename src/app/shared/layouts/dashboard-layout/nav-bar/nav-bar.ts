import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { Button } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { filter } from 'rxjs';
import { LanguageSwitcherComponent } from '../../../components/general/language-switcher/language-switcher.component';
import {
  GroupOption,
  IQuizPayload,
} from '../../../../features/dashboard/instructor/modules/quizzes/interfaces/quiz';
import { AddEditQuiz } from '../../../../features/dashboard/instructor/modules/quizzes/components/add-edit-quiz/add-edit-quiz';
import { TranslateService } from '@ngx-translate/core';
import { GroupsService } from '../../../../features/dashboard/instructor/modules/group/services/groups.service';
import { QuizzesService } from '../../../../features/dashboard/instructor/modules/quizzes/services/quizzes.service';
import { RoleEnum } from '../../../../core/enum/role.enum';
@Component({
  selector: 'app-nav-bar',
  imports: [
    BadgeModule,
    AvatarModule,
    InputTextModule,
    CommonModule,
    Button,
    MenuModule,
    LanguageSwitcherComponent,
    AddEditQuiz,
  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private quizzesService = inject(QuizzesService);
  private groupsService = inject(GroupsService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  roleEnum: RoleEnum = RoleEnum.Instructor;
  currentTime = signal(new Date());

  private timer = setInterval(() => {
    this.currentTime.set(new Date());
  }, 1000);
  userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user' },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
  ];
  showDialog = signal(false);
  addEditLoad = signal(false);
  groupsOptions = signal<GroupOption[]>([]);
  pageTitle = signal('Dashboard');
  userName = computed(() => this.authService.getCurrentUser()?.first_name ?? '');
  userRole = computed(() => this.authService.getCurrentUser()?.role ?? '');
  userInitials = computed(() => this.userName().charAt(0).toUpperCase());

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.activatedRoute;

      while (route.firstChild) {
        route = route.firstChild;
      }

      this.pageTitle.set(route.snapshot.data['title'] ?? 'Dashboard');
    });
    if (this.userRole() === RoleEnum.Instructor) {
      this.loadGroups();
    }
  }

  loadGroups() {
    this.groupsService.getGroupOptions().subscribe({
      next: (options) => {
        this.groupsOptions.set(options);
        console.log('options', options);
      },
      error: (err) => console.error('Failed to load groups', err),
    });
  }
  openAddDialog(): void {
    this.showDialog.set(true);
  }
  saveQuiz(data: IQuizPayload): void {
    this.addEditLoad.set(true);

    this.quizzesService.createQuiz(data).subscribe({
      next: () => {
        this.addEditLoad.set(false);
        this.showDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: this.translate.instant('quizzes.create_success'),
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: err.error?.message || this.translate.instant('common.something_went_wrong'),
        });
        this.addEditLoad.set(false);
        console.error(err);
      },
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
