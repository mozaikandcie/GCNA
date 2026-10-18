/* Variante d'intro « particules » — activée avec ?intro=particules (voir main.js).
 * Le texte du titre explose en confettis aux couleurs de Noël. */
window.gcnaIntroParticles = function (cv, onDone) {
  const self = {};
    document.documentElement.style.overflow = 'hidden';
    const finish = () => { cancelAnimationFrame(self._raf); document.documentElement.style.overflow = ''; onDone(); };
    const go = () => {
      const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d'); o.textAlign = 'center'; o.textBaseline = 'middle';
      const big = Math.min(W * 0.13, 150);
      const lines = [
        ['Le Grand', `700 ${big * 0.5}px Caveat, cursive`, '#f2ba4c', -big * 0.95],
        ['Chanté Nwèl', `800 ${big}px 'Bricolage Grotesque', sans-serif`, '#ffffff', 0],
        ["d'Ambyans", `800 ${big * 0.72}px 'Bricolage Grotesque', sans-serif`, '#e11d54', big * 0.9]
      ];
      lines.forEach(([t, f, c, dy]) => { o.font = f; o.fillStyle = c; o.fillText(t, W / 2, H / 2 + dy); });
      const data = o.getImageData(0, 0, W, H).data;
      const step = W < 760 ? 3 : 4, P = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        const i = (y * W + x) * 4;
        if (data[i + 3] > 128) {
          const a = Math.random() * Math.PI * 2, r = Math.max(W, H) * (0.6 + Math.random() * 0.5);
          const dx = x - W / 2, dy = y - H / 2, d = Math.hypot(dx, dy) || 1, sp = 4 + Math.random() * 10;
          P.push({ tx: x, ty: y, sx: W / 2 + Math.cos(a) * r, sy: H / 2 + Math.sin(a) * r, c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
            vx: dx / d * sp + (Math.random() - .5) * 6, vy: dy / d * sp + (Math.random() - .5) * 6 - 2, delay: Math.random() * 0.35, s: step * 0.75 });
        }
      }
      const XMAS = ['#e11d54', '#c8102e', '#1f9d57', '#f2ba4c', '#ffffff', '#ffd76a'];
      P.forEach(p => { p.xc = XMAS[(Math.random() * XMAS.length) | 0]; p.rot = Math.random() * 6.28; p.star = Math.random() < 0.18; });
      const snow = Array.from({ length: W < 760 ? 70 : 140 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 2.4, v: 0.4 + Math.random() * 1.1, w: Math.random() * 6.28 }));
      const sparks = Array.from({ length: 26 }, () => P[(Math.random() * P.length) | 0]).filter(Boolean);
      const star = (x, y, r, rot) => {
        ctx.beginPath();
        for (let k = 0; k < 8; k++) { const a = rot + k * Math.PI / 4, rr = k % 2 ? r * 0.35 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
      };
      const flake = (x, y, r, rot) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.lineWidth = Math.max(1, r * 0.22); ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke(); }
        ctx.restore();
      };
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      glow.addColorStop(0, 'rgba(193,18,63,.38)'); glow.addColorStop(0.55, 'rgba(31,157,87,.10)'); glow.addColorStop(1, 'rgba(13,8,8,0)');
      const t0 = performance.now(), IN = 1.3, HOLD = 1.2, OUT = 1.5;
      const ease = t => 1 - Math.pow(1 - t, 3);
      const frame = now => {
        const t = (now - t0) / 1000;
        ctx.clearRect(0, 0, W, H);
        if (t > IN + HOLD + OUT) return finish();
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        for (const s of snow) {
          s.y += s.v; s.w += 0.02; s.x += Math.sin(s.w) * 0.4;
          if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
          ctx.globalAlpha = 0.25 + s.r / 5; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
        }
        const exploding = t >= IN + HOLD;
        for (const p of P) {
          let x, y, al = 1;
          if (!exploding) {
            const k = ease(Math.min(1, Math.max(0, (t - p.delay) / (IN - 0.35))));
            x = p.sx + (p.tx - p.sx) * k; y = p.sy + (p.ty - p.sy) * k;
            ctx.globalAlpha = 1; ctx.fillStyle = k < 1 ? p.xc : p.c; ctx.fillRect(x, y, p.s, p.s);
          } else {
            const u = t - IN - HOLD, f = u * 60;
            x = p.tx + p.vx * f; y = p.ty + p.vy * f + 0.06 * f * f;
            al = Math.max(0, 1 - u / OUT); ctx.globalAlpha = al;
            ctx.fillStyle = p.xc; ctx.strokeStyle = p.xc;
            if (p.star) { p.rot += 0.12; if (p.xc === '#ffffff') flake(x, y, p.s * 1.8, p.rot); else star(x, y, p.s * 1.6, p.rot); }
            else ctx.fillRect(x, y, p.s * 0.8, p.s * 0.8);
          }
        }
        if (t > IN - 0.2 && !exploding) {
          ctx.fillStyle = '#ffe9a8';
          for (const p of sparks) {
            const tw = Math.max(0, Math.sin((t * 6) + p.tx * 0.05));
            ctx.globalAlpha = tw; star(p.tx, p.ty, 4 + tw * 7, t);
          }
        }
        ctx.globalAlpha = 1;
        self._raf = requestAnimationFrame(frame);
      };
      self._raf = requestAnimationFrame(frame);
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  return finish;
};
