import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function ThreeCanvas() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;

    // Prevent page scrolling while using the canvas
    window.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });

    // Create Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      100000 // Increased to cover the entire solar system
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    let currentPlanetIndex = 0;
    let transitionInProgress = false;
    camera.position.set(0, 0, 15000);
    camera.lookAt(scene.position);

    // Adjusted Stars Configuration to be more spread out
    const particleCount = 20000; // Increased to spread out over a larger area
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Math.random() * 100000 - 50000;
      positions[i * 3 + 1] = Math.random() * 100000 - 50000;
      positions[i * 3 + 2] = Math.random() * -100000;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Planets Configuration with Real Textures
    const planets = [
      { name: "Mercury", size: 50, distance: 3000, angle: 0.2, offset: 800, texture: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Mercury_transparent.png" },
      { name: "Venus", size: 100, distance: 5000, angle: 1.0, offset: 800, texture: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.png" },
      { name: "Earth", size: 120, distance: 7000, angle: 2.5, offset: 800, texture: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg" },
      { name: "Mars", size: 80, distance: 10000, angle: 3.8, offset: 800, texture: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg" },
      { name: "Jupiter", size: 800, distance: 20000, angle: 5.1, offset: 1200, texture: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Jupiter_%28transparent%29.png" },
      { name: "Saturn", size: 700, distance: 30000, angle: 6.7, offset: 1300, texture: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg" },
      { name: "Uranus", size: 600, distance: 40000, angle: 7.9, offset: 1400, texture: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg" },
      { name: "Neptune", size: 600, distance: 50000, angle: 9.3, offset: 1500, texture: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg" }
    ];

    const planetMeshes = [];
    const textureLoader = new THREE.TextureLoader();

    planets.forEach((planet) => {
      textureLoader.load(planet.texture, (texture) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(planet.size, 64, 64),
          new THREE.MeshBasicMaterial({ map: texture })
        );
        mesh.position.set(
          Math.cos(planet.angle) * planet.distance,
          Math.sin(planet.angle) * planet.distance * 0.5,
          -planet.distance
        );
        mesh.name = planet.name;
        scene.add(mesh);
        planetMeshes.push(mesh);
      });
    });

    const moveToPlanet = (index) => {
      transitionInProgress = true;
      gsap.to(camera.position, { 
        x: planetMeshes[index].position.x, 
        y: planetMeshes[index].position.y, 
        z: planetMeshes[index].position.z + planets[index].offset, 
        duration: 1, // Faster transition
        ease: "power2.out", 
        onComplete: () => { 
          transitionInProgress = false;
        }
      });
    };

    const onWheel = (event) => {
      if (transitionInProgress) return;
      
      if (event.deltaY > 0 && currentPlanetIndex < planets.length - 1) {
        currentPlanetIndex++;
      } else if (event.deltaY < 0 && currentPlanetIndex > 0) {
        currentPlanetIndex--;
      }
      moveToPlanet(currentPlanetIndex);
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    const animate = () => {
      requestAnimationFrame(animate);
      planetMeshes.forEach((planet) => planet.rotation.y += 0.002);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="canvas"></canvas>;
}