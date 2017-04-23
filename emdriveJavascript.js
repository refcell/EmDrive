var inst = this;
var dae;
var geometry02;
var material02;
var cylinder02;
var intersectionTopCount = 0;
var intersectionBottomCount = 0;
var object;
var scene;
var camera;
var controls;
var renderer;
var simulation;
var scene;
var mesh; 
var intersects;
var intersects2;
var intersectionpoint;
var coordinate;
var faceUp;
var faceDown;
var dist = 20;
var dist2 = 20;
var oldvector;
var x = .2;
var y = .3;
var z = .4;
var point;
//https://threejs.org/docs/#Reference/Core/Raycaster
//https://threejs.org/docs/api/core/Raycaster.html
var raycaster = new THREE.Raycaster();
var raycaster2 = new THREE.Raycaster();
var emdrivemesh = [];

// constants
var STAR_COUNT = 1000;
var EMDRIVEMINDISTANCE = 3000;
var SUN_OPACITY = 8;
var STAR_MIN_DISTANCE = 3000;
var SUN_DENSITY = 1408;
var SPEED_OF_LIGHT = 2.99 * Math.pow(10, 8);
var SCALE_FACTOR = 100000;

function init() {
   // initialize three.js
   scene = new THREE.Scene();
   camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 12000);
   renderer = new THREE.WebGLRenderer();
   renderer.setSize(window.innerWidth, window.innerHeight);
   document.body.appendChild(renderer.domElement);
   camera.position.z = 1100;
   controls = new THREE.OrbitControls(camera);
   controls.damping = 0.2;
   scene.add(camera);
   //scene.add(dae);
   // initialize mesh and render
   simulation = new Object();
   simulation.isActive = true;
   simulation.steps = 0;
   simulation.startTime = new Date().getTime() / 1000;
   simulation.l = 1 / (SUN_OPACITY * SUN_DENSITY);
   initMesh();
   displayStats();
   displayHint();
   animate();
};
    
function animate() {
   // Defined in the RequestAnimationFrame.js file, this function
   // means that the animate function is called upon timeout:
   requestAnimationFrame(animate);
   //raycaster.set(mesh.photon.position, oldvector);
   render();
}
    
/**
* Initialize Mesh Objects 
*/

function initMesh() {
    // photon
    mesh = new Object();
    var gPhoton = new THREE.SphereGeometry(5, 8, 6);
    var mPhoton = new THREE.MeshBasicMaterial({ color: 0x2E66FF });
    mesh.photon = new THREE.Mesh(gPhoton, mPhoton);
    mesh.photon.position.x = 0;
    mesh.photon.position.y = 0;
    mesh.photon.position.z = 0;	
    //scene.add(mesh.photon);
    oldvector = getVector3(mesh.photon);
	
    // random background stars
    for (var i=0; i < STAR_COUNT; i++) {
        var gStar = new THREE.SphereGeometry(6, 8, 6);
        var mStar = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        var star = new THREE.Mesh(gStar, mStar);
        star.position.x = rnd();
        star.position.y = rnd();
        star.position.z = rnd();
        // if the star is very close to the sun it will 
        // not be added to the scene
        if (calc3dDistance(star) >= STAR_MIN_DISTANCE)
            scene.add(star);
    }
	
    var manager = new THREE.LoadingManager();
    var loader = new THREE.OBJLoader(manager);
    loader.load('EmDriveModel.obj', function(object) {
    object.traverse( function ( child ) {
	if ( child instanceof THREE.Mesh ) {
		console.log("instance");
		child.geometry.computeFaceNormals();
		child.material = new THREE.MeshBasicMaterial( { color: 0xCC9933, opacity: 0.9} ); // , transparent: true, opacity: 0.5
		child.material.side = THREE.DoubleSided;
	}

    } );
    emdrivemesh.push(object);
    object.scale.x = object.scale.y = object.scale.z = 5; 
    scene.add(object);
    });
    /*var raycasterUp = new THREE.Raycaster();
    raycasterUp.set(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 20, 0));
    var intersectsUp = raycasterUp.intersectObjects(emdrivemesh, true);
    faceUp = intersectsUp[0].face;
    var raycasterDown = new THREE.Raycaster();
    raycasterDown.set(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -20, 0));
    var intersectsDown = raycasterDown.intersectObjects(emdrivemesh, true);
    faceDown = intersectsDown[0].face;*/
}

