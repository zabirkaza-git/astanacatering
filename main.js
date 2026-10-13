/**
 * ASTANA Catering — Main JavaScript
 * Handles: sticky nav, mobile menu, gallery filter + lightbox,
 * quotation form validation + WhatsApp message construction,
 * scroll animations, copyright year.
 */

'use strict';

/* ===================== CONSTANTS ===================== */
const WA_NUMBER = '60128857605';

/* ===================== DOM READY ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initGallery();
  initLightbox();
  initQuotationForm();
  initScrollAnimations();
  initCopyrightYear();
  initSmoothScroll();
  initMinEventDate();
  initActiveNavLinks();
});

/* ===================== NAVBAR — STICKY + ACTIVE ===================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar .nav-link, .mobile-nav .nav-link');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const targetId = id === 'founder' ? 'about' : id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${targetId}`);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(section => observer.observe(section));
}

/* ===================== MOBILE MENU ===================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', toggle);

  // Close on nav link click
  mobileNav.querySelectorAll('.nav-link, .btn').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* ===================== GALLERY FILTER ===================== */
function initGallery() {
  const tabs = document.querySelectorAll('.gallery-tab');
  const items = document.querySelectorAll('.gallery-item');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      items.forEach(item => {
        const category = item.dataset.category;
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
          item.style.display = '';
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ===================== LIGHTBOX ===================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const items = document.querySelectorAll('.gallery-item');

  if (!lightbox) return;

  let currentIndex = 0;

  const getVisibleItems = () => Array.from(items).filter(i => !i.classList.contains('hidden'));

  const openLightbox = (item) => {
    const visible = getVisibleItems();
    currentIndex = visible.indexOf(item);
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const navigate = (dir) => {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    const item = visible[currentIndex];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    lightboxCaption.textContent = caption ? caption.textContent : '';
  };

  // Open on click or keyboard
  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ===================== QUOTATION FORM ===================== */
function initQuotationForm() {
  const form = document.getElementById('quotation-form');
  const submitBtn = document.getElementById('form-submit');
  const successBox = document.getElementById('form-success');
  const fallbackBtn = document.getElementById('whatsapp-fallback');

  if (!form) return;

  // Validation helpers
  const showError = (fieldId, message) => {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const control = document.getElementById(fieldId) || document.getElementById(fieldId.replace('-error', ''));
    if (errorEl) errorEl.textContent = message;
    if (control) control.classList.add('error');
  };

  const clearError = (fieldId) => {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const control = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = '';
    if (control) control.classList.remove('error');
  };

  const getRadioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  };

  // Live validation on blur
  const fields = ['full-name', 'phone', 'email', 'event-type', 'event-date', 'event-location', 'guest-count'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id));
      el.addEventListener('change', () => clearError(id));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Clear all errors
    fields.forEach(id => clearError(id));
    const errorEls = form.querySelectorAll('.field-error');
    errorEls.forEach(el => el.textContent = '');

    // Full Name
    const fullName = document.getElementById('full-name').value.trim();
    if (!fullName) { showError('full-name', 'Please enter your full name.'); valid = false; }

    // Phone
    const phone = document.getElementById('phone').value.trim();
    const phoneRegex = /^[+\d\s\-().]{7,20}$/;
    if (!phone) { showError('phone', 'Please enter your phone number.'); valid = false; }
    else if (!phoneRegex.test(phone)) { showError('phone', 'Please enter a valid phone number.'); valid = false; }

    // Email (optional but validate format if provided)
    const email = document.getElementById('email').value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    }

    // Event Type
    const eventType = document.getElementById('event-type').value;
    if (!eventType) { showError('event-type', 'Please select an event type.'); valid = false; }

    // Event Date
    const eventDate = document.getElementById('event-date').value;
    if (!eventDate) {
      showError('event-date', 'Please select your event date.');
      valid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(eventDate);
      if (selected < today) {
        showError('event-date', 'Please select a future date.');
        valid = false;
      }
    }

    // Event Location
    const eventLocation = document.getElementById('event-location').value.trim();
    if (!eventLocation) { showError('event-location', 'Please enter your event location.'); valid = false; }

    // Guest Count
    const guestCount = document.getElementById('guest-count').value;
    if (!guestCount) { showError('guest-count', 'Please select the estimated number of guests.'); valid = false; }

    // Menu Selection
    const menuSelection = getRadioValue('menuSelection');
    if (!menuSelection) {
      const errEl = document.getElementById('menu-selection-error');
      if (errEl) errEl.textContent = 'Please select a menu option.';
      valid = false;
    }

    // Service Requirement
    const serviceRequirement = getRadioValue('serviceRequirement');
    if (!serviceRequirement) {
      const errEl = document.getElementById('service-requirement-error');
      if (errEl) errEl.textContent = 'Please select a service requirement.';
      valid = false;
    }

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('.field-error:not(:empty), .form-control.error');
      if (firstError) {
        const target = firstError.closest('.form-group') || firstError;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Build formatted date for display
    const additionalReqs = document.getElementById('additional-requirements').value.trim();
    let formattedDate = eventDate;
    try {
      formattedDate = new Date(eventDate + 'T00:00:00').toLocaleDateString('en-MY', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { /* keep raw */ }

    // Construct WhatsApp message
    const message = buildWhatsAppMessage({
      fullName, phone, email, eventType, eventDate: formattedDate,
      eventLocation, guestCount, menuSelection, serviceRequirement, additionalReqs
    });

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    // Update fallback button
    if (fallbackBtn) {
      fallbackBtn.href = waUrl;
    }

    // Try to open WhatsApp
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (_) { /* fallback button shown */ }

    // Show success state
    if (successBox) {
      successBox.setAttribute('aria-hidden', 'false');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Disable submit button to prevent double-submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enquiry Prepared ✓';
      submitBtn.style.background = '#2d7a50';

      // Re-enable after a while in case they want to re-submit
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request a Quotation';
        submitBtn.style.background = '';
      }, 10000);
    }
  });
}

function buildWhatsAppMessage({ fullName, phone, email, eventType, eventDate, eventLocation, guestCount, menuSelection, serviceRequirement, additionalReqs }) {
  const lines = [
    'Hello ASTANA Catering,',
    '',
    'I would like to request a quotation for your catering services. Please find my event details below:',
    '',
    '📋 *CUSTOMER DETAILS*',
    `Name: ${fullName}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    '',
    '📅 *EVENT DETAILS*',
    `Event Type: ${eventType}`,
    `Event Date: ${eventDate}`,
    `Event Location: ${eventLocation}`,
    `Estimated Guests: ${guestCount}`,
    '',
    '🍽️ *CATERING REQUIREMENTS*',
    `Menu Selection: ${menuSelection}`,
    `Service Required: ${serviceRequirement}`,
    additionalReqs ? `\nAdditional Requirements:\n${additionalReqs}` : null,
    '',
    'I look forward to hearing from you. Thank you!'
  ];

  return lines.filter(line => line !== null).join('\n');
}

/* ===================== SCROLL ANIMATIONS ===================== */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const animatables = document.querySelectorAll(
    '.product-card, .service-feature, .service-card, .event-item, .why-item, .vm-card, .gallery-item, .brand-intro-img-wrap, .brand-intro-text, .booth-text, .booth-images, .contact-info, .contact-visual'
  );

  animatables.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  animatables.forEach(el => observer.observe(el));
}

/* ===================== SMOOTH SCROLL ===================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 68;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ===================== MIN EVENT DATE ===================== */
function initMinEventDate() {
  const dateInput = document.getElementById('event-date');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

/* ===================== COPYRIGHT YEAR ===================== */
function initCopyrightYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
}
