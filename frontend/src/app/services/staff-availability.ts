import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Break {
  start: string;
  end: string;
}

export interface StaffAvailability {
  _id: string;
  staff: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  breaks: Break[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityRequest {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  breaks?: Break[];
}

export interface UpdateAvailabilityRequest {
  startTime?: string;
  endTime?: string;
  breaks?: Break[];
}

export interface AvailabilityResponse {
  success: boolean;
  data: StaffAvailability[];
}

export interface SingleAvailabilityResponse {
  success: boolean;
  data: StaffAvailability;
}

export interface AllAvailabilityResponse {
  success: boolean;
  count: number;
  data: StaffAvailability[];
}

@Injectable({
  providedIn: 'root'
})
export class StaffAvailabilityService {
  private apiUrl = 'http://localhost:5000/api/staff-availability';

  constructor(private http: HttpClient) {}

  getAllStaffAvailability(): Observable<AllAvailabilityResponse> {
    return this.http.get<AllAvailabilityResponse>(`${this.apiUrl}/all`);
  }

  getStaffAvailability(staffId: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/${staffId}`);
  }

  addAvailability(availability: CreateAvailabilityRequest): Observable<SingleAvailabilityResponse> {
    return this.http.post<SingleAvailabilityResponse>(`${this.apiUrl}`, availability);
  }

  updateAvailability(id: string, availability: UpdateAvailabilityRequest): Observable<SingleAvailabilityResponse> {
    return this.http.put<SingleAvailabilityResponse>(`${this.apiUrl}/${id}`, availability);
  }

  deleteAvailability(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
