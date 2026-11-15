import { useEffect, useRef } from 'react';

// ─── Floating Neural Background ───
export function NeuralBg() {
  const ref = useRef(null);
  const raf = useRef(null);
  const nodes = useRef([]);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    nodes.current = Array.from({ length: 42 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16,
      r: Math.random() * 1.3 + .4,
    }));
    const draw = () => {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      nodes.current.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.current.length; i++)
        for (let j = i + 1; j < nodes.current.length; j++) {
          const a = nodes.current[i], b = nodes.current[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 145) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(78,205,196,${.032 * (1 - d / 145)})`;
            ctx.lineWidth = .5; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      nodes.current.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(78,205,196,0.11)'; ctx.fill();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── Hero Neural Map ───
export function HeroNeural() {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      const rect = c.getBoundingClientRect();
      c.width = rect.width * (window.devicePixelRatio || 1);
      c.height = rect.height * (window.devicePixelRatio || 1);
    };
    resize(); window.addEventListener('resize', resize);
    const W = () => c.width, H = () => c.height;
    const cx = () => W() / 2, cy = () => H() / 2;
    const courses = [
      { angle: -55, dist: .28, color: '#4ECDC4', label: 'AI', pct: .67, chapters: 3 },
      { angle: 30, dist: .30, color: '#F7B731', label: 'Python', pct: .25, chapters: 4 },
      { angle: 115, dist: .27, color: '#A29BFE', label: 'ML', pct: .0, chapters: 3 },
      { angle: -145, dist: .26, color: '#55EFC4', label: 'English', pct: 1.0, chapters: 2 },
      { angle: -10, dist: .42, color: '#4ECDC4', label: 'Networks', pct: .5, chapters: 3 },
      { angle: 80, dist: .38, color: '#F7B731', label: 'Databases', pct: .8, chapters: 5 },
    ];
    const pulses = courses.map(() => ({ t: Math.random() }));
    const draw = () => {
      t.current += .007;
      ctx.clearRect(0, 0, W(), H());
      const R = Math.min(W(), H()) * .5;
      const toRad = d => d * Math.PI / 180;
      const bg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), R * .22);
      bg.addColorStop(0, 'rgba(78,205,196,0.08)'); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx(), cy(), R * .22, 0, Math.PI * 2); ctx.fill();
      courses.forEach((cr, i) => {
        const rad = toRad(cr.angle);
        const nx = cx() + cr.dist * R * 2 * Math.cos(rad);
        const ny = cy() + cr.dist * R * 2 * Math.sin(rad);
        const g = ctx.createLinearGradient(cx(), cy(), nx, ny);
        g.addColorStop(0, 'rgba(78,205,196,0.22)'); g.addColorStop(1, `${cr.color}44`);
        ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.moveTo(cx(), cy()); ctx.lineTo(nx, ny); ctx.stroke();
        ctx.setLineDash([]);
        pulses[i].t = (pulses[i].t + .004) % 1;
        const pt = pulses[i].t;
        const px = cx() + (nx - cx()) * pt, py = cy() + (ny - cy()) * pt;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = cr.color; ctx.shadowBlur = 8; ctx.shadowColor = cr.color;
        ctx.fill(); ctx.shadowBlur = 0;
        for (let k = 0; k < cr.chapters; k++) {
          const frac = cr.chapters > 1 ? k / (cr.chapters - 1) : .5;
          const ca = toRad(cr.angle + 180) + toRad(-40 + frac * 80);
          const chDist = R * .12;
          const chx = nx + chDist * Math.cos(ca), chy = ny + chDist * Math.sin(ca);
          const done = k / cr.chapters < cr.pct;
          ctx.strokeStyle = done ? `${cr.color}40` : 'rgba(255,255,255,0.05)';
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(chx, chy); ctx.stroke();
          ctx.beginPath(); ctx.arc(chx, chy, R * .012, 0, Math.PI * 2);
          ctx.fillStyle = done ? cr.color : 'rgba(255,255,255,0.1)';
          if (done) { ctx.shadowBlur = 6; ctx.shadowColor = cr.color; }
          ctx.fill(); ctx.shadowBlur = 0;
        }
        const pulse = Math.sin(t.current * 2 + i) * .28 + .72;
        const nr = (R * .04 + cr.pct * R * .025);
        ctx.beginPath(); ctx.arc(nx, ny, nr * 1.7 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${cr.color}18`; ctx.lineWidth = 1; ctx.stroke();
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        ng.addColorStop(0, `${cr.color}66`); ng.addColorStop(1, `${cr.color}12`);
        ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.shadowBlur = cr.pct > 0 ? 14 : 4; ctx.shadowColor = cr.color;
        ctx.fill(); ctx.shadowBlur = 0;
        const sc = Math.min(W(), H()) / 520;
        ctx.font = `500 ${10 * sc}px 'DM Sans',sans-serif`;
        ctx.fillStyle = 'rgba(232,244,248,0.6)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const lx = nx + Math.cos(rad) * (nr + R * .055);
        const ly = ny + Math.sin(rad) * (nr + R * .055);
        ctx.fillText(cr.label, lx, ly);
      });
      const sc = Math.min(W(), H()) / 520;
      const cp = Math.sin(t.current * 1.4) * .1 + .9;
      [.1, .075, .052].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx(), cy(), R * r * (i === 0 ? cp : 1), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(78,205,196,${[.05, .09, .18][i]})`; ctx.lineWidth = [.8, 1, 1.2][i]; ctx.stroke();
      });
      const cg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), R * .052);
      cg.addColorStop(0, 'rgba(78,205,196,0.72)'); cg.addColorStop(.6, 'rgba(78,205,196,0.22)'); cg.addColorStop(1, 'rgba(78,205,196,0.04)');
      ctx.beginPath(); ctx.arc(cx(), cy(), R * .052, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.shadowBlur = 22; ctx.shadowColor = 'rgba(78,205,196,0.6)';
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = `bold ${9 * sc}px 'Syne',sans-serif`;
      ctx.fillStyle = 'rgba(6,13,26,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CORE', cx(), cy());
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block', borderRadius: 24 }} />;
}

// ─── Auth Right Panel Canvas ───
export function AuthCanvas({ type }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      c.height = c.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize(); window.addEventListener('resize', resize);
    const nodeArr = Array.from({ length: type === 'register' ? 8 : 6 }, (_, i) => ({
      x: .1 + Math.random() * .8, y: .1 + Math.random() * .8,
      color: ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'][i % 4],
      r: 6 + Math.random() * 10, pct: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));
    const edges = [];
    for (let i = 0; i < nodeArr.length; i++)
      for (let j = i + 1; j < nodeArr.length; j++)
        if (Math.hypot(nodeArr[i].x - nodeArr[j].x, nodeArr[i].y - nodeArr[j].y) < .5)
          edges.push([i, j, { t: Math.random() }]);
    const draw = () => {
      t.current += .008;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const gx = n => n.x * W, gy = n => n.y * H;
      edges.forEach(([a, b, p]) => {
        ctx.strokeStyle = 'rgba(78,205,196,0.1)';
        ctx.lineWidth = .8; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(gx(nodeArr[a]), gy(nodeArr[a])); ctx.lineTo(gx(nodeArr[b]), gy(nodeArr[b])); ctx.stroke();
        ctx.setLineDash([]);
        p.t = (p.t + .004) % 1;
        const px = gx(nodeArr[a]) + (gx(nodeArr[b]) - gx(nodeArr[a])) * p.t;
        const py = gy(nodeArr[a]) + (gy(nodeArr[b]) - gy(nodeArr[a])) * p.t;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeArr[a].color; ctx.shadowBlur = 6; ctx.shadowColor = nodeArr[a].color;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      nodeArr.forEach((n, i) => {
        const x = gx(n), y = gy(n);
        const pulse = Math.sin(t.current * 1.8 + n.phase) * .2 + .8;
        ctx.beginPath(); ctx.arc(x, y, n.r * 1.8 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${n.color}15`; ctx.lineWidth = 1; ctx.stroke();
        const g = ctx.createRadialGradient(x, y, 0, x, y, n.r);
        g.addColorStop(0, `${n.color}55`); g.addColorStop(1, `${n.color}0A`);
        ctx.beginPath(); ctx.arc(x, y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.shadowBlur = 10; ctx.shadowColor = n.color;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [type]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Learning Core (Student Dashboard) ───
export function LearningCore({ courses }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);

  const colors = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];
  const angles = [-55, 35, 130, -140];
  const dists = [115, 120, 112, 108];

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      c.height = c.offsetHeight * (window.devicePixelRatio || 1);
      c.style.width = '100%'; c.style.height = '100%';
    };
    resize(); window.addEventListener('resize', resize);
    const toRad = d => d * Math.PI / 180;

    const courseData = (courses || []).slice(0, 4).map((cr, i) => ({
      label: cr.title ? cr.title.split(' ')[0] : `Course ${i + 1}`,
      pct: cr.progress || 0,
      color: colors[i % colors.length],
      angle: angles[i] || (-55 + i * 90),
      dist: dists[i] || 115,
      chapters: cr.chapter_count || 3,
    }));

    if (courseData.length === 0) {
      for (let i = 0; i < 4; i++) courseData.push({
        label: ['AI', 'Python', 'ML', 'English'][i],
        pct: [.67, .25, 0, 1][i],
        color: colors[i],
        angle: angles[i],
        dist: dists[i],
        chapters: [3, 4, 3, 2][i],
      });
    }

    const pulses = courseData.map(() => ({ t: Math.random() }));

    const draw = () => {
      t.current += .008;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const sc = Math.min(W, H) / 440;

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160 * sc);
      bg.addColorStop(0, 'rgba(78,205,196,0.055)'); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, 160 * sc, 0, Math.PI * 2); ctx.fill();

      courseData.forEach((cd, i) => {
        const rad = toRad(cd.angle);
        const nx = cx + cd.dist * sc * Math.cos(rad);
        const ny = cy + cd.dist * sc * Math.sin(rad);
        const g = ctx.createLinearGradient(cx, cy, nx, ny);
        g.addColorStop(0, 'rgba(78,205,196,0.2)'); g.addColorStop(1, `${cd.color}55`);
        ctx.strokeStyle = g; ctx.lineWidth = 1 * sc; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
        ctx.setLineDash([]);
        pulses[i].t = (pulses[i].t + .004) % 1;
        const pt = pulses[i].t;
        const px = cx + (nx - cx) * pt, py = cy + (ny - cy) * pt;
        ctx.beginPath(); ctx.arc(px, py, 2.5 * sc, 0, Math.PI * 2);
        ctx.fillStyle = cd.color; ctx.shadowBlur = 8; ctx.shadowColor = cd.color;
        ctx.fill(); ctx.shadowBlur = 0;
        const chapterCount = cd.chapters;
        const spread = 48;
        const baseA = toRad(cd.angle + 180);
        for (let k = 0; k < chapterCount; k++) {
          const frac = chapterCount > 1 ? k / (chapterCount - 1) : 0.5;
          const ca = baseA + toRad(-spread / 2 + frac * spread);
          const cr = 44 * sc;
          const chx = nx + cr * Math.cos(ca), chy = ny + cr * Math.sin(ca);
          const isDone = k / chapterCount < cd.pct;
          ctx.strokeStyle = isDone ? `${cd.color}50` : 'rgba(255,255,255,0.06)';
          ctx.lineWidth = .7 * sc;
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(chx, chy); ctx.stroke();
          ctx.beginPath(); ctx.arc(chx, chy, 4 * sc, 0, Math.PI * 2);
          if (isDone) { ctx.fillStyle = cd.color; ctx.shadowBlur = 8; ctx.shadowColor = cd.color; }
          else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.shadowBlur = 0; }
          ctx.fill(); ctx.shadowBlur = 0;
        }
        const pulse = Math.sin(t.current * 2 + i) * .3 + .7;
        const nodeR = (16 + cd.pct * 8) * sc;
        ctx.beginPath(); ctx.arc(nx, ny, nodeR + 6 * sc * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${cd.color}20`; ctx.lineWidth = 1 * sc; ctx.stroke();
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeR);
        ng.addColorStop(0, `${cd.color}55`); ng.addColorStop(1, `${cd.color}18`);
        ctx.beginPath(); ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.shadowBlur = cd.pct > 0 ? 14 : 4; ctx.shadowColor = cd.color;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = `500 ${10 * sc}px 'DM Sans', sans-serif`;
        ctx.fillStyle = 'rgba(232,244,248,0.75)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const lx = nx + Math.cos(rad) * (nodeR + 18 * sc);
        const ly = ny + Math.sin(rad) * (nodeR + 18 * sc);
        ctx.fillText(cd.label, lx, ly);
      });

      const coreR = 28 * sc;
      const corePulse = Math.sin(t.current * 1.5) * .12 + .88;
      [55, 42].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r * sc * (i === 0 ? corePulse : 1), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(78,205,196,${i === 0 ? .07 : .12})`;
        ctx.lineWidth = (i === 0 ? .8 : 1) * sc; ctx.stroke();
      });
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      cg.addColorStop(0, 'rgba(78,205,196,0.7)'); cg.addColorStop(.6, 'rgba(78,205,196,0.25)'); cg.addColorStop(1, 'rgba(78,205,196,0.05)');
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(78,205,196,0.6)';
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = `bold ${9 * sc}px 'Syne', sans-serif`;
      ctx.fillStyle = 'rgba(6,13,26,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CORE', cx, cy);
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); };
  }, [courses]);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ─── Neural Activity Map (Teacher) ───
