import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var mixer;
var clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.onresize = function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
}

var loader = new GLTFLoader();

loader.load('./models/BellyDance.glb', function (model) {

    mixer = new THREE.AnimationMixer( model.scene );
	var action = mixer.clipAction( model.animations[ 0 ] );
	action.play();

    scene.add(model.scene);

});

const skyColor = 0xB1E1FF;
const groundColor = 0xB97A20;
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

scene.add(light);

function animate() {
    var delta = clock.getDelta();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
    if(mixer) {
        mixer.update(delta);
    }
}

camera.position.z = 300;
camera.position.y = 150;

animate();