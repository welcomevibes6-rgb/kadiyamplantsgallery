/* 
========================================================================
   KADIYAM PLANTS GALLERY — Premium Functionality Script
   Handles Navbar, Hero Slider, Category Filtering, Lightbox, Animations
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 30);
    });

    // ===== MOBILE NAV MENU =====
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
        document.querySelectorAll('.nav-menu .nav-link, .dropdown-content a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ===== HERO SLIDER =====
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');

    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;
        let isPaused = false;

        function goToSlide(idx) {
            slides.forEach(s => { s.classList.remove('active'); });
            dots.forEach(d => d.classList.remove('active'));
            currentSlide = ((idx % slides.length) + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        function startAuto() {
            slideInterval = setInterval(() => { if (!isPaused) goToSlide(currentSlide + 1); }, 5000);
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); clearInterval(slideInterval); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); clearInterval(slideInterval); startAuto(); });
        dots.forEach(d => d.addEventListener('click', () => { goToSlide(+d.dataset.slide); clearInterval(slideInterval); startAuto(); }));

        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', () => isPaused = true);
            hero.addEventListener('mouseleave', () => isPaused = false);
        }
        startAuto();
    }

    // ===== LETTER REVEAL HEADING ANIMATION =====
    const revealHeadings = document.querySelectorAll('.letter-reveal');
    revealHeadings.forEach(heading => {
        const text = heading.textContent.trim();
        heading.innerHTML = '';
        const chars = text.split('');
        const delayStep = 1800 / Math.max(chars.length, 1); // ~1.8 seconds total duration

        chars.forEach((char, i) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = char;
            }
            span.style.transitionDelay = `${i * delayStep}ms`;
            heading.appendChild(span);
        });

        // Trigger reveal once
        setTimeout(() => {
            heading.classList.add('animated');
        }, 150);
    });

    // ===== VARIETIES CATEGORY PILL FILTERING =====
    const filterPills = document.querySelectorAll('.filter-pill');
    const plantCards = document.querySelectorAll('#varietyGrid .plant-card');

    if (filterPills.length > 0 && plantCards.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filter = pill.getAttribute('data-filter');

                plantCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 30);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px) scale(0.96)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 250);
                    }
                });
            });
        });

        // Support category URL query parameter (e.g. varieties.html?category=outdoor)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const targetPill = document.querySelector(`.filter-pill[data-filter="${categoryParam}"]`);
            if (targetPill) targetPill.click();
        }
    }

    // ===== GALLERY TAB NAVIGATION (Gallery Page) =====
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryPanels = document.querySelectorAll('.gallery-panel');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetTab = btn.getAttribute('data-tab');
                galleryPanels.forEach(panel => {
                    if (panel.id === targetTab) {
                        panel.classList.add('active');
                        // Re-observe animations for newly visible panel
                        panel.querySelectorAll('.anim-up, .anim-left, .anim-right, .anim-split').forEach(el => {
                            if (!el.classList.contains('visible')) {
                                observer.observe(el);
                            }
                        });
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });

        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
            const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabParam}"]`);
            if (targetBtn) targetBtn.click();
        }
    }

    // ===== VIDEO CARD OVERLAY CLICK =====
    document.querySelectorAll('.video-card').forEach(card => {
        const video = card.querySelector('video');
        const overlay = card.querySelector('.video-overlay');
        if (video && overlay) {
            overlay.addEventListener('click', () => {
                document.querySelectorAll('.video-card video').forEach(v => {
                    if (v !== video) {
                        v.pause();
                        v.closest('.video-card').classList.remove('playing');
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
        }
    });

    // ===== LIGHTBOX POPUP WITH PREV/NEXT & SWIPE =====
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    let lbImages = [];
    let lbIndex = 0;

    window.openLightbox = function(src, images, index) {
        if (!lightbox || !lightboxImg) return;
        lbImages = images;
        lbIndex = index;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function lbNext() {
        if (!lbImages.length) return;
        lbIndex = (lbIndex + 1) % lbImages.length;
        lightboxImg.src = lbImages[lbIndex];
    }

    function lbPrev() {
        if (!lbImages.length) return;
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        lightboxImg.src = lbImages[lbIndex];
    }

    if (lightbox) {
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const prevBtn = lightbox.querySelector('.lightbox-prev');

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (nextBtn) nextBtn.addEventListener('click', lbNext);
        if (prevBtn) prevBtn.addEventListener('click', lbPrev);
        lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
        
        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') lbNext();
            if (e.key === 'ArrowLeft') lbPrev();
        });

        // Mobile touch swipe gesture handling
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 40) lbNext(); // Swipe Left -> Next
            if (touchEndX > touchStartX + 40) lbPrev(); // Swipe Right -> Prev
        }, { passive: true });
    }

    // Attach click listener for plant cards to trigger Lightbox across visible cards
    document.addEventListener('click', e => {
        const cardImg = e.target.closest('.plant-card-img img, .gallery-item img, .masonry-item img, .landscape-card img');
        if (cardImg) {
            const visibleImgs = Array.from(document.querySelectorAll('.plant-card:not([style*="display: none"]) .plant-card-img img, .gallery-item img, .masonry-item img, .landscape-card img'));
            const srcs = visibleImgs.map(img => img.src);
            const idx = visibleImgs.indexOf(cardImg);
            openLightbox(cardImg.src, srcs, idx !== -1 ? idx : 0);
        }
    });

    // ===== SCROLL ENTRANCE ANIMATIONS =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const d = getComputedStyle(entry.target).getPropertyValue('--delay') || '0s';
                const sd = getComputedStyle(entry.target).getPropertyValue('--split-delay') || '0s';
                const delay = Math.max(parseFloat(d), parseFloat(sd)) * 1000;
                setTimeout(() => entry.target.classList.add('visible'), delay || 0);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });

    document.querySelectorAll('.anim-up, .anim-left, .anim-right, .anim-split').forEach(el => observer.observe(el));

    // ===== ABOUT HEADING LETTER REVEAL (Viewport-Triggered, Once) =====
    const aboutHeading = document.getElementById('aboutHeading');
    if (aboutHeading) {
        // Split heading text into individual letter spans
        const headingText = aboutHeading.textContent.trim();
        aboutHeading.innerHTML = '';
        const totalDuration = 2200; // 2.2 seconds total
        const chars = headingText.split('');
        const delayStep = totalDuration / Math.max(chars.length, 1);

        chars.forEach((char, i) => {
            const span = document.createElement('span');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = char;
            }
            span.style.transitionDelay = `${i * delayStep}ms`;
            aboutHeading.appendChild(span);
        });

        // Observe the about section and trigger letter reveal + content fade once
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const aboutObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Trigger heading letter animation
                        aboutHeading.classList.add('animated');

                        // Trigger content elements with staggered delay after heading
                        const contentEls = aboutSection.querySelectorAll('.about-content-reveal');
                        contentEls.forEach((el, idx) => {
                            setTimeout(() => {
                                el.classList.add('content-visible');
                            }, totalDuration + 300 + (idx * 200));
                        });

                        aboutObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -60px 0px', threshold: 0.15 });

            aboutObserver.observe(aboutSection);
        }
    }

    // ===== WHATSAPP CONSTANT & FORMS SUBMISSION =====
    const DEFAULT_WA_MESSAGE = "Hello Kadiyam Plants Gallery! I visited your website and I'm interested in your plants and landscaping services. Please share more details. Thank you!";
    const WA_URL = "https://wa.me/917207755335?text=" + encodeURIComponent(DEFAULT_WA_MESSAGE);

    // Intercept any telephone links to open WhatsApp conversation
    document.addEventListener('click', e => {
        const phoneLink = e.target.closest('a[href^="tel:"]');
        if (phoneLink) {
            e.preventDefault();
            window.open(WA_URL, '_blank');
        }
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            window.open(WA_URL, '_blank');
            contactForm.reset();
        });
    }

    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', e => {
            e.preventDefault();
            window.open(WA_URL, '_blank');
            enquiryForm.reset();
        });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

});