export function NeuralActivityMap() {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      c.height = c.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    const data = [
      { x: .15, y: .5, color: '#4ECDC4', activity: .85 },
      { x: .35, y: .25, color: '#F7B731', activity: .6 },
      { x: .55, y: .6, color: '#A29BFE', activity: .4 },
      { x: .75, y: .35, color: '#4ECDC4', activity: .75 },
      { x: .9, y: .6, color: '#55EFC4', activity: .3 },
      { x: .25, y: .75, color: '#F7B731', activity: .5 },
      { x: .65, y: .85, color: '#4ECDC4', activity: .65 },
    ];
    const links = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,2],[3,6],[1,3]];
    const pulses = links.map(() => ({ t: Math.random() }));
    const draw = () => {
      t.current += .008;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const gx = n => n.x * W, gy = n => n.y * H;
      links.forEach(([a, b], i) => {
        const na = data[a], nb = data[b];
        const avgAct = (na.activity + nb.activity) / 2;
        ctx.strokeStyle = `rgba(78,205,196,${avgAct * 0.25})`;
        ctx.lineWidth = avgAct * 1.5;
        ctx.beginPath(); ctx.moveTo(gx(na), gy(na)); ctx.lineTo(gx(nb), gy(nb)); ctx.stroke();
        pulses[i].t = (pulses[i].t + .005 * na.activity) % 1;
        const pt = pulses[i].t;
        const px = gx(na) + (gx(nb) - gx(na)) * pt, py = gy(na) + (gy(nb) - gy(na)) * pt;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = na.color; ctx.shadowBlur = 8; ctx.shadowColor = na.color; ctx.fill(); ctx.shadowBlur = 0;
      });
      data.forEach((n, i) => {
        const x = gx(n), y = gy(n);
        const pulse = Math.sin(t.current * 2 + i) * .2 + .8;
        const r = 8 + n.activity * 8;
        ctx.beginPath(); ctx.arc(x, y, r * pulse * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = `${n.color}18`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `${n.color}88`); g.addColorStop(1, `${n.color}10`);
        ctx.fillStyle = g; ctx.shadowBlur = 10 * n.activity; ctx.shadowColor = n.color;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

// ─── System Grid (Admin) ───
export function SystemGrid({ users }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      c.height = c.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    const count = users?.length || 17;
    const nodes = Array.from({ length: count }, (_, i) => {
      const u = users ? users[i] : null;
      return {
        x: .05 + Math.random() * .9, y: .1 + Math.random() * .8,
        color: u?.role === 'TEACHER' ? '#F7B731' : u?.role === 'ADMIN' ? '#A29BFE' : '#4ECDC4',
        active: u ? u.is_active !== 0 : Math.random() > .1,
      };
    });
    const links = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < .28)
          links.push([i, j]);
    const pulses = links.map(() => ({ t: Math.random(), active: Math.random() > .5 }));
    const draw = () => {
      t.current += .007;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const gx = u => u.x * W, gy = u => u.y * H;
      links.forEach(([a, b], i) => {
        const ua = nodes[a], ub = nodes[b];
        ctx.strokeStyle = 'rgba(78,205,196,0.07)'; ctx.lineWidth = .8;
        ctx.beginPath(); ctx.moveTo(gx(ua), gy(ua)); ctx.lineTo(gx(ub), gy(ub)); ctx.stroke();
        if (pulses[i].active) {
          pulses[i].t = (pulses[i].t + .006) % 1;
          const pt = pulses[i].t;
          const px = gx(ua) + (gx(ub) - gx(ua)) * pt, py = gy(ua) + (gy(ub) - gy(ua)) * pt;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = ua.color; ctx.shadowBlur = 5; ctx.shadowColor = ua.color; ctx.fill(); ctx.shadowBlur = 0;
        }
      });
      nodes.forEach((u, i) => {
        const x = gx(u), y = gy(u);
        const pulse = Math.sin(t.current * 2 + i) * .15 + .85;
        const r = u.active ? 6 : 4;
        if (u.active) {
          ctx.beginPath(); ctx.arc(x, y, r * 2.2 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `${u.color}15`; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(x, y, r * (u.active ? pulse : 1), 0, Math.PI * 2);
        ctx.fillStyle = u.active ? u.color : 'rgba(255,255,255,0.12)';
        if (u.active) { ctx.shadowBlur = 8; ctx.shadowColor = u.color; }
        ctx.fill(); ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [users]);
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

// ─── CTA canvas ───
export function CtaCanvas() {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .0015, vy: (Math.random() - .5) * .0015,
      r: Math.random() * 1.5 + .5,
    }));
    const draw = () => {
      t.current += .005;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(78,205,196,${.05 * (1 - d / 120)})`;
            ctx.lineWidth = .5; ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
          }
        }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(78,205,196,0.15)'; ctx.fill();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 24 }} />;
}

// ─── Chapter Sidebar Canvas ───
export function ChapterSideCanvas({ chapters }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => {
      c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      c.height = c.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    const draw = () => {
      t.current += .01;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const n = chapters.length || 1;
      const spacing = H / (n + 1);
      ctx.strokeStyle = 'rgba(78,205,196,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(cx, spacing * .5); ctx.lineTo(cx, H - spacing * .5); ctx.stroke();
      ctx.setLineDash([]);
      chapters.forEach((ch, i) => {
        const y = spacing * (i + 1);
        const isDone = ch.status === 'completed';
        const isCur = ch.status === 'current';
        const bw = W * .32;
        ctx.strokeStyle = isDone ? 'rgba(78,205,196,0.3)' : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = .8;
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + bw, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx - bw, y); ctx.stroke();
        if (isCur) {
          const pt = ((t.current * .5 + i) % 1);
          const px = cx + bw * pt;
          ctx.beginPath(); ctx.arc(px, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#F7B731'; ctx.shadowBlur = 6; ctx.shadowColor = '#F7B731'; ctx.fill(); ctx.shadowBlur = 0;
        }
        const r = isCur ? 7 : 5;
        const pulse = isCur ? Math.sin(t.current * 3) * 2 + 9 : r;
        if (isCur || isDone) {
          ctx.beginPath(); ctx.arc(cx, y, pulse + 4, 0, Math.PI * 2);
          ctx.strokeStyle = isCur ? 'rgba(247,183,49,0.2)' : 'rgba(78,205,196,0.15)';
          ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, y, pulse, 0, Math.PI * 2);
        if (isDone) {
          const g = ctx.createRadialGradient(cx, y, 0, cx, y, pulse);
          g.addColorStop(0, 'rgba(78,205,196,0.9)'); g.addColorStop(1, 'rgba(78,205,196,0.2)');
          ctx.fillStyle = g; ctx.shadowBlur = 10; ctx.shadowColor = '#4ECDC4';
        } else if (isCur) {
          const g = ctx.createRadialGradient(cx, y, 0, cx, y, pulse);
          g.addColorStop(0, 'rgba(247,183,49,0.9)'); g.addColorStop(1, 'rgba(247,183,49,0.2)');
          ctx.fillStyle = g; ctx.shadowBlur = 12; ctx.shadowColor = '#F7B731';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
        }
        ctx.fill(); ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [chapters]);
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 220 }} />;
}

// ─── SVG Ring Progress ───
export function Ring({ pct, color, size = 64 }) {
  const r = (size - 7) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: -7, width: size, height: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}
