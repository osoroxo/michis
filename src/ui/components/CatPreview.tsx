import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CatModel } from '../../game/entities/cat/CatModel';
import type { CatSpec } from '../../game/types';

/** Vista 3D del gato que se está diseñando. Se reconstruye al cambiar raza o colores. */
export function CatPreview({ spec }: { spec: CatSpec }) {
  const host = useRef<HTMLDivElement>(null);
  const specRef = useRef(spec);
  specRef.current = spec;
  const key = `${spec.breed}|${spec.body}|${spec.patch}|${spec.accent}`;

  useEffect(() => {
    const el = host.current!;
    THREE.ColorManagement.enabled = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5a78, 0.9 * Math.PI));
    const sun = new THREE.DirectionalLight(0xffffff, 0.5 * Math.PI);
    sun.position.set(4, 8, 6);
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 24), new THREE.MeshLambertMaterial({ color: 0x5a4a78 }));
    floor.position.y = -0.05;
    scene.add(floor);
    const model = new CatModel(specRef.current);
    scene.add(model.root);
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    cam.position.set(0, 2.1, 4.6);
    cam.lookAt(0, 0.85, 0);

    const resize = () => {
      const w = el.clientWidth || 300, h = el.clientHeight || 300;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      model.root.rotation.y = t * 0.7;
      model.animate({ walk: t * 3, speed: 3, grounded: true, climbing: false, climbMoving: false, stunned: false, claw: 0, dodge: 0, sharpening: false, ultra: false, slowed: false, time: t, seed: 0 }, 0xffffff);
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      model.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [key]);

  return <div className="preview" ref={host} />;
}
