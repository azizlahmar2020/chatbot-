import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  command: string = '';
  response: any[] = [];
  alertMessage: string = '';
  alertType: string = '';
  currentView: string = '';
  loading: boolean = false;
  conversationHistory: { role: string, content: any, timestamp?: Date }[] = [];

  validatedEndpointInfo: any = null;
  endpointToValidate: any = null;
  additionalEndpoints: any[] = [];

  showValidationModal: boolean = false;
  validationJson: string = '';
  isSidebarOpen = true;

  constructor(private apiService: ApiService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  submit() {
    if (!this.command.trim()) {
      this.showAlert('Veuillez entrer une commande.', 'error');
      return;
    }

    this.loading = true;
    this.conversationHistory.push({
      role: 'user',
      content: this.command,
      timestamp: new Date()
    });

    if (this.command.toLowerCase().includes('cours')) {
      this.currentView = 'cours';
    } else if (this.command.toLowerCase().includes('etudiant')) {
      this.currentView = 'etudiant';
    } else {
      this.currentView = '';
    }

    this.apiService.processCommand(this.command).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.endpointInfo) {
          if (Array.isArray(res.endpointInfo)) {
            const endpointsRequiringValidation = res.endpointInfo.filter((ep: any) =>
              ep.method === 'POST' || ep.method === 'PUT'
            );
            const otherEndpoints = res.endpointInfo.filter((ep: any) =>
              !(ep.method === 'POST' || ep.method === 'PUT')
            );

            if (endpointsRequiringValidation.length > 0) {
              this.endpointToValidate = endpointsRequiringValidation[0];
              this.additionalEndpoints = otherEndpoints;

              // Gestion spécifique pour les requêtes PUT
              if (this.endpointToValidate.method === 'PUT') {
                this.loading = true;
                // Récupération des données existantes
                this.apiService.processCommand(this.endpointToValidate.url).subscribe({
                  next: (currentData) => {
                    this.loading = false;
                    // Fusion des données existantes avec les nouvelles modifications
                    this.endpointToValidate.data = {
                      ...currentData,
                      ...this.endpointToValidate.data
                    };
                    this.validationJson = JSON.stringify(this.endpointToValidate, null, 2);
                    this.showValidationModal = true;
                  },
                  error: (err) => {
                    this.loading = false;
                    this.showAlert('Erreur lors de la récupération des données existantes.', 'error');
                  }
                });
              } else {
                // Cas normal pour les POST
                this.validationJson = JSON.stringify(this.endpointToValidate, null, 2);
                this.showValidationModal = true;
              }
            } else {
              this.validatedEndpointInfo = res.endpointInfo;
              this.executeRequest();
            }
          } else if (res.endpointInfo.method === 'PUT') {
            // Gestion pour un seul endpoint PUT
            this.loading = true;
            this.apiService.processCommand(res.endpointInfo.url).subscribe({
              next: (currentData) => {
                this.loading = false;
                res.endpointInfo.data = {
                  ...currentData,
                  ...res.endpointInfo.data
                };
                this.validationJson = JSON.stringify(res.endpointInfo, null, 2);
                this.showValidationModal = true;
              },
              error: (err) => {
                this.loading = false;
                this.showAlert('Erreur lors de la récupération des données.', 'error');
              }
            });
          } else {
            this.validationJson = JSON.stringify(res.endpointInfo, null, 2);
            this.showValidationModal = true;
          }
        } else {
          this.showAlert('Aucun endpointInfo retourné.', 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.showAlert('Erreur lors de la génération du prompt.', 'error');
        console.error('Error processing command:', err);
      }
    });
  }

  handleEndpointInfo(endpointInfo: any) {
    if (Array.isArray(endpointInfo)) {
      const endpointsRequiringValidation = endpointInfo.filter((ep: any) => ['POST', 'PUT'].includes(ep.method));
      this.additionalEndpoints = endpointInfo.filter((ep: any) => !['POST', 'PUT'].includes(ep.method));

      if (endpointsRequiringValidation.length > 0) {
        this.endpointToValidate = endpointsRequiringValidation[0];
        // Si c'est un PUT, on élimine la validation et on exécute directement la requête
        if (this.endpointToValidate.method === 'PUT') {
          this.fetchAndMergeForPut(this.endpointToValidate, false);
        } else {
          this.showValidationModalWithEndpoint(this.endpointToValidate);
        }
      } else {
        this.validatedEndpointInfo = endpointInfo;
        this.executeRequest();
      }
    } else if (endpointInfo.method === 'PUT') {
      // Pour un PUT, on fusionne et on exécute directement
      this.fetchAndMergeForPut(endpointInfo, false);
    } else {
      this.showValidationModalWithEndpoint(endpointInfo);
    }
  }

  /**
   * fetchAndMergeForPut récupère les données actuelles, fusionne avec celles fournies dans l'endpoint
   * et, si showModal est false, exécute directement la requête PUT.
   */
  fetchAndMergeForPut(endpoint: any, showModal: boolean = true) {
    this.loading = true;
    this.apiService.processCommand(endpoint.url).subscribe({
      next: (currentData) => {
        this.loading = false;
        endpoint.data = this.deepMerge(currentData, endpoint.data);
        if (showModal) {
          this.showValidationModalWithEndpoint(endpoint);
        } else {
          // Exécution directe sans validation pour PUT
          this.validatedEndpointInfo = endpoint;
          this.executeRequest();
        }
      },
      error: () => {
        this.loading = false;
        this.showAlert('Erreur lors de la récupération des données existantes.', 'error');
      }
    });
  }

  showValidationModalWithEndpoint(endpoint: any) {
    this.validationJson = JSON.stringify(endpoint, null, 2);
    this.showValidationModal = true;
  }

  validatePrompt(updatedJson: string) {
    try {
      const validatedEndpoint = JSON.parse(updatedJson);
      if (this.additionalEndpoints.length > 0) {
        this.validatedEndpointInfo = [...this.additionalEndpoints, validatedEndpoint];
      } else {
        this.validatedEndpointInfo = validatedEndpoint;
      }
      this.showValidationModal = false;
      this.executeRequest();
    } catch {
      this.showAlert('Le JSON est invalide. Veuillez vérifier votre saisie.', 'error');
    }
  }

  cancelValidation() {
    this.showValidationModal = false;
    this.showAlert('Validation annulée.', 'info');
  }

  executeRequest() {
    if (!this.validatedEndpointInfo) return;
    this.loading = true;
    this.apiService.executeCommand(this.validatedEndpointInfo).subscribe({
      next: (res) => {
        this.loading = false;
        if (Array.isArray(this.validatedEndpointInfo)) {
          res.data.forEach((response: any, index: number) => {
            this.processEndpointResponse(this.validatedEndpointInfo[index], response);
          });
        } else {
          this.processEndpointResponse(this.validatedEndpointInfo, res.data);
        }
        this.showAlert('Commande exécutée avec succès !', 'success');
        this.command = '';
        this.validatedEndpointInfo = null;
      },
      error: () => {
        this.loading = false;
        this.showAlert("Erreur lors de l'exécution de la commande.", 'error');
      }
    });
  }

  private processEndpointResponse(endpoint: any, response: any) {
    let messageContent: any;
    if (endpoint.method === 'GET') {
      let items = Array.isArray(response) ? response : (response?.items || [response]);
      messageContent = items.length > 0 ? { items } : 'Aucun élément trouvé.';
    } else if (['POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
      messageContent = `Commande ${endpoint.method} exécutée avec succès !`;
    } else {
      messageContent = response;
    }
    this.conversationHistory.push({
      role: 'assistant',
      content: messageContent,
      timestamp: new Date()
    });
  }

  private deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) {
      return source;
    }
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = this.deepMerge(target[key] || {}, source[key]);
        } else if (source[key] !== undefined && source[key] !== null) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => this.alertMessage = '', 3000);
  }

  trackById(index: number, item: any): number {
    return item?.id || index;
  }

  discussions = [
    { title: 'Discussion 1', time: '10:30 AM' },
    { title: 'Discussion 2', time: '11:00 AM' },
    { title: 'Discussion 3', time: '11:30 AM' },
  ];
}
