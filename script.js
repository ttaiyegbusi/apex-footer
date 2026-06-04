/* Apex Footer — script.js */

/* ══════ 1. LINK SCRAMBLE HOVER ══════ */
(function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&*!?';

  function scramble(link) {
    const original = link.dataset.original;
    const len      = original.length;
    const totalMs  = 420;
    const steps    = 14;
    const stepMs   = totalMs / steps;
    let   frame    = 0;
    if (link._scrambleTimer) clearInterval(link._scrambleTimer);
    link._scrambleTimer = setInterval(() => {
      frame++;
      const resolved = Math.floor((frame / steps) * len);
      let display = '';
      for (let i = 0; i < len; i++) {
        if (original[i] === ' ') display += ' ';
        else if (i < resolved)   display += original[i];
        else display += chars[Math.floor(Math.random() * chars.length)];
      }
      link.textContent = display;
      if (frame >= steps) {
        clearInterval(link._scrambleTimer);
        link.textContent = original;
      }
    }, stepMs);
  }

  function restore(link) {
    if (link._scrambleTimer) clearInterval(link._scrambleTimer);
    link.textContent = link.dataset.original;
  }

  document.querySelectorAll('.footer-col-links li a').forEach(link => {
    link.dataset.original = link.textContent.trim();
    link.addEventListener('mouseenter', () => scramble(link));
    link.addEventListener('mouseleave', () => restore(link));
  });
})();


