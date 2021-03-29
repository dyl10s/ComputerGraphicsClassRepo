import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';

document.getElementById("theButton").onclick = function(){
    InitiateMeme();
    document.getElementById("theButton").remove();
    document.getElementById("warningText").remove();
}

function InitiateMeme() {
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

    let characterModel;

    loader.load('./models/BellyDance.glb', function (model) {

        mixer = new THREE.AnimationMixer( model.scene );
        var action = mixer.clipAction( model.animations[ 0 ] );
        action.play();

        model.scene.position.z = 150;

        scene.add(model.scene);
        characterModel = model.scene;
    });

    let stageModel;

    loader.load('./models/Stage.glb', function (model) {
        model.scene.position.y = -50;
        model.scene.scale.set(10,10,10);
        scene.add(model.scene);
        stageModel = model.scene;
    });

    // Setup skybox
    const backgroundTexture = new THREE.CubeTextureLoader().load([
    './models/posx.jpg',
    './models/negx.jpg',
    './models/posy.jpg',
    './models/negy.jpg',
    './models/posz.jpg',
    './models/negz.jpg',
    ]);

    scene.background = backgroundTexture;

    // Setup Meme
    const video = document.getElementById('video');
    video.load();
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    const videoMaterial =  new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.FrontSide, toneMapped: false} );
    const videoScreen = new THREE.Mesh(new THREE.BoxGeometry(), videoMaterial);
    videoScreen.scale.set(500, 500, 500);
    videoScreen.position.z = -200;
    videoScreen.position.y = 500;
    scene.add(videoScreen);

    // Setup main light
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

    scene.add(light);

    function animate() {
        var delta = clock.getDelta();

        videoScreen.rotation.y += 1 * delta;

        renderer.render(scene, camera);
        if(mixer) {
            mixer.update(delta);
        }

        if(stageModel) {
            stageModel.rotation.y += 1 * delta;
        }

        if(characterModel) {
            characterModel.rotation.y += 1 * delta;
        }

        requestAnimationFrame(animate);
    }

    camera.position.z = 600;
    camera.position.y = 150;

    animate();
}