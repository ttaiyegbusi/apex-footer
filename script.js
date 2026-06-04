/* Apex Footer — script.js */

/* ══════ 1. LINK MORPH ══════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';
  link.innerHTML = `<span class="txt-original">${original}</span><span class="txt-parent">${parent}</span>`;
  // Fix width to widest of the two strings
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
  // Phase 1 — immediate
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));

  // Phase 2 — after phase 1 settles
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 700);

  // Phase 3 — show canvas zone, then drop blobs
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 1200);
}

// Fire immediately — don't wait for DOMContentLoaded since script is at bottom of body
runPhases();


/* ══════ 3. PHYSICS ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint } = Matter;

  const zone = document.getElementById('physicsZone');
  const W    = 1440;
  const H    = zone.offsetHeight;

  const canvas      = document.getElementById('physicsCanvas');
  canvas.width      = W;
  canvas.height     = H;

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

  // [imgId, naturalW, naturalH, displayW]
  const blobDefs = [
    ['bimg-1',  209, 135, 160],
    ['bimg-2',  184,  79, 152],
    ['bimg-3',  190, 105, 160],
    ['bimg-4',  200, 154, 152],
    ['bimg-5',  200, 142, 165],
    ['bimg-6',  197, 119, 165],
    ['bimg-8',  194, 124, 160],
    ['bimg-9',  190, 105, 162],
    ['bimg-10', 185, 187, 155],
    ['bimg-11', 229, 139, 185],
    ['bimg-12', 200, 154, 155],
    ['bimg-13', 179, 101, 158],
  ];

  // Spread evenly across 1440px
  const slots = blobDefs.map((_, i) => Math.round(60 + (i * (1440 - 120) / (blobDefs.length - 1))));

  const bodies = blobDefs.map((def, i) => {
    const [imgId, nW, nH, dW] = def;
    const dH  = Math.round((nH / nW) * dW);
    const img = document.getElementById(imgId);
    const src = img ? img.src : '';
    const x   = slots[i] + (Math.random() - 0.5) * 30;
    const y   = -(dH * 1.5) - i * 60 - Math.random() * 100; // staggered above canvas

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

  // Walls & floor
  const ground     = Bodies.rectangle(W / 2, H + 25,  W + 200, 50, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft   = Bodies.rectangle(-25,   H / 2,   50, H * 4, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight  = Bodies.rectangle(W + 25, H / 2,  50, H * 4, { isStatic: true, render: { fillStyle: 'transparent' } });

  World.add(engine.world, [ground, wallLeft, wallRight]);

  // Drop blobs one by one
  bodies.forEach((body, i) => {
    setTimeout(() => World.add(engine.world, body), i * 100);
  });

  // Mouse drag
  const mouse = Mouse.create(canvas);
  const mc    = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } }
  });
  World.add(engine.world, mc);
  render.mouse = mouse;

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
