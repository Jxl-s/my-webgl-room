// JSON
import resources from "../resources.json";

// Objects
import Camera from "./Camera";
import Renderer from "./Renderer";
import Resources from "./Resources";
import Sizes from "./Sizes";

// Post-processing
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";

import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";

import * as THREE from "three";
import * as CANNON from "cannon-es";
import Composer from "./Composer";

class Experience {
    static instance = null;

    constructor(params) {
        if (Experience.instance) {
            return Experience.instance;
        }

        Experience.instance = this;
        this.params = params;
        this.canvas = params.canvas;

        // Classes
        this.sizes = new Sizes();
        this.resources = new Resources(resources);

        // Renderer and camera
        this.renderer = new Renderer({
            canvas: this.canvas,
            sizes: this.sizes,
        });

        this.camera = new Camera({
            sizes: this.sizes,
        });

        // Scene
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.controllers = [];

        // Post-processing
        if (params.useComposer) {
            this.composer = new Composer({
                renderer: this.renderer.object,
                scene: this.scene,
                camera: this.camera.object,
                sizes: this.sizes,
            });
        }

        // Listen to size changes
        this.sizes.on("resize", () => {
            this.renderer.resize();
            this.camera.resize();

            this.composer?.resize();
        });

        // Physics
        if (params.usePhysics) {
            this.world = new CANNON.World();
            this.world.gravity.set(0, -9.82, 0);
        }

        // Load the resources
        this.resources.on("progress", (loaded, total) => {
            console.log(`${loaded} / ${total} resources loaded`);
        });

        // Wait for resources to be ready
        this.resources.on("ready", () => {
            console.log("Resources loaded!");

            // Wait for controllers to be loaded
            import("../Controllers").then((c) => {
                const controllers = Object.values(c);

                for (const controller of controllers) {
                    const instance = new controller();
                    instance.Init();

                    this.controllers.push(instance);
                }

                for (const controller of this.controllers) {
                    controller.Start();
                }

                window.requestAnimationFrame(() => this.tick());
            });
        });

        this.resources.load();
    }

    tick() {
        const deltaTime = this.clock.getDelta();

        // Physics
        if (this.params.usePhysics) this.world.step(deltaTime);

        // Update controllers
        for (const controller of this.controllers) {
            controller.Update(deltaTime);
        }

        // Render
        if (this.params.useComposer) {
            this.composer.render();
        } else {
            this.renderer.object.render(this.scene, this.camera.object);
        }

        window.requestAnimationFrame(() => this.tick());
    }
}

export default Experience;
