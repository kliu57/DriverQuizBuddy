// game.service.ts
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface GameState {
  status: 'initial' | 'waiting' | 'playing' | 'results';
  opponentChoice?: string;
  playerChoice?: string;
  result?: 'win' | 'lose' | 'draw';
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private hubConnection: HubConnection;
  private gameStateSubject = new BehaviorSubject<GameState>({
    status: 'initial',
  });
  gameState$ = this.gameStateSubject.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://game-server-production-d34e.up.railway.app/gamehub')
      .build();

    this.setupSignalRHandlers();
    this.hubConnection.start();
  }

  private setupSignalRHandlers() {
    this.hubConnection.on('OpponentFound', () => {
      this.gameStateSubject.next({ status: 'playing' });
    });

    this.hubConnection.on(
      'GameResult',
      (result: {
        playerChoice: string;
        opponentChoice: string;
        result: 'win' | 'lose' | 'draw';
      }) => {
        this.gameStateSubject.next({
          status: 'results',
          playerChoice: result.playerChoice,
          opponentChoice: result.opponentChoice,
          result: result.result,
        });
      }
    );
  }

  joinQueue(playerName: string) {
    this.hubConnection.invoke('JoinQueue', playerName);
    this.gameStateSubject.next({ status: 'waiting' });
  }

  makeChoice(choice: string) {
    this.hubConnection.invoke('MakeChoice', choice);
    this.gameStateSubject.next({
      ...this.gameStateSubject.value,
      playerChoice: choice,
      status: 'waiting',
    });
  }
}
