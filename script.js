let scene, camera, renderer, clock;
let centralSphere, orbitGroup, picosGroup;
const pageContent = document.querySelectorAll('.page-content');

const animationTargets = {
    camera: { x: 0, y: 0, z: 5 },
    centralSphere: { scale: 1 },
    orbitGroup: { scale: 0.001, rotationY: 0 },
    picosGroup: { scale: 0.001 }
};

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
    renderer.setClearColor(0x000000, 0); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); 
    directionalLight.position.set(-5, 5, 5); 
    directionalLight.castShadow = true; 

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;

    scene.add(ambientLight, directionalLight);

    createObjects();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    
    onScroll(); 
    animate();
}

function createObjects() {
    const loader = new THREE.GLTFLoader();

    centralSphere = new THREE.Group();
    scene.add(centralSphere);

    orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    picosGroup = new THREE.Group();
    scene.add(picosGroup);

    let iceCreamModel, coffeeBeanModel, cherryModel;

    const createOrbitingObjects = () => {
        if (!coffeeBeanModel || !cherryModel) return; 

        for (let i = 0; i < 10; i++) {
            const radius = 3 + Math.random() * 2;
            const angle = (i / 10) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 3;

            const modelToClone = i % 2 === 0 ? coffeeBeanModel : cherryModel;
            const obj = modelToClone.clone();
            
            if (i % 2 === 0) {
                obj.scale.set(0.25, 0.25, 0.25); 
            } else { 
                obj.scale.set(0.6, 0.6, 0.6);
            }
            
            obj.position.set(x, y, z);
            orbitGroup.add(obj);
        }
        orbitGroup.scale.set(0.001, 0.001, 0.001);
    };


    loader.load('models/ice_cream.glb', (gltf) => {
        iceCreamModel = gltf.scene;

        iceCreamModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(0xFFF5E1); 
                child.material.roughness = 0.8; 
                child.material.metalness = 0.1; 
                child.material.emissive = new THREE.Color(0x000000); 
                child.castShadow = true; 
            }
        });

        iceCreamModel.scale.set(3, 3, 3);
        iceCreamModel.position.y = -1.2;
        centralSphere.add(iceCreamModel);
    }, undefined, (error) => {
        console.error('An error happened while loading the ice cream model:', error);
    });

    loader.load('models/coffee_bean.glb', (gltf) => {
        coffeeBeanModel = gltf.scene;
        createOrbitingObjects(); 
    }, undefined, (error) => {
        console.error('An error happened while loading the coffee bean model:', error);
    });

    loader.load('models/cherry.glb', (gltf) => {
        cherryModel = gltf.scene;

        cherryModel.traverse((child) => {
            if (child.isMesh) {
      
                child.material.color.set(0xdd4444); 
                child.material.emissive = new THREE.Color(0x330000); 
                child.material.metalness = 0.1; 
                child.material.roughness = 0.4; 
            }
        });

        createOrbitingObjects(); 
    }, undefined, (error) => {
        console.error('An error happened while loading the cherry model:', error);
    });

    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); 
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5; 
    scene.add(ground);


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

    animationTargets.centralSphere.scale = 0.001;
    animationTargets.orbitGroup.scale = 0.001;
    animationTargets.picosGroup.scale = 0.001;

    switch(pageIndex) {
        case 0: 
            animationTargets.centralSphere.scale = 1 - pageScrollPercent;
            animationTargets.orbitGroup.scale = pageScrollPercent;
            break;
        case 1: 
            animationTargets.orbitGroup.scale = 1 - pageScrollPercent;
            break;
        case 2: 
            animationTargets.orbitGroup.scale = 0; 
            animationTargets.picosGroup.scale = pageScrollPercent;
            break;
        case 3: 
            animationTargets.picosGroup.scale = 1 - pageScrollPercent;
            break;
        case 4: 
            animationTargets.picosGroup.scale = 0;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const lerpFactor = 0.08;

    camera.lookAt(0, 0, 0);

    const centralScale = animationTargets.centralSphere.scale;
    centralSphere.scale.lerp(new THREE.Vector3(centralScale, centralScale, centralScale), lerpFactor);

    const orbitScale = animationTargets.orbitGroup.scale;
    orbitGroup.scale.lerp(new THREE.Vector3(orbitScale, orbitScale, orbitScale), lerpFactor);

    const picosScale = animationTargets.picosGroup.scale;
    picosGroup.scale.lerp(new THREE.Vector3(picosScale, picosScale, picosScale), lerpFactor);

    centralSphere.rotation.y = elapsedTime * 0.1;
    orbitGroup.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

init();


const cards = document.querySelectorAll('.card');


const maxRotate = 15; 

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();

        const mouseX = e.clientX - cardRect.left - cardRect.width / 2;
        const mouseY = e.clientY - cardRect.top - cardRect.height / 2;

        const rotateY = (mouseX / (cardRect.width / 2)) * maxRotate;
        const rotateX = -(mouseY / (cardRect.height / 2)) * maxRotate; 
        
        const title = card.querySelector('.card-title');
        const image = card.querySelector('.card-image');

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        
        card.style.transition = 'transform 0.1s ease';

        if (title) {
            title.style.transform = 'translateZ(40px)';
        }
        if (image) {
            image.style.transform = 'translateZ(60px)';
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        
        const title = card.querySelector('.card-title');
        const image = card.querySelector('.card-image');

        if (title) {
            title.style.transform = 'translateZ(30px)';
        }
        if (image) {
            image.style.transform = 'translateZ(50px)';
        }
    });
});

const footerSection = document.getElementById('footer-section');
const footerBg = document.getElementById('footer-bg');

if (footerSection && footerBg) {
    footerSection.addEventListener('mousemove', (e) => {
        const rect = footerSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        
        const moveY = -(mouseY / rect.height) * 30;
        const moveX = -(mouseX / rect.width) * 20;  

        footerBg.style.transform = `translateX(${moveX}px) translateY(${moveY}px) scale(1.1)`;
    });

    footerSection.addEventListener('mouseleave', () => {
        footerBg.style.transform = 'translateX(0) translateY(0) scale(1)';
    });
}