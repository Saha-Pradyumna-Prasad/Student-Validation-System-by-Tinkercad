(() => {
'use strict';
document.documentElement.classList.add('js');
const $ = id => document.getElementById(id);
const q = s => document.querySelector(s);
const qa = s => [...document.querySelectorAll(s)];

/* ---------- Background particles (copper, subtle) ---------- */
if (window.particlesJS) particlesJS('particles-js', {
  particles: {
    number: { value: innerWidth < 768 ? 18 : 38, density: { enable: true, value_area: 900 } },
    color: { value: '#d8a845' }, shape: { type: 'circle' },
    opacity: { value: 0.35 }, size: { value: 2.5, random: true },
    line_linked: { enable: true, distance: 150, color: '#d8a845', opacity: 0.12, width: 1 },
    move: { enable: true, speed: 1.2, out_mode: 'out' }
  },
  interactivity: {
    detect_on: 'window',
    events: { onhover: { enable: true, mode: 'grab' } },
    modes: { grab: { distance: 150, line_linked: { opacity: 0.5 } } }
  },
  retina_detect: true
});

/* ---------- Page chrome: navbar, progress bar, back-to-top, scroll-spy ---------- */
const nav = $('nav'), bar = $('bar'), up = $('toTop');
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('scrolled', y > 40);
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  up.classList.toggle('show', y > 600);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();
up.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

const links = qa('.nav-link[href^="#"]');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
qa('section[id],header[id]').forEach(s => spy.observe(s));
links.forEach(a => a.addEventListener('click', () => {
  const m = bootstrap.Collapse.getInstance($('menu'));
  if (m) m.hide();
}));

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  el.style.transitionDelay = ([...el.parentNode.children].indexOf(el) % 4) * 90 + 'ms';
  el.classList.add('in');
  io.unobserve(el);
  setTimeout(() => (el.style.transitionDelay = ''), 1200);
}), { threshold: 0, rootMargin: '0px 0px -6% 0px' });
qa('.reveal,.draw').forEach(el => io.observe(el));

/* ---------- Copy code ---------- */
$('copyBtn').onclick = async e => {
  const b = e.currentTarget;
  try {
    await navigator.clipboard.writeText(q('.code-win code').innerText);
    b.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => (b.innerHTML = '<i class="far fa-copy"></i> Copy'), 1800);
  } catch (_) { b.textContent = 'Press Ctrl+C'; }
};

/* ---------- Live Arduino demo ---------- */
const DB = {
  159: { name: 'Ankur', dept: 'CSE', pay: 'Paid' },
  113: { name: 'Manik', dept: 'EEE', pay: 'Due' },
  153: { name: 'Tina',  dept: 'BBA', pay: 'Paid' },
  120: { name: 'Mahi',  dept: 'IT',  pay: 'Due' }
};
const L1 = $('lcdLine1'), L2 = $('lcdLine2'), lcd = q('.lcd');
const gl = $('greenLed'), rl = $('redLed'), bz = $('buzzer');
const card = $('idCard'), kp = $('keypad');
let id = '', busy = true, mute = false, ac = null, live = true;

const show = (a, b) => { L1.textContent = a.slice(0, 16); L2.textContent = b.slice(0, 16); };
const home = () => {
  show('Scan ID & Press#', 'ID: ' + id);
  gl.classList.remove('on'); rl.classList.remove('on');
  lcd.className = 'lcd';
};
const setCard = (av, title, sub, tag, cls) => {
  card.className = 'id-card ' + cls;
  card.innerHTML = `<div class="av">${av}</div><div><b>${title}</b><small>${sub}</small></div>` +
    (tag ? `<span class="tag ${tag.toLowerCase()}">${tag}</span>` : '');
};

function beep(seq, type, ms) {
  bz.classList.add('on');
  setTimeout(() => bz.classList.remove('on'), ms);
  if (mute) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    seq.forEach(([f, d], i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.18;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + d);
    });
  } catch (_) {}
}

// Like delay() on the real Arduino: keys are ignored while a result is on screen
function respond(ok, l1, l2, ms) {
  busy = true;
  (ok ? gl : rl).classList.add('on');
  lcd.classList.add(ok ? 'ok' : 'err');
  show(l1, l2);
  setTimeout(() => { id = ''; busy = false; home(); }, ms);
}

function press(k) {
  if (busy) return;
  if (k === '*') { id = ''; home(); return; }
  if (k === '#') {
    const s = DB[id];
    if (id.length < 3) {
      beep([[1000, 0.5]], 'square', 500);
      setCard('!', 'Incomplete ID', 'Enter all 3 digits', 'Invalid', 'err');
      respond(false, 'Error: Need 3-ID', 'ID: ' + id, 1500);
    } else if (s) {
      beep([[2000, 0.2], [2500, 0.2]], 'sine', 380);
      setCard(s.name[0], s.name, s.dept + ' department', s.pay, 'ok');
      respond(true, `${s.name} (${s.dept})`, 'Status: Valid', 4000);
    } else {
      beep([[500, 0.8]], 'square', 800);
      setCard('?', 'Unknown ID', 'No record for ' + id, 'Invalid', 'err');
      respond(false, 'ID: ' + id, 'Invalid ID!', 3000);
    }
    return;
  }
  if (/\d/.test(k) && id.length < 3) { id += k; home(); }
}

const flash = k => {
  const b = kp.querySelector(`[data-k="${k}"]`);
  if (!b) return;
  b.classList.add('hit');
  setTimeout(() => b.classList.remove('hit'), 140);
};

// Build keypad
[...'123A456B789C*0#D'].forEach(k => {
  const b = document.createElement('button');
  b.className = 'key' + (k === '*' ? ' k-red' : k === '#' ? ' k-ok' : /[A-D]/.test(k) ? ' k-alt' : '');
  b.dataset.k = k; b.textContent = k; b.setAttribute('aria-label', 'Key ' + k);
  kp.append(b);
});
kp.onclick = e => { const b = e.target.closest('.key'); if (b) press(b.dataset.k); };

// Sample ID chips type the ID for you
Object.keys(DB).forEach(k => {
  const b = document.createElement('button');
  b.className = 'chip'; b.textContent = k; b.title = 'Type ' + k + ' and submit';
  b.onclick = () => {
    if (busy) return;
    id = ''; home();
    [...k, '#'].forEach((c, i) => setTimeout(() => { flash(c); press(c); }, i * 260));
  };
  $('chips').append(b);
});

// Physical keyboard support (only while the board is on screen)
const kmap = { Enter: '#', Escape: '*', Backspace: '*' };
addEventListener('keydown', e => {
  if (!live || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest('a,button') && !e.target.closest('.key')) return;
  const k = kmap[e.key] || e.key.toUpperCase();
  if (k.length === 1 && '0123456789ABCD*#'.includes(k)) { e.preventDefault(); flash(k); press(k); }
});
new IntersectionObserver(([e]) => { live = e.isIntersecting; }, { threshold: 0.2 }).observe(q('.board'));

$('muteBtn').onclick = e => {
  mute = !mute;
  e.currentTarget.innerHTML = `<i class="fas fa-volume-${mute ? 'xmark' : 'high'}"></i>`;
  e.currentTarget.setAttribute('aria-pressed', mute);
};

// Boot sequence, same as setup() on the Arduino
show('Smart ID System', 'Enter 3-Digit ID');
setCard('ID', 'Awaiting scan', 'Enter an ID and press #', '', '');
setTimeout(() => { busy = false; home(); }, 2200);
})();
