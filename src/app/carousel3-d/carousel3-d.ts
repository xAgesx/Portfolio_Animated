import { Component, ChangeDetectionStrategy, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  title: string;
  description: string;
  tags: string[];
  metric: string;
  github: string;
  image: string;
  isWinner?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:'./carousel3-d.html',
  styleUrl:'./carousel3-d.css'
})
export class Carousel3D {
  mouseX = signal(0);
  mouseY = signal(0);
  isScrolled = signal(false);
  isLightMode = signal(false);
  currentIndex = signal(0);
  isMenuOpen = signal(false);

  // Contact Form State
  isSubmitting = signal(false);
  formSubmitted = signal(false);

  projects = signal<Project[]>([
    {
      title: "VR-GameJam Entry: Epi 2026 Winner",
      description: "Led development of a stylized co-op experience. Built and designed a split screen 2-player game with cozy world aesthetics.",
      tags: ["Unity", "C#"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/VR-GameJam",
      image: "/Clean_up_party.png",
      isWinner: true
    },
    {
      title: "Global GameJam 2025: Echoes of Hope",
      description: "Developed an atmospheric puzzle game focusing on narrative depth and unique mechanic implementation within 48 hours.",
      tags: ["Godot", "GDScript"],
      metric: "Ranked Top 10%",
      github: "https://github.com/xAgesx/GGJ2025",
      image: "/Echoes_of_hope.png"
    }
  ]);

  carouselTransform = computed(() => {
    if (typeof window === 'undefined') return 'translateX(0)';
    const width = window.innerWidth;
    const gap = 32;
    
    if (width < 1024) {
      const cardWidth = Math.min(width * 0.85, 800);
      const totalShift = this.currentIndex() * (cardWidth + gap);
      return `translateX(-${totalShift}px)`;
    }
    
    const offset = this.currentIndex() * (800 + 32);
    return `translateX(-${offset}px)`;
  });

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseX.set(e.clientX);
    this.mouseY.set(e.clientY);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 30);
  }

  nextProject() {
    if (this.currentIndex() < this.projects().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevProject() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  toggleTheme() {
    this.isLightMode.update(v => !v);
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
    if (this.isMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (this.isMenuOpen()) this.toggleMenu();
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    this.isSubmitting.set(true);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        this.formSubmitted.set(true);
        form.reset();
      } else {
        const errorData = await response.json();
        console.error('Submission failed', errorData);
      }
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm() {
    this.formSubmitted.set(false);
  }
}