// versus.component.ts
import { Component, OnDestroy } from '@angular/core';
import { GameService, GameState } from './game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-versus',
  templateUrl: './versus.component.html',
  styleUrl: './versus.component.scss',
})
export class VersusComponent implements OnDestroy {
  userName: string = '';
  isNameSubmitted: boolean = false;
  gameState: GameState = { status: 'initial' };
  private gameStateSubscription: Subscription;

  constructor(private gameService: GameService) {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(
      (state) => (this.gameState = state)
    );
  }

  onNameSubmit(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.userName.trim()) {
      this.isNameSubmitted = true;
    }
  }

  joinQueue() {
    this.gameService.joinQueue(this.userName);
  }

  makeChoice(choice: string) {
    this.gameService.makeChoice(choice);
  }

  getResultMessage(): string {
    if (!this.gameState.result) return '';

    switch (this.gameState.result) {
      case 'win':
        return 'You won!';
      case 'lose':
        return 'You lost!';
      case 'draw':
        return "It's a draw!";
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.gameStateSubscription?.unsubscribe();
  }
}
