import { Component, input, model, signal } from '@angular/core';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dialog } from 'primeng/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { UpperCasePipe } from '@angular/common';
export interface SuccessDialogData {
  title: string;
  code?: string;
}
@Component({
  selector: 'app-quiz-code-dialog',
  imports: [DynamicDialogModule, Dialog, TranslatePipe, Button, UpperCasePipe
  ],
  providers: [DialogService],
  templateUrl: './quiz-code-dialog.html',
  styleUrl: './quiz-code-dialog.scss',
})
export class QuizCodeDialog {
  visible = model<boolean>(false);

  title = input<string | null>(null);

  code = input<string>('');
  copied = signal(false);

  copyCode(): void {
    navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }
  closeDialog(): void {
    this.visible.set(false);
  }
}
