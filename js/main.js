document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const header = document.getElementById('header');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Populate dynamic profile data if user is logged in
  loadUserPortfolio();

  // Mobile menu
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Enforce dark theme
  document.documentElement.setAttribute('data-theme', 'dark');

  // Active section link highlighting
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        allNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });

    if (header) {
      header.style.boxShadow = window.scrollY > 50 ? '0 2px 20px rgba(0, 0, 0, 0.15)' : 'none';
    }
  });

  initProjectFilter();
  initContactForm();

  // Animations
  initScrollReveal();
  initParticleBackground();
  initTypingEffect();
  initCardTilt();
  initCounterAnimation();
  initRippleEffect();
});

function loadUserPortfolio() {
  if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;

  const userData = Auth.getCurrentUserData();
  if (!userData) return;

  const profile = userData.profile || {};
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const dashLink = document.getElementById('dashboardLink');
  if (dashLink) dashLink.style.display = 'inline-flex';

  setText('heroName', profile.name || 'IAMATOMIC');
  setText('navBrand', profile.name || 'IAMATOMIC');
  setText('footerBrand', profile.name || 'IAMATOMIC');
  setText('heroBio', profile.bio || '');
  setText('codeName', `"${profile.name || 'IAMATOMIC'}"`);
  setText('codeRole', `"${profile.role || 'Developer'}"`);
  setText('contactEmail', profile.email || 'hello@example.com');
  setText('contactLocation', profile.location || 'Earth');

  if (profile.github) {
    const el = document.getElementById('contactGithub');
    if (el) {
      el.textContent = profile.github.replace('https://', '');
      el.href = profile.github;
    }
  }

  if (profile.linkedin) {
    const el = document.getElementById('contactLinkedin');
    if (el) {
      el.textContent = profile.linkedin.replace('https://', '');
      el.href = profile.linkedin;
    }
  }

  updateHeroSocials(profile);

  if (profile.about) {
    const aboutEl = document.getElementById('aboutText');
    if (aboutEl) {
      aboutEl.innerHTML = profile.about.split('|||')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('');
    }
  }

  if (profile.stats?.length) {
    updateStats(profile.stats);
  }

  if (userData.skills?.length) {
    updateSkillsSection(userData.skills);
  }

  if (userData.projects?.length) {
    updateProjectsSection(userData.projects);
  }
}

function updateHeroSocials(profile) {
  const container = document.getElementById('heroSocials');
  if (!container) return;

  const links = [
    { name: 'GitHub', url: profile.github },
    { name: 'LinkedIn', url: profile.linkedin },
    { name: 'Twitter', url: profile.twitter }
  ].filter(s => s.url);

  container.innerHTML = links.map(s => `
    <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="social-link">${escapeHtml(s.name)} &nearr;</a>
  `).join('');
}

function updateStats(stats) {
  const container = document.getElementById('statsContainer');
  if (!container) return;

  container.innerHTML = stats.map(stat => {
    const num = parseInt(stat.number, 10);
    const hasCount = !isNaN(num) && num > 0;
    return `
      <div class="stat-card">
        <span class="stat-number"${hasCount ? ` data-count="${num}"` : ''}>${hasCount ? '0' : escapeHtml(stat.number)}</span>
        <span class="stat-label">${escapeHtml(stat.label)}</span>
      </div>
    `;
  }).join('');
}

function updateSkillsSection(skills) {
  const container = document.getElementById('skillsContainer');
  if (!container) return;

  container.innerHTML = skills.map(group => {
    const tags = (group.tags || '').split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => `<span class="skill-tag">${escapeHtml(t)}</span>`)
      .join('');

    return `
      <div class="skill-group">
        <h3 class="skill-group-title">${escapeHtml(group.groupName || 'Skills')}</h3>
        <div class="skill-tags">${tags}</div>
      </div>
    `;
  }).join('');
}

