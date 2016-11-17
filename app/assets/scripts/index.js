$( document ).ready(function() {

  // STANDAR GLOBAL VARIABLES
  var viewer = $('#render-container');
  var scene, camera, renderer, controls, stats;
  var keyboard = new THREEx.KeyboardState();
  var clock    = new THREE.Clock();

  init(); // INICIALIZACION
  loop();  // RENDER LOOP


function init() 
{
  ///////////////////////////////////
  // ESCENA, CAMARA, REDERER, LUZ //
  /////////////////////////////////

  scene  = new THREE.Scene();

  var VIEWER_WIDTH = viewer.innerWidth(),
  VIEWER_HEIGHT    = viewer.innerHeight(),
  VIEW_ANGLE       = 45, 
  ASPECT           = VIEWER_WIDTH / VIEWER_HEIGHT,
  NEAR             = 0.1,
  FAR              = 1000;
  
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,150,400); // mueve camara arriba 150, atras 400
  camera.lookAt(scene.position);  // apunta la camara al centro de la escena
  
  if ( Detector.webgl )
    renderer = new THREE.WebGLRenderer( { antialias:true } );
  else
    renderer = new THREE.CanvasRenderer(); 
  renderer.setSize(VIEWER_WIDTH, VIEWER_HEIGHT);
  viewer.append( renderer.domElement );

  var light = new THREE.PointLight(0xffffff);
  light.position.set(0,250,0);
  scene.add(light);
  var ambientLight = new THREE.AmbientLight(0x111111);
  // scene.add(ambientLight);
  
  ///////////////////////////////////
  // ESCENA, CAMARA, REDERER, LUZ //
  /////////////////////////////////



  /////////////
  // EVENTS //
  ///////////
  
  THREEx.WindowResize(renderer, camera); // automatically resize renderer
  // THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); // toggle full-screen on given key press
  
  /////////////
  // EVENTS //
  ///////////
  
  //////////////
  // CONTROLS //
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  
  

  
  //////////////
  // GEOMETRY //
  //////////////

  // most objects displayed are a "mesh":
  //  a collection of points ("geometry") and
  //  a set of surface parameters ("material")  

  // Sphere parameters: radius, segments along width, segments along height
  var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ); 
  // use a "lambert" material rather than "basic" for realistic lighting.
  //   (don't forget to add (at least one) light!)
  var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x8888ff} ); 
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(100, 50, -50);
  scene.add(sphere);
  
  // Create an array of materials to be used in a cube, one for each side
  var cubeMaterialArray = [];
  // order to add materials: x+,x-,y+,y-,z+,z-
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
  cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
  var cubeMaterials = new THREE.MeshFaceMaterial( cubeMaterialArray );
  // Cube parameters: width (x), height (y), depth (z), 
  //        (optional) segments along x, segments along y, segments along z
  var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1 );
  // using THREE.MeshFaceMaterial() in the constructor below
  //   causes the mesh to use the materials stored in the geometry
  cube = new THREE.Mesh( cubeGeometry, cubeMaterials );
  cube.position.set(-100, 50, -50);
  scene.add( cube );    

  // create a set of coordinate axes to help orient user
  //    specify length in pixels in each direction
  var axes = new THREE.AxisHelper(100);
  scene.add( axes );
  
  ///////////
  // FLOOR //
  ///////////
  
  // note: 4x4 checkboard pattern scaled so that each square is 25 by 25 pixels.
  var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
  floorTexture.repeat.set( 10, 10 );
  // DoubleSide: render texture on both sides of mesh
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);
  
  /////////
  // SKY //
  /////////
  
  // recommend either a skybox or fog effect (can't use both at the same time) 
  // without one of these, the scene's background color is determined by webpage background

  // make sure the camera's "far" value is large enough so that it will render the skyBox!
  var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  // BackSide: render faces from inside of the cube, instead of from outside (default).
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  // scene.add(skyBox);
  
  // fog must be added to scene before first render
  scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
}

function loop() 
{
  requestAnimationFrame( loop );
  render();   
  update();
}

function update()
{
  // delta = change in time since last call (in seconds)
  var delta = clock.getDelta(); 

  // functionality provided by THREEx.KeyboardState.js
  if ( keyboard.pressed("1") )
    document.getElementById('message').innerHTML = ' Have a nice day! - 1'; 
  if ( keyboard.pressed("2") )
    document.getElementById('message').innerHTML = ' Have a nice day! - 2 ';  

  controls.update();
  stats.update();
}

function render() 
{ 
  renderer.render( scene, camera );
}


});