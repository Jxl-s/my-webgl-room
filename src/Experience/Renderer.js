import * as THREE from "three";

class Renderer {
    constructor(params) {
        this.canvas = params.canvas;
        this.sizes = params.sizes;

        // Object
        this.object = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        this.object.setSize(this.sizes.width, this.sizes.height);
        this.object.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    resize() {
        this.object.setSize(this.sizes.width, this.sizes.height);
        this.object.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

export default Renderer;
