import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionHistoryComponent } from './discussion-history.component';

describe('DiscussionHistoryComponent', () => {
  let component: DiscussionHistoryComponent;
  let fixture: ComponentFixture<DiscussionHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiscussionHistoryComponent]
    });
    fixture = TestBed.createComponent(DiscussionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
