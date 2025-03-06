import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCanvas() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;

    // Create Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    // Camera Initialization
    let zoomLevel = 10000; // Start inside the stars
    camera.position.set(0, 0, zoomLevel);
    camera.lookAt(scene.position);

    // Particles Configuration (Stars)
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Math.random() * 8000 - 4000;
      positions[i * 3 + 1] = Math.random() * 8000 - 4000;
      positions[i * 3 + 2] = Math.random() * -20000;
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

    // Planets Configuration
    const planets = [
      { name: "Mercury", size: 50, distance: -2000, texture: "mercury_texture_url" },
      { name: "Venus", size: 100, distance: -3000, texture: "venus_texture_url" },
      { name: "Earth", size: 120, distance: -4000, texture: "earth_texture_url" },
      { name: "Mars", size: 80, distance: -5000, texture: "mars_texture_url" },
      { name: "Jupiter", size: 800, distance: -6000, texture: "jupiter_texture_url" },
      { name: "Saturn", size: 700, distance: -7000, texture: "saturn_texture_url" },
      { name: "Uranus", size: 600, distance: -8000, texture: "uranus_texture_url" },
      { name: "Neptune", size: 600, distance: -9000, texture: "neptune_texture_url" },
    ];

    const textureLoader = new THREE.TextureLoader();
    const planetMeshes = [];

    planets.forEach((planet) => {
      textureLoader.load(planet.texture, (texture) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(planet.size, 64, 64),
          new THREE.MeshBasicMaterial({ map: texture })
        );
        mesh.position.set(0, 0, planet.distance);
        mesh.name = planet.name;
        scene.add(mesh);
        planetMeshes.push(mesh);
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;
        zoomToPlanet(selectedPlanet);
      }
    };
    window.addEventListener("click", onMouseClick);

    const zoomToPlanet = (planet) => {
      zoomLevel = planet.position.z + 200; // Adjust zoom level to be close to the planet
    };

    const animate = () => {
      requestAnimationFrame(animate);

      planetMeshes.forEach((planet) => {
        planet.rotation.y += 0.01; // Rotate each planet
      });

      camera.position.z = zoomLevel;
      renderer.render(scene, camera);
    };
    animate();

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("click", onMouseClick);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="canvas"></canvas>;
}