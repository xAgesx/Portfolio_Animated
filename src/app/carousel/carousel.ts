import { Component, ChangeDetectionStrategy, signal, HostListener, computed, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Project {
  title: string;
  role: string;
  description: string;
  tags: string[];
  metric: string;
  github: string;
  image: string;
  imageFolder?: string;
  imageManifest?: string[];
  isPrivate?: boolean;
  isWinner?: boolean;
}

interface VertexPoint {
  id: number;
  x: number;
  y: number;
  delay: number;
  dur: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:'./carousel.html',
  styleUrl:'./carousel.css'
})
export class Carousel implements AfterViewInit, OnDestroy {
  mouseX = signal(0);
  mouseY = signal(0);
  isScrolled = signal(false);
  isLightMode = signal(false);
  currentIndex = signal(0);
  isMenuOpen = signal(false);
  selectedProject = signal<Project | null>(null);
  modalImageIndex = signal(0);
  modalDetailsCollapsed = signal(false);
  @ViewChild('modalThumbs') modalThumbs!: ElementRef<HTMLDivElement>;
  @ViewChild('modelContainer') modelContainer!: ElementRef<HTMLDivElement>;

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

  // Three.js model
  private threeScene: THREE.Scene | null = null;
  private threeCamera: THREE.PerspectiveCamera | null = null;
  private threeRenderer: THREE.WebGLRenderer | null = null;
  private threeModel: THREE.Group | null = null;
  private threeAnimationId: number | null = null;
  private modelContainerEl: HTMLDivElement | null = null;

  constructor() {
    effect(() => {
      this.modalImageIndex();
      this.scrollActiveThumbIntoView();
    });
  }

  ngAfterViewInit() {
    this.initModelViewer();
  }

