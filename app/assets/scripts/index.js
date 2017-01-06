'use strict';
$( document ).ready(function() {

  var bar = new ProgressBar.Circle('#state-print', {
    color: '#aaa',
    strokeWidth: 4,
    trailWidth: 2,
    easing: 'easeInOut',
    duration: 250,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#ffeb3b', width: 2 },
    to: { color: '#4caf50', width: 4 },
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);

      var value = Math.round(circle.value() * 100);
      if (value === 0) {
        circle.setText('');
      } else {
        circle.setText(value+"%");
      }

    }
  });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '2rem';

  // STANDAR GLOBAL VARIABLES
  var container   = $('#render-container'),
  containerWidth  = container.innerWidth(),
  containerHeight = container.innerHeight();
  var scene, camera, renderer, controls;
  var ExportedModel;
  var raycaster   = new THREE.Raycaster();
  var mouseVector = new THREE.Vector2();
  var ModelLoaded;

  init(); // INICIALIZACION
  loop();  // RENDER LOOP


/////////////////////
// INICIALIZACION //
///////////////////
function init() {

  // PARAMETROS
  var VIEW_ANGLE = 45, 
  ASPECT         = containerWidth / containerHeight,
  NEAR           = 0.1,
  FAR            = 10000;


  // ESCENA
  scene  = new THREE.Scene();
  

  //  CAMARA
  camera            = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set(0, 0.5, 3);
  camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
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
  renderer.setSize(containerWidth, containerHeight);
  container.append( renderer.domElement );


  //  LUZ
  // var light = new THREE.PointLight( 0xffffff, 0.25 );
  // light.position.set( 2, 5, 1 );
  // scene.add( light );

  // light = new THREE.PointLight( 0xffffff, 0.25 );
  // light.position.set( -2, 5, 1 );
  // scene.add( light );

  // scene.add( new THREE.AmbientLight( 0x050505 ) );

  // light = new THREE.DirectionalLight( 0xefefff, 0.75 );
  // light.position.set( 1, 1, 1 ).normalize();
  // scene.add( light );

  // light = new THREE.DirectionalLight( 0xffefef, 0.75 );
  // light.position.set( -1, -1, -1 ).normalize();
  // scene.add( light );


  //  CONTROLES
  controls               = new THREE.OrbitControls( camera,  renderer.domElement);
  controls.minDistance   = 1;
  controls.maxDistance   = 10;


  //  RESIZE
  $( window ).resize(function() {
    var containerWidth = container.innerWidth(),
    containerHeight    = container.innerHeight();
    renderer.setSize( containerWidth, containerHeight );
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix() ;
  });


  // LOAD OBJ
  // var loader = new THREE.OBJLoader();
  // loader.load(
  //   'assets/models/prueba.obj',
  //   function ( object ) {
  //     scene.add( object );
  //     // object.scale.set(0.005, 0.005, 0.005);

  //     ExportedModel = object;
  //     ExportedModel.models = {};
  //     object.children.map(function(model){
  //       ExportedModel.models[model.name] = model;
  //       ExportedModel.models[model.name].materialOriginal = model.material;
  //       ExportedModel.models[model.name].selected = false;
  //     });
  //     // console.log(ExportedModel);

  //     // $.each(ExportedModel.models, function(index, model){
  //     //   console.log(model);
  //     // });
  //     // Object.keys(ExportedModel.models).map(function(index, key){
  //       // console.log(ExportedModel.models[key]);
  //     // });

  //     // CALL RENDER LOOP
  //     console.log(scene);
  //     console.log(ExportedModel);
  //     loop();
  //   }
  // );

  // LOAD COLLADA MODEL
  ModelLoaded = false;
  var loader = new THREE.ColladaLoader();
  loader.load('assets/models/mederic_logo.dae', function(collada) {
    collada.scene.scale.set(1, 1, 1);
    scene.add(collada.scene);
    ExportedModel = collada.scene.children;

    console.log(scene);
    console.log(ExportedModel);
    ModelLoaded = true;

    bar.destroy();
    // loop();
  }, function(state){
    // console.log(state);
    var original = state.loaded/state.total;
    bar.animate(Math.round(original*100)/100);  // Number from 0.0 to 1.0
  });

}
/////////////////////
// INICIALIZACION //
///////////////////




///////////
// LOOP //
/////////
var intersects;
function loop() 
{
  if ( ModelLoaded ){
    $.each(ExportedModel, function(index, model){
      if (model.children[0].type == "Mesh")
        model.children[0].material.emissive.set(0x000000);
    });
  
  
    raycaster.setFromCamera( mouseVector, camera ); 
    intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0){
      intersects[0].object.material.emissive.setHex(0xff0000)
    }
  }
  
  requestAnimationFrame( loop );
  renderer.render( scene, camera );
}


container.mousedown(function(e) {
  console.log("down");
  mouseVector.x = -1;
  mouseVector.y = -1;
});

container.mouseup(function(e) {
  console.log("up");
  mouseVector.x =   ( e.offsetX / containerWidth) * 2 - 1;
  mouseVector.y = - ( e.offsetY / containerHeight) * 2 + 1;   
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

function toggleHightlight(object, color){
  console.log(object);

};


});