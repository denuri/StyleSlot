import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  searchQuery: string = '';

  features = [
    {
      title: 'Sustainable Products',
      description:
        'Carefully curated products designed to reduce carbon footprint.',
      icon: 'assets/Group 3.png',
    },
    {
      title: 'Eco-Friendly Choices',
      description: 'Make ethical choices promoting responsible sourcing.',
      icon: 'assets/Group 4.png',
    },
    {
      title: 'High-Quality Selection',
      description: 'Reliable products meeting stringent quality standards.',
      icon: 'assets/Group 5.png',
    },
    {
      title: 'Sustainable Packaging',
      description: 'Eco-conscious packaging to minimize environmental impact.',
      icon: 'assets/Group 6.png',
    },
  ];

  reviews = [
    {
      name: 'Sarah Johnson',
      comment: 'I absolutely love my organic cotton tote bag from Taprobane!',
      rating: 5,
      image: 'assets/customers/sarah.jpg',
    },
    {
      name: 'Mark Anderson',
      comment: 'Amazing bamboo toothbrushes!',
      rating: 4,
      image: 'assets/customers/mark.jpg',
    },
    {
      name: 'Emily Lee',
      comment: 'Hemp backpack is fantastic!',
      rating: 5,
      image: 'assets/customers/emily.jpg',
    },
    {
      name: 'Alex Green',
      comment: 'Eco-friendly products changed my life!',
      rating: 4,
      image: 'assets/customers/alex.jpg',
    },
  ];

  /* Slider Logic */
  currentSlide = 0;

  prevSlide() {
    const slider = document.querySelector('.reviews-slider') as HTMLElement;
    slider.scrollBy({ left: -320, behavior: 'smooth' });
  }

  nextSlide() {
    const slider = document.querySelector('.reviews-slider') as HTMLElement;
    slider.scrollBy({ left: 320, behavior: 'smooth' });
  }

  search() {
    console.log('Searching for:', this.searchQuery);
    // Implement search functionality later
  }
}