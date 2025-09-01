import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Service, Staff, AvailableSlot } from '../services/booking';
import { AuthService, User } from '../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingComponent implements OnInit {
  userDetails: User | null = null;
  services: Service[] = [];
  staff: Staff[] = [];
  availableSlots: string[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedService: string = '';
  selectedStaff: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  notes: string = '';

  currentStep = 1;
  totalSteps = 4;

  slotsData: AvailableSlot | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userDetails = this.authService.getCurrentUser();

    if (!this.userDetails) {
      this.errorMessage = 'Please log in to book appointments';
      return;
    }

    this.loadServices();
    this.loadStaff();
  }

  loadServices(): void {
    this.isLoading = true;
    this.bookingService.getServices().subscribe({
      next: (response) => {
        if (response.success) {
          this.services = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load services';
        this.isLoading = false;
      }
    });
  }

  loadStaff(): void {
    this.bookingService.getStaff().subscribe({
      next: (response) => {
        if (response.success) {
          this.staff = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load staff:', error);
      }
    });
  }

  onServiceChange(): void {
    this.selectedStaff = '';
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.slotsData = null;
    this.currentStep = 2;
  }

  onStaffChange(): void {
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.slotsData = null;
    this.currentStep = 3;
  }

  onDateChange(): void {
    if (this.selectedService && this.selectedStaff && this.selectedDate) {
      this.loadAvailableSlots();
    }
  }

  loadAvailableSlots(): void {
    this.isLoading = true;
    this.availableSlots = [];
    this.selectedTime = '';

    this.bookingService.getAvailableSlots(
      this.selectedStaff,
      this.selectedDate,
      this.selectedService
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.slotsData = response.data;
          this.availableSlots = response.data.availableSlots;
          this.currentStep = 4;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load available slots';
        this.isLoading = false;
      }
    });
  }

  onTimeSelect(time: string): void {
    this.selectedTime = time;
  }

  getSelectedService(): Service | undefined {
    return this.services.find(s => s._id === this.selectedService);
  }

  getSelectedStaffMember(): Staff | undefined {
    return this.staff.find(s => s._id === this.selectedStaff);
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  createBooking(): void {
    if (!this.selectedService || !this.selectedStaff || !this.selectedDate || !this.selectedTime) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const appointmentDateTime = new Date(`${this.selectedDate}T${this.selectedTime}`);

    const appointmentData = {
      staff: this.selectedStaff,
      service: this.selectedService,
      date: appointmentDateTime.toISOString(),
      notes: this.notes
    };

    this.bookingService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Appointment booked successfully!';
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to book appointment';
        }
      }
    });
  }

  resetForm(): void {
    this.selectedService = '';
    this.selectedStaff = '';
    this.selectedDate = '';
    this.selectedTime = '';
    this.notes = '';
    this.availableSlots = [];
    this.slotsData = null;
    this.currentStep = 1;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToStep(step: number): void {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedService;
      case 2:
        return !!this.selectedStaff;
      case 3:
        return !!this.selectedDate;
      case 4:
        return !!this.selectedTime;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.canProceedToNextStep() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
