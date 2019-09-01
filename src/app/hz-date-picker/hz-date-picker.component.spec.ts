import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HzDatePickerComponent } from './hz-date-picker.component';

describe('HzDatePickerComponent', () => {
  let component: HzDatePickerComponent;
  let fixture: ComponentFixture<HzDatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HzDatePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HzDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
