import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'haircut' | 'styling' | 'coloring' | 'treatment' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface Appointment {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  staff: {
    _id: string;
    name: string;
    email: string;
  };
  service: {
    _id: string;
    name: string;
    duration: number;
    price: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  staffId: string;
  date: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  availableSlots: string[];
}

export interface CreateAppointmentRequest {
  staff: string;
  service: string;
  date: string;
  notes?: string;
}

export interface RescheduleAppointmentRequest {
  newDate: string;
}

export interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

export interface StaffResponse {
  success: boolean;
  count: number;
  data: Staff[];
}

export interface AppointmentsResponse {
  success: boolean;
  count: number;
  data: Appointment[];
}

export interface AppointmentResponse {
  success: boolean;
  data: Appointment;
}

export interface AvailableSlotsResponse {
  success: boolean;
  data: AvailableSlot;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getServices(): Observable<ServicesResponse> {
    return this.http.get<ServicesResponse>(`${this.apiUrl}/services`);
  }

  getService(id: string): Observable<{ success: boolean; data: Service }> {
    return this.http.get<{ success: boolean; data: Service }>(`${this.apiUrl}/services/${id}`);
  }

  getStaff(): Observable<StaffResponse> {
    return this.http.get<StaffResponse>(`${this.apiUrl}/users/staff`);
  }

  getStaffById(id: string): Observable<{ success: boolean; data: Staff }> {
    return this.http.get<{ success: boolean; data: Staff }>(`${this.apiUrl}/users/staff/${id}`);
  }

  getAvailableSlots(staffId: string, date: string, serviceId: string): Observable<AvailableSlotsResponse> {
    return this.http.get<AvailableSlotsResponse>(`${this.apiUrl}/appointments/available/${staffId}?date=${date}&serviceId=${serviceId}`);
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.apiUrl}/appointments`, appointment);
  }

  getMyAppointments(): Observable<AppointmentsResponse> {
    return this.http.get<AppointmentsResponse>(`${this.apiUrl}/appointments/my`);
  }

  cancelAppointment(appointmentId: string): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.apiUrl}/appointments/${appointmentId}/cancel`, {});
  }

  rescheduleAppointment(appointmentId: string, request: RescheduleAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.apiUrl}/appointments/${appointmentId}/reschedule`, request);
  }
}
