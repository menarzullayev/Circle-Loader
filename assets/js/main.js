(function () {
    'use strict';

    const root    = document.documentElement;
    const body    = document.body;
    const ring    = document.getElementById('ring');
    const label   = document.getElementById('stateLabel');
    const playBtn = document.getElementById('playBtn');
    const playLbl = playBtn.querySelector('.play-label');

    // ── Config ─────────────────────────────────────────────────────────────────
    const THEMES = [
        { name: 'Neon',   colors: ['#7c3aed','#06b6d4','#f43f5e','#facc15','#34d399','#f97316'] },
        { name: 'Ocean',  colors: ['#0ea5e9','#6366f1','#8b5cf6','#06b6d4','#2dd4bf','#38bdf8'] },
        { name: 'Sunset', colors: ['#ef4444','#f97316','#eab308','#84cc16','#fb7185','#a855f7'] },
        { name: 'Pastel', colors: ['#aac3cd','#fcac14','#8b3bdb','#f83d0c','#4ade80','#f9a8d4'] },
        { name: 'Mono',   colors: ['#e4e4e7','#a1a1aa','#71717a','#52525b','#3f3f46','#27272a'] },
    ];

    const SPEEDS = [
        { label: 'Slow',   value: '6s'  },
        { label: 'Normal', value: '3s'  },
        { label: 'Fast',   value: '1.2s'},
    ];

    const COUNTS = [3, 4, 5, 6];

    // ── State (with localStorage persistence) ──────────────────────────────────
    let state = {
        theme:  parseInt(localStorage.getItem('cl-theme')  ?? '0'),
        speed:  parseInt(localStorage.getItem('cl-speed')  ?? '1'),
        count:  parseInt(localStorage.getItem('cl-count')  ?? '4'),
        dark:   localStorage.getItem('cl-dark') !== 'light',
        paused: false,
    };

    function save() {
        localStorage.setItem('cl-theme', state.theme);
        localStorage.setItem('cl-speed', state.speed);
        localStorage.setItem('cl-count', state.count);
        localStorage.setItem('cl-dark',  state.dark ? 'dark' : 'light');
    }

    // ── Build circles ──────────────────────────────────────────────────────────
    function buildCircles(n) {
        root.style.setProperty('--count', n);
        ring.innerHTML = '';
        for (let i = 0; i < n; i++) {
            const arm = document.createElement('div');
            arm.className = 'ring__arm';
            arm.style.setProperty('--i', i);
            const circle = document.createElement('div');
            circle.className = 'ring__circle';
            arm.appendChild(circle);
            ring.appendChild(arm);
        }
    }

    // ── Apply theme ────────────────────────────────────────────────────────────
    function applyTheme(idx) {
        const t = THEMES[idx];
        t.colors.forEach((c, i) => root.style.setProperty(`--c${i + 1}`, c));
        state.theme = idx;
        document.querySelectorAll('.ctrl-swatch').forEach((b, i) =>
            b.classList.toggle('active', i === idx));
        save();
    }

    // ── Apply speed ────────────────────────────────────────────────────────────
    function applySpeed(idx) {
        root.style.setProperty('--speed', SPEEDS[idx].value);
        state.speed = idx;
        document.querySelectorAll('#speedBar .ctrl-btn').forEach((b, i) =>
            b.classList.toggle('active', i === idx));
        save();
    }

    // ── Apply count ────────────────────────────────────────────────────────────
    function applyCount(n) {
        buildCircles(n);
        state.count = n;
        document.querySelectorAll('#countBar .ctrl-btn').forEach(b =>
            b.classList.toggle('active', parseInt(b.dataset.val) === n));
        save();
    }

    // ── Apply dark/light ───────────────────────────────────────────────────────
    function applyDark(dark) {
        body.classList.toggle('dark',  dark);
        body.classList.toggle('light', !dark);
        state.dark = dark;
        save();
    }

    // ── Toggle pause ───────────────────────────────────────────────────────────
    function togglePlay() {
        state.paused = !state.paused;
        root.style.setProperty('--play', state.paused ? 'paused' : 'running');
        body.classList.toggle('paused', state.paused);
        playLbl.textContent = state.paused ? 'Play' : 'Pause';
        label.textContent   = state.paused ? 'Paused' : 'Loading';
        playBtn.setAttribute('aria-label', state.paused ? 'Play animation' : 'Pause animation');
    }

    // ── Build controls ─────────────────────────────────────────────────────────
    function buildControls() {
        // Theme swatches
        const themeBar = document.getElementById('themeBar');
        THEMES.forEach((t, i) => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-swatch';
            btn.title = t.name;
            btn.setAttribute('aria-label', `${t.name} theme`);
            // Gradient from first + third color of theme
            btn.style.background = `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[2]} 50%)`;
            btn.addEventListener('click', () => applyTheme(i));
            themeBar.appendChild(btn);
        });

        // Speed buttons
        const speedBar = document.getElementById('speedBar');
        SPEEDS.forEach((s, i) => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn';
            btn.textContent = s.label;
            btn.setAttribute('aria-label', `${s.label} speed`);
            btn.addEventListener('click', () => applySpeed(i));
            speedBar.appendChild(btn);
        });

        // Count buttons
        const countBar = document.getElementById('countBar');
        COUNTS.forEach(n => {
            const btn = document.createElement('button');
            btn.className = 'ctrl-btn';
            btn.textContent = n;
            btn.dataset.val = n;
            btn.setAttribute('aria-label', `${n} circles`);
            btn.addEventListener('click', () => applyCount(n));
            countBar.appendChild(btn);
        });

        // Play button
        playBtn.addEventListener('click', togglePlay);

        // Dark toggle
        document.getElementById('darkToggle').addEventListener('click', () =>
            applyDark(!state.dark));
    }

    // ── Keyboard ───────────────────────────────────────────────────────────────
    function initKeyboard() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    applySpeed(Math.max(0, state.speed - 1));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    applySpeed(Math.min(SPEEDS.length - 1, state.speed + 1));
                    break;
                case 't': case 'T':
                    applyTheme((state.theme + 1) % THEMES.length);
                    break;
                case '3': applyCount(3); break;
                case '4': applyCount(4); break;
                case '5': applyCount(5); break;
                case '6': applyCount(6); break;
            }
        });
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    buildControls();
    applyDark(state.dark);
    applyTheme(state.theme);
    applySpeed(state.speed);
    applyCount(state.count);
    initKeyboard();

})();
