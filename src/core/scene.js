self.THREE = require('three');
const Detector = require('three/examples/js/detector');
const __s__ = require('../utils/js-helpers.js');
const __d__ = require('../utils/dom-utilities.js');
const Preloader = require('../utils/preloader.js').default;
const Renderer = require('./renderer.js');

//Class Scene
export class Scene {

    constructor (node, opts) {

        let me = this;
        const version = 0.1;

        this.options = __s__.extend({
            loaderColor: "#dddddd",
            loaderColorSucess: "#bbbbbb",
            colors: { background: 0x8081b1, sunlight: 0xe2e2ee },
            dampingFactor: 0.2,
            models: [],
            initialCameraPosition: {x: 0, y:0, z: 8},
            screenshots : { width: 600, height: 600, format: "png", transparent: true }
        }, opts);

        let ic = this.options.initialCameraPosition;
        this._cameraPosition = new THREE.Vector3(ic.x, ic.y, ic.z);
        
        this.width = 0;
        this.height = 0;

        this._node = (function createDomElements() {
            let divMainC, divRenderC, divLloadingC, divLoadingText;
            
            //Main DOM element
            divMainC = document.createElement("div");
            divMainC.className = "app3d-container";
            divMainC.id = "app3d-container-" + Math.round(Math.random() * 100000);
            
            //Renderer container
            divRenderC = document.createElement("div");
            divRenderC.className = "app3d-render-container";
            divRenderC.id = divMainC.id + "-render";
            divMainC.appendChild(divRenderC);
            divMainC.divRenderC = divRenderC;
            
            //Loading div
            divLloadingC = document.createElement("div");
            divLloadingC.className = "app3d-loading-div";
            divLloadingC.id = divMainC.id + "-loading-div";
            divMainC.appendChild(divLloadingC);
            
            //Loading text inside loading div
            divLoadingText = document.createElement("div");
            divLoadingText.className = "app3d-loading-div-text";
            divLoadingText.id = divMainC.id + "-loading-text";
            divLloadingC.appendChild(divLoadingText);
            
            //initialize loader functions
            divMainC.loadingDiv = new Preloader(divLloadingC, divLoadingText, 70, me.options, "img-loader-logo");
            
            //Append to DOM element
            node.appendChild(divMainC);
            
            return divMainC;
  
        }());  

        this.renderer3d = null;
        this.init();
        
    }//constructor

    init() {
        let me = this, j, lenJ, mod,
            node = this._node,
            hasWebGL = Detector.canvas && Detector.webgl;

        if (!hasWebGL) {
            node.loadingDiv.show();
            node.loadingDiv.setMessage(node.parentNode.getAttribute(!window.WebGLRenderingContext ? "data-gpu" : "data-webgl"));
            return;
        }

        this.updateSize();
        this.renderer3d = new Renderer.Renderer3D(this, this.width, this.height);

        __d__.addEventLnr(window, "resize", function() { 
            me.updateSize(); 
        } );

        this.renderer3d.init();
        this.renderer3d.animate();

        //Load models
        var toLoad = {};
        for (j = 0, lenJ = this.options.models.length; j < lenJ; j += 1) {
            mod = this.options.models[j];
            if (toLoad[mod.fileObj]) { continue; }
            
            toLoad[mod.fileObj] = true;

            this.renderer3d.loadModel(me, mod.filesDir, mod.fileMtl, mod.fileObj)
                .then(function(fileObj) {
                    me.createMeshesOfModel(fileObj);
                });
        } 

    }

    createMeshesOfModel(fileObj) {
        let me = this,
            nameModel = fileObj.replace(".", "_"),
            j, lenJ, 
            mod, models = this.options.models;

        //Create Meshes
        for (j = 0, lenJ = models.length; j < lenJ; j += 1) {
            mod = models[j];
            let mesh = this.insertModel(mod.fileObj, mod.position, mod.rotation, mod.scale);
            if (mesh) {
                mesh.traverse(function (child) {
                    let cm = mod.texturesMap[child.name];
                    if (cm) {
                        child.material = cm.clone();
                        child.material.needsUpdate = true;
                    }
                });                
                this.renderer3d.scene.add(mesh);
            }           
        }
    }

    insertModel(modelFileObj,
        position = new THREE.Vector3(0,0,0), 
        rotation = new THREE.Vector3(0,0,0), 
        scale = new THREE.Vector3(1,1,1)) {

        let nameModel = modelFileObj.replace(".", "_"),
            obj = this.renderer3d._modelsLoaded[nameModel];

        if (obj) {
            let mesh = obj.clone();
            
            mesh.position.x = position.x;
            mesh.position.y = position.y;
            mesh.position.z = position.z;
            mesh.rotation.x = rotation.x;
            mesh.rotation.y = rotation.y;
            mesh.rotation.z = rotation.z;
            mesh.scale.x = scale.x;
            mesh.scale.y = scale.y;
            mesh.scale.z = scale.z;
            
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;

            return mesh;
        } else {
            console.error(nameModel + " not found");
            return null;
        }

    }

    getDimensions() {
        return { width: this.width, height: this.height };  
    }

    setDimensions(w, h) {
        this.width = w;
        this.height = h;
    }

    updateSize() {
        let  divMainC, par, ev,
            dim, w, h;

        divMainC = this._node;
        par = divMainC.parentNode;

        if (par === null || par === undefined) { return; }
        
        dim = this.getDimensions();
        w = par.offsetWidth;
        h = par.offsetHeight;
        
        if (dim.width !== w || dim.height !== h) {
            divMainC.style.width = w + "px";
            divMainC.style.height = h + "px";
            if (this.renderer3d) { this.renderer3d.resize3DViewer(w, h); }
            this.setDimensions(w, h);

            ev = __d__.addEventDsptchr("resize");
            this._node.dispatchEvent(ev);                
        }      
    }

    

    //Generate screenshots
    //Returns an image/data format
    generateScreenshot(
        width = this.options.screenshots.width,
        height = this.options.screenshots.height,
        format = this.options.screenshots.format,
        transparent = this.options.screenshots.transparent) {

        //...

        return data;
    }
      
}