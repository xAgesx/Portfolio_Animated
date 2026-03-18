import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carousel3D } from './carousel3-d';

describe('Carousel3D', () => {
  let component: Carousel3D;
  let fixture: ComponentFixture<Carousel3D>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carousel3D]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carousel3D);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
