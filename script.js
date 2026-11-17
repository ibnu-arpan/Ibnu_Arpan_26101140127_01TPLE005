/**
 * IBNU PERSONAL PORTFOLIO - GALAXY & BLACK HOLE EDITION
 * Interactive Logic, Physics Engine & UI Controls
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. GALAXY & BLACK HOLE CANVAS SIMULATION (PHYSICS & RENDERING)
     ========================================================================== */
  const canvas = document.getElementById("cosmic-canvas");
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Black Hole center coordinates
  let centerX = width / 2;
  let centerY = height * 0.45; // slightly above vertical center to align with hero
  let blackHoleRadius = Math.max(35, Math.min(width, height) * 0.08);

  // Mouse interaction coordinates
  let mouse = {
    x: centerX,
    y: centerY,
    targetX: centerX,
    targetY: centerY,
    isDown: false,
    radius: 120,
  };

  // State flags
  let isWarpSpeed = false;
  let rippleWaves = [];

  // Handle Resize
  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height * 0.45;
    blackHoleRadius = Math.max(35, Math.min(width, height) * 0.08);
  }
  window.addEventListener("resize", handleResize);

  // Track Mouse / Pointer
  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // Click sends a gravitational shockwave ripple
  window.addEventListener("click", (e) => {
    // Only trigger if click is not on interactive UI buttons
    if (
      e.target.tagName !== "BUTTON" &&
      e.target.tagName !== "A" &&
      !e.target.closest("button") &&
      !e.target.closest("a")
    ) {
      createGravitationalShockwave(e.clientX, e.clientY);
    }
  });

  function createGravitationalShockwave(x, y) {
    rippleWaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: Math.min(width, height) * 0.4,
      opacity: 0.8,
      speed: 8,
    });
  }

  // ---------------- STARFIELD SIMULATION ----------------
  const STAR_COUNT = Math.min(400, Math.floor((width * height) / 3000));
  const stars = [];

  class Star {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = (Math.random() - 0.5) * width * 1.5 + centerX;
      this.y = (Math.random() - 0.5) * height * 1.5 + centerY;
      this.size = Math.random() * 1.8 + 0.3;
      this.baseAlpha = Math.random() * 0.7 + 0.3;
      this.alpha = initial ? this.baseAlpha : 0;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.twinklePhase = Math.random() * Math.PI * 2;

      // Star color variation (pure white, soft blue, warm orange-gold)
      const colorRoll = Math.random();
      if (colorRoll > 0.7) {
        this.color = "255, 180, 80"; // cosmic amber
      } else if (colorRoll > 0.4) {
        this.color = "160, 210, 255"; // blue-white
      } else {
        this.color = "255, 255, 255"; // pure white
      }
    }

    update() {
      this.twinklePhase += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.25;

      // Parallax pull slightly towards mouse
      const dx = (mouse.x - centerX) * 0.0003;
      const dy = (mouse.y - centerY) * 0.0003;
      this.x -= dx;
      this.y -= dy;

      if (isWarpSpeed) {
        // Warp streak effect towards center
        const toCenterX = centerX - this.x;
        const toCenterY = centerY - this.y;
        this.x += toCenterX * 0.04;
        this.y += toCenterY * 0.04;

        if (Math.hypot(toCenterX, toCenterY) < blackHoleRadius * 1.2) {
          this.reset();
        }
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, Math.min(1, this.alpha))})`;
      ctx.beginPath();

      if (isWarpSpeed) {
        // Draw elongated warp streak
        const angle = Math.atan2(centerY - this.y, centerX - this.x);
        const streakLength = this.size * 12;
        ctx.strokeStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.lineWidth = this.size;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(angle) * streakLength,
          this.y - Math.sin(angle) * streakLength,
        );
        ctx.stroke();
      } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  // ---------------- SHOOTING STARS (METEORS) ----------------
  const meteors = [];

  class Meteor {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * (height * 0.5);
      this.length = Math.random() * 80 + 40;
      this.speed = Math.random() * 12 + 10;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // ~45 degrees diagonal
      this.opacity = 1;
      this.active = false;
    }

    spawn() {
      this.reset();
      this.active = true;
    }

    update() {
      if (!this.active) return;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= 0.015;

      if (this.opacity <= 0 || this.x > width || this.y > height) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      ctx.save();
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 200, 100, ${this.opacity})`);
      grad.addColorStop(0.3, `rgba(255, 119, 0, ${this.opacity * 0.7})`);
      grad.addColorStop(1, "rgba(255, 80, 0, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.restore();
    }
  }

  for (let i = 0; i < 3; i++) {
    meteors.push(new Meteor());
  }

  // Meteor Spawner Timer
  setInterval(() => {
    const inactive = meteors.find((m) => !m.active);
    if (inactive && Math.random() > 0.4) {
      inactive.spawn();
    }
  }, 4000);

  // ---------------- BLACK HOLE ACCRETION PARTICLES ----------------
  const PARTICLE_COUNT = Math.min(800, Math.floor((width * height) / 1800));
  const particles = [];

  class AccretionParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      // Orbital distance from center
      const maxDist = Math.max(width, height) * 0.55;
      const minDist = blackHoleRadius * 1.08;

      // Power distribution to bunch particles closer to accretion disk
      const rFactor = Math.pow(Math.random(), 2.2);
      this.distance = initial
        ? minDist + rFactor * (maxDist - minDist)
        : maxDist * (0.8 + Math.random() * 0.2);

      this.angle = Math.random() * Math.PI * 2;
      this.verticalAngle = (Math.random() - 0.5) * 0.25; // disk inclination

      // Keplerian orbital velocity (faster when closer to singularity: v ~ 1/sqrt(r))
      this.speed =
        (Math.sqrt(blackHoleRadius / this.distance) * 0.05 + 0.008) *
        (isWarpSpeed ? 3.5 : 1);

      // Inward gravitational drift (spiraling into singularity)
      this.inwardDrift =
        (0.2 + (blackHoleRadius / this.distance) * 0.8) * (isWarpSpeed ? 3 : 1);

      this.size = Math.random() * 2.2 + 0.8;
      this.life = Math.random() * 1;

      // Color based on temperature & distance
      this.updateColor();
    }

    updateColor() {
      // Hotter (white/bright orange) near center, cooler (deep red/purple) outer
      const normDist =
        (this.distance - blackHoleRadius) / (blackHoleRadius * 4);
      if (normDist < 0.3) {
        this.color = "255, 245, 220"; // incandescent white-hot
      } else if (normDist < 0.8) {
        this.color = "255, 140, 20"; // fiery plasma orange
      } else if (normDist < 1.8) {
        this.color = "255, 75, 10"; // deep amber red
      } else {
        this.color = "160, 40, 210"; // relativistic violet
      }
    }

    update() {
      // Orbital movement
      this.angle += this.speed * (isWarpSpeed ? 3 : 1);

      // Spiral inward towards event horizon
      this.distance -= this.inwardDrift;

      // When particle enters event horizon -> consumed! Flash and respawn
      if (this.distance <= blackHoleRadius * 0.95) {
        this.reset();
      }

      // Gravitational ripple interaction
      for (const ripple of rippleWaves) {
        const px = centerX + Math.cos(this.angle) * this.distance;
        const py = centerY + Math.sin(this.angle) * (this.distance * 0.38);
        const distToRipple = Math.hypot(px - ripple.x, py - ripple.y);

        if (Math.abs(distToRipple - ripple.radius) < 25) {
          this.distance += 4; // push outward by shockwave
        }
      }

      this.updateColor();
    }

    draw() {
      // 3D Elliptical disk projection (tilted accretion disk)
      // The accretion disk is tilted at an angle (~38% vertical squash)
      const diskTilt = 0.38;
      const cosA = Math.cos(this.angle);
      const sinA = Math.sin(this.angle);

      // Relativistic Doppler effect: approaching side (moving left/down) is brighter!
      const dopplerFactor = 0.5 + 0.5 * -cosA;
      const alpha = Math.max(0.1, Math.min(1, dopplerFactor * 0.9));

      const px = centerX + cosA * this.distance;
      const py = centerY + sinA * (this.distance * diskTilt);

      // Gravitational Lensing behind Black Hole:
      // If particle is behind black hole (sinA < 0) and close, warp it above/below the shadow!
      let drawY = py;
      if (sinA < 0 && Math.abs(cosA * this.distance) < blackHoleRadius * 1.5) {
        const lensShift = Math.sin(this.angle) * blackHoleRadius * 0.45;
        drawY += lensShift;
      }

      ctx.save();
      ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        px,
        drawY,
        this.size * (0.8 + dopplerFactor * 0.4),
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Subtle glow for closer energetic particles
      if (this.distance < blackHoleRadius * 2.5 && Math.random() > 0.6) {
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new AccretionParticle());
  }

  // ---------------- DRAW CENTRAL BLACK HOLE & ACCRETION DISK ----------------
  function drawBlackHole() {
    ctx.save();

    // 1. Outer Gravitational Lensing Halo (Relativistic Einstein Ring)
    const haloRadius = blackHoleRadius * 2.8;
    const outerHaloGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      blackHoleRadius * 0.9,
      centerX,
      centerY,
      haloRadius,
    );
    outerHaloGrad.addColorStop(0, "rgba(255, 110, 0, 0.45)");
    outerHaloGrad.addColorStop(0.25, "rgba(255, 70, 0, 0.25)");
    outerHaloGrad.addColorStop(0.65, "rgba(120, 20, 180, 0.12)");
    outerHaloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = outerHaloGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Accretion Disk Back Warp Arc (Gravitational distortion over the pole)
    ctx.save();
    ctx.filter = "blur(6px)";
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY - blackHoleRadius * 0.2,
      blackHoleRadius * 1.8,
      blackHoleRadius * 1.1,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.strokeStyle = "rgba(255, 140, 20, 0.4)";
    ctx.lineWidth = blackHoleRadius * 0.35;
    ctx.stroke();
    ctx.restore();

    // 3. Photon Ring (Extremely thin, incandescent white-gold ring right outside horizon)
    ctx.save();
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(255, 235, 180, 0.95)";
    ctx.lineWidth = Math.max(2, blackHoleRadius * 0.05);
    ctx.beginPath();
    ctx.arc(centerX, centerY, blackHoleRadius * 1.05, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. THE EVENT HORIZON SINGULARITY (Pure Deep Cosmic Black Void)
    ctx.save();
    ctx.fillStyle = "#010003";
    ctx.beginPath();
    ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Front Accretion Disk Forefront (The brighter half crossing in front)
    ctx.save();
    const diskGrad = ctx.createLinearGradient(
      centerX - blackHoleRadius * 2,
      centerY,
      centerX + blackHoleRadius * 2,
      centerY,
    );
    // Doppler asymmetry: Left side is blue-shifted/white-hot approaching, right side is red-shifted/dimmer
    diskGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    diskGrad.addColorStop(0.2, "rgba(255, 160, 20, 0.95)");
    diskGrad.addColorStop(0.5, "rgba(255, 100, 0, 0.7)");
    diskGrad.addColorStop(0.8, "rgba(200, 40, 10, 0.45)");
    diskGrad.addColorStop(1, "rgba(120, 10, 60, 0.2)");

    ctx.filter = "blur(4px)";
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      blackHoleRadius * 2.2,
      blackHoleRadius * 0.35,
      0,
      0,
      Math.PI,
    );
    ctx.strokeStyle = diskGrad;
    ctx.lineWidth = blackHoleRadius * 0.32;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ---------------- RIPPLE / GRAVITATIONAL WAVE ANIMATION ----------------
  function updateAndDrawRipples() {
    for (let i = rippleWaves.length - 1; i >= 0; i--) {
      const ripple = rippleWaves[i];
      ripple.radius += ripple.speed;
      ripple.opacity -= 0.015;

      if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
        rippleWaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = `rgba(255, 140, 20, ${ripple.opacity})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff7700";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------- MAIN SIMULATION LOOP ----------------
  function animateCosmos() {
    // Smooth mouse coordinates interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Trail effect background
    ctx.fillStyle = "rgba(2, 0, 6, 0.35)";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Starfield
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    // 2. Draw Meteors
    for (let i = 0; i < meteors.length; i++) {
      meteors[i].update();
      meteors[i].draw();
    }

    // 3. Draw Back Particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // 4. Draw Central Black Hole Singularity & Disk
    drawBlackHole();

    // 5. Draw Gravitational Shockwaves
    updateAndDrawRipples();

    requestAnimationFrame(animateCosmos);
  }

  // Start Animation Loop
  animateCosmos();

  /* ==========================================================================
     2. DYNAMIC TYPEWRITER EFFECT (TEKS MENGETIK SENDIRI BERGANTIAN)
     ========================================================================== */
  const typewriterElement = document.getElementById("typewriter");

  // Rotating titles as specifically requested by user ("seperti 'Amatir Developer', dll.")
  const roles = [
    "Mahasiswa UNPAM",
    "Teknik Informatika",
    "Amatir Developer",
    "Network Engineer",
    "Fullstack Enthusiast",
    "Tukang Tidur",
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeRole() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      // Backspacing
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      // Typing forward
      typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 110;
    }

    // Finished typing current word
    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2200; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeRole, typingSpeed);
  }

  // Initialize Typewriter
  if (typewriterElement) {
    setTimeout(typeRole, 800);
  }

  /* ==========================================================================
     3. FLOATING NAVBAR (SCROLLSPY, GLOW & MOBILE TOGGLE)
     ========================================================================== */
  const navbar = document.getElementById("main-navbar");
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileDropdown = document.getElementById("mobile-dropdown");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const sections = document.querySelectorAll("section");

  // Mobile Menu Toggle
  if (mobileToggle && mobileDropdown) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileDropdown.classList.contains("open");
      if (isOpen) {
        mobileDropdown.classList.remove("open");
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
      } else {
        mobileDropdown.classList.add("open");
        mobileToggle.classList.add("active");
        mobileToggle.setAttribute("aria-expanded", "true");
      }
    });

    // Close mobile menu on clicking any link
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileDropdown.classList.remove("open");
        mobileToggle.classList.remove("active");
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target) && !mobileDropdown.contains(e.target)) {
        mobileDropdown.classList.remove("open");
        mobileToggle.classList.remove("active");
      }
    });
  }

  // Scrollspy & Active Link Highlight
  window.addEventListener("scroll", () => {
    let currentSectionId = "";
    const scrollPosition = window.scrollY + 250;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Update active class on desktop navbar
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });

    // Update active class on mobile menu
    mobileLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });

    // Back to top button visibility
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  });

  /* ==========================================================================
     4. ANIMATED STATISTICS COUNTERS (ON SCROLL VIEWPORT)
     ========================================================================== */
  const statCounters = document.querySelectorAll(".stat-counter");
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateCounters();
        }
      });
    },
    { threshold: 0.35 },
  );

  const statsSection = document.getElementById("statistik");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function animateCounters() {
    statCounters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute("data-target"));
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutQuad)
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.floor(easeProgress * target);

        counter.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  /* ==========================================================================
     5. PROJECT FILTERS & MODAL POPUP SYSTEM
     ========================================================================== */
  // Filter Buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Set active button
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filterValue === "all" || category === filterValue) {
          card.style.display = "flex";
          card.style.animation = "fadeInCard 0.4s ease forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Project Modal Database
  const projectDetailsData = {
    "cosmic-market": {
      title: "Cosmic Market - E-Commerce Platform",
      badge: "Web App",
      icon: "fa-cart-shopping",
      description:
        "Platform e-commerce bertema futuristik luar angkasa dengan arsitektur frontend modern. Dilengkapi katalog dinamis, pencarian instan, filter kategori pintar, keranjang belanja stateful dengan sinkronisasi local storage, serta alur checkout mulus.",
      features: [
        "Katalog produk interaktif dengan kartu beranimasi hover 3D",
        "Penyimpanan keranjang belanja persisten (Local Storage)",
        "Sistem kalkulasi pajak, diskon kode promo & estimasi ongkos kirim otomatis",
        "Responsif sempurna di semua layar gawai (Mobile, Tablet, Desktop)",
      ],
      tags: ["React.js", "Tailwind CSS", "Context API", "Vite", "Lucide Icons"],
    },
    "singularity-sim": {
      title: "Black Hole Singularity Simulator",
      badge: "Eksperimen Interaktif",
      icon: "fa-circle-nodes",
      description:
        "Simulasi fisika ruang angkasa interaktif yang memodelkan gaya tarik gravitasi lubang hitam (Schwarzschild Singularity), pembelokan cahaya relativistik (Gravitational Lensing), dan piringan akresi berkecepatan tinggi.",
      features: [
        "Engine 1.000+ partikel gravitasi berbasis Canvas 2D murni 60 FPS",
        "Simulasi efek Doppler (pendekatan gelombang cahaya lebih terang)",
        "Respon interaktif terhadap kursor mouse dan gelombang kejut sentuhan",
        "Generator audio kosmik sintetis berbasis Web Audio API",
      ],
      tags: [
        "HTML5 Canvas",
        "Vanilla JavaScript",
        "Web Audio API",
        "Physics Math",
      ],
    },
    "astro-analytics": {
      title: "Astro Analytics - Cyber Dashboard",
      badge: "Frontend & UI",
      icon: "fa-chart-line",
      description:
        "Dashboard analitik metrik performa web modern berpenampilan dark mode glassmorphism. Menyajikan data pengguna, trafik pengunjung, transaksi bulanan, dan monitor kesehatan server.",
      features: [
        "Visualisasi grafik data interaktif (Line Chart, Doughnut Chart)",
        "Sistem filter rentang waktu (Harian, Mingguan, Bulanan)",
        "Toggle tema kontras tinggi dan ekspor ringkasan laporan CSV",
        "Desain adaptif dengan sidebar navigasi yang dapat dilipat",
      ],
      tags: [
        "JavaScript ES6+",
        "Chart.js",
        "Glassmorphism CSS",
        "Responsive Grid",
      ],
    },
    "orbit-task": {
      title: "Orbit Task Planner - Kanban Board",
      badge: "Web App",
      icon: "fa-list-check",
      description:
        "Aplikasi manajemen produktivitas berbasis metode Kanban visual. Pengguna dapat merencanakan ide, melacak proses pengerjaan, dan menyelesaikan daftar pekerjaan dengan kontrol seret dan lepas (drag-and-drop).",
      features: [
        "Fitur Drag & Drop intuitif antar kolom status (To-Do, In Progress, Done)",
        "Label warna prioritas dan tenggat waktu (deadline reminder)",
        "Penyimpanan data lokal otomatis tanpa perlu login server",
        "Pencarian dan penyaringan kartu tugas berdasarkan tag",
      ],
      tags: ["JavaScript", "HTML5 Drag & Drop API", "LocalStorage", "CSS Grid"],
    },
    "skypulse-weather": {
      title: "SkyPulse - Prakiraan Cuaca Real-Time",
      badge: "Frontend & API",
      icon: "fa-cloud-sun",
      description:
        "Aplikasi pelacak kondisi atmosfer dan cuaca global yang terkoneksi langsung ke OpenWeather RESTful API. Dilengkapi animasi cuaca adaptif yang berubah sesuai waktu dan kondisi langit aktual.",
      features: [
        "Deteksi lokasi otomatis via Geolocation API browser",
        "Informasi komprehensif: Suhu, Kelembaban, Kecepatan Angin, Indeks UV",
        "Prakiraan cuaca berkala per jam dan 7 hari ke depan",
        "Animasi visual kondisi cuaca dinamis (Hujan, Berawan, Badai)",
      ],
      tags: ["RESTful API", "Async/Await", "Geolocation API", "CSS Keyframes"],
    },
    "galaxy-portfolio": {
      title: "Ibnu Personal Galaxy Portfolio",
      badge: "Portofolio Kreatif",
      icon: "fa-id-badge",
      description:
        "Website portofolio yang sedang Anda jelajahi saat ini! Dirancang khusus dengan perpaduan tema Dark Mode Galaxy, simulasi Black Hole aktif, navbar melayang berefek neon oren menyala, dan performa tinggi tanpa framework berat.",
      features: [
        "Efek visual canvas black hole & partikel gravitasi kustom",
        "Navbar melayang di tengah atas dengan pendaran neon akresi oren",
        "Teks judul mengetik sendiri bergantian (Typewriter Effect)",
        "Riwayat pendidikan, pengalaman kerja, serta statistik interaktif",
        "Audio suasana kosmik ambient sintetis",
      ],
      tags: [
        "Semantic HTML5",
        "Modern CSS Variables",
        "Canvas 2D",
        "JavaScript ES6",
      ],
    },
  };

  const modal = document.getElementById("project-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalDoneBtn = document.getElementById("modal-done-btn");
  const modalTitle = document.getElementById("modal-title");
  const modalBadge = document.getElementById("modal-badge");
  const modalDesc = document.getElementById("modal-description");
  const modalFeaturesList = document.getElementById("modal-features");
  const modalTechTags = document.getElementById("modal-tech-tags");
  const modalIconBanner = document.getElementById("modal-icon-banner");

  // Open Modal Handler
  document.querySelectorAll(".open-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const projectId = btn.getAttribute("data-project");
      const data = projectDetailsData[projectId];

      if (data && modal) {
        modalTitle.textContent = data.title;
        modalBadge.textContent = data.badge;
        modalDesc.textContent = data.description;
        modalIconBanner.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;

        // Render Features
        modalFeaturesList.innerHTML = "";
        data.features.forEach((feat) => {
          const li = document.createElement("li");
          li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${feat}</span>`;
          modalFeaturesList.appendChild(li);
        });

        // Render Tech Tags
        modalTechTags.innerHTML = "";
        data.tags.forEach((tag) => {
          const span = document.createElement("span");
          span.textContent = tag;
          modalTechTags.appendChild(span);
        });

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // Close Modal Handler
  function closeModal() {
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModal();
    }
  });

  /* ==========================================================================
     6. CONTACT FORM HANDLING & TOAST FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const copyEmailBtn = document.getElementById("copy-email-btn");

  // Copy Email Button
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = "ibnu.developer@gmail.com";
      navigator.clipboard
        .writeText(email)
        .then(() => {
          showToast("Alamat email berhasil disalin ke clipboard! 📋");
        })
        .catch(() => {
          showToast("Email: ibnu.developer@gmail.com");
        });
    });
  }

  // Form Submission
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("sender-name");
      const emailInput = document.getElementById("sender-email");
      const subjectInput = document.getElementById("sender-subject");
      const messageInput = document.getElementById("sender-message");

      let isValid = true;

      // Reset errors
      document
        .querySelectorAll(".form-error")
        .forEach((el) => (el.textContent = ""));

      if (!nameInput.value.trim()) {
        document.getElementById("name-error").textContent =
          "Mohon masukkan nama Anda.";
        isValid = false;
      }

      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        document.getElementById("email-error").textContent =
          "Format alamat email tidak valid.";
        isValid = false;
      }

      if (!subjectInput.value.trim()) {
        document.getElementById("subject-error").textContent =
          "Mohon masukkan subjek pesan.";
        isValid = false;
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        document.getElementById("message-error").textContent =
          "Pesan minimal berisi 10 karakter.";
        isValid = false;
      }

      if (!isValid) return;

      // Simulated sending
      const submitBtn = document.getElementById("submit-btn");
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Mentransmisikan Sinyal...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-rocket"></i> <span>Luncurkan Pesan</span>';

        formStatus.className = "form-status success";
        formStatus.innerHTML =
          '<i class="fa-solid fa-circle-check"></i> Transmisi berhasil diterima! Terima kasih telah menghubungi Ibnu.';
        contactForm.reset();

        showToast("Pesan transmisi berhasil terkirim! 🚀");

        setTimeout(() => {
          formStatus.style.display = "none";
        }, 6000);
      }, 1400);
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Toast Notification Helper
  function showToast(message) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-meteor"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px)";
      toast.style.transition = "all 0.35s ease";
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }

  /* ==========================================================================
     7. COSMIC AUDIO AMBIENT SYNTHESIZER (WEB AUDIO API)
     ========================================================================== */
  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundIcon = document.getElementById("sound-icon");
  let audioCtx = null;
  let isAudioPlaying = false;
  let droneNodes = null;

  function initCosmicAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Master Gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low frequency sub-drone (55Hz - A1 fundamental pitch)
      const subOsc = audioCtx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(55, audioCtx.currentTime);

      // Warm harmonic (110Hz - A2)
      const harmOsc = audioCtx.createOscillator();
      harmOsc.type = "triangle";
      harmOsc.frequency.setValueAtTime(110, audioCtx.currentTime);

      const harmGain = audioCtx.createGain();
      harmGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      harmOsc.connect(harmGain);
      harmGain.connect(masterGain);

      // LFO for slow cosmic breathing
      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // ~8 sec wave
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
      lfo.connect(lfoGain);

      // Lowpass resonant filter
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(160, audioCtx.currentTime);
      filter.Q.setValueAtTime(3.5, audioCtx.currentTime);
      lfoGain.connect(filter.frequency);

      subOsc.connect(filter);
      filter.connect(masterGain);

      subOsc.start();
      harmOsc.start();
      lfo.start();

      droneNodes = { subOsc, harmOsc, lfo, masterGain };
    } catch (err) {
      console.warn("Web Audio API not supported on this browser:", err);
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      if (!audioCtx) {
        initCosmicAudio();
        isAudioPlaying = true;
        soundIcon.className = "fa-solid fa-volume-high";
        soundToggleBtn.style.color = "#fff";
        soundToggleBtn.style.background = "var(--orange-bright)";
        showToast("Suasana Kosmik Aktif 🪐 (Web Audio Synth)");
        return;
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
        isAudioPlaying = true;
        soundIcon.className = "fa-solid fa-volume-high";
        soundToggleBtn.style.background = "var(--orange-bright)";
        soundToggleBtn.style.color = "#030008";
        showToast("Audio Suasana Kosmik Dinyalakan");
      } else if (audioCtx.state === "running") {
        audioCtx.suspend();
        isAudioPlaying = false;
        soundIcon.className = "fa-solid fa-volume-xmark";
        soundToggleBtn.style.background = "rgba(14, 6, 28, 0.8)";
        soundToggleBtn.style.color = "var(--orange-bright)";
        showToast("Audio Suasana Kosmik Dimatikan");
      }
    });
  }

  /* ==========================================================================
     8. WARP SPEED MODE TOGGLE
     ========================================================================== */
  const warpToggleBtn = document.getElementById("warp-toggle-btn");
  const warpIcon = document.getElementById("warp-icon");

  if (warpToggleBtn) {
    warpToggleBtn.addEventListener("click", () => {
      isWarpSpeed = !isWarpSpeed;
      if (isWarpSpeed) {
        warpToggleBtn.style.background = "var(--orange-bright)";
        warpToggleBtn.style.color = "#030008";
        warpToggleBtn.style.boxShadow = "0 0 25px #ff7700";
        showToast("⚡ Mode Kecepatan Cahaya (Warp Speed) Diaktifkan!");
      } else {
        warpToggleBtn.style.background = "rgba(14, 6, 28, 0.8)";
        warpToggleBtn.style.color = "var(--orange-bright)";
        warpToggleBtn.style.boxShadow = "";
        showToast("Kecepatan Orbit Normal Kembali 🌌");
      }
    });
  }

  /* ==========================================================================
     9. BACK TO TOP BUTTON
     ========================================================================== */
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // Trigger small ripple at top center
      setTimeout(() => {
        createGravitationalShockwave(centerX, centerY);
      }, 300);
    });
  }

  // Set current year in footer dynamically
  const currentYearSpan = document.getElementById("current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
const cosmicAudio = document.getElementById("bg-cosmic-audio");
const soundToggleBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-icon");
let isMusicPlaying = false;

// Atur volume awal (30% agar nyaman didengar)
cosmicAudio.volume = 0.3;

// Fungsi klik pada tombol Kosmik Audio bawaan
soundToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (isMusicPlaying) {
    cosmicAudio.pause();
    soundIcon.className = "fa-solid fa-volume-xmark"; // Ikon mute
    soundToggleBtn.classList.remove("active");
    isMusicPlaying = false;
  } else {
    cosmicAudio.play();
    soundIcon.className = "fa-solid fa-volume-high"; // Ikon suara aktif
    soundToggleBtn.classList.add("active");
    isMusicPlaying = true;
  }
});

// Opsional: Otomatis menyala saat pengunjung mengklik area mana pun pertama kali
document.body.addEventListener(
  "click",
  () => {
    if (!isMusicPlaying) {
      cosmicAudio
        .play()
        .then(() => {
          soundIcon.className = "fa-solid fa-volume-high";
          soundToggleBtn.classList.add("active");
          isMusicPlaying = true;
        })
        .catch(() => {});
    }
  },
  { once: true },
);
