import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { SignupComponent } from './signup/signup';
import { LandingComponent } from './landing/landing';
import { DashboardComponent } from './dashboard/dashboard';
import { StaffAvailabilityComponent } from './staff-availability/staff-availability';
import { AdminStaffAvailabilityComponent } from './admin-staff-availability/admin-staff-availability';
import { BookingComponent } from './booking/booking';
import { staffAuthGuard } from './guards/staff-auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'staff-availability', component: StaffAvailabilityComponent, canActivate: [staffAuthGuard] },
  { path: 'admin/staff-availability', component: AdminStaffAvailabilityComponent, canActivate: [adminAuthGuard] }
];
