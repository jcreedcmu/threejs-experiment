import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { SSAOPass, SSAOPassOUTPUT } from 'three/examples/jsm/postprocessing/SSAOPass.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';


init();

function randElt<T>(things: T[]): T {
  return things[Math.floor(Math.random() * things.length)];
}

function init() {
  let container;
  let scene;

  container = document.createElement('div');
  document.body.appendChild(container);

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 7000);
  camera.position.z = 500;


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5eed6);

  scene.add(new THREE.DirectionalLight(0xffffff, 4));
  scene.add(new THREE.AmbientLight(0xffffff));

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 20);
  const geometry2 = new THREE.SphereGeometry(0.5);
  //  const geometry = new THREE.BoxGeometry(1, 20, 1);

  for (let i = 0; i < 100; i++) {

    const material = new THREE.MeshPhongMaterial({
      color: randElt([
        0xffffff,
        0x0,
        0x7f7fff, 0xffff40, 0xf41f54,
        0xff8d00, 0x1ec464, 0xe75de2,
      ]),
      emissive: 0x040404,
      shininess: 50,
      specular: 0x444444,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const mesh2 = new THREE.Mesh(geometry2, material);

    // mesh.position.x = Math.random() * 4 - 2;
    // mesh.position.y = Math.random() * 4 - 2;
    // mesh.position.z = Math.random() * 4 - 2;
    mesh.position.y = 10;
    const container = new THREE.Group();
    container.add(mesh);
    container.rotation.x = 100 * Math.random();
    container.rotation.y = 100 * Math.random();
    container.rotation.z = 100 * Math.random();

    mesh2.position.y = 20;
    container.add(mesh2);

    container.scale.set(30, 10 + 5 * Math.random(), 30);
    group.add(container);

  }


  const width = window.innerWidth;
  const height = window.innerHeight;

  const composer = new EffectComposer(renderer);

  const renderPass = new SSAARenderPass(scene, camera);
  renderPass.sampleLevel = 4;
  console.log(renderPass.sampleLevel);
  composer.addPass(renderPass);

  const ssaoPass = new SSAOPass(scene, camera, width, height);
  composer.addPass(ssaoPass);


  ssaoPass.kernelRadius = 32;
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.3;

  const outputPass = new OutputPass();
  composer.addPass(outputPass);



  const pixelRatio = renderer.getPixelRatio();


  //  ssaoPass.output = SSAOPass.OUTPUT.Default;

  // gui.add(ssaoPass, 'output', {
  //   'Default': SSAOPass.OUTPUT.Default,
  //   'SSAO Only': SSAOPass.OUTPUT.SSAO,
  //   'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
  //   'Depth': SSAOPass.OUTPUT.Depth,
  //   'Normal': SSAOPass.OUTPUT.Normal
  // }).onChange(function(value) {

  //   ssaoPass.output = value;

  // });
  // gui.add(ssaoPass, 'kernelRadius').min(0).max(32);
  // gui.add(ssaoPass, 'minDistance').min(0.001).max(0.02);
  // gui.add(ssaoPass, 'maxDistance').min(0.01).max(0.3);
  // gui.add(ssaoPass, 'enabled');

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
  }

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.update();
  orbit.addEventListener('change', render);

  const control = new TransformControls(camera, renderer.domElement);
  control.setMode('translate');
  control.addEventListener('change', render);
  control.showX = false;
  control.showY = false;
  control.showZ = false;


  control.addEventListener('dragging-changed', event => {
    orbit.enabled = !event.value;
  });

  control.attach(group);
  scene.add(control);

  function animate() {
    render();
    //    controls.update();
  }

  function render() {
    const timer = performance.now();
    // group.rotation.x = timer * 0.0002;
    // group.rotation.y = timer * 0.0001;
    composer.render();
  }

  window.addEventListener('resize', onWindowResize);
}
