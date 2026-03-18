import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Animated } from './animated';

describe('Animated', () => {
  let component: Animated;
  let fixture: ComponentFixture<Animated>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Animated]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Animated);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
