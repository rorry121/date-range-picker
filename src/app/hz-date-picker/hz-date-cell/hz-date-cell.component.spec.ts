import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HzDateCellComponent } from './hz-date-cell.component';

describe('HzDateCellComponent', () => {
  let component: HzDateCellComponent;
  let fixture: ComponentFixture<HzDateCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HzDateCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HzDateCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
