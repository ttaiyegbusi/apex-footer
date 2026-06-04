/* Apex Footer — script.js */

/* ══════ 0. SCALE TO FIT ANY SCREEN ══════ */
function scaleToFit() {
  const el   = document.getElementById('scaleRoot');
  const scaleX = window.innerWidth  / 1440;
  const scaleY = window.innerHeight / 1024;
  const scale  = Math.min(scaleX, scaleY);
  el.style.transform = `scale(${scale})`;
}
scaleToFit();
window.addEventListener('resize', scaleToFit);


/* ══════ 1. LINK MORPH ══════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';
  link.innerHTML = `<span class="txt-original">${original}</span><span class="txt-parent">${parent}</span>`;
  const wider = parent.length >= original.length ? parent : original;
  const tmp = document.createElement('span');
  tmp.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;font-family:Inter,sans-serif;font-size:13.5px;';
  tmp.textContent = wider;
  document.body.appendChild(tmp);
  link.style.width = tmp.offsetWidth + 'px';
  tmp.remove();
});


/* ══════ 2. STAGED ENTRY ══════ */
function runPhases() {
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 700);
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 1200);
}
runPhases();


/* ══════ 3. PHYSICS ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint } = Matter;

  const zone = document.getElementById('physicsZone');
  const W    = zone.offsetWidth;
  const H    = zone.offsetHeight;

  const canvas  = document.getElementById('physicsCanvas');
  canvas.width  = W;
  canvas.height = H;

  const engine = Engine.create({ gravity: { y: 1.6 } });

  const render = Render.create({
    canvas,
    engine,
    options: {
      width:      W,
      height:     H,
      background: 'transparent',
      wireframes: false,
    }
  });

  const blobDefs = [
    ['bimg-1',  209, 135, 158],
    ['bimg-2',  184,  79, 150],
    ['bimg-3',  190, 105, 158],
    ['bimg-4',  200, 154, 150],
    ['bimg-5',  200, 142, 163],
    ['bimg-6',  197, 119, 163],
    ['bimg-8',  194, 124, 158],
    ['bimg-9',  190, 105, 160],
    ['bimg-10', 185, 187, 152],
    ['bimg-11', 229, 139, 182],
    ['bimg-12', 200, 154, 152],
    ['bimg-13', 179, 101, 155],
  ];

  const slots = blobDefs.map((_, i) =>
    Math.round(70 + (i * (W - 140) / (blobDefs.length - 1)))
  );

  const bodies = blobDefs.map((def, i) => {
    const [imgId, nW, nH, dW] = def;
    const dH  = Math.round((nH / nW) * dW);
    const img = document.getElementById(imgId);
    const src = img ? img.src : '';
    const x   = slots[i] + (Math.random() - 0.5) * 30;
    const y   = -(dH * 2) - i * 55 - Math.random() * 80;

    const body = Bodies.rectangle(x, y, dW * 0.78, dH * 0.68, {
      restitution: 0.35,
      friction:    0.55,
      frictionAir: 0.015,
      density:     0.003,
      render: {
        sprite: {
          texture: src,
          xScale:  dW / nW,
          yScale:  dW / nW,
        }
      }
    });
    Body.setAngle(body, (Math.random() - 0.5) * 0.5);
    return body;
  });

  const ground    = Bodies.rectangle(W / 2, H + 25,  W + 200, 50,  { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,    H / 2,  50, H * 4,    { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2,  50, H * 4,    { isStatic: true, render: { fillStyle: 'transparent' } });

  World.add(engine.world, [ground, wallLeft, wallRight]);

  bodies.forEach((body, i) => {
    setTimeout(() => World.add(engine.world, body), i * 100);
  });

  // Scale mouse position to match canvas (since the whole page is CSS-scaled)
  const scale  = parseFloat(document.getElementById('scaleRoot').style.transform.replace('scale(', '')) || 1;
  const mouse  = Mouse.create(canvas);
  mouse.pixelRatio = 1 / scale;

  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } }
  });
  World.add(engine.world, mc);
  render.mouse = mouse;

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
