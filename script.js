/* Apex Footer — script.js */

/* ══════ 1. LINK MORPH ══════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';
  link.innerHTML = `<span class="txt-original">${original}</span><span class="txt-parent">${parent}</span>`;
  const wider = parent.length >= original.length ? parent : original;
  const tmp = document.createElement('span');
  tmp.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;font-family:Inter,sans-serif;font-size:13px;';
  tmp.textContent = wider;
  document.body.appendChild(tmp);
  link.style.width = tmp.offsetWidth + 'px';
  tmp.remove();
});


/* ══════ 2. STAGED ENTRY — slow & smooth ══════ */
function runPhases() {
  // Phase 1 — CTA eases in immediately over 1.2s
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));

  // Phase 2 — Nav starts after phase 1 is well underway (1.1s in)
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 1100);

  // Phase 3 — Blobs begin raining after nav settles (2.3s in)
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 2300);
}
runPhases();


/* ══════ 3. PHYSICS RAIN ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint } = Matter;

  const zone = document.getElementById('physicsZone');
  const W    = zone.offsetWidth;
  const H    = zone.offsetHeight;

  // ── Hi-DPI canvas for crisp blob rendering ──
  const dpr    = window.devicePixelRatio || 1;
  const canvas = document.getElementById('physicsCanvas');
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const engine = Engine.create({ gravity: { y: 0.9 } }); // slower fall

  const render = Render.create({
    canvas,
    engine,
    options: {
      width:             W * dpr,
      height:            H * dpr,
      background:        'transparent',
      wireframes:        false,
      pixelRatio:        dpr,        // tells Matter to render at device pixel ratio
    }
  });

  // ── All 22 blobs ── [imgId, naturalW, naturalH, displayW]
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
    ['bimg-14', 220, 82,  152],
    ['bimg-15', 280, 82,  172],
    ['bimg-16', 300, 82,  178],
    ['bimg-17', 200, 100, 145],
    ['bimg-18', 290, 82,  175],
    ['bimg-19', 160, 100, 138],
    ['bimg-20', 240, 82,  158],
    ['bimg-21', 270, 82,  168],
    ['bimg-22', 190, 100, 145],
    ['bimg-23', 260, 82,  162],
  ];

  const bodies = blobDefs.map((def) => {
    const [imgId, nW, nH, dW] = def;
    const dH  = Math.round((nH / nW) * dW);
    const img = document.getElementById(imgId);
    const src = img ? img.src : '';

    // Random positions spread across full width, staggered heights above
    const x = 60 + Math.random() * (W - 120);
    const y = -(Math.random() * H * 2.5) - dH;

    const body = Bodies.rectangle(x, y, dW * 0.78, dH * 0.68, {
      restitution: 0.25,
      friction:    0.65,
      frictionAir: 0.035,   // high air friction = slow, floaty fall
      density:     0.003,
      render: {
        sprite: {
          texture: src,
          xScale:  (dW / nW) * dpr,
          yScale:  (dW / nW) * dpr,
        }
      }
    });

    Body.setAngle(body, (Math.random() - 0.5) * 0.7);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.5, y: 0 });
    return body;
  });

  // Boundaries
  const ground    = Bodies.rectangle(W / 2,  H + 25,  W + 200, 50, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,    H / 2,   50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2,   50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  World.add(engine.world, [ground, wallLeft, wallRight]);

  // Staggered rain — each blob added 180ms apart for a flowing rain effect
  bodies.forEach((body, i) => {
    setTimeout(() => World.add(engine.world, body), i * 180);
  });

  // Mouse — adjust for DPR so dragging feels accurate
  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = dpr;
  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
  });
  World.add(engine.world, mc);
  render.mouse = mouse;

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
