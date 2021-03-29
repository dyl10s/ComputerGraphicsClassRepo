import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

let characterModel;
let stageModel;
let videoLoaded = false;
let backgroundLoaded = false;

let cameraMove = {x: 0, y:0};

let mixer;

const video = document.getElementById('video');
video.src = "./models/video.mp4"
video.load();

video.oncanplay = function() {
    videoLoaded = true;
}

const backgroundTexture = new THREE.CubeTextureLoader().load([
    './models/posx.jpg',
    './models/negx.jpg',
    './models/posy.jpg',
    './models/negy.jpg',
    './models/posz.jpg',
    './models/negz.jpg',
    ], () => { backgroundLoaded = true });

var loader = new GLTFLoader();

loader.load('./models/BellyDance.glb', function (model) {
    mixer = new THREE.AnimationMixer( model.scene );
    var action = mixer.clipAction( model.animations[ 0 ] );
    action.play();

    model.scene.position.z = 150;
    characterModel = model.scene;
});

loader.load('./models/Stage.glb', function (model) {
    model.scene.position.y = -50;
    model.scene.scale.set(10,10,10);
    stageModel = model.scene;
});

var waitForLoad = setInterval(() => {
    if(characterModel && stageModel && videoLoaded && backgroundLoaded) {
        document.getElementById("loadingText").remove();
        document.getElementById("theButton").style.display = "block";
        document.getElementById("warningText").style.display = "block";
        clearInterval(waitForLoad);
    }
}, 50);

document.getElementById("theButton").onclick = function(){
    InitiateMeme();
    document.getElementById("theButton").remove();
    document.getElementById("warningText").remove();
}

function InitiateMeme() {
    const scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.onresize = function(){
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
    }

    // Setup skybox
    scene.background = backgroundTexture;

    // Setup Meme
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

    //Add the preloaded models
    scene.add(characterModel);
    scene.add(stageModel);

    //Add in camera controls
    const controls = new OrbitControls( camera, renderer.domElement );

    function animate() {
        var delta = clock.getDelta();

        videoScreen.rotation.y += 1 * delta;

        camera.position.x += cameraMove.x;
        camera.position.y += cameraMove.y;
        controls.update();

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

    let leftArrow = keyboard("ArrowLeft");
    let rightArrow = keyboard("ArrowRight");
    let upArrow = keyboard("ArrowUp");
    let downArrow = keyboard("ArrowDown");

    leftArrow.press = () => {
        cameraMove.x -= 5;
    };

    leftArrow.release = () => {
        if(cameraMove.x == -5) {
            cameraMove.x = 0;
        }
    };

    rightArrow.press = () => {
        cameraMove.x = 5;
    };

    rightArrow.release = () => {
        if(cameraMove.x == 5) {
            cameraMove.x = 0;
        }
    };

    downArrow.press = () => {
        cameraMove.y = -5;
    };

    downArrow.release = () => {
        if(cameraMove.y == -5) {
            cameraMove.y = 0;
        }
    };

    upArrow.press = () => {
        cameraMove.y = 5;
    };

    upArrow.release = () => {
        if(cameraMove.y == 5) {
            cameraMove.y = 0;
        }
    };

    animate();
}