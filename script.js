/* 
========================================================================
   KADIYAM PLANTS GALLERY - Premium Functionality Script
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular scripts
  initNavbar();
  initHeroSlider();
  initLetterReveal();
  initScrollAnimations();
  initPlantCatalog();
  initGalleryTabs();
  initEnquiryForm();
});

/* ==========================================
   1. NAVBAR & NAVIGATION
   ========================================== */
function initNavbar() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const dropdownLinks = document.querySelectorAll('.nav-item > .nav-link');

  // Sticky navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Mobile dropdown handling
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        // Toggle active-mobile-dropdown on parent .nav-item
        const parent = link.parentElement;
        if (parent) {
          e.preventDefault();
          parent.classList.toggle('active-mobile-dropdown');
        }
      }
    });
  });

  // Set active link based on current page path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/* ==========================================
   2. CUSTOM HERO SLIDER WITH PAIRWISE TRANSITIONS
   ========================================== */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dotsContainer = slider.querySelector('.slider-indicators');
  
  if (slides.length === 0) return;

  let currentIdx = 0;
  let sliderInterval = null;
  const slideDuration = 5500; // 5.5 seconds

  // Transition class styles for pairs
  // Slide 0 -> 1: slide-left-right
  // Slide 1 -> 2: zoom-fade
  // Slide 2 -> 0: wipe
  const transitions = [
    'transition-slide-left-right',
    'transition-zoom-fade',
    'transition-wipe'
  ];

  // 2a. Create Indicator Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        if (idx !== currentIdx) {
          jumpToSlide(idx);
        }
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

  // 2b. Transition logic
  function changeSlide(nextIdx) {
    const currSlide = slides[currentIdx];
    const nextSlide = slides[nextIdx];
    
    // Choose transition class depending on current index
    const transitionClass = transitions[currentIdx];
    
    // Set transition layout on container
    slider.className = 'hero-slider ' + transitionClass;
    
    // Mark previous slide for animation out
    currSlide.classList.add('active-out');
    currSlide.classList.remove('active');
    
    // Prepare next slide
    nextSlide.classList.add('active');
    
    // Update Indicators
    if (dots.length > 0) {
      dots.forEach(d => d.classList.remove('active'));
      dots[nextIdx].classList.add('active');
    }
    
    // Clean up animation state after slide completion
    setTimeout(() => {
      currSlide.classList.remove('active-out');
    }, 1500);
    
    // Replay heading letter reveals on the new slide
    triggerSlideTextReveal(nextSlide);
    
    currentIdx = nextIdx;
  }

  function startAutoplay() {
    stopAutoplay();
    sliderInterval = setInterval(() => {
      const nextIdx = (currentIdx + 1) % slides.length;
      changeSlide(nextIdx);
    }, slideDuration);
  }

  function stopAutoplay() {
    if (sliderInterval) {
      clearInterval(sliderInterval);
    }
  }

  function jumpToSlide(targetIdx) {
    stopAutoplay();
    changeSlide(targetIdx);
    startAutoplay();
  }

  function typewriterEffect(element) {
    if (!element) return;
    const fullText = element.getAttribute('data-full-text') || element.textContent.trim();
    if (!element.getAttribute('data-full-text')) {
      element.setAttribute('data-full-text', fullText);
    }
    
    element.textContent = '';
    let i = 0;
    if (element.typeInterval) clearInterval(element.typeInterval);
    
    element.typeInterval = setInterval(() => {
      if (i < fullText.length) {
        element.textContent += fullText.charAt(i);
        i++;
      } else {
        clearInterval(element.typeInterval);
      }
    }, 95); // ~95ms pace per letter
  }

  function triggerSlideTextReveal(slideElement) {
    const typewriter = slideElement.querySelector('.highlight-typewriter');
    if (typewriter) {
      typewriterEffect(typewriter);
    }

    const reveals = slideElement.querySelectorAll('.letter-reveal');
    reveals.forEach(reveal => {
      reveal.classList.remove('animated');
      // Trigger reflow
      void reveal.offsetWidth;
      reveal.classList.add('animated');
    });
  }

  // Trigger initial slide text reveal and start loop
  if (slides[0]) {
    triggerSlideTextReveal(slides[0]);
  }
  startAutoplay();
}

/* ==========================================
   3. LETTER REVEAL ANIMATIONS
   ========================================== */
function initLetterReveal() {
  const typewriters = document.querySelectorAll('.highlight-typewriter');
  typewriters.forEach(elem => {
    if (!elem.getAttribute('data-full-text')) {
      elem.setAttribute('data-full-text', elem.textContent.trim());
    }
  });

  const revealElements = document.querySelectorAll('.letter-reveal');
  
  revealElements.forEach(element => {
    const text = element.textContent.trim();
    element.innerHTML = '';
    
    // Calculate stagger step to ensure a smooth 1.5-2s total reveal duration
    const totalChars = text.length || 1;
    const delayStep = Math.max(35, Math.min(65, Math.floor(1200 / totalChars))); 
    
    let charIdx = 0;
    for (let char of text) {
      const span = document.createElement('span');
      // Replace spaces with non-breaking spaces to preserve layout
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      
      // Assign custom transition-delay per character for stagger
      span.style.transitionDelay = `${charIdx * delayStep}ms`;
      element.appendChild(span);
      charIdx++;
    }
  });

  // Watch for entrance (triggers once when section first becomes visible)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(elem => observer.observe(elem));
}

/* ==========================================
   4. GENERAL SCROLL ENTRANCE ANIMATIONS
   ========================================== */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Trigger once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(reveal => revealObserver.observe(reveal));
}

/* ==========================================
   5. PLANT CATALOG & LIGHTBOX
   ========================================== */
