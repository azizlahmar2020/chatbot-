import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-discussion-history',
  templateUrl: './discussion-history.component.html',
  styleUrls: ['./discussion-history.component.css']
})
export class DiscussionHistoryComponent  {
  discussions = [
    { title: 'Discussion 1', time: '10:30 AM' },
    { title: 'Discussion 2', time: '11:00 AM' },
    { title: 'Discussion 3', time: '11:30 AM' }
  ];

  selectDiscussion(discussion: any) {
    console.log('Discussion sélectionnée:', discussion);
    // Ajouter ici la logique pour charger la conversation correspondante
  }
}
