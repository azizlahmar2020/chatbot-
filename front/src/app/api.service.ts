import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/ask'; // Utilisation du proxy Angular pour envoyer la requête
  private executeUrl = 'http://localhost:3000/execute';

  constructor(private http: HttpClient) { }

  processCommand(command: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { input: command });
  }

  executeCommand(endpointInfo: any): Observable<any> {
    return this.http.post<any>(this.executeUrl, { endpointInfo });
  }

}