function initPlantCatalog() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const plantCards = document.querySelectorAll('.plant-card');
  const lightbox = document.getElementById('lightboxModal');
  
  if (!plantCards.length) return;

  // 5a. Category Filtering Action
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');

      plantCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          // Slide & Fade entrance style
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          // Slide & Fade exit style
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 350);
        }
      });
    });
  });

  // URL category parameter check on page load
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${categoryParam}"]`);
    if (targetBtn) {
      setTimeout(() => {
        targetBtn.click();
      }, 100);
    }
  }

  // 5b. Lightbox Popup Logic
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  
  let currentGroupImages = [];
  let currentImgIndex = 0;

  // Click card image to trigger lightbox
  document.querySelectorAll('.plant-card-img, .masonry-item').forEach(clickable => {
    clickable.addEventListener('click', () => {
      // Find list of images based on current grid visibility
      const isGallery = clickable.classList.contains('masonry-item');
      
      if (isGallery) {
        // Collect all items in the masonry grid
        const allItems = Array.from(document.querySelectorAll('.masonry-item img'));
        currentGroupImages = allItems.map(img => ({
          src: img.getAttribute('src'),
          title: img.getAttribute('alt') || 'Nursery Gallery Image'
        }));
        const index = allItems.indexOf(clickable.querySelector('img') || clickable);
        currentImgIndex = index !== -1 ? index : 0;
      } else {
        // Collect currently visible plant cards
        const allVisibleCards = Array.from(document.querySelectorAll('.plant-card'))
          .filter(card => card.style.display !== 'none');
        
        currentGroupImages = allVisibleCards.map(card => {
          const img = card.querySelector('.plant-card-img img');
          const title = card.querySelector('h3').textContent;
          return {
            src: img.getAttribute('src'),
            title: title
          };
        });

        const activeCard = clickable.closest('.plant-card');
        currentImgIndex = allVisibleCards.indexOf(activeCard);
      }

      openLightbox();
    });
  });

  function openLightbox() {
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }

  function updateLightboxContent() {
    if (currentGroupImages.length === 0) return;
    const current = currentGroupImages[currentImgIndex];
    if (lightboxImg) lightboxImg.src = current.src;
    if (lightboxCaption) lightboxCaption.textContent = current.title;
  }

  function navigateLightbox(dir) {
    if (dir === 'next') {
      currentImgIndex = (currentImgIndex + 1) % currentGroupImages.length;
    } else {
      currentImgIndex = (currentImgIndex - 1 + currentGroupImages.length) % currentGroupImages.length;
    }
    updateLightboxContent();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox('next'));
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox('prev'));

  // Close when clicking overlay (outside content)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Desktop Keyboard Actions
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') navigateLightbox('next');
    if (e.key === 'ArrowLeft') navigateLightbox('prev');
    if (e.key === 'Escape') closeLightbox();
  });

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });

  function handleSwipeGesture() {
    const swipeThreshold = 50; // minimum distance in px
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped Left -> Next
      navigateLightbox('next');
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped Right -> Prev
      navigateLightbox('prev');
    }
  }
}

/* ==========================================
   6. GALLERY TABS & CUSTOM PLAY OVERLAYS
   ========================================== */
function initGalleryTabs() {
  const tabBtns = document.querySelectorAll('.gallery-tab-btn');
  const panels = document.querySelectorAll('.gallery-panel');
  const videos = document.querySelectorAll('.video-card video');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');

      // Pause any playing videos when switching tabs
      videos.forEach(v => {
        v.pause();
        const card = v.closest('.video-card');
        if (card) card.classList.remove('playing');
      });

      panels.forEach(panel => {
        const panelName = panel.getAttribute('id');
        
        if (panelName === targetTab) {
          panel.classList.add('active');
          // Stagger item reveal transitions inside the panel
          const revealItems = panel.querySelectorAll('.masonry-item, .video-card, .loading-card');
          revealItems.forEach((item, idx) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, idx * 50);
          });
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // URL tab parameter check on page load
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam) {
    const targetBtn = document.querySelector(`.gallery-tab-btn[data-tab="${tabParam}"]`);
    if (targetBtn) {
      setTimeout(() => {
        targetBtn.click();
      }, 100);
    }
  }

  // Videos play/pause toggle triggers
  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const overlay = card.querySelector('.video-overlay');

    if (!video || !overlay) return;

    overlay.addEventListener('click', () => {
      // Pause all other playing videos first
      videos.forEach(v => {
        if (v !== video) {
          v.pause();
          const otherCard = v.closest('.video-card');
          if (otherCard) otherCard.classList.remove('playing');
        }
      });

      video.play();
      card.classList.add('playing');
    });

    video.addEventListener('click', () => {
      if (!video.paused) {
        video.pause();
        card.classList.remove('playing');
      }
    });

    video.addEventListener('pause', () => {
      card.classList.remove('playing');
    });
  });
}

/* ==========================================
   7. ENQUIRY FORM CLIENT-SIDE SUBMISSION
   ========================================== */
function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  const feedback = document.getElementById('formFeedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Perform basic client-side check
    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const email = document.getElementById('formEmail').value.trim();

    if (!name || !phone) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }

    // Success response trigger
    if (feedback) {
      form.style.display = 'none';
      feedback.style.display = 'block';
      feedback.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 2.2rem; color: #52b788; display: block; margin-bottom: 12px;"></i>
        <h4>Thank you, ${name}!</h4>
        <p style="font-size: 0.9rem; margin-top: 5px; color: #4b5563;">Your enquiry has been successfully received. Our gardening expert will contact you soon on <strong>${phone}</strong>.</p>
      `;
    }
  });
}
