import { Component, ChangeDetectionStrategy, signal, HostListener, effect, OnInit, OnDestroy } from '@angular/core';
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

interface Skill {
  name: string;
  icon: string;
  category: 'engine' | 'xr' | 'web' | 'tools';
}

interface FloatingShape {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  type: 'cube' | 'sphere' | 'pyramid' | 'torus';
  opacity: number;
  hue: number;
}

interface VertexPoint {
  id: number;
  x: number;
  y: number;
  delay: number;
  dur: number;
}

@Component({
  selector: 'app-gaming-hero',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gaming-hero.html',
  styleUrl: './gaming-hero.css'
})
export class GamingHero implements OnInit, OnDestroy {
  mouseX = signal(0);
  mouseY = signal(0);
  isScrolled = signal(false);
  isLightMode = signal(false);
  isMenuOpen = signal(false);
  loaded = signal(false);
  scrollProgress = signal(0);

  // Animated background
  floatingShapes: FloatingShape[] = [];

  vertexPoints = signal<VertexPoint[]>([
    { id: 1, x: 12, y: 18, delay: 0.2, dur: 3.5 },
    { id: 2, x: 85, y: 15, delay: 0.6, dur: 4 },
    { id: 3, x: 8, y: 75, delay: 1.1, dur: 3 },
    { id: 4, x: 90, y: 80, delay: 0.4, dur: 4.5 },
    { id: 5, x: 25, y: 45, delay: 0.8, dur: 3.8 },
    { id: 6, x: 75, y: 55, delay: 1.3, dur: 3.2 },
    { id: 7, x: 45, y: 8, delay: 0.1, dur: 4.2 },
    { id: 8, x: 55, y: 92, delay: 0.9, dur: 3.6 },
  ]);
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  projects = signal<Project[]>([
    {
      title: "VR-GameJam Entry: Epi 2026 Winner",
      description: "Led development of a stylized co-op experience. Built and designed a split screen 2-player game with cozy world aesthetics.",
      tags: ["Unity", "C#", "XR Toolkit", "Multiplayer"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/VR-GameJam",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800",
      isWinner: true
    },
    {
      title: "Global GameJam 2026 Winner",
      description: "Championship entry for GGJ 2026. Designed a puzzle game MVP under 48 hours, focusing on cutscenes and ambient environment.",
      tags: ["Unity", "C#", "Rapid Prototyping", "Level Design"],
      metric: "1st Place Winner",
      github: "https://github.com/xAgesx/GlobalGameJam-Entry---Unity",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
      isWinner: true
    },
    {
      title: "Fire Training MR Experience",
      description: "Dynamic Mixed Reality fire training environment for Meta Quest 3 featuring multi-modal controls (hand tracking + controllers), hazardous scenario orchestration.",
      tags: ["Unity", "XR/MR", "Meta Quest 3", "Hand Tracking", "Firebase"],
      metric: "Commercial Freelance",
      github: "https://github.com/xAgesx",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=800",
      isWinner: false
    },
    {
      title: "Aethera Immersive Web",
      description: "Enterprise-grade Angular/Three.js ecosystem. Integrated Firebase for real-time CRUD, custom Auth, ReCaptcha security and browser-based 3D experiences.",
      tags: ["Angular", "Three.js", "Firebase", "WebXR", "Auth"],
      metric: "Full-stack Web / 3D",
      github: "https://github.com/xAgesx/Aethera-Angular-Three",
      image: "https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?q=80&w=800",
      isWinner: false
    },
    {
      title: "Taxi Simulation Game",
      description: "End-to-end taxi simulator featuring debt progression system, dynamic day/night cycle, procedural city generation, and sophisticated AI systems for pedestrians and traffic.",
      tags: ["Unity", "C#", "AI Programming", "Procedural Gen", "Particle Systems"],
      metric: "SIV Games Internship",
      github: "https://github.com/xAgesx",
      image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?q=80&w=800",
      isWinner: false
    },
    {
      title: "First VR: Atmospheric Puzzle",
      description: "Foundational VR project. Explored XR Origin fundamentals to create a mood-driven puzzle environment.",
      tags: ["Unity", "XR Origin", "Level Design", "Spatial Audio"],
      metric: "Portfolio Milestone",
      github: "https://github.com/xAgesx/First_VR_Game-Unity",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
      isWinner: false
    }
  ]);

  skills = signal<Skill[]>([
    { name: 'Unity', icon: '⬢', category: 'engine' },
    { name: 'Unreal', icon: '◇', category: 'engine' },
    { name: 'XR Toolkit', icon: '⬡', category: 'xr' },
    { name: 'OpenXR', icon: '⟡', category: 'xr' },
    { name: 'Meta Quest', icon: '◆', category: 'xr' },
    { name: 'Three.js', icon: '◈', category: 'web' },
    { name: 'WebXR', icon: '◆', category: 'web' },
    { name: 'WebGL', icon: '◇', category: 'web' },
    { name: 'C#', icon: '{}', category: 'tools' },
    { name: 'TypeScript', icon: '<>', category: 'tools' },
    { name: 'Firebase', icon: '☁', category: 'tools' },
    { name: 'Git', icon: '⌘', category: 'tools' }
  ]);

  stats = [
    { value: '2x', label: 'Game Jam Champion' },
    { value: '5+', label: 'XR Projects Shipped' },
    { value: '3', label: 'Platforms (Quest/PC/Web)' },
    { value: '48h', label: 'Rapid MVP Delivery' }
  ];

  skillCategories: Skill['category'][] = ['engine', 'xr', 'web', 'tools'];

  ngOnInit() {
    setTimeout(() => this.loaded.set(true), 100);
    this.initBackgroundAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.createShapes();
    this.animate();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createShapes() {
    const count = 18;
    this.floatingShapes = [];
    for (let i = 0; i < count; i++) {
      this.floatingShapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 30 + 10,
        speed: Math.random() * 0.2 + 0.03,
        angle: Math.random() * Math.PI * 2,
        type: ['cube', 'sphere'][Math.floor(Math.random() * 2)] as FloatingShape['type'],
        opacity: Math.random() * 0.25 + 0.05,
        hue: Math.random() > 0.5 ? 195 + Math.random() * 20 : 42 + Math.random() * 15
      });
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw and update shapes
    this.floatingShapes.forEach(shape => {
      this.drawShape(shape);
      this.updateShape(shape);
    });

    // Draw connections
    this.drawConnections();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawGrid() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const gridSize = 80;
    const time = Date.now() * 0.0001;

    ctx.save();
    ctx.strokeStyle = this.isLightMode() ? 'rgba(0, 102, 204, 0.04)' : 'rgba(0, 212, 255, 0.06)';
    ctx.lineWidth = 1;

    // Vertical lines with wave
    for (let x = -gridSize; x <= this.canvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      for (let y = 0; y <= this.canvas.height; y += 10) {
        const waveX = x + Math.sin(y * 0.02 + time) * 15;
        if (y === 0) ctx.moveTo(waveX, y);
        else ctx.lineTo(waveX, y);
      }
      ctx.stroke();
    }

    // Horizontal lines with wave
    for (let y = -gridSize; y <= this.canvas.height + gridSize; y += gridSize) {
      ctx.beginPath();
      for (let x = 0; x <= this.canvas.width; x += 10) {
        const waveY = y + Math.cos(x * 0.02 + time) * 15;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawShape(shape: FloatingShape) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 2 + shape.angle) * 0.2 + 0.8;
    const size = shape.size * pulse;

    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(time * shape.speed + shape.angle);
    ctx.globalAlpha = shape.opacity * pulse;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    const isLight = this.isLightMode();
    if (shape.hue > 100) { // Cyan
      gradient.addColorStop(0, isLight ? 'rgba(0, 102, 204, 0.8)' : 'rgba(0, 212, 255, 0.6)');
      gradient.addColorStop(1, isLight ? 'rgba(0, 102, 204, 0)' : 'rgba(0, 212, 255, 0)');
    } else { // Gold
      gradient.addColorStop(0, isLight ? 'rgba(184, 134, 11, 0.8)' : 'rgba(255, 215, 0, 0.6)');
      gradient.addColorStop(1, isLight ? 'rgba(184, 134, 11, 0)' : 'rgba(255, 215, 0, 0)');
    }
    ctx.fillStyle = gradient;
    ctx.strokeStyle = shape.hue > 100
      ? (isLight ? 'rgba(0, 102, 204, 0.4)' : 'rgba(0, 212, 255, 0.3)')
      : (isLight ? 'rgba(184, 134, 11, 0.4)' : 'rgba(255, 215, 0, 0.3)');
    ctx.lineWidth = 1.5;

    switch (shape.type) {
      case 'cube':
        this.drawCube(ctx, size);
        break;
      case 'sphere':
        this.drawSphere(ctx, size);
        break;
      case 'pyramid':
        this.drawPyramid(ctx, size);
        break;
      case 'torus':
        this.drawTorus(ctx, size);
        break;
    }
    ctx.restore();
  }

  private drawCube(ctx: CanvasRenderingContext2D, size: number) {
    const half = size * 0.5;
    const depth = size * 0.4;
    // Isometric cube
    ctx.beginPath();
    ctx.moveTo(-half, -half);
    ctx.lineTo(half, -half);
    ctx.lineTo(half + depth, -half - depth);
    ctx.lineTo(-half + depth, -half - depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(half, -half);
    ctx.lineTo(half + depth, -half - depth);
    ctx.lineTo(half + depth, half - depth);
    ctx.lineTo(half, half);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-half, -half);
    ctx.lineTo(-half + depth, -half - depth);
    ctx.lineTo(-half + depth, half - depth);
    ctx.lineTo(-half, half);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawSphere(ctx: CanvasRenderingContext2D, size: number) {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner highlight
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.15, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
  }

  private drawPyramid(ctx: CanvasRenderingContext2D, size: number) {
    const half = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, half);
    ctx.lineTo(-half, half);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side face
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, half);
    ctx.lineTo(0, half * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  private drawTorus(ctx: CanvasRenderingContext2D, size: number) {
    const outer = size * 0.5;
    const inner = size * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, outer, 0, Math.PI * 2);
    ctx.moveTo(inner, 0);
    ctx.arc(0, 0, inner, 0, Math.PI * 2);
    ctx.fill('evenodd');
    ctx.stroke();
  }

  private updateShape(shape: FloatingShape) {
    if (!this.canvas) return;

    shape.y -= shape.speed * 0.5;
    shape.x += Math.sin(Date.now() * 0.001 * shape.speed + shape.angle) * 0.3;

    // Wrap around
    if (shape.y < -shape.size) {
      shape.y = this.canvas.height + shape.size;
      shape.x = Math.random() * this.canvas.width;
    }
    if (shape.x < -shape.size) shape.x = this.canvas.width + shape.size;
    if (shape.x > this.canvas.width + shape.size) shape.x = -shape.size;
  }

  private drawConnections() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const maxDist = 150;
    const mouseInfluence = 200;

    ctx.save();
    ctx.lineWidth = 0.4;

    for (let i = 0; i < this.floatingShapes.length; i++) {
      const a = this.floatingShapes[i];
      
      // Shape-to-shape connections
      for (let j = i + 1; j < this.floatingShapes.length; j++) {
        const b = this.floatingShapes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.08;
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Mouse connection
      const mdx = this.mouseX() - a.x;
      const mdy = this.mouseY() - a.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < mouseInfluence) {
        const opacity = (1 - mdist / mouseInfluence) * 0.15;
        ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(this.mouseX(), this.mouseY());
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseX.set(e.clientX);
    this.mouseY.set(e.clientY);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 50);
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress.set((scrollTop / docHeight) * 100);
  }

  toggleTheme() {
    this.isLightMode.update(v => !v);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (this.isMenuOpen()) this.toggleMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
    if (this.isMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  getSkillsByCategory(category: Skill['category']) {
    return this.skills().filter(s => s.category === category);
  }
}