/* ══════ 2. DRAGGABLE HAND ══════ */
(function () {
  const wrap = document.getElementById('handWrap');
  if (!wrap) return;

  let dragging = false;
  let offX = 0, offY = 0;
  let originParent = null;
  let originNext   = null;

  function startDrag(cx, cy) {
    dragging    = true;
    originParent = wrap.parentNode;
    originNext   = wrap.nextSibling;

    const rect = wrap.getBoundingClientRect();
    offX = cx - rect.left;
    offY = cy - rect.top;

    // Move to body for free positioning
    document.body.appendChild(wrap);
    wrap.style.position = 'fixed';
    wrap.style.left     = (cx - offX) + 'px';
    wrap.style.top      = (cy - offY) + 'px';
    wrap.style.margin   = '0';
    wrap.style.zIndex   = '1000';
    wrap.style.cursor   = 'grabbing';
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    wrap.style.left = (cx - offX) + 'px';
    wrap.style.top  = (cy - offY) + 'px';
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    wrap.style.cursor = 'grab';
    // Return hand to its original spot in the CTA row
    if (originParent) {
      if (originNext) originParent.insertBefore(wrap, originNext);
      else originParent.appendChild(wrap);
    }
    wrap.style.position = '';
    wrap.style.left     = '';
    wrap.style.top      = '';
    wrap.style.zIndex   = '';
    wrap.style.margin   = '';
  }

  wrap.addEventListener('mousedown', e => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
  window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  wrap.addEventListener('touchstart', e => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', e => {
    if (dragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  window.addEventListener('touchend', endDrag);
})();


/* ══════ 3. STAGED ENTRY ══════ */
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


/* ══════ 4. PHYSICS RAIN ══════ */
function initPhysics() {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events, Composite } = Matter;

  const zone = document.getElementById('physicsZone');
  const W    = zone.offsetWidth;
  const H    = zone.offsetHeight;

  const dpr    = window.devicePixelRatio || 1;
  const canvas = document.getElementById('physicsCanvas');
  canvas.width        = W * dpr;
  canvas.height       = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const engine = Engine.create({ gravity: { y: 1.8 } });

  const render = Render.create({
    canvas, engine,
    options: {
      width:      W * dpr,
      height:     H * dpr,
      background: 'transparent',
      wireframes: false,
      pixelRatio: dpr,
    }
  });

  // [imgId, naturalW, naturalH, displayW] — reduced ~20% from original sizes
  const blobDefs = [
    ['bimg-1',  209, 135, 122],
    ['bimg-2',  184,  79, 116],
    ['bimg-3',  190, 105, 122],
    ['bimg-4',  200, 154, 116],
    ['bimg-5',  200, 142, 126],
    ['bimg-6',  197, 119, 126],
    ['bimg-8',  194, 124, 122],
    ['bimg-9',  190, 105, 124],
    ['bimg-10', 185, 187, 118],
    ['bimg-11', 229, 139, 140],
    ['bimg-12', 200, 154, 118],
    ['bimg-13', 179, 101, 120],
  ];

  // Variant blobs — different colors + labels, same authentic shapes
  const variantDefs = [
    ['bimg-v1',  184,  79, 116],
    ['bimg-v2',  190, 105, 122],
    ['bimg-v3',  209, 135, 122],
    ['bimg-v4',  200, 154, 116],
    ['bimg-v5',  179, 101, 120],
    ['bimg-v6',  197, 119, 126],
    ['bimg-v7',  190, 105, 122],
    ['bimg-v8',  229, 139, 140],
    ['bimg-v9',  200, 142, 126],
    ['bimg-v10', 194, 124, 122],
    ['bimg-v11', 200, 154, 118],
    ['bimg-v12', 185, 187, 118],
  ];

  // 24 blobs total — originals + variants
  const allDefs = [...blobDefs, ...variantDefs];

  // Pre-load hover textures for all blobs
  const hoverSrcs = {};
  [...blobDefs, ...variantDefs].forEach(([imgId]) => {
    const img = document.getElementById(imgId);
    if (img) {
      hoverSrcs[imgId] = {
        normal: img.src,
        hover:  img.src.replace('/blobs/', '/blobs-hover/'),
      };
    }
  });

  // Zone columns — spread blobs across 6 zones
  const zones   = 6;
  const zoneW   = (W - 80) / zones;

  const bodies = allDefs.map(([imgId, nW, nH, dW], i) => {
    const dH  = Math.round((nH / nW) * dW);
    const img = document.getElementById(imgId);
    const src = img ? img.src : '';

    const zoneIdx = i % zones;
    const x = 40 + zoneIdx * zoneW + Math.random() * zoneW * 0.75;

    // Wave 1 drops first, wave 2 rains down on top
    const wave = i < 12 ? 0 : 1;
    const y    = -(dH + 20) - (wave * H * 0.9) - Math.random() * H * 0.5 - i * 25;

    const body = Bodies.rectangle(x, y, dW, dH, {
      restitution:    0.05,
      friction:       0.9,
      frictionAir:    0.018,
      frictionStatic: 0.8,
      density:        0.005,
      render: {
        sprite: {
          texture: src,
          xScale:  (dW / nW) * dpr,
          yScale:  (dW / nW) * dpr,
        }
      }
    });

    body._imgId     = imgId;
    body._isHovered = false;
    body._jiggling  = false;
    Body.setAngle(body, (Math.random() - 0.5) * 0.5);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.2, y: 0 });
    return body;
  });

  // Boundaries
  const ground    = Bodies.rectangle(W / 2,  H + 25, W + 200, 50, { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallLeft  = Bodies.rectangle(-25,    H / 2,  50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  const wallRight = Bodies.rectangle(W + 25, H / 2,  50, H * 4,   { isStatic: true, render: { fillStyle: 'transparent' } });
  World.add(engine.world, [ground, wallLeft, wallRight]);

  // Rain with stagger
  bodies.forEach((body, i) => {
    setTimeout(() => World.add(engine.world, body), i * 75);
  });

  // ── Mouse — increased grab threshold so any blob is easily pickable ──
  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = dpr;

  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } },
  });

  // Patch: after each mouse move, find nearest body within 40px and make it the target
  // This ensures buried/edge blobs are always grabbable
  Events.on(mc, 'mousedown', () => {
    const mx = mouse.position.x;
    const my = mouse.position.y;
    const allBodies = Composite.allBodies(engine.world).filter(b => !b.isStatic);

    let nearest = null;
    let nearestDist = 60 * 60; // 60px grab radius

    allBodies.forEach(body => {
      const dx = body.position.x - mx;
      const dy = body.position.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < nearestDist) {
        nearestDist = d2;
        nearest = body;
      }
    });

    if (nearest && !mc.body) {
      mc.body = nearest;
    }
  });

  World.add(engine.world, mc);
  render.mouse = mouse;

  // ── Hover: jiggle + texture swap ──
  let hoveredBody = null;

  function jiggle(body) {
    // Don't jiggle if blob is being dragged
    if (body._jiggling || mc.body === body) return;
    body._jiggling = true;
    // Subtle twitch — much gentler amplitude
    const seq = [0.06, -0.07, 0.04, -0.02, 0];
    let step = 0;
    const tick = () => {
      if (step < seq.length) {
        Body.setAngularVelocity(body, seq[step]);
        step++;
        setTimeout(tick, 60);
      } else {
        body._jiggling = false;
      }
    };
    tick();
  }

  Events.on(engine, 'afterUpdate', () => {
    const mx = mouse.position.x;
    const my = mouse.position.y;
    const allBodies = Composite.allBodies(engine.world).filter(b => !b.isStatic);

    let found = null;
    // Find body whose bounds contain the mouse
    for (const body of allBodies) {
      const { min, max } = body.bounds;
      if (mx >= min.x && mx <= max.x && my >= min.y && my <= max.y) {
        found = body;
        break;
      }
    }

    if (found !== hoveredBody) {
      if (hoveredBody?._imgId && hoverSrcs[hoveredBody._imgId]) {
        hoveredBody.render.sprite.texture = hoverSrcs[hoveredBody._imgId].normal;
        hoveredBody._isHovered = false;
      }
      if (found?._imgId && hoverSrcs[found._imgId]) {
        found.render.sprite.texture = hoverSrcs[found._imgId].hover;
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
