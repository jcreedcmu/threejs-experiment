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
  let highlighted: THREE.Object3D | undefined = undefined;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const container = document.createElement('div');
  document.body.appendChild(container);

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 7000);
  camera.position.x = 25;
  camera.position.y = 25;
  camera.position.z = -50;


  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5eed6);

  scene.add(new THREE.DirectionalLight(0xffffff, 4));
  scene.add(new THREE.AmbientLight(0xffffff));

  const group = new THREE.Group();
  scene.add(group);

  const intersectables: THREE.Object3D[] = [];
  for (let i = 0; i < 10; i++) {

    const geometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
    const positionAttribute = geometry.getAttribute('position');

    const color = new THREE.Color();
    const colors = [];

    for (let i = 0; i < positionAttribute.count; i += 6) {

      color.setHex(Math.random() * 0xffffff);

      // face one

      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);

      // face two

      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);

    }

    // const color =  randElt([
    //         0xffffff,
    //         0x0,
    //         0x7f7fff, 0xffff40, 0xf41f54,
    //         0xff8d00, 0x1ec464, 0xe75de2,
    // ]);

    const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorAttribute);

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    intersectables.push(mesh);


    mesh.position.x = 5.3 * i;

    mesh.scale.set(5, 5, 5);
    group.add(mesh);

  }


  const width = window.innerWidth;
  const height = window.innerHeight;

  const composer = new EffectComposer(renderer);

  const renderPass = new SSAARenderPass(scene, camera);
  renderPass.sampleLevel = 4;
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
  orbit.target = new THREE.Vector3(25, 0, 0);
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
    composer.render();
    camera.updateMatrixWorld();
    raycaster.setFromCamera(pointer, camera);

    if (highlighted)
      (highlighted as any).material.emissive.setHex(0x000000);

    const intersects = raycaster.intersectObjects(intersectables, false);
    if (intersects.length > 0) {
      console.log(intersects[0].faceIndex);
      highlighted = intersects[0].object;
      (highlighted as any).material.emissive.setHex(0x007f7f);
    }
    else {
      highlighted = undefined;
    }

  }

  window.addEventListener('resize', onWindowResize);

  document.addEventListener('mousemove', e => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
  });

}
