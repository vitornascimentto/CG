if ( WEBGL.isWebGLAvailable() === false ) {

    document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

// Variáveis
var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false, madeiraEscura = false, madeiraClara = false, water = false, grama = false, terra = false;
var areia = false, caixote = false, muro = false, rocha = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial, cubeGeo2, cubeMaterial2, cubeWater, cubeMaterialWater;
var cubeGrama, cubeMaterialGrama, cubeTerra, cubeMaterialTerra;
var cubeAreia, cubeMaterialAreia, cubeCaixote, cubeMaterialCaixote;
var cubeMuro, cubeMaterialMuro, cubeRocha, cubeMaterialRocha;

var objects = [];

// Funções principais
init();
render();

function init() {

    // Criando e posicionando a câmera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.set( 500, 300, 1300 );
    camera.lookAt( 0, 0, 0 );
    
    // Dando movimento a câmera
    var controls = new THREE.OrbitControls( camera );
    
    // Criando a cena e colocando um background
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    // Images of the sky
    var imagePrefix = "images/minecraft-";
    var directions = ["right", "left", "up", "grama", "down" , "back"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 12000, 12000, 12000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++){
        (directions[i] == "grama")
            ? imageSuffix = ".jpg"
            : imageSuffix = ".png"

        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide
        }));
    }
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);

    // roll-over helpers
    var rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        opacity: 0.5, 
        transparent: true 
    });
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // Cubes
    cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
    cubeMaterial = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( 'textures/minecraft/madeira.jpeg' ) 
    });

    cubeMaterial2 = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( 'textures/minecraft/madeiraClara.png' ) 
    });

    cubeMaterialWater = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( 'textures/water/Water_2_M_Normal.jpg' ) 
    });

    cubeMaterialGrama = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( 'textures/minecraft/grass.png' ) 
    });

    cubeMaterialTerra = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( 'textures/terrain/backgrounddetailed6.jpg' ) 
    });

    cubeMaterialAreia = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load ('textures/minecraft/areia.jpg')
    });

    cubeMaterialCaixote = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load ('textures/crate.gif')
    });

    cubeMaterialMuro = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load ('textures/minecraft/muro.jpg')
    });

    cubeMaterialRocha = new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load ('textures/minecraft/rocha2.jpg')
    });

    // Grid
    var gridHelper = new THREE.GridHelper( 
        12000, 
        240,
        0x228B22,
        0x228B22 
    );
    scene.add( gridHelper );

    // Floor
    /*var planeTexture = new THREE.ImageUtils.loadTexture( 'images/minecraft-grama.jpg' );
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping; 
    planeTexture.repeat.set( 10, 10 );
    
    var planeMaterial = new THREE.MeshBasicMaterial({ 
        map: planeTexture, 
        side: THREE.DoubleSide,
        visible: true
    });
    var geometry = new THREE.PlaneBufferGeometry( 12000, 12000 );
    geometry.rotateX( - Math.PI / 2 );
    
    var plane = new THREE.Mesh( geometry, planeMaterial );
    floor.position.y = -0.5;
    floor.rotation.x = - Math.PI / 2;
    scene.add( plane );
    */
    // SKYBOX/FOG
    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00015 );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Plano
    var geometry = new THREE.PlaneBufferGeometry( 12000, 12000 );
    geometry.rotateX( - Math.PI / 2 ); // Dar a física a cena, quadrado no chão.

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ 
        color: 0x228B22, 
        visible: true 
    }));
    scene.add( plane );

    objects.push( plane );

    // Lights
    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    }

    render();

}

function onDocumentMouseDown( event ) {

    function build( geo, material ){
        var voxel = new THREE.Mesh( geo, material );
        voxel.position.copy( intersect.point ).add( intersect.face.normal );
        voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 ); // Colisão
        scene.add( voxel );

        objects.push( voxel );
    }

    document.getElementById('madeiraC').addEventListener('click', () => {
        madeiraClara = true;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('madeiraE').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = true;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('agua').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = true;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('grama').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = true;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('terra').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = true;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('apagar').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = true;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('mover').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('areia').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = true;
        caixote = false;
        muro = false;
        rocha = false;
    });

    document.getElementById('caixote').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = true;
        muro = false;
        rocha = false;
    });

    document.getElementById('muro').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = true;
        rocha = false;
    });

    document.getElementById('rocha').addEventListener('click', () => {
        madeiraClara = false;
        madeiraEscura = false;
        water = false;
        grama = false;
        terra = false;
        isShiftDown = false;
        areia = false;
        caixote = false;
        muro = false;
        rocha = true;
    });

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1 , - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        // delete cube
        if ( isShiftDown ) {

            if ( intersect.object !== plane ) {
                scene.remove( intersect.object );
                objects.splice( objects.indexOf( intersect.object ), 1 );
            }

        // create cube
        } else if ( madeiraClara ){
            
            build ( cubeGeo, cubeMaterial2 );

        } else if ( water ){
            
            build ( cubeGeo, cubeMaterialWater );

        } else if ( grama ){
            
            build ( cubeGeo, cubeMaterialGrama );

        } else if ( terra ){
            
            build ( cubeGeo, cubeMaterialTerra );

        } else if ( madeiraEscura ) {

            build ( cubeGeo, cubeMaterial );

        } else if ( areia ) {

            build ( cubeGeo, cubeMaterialAreia );

        } else if ( caixote ) {

            build ( cubeGeo, cubeMaterialCaixote );

        } else if ( muro ) {

            build ( cubeGeo, cubeMaterialMuro );

        } else if ( rocha ) {

            build ( cubeGeo, cubeMaterialRocha );

        }

        document.getElementById('reiniciar').addEventListener('click', () => {
            window.location = './project.html'
        });

        render();

    }

}

function onDocumentKeyDown( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = true; break;
    }
}

function onDocumentKeyUp( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = false; break;
    }
}

function render() {
    renderer.render( scene, camera );
}