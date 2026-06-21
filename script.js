document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Sound & Synthesizer Logic (Web Audio API)
    // ----------------------------------------------------
    let audioCtx = null;
    let synthInterval = null;
    let isPlaying = false;
    let currentVolume = 0.5;

    // Helper to initialize AudioContext lazily on user action (browser restriction)
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Standard blip sound for retro clicks
    function playClickSound() {
        initAudio();
        if (!audioCtx) return;
        
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15); // Slide down
            
            gain.gain.setValueAtTime(0.05 * currentVolume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
            console.error('Audio play error:', e);
        }
    }


    // ----------------------------------------------------
    // Window Management (Dragging, Focus, Close, Min)
    // ----------------------------------------------------
    let highestZIndex = 10;
    const windows = document.querySelectorAll('.window');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const taskbarShortcuts = document.getElementById('taskbar-shortcuts');

    function bringToFront(win) {
        highestZIndex++;
        win.style.zIndex = highestZIndex;
        
        windows.forEach(w => w.classList.remove('active'));
        win.classList.add('active');
        win.style.display = 'flex';
        
        // Sync active taskbar shortcut styling
        const winId = win.id;
        document.querySelectorAll('.task-tab').forEach(tab => {
            if (tab.dataset.window === winId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    // Double click (or single click for mobile responsiveness) to open windows
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            // Check for double click on desktop
            playClickSound();
            const targetId = icon.dataset.target;
            const targetWin = document.getElementById(targetId);
            bringToFront(targetWin);
        });
    });

    // Close controls
    document.querySelectorAll('.win-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playClickSound();
            const targetId = btn.dataset.target;
            const targetWin = document.getElementById(targetId);
            targetWin.style.display = 'none';
            targetWin.classList.remove('active');
            
            // Remove active taskbar tab styling
            document.querySelectorAll('.task-tab').forEach(tab => {
                if (tab.dataset.window === targetId) {
                    tab.classList.remove('active');
                }
            });
        });
    });

    // Minimize controls
    document.querySelectorAll('.win-min').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playClickSound();
            const targetId = btn.dataset.target;
            const targetWin = document.getElementById(targetId);
            targetWin.style.display = 'none';
            targetWin.classList.remove('active');
            
            // Remove active taskbar tab styling
            document.querySelectorAll('.task-tab').forEach(tab => {
                if (tab.dataset.window === targetId) {
                    tab.classList.remove('active');
                }
            });
        });
    });

    // Taskbar Shortcuts clicking
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            playClickSound();
            const targetId = tab.dataset.window;
            const targetWin = document.getElementById(targetId);
            
            if (targetWin.style.display === 'none' || !targetWin.classList.contains('active')) {
                bringToFront(targetWin);
            } else {
                targetWin.style.display = 'none';
                targetWin.classList.remove('active');
                tab.classList.remove('active');
            }
        });
    });

    // Draggable Window Logic
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        header.onmousedown = dragMouseDown;
        
        // Touch supports for mobile devices
        header.ontouchstart = dragTouchStart;
        
        function dragMouseDown(e) {
            e = e || window.event;
            // Only drag on left click
            if (e.button !== 0) return;
            
            bringToFront(win);
            
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Keep window within taskbar limits
            let newTop = win.offsetTop - pos2;
            let newLeft = win.offsetLeft - pos1;
            
            if (newTop < 0) newTop = 0;
            if (newTop > window.innerHeight - 80) newTop = window.innerHeight - 80;
            
            win.style.top = newTop + "px";
            win.style.left = newLeft + "px";
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        // Mobile touch drag implementation
        function dragTouchStart(e) {
            bringToFront(win);
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            document.ontouchend = closeTouchDrag;
            document.ontouchmove = touchElementDrag;
        }

        function touchElementDrag(e) {
            pos1 = pos3 - e.touches[0].clientX;
            pos2 = pos4 - e.touches[0].clientY;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;

            let newTop = win.offsetTop - pos2;
            let newLeft = win.offsetLeft - pos1;

            if (newTop < 0) newTop = 0;
            if (newTop > window.innerHeight - 80) newTop = window.innerHeight - 80;

            win.style.top = newTop + "px";
            win.style.left = newLeft + "px";
        }

        function closeTouchDrag() {
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    });


    // ----------------------------------------------------
    // Start Menu Toggle
    // ----------------------------------------------------
    const startBtn = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    startBtn.addEventListener('click', (e) => {
        playClickSound();
        e.stopPropagation();
        startMenu.classList.toggle('active');
        startBtn.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        if (startMenu.classList.contains('active')) {
            startMenu.classList.remove('active');
            startBtn.classList.remove('active');
        }
    });

    document.querySelector('.shut-down-btn').addEventListener('click', () => {
        playClickSound();
        alert('† SYSTEM CRITICAL ERROR: Cannot shut down the internet angel! †');
    });


    // ----------------------------------------------------
    // Clock widget
    // ----------------------------------------------------
    function updateClock() {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        document.getElementById('clock').textContent = timeStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Default: Open profile window on load
    const profileWin = document.getElementById('win-profile');
    bringToFront(profileWin);
});
