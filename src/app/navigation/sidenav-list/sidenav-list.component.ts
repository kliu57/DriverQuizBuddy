import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ClipboardService } from '../../clipboard.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrl: './sidenav-list.component.scss'
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();

  constructor(private clipboardService: ClipboardService) { }

  url: string = 'https://driver-quiz-buddy.vercel.app';

  ngOnInit() {
  }

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }

  copyLinkToClipBoard() {
    this.clipboardService.copyTextToClipboard(this.url);
  }
}