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

  getMotorQuestionsJson(){
    return this.http.get<any>("assets/questions_motor.json");
  }

  getMHF4UFormulasQuestionsJson(){
    return this.http.get<any>("assets/questions_MHF4U_formulas.json");
  }

  getMCV4UFormulasQuestionsJson(){
    return this.http.get<any>("assets/questions_MCV4U_formulas.json");
  }

  getSPH4UFormulasQuestionsJson(){
    return this.http.get<any>("assets/questions_SPH4U_formulas.json");
  }
}
