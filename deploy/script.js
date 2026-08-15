/**
 * CYBERFICTION PORTFOLIO - CORE LOGIC & 3D CANVAS SCRUBBER
 * Built with Lenis, GSAP ScrollTrigger, and HTML5 High-DPI Canvas
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================================================
     0. SUPABASE DATABASE CONFIG (Contact form message storage)
        Fill these with your free Supabase project values:
        URL = Project Settings > API > Project URL
        ANON KEY = Project Settings > API > anon public key
     ======================================================================== */
  const SUPABASE_URL = "https://ptevponzruitllizlchj.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZXZwb256cnVpdGxsaXpsY2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzY2NjIsImV4cCI6MjEwMjM1MjY2Mn0.7CbZ7CTqE1IHCurfPrVDqIwTavBluILUX5L7L4dX1Xk";

  const supabase =
    typeof window.supabase !== "undefined" &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE") &&
    !SUPABASE_ANON_KEY.includes("PASTE")
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

  /* ========================================================================
     1. AUDIO SYNTHESIZER ENGINE (Web Audio API)
     ======================================================================== */
  class CyberAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem("cyber_sound") === "true";
      this.initUI();
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    initUI() {
      const btn = document.getElementById("sound-toggle");
      const iconOn = document.getElementById("sound-icon-on");
      const iconOff = document.getElementById("sound-icon-off");

      const updateIcons = () => {
        if (this.enabled) {
          iconOn.style.display = "block";
          iconOff.style.display = "none";
        } else {
          iconOn.style.display = "none";
          iconOff.style.display = "block";
        }
      };

      updateIcons();

      if (btn) {
        btn.addEventListener("click", () => {
          this.init();
          this.enabled = !this.enabled;
          localStorage.setItem("cyber_sound", this.enabled);
          updateIcons();
          if (this.enabled) this.playTone(600, 0.08, "sine");
        });
      }
    }

    playTone(freq = 440, duration = 0.05, type = "sine", volume = 0.06) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Fallback silently if audio context is blocked
      }
    }

    playHover() {
      this.playTone(880, 0.03, "sine", 0.03);
    }

    playClick() {
      this.playTone(420, 0.06, "triangle", 0.08);
    }

    playSuccess() {
      if (!this.enabled) return;
      this.playTone(523.25, 0.08, "sine", 0.05);
      setTimeout(() => this.playTone(659.25, 0.08, "sine", 0.05), 80);
      setTimeout(() => this.playTone(783.99, 0.15, "sine", 0.05), 160);
    }
  }

  const soundFX = new CyberAudioEngine();

  // Attach hover sounds to buttons & links
  document.querySelectorAll("button, a, .project-card, .skill-pill, .terminal-chip").forEach(el => {
    el.addEventListener("mouseenter", () => soundFX.playHover());
    el.addEventListener("click", () => soundFX.playClick());
  });


  /* ========================================================================
     2. THEME ENGINE (Cyberfiction Light ↔ Obsidian Dark)
     ======================================================================== */
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIconMoon = document.getElementById("theme-icon-moon");
  const themeIconSun = document.getElementById("theme-icon-sun");

  const getInitialTheme = () => {
    const saved = localStorage.getItem("cyber_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cyber_theme", theme);
    if (theme === "dark") {
      themeIconMoon.style.display = "none";
      themeIconSun.style.display = "block";
    } else {
      themeIconMoon.style.display = "block";
      themeIconSun.style.display = "none";
    }
  };

  const currentTheme = getInitialTheme();
  setTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme");
      const next = active === "dark" ? "light" : "dark";
      setTheme(next);
      soundFX.playTone(next === "dark" ? 300 : 700, 0.1, "sine");
    });
  }


  /* ========================================================================
     3. LENIS SMOOTH SCROLL & GSAP SYNC
     ======================================================================== */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // Smooth anchor link click handling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "#projects") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetElement, { offset: -70 });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Back to top button
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mobile Nav Drawer
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  const setMobileMenu = (open) => {
    if (!mobileMenu) return;
    const isOpen = typeof open === "boolean" ? open : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", isOpen);
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("menu-open", isOpen);
    if (mobileMenuBtn) mobileMenuBtn.classList.toggle("active", isOpen);
    if (mobileMenuClose) mobileMenuClose.classList.toggle("active", isOpen);
    if (lenis) {
      if (isOpen) lenis.stop();
      else lenis.start();
    }
    soundFX.playClick();
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => setMobileMenu());
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => setMobileMenu(false));
  }
  document.querySelectorAll("[data-mobile-close]").forEach((el) => {
    el.addEventListener("click", () => setMobileMenu(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) {
      setMobileMenu(false);
    }
  });


  /* ========================================================================
     4. 300-FRAME 3D IMAGE SEQUENCE PRELOADER & CANVAS SCRUBBER
     ======================================================================== */
  const canvas = document.getElementById("cyber-canvas");
  const ctx = canvas.getContext("2d");
  const frameCount = 300;
  const images = [];
  const imageSeq = { frame: 0 };
  let loadedCount = 0;

  // Preloader DOM references
  const preloader = document.getElementById("preloader");
  const progressBar = document.getElementById("loader-progress-bar");
  const percentNum = document.getElementById("loader-percent-num");
  const statusText = document.getElementById("loader-status-text");
  const enterBtn = document.getElementById("enter-btn");

  const getFramePath = (index) => {
    const padded = String(index + 1).padStart(4, "0");
    return `assets/frames/male${padded}.jpg`;
  };

  // High-DPI Canvas Scaling
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    renderFrame();
  }

  window.addEventListener("resize", resizeCanvas);

  function renderFrame() {
    if (!images[imageSeq.frame] || !images[imageSeq.frame].complete) return;
    const img = images[imageSeq.frame];
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Cover aspect-ratio math
    const hRatio = w / img.width;
    const vRatio = h / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (w - img.width * ratio) / 2;
    const centerShift_y = (h - img.height * ratio) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  }

  // Preload frames
  function startPreloading() {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / frameCount) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (percentNum) percentNum.textContent = `${percent}%`;

        if (loadedCount === 1) {
          resizeCanvas();
        }

        if (loadedCount >= frameCount) {
          onAllFramesLoaded();
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= frameCount) {
          onAllFramesLoaded();
        }
      };

      images.push(img);
    }
  }

  function onAllFramesLoaded() {
    if (enterBtn) {
      enterBtn.classList.add("active");
      enterBtn.addEventListener("click", () => {
        soundFX.init();
        soundFX.playSuccess();
        dismissPreloader();
      });
    }
  }

  function dismissPreloader() {
    if (!preloader) return;
    preloader.classList.add("loaded");
    setTimeout(() => {
      preloader.style.display = "none";
      initScrollTriggerAnimations();
    }, 800);
  }

  startPreloading();


  /* ========================================================================
     5. GSAP SCROLLTRIGGER STORY TIMELINE & CHAPTER TRANSITIONS
     ======================================================================== */
  function initScrollTriggerAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Scrub Canvas Frame sequence across the 4.5x viewport height
    gsap.to(imageSeq, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#story-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
        onUpdate: () => renderFrame(),
      },
    });

    // 2. Chapter Overlays Transitions
    const ch0 = document.getElementById("chapter-0");
    const ch1 = document.getElementById("chapter-1");
    const ch2 = document.getElementById("chapter-2");

    ScrollTrigger.create({
      trigger: "#story-section",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;

        // Chapter 0: 0% - 25%
        if (p < 0.25) {
          ch0.classList.add("active");
          ch1.classList.remove("active");
          ch2.classList.remove("active");
        }
        // Chapter 1: 25% - 65%
        else if (p >= 0.25 && p < 0.65) {
          ch0.classList.remove("active");
          ch1.classList.add("active");
          ch2.classList.remove("active");
        }
        // Chapter 2: 65% - 100%
        else {
          ch0.classList.remove("active");
          ch1.classList.remove("active");
          ch2.classList.add("active");
        }
      },
    });

    // 3. Reveal content sections smoothly
    gsap.utils.toArray(".content-section").forEach((sec) => {
      gsap.from(sec.querySelectorAll(".section-title, .section-meta, .section-desc"), {
        scrollTrigger: {
          trigger: sec,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    });

    // 4. Stagger Project cards on entrance
    gsap.from(".project-card", {
      scrollTrigger: {
        trigger: "#projects-container",
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
    });
  }


  /* ========================================================================
     6. PROJECT FILTERING & CASE STUDY MODAL
     ======================================================================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      projectCards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Project Case Study Data
  const projectData = [
    {
      title: "F1 Roulette",
      subtitle: "Interactive Formula 1 Randomizer, Predictions & Strategy Suite",
      tags: ["Lovable AI", "React", "TypeScript", "Tailwind CSS", "F1 Analytics"],
      overview: "An engaging Formula 1 web application built and deployed with Lovable AI. Features interactive driver/team roulette wheels, randomized race scenarios, qualifying predictions, and team performance matrices.",
      achievements: [
        "Architected full application prompt workflow and interactive UI state with Lovable.",
        "Engineered custom wheel spin physics with responsive touch & audio effects.",
        "Integrated dynamic driver lineups, circuit statistics, and strategic scenario randomizers."
      ],
      github: "https://wheel-of-f1-glory.lovable.app",
      demo: "https://wheel-of-f1-glory.lovable.app"
    },
    {
      title: "Sports Brand Launchpad",
      subtitle: "Direct-to-Consumer Athletic Apparel & Brand Engine",
      tags: ["Lovable AI", "E-Commerce", "React", "Tailwind CSS", "UI/UX"],
      overview: "A modern sports brand launchpad and digital storefront built with Lovable AI. Features interactive high-performance product showcases, custom gear configurators, and modern conversion-optimized checkout.",
      achievements: [
        "Built responsive catalog grids with instant category filtering and real-time cart persistence.",
        "Designed high-fashion sports brutalist visual design system and dynamic banner animations.",
        "Engineered zero-latency product discovery with optimized image loading."
      ],
      github: "https://blaze-gear-direct.lovable.app",
      demo: "https://blaze-gear-direct.lovable.app"
    },
    {
      title: "Climate Campaigner",
      subtitle: "Grassroots Environmental Advocacy & Localized Voice Engine",
      tags: ["Lovable AI", "Voice AI", "Climate Action", "React", "Advocacy"],
      overview: "A grassroots environmental advocacy platform generating localized climate campaigns, AI-assisted voice narratives, and community impact petitions to drive ecological awareness.",
      achievements: [
        "Implemented dynamic campaign generator tailoring advocacy messaging to geographic regions.",
        "Integrated AI voice narration and speech synthesis workflows for multimedia outreach.",
        "Built interactive pledge counters and community action milestone trackers."
      ],
      github: "https://local-voice-generator.lovable.app",
      demo: "https://local-voice-generator.lovable.app"
    },
    {
      title: "Medi Compare",
      subtitle: "Healthcare Pricing Transparency & Prescription Savings Engine",
      tags: ["Lovable AI", "HealthTech", "Price Discovery", "Medical Data", "React"],
      overview: "A healthcare transparency platform empowering patients to search, compare prescription and clinical treatment costs across providers, and uncover immediate cost-saving alternatives.",
      achievements: [
        "Developed search and comparative filtering algorithms across treatments and prescription drugs.",
        "Structured transparent price breakdown cards with insurance vs out-of-pocket estimations.",
        "Clean, accessible, HIPAA-conscious medical UI designed for patient clarity."
      ],
      github: "https://heal-save-compare.lovable.app",
      demo: "https://heal-save-compare.lovable.app"
    }
  ];

  const modal = document.getElementById("project-modal");
  const modalClose = document.getElementById("modal-close");
  const modalContent = document.getElementById("modal-content");

  function openProjectModal(index) {
    const data = projectData[index];
    if (!data) return;

    modalContent.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <span class="status-badge" style="margin-bottom:0.8rem; display:inline-flex;">CASE STUDY // PROJECT 0${index + 1}</span>
        <h2 style="font-family:var(--font-display); font-size:2rem; font-weight:800; line-height:1.1; margin-bottom:0.4rem;">${data.title}</h2>
        <p style="font-family:var(--font-heading); color:var(--accent-orange); font-weight:600; font-size:1rem;">${data.subtitle}</p>
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        ${data.tags.map(t => `<span class="project-tag" style="background:var(--bg-secondary);">${t}</span>`).join('')}
      </div>

      <div style="margin-bottom:1.5rem;">
        <h4 style="font-family:var(--font-heading); font-size:1rem; text-transform:uppercase; margin-bottom:0.5rem; color:var(--text-primary);">Architecture & Scope</h4>
        <p style="color:var(--text-secondary); line-height:1.6; font-size:0.95rem;">${data.overview}</p>
      </div>

      <div style="margin-bottom:2rem;">
        <h4 style="font-family:var(--font-heading); font-size:1rem; text-transform:uppercase; margin-bottom:0.5rem; color:var(--text-primary);">Key Milestones & Engineering Feats</h4>
        <ul style="list-style:none; padding-left:0; color:var(--text-secondary); font-size:0.92rem; line-height:1.6;">
          ${data.achievements.map(a => `<li style="margin-bottom:0.5rem; display:flex; gap:0.5rem;"><span style="color:var(--accent-cyan);">▹</span> ${a}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex; gap:1rem; flex-wrap:wrap; border-top:1px solid var(--border-color); padding-top:1.5rem;">
        <a href="${data.demo || data.github}" target="_blank" rel="noopener" class="nav-cta" style="background:var(--text-primary); color:var(--bg-primary);">
          <span>${data.github && data.github.includes('lovable.dev') ? 'LAUNCH ON LOVABLE' : 'VIEW SOURCE ON GITHUB'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    `;

    modal.classList.add("active");
    soundFX.playClick();
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  document.querySelectorAll(".project-modal-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute("data-project"), 10);
      openProjectModal(idx);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });


  /* ========================================================================
     7. INTERACTIVE CYBER TERMINAL CLI
     ======================================================================== */
  const cliInput = document.getElementById("cli-input");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalBody = document.getElementById("terminal-body");

  function appendTerminalLine(text, className = "info") {
    const line = document.createElement("div");
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  const commands = {
    help: () => {
      appendTerminalLine("AVAILABLE COMMANDS:", "cmd-prompt");
      appendTerminalLine("  <b>about</b>     - Read developer biography and philosophy", "info");
      appendTerminalLine("  <b>skills</b>    - List core technical stack & competencies", "info");
      appendTerminalLine("  <b>projects</b>  - List highlighted client & creative works", "info");
      appendTerminalLine("  <b>contact</b>   - Display direct communication channels", "info");
      appendTerminalLine("  <b>matrix</b>    - Trigger cyber digital rain sequence", "success");
      appendTerminalLine("  <b>theme</b>     - Toggle between Light & Dark themes", "info");
      appendTerminalLine("  <b>time</b>      - Print current UTC and system clock", "info");
      appendTerminalLine("  <b>clear</b>     - Clean terminal console", "info");
    },
    about: () => {
      appendTerminalLine("<b>BIOGRAPHY & ACADEMIC PATH:</b>", "cmd-prompt");
      appendTerminalLine("First-Year B.Tech Computer Science (Artificial Intelligence) student at <b>Yenepoya School of Engineering and Technology &times; NxtWave</b> (completed 12th in 2026).", "info");
      appendTerminalLine("<b>Vision:</b> Driven by an unyielding ambition to master machine learning, build transformative AI software, and create impactful technology for the future.", "success");
      appendTerminalLine("<b>Core Driver:</b> Continuous learning, rapid execution with AI tools, and turning complex ideas into functional products.", "info");
    },
    skills: () => {
      appendTerminalLine("<b>TECH MATRIX & CONTINUOUS LEARNING:</b>", "cmd-prompt");
      appendTerminalLine("  [AI & ML]       Lovable AI, Python, Prompt Engineering, Gemini/OpenAI API, LLM Architecture", "success");
      appendTerminalLine("  ↳ <i>Learning:</i>   PyTorch, Deep Learning, Fine-Tuning LoRA, Autonomous Agents, RAG", "info");
      appendTerminalLine("  [Frontend]      JavaScript, TypeScript, React, Next.js, Tailwind CSS, Canvas API, GSAP", "success");
      appendTerminalLine("  ↳ <i>Learning:</i>   Three.js, WebGPU, React Three Fiber (R3F), Svelte", "info");
      appendTerminalLine("  [Backend & CS]  Node.js, FastAPI, PostgreSQL, Docker, Data Structures, OOP", "warning");
      appendTerminalLine("  ↳ <i>Learning:</i>   Kubernetes, Distributed Systems, Redis, System Design", "info");
    },
    projects: () => {
      appendTerminalLine("<b>HIGHLIGHTED PROJECTS:</b>", "cmd-prompt");
      projectData.forEach((p, i) => {
        appendTerminalLine(`  [0${i+1}] <b>${p.title}</b> - ${p.subtitle}`, "info");
      });
      appendTerminalLine("Type 'view [1-4]' or click any project to explore detailed interactive modals.", "success");
    },
    contact: () => {
      appendTerminalLine("<b>TRANSMISSION CHANNELS:</b>", "cmd-prompt");
      appendTerminalLine("  Email:    <a href='mailto:rishikeshalvahere@gmail.com' style='color:#00f0ff;'>rishikeshalvahere@gmail.com</a>", "info");
      appendTerminalLine("  GitHub:   <a href='https://github.com/Rishikesh04alva' target='_blank' style='color:#00f0ff;'>github.com/Rishikesh04alva</a>", "info");
      appendTerminalLine("  LinkedIn: <a href='https://www.linkedin.com/in/rishikesh-r-alva-78543a426/' target='_blank' style='color:#00f0ff;'>linkedin.com/in/rishikesh-r-alva-78543a426</a>", "info");
      appendTerminalLine("  X:        <a href='https://x.com/AlvaRishihere' target='_blank' style='color:#00f0ff;'>x.com/AlvaRishihere</a>", "info");
    },
    matrix: () => {
      appendTerminalLine("INITIALIZING DIGITAL MATRIX PROTOCOL...", "success");
      soundFX.playTone(800, 0.3, "sawtooth");
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const chars = "01010110 01100101 01110010 01110011 01101001 01101111 01101110 2026";
          appendTerminalLine(`>>> ${chars.split('').sort(() => 0.5 - Math.random()).join('')}`, "success");
        }, i * 150);
      }
    },
    theme: () => {
      const active = document.documentElement.getAttribute("data-theme");
      const next = active === "dark" ? "light" : "dark";
      setTheme(next);
      appendTerminalLine(`Theme transitioned to: <b>${next.toUpperCase()}</b>`, "success");
    },
    time: () => {
      const now = new Date();
      appendTerminalLine(`UTC: ${now.toUTCString()} | Local: ${now.toLocaleTimeString()}`, "info");
    },
    clear: () => {
      terminalOutput.innerHTML = "";
    },
    sudo: () => {
      appendTerminalLine("Permission denied: You are already in root cyberspace sandbox.", "warning");
    }
  };

  function executeCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    appendTerminalLine(`<span style="color:#7b8496;">visitor@cyberfiction:~$</span> <b style="color:#ffffff;">${raw}</b>`, "cmd-prompt");

    if (cmd.startsWith("view ")) {
      const num = parseInt(cmd.split(" ")[1], 10);
      if (num >= 1 && num <= projectData.length) {
        openProjectModal(num - 1);
        appendTerminalLine(`Opening project 0${num} case study modal...`, "success");
        return;
      }
    }

    if (commands[cmd]) {
      commands[cmd]();
    } else {
      appendTerminalLine(`Command not found: '${raw}'. Type '<b>help</b>' to see valid commands.`, "warning");
    }
  }

  if (cliInput) {
    cliInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = cliInput.value;
        cliInput.value = "";
        executeCommand(val);
      }
    });
  }

  // Quick chip click handlers
  document.querySelectorAll(".terminal-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const cmd = chip.getAttribute("data-cmd");
      if (cmd) {
        executeCommand(cmd);
      }
    });
  });


  /* ========================================================================
     8. CUSTOM MAGNETIC CURSOR
     ======================================================================== */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorCircle = document.querySelector(".cursor-circle");

  if (cursorDot && cursorCircle && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const renderCursor = () => {
      circleX += (mouseX - circleX) * 0.15;
      circleY += (mouseY - circleY) * 0.15;
      cursorCircle.style.transform = `translate(${circleX}px, ${circleY}px)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll("a, button, input, textarea, .project-card, .terminal-chip").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }


  /* ========================================================================
     9. CONTACT FORM HANDLING & COPY EMAIL
     ======================================================================== */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("form-name").value;
      const email = document.getElementById("form-email").value;
      const msg = document.getElementById("form-message").value;

      formStatus.style.display = "block";

      if (supabase) {
        formStatus.style.color = "#f59e0b";
        formStatus.innerHTML = `⌛ Transmitting packet to database...`;

        const { error } = await supabase
          .from("messages")
          .insert({ name, email, message: msg });

        if (!error) {
          formStatus.style.color = "#10b981";
          formStatus.innerHTML = `✓ Message stored in database. I'll get back to you at ${email}`;
          soundFX.playSuccess();
          contactForm.reset();
        } else {
          formStatus.style.color = "#ef4444";
          formStatus.innerHTML = `✗ Database error. Opening your mail client instead.`;
          window.location.href = `mailto:rishikeshalvahere@gmail.com?subject=${encodeURIComponent("Project Inquiry from " + name)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + msg)}`;
        }
      } else {
        formStatus.style.color = "#f59e0b";
        formStatus.innerHTML = `⚠ Database not configured. Opening your mail client instead.`;
        const mailtoUrl = `mailto:rishikeshalvahere@gmail.com?subject=${encodeURIComponent("Project Inquiry from " + name)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + msg)}`;
        setTimeout(() => {
          window.location.href = mailtoUrl;
          contactForm.reset();
        }, 600);
      }
    });
  }

  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText("rishikeshalvahere@gmail.com").then(() => {
        soundFX.playSuccess();
        const span = copyEmailBtn.querySelector("span");
        const originalText = span.textContent;
        span.textContent = "✓ Copied to Clipboard!";
        setTimeout(() => {
          span.textContent = originalText;
        }, 2000);
      });
    });
  }


  /* ========================================================================
     10. REAL-TIME SYSTEM CLOCK
     ======================================================================== */
  const clockEl = document.getElementById("system-clock");
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const utcStr = now.toUTCString().split(" ")[4];
    const localStr = now.toLocaleTimeString();
    clockEl.textContent = `UTC: ${utcStr} | LOCAL: ${localStr} [STATUS: ONLINE]`;
  }
  setInterval(updateClock, 1000);
  updateClock();

});
