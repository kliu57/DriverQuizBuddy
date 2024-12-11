import { Component } from '@angular/core';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss',
})
export class ShareComponent {
  linkToShare = 'https://driver-quiz-buddy.vercel.app';
  copied = false;

  copyLink(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
