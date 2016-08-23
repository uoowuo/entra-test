const scene = require('../core/scene.js');
const __s__ = require('../utils/js-helpers.js');
const __d__ = require('../utils/dom-utilities.js');

const node = document.getElementById("app-3d"),
    t = new scene.Scene(
        node,
        {
            models: [
                {
                    fileObj: "Ring.obj",
                    fileMtl: "Ring.mtl",
                    filesDir: "./3dobjects/",
                    scale: {x: 0.22, y: 0.22, z: 0.22 },
                    position: {x: -0.5, y: -1.3, z: 0 },
                    rotation: {x: 0, y: Math.PI / 3, z: 0 },
                    texturesMap:  {
                        "Big_Ring": new THREE.MeshPhongMaterial({ color: 0xd3b371, shininess: 100 }),
                        "Small_Ring": new THREE.MeshPhongMaterial({ color: 0xeeeeee, shininess: 100 })
                    }
                }
            ]
        }
    );

// console.log(t);

__d__.addEventLnr(node, "modelLoaded", function(ev) {

    console.log(ev);

});