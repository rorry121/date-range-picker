import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HzDateMonthComponent } from './hz-date-month.component';

describe('HzDateMonthComponent', () => {
  let component: HzDateMonthComponent;
  let fixture: ComponentFixture<HzDateMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HzDateMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HzDateMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
