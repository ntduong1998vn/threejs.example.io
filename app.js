let container;
let camera;
let renderer;
let scene;
let gun;
let controls;

const BACKGROUND_COLOR = 0xf1f1f1;

function init() {
    container = document.querySelector("#scene")
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

    const fov = 30;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;
    // Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10);


    const ambient = new THREE.AmbientLight(0x404040, 10);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(-10, 0, 10);
    scene.add(light);
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Control setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera);
    });

    container.appendChild(renderer.domElement);
    // Load Model
    let loader = new THREE.GLTFLoader();
    loader.load("./gun_3d/scene.gltf", function (gltf) {
        scene.add(gltf.scene);
        gun = gltf.scene.children[0];
        animate();
    })

    // window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}

init();