//-----------------------------Photon Movement and propagation-------------------------------------------------------------

/**
* Process Simulation Frame
* This method proceeds one step of the simulation (60 steps will make 1 second on scene).
*/
/*function processSimulation() {
        simulation.steps++;
	console.log("1processSimulation");
	Intersection();
	if(dist > 29){
	    //move photons
	    oldvector = getVector3(mesh.photon);
	    mesh.photon.position.x += x;
            mesh.photon.position.y += y;
            mesh.photon.position.z += z;
	    var newVector = getVector3(mesh.photon); // get new position
            createLine(oldvector, newVector);
	}
	else {
	    //reset x,y,z values
	    //move photon
	    mesh.photon.position = intersectionpoint;
	    createLine(oldvector, newVector);
	    Intersection();
	    if(dist > 29)
	    {
	        mesh.photon.position.x += x;
            	mesh.photon.position.y += y;
            	mesh.photon.position.z += z;
		createLine(oldvector, newVector);
	    }
	    else{
		oldvector = getVector3(mesh.photon);
	    	mesh.photon.position = intersectionpoint;
	    	createLine(oldvector, newVector);
		oldvector = getVector3(mesh.photon);
		mesh.photon.position.x += x;
            	mesh.photon.position.y += y;
            	mesh.photon.position.z += z;
	    }
	}
	coordinate = 'X:' + mesh.photon.position.x + ' Y:' + mesh.photon.position.y + ' Z:' + mesh.photon.position.z;
    };
	
function Intersection(){
	raycaster.set(new THREE.Vector3((mesh.photon.position.x), (mesh.photon.position.y + y), (mesh.photon.position.z + z)), (new THREE.Vector3(mesh.photon.position.x, mesh.photon.position.y, mesh.photon.position.z)).normalize());
	createLine(new THREE.Vector3((mesh.photon.position.x), (mesh.photon.position.y + y), (mesh.photon.position.z + z)), (new THREE.Vector3((mesh.photon.position.x), (mesh.photon.position.y), (mesh.photon.position.z))).normalize());
	intersects = raycaster.intersectObjects(emdrivemesh, true);
	if(intersects.length == 0){
	    dist = 30;
	}
	else if(intersects.length > 0)
	{
	        dist = intersects.distance;
		intersectionpoint = getVector3(intersects.point);
		if((intersects.face == faceUp) || (intersects.face == faceDown)){
		    raycaster2.set(new THREE.Vector3(0, 0, (mesh.photon.y + y)), new THREE.Vector3(mesh.photon.x, mesh.photon.y, mesh.photon.z));
		    intersects2 = raycaster2.intersectObject(emdrivemesh, true);
		    dist = 20 - intersects2.distance;
		    y = -y;
		    if(intersects.face == faceUp)
			    intersectsTopCount += 1;
		    if(intersects.face == faceDown)
			    intersectsBottomCount += 1;
		}
		else{
		    raycaster2.set(new THREE.Vector3(mesh.photon.x, 0, mesh.photon.z), mesh.photon.position);
		    intersects2 = raycaster2.intersectObject(emdrivemesh, true);
		    dist = 20 - intersects2.distance;
		    x = -x;
		    z = -z;
		}
	}
	else
	{
	    console.log("ERROR");
	}
};*/

    /**
     * Calculate 3D From Scene Center Point(0, 0, 0)
     * 
     * @param {THREE.Mesh} mesh 
     * @return {Number}
     */
