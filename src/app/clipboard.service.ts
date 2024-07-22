// clipboard.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor() { }

  copyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text successfully copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
}
