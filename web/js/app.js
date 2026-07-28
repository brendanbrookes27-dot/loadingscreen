/* ==========================================
   CYBERPUNK OUTBACK HUD CONTROLLER (JS)
   Server: Hard Yakka Chronicles
   Autoplay: Yes (Janji - Heroes Tonight: 3nQNiWdeH2Q)
   ========================================== */

let ytPlayer;
let isMuted = false;
let isPlaying = false;
let terminalLines = [];
let progress = 0;
let simulatedInterval;

// Select Dom elements
const initOverlay = document.getElementById('init-overlay');
const initBtn = document.getElementById('init-btn');
const bgVideo = document.getElementById('bg-video');
const hudContainer = document.getElementById('hud-container');
const currentTimeEl = document.getElementById('current-time');
const terminalConsole = document.getElementById('terminal-console');
const loadStageEl = document.getElementById('load-stage');
const loadFileEl = document.getElementById('load-file');
const loadPercentageEl = document.getElementById('load-percentage');
const progressBarFill = document.getElementById('progress-bar-fill');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const playPauseBtn = document.getElementById('audio-play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');
const muteBtn = document.getElementById('audio-mute');
const muteIcon = document.getElementById('mute-icon');
const volumeRange = document.getElementById('volume-range');
const volPctEl = document.getElementById('vol-pct');
const visualizerBars = document.querySelectorAll('.vis-bar');

// 1. YouTube IFrame API Callback
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '3nQNiWdeH2Q',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'loop': 1,
            'playlist': '3nQNiWdeH2Q'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    ytPlayer.setVolume(50);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayPauseButton();
        startVisualizer();
    } else {
        isPlaying = false;
        updatePlayPauseButton();
        stopVisualizer();
    }
}

// 2. Setup System Boot and Audio initialization on clicking "INITIALIZE NEURAL LINK"
initBtn.addEventListener('click', () => {
    // Fade out boot overlay, reveal main HUD
    initOverlay.style.opacity = '0';
    setTimeout(() => {
        initOverlay.style.display = 'none';
        hudContainer.classList.remove('hidden');
    }, 800);

    // Ensure local background video is playing
    if (bgVideo && typeof bgVideo.play === 'function') {
        bgVideo.play().catch(err => console.log('Video play error:', err));
    }

    // Play YT music if loaded
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
        ytPlayer.unMute();
    }

    // Launch background simulations
    startClock();
    startConsoleBootLogs();

    // If not in actual FiveM loadscreen context, run browser simulated loading progress
    if (!window.nuiHandoverData && !navigator.userAgent.includes('FiveM')) {
        simulateFiveMLoading();
    }
});

// Clock function for HUD
function startClock() {
    setInterval(() => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        currentTimeEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// 3. Audio Controller Interactivity
playPauseBtn.addEventListener('click', () => {
    if (!ytPlayer) return;
    if (isPlaying) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
});

muteBtn.addEventListener('click', () => {
    if (!ytPlayer) return;
    if (isMuted) {
        ytPlayer.unMute();
        isMuted = false;
        muteIcon.innerHTML = `<path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />`;
    } else {
        ytPlayer.mute();
        isMuted = true;
        muteIcon.innerHTML = `<path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.44 16.63,19.79 17.68,18.95L20.73,22L22,20.73M19,12C19,12.91 18.81,13.77 18.47,14.56L19.97,16.06C20.62,14.83 21,13.46 21,12C21,7.72 18.03,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,11.23 16.16,10.55 15.61,10.08L16.89,11.37C16.96,11.57 17,11.78 17,12C17,13.77 16,15.29 14.5,16V13.56L16.5,15.56V12M12,4V8.18L10.5,6.68L12,5.18V4Z" />`;
    }
});

volumeRange.addEventListener('input', (e) => {
    const vol = e.target.value;
    volPctEl.textContent = `${vol}%`;
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(vol);
    }
});

function updatePlayPauseButton() {
    if (isPlaying) {
        // SVG for Pause
        playPauseIcon.innerHTML = `<path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />`;
    } else {
        // SVG for Play
        playPauseIcon.innerHTML = `<path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />`;
    }
}

// 4. Fake Audio visualizer animation while playing
let visInterval;
function startVisualizer() {
    if (visInterval) clearInterval(visInterval);
    visInterval = setInterval(() => {
        if (!isPlaying || isMuted) {
            visualizerBars.forEach(bar => bar.style.height = '10%');
            return;
        }
        visualizerBars.forEach(bar => {
            const h = Math.floor(Math.random() * 85) + 15; // Random height between 15% and 100%
            bar.style.height = `${h}%`;
        });
    }, 120);
}

function stopVisualizer() {
    if (visInterval) clearInterval(visInterval);
    visualizerBars.forEach(bar => bar.style.height = '10%');
}

// Keyboard shortcuts for Volume / Play Pause
window.addEventListener('keydown', (e) => {
    if (!ytPlayer) return;
    if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) ytPlayer.pauseVideo();
        else ytPlayer.playVideo();
    } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        let vol = Math.min(parseInt(volumeRange.value) + 5, 100);
        volumeRange.value = vol;
        volPctEl.textContent = `${vol}%`;
        ytPlayer.setVolume(vol);
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        let vol = Math.max(parseInt(volumeRange.value) - 5, 0);
        volumeRange.value = vol;
        volPctEl.textContent = `${vol}%`;
        ytPlayer.setVolume(vol);
    }
});

