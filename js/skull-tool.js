// Skull Rotation Tool — a stylized, procedurally-built 3D skull you can
// freely orbit and zoom. Built entirely from primitive geometry (no external
// 3D model file), so it's not anatomically photorealistic, but it's a real,
// freely-rotatable 3D form for angle/proportion reference while sketching.
import * as THREE from "./vendor/three.module.min.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const canvas = document.getElementById("skull-canvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14120f);
scene.fog = new THREE.Fog(0x14120f, 6, 14);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.3, 0.4, 4.6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.2;
controls.maxDistance = 8;
// Keep the view within a natural head-height range — this is a stylized
// study form, not built to hold up seen from directly overhead or underneath
controls.minPolarAngle = Math.PI * 0.18;
controls.maxPolarAngle = Math.PI * 0.82;
controls.target.set(0, 0.05, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.addEventListener("start", () => {
  controls.autoRotate = false;
});

/* ---------- Lighting ---------- */

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const key = new THREE.DirectionalLight(0xfff2df, 1.3);
key.position.set(3, 4.5, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);

const rim = new THREE.DirectionalLight(0xc99a44, 0.6);
rim.position.set(-4, 1.5, -3.5);
scene.add(rim);

const fill = new THREE.DirectionalLight(0x6f7ea8, 0.25);
fill.position.set(-2, -1, 3);
scene.add(fill);

/* ---------- Materials ---------- */

const boneMat = new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.62, metalness: 0.02 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 0.95 });
const toothMat = new THREE.MeshStandardMaterial({ color: 0xf4eedd, roughness: 0.35 });

/* ---------- Skull assembly ---------- */
// Convention: +Y up, +Z toward the face, +X to the skull's right.

const skull = new THREE.Group();

function addMesh(geometry, material, { position, rotation, scale } = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  skull.add(mesh);
  return mesh;
}

// Braincase (cranium) — the large rounded dome, sitting up and slightly back
addMesh(new THREE.SphereGeometry(0.95, 48, 32), boneMat, {
  position: [0, 0.62, -0.22],
  scale: [0.88, 0.92, 1.0]
});

// Mid-face / maxilla mass — smaller and narrower than the cranium, tapering
// down toward the mouth, overlapping the cranium so the two read as one form
addMesh(new THREE.SphereGeometry(0.6, 40, 28), boneMat, {
  position: [0, 0.06, 0.28],
  scale: [0.92, 0.86, 0.82]
});

// Brow ridge — slim and set close against the forehead curve so it reads as
// a subtle bony ridge rather than a floating plate
addMesh(new THREE.BoxGeometry(0.88, 0.07, 0.16, 6, 1, 1), boneMat, {
  position: [0, 0.48, 0.6],
  rotation: [-0.25, 0, 0]
});

// Eye sockets — a slim bone-colored orbital rim with a darker, recessed
// hollow behind it, so they read as sunken sockets rather than flat discs
[-1, 1].forEach((side) => {
  const x = side * 0.32;
  addMesh(new THREE.TorusGeometry(0.15, 0.032, 12, 28), boneMat, {
    position: [x, 0.4, 0.65]
  });
  addMesh(new THREE.SphereGeometry(0.13, 20, 16), darkMat, {
    position: [x, 0.39, 0.58],
    scale: [1, 1, 0.6]
  });
});

// Nasal cavity
addMesh(new THREE.ConeGeometry(0.11, 0.34, 16), darkMat, {
  position: [0, 0.24, 0.78],
  rotation: [Math.PI * 0.6, 0, 0]
});

// Zygomatic arches — slim curved struts hugging close to the side of the
// skull from the cheek back toward the ear, built as tubes along a bent
// curve kept close to the head so they read as a seam, not a handle
[-1, 1].forEach((side) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.46, 0.13, 0.54),
    new THREE.Vector3(side * 0.58, 0.14, 0.22),
    new THREE.Vector3(side * 0.57, 0.15, -0.08),
    new THREE.Vector3(side * 0.48, 0.16, -0.28)
  ]);
  addMesh(new THREE.TubeGeometry(curve, 16, 0.022, 8, false), boneMat);
});

// Upper jaw / teeth ridge — kept short in depth and tucked under the face
// mass so it reads as a gum ridge, not a flat shelf jutting off the face
addMesh(new THREE.BoxGeometry(0.68, 0.16, 0.2, 4, 1, 1), boneMat, {
  position: [0, -0.08, 0.78]
});

// Dark inner-mouth shadow plane, sitting behind both teeth rows so the gap
// between them reads as an open mouth cavity instead of solid bone
addMesh(new THREE.BoxGeometry(0.58, 0.26, 0.05), darkMat, {
  position: [0, -0.2, 0.74]
});

function addTeethRow(count, centerX, y, z, rotX, arcWidth) {
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = centerX + (t - 0.5) * arcWidth;
    const curve = Math.cos((t - 0.5) * Math.PI) * 0.04;
    addMesh(new THREE.BoxGeometry(0.065, 0.13, 0.055), toothMat, {
      position: [x, y - curve, z],
      rotation: [rotX, 0, 0]
    });
  }
}

addTeethRow(9, 0, -0.15, 0.88, 0.08, 0.6);

// Lower jaw (mandible) — a distinct, narrower mass set below and slightly
// forward of the maxilla with a visible chin point and angled jaw corners
addMesh(new THREE.SphereGeometry(0.4, 32, 20), boneMat, {
  position: [0, -0.5, 0.5],
  scale: [1.05, 0.55, 0.7]
});
addMesh(new THREE.SphereGeometry(0.13, 16, 12), boneMat, {
  position: [0, -0.66, 0.68]
});

// Jaw ramus — an elongated, angled ellipsoid on each side rising toward the
// ear, blended into the main jaw sphere (an ellipsoid reads far smoother
// against the rest of the rounded form than a hard-edged box would)
[-1, 1].forEach((side) => {
  const ramus = addMesh(new THREE.SphereGeometry(0.26, 20, 16), boneMat, {
    position: [side * 0.34, -0.24, 0.06],
    scale: [0.65, 1.15, 0.8]
  });
  ramus.rotation.z = side * -0.3;
  ramus.rotation.x = 0.1;
});

addTeethRow(8, 0, -0.32, 0.7, -0.06, 0.5);

scene.add(skull);

// Soft contact shadow (a simple dark, blurred-looking disc under the skull)
const shadowGeo = new THREE.CircleGeometry(1.5, 48);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = -0.92;
scene.add(shadowMesh);

/* ---------- Render loop ---------- */

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", resize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ---------- UI controls ---------- */

document.getElementById("skull-wireframe-btn").addEventListener("click", (e) => {
  const on = !boneMat.wireframe;
  boneMat.wireframe = on;
  toothMat.wireframe = on;
  e.currentTarget.classList.toggle("active", on);
});

document.getElementById("skull-reset-btn").addEventListener("click", () => {
  camera.position.set(0.3, 0.4, 4.6);
  controls.target.set(0, 0.05, 0);
  controls.autoRotate = true;
});
