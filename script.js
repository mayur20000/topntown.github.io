let scene, camera, renderer, clock;
let centralSphere, orbitGroup, picosGroup;
const pageContent = document.querySelectorAll('.page-content');

const animationTargets = {
    camera: { x: 0, y: 0, z: 5 },
    centralSphere: { scale: 1 },
    orbitGroup: { scale: 0.001, rotationY: 0 },
    picosGroup: { scale: 0.001 }
};

// --- Init ---
function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(animationTargets.camera.x, animationTargets.camera.y, animationTargets.camera.z);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.querySelector('#webgl-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(0x000000, 0); // Make canvas transparent
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; // 1. Enable shadows in the renderer
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Reduced intensity to make shadows pop
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // Reduced intensity
    directionalLight.position.set(-5, 5, 5); // 2. Position light to the left to cast shadow to the right
    directionalLight.castShadow = true; // 3. Enable this light to cast shadows

    // 4. Configure shadow quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;

    scene.add(ambientLight, directionalLight);

    createObjects();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    
    onScroll(); // Call once on load to set initial state
    animate();
}

// --- Create 3D Objects ---
function createObjects() {
    const loader = new THREE.GLTFLoader();

    // Create groups and add them to the scene immediately
    centralSphere = new THREE.Group();
    scene.add(centralSphere);

    orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    picosGroup = new THREE.Group();
    scene.add(picosGroup);

    // --- Load Models ---
    let iceCreamModel, coffeeBeanModel, cherryModel;

    // Function to create orbiting objects once models are loaded
    const createOrbitingObjects = () => {
        if (!coffeeBeanModel || !cherryModel) return; // Exit if models aren't ready

        for (let i = 0; i < 10; i++) {
            const radius = 3 + Math.random() * 2;
            const angle = (i / 10) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 3;

            // Alternate between coffee beans and cherries
            const modelToClone = i % 2 === 0 ? coffeeBeanModel : cherryModel;
            const obj = modelToClone.clone();
            
            if (i % 2 === 0) { // This is a coffee bean
                obj.scale.set(0.25, 0.25, 0.25); 
            } else { // This is a cherry
                obj.scale.set(0.6, 0.6, 0.6);
            }
            
            obj.position.set(x, y, z);
            orbitGroup.add(obj);
        }
        orbitGroup.scale.set(0.001, 0.001, 0.001);
    };

    // Load Ice Cream Model
    loader.load('models/ice_cream.glb', (gltf) => {
        iceCreamModel = gltf.scene;

        // --- Adjust Ice Cream Material to be Lighter and Less Shiny ---
        iceCreamModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(0xFFF5E1); // A light, creamy off-white color
                child.material.roughness = 0.8; // Increase roughness to make it less shiny (more matte)
                child.material.metalness = 0.1; // Keep metalness low for a non-metallic look
                child.material.emissive = new THREE.Color(0x000000); // Remove the emissive glow
                child.castShadow = true; // 5. Allow the ice cream model to cast a shadow
            }
        });

        iceCreamModel.scale.set(3, 3, 3);
        iceCreamModel.position.y = -1.2;
        centralSphere.add(iceCreamModel);
    }, undefined, (error) => {
        console.error('An error happened while loading the ice cream model:', error);
    });

    // Load Coffee Bean Model
    loader.load('models/coffee_bean.glb', (gltf) => {
        coffeeBeanModel = gltf.scene;
        createOrbitingObjects(); // Attempt to build orbit group
    }, undefined, (error) => {
        console.error('An error happened while loading the coffee bean model:', error);
    });

    // Load Cherry Model
    loader.load('models/cherry.glb', (gltf) => {
        cherryModel = gltf.scene;

        // --- Adjust Cherry Material ---
        cherryModel.traverse((child) => {
            if (child.isMesh) {
                // Tone down the red color
                child.material.color.set(0xdd4444); // A slightly less intense red
                child.material.emissive = new THREE.Color(0x330000); // Reduce the red glow
                child.material.metalness = 0.1; 
                child.material.roughness = 0.4; // Slightly increase roughness for less glare
            }
        });

        createOrbitingObjects(); // Attempt to build orbit group
    }, undefined, (error) => {
        console.error('An error happened while loading the cherry model:', error);
    });

    // 6. Add an invisible ground plane to receive the shadow
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); // Material that only shows shadows
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5; // Position it below the ice cream model
    scene.add(ground);


    // --- Picolinos Group (replace with 3D models) ---
    picosGroup = new THREE.Group();
    let chocoChipModel, rainbowSprinkerModel, whiteChocoModel;

    const createPicosObjects = () => {
        if (!chocoChipModel || !rainbowSprinkerModel || !whiteChocoModel) return;

        for(let i = 0; i < 20; i++) {
            const radius = 7 + Math.random() * 3;
            const angle = (i / 20) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 8;

            // Randomly pick one of the three models
            const modelType = i % 3;
            let modelToClone;
            
            if (modelType === 0) {
                modelToClone = chocoChipModel;
            } else if (modelType === 1) {
                modelToClone = rainbowSprinkerModel;
            } else {
                modelToClone = whiteChocoModel;
            }

            const obj = modelToClone.clone();
            obj.scale.set(0.8, 0.8, 0.8);
            obj.position.set(x, y, z);
            obj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            picosGroup.add(obj);
        }
        picosGroup.scale.set(0.001, 0.001, 0.001);
        scene.add(picosGroup);
    };

    // Load Choco Chip Model
    loader.load('models/choco_chip.glb', (gltf) => {
        chocoChipModel = gltf.scene;
        chocoChipModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
        createPicosObjects();
    }, undefined, (error) => {
        console.error('An error happened while loading the choco chip model:', error);
    });

    // Load Rainbow Sprinker Model
    loader.load('models/rainbow_sprinklers.glb', (gltf) => {
        rainbowSprinkerModel = gltf.scene;
        rainbowSprinkerModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
        createPicosObjects();
    }, undefined, (error) => {
        console.error('An error happened while loading the rainbow sprinker model:', error);
    });

    // Load White Choco Model
    loader.load('models/white_choco_chip.glb', (gltf) => {
        whiteChocoModel = gltf.scene;
        whiteChocoModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
        createPicosObjects();
    }, undefined, (error) => {
        console.error('An error happened while loading the white choco model:', error);
    });
}