// 5. Interactive Tabs switching
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and tabs
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked button and target tab
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(`tab-${targetTab}`).classList.add('active');

        // Output action to console
        addTerminalLine(`ACCESSED PROTOCOL: //${targetTab.toUpperCase()}_DATABASE`, 'system');
    });
});

// 6. Cyberpunk Console Terminal Log dynamic printer
function addTerminalLine(text, type = 'info') {
    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
    const prefix = `[${timestamp}] `;

    let styleClass = 'line-info';
    if (type === 'success') styleClass = 'line-success';
    else if (type === 'warning') styleClass = 'line-warning';
    else if (type === 'system') styleClass = 'line-system';

    const lineMarkup = `<div class="console-line"><span class="line-info">${prefix}</span><span class="${styleClass}">${text}</span></div>`;

    terminalConsole.insertAdjacentHTML('beforeend', lineMarkup);
    terminalConsole.scrollTop = terminalConsole.scrollHeight;
}

// Seed terminal logs
function startConsoleBootLogs() {
    addTerminalLine('SYSTEM BOOT: SEQUENCE INITIALIZED', 'system');
    setTimeout(() => addTerminalLine('LOADER: CONNECTING TO HOST ADDRESS 127.0.0.1:30120', 'info'), 200);
    setTimeout(() => addTerminalLine('LOADER: HANDSHAKE SUCCESSFUL - QBOX HANDOVER RECEIVED', 'success'), 550);
    setTimeout(() => addTerminalLine('NET_INFRA: TUNNEL STABLE // ENCRYPTION AES-256', 'info'), 900);
}

// 7. FiveM Loader Event Hook implementation
const handlers = {
    startInitFunctionOrder(data) {
        addTerminalLine(`INIT ORDER: STARTING ORDER [${data.type}]`, 'system');
    },
    initFunctionInvoking(data) {
        addTerminalLine(`INVOKING FUNCTION: ${data.name} [${data.idx}/${data.count}]`, 'info');
        updateProgress(Math.floor((data.idx / data.count) * 100));
    },
    initFunctionInvoked(data) {
        addTerminalLine(`INVOKED FUNCTION: ${data.name} SUCCESSFUL`, 'success');
    },
    startDataFileEntries(data) {
        addTerminalLine(`DATA_ENTRY: INITIALIZING FILE STREAM [COUNT: ${data.count}]`, 'warning');
    },
    performMapLoadFunction(data) {
        addTerminalLine(`MAP_LOAD: PLOTTING NODE PATH`, 'info');
    },
    onLogLine(data) {
        addTerminalLine(data.message, 'info');
    }
};

window.addEventListener('message', function(e) {
    if (handlers[e.data.eventName]) {
        handlers[e.data.eventName](e.data);
    }
});

// Update progress bar and percentages
function updateProgress(pct) {
    if (pct < progress) return; // Prevent progress regression
    progress = pct;
    progressBarFill.style.width = `${progress}%`;
    loadPercentageEl.textContent = `${progress}%`;

    // Dynamic load stage text update based on percentage
    if (progress < 20) {
        loadStageEl.textContent = 'ESTABLISHING SECURE GATEWAYS...';
    } else if (progress < 45) {
        loadStageEl.textContent = 'DOWNLOADING SYSTEM SCRIPTS...';
    } else if (progress < 70) {
        loadStageEl.textContent = 'MOUNTING RESOURCE PACKAGES...';
    } else if (progress < 90) {
        loadStageEl.textContent = 'COMPILING SYSTEM PARSERS...';
    } else {
        loadStageEl.textContent = 'SYSTEM SYNC COMPLETE. PREPARING RECRUITMENT SPOOL...';
    }
}

// 8. Simulated Loader for general browser previews
const simulatedResources = [
    'core/system_init.cfg',
    'qbox-core/client/main.lua',
    'hardyakka-scripts/mining_jobs.js',
    'ox_lib/resource/init.lua',
    'ox_target/client/main.lua',
    'qbx-inventory/client/main.lua',
    'qbx-vehiclekeys/client/main.lua',
    'hardyakka-assets/client/neon_cars.ytd',
    'hardyakka-assets/client/skull_logo.yft',
    'hardyakka-map/client/outback_hq.ymap',
    'hardyakka-clothes/client/outback_leather.ydd',
    'spawnmanager/spawnmanager.lua',
    'system_sync/complete.cfg'
];

function simulateFiveMLoading() {
    let resIndex = 0;
    let pct = 0;

    simulatedInterval = setInterval(() => {
        if (pct >= 100) {
            clearInterval(simulatedInterval);
            updateProgress(100);
            loadFileEl.textContent = 'Spawning character client...';
            addTerminalLine('SYSTEM SYNC COMPLETE. PORT SHUTDOWN.', 'success');
            return;
        }

        // Advance progress
        pct += Math.floor(Math.random() * 8) + 2;
        if (pct > 100) pct = 100;
        updateProgress(pct);

        // Update load file and console
        if (resIndex < simulatedResources.length && pct % 10 < 3) {
            const currentRes = simulatedResources[resIndex];
            loadFileEl.textContent = `Downloading ${currentRes}`;
            addTerminalLine(`STREAMED ASSET: ${currentRes} - COMPLETED`, 'success');
            resIndex++;
        }
    }, 800);
}
