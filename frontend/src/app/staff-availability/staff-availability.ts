import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffAvailabilityService, StaffAvailability, CreateAvailabilityRequest, Break } from '../services/staff-availability';
import { AuthService, User } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-staff-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './staff-availability.html',
  styleUrl: './staff-availability.css'
})
export class StaffAvailabilityComponent implements OnInit {
  userDetails: User | null = null;
  availabilities: StaffAvailability[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' = 'Monday';
  startTime = '09:00';
  endTime = '17:00';
  breaks: Break[] = [];

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

    if (this.userDetails.role === 'customer') {
      this.errorMessage = 'Access denied. This page is only available to staff and administrators.';
      return;
    }

    this.loadAvailabilities();
  }

  loadAvailabilities(): void {
    if (!this.userDetails) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.staffAvailabilityService.getStaffAvailability(this.userDetails._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.availabilities = response.data;
        } else {
          this.errorMessage = 'Failed to load availabilities';
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Failed to load availabilities (${error.status || 'Unknown error'})`;
        }
        this.isLoading = false;
      }
    });
  }



  addBreak(): void {
    this.breaks.push({ start: '12:00', end: '13:00' });
  }

  removeBreak(index: number): void {
    this.breaks.splice(index, 1);
  }

  getAvailabilityForDay(day: string): StaffAvailability | undefined {
    return this.availabilities.find(av => av.dayOfWeek === day);
  }

  isDayAvailable(day: string): boolean {
    return this.availabilities.some(av => av.dayOfWeek === day);
  }

  addAvailability(): void {
    if (!this.userDetails) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const availabilityData: CreateAvailabilityRequest = {
      dayOfWeek: this.selectedDay,
      startTime: this.startTime,
      endTime: this.endTime,
      breaks: this.breaks.length > 0 ? this.breaks : undefined
    };

    this.staffAvailabilityService.addAvailability(availabilityData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `Availability for ${this.selectedDay} added successfully!`;
          this.availabilities.push(response.data);
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to add availability';
        }
      }
    });
  }

  updateAvailability(availability: StaffAvailability): void {
    this.selectedDay = availability.dayOfWeek;
    this.startTime = availability.startTime;
    this.endTime = availability.endTime;
    this.breaks = [...availability.breaks];
  }

  saveUpdate(availability: StaffAvailability): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      startTime: this.startTime,
      endTime: this.endTime,
      breaks: this.breaks
    };

    this.staffAvailabilityService.updateAvailability(availability._id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `Availability for ${availability.dayOfWeek} updated successfully!`;
          const index = this.availabilities.findIndex(av => av._id === availability._id);
          if (index !== -1) {
            this.availabilities[index] = response.data;
          }
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to update availability';
        }
      }
    });
  }

  resetForm(): void {
    this.selectedDay = 'Monday';
    this.startTime = '09:00';
    this.endTime = '17:00';
    this.breaks = [];
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
