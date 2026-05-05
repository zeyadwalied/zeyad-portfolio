document.addEventListener('DOMContentLoaded', () => {
    // ===== Initialize Lenis Smooth Scrolling =====
    if (typeof Lenis !== 'undefined') {
        window.lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.2
        });

        if (typeof gsap !== 'undefined') {
            window.lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                window.lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                window.lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // ===== Custom Cursor Logic =====
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.custom-cursor-follower');
    
    if (cursor && cursorFollower) {
        // Show cursor initially on first mouse move
        window.addEventListener('mousemove', () => {
            gsap.to([cursor, cursorFollower], { opacity: 1, duration: 0.3 });
        }, { once: true });

        // Update cursor position
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
            gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
        });

        // Add hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, canvas, [role="button"], [onclick], .project-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                cursorFollower.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                cursorFollower.classList.remove('hovering');
            });
        });
    }

    // ===== GSAP Sophisticated Modern Animations =====
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 0. Hero Content Wrapper Entrance (no wave floating)
        const heroWrapper = document.querySelector('.hero-content-wrapper');
        if (heroWrapper) {
            gsap.fromTo(heroWrapper, 
                { scale: 0.95, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 1.2, ease: "expo.out" }
            );
        }

        // 1. Master Hero Timeline — all elements start hidden, appear in sequence
        const heroTl = gsap.timeline({ delay: 0.2 });
        
        // Immediately hide elements to prevent CSS flash
        gsap.set(".hero-kicker, .hero-role, .hero-actions, .hero-side, .hero-socials", { opacity: 0, y: 20 });
        gsap.set(".hero-actions a", { opacity: 0, y: 10, scale: 0.9 });
        gsap.set(".hero-socials a", { opacity: 0, y: 8 });

        // Kicker text
        heroTl.to(".hero-kicker", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });

        // Scanner reveal for the name
        const heroName = document.querySelector('.hero-name-text');
        const scannerLine = document.querySelector('.scanner-line');
        if (heroName && scannerLine) {
            heroTl.set(heroName, { opacity: 1, clipPath: "inset(0 100% 0 0)" })
                  .fromTo(scannerLine, { opacity: 0, left: "0%" }, { opacity: 1, duration: 0.1 })
                  .to(scannerLine, { left: "100%", duration: 0.9, ease: "power4.inOut" })
                  .to(heroName, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.inOut" }, "<")
                  .to(scannerLine, { opacity: 0, duration: 0.2 });
        }

        // Role text
        heroTl.to(".hero-role", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");

        // Buttons — staggered with a bounce
        heroTl.to(".hero-actions", { opacity: 1, y: 0, duration: 0.3 }, "-=0.2")
              .to(".hero-actions a", { 
                  opacity: 1, y: 0, scale: 1, 
                  stagger: 0.08, duration: 0.5, ease: "back.out(1.7)" 
              }, "-=0.2");

        // Side panel (detail card)
        heroTl.to(".hero-side", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5");

        // Socials — staggered pop-in
        heroTl.to(".hero-socials", { opacity: 1, y: 0, duration: 0.3 }, "-=0.3")
              .to(".hero-socials a", {
                  opacity: 1, y: 0, 
                  stagger: 0.06, duration: 0.4, ease: "back.out(1.4)"
              }, "-=0.15");

        // GSAP Magnetic Button Hover
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            });
        });

        // 2. About Me Section - Deep Reveal & Parallax
        const aboutSection = document.querySelector('.about-me-gsap');
        if (aboutSection) {
            const imgWrapper = aboutSection.querySelector('.rounded-full');
            const shape = aboutSection.querySelector('.cyber-shape-pos');
            const aboutText = aboutSection.querySelector('p');
            
            // Continuous floating animation for the image
            if (imgWrapper) {
                gsap.to(imgWrapper, {
                    y: -15,
                    duration: 2.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1
                });
            }

            // Staggered text replacement (manual word split)
            if (aboutText) {
                const text = aboutText.textContent;
                const words = text.split(' ').filter(w => w.trim() !== '').map(word => `<span class="inline-block translate-y-4 opacity-0 filter blur-sm">${word}</span>`).join(' ');
                aboutText.innerHTML = words;
            }

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: aboutSection,
                    start: "top 80%",
                }
            });

            tl.fromTo(aboutSection, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
              .fromTo(shape, { rotation: -180, scale: 0, opacity: 0 }, { rotation: 0, scale: 1, opacity: 0.4, duration: 1.5, ease: "elastic.out(1, 0.5)" }, "-=0.8");
              
            if (aboutText) {
                const spans = aboutText.querySelectorAll('span');
                tl.fromTo(spans, 
                    { y: 20, opacity: 0, filter: "blur(4px)" },
                    { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, stagger: 0.015, ease: "power2.out" }, 
                    "-=1"
                );
            }
        }

        // 3. Tech Chips - Floating Reveal
        const techSection = document.querySelector('.tech-wave-gsap');
        if (techSection) {
            // Animate the SVG wave line drawing
            const wavePath = techSection.querySelector('.featured-tech-wave path');
            if (wavePath) {
                const pathLength = wavePath.getTotalLength();
                gsap.set(wavePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
                gsap.to(wavePath, {
                    strokeDashoffset: 0,
                    duration: 2,
                    ease: "power2.inOut",
                    scrollTrigger: { trigger: techSection, start: "top 80%" }
                });
            }

            gsap.fromTo(".featured-tech-chip", 
                { y: 30, opacity: 0, filter: "blur(5px)" },
                { 
                    y: 0, 
                    opacity: 1, 
                    filter: "blur(0px)",
                    duration: 0.8, 
                    stagger: 0.08, 
                    ease: "power2.out",
                    scrollTrigger: { trigger: techSection, start: "top 85%" }
                }
            );
        }

        // Section Title Wipe Reveals
        gsap.utils.toArray('.scroll-reveal h1, .scroll-reveal h2, #featured-projects h2').forEach(title => {
            gsap.fromTo(title,
                { clipPath: "inset(0 100% 0 0)", opacity: 0 },
                { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: title, start: "top 85%" }
                }
            );
        });

        // 6. Generic Scroll Reveals (Containers etc)
        gsap.utils.toArray('.scroll-reveal:not(h1):not(h2)').forEach(el => {
            gsap.fromTo(el, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, y: 0, duration: 1, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 90%" }
                }
            );
        });

        // 4. Projects — Clip-path Curtain Reveal + Image Zoom
        const projectCards = gsap.utils.toArray('.project-card');
        projectCards.forEach((card) => {
            const img = card.querySelector('img');
            const content = card.querySelector('.p-6');
            
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                }
            });

            tl.fromTo(card, 
                { clipPath: "inset(100% 0 0 0)", opacity: 0 },
                { clipPath: "inset(0% 0 0 0)", opacity: 1, duration: 1, ease: "power4.out" }
            );

            if (img) {
                // Initial Entrance
                tl.fromTo(img,
                    { scale: 1.4, filter: "blur(5px)" },
                    { scale: 1.05, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }, "-=0.8"
                );
                
                // Parallax Effect
                gsap.to(img, {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }

            if (content) {
                tl.fromTo(content.children, 
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=0.8"
                );
            }
        });
        
        // 5. CTA Section Premium Reveal
        const ctaSection = document.querySelector('#cta');
        if (ctaSection) {
            const ctaContent = ctaSection.querySelector('.text-center');
            gsap.fromTo(ctaContent.children, 
                { y: 60, opacity: 0, scale: 0.95, filter: "blur(8px)" },
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1, 
                    stagger: 0.08, 
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: ctaSection,
                        start: "top 80%",
                    }
                }
            );
        }

        // 6. Skill cards — Staggered Wave with Scale
        const skillsSection = document.querySelector('#skills-overview');
        if (skillsSection) {
            gsap.fromTo(".icon-skill-card", 
                { y: 40, opacity: 0, scale: 0.9, filter: "blur(10px)" },
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1.2, 
                    stagger: {
                        each: 0.04,
                        grid: "auto",
                        from: "start"
                    }, 
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: ".skills-icon-grid",
                        start: "top 85%",
                    }
                }
            );
        }

        // 7. Generic Inner Page Reveals (Left/Right/Cards)
        gsap.utils.toArray('.reveal-left').forEach(el => {
            gsap.fromTo(el, 
                { x: -50, opacity: 0 }, 
                { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }
            );
        });

        gsap.utils.toArray('.reveal-right').forEach(el => {
            gsap.fromTo(el, 
                { x: 50, opacity: 0 }, 
                { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }
            );
        });

        // 8. Subpage Heroes / Headers (Above fold animations)
        const subHeroes = gsap.utils.toArray('.about-page-hero, .contact-page-hero');
        subHeroes.forEach(hero => {
            gsap.fromTo(hero, 
                { y: 40, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }
            );
            
            // Stagger children inside the hero
            const children = hero.querySelectorAll('.about-page-kicker, .about-page-lead, .about-page-badge, .about-page-card img, .about-page-stat, .contact-page-kicker, .contact-page-title, .contact-page-lead, .contact-page-badge');
            if (children.length) {
                gsap.fromTo(children,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.3 }
                );
            }
        });

        // 8.1 Modern Character Reveal for About & Contact Titles
        const titlesToReveal = document.querySelectorAll('.about-page-title, .contact-page-title');
        titlesToReveal.forEach(title => {
            const text = title.textContent;
            title.innerHTML = text.split(' ').map(word => 
                `<span style="display:inline-block; overflow:hidden; vertical-align:bottom;">
                    <span style="display:inline-block;">${word}&nbsp;</span>
                </span>`
            ).join('');
            
            gsap.from(title.querySelectorAll('span > span'), {
                y: "100%",
                duration: 1.2,
                stagger: 0.05,
                ease: "expo.out",
                delay: 0.5,
                scrollTrigger: {
                    trigger: title,
                    start: "top 90%"
                }
            });
        });

        // 8.3 Contact Page Specifics (Magnetic Button & Form Reveal)
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            const inputs = contactForm.querySelectorAll('.contact-input, button');
            gsap.from(inputs, {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out",
                delay: 0.8
            });
            
            // Magnetic Submit Button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = submitBtn.getBoundingClientRect();
                    const x = (e.clientX - left) / width - 0.5;
                    const y = (e.clientY - top) / height - 0.5;
                    
                    gsap.to(submitBtn, {
                        x: x * 30,
                        y: y * 20,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                });
                
                submitBtn.addEventListener('mouseleave', () => {
                    gsap.to(submitBtn, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            }
        }

        // 8.4 Magnetic Contact Methods
        const contactMethods = document.querySelectorAll('.contact-method');
        contactMethods.forEach(method => {
            const icon = method.querySelector('.contact-method-icon');
            if (icon) {
                method.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = method.getBoundingClientRect();
                    const x = (e.clientX - left) / width - 0.5;
                    const y = (e.clientY - top) / height - 0.5;
                    
                    gsap.to(icon, {
                        x: x * 40,
                        y: y * 40,
                        scale: 1.1,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                    
                    gsap.to(method, {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        duration: 0.3
                    });
                });
                
                method.addEventListener('mouseleave', () => {
                    gsap.to(icon, {
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)"
                    });
                    
                    gsap.to(method, {
                        backgroundColor: "rgba(255, 255, 255, 0)",
                        duration: 0.3
                    });
                });
            }
        });

        // 9. About Story Details Items Stagger
        const detailItems = document.querySelectorAll('.about-detail-item');
        if (detailItems.length) {
            gsap.fromTo(detailItems, 
                { x: 30, opacity: 0 },
                { 
                    x: 0, 
                    opacity: 1, 
                    duration: 0.6, 
                    stagger: 0.08, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".about-details-panel",
                        start: "top 85%"
                    }
                }
            );
        }
    }

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




    // Skill Bars BOLD GSAP animation
    const skillPanels = document.querySelectorAll('.about-skill-panel');
    if (skillPanels.length > 0) {
        skillPanels.forEach(panel => {
            const items = panel.querySelectorAll('.skill-item');
            
            // 1. Panel Entrance
            gsap.fromTo(panel, 
                { y: 60, opacity: 0, scale: 0.95 },
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1, 
                    duration: 1.2, 
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 90%",
                        once: true
                    }
                }
            );

            // 2. Staggered Items & Bars
            items.forEach((item, index) => {
                const bar = item.querySelector('.skill-bar');
                const percentText = item.querySelector('.text-accent.text-sm');
                const targetWidth = bar ? bar.getAttribute('data-width') : "0%";
                const targetVal = parseInt(targetWidth);

                // Initial states to prevent flash
                if (bar) bar.style.width = "0%";

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: item,
                        start: "top 95%",
                        once: true
                    }
                });

                tl.fromTo(item, 
                    { x: -30, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
                );

                if (bar) {
                    tl.to(bar, {
                        width: targetWidth,
                        duration: 1.8,
                        ease: "expo.out"
                    }, "-=0.4");
                }

                if (percentText) {
                    const counter = { val: 0 };
                    tl.to(counter, {
                        val: targetVal,
                        duration: 1.8,
                        ease: "expo.out",
                        onUpdate: () => {
                            percentText.textContent = Math.ceil(counter.val) + "%";
                        }
                    }, "<");
                }
            });
        });
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
