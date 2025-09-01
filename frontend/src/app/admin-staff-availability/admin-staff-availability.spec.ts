import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStaffAvailability } from './admin-staff-availability';

describe('AdminStaffAvailability', () => {
  let component: AdminStaffAvailability;
  let fixture: ComponentFixture<AdminStaffAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStaffAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStaffAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
