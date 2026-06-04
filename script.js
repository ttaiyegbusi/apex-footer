/* Apex Footer — script.js */

/* ══════ 1. LINK MORPH ══════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';
  link.innerHTML = `<span class="txt-original">${original}</span><span class="txt-parent">${parent}</span>`;
  const wider = parent.length >= original.length ? parent : original;
  const tmp = document.createElement('span');
  tmp.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;font-family:Inter,sans-serif;font-size:clamp(11px,1vw,14px);';
  tmp.textContent = wider;
  document.body.appendChild(tmp);
  link.style.width = tmp.offsetWidth + 'px';
  tmp.remove();
});


/* ══════ 2. STAGED ENTRY ══════ */
function runPhases() {
  // Phase 1 — CTA immediately
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));

  // Phase 2 — Nav after phase 1
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 700);

  // Phase 3 — Rain blobs after nav
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 1200);
}
runPhases();


/* ══════ 3. PHYSICS RAIN ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint } = Matter;

  const zone = document.getElementById('physicsZone');
  const W    = zone.offsetWidth;
  const H    = zone.offsetHeight;

  const canvas  = document.getElementById('physicsCanvas');
  canvas.width  = W;
  canvas.height = H;

  const engine = Engine.create({ gravity: { y: 2.2 } });

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

  // [imgId, naturalW, naturalH, displayW]
  const blobDefs = [
    ['bimg-1',  209, 135, 155],
    ['bimg-2',  184,  79, 148],
    ['bimg-3',  190, 105, 155],
    ['bimg-4',  200, 154, 148],
    ['bimg-5',  200, 142, 160],
    ['bimg-6',  197, 119, 160],
    ['bimg-8',  194, 124, 155],
    ['bimg-9',  190, 105, 158],
    ['bimg-10', 185, 187, 150],
    ['bimg-11', 229, 139, 178],
    ['bimg-12', 200, 154, 150],
    ['bimg-13', 179, 101, 152],
  ];

  // Build physics bodies — all start ABOVE the canvas (rain effect)
  const bodies = blobDefs.map((def, i) => {
    const [imgId, nW, nH, dW] = def;
    const dH  = Math.round((nH / nW) * dW);
    const img = document.getElementById(imgId);
    const src = img ? img.src : '';

    // Random x across full width, random y start above canvas
    const x = 60 + Math.random() * (W - 120);
    const y = -(Math.random() * H * 1.8) - dH; // scattered heights above canvas

    const body = Bodies.rectangle(x, y, dW * 0.78, dH * 0.68, {
      restitution: 0.28,
      friction:    0.6,
      frictionAir: 0.012,
      density:     0.004,
      render: {
        sprite: {
          texture: src,
          xScale:  dW / nW,
          yScale:  dW / nW,
        }
      }
    });

    // Slight random rotation
    Body.setAngle(body, (Math.random() - 0.5) * 0.8);
    // Small random horizontal nudge so they don't fall perfectly vertical
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });

    return body;
  });

  // Boundaries
  const ground    = Bodies.rectangle(W / 2,  H + 25,  W + 200, 50,  { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,    H / 2,   50, H * 4,    { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2,   50, H * 4,    { isStatic: true, render: { fillStyle: 'transparent' } });

  World.add(engine.world, [ground, wallLeft, wallRight]);

  // Rain: add blobs with staggered delays so they fall one by one
  bodies.forEach((body, i) => {
    setTimeout(() => {
      World.add(engine.world, body);
    }, i * 120);
  });

  // Mouse drag + throw
  const mouse = Mouse.create(canvas);
  const mc    = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
  });
  World.add(engine.world, mc);
  render.mouse = mouse;

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
