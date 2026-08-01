import { Component, computed, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'quiz-app-welcome-card',
  imports: [Button, RouterLink, TranslatePipe],
  templateUrl: './welcome-card.html',
  styleUrl: './welcome-card.scss',
})
export class WelcomeCard {
  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  fullName = computed(() => {
    const user = this.authService.getCurrentUser();
    return user ? `${user.first_name} ${user.last_name}` : '';
  });
}