// --- Events ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
    const scrollY = window.scrollY;
    const pageHeight = window.innerHeight;
    const pageIndex = Math.floor(scrollY / pageHeight);
    const pageScrollPercent = (scrollY % pageHeight) / pageHeight;

    pageContent.forEach((el, i) => {
        let progress = i === pageIndex ? pageScrollPercent : i < pageIndex ? 1 : 0;
        el.style.transform = `translateY(${-progress * 150}px)`;
        el.style.opacity = i === pageIndex ? (1 - pageScrollPercent * 1.5) : (i === pageIndex + 1 ? pageScrollPercent * 1.5 : 1);
    });

    // Update 3D animation targets based on scroll position
    animationTargets.centralSphere.scale = 0.001;
    animationTargets.orbitGroup.scale = 0.001;
    animationTargets.picosGroup.scale = 0.001;

    switch(pageIndex) {
        case 0: // Page 1 -> Page 2
            animationTargets.centralSphere.scale = 1 - pageScrollPercent;
            animationTargets.orbitGroup.scale = pageScrollPercent;
            break;
        case 1: // Page 2 -> Page 3 (Cards)
            animationTargets.orbitGroup.scale = 1 - pageScrollPercent;
            break;
        case 2: // Page 3 (Cards) -> Page 4 (Picos)
            animationTargets.orbitGroup.scale = 0; // Ensure orbit group is gone
            animationTargets.picosGroup.scale = pageScrollPercent;
            break;
        case 3: // Page 4 -> Page 5 (Footer)
            animationTargets.picosGroup.scale = 1 - pageScrollPercent;
            break;
        case 4: // At Page 5
            animationTargets.picosGroup.scale = 0;
            break;
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const lerpFactor = 0.08;

    camera.lookAt(0, 0, 0);

    // Lerp scales of all groups to their target values
    const centralScale = animationTargets.centralSphere.scale;
    centralSphere.scale.lerp(new THREE.Vector3(centralScale, centralScale, centralScale), lerpFactor);

    const orbitScale = animationTargets.orbitGroup.scale;
    orbitGroup.scale.lerp(new THREE.Vector3(orbitScale, orbitScale, orbitScale), lerpFactor);

    const picosScale = animationTargets.picosGroup.scale;
    picosGroup.scale.lerp(new THREE.Vector3(picosScale, picosScale, picosScale), lerpFactor);

    // Keep existing passive animations
    centralSphere.rotation.y = elapsedTime * 0.1;
    orbitGroup.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

init();


const cards = document.querySelectorAll('.card');

// Define the maximum tilt
const maxRotate = 15; // Max tilt in degrees

cards.forEach(card => {
    // 1. Mouse Move Event
    card.addEventListener('mousemove', (e) => {
        // Get card's position and size
        const cardRect = card.getBoundingClientRect();

        // Get mouse position relative to the card's center
        const mouseX = e.clientX - cardRect.left - cardRect.width / 2;
        const mouseY = e.clientY - cardRect.top - cardRect.height / 2;

        // Calculate tilt angle
        const rotateY = (mouseX / (cardRect.width / 2)) * maxRotate;
        const rotateX = -(mouseY / (cardRect.height / 2)) * maxRotate; // Negative to invert
        
        // Get the elements inside the card to move them
        const title = card.querySelector('.card-title');
        const image = card.querySelector('.card-image');

        // Apply the 3D transform to the card
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        
        // We remove the transition during hover for a snappy, responsive feel
        card.style.transition = 'transform 0.1s ease';

        // We also apply the 'pop' to the inner elements
        if (title) {
            title.style.transform = 'translateZ(40px)';
        }
        if (image) {
            image.style.transform = 'translateZ(60px)';
        }
    });

    // 2. Mouse Leave Event
    card.addEventListener('mouseleave', () => {
        // Reset all transforms and add the smooth transition back
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        
        const title = card.querySelector('.card-title');
        const image = card.querySelector('.card-image');

        // Reset inner elements to their original 'Z' position
        if (title) {
            title.style.transform = 'translateZ(30px)';
        }
        if (image) {
            image.style.transform = 'translateZ(50px)';
        }
    });
});

// --- NEW FOOTER PARALLAX LOGIC ---
const footerSection = document.getElementById('footer-section');
const footerBg = document.getElementById('footer-bg');

if (footerSection && footerBg) {
    footerSection.addEventListener('mousemove', (e) => {
        const rect = footerSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        // Move the background slightly in the opposite direction of the mouse
        const moveY = -(mouseY / rect.height) * 30; // Max move 30px
        const moveX = -(mouseX / rect.width) * 20;  // Max move 20px

        footerBg.style.transform = `translateX(${moveX}px) translateY(${moveY}px) scale(1.1)`;
    });

    footerSection.addEventListener('mouseleave', () => {
        footerBg.style.transform = 'translateX(0) translateY(0) scale(1)';
    });
}