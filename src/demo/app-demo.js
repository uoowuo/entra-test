(function (globals) {
    'use strict';

    const scene = require('../core/scene.js');
    const __s__ = require('../utils/js-helpers.js');
    const __d__ = require('../utils/dom-utilities.js');

    // Get viewport element and create the scene in it, scaling it down on vertical screens
    const viewElement = document.getElementById("app-3d");
    var scaleFactor;
    if(viewElement.clientWidth / viewElement.clientHeight < 1) {
        scaleFactor = viewElement.clientWidth / viewElement.clientHeight;
    } else {
        scaleFactor = 1;
    }
    const t = new scene.Scene(
        viewElement,
        {
            models: [
                {
                    fileObj: "Ring.obj",
                    fileMtl: "Ring.mtl",
                    filesDir: "./3dobjects/",
                    scale: {x: 0.22 * scaleFactor, y: 0.22 * scaleFactor, z: 0.22 * scaleFactor },
                    position: {x: -0.5 * scaleFactor, y: -1.4 * scaleFactor, z: 0 },
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

    __d__.addEventLnr(viewElement, "modelLoaded", function(ev) {

        console.log(ev);

    });

}(self));