self.THREE = require('three');
const OrbitControls = require('three/examples/js/controls/orbitcontrols');
const OBJLoader = require('three/examples/js/loaders/objloader');
const MTLLoader = require('three/examples/js/loaders/mtlloader');
const TweenLite = require('gsap').TweenLite;
const __s__ = require('../utils/js-helpers.js');
const __d__ = require('../utils/dom-utilities.js');

//Class Renderer3D
export class Renderer3D {

    constructor(parent, w, h) {
        this.scene = null;
        this.renderer = null;
        this.camera = null; 
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        this.controls = null;

        this.parent = parent;
        this.container = parent._node;
        this.width = w;
        this.height = h;
        this.frames = 0;

        this._INTERSECTED = null;
        this.followMouseEvents = false;

        this.mouseStart = new THREE.Vector2();
        this.mouseLastClick = new Date();

        this._isTakingScreenshot = false;
        this._floatingCamera = true;
        this._modelsLoaded = {};
    }

    init() {
        let me = this,
            material,
            light,
            lightsGroup,
            mesh,
            options = this.parent.options;

        function prepareDirectionalLight(x, y, z) {
            let ll = new THREE.DirectionalLight(0xffffff, 0.35);
            ll.position.set(x, y, z);
            ll.castShadow = true;
            ll.shadow.camera.left = -19;
            ll.shadow.camera.right = 19;
            ll.shadow.camera.top = 19;
            ll.shadow.camera.bottom = -19;
            ll.shadow.camera.far = 500;
            ll.shadow.camera.near = 1;
            
            return ll;
        }
        
        if (this.container === null || this.container === undefined) { console.error("Container is null. Halting."); return; }
        if (!this.width) { console.error("Width is null or zero. Halting."); return; }
        if (!this.height) { console.error("Height is null or zero. Halting."); return; }
        
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        //this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMapSoft = true;
        this.renderer.setClearColor(options.colors.background, 1);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.container.divRenderC.appendChild(this.renderer.domElement);
        
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 1, 1000);
        this.camera.position.z = options.initialCameraPosition.z;
        this.camera.position.x = options.initialCameraPosition.x;
        this.camera.position.y = options.initialCameraPosition.y;
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = options.dampingFactor || 0.2;
        this.controls.minPolarAngle = Math.PI / 8;
        this.controls.maxPolarAngle = Math.PI / 8 * 7;
        this.controls.maxDistance = options.initialCameraPosition.z * 2;
        this.controls.minDistance = options.initialCameraPosition.z / 2;
        this.controls.enableKeys = false;
        this.controls.enablePan = false;
        this.controls.enabled = this.parent._freeMove;
        
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();

        lightsGroup = new THREE.Group();
        
        light = prepareDirectionalLight(-200, 300, -200);
        lightsGroup.add(light);

        light = prepareDirectionalLight(200, 300, -200);
        lightsGroup.add(light);
                    
        light = prepareDirectionalLight(200, 300, 200);
        lightsGroup.add(light);  

        light = prepareDirectionalLight(-200, 300, 200);
        lightsGroup.add(light);              
        
        light = new THREE.DirectionalLight(0xf8f7ee, 0.15);
        light.position.set(0, -300, -50);
        lightsGroup.add(light);

        this.lightsGroup = lightsGroup;              
                    
        light = new THREE.AmbientLight(options.colors.sunlight, 0.7);
        //light.castShadow = true;
        this.scene.add(light);
        this.scene.add(lightsGroup);

        __d__.addEventLnr(window, "keydown", function(e){
            let ic = me.parent.options.initialCameraPosition;
            switch(e.keyCode) {
                case 27:
                    if(me._floatingCamera) {
                        me._floatingCamera = false;
                        setTimeout(function() {me._floatingCamera = true;}, 1000);
                    }
                    TweenLite.to(me.camera.position, 0.9, {x: ic.x, y: ic.y, z:ic.z, ease: Power2.easeInOut});
                    break;  
                case 80:
                    me._floatingCamera = !me._floatingCamera;
                    break;                              
            }
        });
    }

    resize3DViewer (w, h) {
        if (!this.camera) { return; }
        this.width = w;
        this.height = h; 
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w , h);            
    }

    loadModel(mainScene, modelFilesDir, modelFilesMtl, modelFilesObj) {

        let that = this,
            node = this.container,
            loadDiv = node.loadingDiv,
            options = this.parent.options,
            mats, mesh, rt, cm, loader, mtlLoader, objLoader, 
            
            onProgress = function (xhr) {
                let percentComplete = xhr.loaded / (xhr.total || 3000000);
                loadDiv.updateLoader(percentComplete, 0.3);
            },
            onLoaded = function(fileObj) {
                let ev = __d__.addEventDsptchr("modelLoaded");

                //Dispatch event
                ev.data = { model: fileObj };
                node.dispatchEvent(ev);

                //Finish the loading div
                loadDiv.updateLoader(1, 0.5);
                
                //Hide the loading div
                setTimeout(function() {
                    loadDiv.hide();
                }, 500);
                
            };

        return new Promise(
            function(resolve, reject) {
                let modelName = modelFilesObj.replace(".", "_");

                if (that._modelsLoaded[modelName]) {
                    resolve(modelName); return;
                }

                loadDiv = that.container.loadingDiv;
                loadDiv.setPercentage(0);
                loadDiv.setMessage("Loading model...");
                loadDiv.show();
                
                mtlLoader = new THREE.MTLLoader();
                mtlLoader.setBaseUrl(modelFilesDir + "textures/");
                mtlLoader.setPath(modelFilesDir);
                mtlLoader.load(modelFilesMtl, function(materials) {
                    let cm, loader;

                    materials.preload();

                    objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(modelFilesDir + modelFilesObj, function (object) {
                        let m, mesh = new THREE.Object3D();
                        //Iterate the 3D Model
                        object.traverse(function (child) {
                            m = new THREE.Mesh(child.geometry, child.material);
                            m.name = child.name;
                            m.receiveShadow = true;
                            m.castShadow = true;
                            mesh.add(m);
                        });

                        //Add it to a Map of models
                        that._modelsLoaded[modelName] = mesh;
                        onLoaded();
                        resolve(modelName);
                        return;
                    }, 
                    onProgress, 
                    function (xhr) { 
                        window.alert('An error happened loading assets');
                        console.error(xhr);
                        reject();
                    });         
                });
            }
        );
  
    }

    animate() {
        var me = this;
        
        function anim() {
            requestAnimationFrame(anim);            
            me.controls.update();
            me.render();
        }
        anim();            
    }

    render() {
        let delta = Math.sin(Date.now() * 0.00005) * 0.005;

        if (this._isTakingScreenshot) { return; }

        this.frames += 1;

        if (this._floatingCamera) {
            this.camera.position.z += delta;
            this.camera.position.x += delta;
        }

        this.renderer.render(this.scene, this.camera);
    }

}