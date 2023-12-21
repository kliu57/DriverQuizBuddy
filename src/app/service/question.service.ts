import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http : HttpClient) { }

  getSignQuestionsJson(){
    return this.http.get<any>("assets/questions_signs.json");
  }

  getRuleQuestionsJson(){
    return this.http.get<any>("assets/questions_rules.json");
  }
}
