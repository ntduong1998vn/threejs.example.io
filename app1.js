let container;
let camera;
let renderer;
let scene;
let chairModel;
let controls;
let activeOption = 'legs';
const TRAY = document.getElementById('js-tray-slide');
const BACKGROUND_COLOR = 0xf1f1f1;
const MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";

// Initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });

const INITIAL_MAP = [
    { childID: "back", mtl: INITIAL_MTL },
    { childID: "base", mtl: INITIAL_MTL },
    { childID: "cushions", mtl: INITIAL_MTL },
    { childID: "legs", mtl: INITIAL_MTL },
    { childID: "supports", mtl: INITIAL_MTL },
];

const colors = [
    {
        texture: './texture/gold.jpg',
        size: [2, 2, 2],
        shininess: 60
    },
    {
        texture: './texture/wood.png',
        size: [3, 3, 3],
        shininess: 0
    },
    {
        color: '66533C'
    },
    {
        color: '173A2F'
    },
    {
        color: '153944'
    },
    {
        color: '27548D'
    },
    {
        color: '438AAC'
    }
]

function init() {
    container = document.querySelector("#scene");
    // Scene 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

    const fov = 50;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 1;
    const far = 500;
    // Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 5);

    // Setup light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    scene.add(dirLight);

    // Init the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);


    // Load Model
    let loader = new THREE.GLTFLoader();
    loader.load("./chair.glb", function (gltf) {
        chairModel = gltf.scene;
        chairModel.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true
            }
        });

        // Set the models initial scale 
        chairModel.scale.set(2, 2, 2);
        chairModel.rotation.y = Math.PI;

        // Offset the y position a bit
        chairModel.position.y = -1;

        // Set initial textures
        for (let object of INITIAL_MAP) {
            initColor(chairModel, object.childID, object.mtl);
        }
        scene.add(chairModel);
    }, undefined, function (err) {
        console.error(err);
    });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 0
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    scene.add(floor);

    // Add controls 
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
    controls.autoRotateSpeed = 0.2; // 30

    animate();
}

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
    parent.traverse(o => {
        if (o.isMesh && o.name.includes(type)) {
            o.material = mtl;
            o.nameID = type; // Set a new property to identify this object
        }
    })
}
function resizeRendererToDisplaySize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function buildColors() {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');
        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }
        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}

function selectSwatch(e) {
    let color = colors[parseInt(e.target.dataset.key)];
    let new_mtl;

    if (color.texture) {
        let txt = new THREE.TextureLoader().load(color.texture);

        txt.repeat.set(color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;

        new_mtl = new THREE.MeshPhongMaterial({
            map: txt,
            shininess: color.shininess ? color.shininess : 10
        });
    }
    else {
        new_mtl = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10

        });
    }
    setMaterial(chairModel, activeOption, new_mtl);
}

function setMaterial(parent, type, mtl) {
    parent.traverse(o => {
        if (o.isMesh && o.nameID != null && o.nameID == type) {
            o.material = mtl;
        }
    })
}

function selectOption(e) {
    let option = e.target;
    activeOption = e.target.dataset.option;
    for (const otherOption of options) {
        otherOption.classList.remove('--is-active');
    }
    option.classList.add('--is-active');
}


const options = document.querySelectorAll('.option');
options.forEach(option => {
    option.addEventListener('click', selectOption);
})

// Run
init();
buildColors();
const swatches = document.querySelectorAll('.tray__swatch');
for (const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
}
window.addEventListener("resize", resizeRendererToDisplaySize);


