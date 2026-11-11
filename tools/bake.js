// Ironvale asset baker — runs in a browser page served by tools/server.js.
// Turns heavy .glb files into compact packs:
//  static: quantized triangles + per-face colours (textures sampled into colours)
//  skin:   simplified bind mesh + skin weights + per-frame bone matrices
'use strict';
const LOG = document.getElementById('log');
const log = t => { LOG.textContent += t + '\n'; window.scrollTo(0, 1e9); };
function b64(typed) {
  const u8 = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength); let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
const comp = (a, i, k) => k === 0 ? a.getX(i) : k === 1 ? a.getY(i) : k === 2 ? a.getZ(i) : a.getW(i);
const findClip = (clips, keys) => {
  for (const k of [].concat(keys)) {
    const kl = k.toLowerCase();
    const c = clips.find(c => c.name.toLowerCase().endsWith(kl)) || clips.find(c => c.name.toLowerCase().includes(kl));
    if (c) return c;
  }
  return null;
};
function sampler(tex, cache) {
  if (!tex || !tex.image) return null;
  if (cache.has(tex)) return cache.get(tex);
  const img = tex.image, w = img.width, h = img.height;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, w, h).data;
  const fn = (u, v) => { u -= Math.floor(u); v -= Math.floor(v); const x = Math.min(w - 1, (u * w) | 0), y = Math.min(h - 1, (v * h) | 0), i = (y * w + x) * 4; return [d[i] / 255, d[i + 1] / 255, d[i + 2] / 255, d[i + 3] / 255]; };
  cache.set(tex, fn); return fn;
}
// all triangles of a subtree with their colour
const lerp3 = (a, b) => a + (b - a) * 0.6;
function collectTris(root) {
  const meshes = []; root.traverse(o => { if (o.isMesh && o.visible !== false) meshes.push(o); });
  const cache = new Map(), c = new THREE.Color(), tris = [];
  for (const m of meshes) {
    const g = m.geometry, pos = g.attributes.position, uv = g.attributes.uv, vc = g.attributes.color, index = g.index ? g.index.array : null;
    const count = index ? index.length : pos.count;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count, materialIndex: 0 }];
    for (const grp of groups) {
      const mat = mats[grp.materialIndex || 0] || mats[0];
      const smp = sampler(mat && mat.map, cache);
      for (let t = grp.start; t < Math.min(count, grp.start + grp.count); t += 3) {
        const a = index ? index[t] : t, b = index ? index[t + 1] : t + 1, d = index ? index[t + 2] : t + 2;
        let r = 1, gg = 1, bb = 1;
        if (mat && mat.color) { r = mat.color.r; gg = mat.color.g; bb = mat.color.b; }
        if (smp && uv) {
          // average opaque samples (centroid + near each corner); drop see-through leaf-card triangles
          const us = [uv.getX(a), uv.getX(b), uv.getX(d)], vs = [uv.getY(a), uv.getY(b), uv.getY(d)], cu = (us[0] + us[1] + us[2]) / 3, cv = (vs[0] + vs[1] + vs[2]) / 3;
          let sr = 0, sg = 0, sb = 0, n = 0, alpha = 0;
          for (const [pu, pv] of [[cu, cv], [lerp3(cu, us[0]), lerp3(cv, vs[0])], [lerp3(cu, us[1]), lerp3(cv, vs[1])], [lerp3(cu, us[2]), lerp3(cv, vs[2])]]) { const s = smp(pu, pv); alpha += s[3]; if (s[3] > 0.45) { sr += s[0]; sg += s[1]; sb += s[2]; n++; } }
          const transparent = mat && (mat.transparent || mat.alphaTest > 0);
          if (n === 0 || (transparent && alpha / 4 < 0.3)) continue;
          c.setRGB(sr / n, sg / n, sb / n).convertSRGBToLinear(); r *= c.r; gg *= c.g; bb *= c.b;
        }
        if (vc) { r *= (vc.getX(a) + vc.getX(b) + vc.getX(d)) / 3; gg *= (vc.getY(a) + vc.getY(b) + vc.getY(d)) / 3; bb *= (vc.getZ(a) + vc.getZ(b) + vc.getZ(d)) / 3; }
        if (mat && mat.emissive && (mat.emissive.r + mat.emissive.g + mat.emissive.b) > 0.3) { r = Math.max(r, mat.emissive.r); gg = Math.max(gg, mat.emissive.g); bb = Math.max(bb, mat.emissive.b); }
        tris.push({ m, v: [a, b, d], c: [r, gg, bb] });
      }
    }
  }
  return { meshes, tris };
}
// simplification by vertex clustering; returns cluster id per point
function cluster(points, n, cell) {
  const map = new Map(), id = new Int32Array(n); let k = 0;
  for (let i = 0; i < n; i++) {
    const key = Math.floor(points[i * 3] / cell) + ',' + Math.floor(points[i * 3 + 1] / cell) + ',' + Math.floor(points[i * 3 + 2] / cell);
    let c = map.get(key); if (c === undefined) { c = k++; map.set(key, c); } id[i] = c;
  }
  return { id, k };
}
function bounds(P) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[i + k]); mx[k] = Math.max(mx[k], P[i + k]); }
  return { mn, mx, ext: [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]] };
}
// scale + offset so the model stands on y=0, centred, at the requested size
function normMatrix(bb, item) {
  const e = bb.ext;
  const s = item.fit ? item.fit / Math.max(1e-6, e[0], e[2]) : item.len ? item.len / Math.max(1e-6, e[2]) : (item.h || 1) / Math.max(1e-6, e[1]);
  const cx = (bb.mn[0] + bb.mx[0]) / 2, cz = (bb.mn[2] + bb.mx[2]) / 2, y0 = item.len ? (bb.mn[1] + bb.mx[1]) / 2 : bb.mn[1];
  return new THREE.Matrix4().makeScale(s, s, s).multiply(new THREE.Matrix4().makeTranslation(-cx, -y0, -cz));
}
// ---------- static ----------
function bakeStatic(root, item) {
  root.updateMatrixWorld(true);
  const { tris } = collectTris(root);
  if (!tris.length) return null;
  const v = new THREE.Vector3(), P = new Float32Array(tris.length * 9);
  tris.forEach((t, i) => { for (let k = 0; k < 3; k++) { v.fromBufferAttribute(t.m.geometry.attributes.position, t.v[k]).applyMatrix4(t.m.matrixWorld); P[i * 9 + k * 3] = v.x; P[i * 9 + k * 3 + 1] = v.y; P[i * 9 + k * 3 + 2] = v.z; } });
  const bb0 = bounds(P), Nm = normMatrix(bb0, item);
  for (let i = 0; i < P.length; i += 3) { v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(Nm); P[i] = v.x; P[i + 1] = v.y; P[i + 2] = v.z; }
  // simplify toward the triangle budget
  let outP = P, outC = tris.map(t => t.c), T = tris.length;
  const budget = item.max || 1200;
  if (T > budget) {
    const bb = bounds(P), big = Math.max(...bb.ext);
    let res = 90, best = null;
    while (res >= 8) {
      const { id, k } = cluster(P, P.length / 3, big / res);
      const sum = new Float64Array(k * 3), cnt = new Float64Array(k);
      for (let i = 0; i < P.length / 3; i++) { const c = id[i]; sum[c * 3] += P[i * 3]; sum[c * 3 + 1] += P[i * 3 + 1]; sum[c * 3 + 2] += P[i * 3 + 2]; cnt[c]++; }
      const seen = new Set(), keep = [];
      for (let t = 0; t < T; t++) {
        const a = id[t * 3], b = id[t * 3 + 1], d = id[t * 3 + 2];
        if (a === b || b === d || a === d) continue;
        const key = [a, b, d].sort((x, y) => x - y).join(','); if (seen.has(key)) continue; seen.add(key); keep.push([t, a, b, d]);
      }
      best = { keep, sum, cnt };
      if (keep.length <= budget) break;
      res = Math.floor(res * 0.8);
    }
    outP = new Float32Array(best.keep.length * 9); outC = [];
    best.keep.forEach(([t, a, b, d], i) => { [a, b, d].forEach((c, k) => { for (let q = 0; q < 3; q++) outP[i * 9 + k * 3 + q] = best.sum[c * 3 + q] / best.cnt[c]; }); outC.push(tris[t].c); });
    T = best.keep.length;
  }
  const bb = bounds(outP), Q = new Int16Array(T * 9), C = new Uint8Array(T * 3);
  for (let i = 0; i < T * 9; i++) { const k = i % 3; Q[i] = Math.round(((outP[i] - bb.mn[k]) / Math.max(1e-6, bb.ext[k])) * 65535 - 32768); }
  outC.forEach((c, i) => { C[i * 3] = Math.min(255, Math.round(Math.sqrt(c[0]) * 255)); C[i * 3 + 1] = Math.min(255, Math.round(Math.sqrt(c[1]) * 255)); C[i * 3 + 2] = Math.min(255, Math.round(Math.sqrt(c[2]) * 255)); });
  return { k: 's', T, box: [...bb.mn, ...bb.ext].map(x => +x.toFixed(5)), pos: b64(Q), col: b64(C) };
}
// ---------- skinned / animated ----------
function bakeSkin(gltf, item) {
  const root = gltf.scene, clips = gltf.animations || [];
  const mixer = new THREE.AnimationMixer(root);
  const pose = (clip, t) => { mixer.stopAllAction(); if (clip) { const a = mixer.clipAction(clip); a.reset(); a.play(); mixer.setTime(t); } root.updateMatrixWorld(true); };
  const spec = item.clips;
  const restClip = findClip(clips, spec.idle ? spec.idle[0] : spec.walk[0]);
  pose(restClip, 0);
  const { meshes, tris } = collectTris(root);
  // global bone list
  const gidKey = new Map(), bones = []; // {m, j} or {m}
  const meshBase = new Map();
  for (const m of meshes) {
    if (m.isSkinnedMesh) {
      // one entry per distinct (bone, bind, placement) so meshes sharing a skeleton share bones
      const mk = m.bindMatrix.elements.map(x => x.toFixed(4)).join(',') + '|' + m.matrixWorld.elements.map(x => x.toFixed(4)).join(',');
      const map = m.skeleton.bones.map((bone, j) => { const key = bone.uuid + '|' + mk; if (!gidKey.has(key)) { gidKey.set(key, bones.length); bones.push({ m, j }); } return gidKey.get(key); });
      meshBase.set(m, map);
    } else { meshBase.set(m, [bones.length]); bones.push({ m, rigid: true }); }
  }
  const tmp = new THREE.Matrix4(), tmp2 = new THREE.Matrix4();
  const boneMats = Nm => bones.map(b => {
    const out = new THREE.Matrix4();
    if (b.rigid) return out.multiplyMatrices(Nm, b.m.matrixWorld);
    const m = b.m, bone = m.skeleton.bones[b.j];
    tmp.multiplyMatrices(bone.matrixWorld, m.skeleton.boneInverses[b.j]);
    tmp2.multiplyMatrices(m.bindMatrixInverse, tmp).multiply(m.bindMatrix);
    return out.multiplyMatrices(Nm, m.matrixWorld).multiply(tmp2);
  });
  // vertex slots
  const slotOf = new Map(), slots = [];
  const meshIdx = new Map(meshes.map((m, i) => [m, i]));
  const slot = (m, vi) => { const key = meshIdx.get(m) * 1e7 + vi; let s = slotOf.get(key); if (s === undefined) { s = slots.length; slots.push({ m, vi }); slotOf.set(key, s); } return s; };
  const triS = tris.map(t => t.v.map(vi => slot(t.m, vi)));
  const V0 = slots.length;
  const bind = new Float32Array(V0 * 3), skI = new Uint16Array(V0 * 4), skW = new Float32Array(V0 * 4);
  const v = new THREE.Vector3();
  slots.forEach((s, i) => {
    const g = s.m.geometry; v.fromBufferAttribute(g.attributes.position, s.vi);
    bind[i * 3] = v.x; bind[i * 3 + 1] = v.y; bind[i * 3 + 2] = v.z;
    const base = meshBase.get(s.m);
    if (s.m.isSkinnedMesh) { for (let k = 0; k < 4; k++) { skI[i * 4 + k] = base[comp(g.attributes.skinIndex, s.vi, k)]; skW[i * 4 + k] = comp(g.attributes.skinWeight, s.vi, k); } }
    else { skI[i * 4] = base[0]; skW[i * 4] = 1; }
  });
  const skinAll = mats => {
    const out = new Float32Array(V0 * 3), p = new THREE.Vector3();
    for (let i = 0; i < V0; i++) {
      let x = 0, y = 0, z = 0;
      for (let k = 0; k < 4; k++) { const w = skW[i * 4 + k]; if (!w) continue; p.set(bind[i * 3], bind[i * 3 + 1], bind[i * 3 + 2]).applyMatrix4(mats[skI[i * 4 + k]]); x += p.x * w; y += p.y * w; z += p.z * w; }
      out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
    }
    return out;
  };
  const I = new THREE.Matrix4();
  const rest = skinAll(boneMats(I));
  const Nm = normMatrix(bounds(rest), item);
  // simplify on the rest pose (representative vertex keeps its skin weights)
  const budget = item.max || 1800;
  let keepTris = triS.map((t, i) => [i, ...t]), rep = null;
  if (keepTris.length > budget) {
    const bb = bounds(rest), big = Math.max(...bb.ext); let res = 90;
    while (res >= 8) {
      const { id } = cluster(rest, V0, big / res);
      const first = new Map(); rep = new Int32Array(V0);
      for (let i = 0; i < V0; i++) { if (!first.has(id[i])) first.set(id[i], i); rep[i] = first.get(id[i]); }
      const seen = new Set(); keepTris = [];
      triS.forEach((t, ti) => { const a = rep[t[0]], b = rep[t[1]], d = rep[t[2]]; if (a === b || b === d || a === d) return; const key = [a, b, d].sort((x, y) => x - y).join(','); if (seen.has(key)) return; seen.add(key); keepTris.push([ti, a, b, d]); });
      if (keepTris.length <= budget) break;
      res = Math.floor(res * 0.8);
    }
  }
  // compact vertex list
  const used = new Map(), vlist = [];
  const idx = new Uint16Array(keepTris.length * 3), col = new Uint8Array(keepTris.length * 3);
  keepTris.forEach(([ti, a, b, d], i) => {
    [a, b, d].forEach((s, k) => { let u = used.get(s); if (u === undefined) { u = vlist.length; used.set(s, u); vlist.push(s); } idx[i * 3 + k] = u; });
    const c = tris[ti].c; col[i * 3] = Math.min(255, Math.round(Math.sqrt(c[0]) * 255)); col[i * 3 + 1] = Math.min(255, Math.round(Math.sqrt(c[1]) * 255)); col[i * 3 + 2] = Math.min(255, Math.round(Math.sqrt(c[2]) * 255));
  });
  const V = vlist.length, pos = new Float32Array(V * 3), sk = new Uint8Array(V * 4), sw = new Uint8Array(V * 4);
  const usedB = new Map(), keepB = [];
  vlist.forEach(s => { for (let k = 0; k < 4; k++) if (skW[s * 4 + k] > 0.002) { const g = skI[s * 4 + k]; if (!usedB.has(g)) { usedB.set(g, keepB.length); keepB.push(g); } } });
  if (keepB.length > 255) throw new Error('too many bones: ' + keepB.length);
  vlist.forEach((s, i) => { pos.set(bind.subarray(s * 3, s * 3 + 3), i * 3); let wsum = 0; for (let k = 0; k < 4; k++) { const w = skW[s * 4 + k] > 0.002 ? skW[s * 4 + k] : 0; wsum += w; } for (let k = 0; k < 4; k++) { const w = skW[s * 4 + k] > 0.002 ? skW[s * 4 + k] : 0; sk[i * 4 + k] = w ? usedB.get(skI[s * 4 + k]) : 0; sw[i * 4 + k] = Math.round(w / (wsum || 1) * 255); } });
  const allBones = boneMatsAll => keepB.map(g => boneMatsAll[g]);
  // frames
  const out = { k: 'a', V, T: keepTris.length, B: keepB.length, pos: b64(pos), idx: b64(idx), col: b64(col), sk: b64(sk), sw: b64(sw), clips: {} };
  const pack = matsAll => { const mats = allBones(matsAll); const f = new Float32Array(mats.length * 12); mats.forEach((m, j) => { const e = m.elements; f.set([e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10], e[12], e[13], e[14]], j * 12); }); return f; };
  for (const st in spec) {
    const [keys, n] = spec[st], clip = findClip(clips, keys);
    if (!clip) continue;
    const all = new Float32Array(n * keepB.length * 12);
    for (let i = 0; i < n; i++) {
      const t = st === 'death' ? clip.duration * Math.min(0.999, i / Math.max(1, n - 1)) : clip.duration * i / n;
      pose(clip, t); all.set(pack(boneMats(Nm)), i * keepB.length * 12);
    }
    out.clips[st] = { n, m: b64(all) };
  }
  if (!out.clips.idle) { pose(restClip, 0); out.clips.idle = { n: 1, m: b64(pack(boneMats(Nm))) }; }
  mixer.stopAllAction();
  return out;
}
// ---------- driver ----------
async function run() {
  const loader = new THREE.GLTFLoader();
  const only = new URLSearchParams(location.search).get('only');
  const list = MANIFEST.filter(m => !only || m.pack === only || m.name === only);
  let ok = 0, tot = 0;
  for (const item of list) {
    try {
      const buf = await (await fetch('/assets/' + item.file)).arrayBuffer();
      const gltf = await new Promise((res, rej) => loader.parse(buf, '', res, rej));
      const root = gltf.scene;
      root.rotation.set(item.rx || 0, item.ry || 0, 0);
      root.updateMatrixWorld(true);
      const results = [];
      if (item.split) {
        let container = root; while (container.children.length === 1 && !container.children[0].isMesh) container = container.children[0];
        container.children.forEach((ch, i) => { if (item.pick && !item.pick.includes(i)) return; const d = bakeStatic(ch, item); if (d) results.push([item.name + '_' + (results.length + 1), d]); });
      } else if (item.clips) results.push([item.name, bakeSkin(gltf, item)]);
      else { const d = bakeStatic(root, item); if (d) results.push([item.name, d]); }
      for (const [name, data] of results) {
        await fetch('/out', { method: 'POST', body: JSON.stringify({ pack: item.pack, name, data }) });
        tot += JSON.stringify(data).length;
        log(`${item.pack}/${name}: ${data.k} T=${data.T}${data.k === 'a' ? ' B=' + data.B + ' clips=' + Object.keys(data.clips).join(',') : ''}`);
      }
      ok++;
    } catch (e) { log('FAILED ' + item.name + ': ' + e.message); console.error(e); }
    await new Promise(r => setTimeout(r, 0));
  }
  const r = await (await fetch('/finish', { method: 'POST', body: '{}' })).text();
  log(`DONE ${ok}/${list.length} items, ${(tot / 1048576).toFixed(2)}MB → ${r}`);
  window.BAKE_DONE = r;
}
run();
