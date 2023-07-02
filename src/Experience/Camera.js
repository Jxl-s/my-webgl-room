import * as THREE from "three";

class Camera {
    constructor(params) {
        this.sizes = params.sizes;

        // Object
        this.object = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            0.1,
            100
        );
    }

    resize() {
        this.object.aspect = this.sizes.width / this.sizes.height;
        this.object.updateProjectionMatrix();
    }
}

export default Camera;
