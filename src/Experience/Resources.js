import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import EventEmitter from "../Util/EventEmitter";

class Resources extends EventEmitter {
    constructor(resources) {
        super();

        this.items = {};

        // Loader config
        this.resources = resources;
        this.loaded = 0;

        if (this.resources.length === 0) {
            setTimeout(() => this.trigger("ready"));
        }
    }

    load() {
        // Texture loader
        const textureLoader = new THREE.TextureLoader();

        // GLTF & Draco loader
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        gltfLoader.setDRACOLoader(dracoLoader);

        for (const resource of this.resources) {
            if (resource.type === "Texture") {
                textureLoader.load(resource.path, (texture) => {
                    this.onLoaded(resource, texture);
                });
            }

            if (resource.type === "GLTF") {
                gltfLoader.load(resource.path, (gltf) => {
                    this.onLoaded(resource, gltf);
                });
            }
        }
    }

    onLoaded(resource, object) {
        this.items[resource.name] = object;
        this.loaded++;

        this.trigger("progress", [this.loaded, this.resources.length]);

        if (this.loaded === this.resources.length) {
            this.trigger("ready");
        }
    }

    get(name) {
        return this.items[name];
    }
}

export default Resources;
