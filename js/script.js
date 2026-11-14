// Particles.js Configuration
document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#58a6ff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#58a6ff", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" }
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 1 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }
});

// --- INTERACTIVE LIVE DEMO LOGIC ---

// Student Database (Same as Arduino Code)
const students = {
    "159": { name: "Ankur", dept: "CSE" },
    "113": { name: "Manik", dept: "EEE" },
    "153": { name: "Tina", dept: "BBA" },
    "120": { name: "Mahi", dept: "IT" }
};

let enteredID = "";
const lcdLine1 = document.getElementById('lcdLine1');
const lcdLine2 = document.getElementById('lcdLine2');
const greenLed = document.getElementById('greenLed');
const redLed = document.getElementById('redLed');

// Play Beep Sound (Using Web Audio API)
function playBeep(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(2500, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'error') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

// Reset Home Screen
function showHomeScreen() {
    lcdLine1.innerText = "Scan ID & Press#";
    lcdLine2.innerText = "ID: " + enteredID;
    greenLed.classList.remove('active');
    redLed.classList.remove('active');
}

// Main Keypad Logic
function pressKey(key) {
    // If reset is pressed (*)
    if (key === '*') {
        enteredID = "";
        showHomeScreen();
        return;
    }

    // If submit is pressed (#)
    if (key === '#') {
        if (enteredID.length === 3) {
            verifyStudent(enteredID);
        } else {
            // Not enough digits
            lcdLine1.innerText = "Error: Need 3-ID";
            lcdLine2.innerText = "ID: " + enteredID;
            redLed.classList.add('active');
            playBeep('error');
            setTimeout(() => {
                enteredID = "";
                showHomeScreen();
            }, 2000);
        }
        return;
    }

    // If a number is pressed
    if (enteredID.length < 3 && !isNaN(key)) {
        enteredID += key;
        lcdLine1.innerText = "Enter 3-Digit ID";
        lcdLine2.innerText = "ID: " + enteredID;
    }
}

// Verify Logic
function verifyStudent(id) {
    greenLed.classList.remove('active');
    redLed.classList.remove('active');

    if (students[id]) {
        // Valid Student
        greenLed.classList.add('active');
        playBeep('success');
        lcdLine1.innerText = `${students[id].name} (${students[id].dept})`;
        lcdLine2.innerText = "Status: Valid";
        
        setTimeout(() => {
            enteredID = "";
            showHomeScreen();
        }, 3000); // Show for 3 seconds
    } else {
        // Invalid Student
        redLed.classList.add('active');
        playBeep('error');
        lcdLine1.innerText = "ID: " + id;
        lcdLine2.innerText = "Invalid ID!";
        
        setTimeout(() => {
            enteredID = "";
            showHomeScreen();
        }, 3000);
    }
}