function calc3dDistance(mesh) {
        return Math.sqrt(Math.pow(mesh.position.x, 2) 
                + Math.pow(mesh.position.y, 2) + Math.pow(mesh.position.z, 2));
    };

    /**
     * Get a Vector3 Object From Mesh Position
     * 
     * @param {THREE.Mesh} mesh
     */
function getVector3(mesh) {
        return new THREE.Vector3(
            mesh.position.x,
            mesh.position.y,
            mesh.position.z
        );
    };

    /**
     * Create new line in order to display for the 
     * trajectory of the photon.
     * 
     * @param {THREE.Vector3} oldVector 
     * @param {THREE.Vector3} newVector 
     */
function createLine(oldVector, newVector) {
        var gLine = new THREE.Geometry();
        gLine.vertices.push(oldVector);
        gLine.vertices.push(newVector);
        var mLine = new THREE.LineBasicMaterial({ color: 0xC93434, linewidth: 1, transparent: true, opacity: 0.9 });
        var line = new THREE.Line(gLine, mLine);
        scene.add(line);
    };
   
  //-----------------------------Loop Program------------------------------------------------------------------------------
    
     /**
     * Render Loop
     */
function render() {
	requestAnimationFrame(render);
	if (simulation.isActive) {
		intersectionTopCount += Math.floor(Math.random() * (5 - 2 + 1)) + 2;
		intersectionBottomCount += Math.floor(Math.random() * (3 - 1 + 1)) + 1;
		console.log(intersectionTopCount);
		console.log(intersectionBottomCount);
		coordinate = 'Count Top:' + intersectionTopCount + 'Count Bottom:' + intersectionBottomCount;//processSimulation();
		var command = '<p style="color:purple;">Photon Moved</p>';
		updateStats(document.getElementById('statistics').innerHTML, command, coordinate);
	}
	renderer.render(scene, camera); 
    };
    
function simulationActive() {
	simulation.isActive = true;
	console.log("the simulation is active");
};
    /**
     * Pause Simulation
     */
    function pause() {
        simulation.isActive = false;
	displayStats();
	console.log('Simulation Ended');
    };

    /**
     * Resume Simulation
     */
    function resume() {
	init();
    };
    

  //-----------------------------Minor Functions--------------------------------------------------------------------------

    /**
     * Genera Random Number For Star Positioning
     * 
     * @return {Number}
     */
function rnd() {
        return Math.floor((Math.random() * 10000) - 5000);
    };
  //-----------------------------Data Section------------------------------------------------------------------------------  
    
    /**
     * Display Simulation Statistics
     *
     * This method is called when the photon reaces the surface
     * of the sun and it displays the simulation statistics (number
     * of steps, simulation time, photon real time in years etc ...)
     */
    function displayStats() {
        var html = '<p style="color:yellow;">Scene Created</p>' + '<p style="color:purple;">Photon Created</p>' + '<p style="color:green;">EmDrive Model Loaded</p>' + '<p style="color:white;">Press Start To Begin</p>';
        var div = document.createElement('div');
        div.innerHTML = html;
        document.getElementById('statistics').appendChild(div);
    };
    
    /**
     * Update Simulation Statistics
     *
     * This method is called when the simulation renders and it displays the simulation statistics
     */
    function updateStats(html, command, text) {
        var html2 = command + '<p style="color:yellow;">' + text + '</p>' + html;
        document.getElementById('statistics').innerHTML = html2;
    };
    
    /**
     * Display Viewport Hint
     */
    function displayHint() {
        var html = '<strong>Use your mouse to change the view.</strong>';
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = '10px';
        div.style.right = '10px';
        div.style.padding = '10px';
        div.style.font = '11px arial, helvetica';
        div.style.color= '#FFF';
        div.innerHTML = html;
        document.body.appendChild(div);
    };

