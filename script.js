/* ─────────────────────────────────────────
   Apex Footer — script.js
   Physics blobs + staged animations + link morph
───────────────────────────────────────── */

/* ══════════════════════════════════════
   1. LINK TEXT MORPH
══════════════════════════════════════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';

  link.innerHTML = `
    <span class="txt-original">${original}</span>
    <span class="txt-parent">${parent}</span>
  `;

  // Set link width to max of both texts to prevent layout shift
  const tmp = document.createElement('span');
  tmp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;';
  tmp.textContent = parent.length > original.length ? parent : original;
  link.appendChild(tmp);
  requestAnimationFrame(() => {
    link.style.width = tmp.offsetWidth + 'px';
    tmp.remove();
  });
});


/* ══════════════════════════════════════
   2. STAGED ENTRY ANIMATIONS
══════════════════════════════════════ */
function triggerPhases() {
  // Phase 1 immediately
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));

  // Phase 2 after phase 1 finishes (~700ms)
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 650);

  // Phase 3 — reveal canvas zone, then drop blobs
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 1100);
}

window.addEventListener('DOMContentLoaded', triggerPhases);


/* ══════════════════════════════════════
   3. MATTER.JS PHYSICS
══════════════════════════════════════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events, Composite } = Matter;

  const zone    = document.getElementById('physicsZone');
  const canvas  = document.getElementById('physicsCanvas');
  const W       = zone.offsetWidth  || 1440;
  const H       = zone.offsetHeight || 280;

  canvas.width  = W;
  canvas.height = H;

  // Engine
  const engine = Engine.create({ gravity: { y: 1.4 } });
  const world  = engine.world;

  // Renderer
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

  // ── Blob definitions ──
  // [imgId, naturalW, naturalH, displayW]
  const blobDefs = [
    ['bimg-1',  209, 135, 160],
    ['bimg-2',  184,  79, 155],
    ['bimg-3',  190, 105, 162],
    ['bimg-4',  200, 154, 155],
    ['bimg-5',  200, 142, 168],
    ['bimg-6',  197, 119, 168],
    ['bimg-8',  194, 124, 162],
    ['bimg-9',  190, 105, 165],
    ['bimg-10', 185, 187, 158],
    ['bimg-11', 229, 139, 188],
    ['bimg-12', 200, 154, 158],
    ['bimg-13', 179, 101, 162],
  ];

  // Drop positions spread across the width
  const dropX = [
    60, 180, 310, 450, 590, 710,
    830, 960, 1080, 1190, 1300, 1400
  ];

  const bodies = [];

  blobDefs.forEach((def, i) => {
    const [imgId, nW, nH, dW] = def;
    const dH    = Math.round((nH / nW) * dW);
    const img   = document.getElementById(imgId);
    const src   = img ? img.src : '';

    // Start above the viewport for drop effect
    const startY = -dH - (i % 3) * 80 - Math.random() * 120;
    const x      = dropX[i] + (Math.random() - 0.5) * 40;

    const body = Bodies.rectangle(x, startY, dW * 0.82, dH * 0.72, {
      restitution: 0.38,
      friction:    0.6,
      frictionAir: 0.018,
      density:     0.003,
      render: {
        sprite: {
          texture:  src,
          xScale:   dW / nW,
          yScale:   dW / nW,
        }
      },
      label: imgId,
    });

    Body.setAngle(body, (Math.random() - 0.5) * 0.6);
    bodies.push(body);
  });

  // ── Boundaries ──
  const ground    = Bodies.rectangle(W / 2, H + 25, W + 200, 50, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,   H / 2,  50,  H * 3, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2, 50,  H * 3, { isStatic: true, render: { fillStyle: 'transparent' } });

  World.add(world, [...bodies, ground, wallLeft, wallRight]);

  // ── Mouse interaction ──
  const mouse = Mouse.create(canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.18,
      damping:   0.1,
      render:    { visible: false }
    }
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // ── Custom render: draw images manually for crisp rendering ──
  // We override the afterRender event to stamp images
  const ctx = canvas.getContext('2d');

  Events.on(render, 'afterRender', () => {
    // already handled by matter sprite renderer
  });

  // ── Staggered drop: delay adding bodies so they fall one by one ──
  // Remove all, re-add with delay
  World.remove(world, bodies);

  bodies.forEach((body, i) => {
    setTimeout(() => {
      World.add(world, body);
    }, i * 110);
  });

  // Run
  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // ── Resize handling ──
  window.addEventListener('resize', () => {
    const newW = zone.offsetWidth;
    render.canvas.width  = newW;
    render.options.width = newW;
    // Reposition ground
    Body.setPosition(ground, { x: newW / 2, y: H + 25 });
    Body.setPosition(wallRight, { x: newW + 25, y: H / 2 });
  });
}
