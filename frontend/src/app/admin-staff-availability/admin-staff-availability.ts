import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffAvailabilityService, StaffAvailability } from '../services/staff-availability';
import { AuthService, User } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-admin-staff-availability',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './admin-staff-availability.html',
  styleUrl: './admin-staff-availability.css'
})
export class AdminStaffAvailabilityComponent implements OnInit {
  userDetails: User | null = null;
  allAvailabilities: StaffAvailability[] = [];
  isLoading = false;
  errorMessage = '';

  staffGroups: { [key: string]: StaffAvailability[] } = {};

  constructor(
    private staffAvailabilityService: StaffAvailabilityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userDetails = this.authService.getCurrentUser();

    if (!this.userDetails) {
      this.errorMessage = 'Please log in to access this page';
      return;
    }

    if (this.userDetails.role !== 'admin') {
      this.errorMessage = 'Access denied. This page is only available to administrators.';
      return;
    }

    this.loadAllStaffAvailability();
  }

  loadAllStaffAvailability(): void {
    if (!this.userDetails) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    if (this.userDetails.role !== 'admin') {
      this.errorMessage = 'Access denied. Admin role required.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.staffAvailabilityService.getAllStaffAvailability().subscribe({
      next: (response) => {
        if (response.success) {
          this.allAvailabilities = response.data;
          this.groupAvailabilitiesByStaff();
        } else {
          this.errorMessage = 'Failed to load staff availabilities';
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Failed to load staff availabilities (${error.status || 'Unknown error'})`;
        }
        this.isLoading = false;
      }
    });
  }

  groupAvailabilitiesByStaff(): void {
    this.staffGroups = {};

    this.allAvailabilities.forEach(availability => {
      const staffId = availability.staff._id;
      if (!this.staffGroups[staffId]) {
        this.staffGroups[staffId] = [];
      }
      this.staffGroups[staffId].push(availability);
    });
  }

  getStaffMembers(): string[] {
    return Object.keys(this.staffGroups);
  }

  getStaffName(staffId: string): string {
    const firstAvailability = this.staffGroups[staffId][0];
    return firstAvailability ? firstAvailability.staff.name : 'Unknown Staff';
  }

  getStaffEmail(staffId: string): string {
    const firstAvailability = this.staffGroups[staffId][0];
    return firstAvailability ? firstAvailability.staff.email : '';
  }

  getStaffRole(staffId: string): string {
    const firstAvailability = this.staffGroups[staffId][0];
    return firstAvailability ? firstAvailability.staff.role : '';
  }

  getAvailabilityForDay(staffId: string, day: string): StaffAvailability | undefined {
    return this.staffGroups[staffId]?.find(av => av.dayOfWeek === day);
  }

  isDayAvailable(staffId: string, day: string): boolean {
    return this.staffGroups[staffId]?.some(av => av.dayOfWeek === day) || false;
  }

  getDaysOfWeek(): string[] {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  getTotalWorkingHours(staffId: string): number {
    const availabilities = this.staffGroups[staffId] || [];
    let totalHours = 0;

    availabilities.forEach(av => {
      const start = new Date(`2000-01-01T${av.startTime}`);
      const end = new Date(`2000-01-01T${av.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    });

    return Math.round(totalHours * 10) / 10;
  }

  getTotalBreaks(staffId: string): number {
    const availabilities = this.staffGroups[staffId] || [];
    let totalBreaks = 0;

    availabilities.forEach(av => {
      totalBreaks += av.breaks.length;
    });

    return totalBreaks;
  }
}
