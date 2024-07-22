import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { ShareComponent } from '../share/share.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  constructor(private dialog: MatDialog) {}

  url: string = 'https://driver-quiz-buddy.vercel.app';
  
  onShare() {
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // this.dialog.open(ShareComponent, dialogConfig);


    const dialogRef = this.dialog.open(ShareComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '250px'
    });
  }

  @Output() public sidenavToggle = new EventEmitter();
  
  ngOnInit() {
  }
  public onToggleSidenav = () => {
    console.log("triggered");
    this.sidenavToggle.emit();
  }

  copyLinkToClipBoard(): void {
    navigator.clipboard.writeText(this.url).then(() => {
      console.log('URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}
