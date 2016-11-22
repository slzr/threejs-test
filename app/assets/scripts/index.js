'use strict';
$( document ).ready(function() {

  // STANDAR GLOBAL VARIABLES
  var viewer = $('#render-container');
  var scene, camera, renderer, controls, stats;
  var ExportedModel;
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  init(); // INICIALIZACION
  loop();  // RENDER LOOP


/////////////////////
// INICIALIZACION //
///////////////////
function init() {

  // PARAMETROS
  var VIEWER_WIDTH = viewer.innerWidth(),
  VIEWER_HEIGHT    = viewer.innerHeight(),
  VIEW_ANGLE       = 45, 
  ASPECT           = VIEWER_WIDTH / VIEWER_HEIGHT,
  NEAR             = 0.1,
  FAR              = 10000;
  
  // ESCENA
  scene  = new THREE.Scene();
  
  //  CAMARA
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  // camera.position.set(1.5, 1.5, 1.5);
  camera.position.z = 2; // mueve camara arriba 150, atras 400
  // camera.lookAt(scene.position);  // apunta la camara al centro de la escena
  scene.add(camera);
  
  //  RENDERER
  if ( Detector.webgl ){
    renderer = new THREE.WebGLRenderer( { antialias: true } );
  } else {
    renderer = new THREE.CanvasRenderer(); 
  }
  // renderer.setClearColor(new THREE.Color('lightgrey'), 1);
  renderer.setClearColor(0xD0D0D0);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(VIEWER_WIDTH, VIEWER_HEIGHT);
  viewer.append( renderer.domElement );


  //  LUZ
  var light = new THREE.PointLight( 0xffffff, 0.25 );
  light.position.set( 2, 5, 1 );
  // light.position.multiplyScalar( 30 );
  scene.add( light );

  // var light = new THREE.PointLight( 0xffffff, 0.75 );
  // light.position.set( -12, 4.6, 2.4 );
  // light.position.multiplyScalar( 30 );
  // scene.add( light );

  scene.add( new THREE.AmbientLight( 0x050505 ) );


  light = new THREE.DirectionalLight( 0xefefff, 0.75 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );
  light = new THREE.DirectionalLight( 0xffefef, 0.75 );
  light.position.set( -1, -1, -1 ).normalize();
  scene.add( light );

  //  CONTROLES
  controls               = new THREE.OrbitControls( camera );
  controls.minDistance   = 1;
  controls.maxDistance   = 10;

  //  EVENTOS
  // $( window ).resize(function() {
  //   renderer.setSize( viewer.innerWidth(), viewer.innerHeight() );
  //   camera.aspect = viewer.innerWidth() / viewer.innerHeight();
  //   camera.updateProjectionMatrix() ;
  // });


  ///////////////
  // GEOMETRY //
  //////////////

  // // add a torus  
  // var tgeometry = new THREE.TorusKnotGeometry(0.5-0.12, 0.12, 120, 120);
  // // var tmaterial = new THREE.MeshNormalMaterial(); 
  // var tmaterial = new THREE.MeshPhongMaterial() 
  // var tmesh     = new THREE.Mesh( tgeometry, tmaterial );
  // scene.add( tmesh );

  var axes = new THREE.AxisHelper(1);
  scene.add( axes );

  // instantiate a loader
  // var loader = new THREE.JSONLoader();

  // loader.load(
  //   'assets/models/logo_mederic.json',
  //   function ( geometry, materials ) {
  //     console.log(geometry);
  //     console.log(materials);
  //     var material = new THREE.MultiMaterial( materials );
  //     var object = new THREE.Mesh( geometry, material );
  //     scene.add( object );
  //   }
  // );

// load a resource
  var loader = new THREE.OBJLoader();
  loader.load(
    // resource URL
    // 'assets/models/Test_logo Mederic.obj',
    // 'assets/models/musc.obj',
    'assets/models/prueba.obj',
    // 'assets/models/test2.obj',
    // Function when resource is loaded
    function ( object ) {
      scene.add( object );
      object.scale.set(0.005, 0.005, 0.005);

      ExportedModel = object;
      ExportedModel.models = {};
      object.children.map(function(model){
        ExportedModel.models[model.name] = model;
      });
    }
  );

  // ///////////
  // // FLOOR //
  // ///////////
  
  // var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  // var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  // var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  // scene.add(skyBox);
  
  // // fog must be added to scene before first render
  scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );


}
/////////////////////
// INICIALIZACION //
///////////////////


function loop() 
{
  raycaster.setFromCamera( mouse, camera ); 

  var intersects = raycaster.intersectObjects( scene.children );
  for ( var i = 0; i < intersects.length; i++ ) {
    intersects[ i ].object.material.color.set( 0xff0000 );
  }
  
  requestAnimationFrame( loop );
  renderer.render( scene, camera );
}

viewer.mousemove(function(e) {
  // mouse.x = e.clientX;
  // mouse.y = e.clientY;
  mouse.x =   ( e.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;   
});



var colores_anteriores = {};
$(".select-model").click(function(){
  var el           = $(this);
  var model_tag    = $(this).attr("data-model");
  var select_model = ExportedModel.models[model_tag];

  el.toggleClass("selected");
  el.toggleClass("bg-" + el.attr("data-color"));
  
  if ($(this).hasClass("selected")){
    colores_anteriores[select_model.name] = select_model.material.color.getHex();
    select_model.material.color.setStyle( el.css("background-color") );
  } else {
    select_model.material.color.setHex( colores_anteriores[select_model.name] );
  }


});


});