  ngOnDestroy() {
    if (this.threeAnimationId) {
      cancelAnimationFrame(this.threeAnimationId);
    }
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
    }
  }

  private initModelViewer() {
    const container = this.modelContainer?.nativeElement || document.getElementById('model-container');
    if (!container) return;

    this.modelContainerEl = container;

    // Scene
    this.threeScene = new THREE.Scene();

    // Camera
    const rect = container.getBoundingClientRect();
    this.threeCamera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
    this.threeCamera.position.set(-1.2, 2.2, 3.5);

    // Renderer
    this.threeRenderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.threeRenderer.setSize(rect.width, rect.height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.threeRenderer.setClearColor(0x000000, 0);
    this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.threeRenderer.toneMappingExposure = 1.2;
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.threeRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.threeScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.threeScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.5);
    fillLight.position.set(-3, 2, -2);
    this.threeScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
    rimLight.position.set(0, -2, -4);
    this.threeScene.add(rimLight);

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.threeScene.add(ground);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/arcade_machine.glb',
      (gltf) => {
        this.threeModel = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(this.threeModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        this.threeModel.scale.setScalar(scale);
        
        // Recalculate box after scaling
        box.setFromObject(this.threeModel);
        box.getCenter(center);
        this.threeModel.position.sub(center);
        this.threeModel.position.y = -1 + size.y * scale / 2;
        
        // Enable shadows
        this.threeModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Enhance materials
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.metalness = Math.min(mat.metalness + 0.2, 1);
                  mat.roughness = Math.max(mat.roughness - 0.1, 0);
                }
              });
            }
          }
        });
        
        this.threeScene!.add(this.threeModel);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Controls (interactive - click to rotate/zoom/pan)
    const controls = new OrbitControls(this.threeCamera, this.threeRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.3;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    
    // Responsive target position
    const updateTarget = () => {
      const isMobile = window.innerWidth < 768;
      controls.target.set(isMobile ? 0 : -1.0, -0.1, 0);
    };
    updateTarget();
    window.addEventListener('resize', updateTarget);

    // Pause auto-rotate on user interaction, resume after 3s idle
    let autoRotateTimeout: number;
    const pauseAutoRotate = () => {
      controls.autoRotate = false;
      clearTimeout(autoRotateTimeout);
      autoRotateTimeout = window.setTimeout(() => {
        controls.autoRotate = true;
      }, 3000);
    };
    controls.addEventListener('start', pauseAutoRotate);

    // Animation loop
    const animate = () => {
      this.threeAnimationId = requestAnimationFrame(animate);
      
      controls.update();
      
      // Subtle floating animation for model
      if (this.threeModel) {
        this.threeModel.rotation.y += 0.001;
        this.threeModel.position.y = -1 + Math.sin(Date.now() * 0.001) * 0.05;
      }
      
      this.threeRenderer!.render(this.threeScene!, this.threeCamera!);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!this.threeCamera || !this.threeRenderer || !this.modelContainerEl) return;
      const rect = this.modelContainerEl.getBoundingClientRect();
      this.threeCamera.aspect = rect.width / rect.height;
      this.threeCamera.updateProjectionMatrix();
      this.threeRenderer.setSize(rect.width, rect.height);
    };
    window.addEventListener('resize', handleResize);
    
    // Store cleanup
    (this as any)._modelResizeHandler = handleResize;
  }

  techStack = ['Unity', 'C#', 'XR/MR', 'Meta Quest 3', 'Angular', 'Three.js', 'Firebase', 'Java', 'AI Programming', 'Procedural Gen', 'Physics Systems', 'Hand Tracking'];
  tickerDuration = '30s';

  openModal(project: Project) {
    this.selectedProject.set(project);
    this.modalImageIndex.set(0);
    this.modalDetailsCollapsed.set(false);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }

  nextModalImage() {
    const project = this.selectedProject();
    if (project && this.hasMultipleImages(project)) {
      const images = this.getProjectImages(project);
      this.modalImageIndex.update(i => (i + 1) % images.length);
    }
  }

  prevModalImage() {
    const project = this.selectedProject();
    if (project && this.hasMultipleImages(project)) {
      const images = this.getProjectImages(project);
      this.modalImageIndex.update(i => (i - 1 + images.length) % images.length);
    }
  }

  setModalImage(index: number) {
    this.modalImageIndex.set(index);
  }

  toggleModalDetails() {
    this.modalDetailsCollapsed.update(v => !v);
  }

  getGithubLabel(project: Project): string {
    return project.isPrivate ? 'Private' : 'Repo';
  }

  getProjectImages(project: Project): string[] {
    if (project.imageFolder) {
      return [
        project.image,
        `${project.imageFolder}/1.jpg`,
        `${project.imageFolder}/2.jpg`,
        `${project.imageFolder}/3.jpg`,
        `${project.imageFolder}/4.jpg`,
      ];
    }
    if (project.imageManifest) {
      return [project.image, ...project.imageManifest];
    }
    return [project.image];
  }

  hasMultipleImages(project: Project): boolean {
    return !!project.imageFolder || !!project.imageManifest;
  }

