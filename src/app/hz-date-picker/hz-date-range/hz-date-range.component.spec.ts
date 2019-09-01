import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HzDateRangeComponent } from './hz-date-range.component';

describe('HzDateRangeComponent', () => {
  let component: HzDateRangeComponent;
  let fixture: ComponentFixture<HzDateRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HzDateRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HzDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
