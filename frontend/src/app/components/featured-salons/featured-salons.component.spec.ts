import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedSalonsComponent } from './featured-salons.component';

describe('FeaturedSalonsComponent', () => {
  let component: FeaturedSalonsComponent;
  let fixture: ComponentFixture<FeaturedSalonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedSalonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedSalonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
