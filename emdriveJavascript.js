var inst = this;
var dae;
var loader;
var scene;
var camera;
var controls;
var renderer;
var mesh;
var simulation;
var scene;
var mesh; 
    
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load('EmDriveModel.dae', function ( collada ) 
{ 
    dae = collada.scene; 
    dae.traverse( function ( child ) {
					if ( child instanceof THREE.SkinnedMesh ) {
						var animation = new THREE.Animation( child, child.geometry.animation );
						animation.play();
					}
				} );
    dae.scale.x = dae.scale.y = dae.scale.z = .1; 
    dae.updateMatrix();
    init();
    animate();
});

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
   scene.add(camera)
   scene.add(dae);

   // initialize mesh and render
   simulation = new Object();
   simulation.isActive = false;
   simulation.steps = 0;
   simulation.startTime = new Date().getTime() / 1000;
   simulation.l = 1 / (SUN_OPACITY * SUN_DENSITY);
   initMesh();
   displayHint();
};
    
function animate() {
   // Defined in the RequestAnimationFrame.js file, this function
   // means that the animate function is called upon timeout:
   requestAnimationFrame(animate);
   render();
}
    
//-----------------------------Photon Movement and propagation--------------------------
/**
* Initialize Mesh Objects 
*/

function initMesh() {
    // photon
    mesh = new Object();
    var gPhoton = new THREE.SphereGeometry(5, 8, 6);
    var mPhoton = new THREE.MeshBasicMaterial({ color: 0x2E66FF });
    mesh.photon = new THREE.Mesh(gPhoton, mPhoton);
    scene.add(mesh.photon);
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
}

/**
* Process Simulation Frame
*
* This method proceeds one step of the simulation (60 steps will make 1 second on scene).
*/
function processSimulation() {
        simulation.steps++
        var oldVector = getVector3(mesh.photon); // get old position

        var pxl = inst.simulation.l * SCALE_FACTOR;
        var theta = 2 * Math.PI * Math.random();
        var phi = Math.PI - 2 * Math.PI * Math.random();
        mesh.photon.position.x += pxl * Math.sin(phi) * Math.cos(theta);
        mesh.photon.position.y += pxl * Math.sin(phi) * Math.sin(theta);
        mesh.photon.position.z += pxl * Math.cos(phi);

        var newVector = getVector3(mesh.photon); // get new position
        createLine(oldVector, newVector);

        dist = calc3dDistance(mesh.photon);
        if (dist > 3000) {
            console.log('Simulation Ended'); // stop simulation and print data
            simulation.isActive = false;
            simulation.endTime = new Date().getTime() / 1000;
            displayStats();
        }   
    };

    /**
     * Genera Random Number For Star Positioning
     * 
     * @return {Number}
     */
function rnd() {
        return Math.floor((Math.random() * 10000) - 5000);
    };


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
   
  //-----------------------------Loop Program------------------------------------
    
     /**
     * Render Loop
     */
function render() {
        requestAnimationFrame(render);
        if (simulation.isActive)
            processSimulation();
            updateStats();
        renderer.render(scene, camera);
    };
    
    /**
     * Pause Simulation
     */
    function pause() {
        simulation.isActive = false;
    };

    /**
     * Resume Simulation
     */
    function resume() {
        simulation.isActive = true;
    };
    
  //-----------------------------Data Section------------------------------------  
    
    /**
     * Display Simulation Statistics
     *
     * This method is called when the photon reaces the surface
     * of the sun and it displays the simulation statistics (number
     * of steps, simulation time, photon real time in years etc ...)
     */
    function displayStats() {
        var html = 
            '<strong>Simulation Results</strong><br>' +
            'Duration: ' + Number(simulation.endTime - simulation.startTime).toFixed(2) + 's<br>' +
            'Total Steps: ' + simulation.steps + '<br>' +
            'Escape Time: ' + Math.round(48.32 * simulation.steps * simulation.l / Math.pow(0, 2)) + ' Years';

        var div = document.createElement('div');
        div.innerHTML = html;
        document.getElementById('statistics').appendChild(div);
    };
    
    /**
     * Update Simulation Statistics
     *
     * This method is called when the simulation renders and it displays the simulation statistics
     */
    function updateStats() {
        var html = 
            '<strong>Simulation Results</strong><br>' +
            'Duration: ' + Number(simulation.endTime - simulation.startTime).toFixed(2) + 's<br>' +
            'Total Steps: ' + simulation.steps + '<br>' +
            'Escape Time: ' + Math.round(48.32 * simulation.steps * simulation.l / Math.pow(0, 2)) + ' Years';
        document.getElementById('statistics').innerHTML = html;
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

