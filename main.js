document.addEventListener('DOMContentLoaded', () => {

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
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth < 768) {
                navLinks.classList.add('hidden');
                navLinks.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'w-full', 'bg-dark-secondary', 'p-6', 'gap-4');
            }
        });
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
    window.openVideoModal = function(videoId) {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('modalIframe');
        if(modal && iframe) {
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
        bar.style.width = '0%';
        bar.style.opacity = '1';
        void bar.offsetWidth; // Force reflow
        bar.style.transition = 'width 0.3s ease-out, opacity 0.5s ease';
        return bar;
    };

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            // Allow default behavior for external links or in-page anchors
            if(href && href.endsWith('.html') && !href.startsWith('http') && anchor.target !== '_blank') {
                e.preventDefault();
                const bar = createLoadingBar();
                
                // Animate progress
                setTimeout(() => { bar.style.width = '40%'; }, 10);
                setTimeout(() => { bar.style.width = '80%'; }, 150);
                setTimeout(() => { 
                    bar.style.width = '100%'; 
                    setTimeout(() => {
                        window.location.href = href;
                    }, 150);
                }, 300);
            }
        });
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
});