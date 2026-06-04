/* Apex Footer — script.js */

/* ══════ 1. LINK MORPH ══════ */
document.querySelectorAll('.footer-col-links li a').forEach(link => {
  const original = link.textContent.trim();
  const parent   = link.dataset.parent || '';
  link.innerHTML = `<span class="txt-original">${original}</span><span class="txt-parent">${parent}</span>`;
});


/* ══════ 2. STAGED ENTRY ══════ */
function runPhases() {
  document.querySelectorAll('.anim-phase-1').forEach(el => el.classList.add('visible'));
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-2').forEach(el => el.classList.add('visible'));
  }, 1100);
  setTimeout(() => {
    document.querySelectorAll('.anim-phase-3').forEach(el => el.classList.add('visible'));
    initPhysics();
  }, 2200);
}
runPhases();


/* ══════ 3. PHYSICS RAIN + HOVER ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events, Vector } = Matter;

  const zone   = document.getElementById('physicsZone');
  const W      = zone.offsetWidth;
  const H      = zone.offsetHeight;
  const dpr    = window.devicePixelRatio || 1;
  const canvas = document.getElementById('physicsCanvas');

  canvas.width        = W * dpr;
  canvas.height       = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const engine = Engine.create({ gravity: { y: 1.8 } });

  const render = Render.create({
    canvas,
    engine,
    options: {
      width:      W * dpr,
      height:     H * dpr,
      background: 'transparent',
      wireframes: false,
      pixelRatio: dpr,
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

  // Pre-build texture URLs for both normal and hover states
  const textures = {};
  blobDefs.forEach(([imgId, nW, nH, dW]) => {
    const img = document.getElementById(imgId);
    const num = imgId.replace('bimg-', '');
    textures[imgId] = {
      normal: img ? img.src : '',
      hover:  img ? img.src.replace('/blobs/', '/blobs-hover/') : '',
      nW, nH, dW,
      xScale: (dW / nW) * dpr,
      yScale: (dW / nW) * dpr,
    };
  });

  const bodies = blobDefs.map(([imgId, nW, nH, dW]) => {
    const dH  = Math.round((nH / nW) * dW);
    const t   = textures[imgId];
    const x   = 60 + Math.random() * (W - 120);
    const y   = -(Math.random() * H * 1.6) - dH;

    const body = Bodies.rectangle(x, y, dW * 0.78, dH * 0.68, {
      restitution: 0.3,
      friction:    0.6,
      frictionAir: 0.018,
      density:     0.004,
      render: {
        sprite: {
          texture: t.normal,
          xScale:  t.xScale,
          yScale:  t.yScale,
        }
      }
    });

    body._imgId     = imgId;
    body._isHovered = false;
    body._jiggling  = false;

    Body.setAngle(body, (Math.random() - 0.5) * 0.7);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
    return body;
  });

  // Boundaries
  const ground    = Bodies.rectangle(W / 2,  H + 25,  W + 200, 50, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,    H / 2,   50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2,   50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  World.add(engine.world, [ground, wallLeft, wallRight]);

  // Rain — staggered drop
  bodies.forEach((body, i) => {
    setTimeout(() => World.add(engine.world, body), i * 80);
  });

  // Mouse
  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = dpr;
  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
  });
  World.add(engine.world, mc);
  render.mouse = mouse;

  // ── Hover detection + jiggle + texture swap ──
  let hoveredBody = null;

  function jiggle(body) {
    if (body._jiggling) return;
    body._jiggling = true;

    const cx   = body.position.x;
    const cy   = body.position.y;
    const amp  = 0.18;   // rotation amplitude in radians
    const dur  = 60;     // ms per step
    const seq  = [amp, -amp * 1.1, amp * 0.7, -amp * 0.4, amp * 0.15, 0];
    let step   = 0;

    const tick = () => {
      if (step < seq.length) {
        Body.setAngularVelocity(body, seq[step] * 1.8);
        step++;
        setTimeout(tick, dur);
      } else {
        body._jiggling = false;
      }
    };
    tick();
  }

  Events.on(engine, 'afterUpdate', () => {
    const mx = mouse.position.x / dpr;
    const my = mouse.position.y / dpr;

    // Get all bodies in world (excluding static walls/ground)
    const allBodies = Matter.Composite.allBodies(engine.world).filter(b => !b.isStatic);

    let found = null;
    for (const body of allBodies) {
      // Simple AABB hit test
      const { min, max } = body.bounds;
      if (mx >= min.x && mx <= max.x && my >= min.y && my <= max.y) {
        found = body;
        break;
      }
    }

    if (found !== hoveredBody) {
      // Mouse left old body
      if (hoveredBody && hoveredBody._imgId) {
        hoveredBody.render.sprite.texture = textures[hoveredBody._imgId].normal;
        hoveredBody._isHovered = false;
      }
      // Mouse entered new body
      if (found && found._imgId) {
        found.render.sprite.texture = textures[found._imgId].hover;
        found._isHovered = true;
        jiggle(found);
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
      hoveredBody = found || null;
    }
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);
}
