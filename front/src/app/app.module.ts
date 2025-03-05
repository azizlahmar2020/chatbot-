import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BotComponent } from './bot/bot.component';
import { ChatComponent } from './chat/chat.component';
import { ValidationModalComponent } from './validation-modal/validation-modal.component';
import { DiscussionHistoryComponent } from './discussion-history/discussion-history.component';

@NgModule({
  declarations: [
    AppComponent,
    BotComponent,
    ChatComponent,
    ValidationModalComponent,
    DiscussionHistoryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