projects = signal<Project[]>([
    {
      title: "Taxi Simulation Game",
      role: "Unity Gameplay Engineering Internship",
      description: "End-to-end taxi simulator featuring debt progression system, dynamic day or night cycle, procedural city generation, and sophisticated AI systems for both pedestrians and traffic with complex suspension, mesh deformation, and dynamic tire tracks.",
      tags: ["Unity", "C#", "AI Programming", "Particle Systems"],
      metric: "SIV Games Internship",
      github: "https://github.com/xAgesx",
      image: "/taxiTounsi.png",
      imageManifest: [
        "/Project-Albums/taxiTounsi/Image (1).png",
        "/Project-Albums/taxiTounsi/Image (2).png",
        "/Project-Albums/taxiTounsi/Image (3).png",
        "/Project-Albums/taxiTounsi/Image (4).png",
        "/Project-Albums/taxiTounsi/Image (5).png",
        "/Project-Albums/taxiTounsi/Image (6).png",
        "/Project-Albums/taxiTounsi/Image (7).png",
        "/Project-Albums/taxiTounsi/Image (8).png",
        "/Project-Albums/taxiTounsi/Image (8).png",
      ],
      isPrivate: true,
      isWinner: false
    },
    {
      title: "Fire Training MR Experience",
      role: "Freelance Commercial Project",
      description: "Dynamic Mixed Reality fire training environment for Meta Quest 3 featuring multi-modal controls (hand tracking plus controllers), hazardous scenario orchestration (fire, smoke, electrical hazards), and Firebase backend for session analytics.",
      tags: ["Unity", "XR/MR", "Meta Quest 3", "Firebase", "Hand Tracking"],
      metric: "Freelance Commercial Project",
      github: "https://github.com/xAgesx",
      image: "/MrSceneario.jpg",
      imageManifest: [
        "/Project-Albums/fire-training-mr/Image (1).png",
        "/Project-Albums/fire-training-mr/Image (2).png",
        "/Project-Albums/fire-training-mr/Image (3).png",
        "/Project-Albums/fire-training-mr/Image (4).png",
      ],
      isPrivate: true,
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
      imageManifest: [
        "/Project-Albums/vr-gamejam-epi/Image (1).png",
        "/Project-Albums/vr-gamejam-epi/Image (2).png",
        "/Project-Albums/vr-gamejam-epi/Image (3).png",
      ],
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
      imageManifest: [
        "/Project-Albums/global-gamejam/Image (1).png",
        "/Project-Albums/global-gamejam/Image (2).png",
        "/Project-Albums/global-gamejam/Image (3).png",
      ],
      isWinner: true
    },
    {
      title: "Aethera Immersive Web",
      role: "Full-Stack Portfolio Project",
      description: "Enterprise-grade Angular or Three.js ecosystem. Integrated Firebase for real-time CRUD, custom Auth, ReCaptcha security and made a simple browser game.",
      tags: ["Angular", "Three.js", "Firebase", "Auth"],
      metric: "Full-stack Web or 3D",
      github: "https://github.com/xAgesx/Aethera-Angular-Three",
      image: "/Aethera.png",
      imageManifest: [
        "/Project-Albums/aethera/Image (1).png",
        "/Project-Albums/aethera/Image (2).png",
        "/Project-Albums/aethera/Image (3).png",
      ],
    },
    {
      title: "First VR: Atmospheric Puzzle",
      role: "Portfolio Milestone",
      description: "My foundational VR project. Explored XR Origin fundamentals to create a mood-driven puzzle environment.",
      tags: ["Unity", "XR Origin", "Level Design"],
      metric: "Portfolio Milestone",
      github: "https://github.com/xAgesx/First_VR_Game-Unity",
      image: "First_VR.png",
      imageManifest: [
        "/Project-Albums/first-vr/Image (1).png",
        "/Project-Albums/first-vr/Image (2).png",
        "/Project-Albums/first-vr/Image (3).png",
      ],
    },
    {
      title: "SliceMania Mobile",
      role: "Mobile Game Release",
      description: "2D arcade experience for mobile. Utilized the new InputSystem and integrated AdMob for revenue generation.",
      tags: ["Unity 2D", "C#", "AdMob"],
      metric: "Mobile Performance",
      github: "https://github.com/xAgesx/SliceMania-Unity-2D",
      image: "/sliceMania.png",
      imageManifest: [
        "/Project-Albums/slicemania/Image (1).png",
        "/Project-Albums/slicemania/Image (2).png",
        "/Project-Albums/slicemania/Image (3).png",
      ],
    },
    {
      title: "Vanilla Java Engine",
      role: "Core Engineering Project",
      description: "Building the engine from scratch. Focused on core physics, rendering loops, and explored the basics of game development.",
      tags: ["Java", "Core Engineering", "No-Engine"],
      metric: "Pure Systems Logic",
      github: "https://github.com/xAgesx/MyFirstGame-Java-",
      image: "/First_Game_Java.png",
      imageManifest: [
        "/Project-Albums/java-engine/Image (1).png",
        "/Project-Albums/java-engine/Image (2).png",
        "/Project-Albums/java-engine/Image (3).png",
      ],
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

  private scrollActiveThumbIntoView() {
    const container = this.modalThumbs?.nativeElement;
    const activeThumb = container?.querySelector('.modal-thumb.active');
    if (container && activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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