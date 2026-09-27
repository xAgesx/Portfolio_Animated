import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamingHero } from './gaming-hero';

describe('GamingHero', () => {
  let component: GamingHero;
  let fixture: ComponentFixture<GamingHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamingHero]
    }).compileComponents();

    fixture = TestBed.createComponent(GamingHero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have projects loaded', () => {
    expect(component.projects().length).toBeGreaterThan(0);
  });

  it('should have skills loaded', () => {
    expect(component.skills().length).toBeGreaterThan(0);
  });

  it('should toggle theme', () => {
    const initial = component.isLightMode();
    component.toggleTheme();
    expect(component.isLightMode()).toBe(!initial);
  });

  it('should filter skills by category', () => {
    const xrSkills = component.getSkillsByCategory('xr');
    expect(xrSkills.length).toBeGreaterThan(0);
    expect(xrSkills.every(s => s.category === 'xr')).toBeTrue();
  });
});