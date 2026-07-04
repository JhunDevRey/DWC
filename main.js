document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------- */
    /* Back to top button (declared early — referenced      */
    /* by the scroll handler right below)                   */
    /* -------------------------------------------------- */
    const backToTop = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle('visible', window.scrollY > 600);
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* -------------------------------------------------- */
    /* Nav: shrink + solidify on scroll                    */
    /* -------------------------------------------------- */
    const nav = document.getElementById('mainNav');
    const onScroll = () => {
        if (nav) {
            if (window.scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
        toggleBackToTop();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -------------------------------------------------- */
    /* Mobile nav toggle                                   */
    /* -------------------------------------------------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu after tapping a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* -------------------------------------------------- */
    /* Active link highlighting based on section in view   */
    /* -------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(sec => navObserver.observe(sec));
    }

    /* -------------------------------------------------- */
    /* Scroll reveal for [data-reveal] elements             */
    /* -------------------------------------------------- */
    const revealTargets = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window && revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);

                    // Trigger counters the first time their container appears
                    entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
                    if (entry.target.matches('[data-count]')) animateCounter(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: just show everything and run counters immediately
        revealTargets.forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('[data-count]').forEach(animateCounter);
    }

    // Hero stats aren't wrapped in [data-reveal], animate them on load
    document.querySelectorAll('.hero-stats [data-count]').forEach(el => {
        setTimeout(() => animateCounter(el), 600);
    });

    /* -------------------------------------------------- */
    /* Animated counters                                    */
    /* -------------------------------------------------- */
    const countedElements = new WeakSet();

    function animateCounter(el) {
        if (countedElements.has(el)) return;
        countedElements.add(el);

        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target + suffix;
            }
        }
        requestAnimationFrame(tick);
    }

    /* -------------------------------------------------- */
    /* File upload drag state                               */
    /* -------------------------------------------------- */
    const uploadGroup = document.getElementById('uploadGroup');
    const fileInput = document.getElementById('resumeFile');

    if (uploadGroup && fileInput) {
        ['dragenter', 'dragover'].forEach(evt => {
            uploadGroup.addEventListener(evt, (e) => {
                e.preventDefault();
                uploadGroup.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            uploadGroup.addEventListener(evt, (e) => {
                e.preventDefault();
                uploadGroup.classList.remove('drag-over');
            });
        });

        uploadGroup.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    /* -------------------------------------------------- */
    /* Careers search: filter job cards by title, company,  */
    /* or keywords found in the tags / snippets              */
    /* -------------------------------------------------- */
    const jobSearchInput = document.getElementById('jobSearchInput');
    const jobList = document.getElementById('jobList');
    const jobCountEl = document.getElementById('jobCount');
    const noJobsMessage = document.getElementById('noJobsMessage');

    if (jobSearchInput && jobList) {
        const jobCards = Array.from(jobList.querySelectorAll('.job-card-list'));

        const filterJobs = () => {
            const query = jobSearchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            jobCards.forEach(card => {
                const haystack = card.textContent.toLowerCase();
                const matches = query === '' || haystack.includes(query);
                card.classList.toggle('is-hidden', !matches);
                if (matches) visibleCount++;
            });

            if (jobCountEl) jobCountEl.textContent = visibleCount;
            if (noJobsMessage) noJobsMessage.classList.toggle('visible', visibleCount === 0);
        };

        jobSearchInput.addEventListener('input', filterJobs);
        // Run once on load in case the field is pre-filled (e.g. browser autofill)
        filterJobs();
    }

    /* -------------------------------------------------- */
    /* Footer year                                          */
    /* -------------------------------------------------- */
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* -------------------------------------------------- */
    /* Safety net: force-reveal everything after 2.5s no    */
    /* matter what, so a future script error can never      */
    /* leave section content permanently invisible.         */
    /* -------------------------------------------------- */
    setTimeout(() => {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    }, 2500);

});

/* Belt-and-suspenders: if the DOMContentLoaded handler above throws for any
   reason before finishing, this independent listener still guarantees
   content becomes visible. */
window.addEventListener('error', () => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
});
