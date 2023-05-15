import * as THREE from 'three';
import { World, Body, Box, Vec3 } from 'cannon';

// Create a Scene
const scene = new THREE.Scene();

// Create a Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the Cubes
const geometry = new THREE.BoxGeometry(1, 1, 1);

const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const redCube = new THREE.Mesh(geometry, redMaterial);
redCube.position.x = -2;
scene.add(redCube);

const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const greenCube = new THREE.Mesh(geometry, greenMaterial);
greenCube.position.x = 2;
scene.add(greenCube);

// Create the Physics World
const world = new World();
world.gravity.set(0, 0, 0); // no gravity for this example

// Create the physical bodies
const cubeShape = new Box(new Vec3(0.5, 0.5, 0.5));

const cubeMaterial = new CANNON.Material("cubeMaterial");

const greenBody = new CANNON.Body({
  mass: 1,
  material: cubeMaterial
});
// ... rest of greenBody initialization ...

const redBody = new CANNON.Body({
  mass: 0,
  material: cubeMaterial
});
// ... rest of redBody initialization ...

const cubeContactMaterial = new CANNON.ContactMaterial(cubeMaterial, cubeMaterial, {
  friction: 0.5,
  restitution: 0.7
});
world.addContactMaterial(cubeContactMaterial);

world.addEventListener("postStep", function() {
  for (let i = 0; i < world.contacts.length; i++) {
    const contact = world.contacts[i];
    
    if ((contact.bi === greenBody && contact.bj === redBody) ||
        (contact.bi === redBody && contact.bj === greenBody)) {
      console.log("Green cube has collided with the red cube!");
      // add additional code here for what should happen upon collision...
    }
  }
});

// Keyboard Controls
const keys: { [key: string]: boolean } = {
  a: false,
  s: false,
  d: false,
  w: false
};

window.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

let lastTime = NaN;
// Animation
function animate(time : number) {
  requestAnimationFrame(animate);
  let deltaTime = time - lastTime;
  lastTime = time;

  if (keys.a) greenBody.velocity.x = -1;
  else if (keys.d) greenBody.velocity.x = 1;
  else greenBody.velocity.x = 0;

  if (keys.w) greenBody.velocity.y = 1;
  else if (keys.s) greenBody.velocity.y = -1;
  else greenBody.velocity.y = 0;

  // Step the physics world
  world.step(1 / 60);

  // Copy coordinates from js to Three.js
  redCube.position.copy(redBody.position as any);
  redCube.quaternion.copy(redBody.quaternion as any);
  greenCube.position.copy(greenBody.position as any);
  greenCube.quaternion.copy(greenBody.quaternion as any);

  // Render
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);