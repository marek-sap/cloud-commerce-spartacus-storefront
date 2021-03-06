import { Component, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { I18nTestingModule, ReturnRequest } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { ReturnRequestService } from '../return-request.service';
import { ReturnRequestItemsComponent } from './return-request-items.component';

const mockReturnRequest: ReturnRequest = {
  rma: 'test',
  returnEntries: [],
};
class MockCheckoutService {
  getReturnRequest(): Observable<ReturnRequest> {
    return of(mockReturnRequest);
  }
}

@Component({
  template: '',
  selector: 'cx-media',
})
class MockMediaComponent {
  @Input() container;
  @Input() format;
}

describe('ReturnRequestItemsComponent', () => {
  let component: ReturnRequestItemsComponent;
  let fixture: ComponentFixture<ReturnRequestItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [ReturnRequestItemsComponent, MockMediaComponent],
      providers: [
        { provide: ReturnRequestService, useClass: MockCheckoutService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnRequestItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
