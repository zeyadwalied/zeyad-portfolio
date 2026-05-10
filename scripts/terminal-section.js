/* Terminal Coding Section — independent script */
(function () {
    const COLOR_CLASSES = ['c-green', 'c-cyan', 'c-blue', 'c-purple', 'c-pink', 'c-yellow', 'c-orange'];

    function init() {
        const terminalSection = document.querySelector('#terminal-section');
        const terminalContent = document.querySelector('.terminal-scroll-content');
        const terminalContainer = document.querySelector('.terminal-container');

        if (!terminalSection || !terminalContent || !terminalContainer) {
            return;
        }

        const linesCount = 14;
        const lines = [];
        const lineColors = [];

        function pickColor() {
            return COLOR_CLASSES[Math.floor(Math.random() * COLOR_CLASSES.length)];
        }

        const CODE_SNIPPETS = [
            "const app = express().use(cors()).use(json());",
            "async function fetchUser(id) { return await db.query(id); }",
            "export default function Component({ data }) { return <View />; }",
            "if (user.role === 'admin') return next(); else throw new Error('403');",
            "const [state, setState] = useState({ loading: true, error: null });",
            "await Promise.all(tasks.map(t => processTask(t).catch(logger.error)));",
            "router.post('/api/checkout', authMiddleware, controller.checkout);",
            "const cache = new Map(); cache.set(key, { value, expires: Date.now() + TTL });",
            "git commit -m 'feat(core): ship zero-downtime migration path';",
            "SELECT id, name, created_at FROM users WHERE active = 1 LIMIT 50;",
            "docker run -d --name api -p 3000:3000 --env-file .env zeyad/api:latest",
            "useEffect(() => { const sub = obs.subscribe(setData); return () => sub.unsubscribe(); }, []);",
            "add_action('woocommerce_before_checkout_form', 'zw_render_upsell', 20);",
            "function* tokenize(src) { for (const ch of src) yield classify(ch); }",
            "try { const data = JSON.parse(raw); } catch (e) { sentry.capture(e); }",
            "const onScroll = debounce(() => ScrollTrigger.refresh(), 120);",
            "module.exports = { preset: 'ts-jest', testEnvironment: 'node' };",
            "npm run build && npm run deploy -- --env=production --region=eu-west-1",
            "class Queue { enqueue(job) { this.#heap.push(job); this.#sift(); } }",
            "CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);",
            "for (const route of routes) app.use(route.path, route.handler);",
            "@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }",
            "pm2 start ecosystem.config.js --env production --update-env",
            "return res.status(201).json({ ok: true, id: inserted.insertedId });",
            "wp plugin install advanced-custom-fields-pro --activate --force",
            "gsap.from('.hero', { y: 60, opacity: 0, stagger: 0.08, ease: 'power3.out' });",
            "const ws = new WebSocket(url); ws.onmessage = ({ data }) => dispatch(JSON.parse(data));",
            "Object.freeze(config); Object.seal(state); Object.defineProperty(obj, 'id', { writable: false });",
            "observer = new IntersectionObserver(onEnter, { threshold: [0, 0.5, 1] });",
            "UPDATE products SET stock = stock - 1 WHERE sku = ? AND stock > 0;",
            "app.use((err, req, res, next) => res.status(500).send({ error: err.message }));",
            "const schema = z.object({ email: z.string().email(), age: z.number().min(18) });",
            "nginx -s reload && systemctl status nginx.service --no-pager -l",
            "return lodash.chunk(items, pageSize).map((page, i) => ({ page: i + 1, data: page }));",
            "define('WP_DEBUG', true); define('WP_CACHE', true); define('AUTOSAVE_INTERVAL', 300);",
            "curl -sSL https://api.zeyad.dev/v1/health | jq '.status'",
            "RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*",
            "self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request)));",
            "(() => { const mod = require('./core'); mod.init(process.env); })();",
            "const payload = crypto.createHmac('sha256', secret).update(body).digest('hex');"
        ];

        const BINARY_HEADERS = [
            '[0x7F 0x45 0x4C 0x46]',
            '[heap::alloc 0x14A0]',
            '[sys_call:OK]',
            '[mem::0x3FA2 -> stack]',
            '[proc:0x1A7F ready]',
            '[core::mount success]'
        ];

        function generateRandomCode() {
            // 15% chance for a binary/system header line
            if (Math.random() < 0.15) {
                return BINARY_HEADERS[Math.floor(Math.random() * BINARY_HEADERS.length)];
            }
            return CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        }

        // Build initial lines synchronously
        terminalContent.innerHTML = '';
        for (let i = 0; i < linesCount; i++) {
            const line = document.createElement('span');
            const color = pickColor();
            line.className = 'terminal-line ' + color;
            line.textContent = generateRandomCode();
            terminalContent.appendChild(line);
            lines.push(line);
            lineColors.push(color);
        }

        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        lines[lines.length - 1].appendChild(cursor);

        function typeNewLine() {
            // Shift text + colors up
            for (let i = 0; i < linesCount - 1; i++) {
                lines[i].textContent = lines[i + 1].textContent;
                lineColors[i] = lineColors[i + 1];
                lines[i].className = 'terminal-line ' + lineColors[i];
            }
            const newColor = pickColor();
            lineColors[linesCount - 1] = newColor;
            lines[linesCount - 1].textContent = generateRandomCode();
            lines[linesCount - 1].className = 'terminal-line ' + newColor + ' highlight';
            lines[linesCount - 1].appendChild(cursor);
        }

        let isScrolling = false;
        let scrollTimeout;
        let typeInterval = setInterval(typeNewLine, 700);

        // GSAP animations
        if (window.gsap && window.ScrollTrigger) {
            const isMobile = window.matchMedia('(max-width: 767px)').matches;

            if (!isMobile) {
                // Terminal enters small and grows — starts later (when near middle of screen)
                gsap.fromTo(terminalContainer,
                    { scale: 0.65, y: 100, rotateX: -18 },
                    {
                        scale: 1, y: 0, rotateX: 2,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: terminalSection,
                            start: 'top 60%',
                            end: 'top 15%',
                            scrub: 1.4
                        }
                    }
                );

                // Glow parallax
                const glow = document.querySelector('.terminal-glow');
                if (glow) {
                    gsap.fromTo(glow,
                        { scale: 0.5, opacity: 0 },
                        {
                            scale: 1.05, opacity: 0.7,
                            scrollTrigger: {
                                trigger: terminalSection,
                                start: 'top 70%',
                                end: 'center 50%',
                                scrub: 1
                            }
                        }
                    );
                }
            }

            // Velocity-driven typing speed
            ScrollTrigger.create({
                trigger: terminalSection,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: function (self) {
                    const velocity = Math.abs(self.getVelocity());
                    if (velocity > 80) {
                        if (!isScrolling) {
                            isScrolling = true;
                            terminalContainer.classList.add('is-scrolling');
                            clearInterval(typeInterval);
                            typeInterval = setInterval(typeNewLine, Math.max(40, 280 - velocity / 5));
                        }
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(function () {
                            isScrolling = false;
                            terminalContainer.classList.remove('is-scrolling');
                            clearInterval(typeInterval);
                            typeInterval = setInterval(typeNewLine, 700);
                        }, 200);
                    }
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
