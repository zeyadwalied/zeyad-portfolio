document.addEventListener('DOMContentLoaded', () => {
    const mobileViewportQuery = window.matchMedia('(max-width: 767px)');
    const syncMobilePerformanceMode = (isMobileViewport = mobileViewportQuery.matches) => {
        document.documentElement.classList.toggle('mobile-performance-mode', isMobileViewport);
    };

    syncMobilePerformanceMode();
    if (mobileViewportQuery.addEventListener) {
        mobileViewportQuery.addEventListener('change', (event) => syncMobilePerformanceMode(event.matches));
    } else {
        mobileViewportQuery.addListener((event) => syncMobilePerformanceMode(event.matches));
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');
            navLinks.classList.toggle('flex-col');
            navLinks.classList.toggle('absolute');
            navLinks.classList.toggle('top-full');
            navLinks.classList.toggle('left-0');
            navLinks.classList.toggle('w-full');
            navLinks.classList.toggle('bg-dark-secondary');
            navLinks.classList.toggle('p-6');
            navLinks.classList.toggle('gap-4');
        });
    }

    // Close mobile menu when a link is clicked
    const closeMobileMenu = () => {
        if (!navLinks) return;
        navLinks.classList.add('hidden');
        navLinks.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'w-full', 'bg-dark-secondary', 'p-6', 'gap-4');
    };

    document.addEventListener('click', (event) => {
        const navLink = event.target.closest('.nav-links a');
        if (navLink && window.innerWidth < 768) {
            closeMobileMenu();
        }
    });


    // Scroll reveal animation using IntersectionObserver
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    };

    const revealOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px" 
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Skill Bars animation
    const skillBars = document.querySelectorAll('.skill-bar');
    if(skillBars.length > 0) {
        if (document.documentElement.classList.contains('mobile-performance-mode')) {
            skillBars.forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        } else {
            const skillObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.width = entry.target.getAttribute('data-width');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

            skillBars.forEach(bar => {
                skillObserver.observe(bar);
            });
        }
    }

    // Form submission interception setup for Formspree
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent standard redirect
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Validate Email exactly
            const emailInput = form.querySelector('input[type="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value)) {
                alert("Please enter a valid email address.");
                return;
            }

            btn.innerHTML = 'Sending...';
            btn.style.opacity = '0.7';

            fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    btn.innerHTML = 'Message Sent ✓';
                    btn.style.backgroundColor = 'var(--accent)';
                    form.reset();
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.opacity = '1';
                    }, 4000);
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert("Oops! There was a problem submitting your form");
                        }
                        btn.innerHTML = originalText;
                        btn.style.opacity = '1';
                    })
                }
            }).catch(error => {
                alert("Oops! There was a problem submitting your form");
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
            });
        });
    });

    // Video Modal functionality
    const syncVideoModalCursorState = (isOpen) => {
        document.documentElement.classList.toggle('video-modal-open', isOpen);
        document.body.classList.toggle('video-modal-open', isOpen);
    };

    window.openVideoModal = function(videoId) {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('modalIframe');
        if(modal && iframe) {
            syncVideoModalCursorState(true);
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            // Small delay to allow display:block to apply before animating opacity
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.classList.add('opacity-100');
            }, 10);
            document.body.style.overflow = 'hidden';
            
            // Add skeleton listener
            const skeleton = modal.querySelector('.skeleton');
            if(skeleton) skeleton.classList.remove('hidden');
            iframe.onload = () => {
                if(skeleton) skeleton.classList.add('hidden');
            };
        }
    };

    window.closeVideoModal = function() {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('modalIframe');
        if(modal && iframe) {
            syncVideoModalCursorState(false);
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                iframe.src = '';
            }, 300);
        }
    };

    // Top Loading Bar functionality
    const createLoadingBar = () => {
        let bar = document.getElementById('top-loading-bar');
        if(!bar) {
            bar = document.createElement('div');
            bar.id = 'top-loading-bar';
            document.body.prepend(bar);
        }
        bar.style.transition = 'none';
        bar.style.transform = 'scaleX(0)';
        bar.style.opacity = '1';
        requestAnimationFrame(() => {
            bar.style.transition = 'transform 0.3s ease-out, opacity 0.5s ease';
        });
        return bar;
    };

    document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        const isInternalPage = href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && anchor.target !== '_blank';

        if (!isInternalPage) return;

        event.preventDefault();
        const bar = createLoadingBar();

        requestAnimationFrame(() => {
            bar.style.transform = 'scaleX(0.4)';
        });
        setTimeout(() => { bar.style.transform = 'scaleX(0.8)'; }, 150);
        setTimeout(() => {
            bar.style.transform = 'scaleX(1)';
            setTimeout(() => {
                window.location.href = href;
            }, 150);
        }, 300);
    });

    // Theme Toggle Functionality
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    const applyLightMode = () => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelectorAll('.sun-icon').forEach(icon => icon.classList.add('hidden'));
        document.querySelectorAll('.moon-icon').forEach(icon => icon.classList.remove('hidden'));
    };

    const applyDarkMode = () => {
        document.documentElement.removeAttribute('data-theme');
        document.querySelectorAll('.moon-icon').forEach(icon => icon.classList.add('hidden'));
        document.querySelectorAll('.sun-icon').forEach(icon => icon.classList.remove('hidden'));
    };

    if (savedTheme === 'light') {
        applyLightMode();
    } else {
        applyDarkMode();
    }

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if(isLight) {
                applyDarkMode();
                localStorage.setItem('theme', 'dark');
            } else {
                applyLightMode();
                localStorage.setItem('theme', 'light');
            }
        });
    });

    // ===== Custom Cursor (desktop pointer devices only) =====
    const isDesktopPointer = window.matchMedia('(pointer: fine)').matches && navigator.maxTouchPoints === 0;
    if (isDesktopPointer) {
        const dot = document.createElement('div');
        const outline = document.createElement('div');
        dot.className = 'cursor-dot';
        outline.className = 'cursor-outline';
        document.body.appendChild(dot);
        document.body.appendChild(outline);
        document.documentElement.classList.add('has-custom-cursor');

        let outX = 0, outY = 0, mouseX = 0, mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (document.documentElement.classList.contains('video-modal-open')) {
                dot.classList.add('cursor-hide');
                outline.classList.add('cursor-hide');
                return;
            }
            
            // Hide if near scrollbar (right side) or top/bottom/left edges
            if (mouseX > window.innerWidth - 25 || mouseY < 5 || mouseX < 5 || mouseY > window.innerHeight - 5) {
                dot.classList.add('cursor-hide');
                outline.classList.add('cursor-hide');
            } else {
                dot.style.opacity = '1';
                outline.style.opacity = '1';
                dot.style.left = mouseX + 'px';
                dot.style.top  = mouseY + 'px';
                
                dot.classList.remove('cursor-hide');
                outline.classList.remove('cursor-hide');
            }
        });

        document.addEventListener('mouseleave', () => {
            dot.classList.add('cursor-hide');
            outline.classList.add('cursor-hide');
        });

        document.addEventListener('mouseenter', () => {
            if (document.documentElement.classList.contains('video-modal-open')) {
                return;
            }
            dot.classList.remove('cursor-hide');
            outline.classList.remove('cursor-hide');
        });

        // Smooth outline follow
        const tick = () => {
            outX += (mouseX - outX) * 0.15;
            outY += (mouseY - outY) * 0.15;
            outline.style.left = outX + 'px';
            outline.style.top  = outY + 'px';
            requestAnimationFrame(tick);
        };
        tick();

        // Hover enlarge on interactive elements
        document.addEventListener('pointerover', (event) => {
            if (event.target.closest('a, button, .social-icon, .theme-toggle')) {
                document.body.classList.add('cursor-hover');
            }
        });

        document.addEventListener('pointerout', (event) => {
            if (event.target.closest('a, button, .social-icon, .theme-toggle')) {
                document.body.classList.remove('cursor-hover');
            }
        });
    }

    // ===== Click Ripple (desktop only) =====
    if (isDesktopPointer) {
        window.addEventListener('mousedown', (e) => {
            if (document.documentElement.classList.contains('video-modal-open')) {
                return;
            }
            const r = document.createElement('div');
            r.className = 'click-ripple';
            r.style.left = e.clientX + 'px';
            r.style.top  = e.clientY + 'px';
            document.body.appendChild(r);
            r.addEventListener('animationend', () => r.remove());
        });
    }

    // ===== Lazy Loading with Skeleton =====
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.onload = () => {
                        img.classList.add('loaded');
                        const skeleton = img.previousElementSibling;
                        if (skeleton && skeleton.classList.contains('skeleton')) {
                            skeleton.classList.add('opacity-0');
                        }
                    };
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});
