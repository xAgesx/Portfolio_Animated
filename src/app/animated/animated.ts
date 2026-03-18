import { Component, ChangeDetectionStrategy, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:"./animated.html",
  styleUrl : './animated.css'
})
export class Animated {
  mouseX = signal(0);
  mouseY = signal(0);
  isScrolled = signal(false);
  isLightMode = signal(false);

  projects = signal<Project[]>([
    {
      title: "VR-GameJam Entry: Epi 2026 Winner",
      description: "Led development of a stylized co-op experience. Built and designed a split screen 2-player game with cozy world aesthetics.",
      tags: ["Unity", "C#"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/VR-GameJam",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800",
      isWinner: true
    },
    {
      title: "Global GameJam 2026 Winner",
      description: "Championship entry for GGJ 2026. Designed a puzzle game MVP under 48 hours, focusing on cutscenes and ambient environment.",
      tags: ["Unity", "C#", "Rapid Prototyping"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/GlobalGameJam-Entry---Unity",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
      isWinner: true
    },
    {
      title: "Aethera Immersive Web",
      description: "Enterprise-grade Angular/Three.js ecosystem. Integrated Firebase for real-time CRUD, custom Auth, ReCaptcha security and linked to Firebase.",
      tags: ["Angular", "Three.js", "Firebase", "Auth"],
      metric: "Full-stack Web / 3D",
      github: "https://github.com/xAgesx/Aethera-Angular-Three",
      image: "https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?q=80&w=800"
    },
    {
      title: "First VR: Atmospheric Puzzle",
      description: "My foundational VR project. Explored XR Origin fundamentals to create a mood-driven puzzle environment.",
      tags: ["Unity", "XR Origin", "Level Design"],
      metric: "Portfolio Milestone",
      github: "https://github.com/xAgesx/First_VR_Game-Unity",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=800"
    },
    {
      title: "SliceMania Mobile",
      description: "2D arcade experience for mobile. Utilized the new InputSystem and integrated AdMob for revenue generation.",
      tags: ["Unity 2D", "C#", "AdMob"],
      metric: "Mobile Performance",
      github: "https://github.com/xAgesx/SliceMania-Unity-2D",
      image: "https://images.unsplash.com/photo-1551103756-84ed8ee56042?q=80&w=800"
    },
    {
      title: "Vanilla Java Engine",
      description: "Building the engine from scratch. Focused on core physics, rendering loops, and explored the basics of game development.",
      tags: ["Java", "Core Engineering", "No-Engine"],
      metric: "Pure Systems Logic",
      github: "https://github.com/xAgesx/MyFirstGame-Java-",
      image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=800"
    }
  ]);

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseX.set(e.clientX);
    this.mouseY.set(e.clientY);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleTheme() {
    this.isLightMode.update(v => !v);
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}