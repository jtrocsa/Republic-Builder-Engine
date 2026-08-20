// The warp tunnel — the canvas beat a Chronotravel opens on, before the destination's plate.
//
// A radial streak field that accelerates, cruises and decelerates over a fixed duration, with a
// few rotating hexagonal rings and a core glow behind it. `direction` is the only thing that
// differs between the two warps: "out" throws the streaks away from centre onto a place you have
// not been, "in" pulls them back down onto the Institute — the same inversion the anchor rings
// already make between `warpAnchorOut` and `warpAnchorIn` in global.css.
//
// **Engine code: this file knows about a canvas and a duration, and nothing else.** It is handed a
// node and told how long it has; which screen mounted it, what the destination is called and when
// the phase flips are all the host's business.
//
// **It is the one looping thing on either warp screen**, which the rest of that screen is
// deliberately not (see decision log 0073 §2 — an idling animation makes a visual baseline a coin
// toss). That is affordable only because `warpScreen()` never mounts this under
// `prefers-reduced-motion: reduce`, which is the media state the baselines are captured in.

/** Smoothstep, clamped — the mockup's `ease`. */
export function easeSmooth(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

/**
 * The speed multiplier at a point in the run, `t` normalised to 0..1.
 *
 * Expressed as fractions of the run rather than the mockup's absolute milliseconds, so retuning
 * `WARP_TUNNEL_MS` stretches the whole curve instead of silently truncating the decel.
 */
export const TUNNEL_PHASES = { accel: 0.19, cruise: 0.55 };
/** What the field settles to once the decel is done — not zero, so arrival still drifts. */
export const TUNNEL_REST_SPEED = 0.08;

export function speedAt(t) {
  if (t < TUNNEL_PHASES.accel) return easeSmooth(t / TUNNEL_PHASES.accel);
  if (t < TUNNEL_PHASES.cruise) return 1;
  if (t < 1)
    return (
      1 -
      (1 - TUNNEL_REST_SPEED) * easeSmooth((t - TUNNEL_PHASES.cruise) / (1 - TUNNEL_PHASES.cruise))
    );
  return TUNNEL_REST_SPEED;
}

/**
 * One streak.
 *
 * `r` is its distance from centre, and every star is recycled the moment it leaves the field — so
 * the seeded value must already be inside `maxR` or the first frame throws the whole field away.
 * `rand` is injected so a test can drive this deterministically.
 */
export function newStar(maxR, rand = Math.random) {
  return {
    a: rand() * Math.PI * 2,
    r: Math.min(rand() * maxR, maxR),
    spd: rand() * 0.9 + 0.55,
    len: rand() * 0.5 + 0.5,
    w: rand() * 1.4 + 0.4,
    teal: rand() < 0.05,
    dust: rand() < 0.4,
  };
}

const GOLD = "225,182,93";
const TEAL = "126,221,214";
const GROUND = "#020d13";
/** The ellipse the field is drawn on — slightly wider than tall, so it reads as a horizon. */
const FLATTEN = 0.92;

/**
 * Mounts the tunnel on a canvas and starts it.
 *
 * Returns a handle whose `stop()` is idempotent and safe to call after the run has ended on its
 * own: the host calls it both when the phase flips and from `render()`, and a loop still running
 * against replaced DOM is exactly what that second call exists to prevent.
 */
export function createWarpTunnel(canvas, { direction = "out", durationMs = 2000 } = {}) {
  const ctx = canvas?.getContext?.("2d");
  if (!ctx) return { stop() {} };

  const inward = direction === "in";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;
  let maxR = 1;
  let stars = [];
  let raf = 0;
  let start = 0;
  let stopped = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    cx = width / 2;
    cy = height / 2;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maxR = Math.hypot(cx, cy) * 1.08;
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, width, height);
  }

  function seed() {
    // One streak per five pixels of the narrower axis, capped so an ultrawide window does not pay
    // for a field nobody can see the far edge of.
    const count = Math.round(Math.min(width, 1900) / 5);
    stars = Array.from({ length: count }, () => newStar(maxR));
  }

  /** Recycles a star to whichever end of the field its direction of travel enters from. */
  function recycle() {
    const star = newStar(maxR);
    star.r = inward ? maxR - Math.random() * 30 : Math.random() * 30;
    return star;
  }

  function polyRing(radius, rotation, sides, alpha) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i += 1) {
      const angle = rotation + (i / sides) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * FLATTEN;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${GOLD},${alpha.toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function frame(now) {
    if (stopped) return;
    if (!start) start = now;
    const elapsed = now - start;
    const t = durationMs > 0 ? elapsed / durationMs : 1;
    const speed = speedAt(t);

    // A translucent wash rather than a clear: it is what leaves the streaks their trails, and it
    // thickens as the field slows so the last frames settle instead of smearing.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(2,13,19,${(0.3 + 0.14 * (1 - speed)).toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    const rotation = elapsed * 0.00035;
    for (let k = 0; k < 5; k += 1) {
      const raw = (elapsed * 0.00035 * (0.6 + 0.4 * speed) + k / 5) % 1;
      const phase = inward ? 1 - raw : raw;
      const alpha = Math.min(phase, 1 - phase) * 0.28 * (0.4 + 0.6 * speed);
      polyRing(phase * maxR, rotation * (k % 2 ? -1 : 1) + k, 6, alpha);
    }

    const step = 2.2 + 30 * speed;
    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];
      star.r += inward ? -star.spd * step : star.spd * step;
      if (star.r > maxR || star.r < 0) {
        stars[i] = recycle();
        continue;
      }
      const alpha = Math.min(0.75, (star.r / maxR) * 1.1);
      const colour = `rgba(${star.teal ? TEAL : GOLD},${(alpha * 0.85).toFixed(3)})`;
      if (star.dust) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(star.a) * star.r,
          cy + Math.sin(star.a) * star.r * FLATTEN,
          star.w * 0.6 * (0.5 + speed),
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        // The tail trails behind whichever way the streak is travelling, so a recall reads as
        // falling inward rather than as an outward field played backwards.
        const drag = star.spd * step * star.len * (0.5 + speed);
        const tail = inward ? Math.min(maxR, star.r + drag) : Math.max(0, star.r - drag);
        ctx.beginPath();
        ctx.strokeStyle = colour;
        ctx.lineWidth = star.w * (0.6 + 0.9 * speed);
        ctx.lineCap = "round";
        ctx.moveTo(cx + Math.cos(star.a) * tail, cy + Math.sin(star.a) * tail * FLATTEN);
        ctx.lineTo(cx + Math.cos(star.a) * star.r, cy + Math.sin(star.a) * star.r * FLATTEN);
        ctx.stroke();
      }
    }

    const core = (10 + 30 * speed) * 3.6;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, core);
    glow.addColorStop(0, `rgba(${TEAL},${(0.26 + 0.22 * speed).toFixed(2)})`);
    glow.addColorStop(0.3, `rgba(${GOLD},0.2)`);
    glow.addColorStop(1, `rgba(${GOLD},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, core, 0, Math.PI * 2);
    ctx.fill();

    raf = window.requestAnimationFrame(frame);
  }

  function onResize() {
    if (stopped) return;
    resize();
    seed();
  }

  resize();
  seed();
  window.addEventListener("resize", onResize);
  raf = window.requestAnimationFrame(frame);

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    },
  };
}
