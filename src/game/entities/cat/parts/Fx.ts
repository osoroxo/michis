import * as THREE from 'three';

const slashGeo = new THREE.RingGeometry(0.8, 1.9, 8, 1, -1, 2);

/** Arco de zarpazo. El color indica el nivel de afilado. */
export function buildSlash(): THREE.Mesh {
  const s = new THREE.Mesh(slashGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  s.rotation.x = -Math.PI / 2;
  s.rotation.z = Math.PI / 2;
  s.position.set(0, 0.8, 0.6);
  s.visible = false;
  return s;
}

export function buildShadow(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.62, 10), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35 }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

export function labelSprite(txt: string, color: string): THREE.Sprite {
  const k = document.createElement('canvas');
  k.width = 192; k.height = 64;
  const g = k.getContext('2d')!;
  g.fillStyle = color; g.fillRect(8, 6, 176, 48);
  g.fillStyle = '#0f0b16'; g.font = 'bold 30px "Arial Black",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt.slice(0, 9).toUpperCase(), 96, 31);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(k), depthTest: false }));
  s.scale.set(1.9, 0.63, 1);
  s.position.y = 2.1;
  return s;
}
