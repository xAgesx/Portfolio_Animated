import { Component, ChangeDetectionStrategy, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  title: string;
  role: string;
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
  templateUrl:'./carousel.html',
  styleUrl:'./carousel.css'
})
export class Carousel {
  mouseX = signal(0);
  mouseY = signal(0);
  isScrolled = signal(false);
  isLightMode = signal(false);
  currentIndex = signal(0);
  isMenuOpen = signal(false);

projects = signal<Project[]>([
    {
      title: "Taxi Simulation Game",
      role: "Unity Gameplay Engineering Internship",
      description: "End-to-end taxi simulator featuring debt progression system, dynamic day or night cycle, procedural city generation, and sophisticated AI systems for both pedestrians and traffic with complex suspension, mesh deformation, and dynamic tire tracks.",
      tags: ["Unity", "C#", "AI Programming", "Particle Systems"],
      metric: "SIV Games Internship",
      github: "https://github.com/xAgesx",
      image: "https://via.placeholder.com/800x500/111/2563eb?text=Taxi+Simulation",
      isWinner: false
    },
    {
      title: "Fire Training MR Experience",
      role: "Freelance Commercial Project",
      description: "Dynamic Mixed Reality fire training environment for Meta Quest 3 featuring multi-modal controls (hand tracking plus controllers), hazardous scenario orchestration (fire, smoke, electrical hazards), and Firebase backend for session analytics.",
      tags: ["Unity", "XR/MR", "Meta Quest 3", "Firebase", "Hand Tracking"],
      metric: "Freelance Commercial Project",
      github: "https://github.com/xAgesx",
      image: "https://via.placeholder.com/800x500/111/2563eb?text=Fire+Training+MR",
      isWinner: false
    },
    
    {
      title: "VR-GameJam Entry: Epi 2026 Winner",
      role: "Competition Winner",
      description: "Led development of a stylized co-op experience. Built and designed a split screen 2-player game with cozy world aesthetics.",
      tags: ["Unity", "C#"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/VR-GameJam",
      image: "/Clean_up_party.png",
      isWinner: true
    },
    {
      title: "Global GameJam 2026 Winner",
      role: "Competition Winner",
      description: "Championship entry for GGJ 2026. Designed a puzzle game MVP under 48 hours, focusing on cutscenes and ambient environment.",
      tags: ["Unity", "C#", "Rapid Prototyping"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/GlobalGameJam-Entry---Unity",
      image: "/GGG_epi.png",
      isWinner: true
    },
    {
      title: "Aethera Immersive Web",
      role: "Full-Stack Portfolio Project",
      description: "Enterprise-grade Angular or Three.js ecosystem. Integrated Firebase for real-time CRUD, custom Auth, ReCaptcha security and made a simple browser game.",
      tags: ["Angular", "Three.js", "Firebase", "Auth"],
      metric: "Full-stack Web or 3D",
      github: "https://github.com/xAgesx/Aethera-Angular-Three",
      image: "/Aethera.png"
    },
    {
      title: "First VR: Atmospheric Puzzle",
      role: "Portfolio Milestone",
      description: "My foundational VR project. Explored XR Origin fundamentals to create a mood-driven puzzle environment.",
      tags: ["Unity", "XR Origin", "Level Design"],
      metric: "Portfolio Milestone",
      github: "https://github.com/xAgesx/First_VR_Game-Unity",
      image: "First_VR.png"
    },
    {
      title: "SliceMania Mobile",
      role: "Mobile Game Release",
      description: "2D arcade experience for mobile. Utilized the new InputSystem and integrated AdMob for revenue generation.",
      tags: ["Unity 2D", "C#", "AdMob"],
      metric: "Mobile Performance",
      github: "https://github.com/xAgesx/SliceMania-Unity-2D",
      image: "/sliceMania.png"
    },
    {
      title: "Vanilla Java Engine",
      role: "Core Engineering Project",
      description: "Building the engine from scratch. Focused on core physics, rendering loops, and explored the basics of game development.",
      tags: ["Java", "Core Engineering", "No-Engine"],
      metric: "Pure Systems Logic",
      github: "https://github.com/xAgesx/MyFirstGame-Java-",
      image: "/First_Game_Java.png"
    }
  ]);

  trackTransform = computed(() => {
    const width = window.innerWidth;
    const isDesktop = width >= 1024;
    
    if (!isDesktop) {
      return 'translateX(0)';
    }
    
    const offset = this.currentIndex() * (880 + 32);
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
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}