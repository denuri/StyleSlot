import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { HeroComponent } from "./components/hero/hero.component";
import { FeaturesComponent } from "./components/features/features.component";
import { AppointmentsComponent } from "./components/appointments/appointments.component";
import { FooterComponent } from "./components/footer/footer.component";
import { FeaturedSalonsComponent } from "./components/featured-salons/featured-salons.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, HeroComponent, FeaturesComponent, AppointmentsComponent, FooterComponent, FeaturedSalonsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'StyleSlot';
}