function updateProjectsSection(projects) {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  const gradients = [
    'banner-gradient-1', 'banner-gradient-2', 'banner-gradient-3',
    'banner-gradient-4', 'banner-gradient-5', 'banner-gradient-6'
  ];
  const icons = ['&#128203;', '&#127912;', '&#9729;', '&#128172;', '&#128187;', '&#127763;'];
  const categories = [];

  container.innerHTML = projects.map((proj, i) => {
    const cat = proj.category || 'web-app';
    if (!categories.includes(cat)) categories.push(cat);

    const grad = gradients[i % gradients.length];
    const icon = icons[i % icons.length];
    const tags = (proj.tags || '').split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => `<span>${escapeHtml(t)}</span>`)
      .join('');

    const liveLink = proj.liveUrl
      ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo &nearr;</a>`
      : '';
    const sourceLink = proj.sourceUrl
      ? `<a href="${escapeHtml(proj.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">Source Code &nearr;</a>`
      : '';
    const linksHtml = (liveLink || sourceLink) ? `<div class="project-links">${liveLink}${sourceLink}</div>` : '';
    const bannerContent = proj.imageUrl
      ? `<img src="${escapeHtml(proj.imageUrl)}" alt="${escapeHtml(proj.title || '')}" class="project-banner-img">`
      : `<span class="project-banner-icon">${icon}</span>`;

    return `
      <article class="project-card tilt-card reveal-stagger-item" data-category="${escapeHtml(cat)}">
        <div class="project-banner ${proj.imageUrl ? '' : grad}">
          ${bannerContent}
        </div>
        <div class="project-info">
          <h3 class="project-title">${escapeHtml(proj.title || 'Untitled')}</h3>
          <p class="project-desc">${escapeHtml(proj.description || '')}</p>
          <div class="project-tags">${tags}</div>
          ${linksHtml}
        </div>
      </article>
    `;
  }).join('');

  updateFilterButtons(categories);
  initCardTilt();
}

function updateFilterButtons(categories) {
  const container = document.getElementById('projectFilters');
  if (!container) return;

  const labels = {
    'web-app': 'Web Apps',
    'ui-ux': 'UI / UX',
    'tool': 'Tools',
    'mobile': 'Mobile',
    'other': 'Other'
  };

  const buttons = ['all', ...categories].map((cat, i) => {
    const label = cat === 'all' ? 'All' : (labels[cat] || cat);
    return `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${cat}">${label}</button>`;
  });

  container.innerHTML = buttons.join('');
}

function initProjectFilter() {
  const filterContainer = document.getElementById('projectFilters');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
      if (match) {
        card.style.animation = 'cardFadeIn 0.4s ease forwards';
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  let lastSubmit = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successMsg.classList.remove('visible');
    errorMsg.classList.remove('visible');

    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) {
      successMsg.classList.add('visible');
      return;
    }

    if (Date.now() - lastSubmit < 5000) {
      errorMsg.textContent = '\u2717 Please wait a few seconds before sending again.';
      errorMsg.classList.add('visible');
      return;
    }

    const clean = (id) => (document.getElementById(id)?.value || '').trim().replace(/<[^>]*>/g, '');
    const name = clean('name');
    const email = clean('email');
    const subject = clean('subject');
    const message = clean('message');

    if (!name || !email || !subject || !message) {
      errorMsg.textContent = '\u2717 Please fill all fields correctly.';
      errorMsg.classList.add('visible');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg.textContent = '\u2717 Please enter a valid email address.';
      errorMsg.classList.add('visible');
      return;
    }

    if (name.length > 100 || email.length > 200 || subject.length > 200 || message.length > 2000) {
      errorMsg.textContent = '\u2717 One or more fields exceed the allowed length.';
      errorMsg.classList.add('visible');
      return;
    }

    lastSubmit = Date.now();
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      successMsg.classList.add('visible');
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      form.reset();
    }, 800);
  });
}

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-stagger-item').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger, .reveal-stagger-item').forEach(el => {
    observer.observe(el);
  });
}

function initParticleBackground() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const particles = [];
  const count = 50;
  let mouseX = 0;
  let mouseY = 0;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const color = isDark ? '232, 130, 92' : '180, 90, 50';

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        p.x -= dx * 0.005;
        p.y -= dy * 0.005;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 130) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

function initTypingEffect() {
  const nameEl = document.getElementById('heroName');
  if (!nameEl) return;

  const fullText = nameEl.textContent;
  nameEl.textContent = '';
  let index = 0;

  function type() {
    if (index < fullText.length) {
      nameEl.textContent += fullText.charAt(index++);
      setTimeout(type, 100);
    }
  }

  setTimeout(type, 600);
}

function initCardTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    if (card._hasTilt) return;
    card._hasTilt = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => el.textContent = `${el.dataset.count}+`);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target, parseInt(entry.target.dataset.count, 10));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function animateCount(el, target) {
    let current = 0;
    const duration = 1500;
    const stepTime = Math.max(Math.floor(duration / target), 16);
    const step = Math.ceil(target / (duration / stepTime));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = `${current}+`;
    }, stepTime);
  }
}

function initRippleEffect() {
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', (e) => {
      btn.querySelector('.ripple-circle')?.remove();

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement('span');
      circle.className = 'ripple-circle';
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const style = document.createElement('style');
style.textContent = '@keyframes cardFadeIn { from { opacity: 0; transform: translateY(15px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }';
document.head.appendChild(style);



