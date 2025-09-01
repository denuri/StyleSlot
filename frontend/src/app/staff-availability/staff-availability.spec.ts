import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAvailability } from './staff-availability';

describe('StaffAvailability', () => {
  let component: StaffAvailability;
  let fixture: ComponentFixture<StaffAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
