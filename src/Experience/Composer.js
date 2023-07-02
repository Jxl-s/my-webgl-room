import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import loadPasses from "../Config/Passes";

class Composer {
    static instance = null;

    constructor(params) {
        if (Composer.instance) {
            return Composer.instance;
        }

        Composer.instance = this;

        this.renderer = params.renderer;
        this.sizes = params.sizes;

        const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
            samples: 2,
            colorSpace: THREE.SRGBColorSpace,
            format: THREE.RGBAFormat,
        });

        this.object = new EffectComposer(this.renderer, renderTarget);

        // Sizes
        this.object.setSize(this.sizes.width, this.sizes.height);
        this.object.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Anti-aliasing
        if (
            this.renderer.getPixelRatio() === 1 &&
            this.renderer.capabilities.isWebGL2
        ) {
            const smaaPass = new SMAAPass(this.sizes.width, this.sizes.height);
            this.object.addPass(smaaPass);
        }

        // Color correction
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

        // Render pass
        const renderPass = new RenderPass(params.scene, params.camera);

        this.renderPass = renderPass;
        this.object.addPass(renderPass);

        // Load all other passes
        loadPasses(this, {
            scene: params.scene,
            camera: params.camera,
        });

        this.gammaCorrectionPass = gammaCorrectionPass;
        this.object.addPass(gammaCorrectionPass);
    }

    render() {
        return this.object.render();
    }

    addPass(pass) {
        return this.object.addPass(pass);
    }

    resize() {
        this.object.setSize(this.sizes.width, this.sizes.height);
        this.object.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

export default Composer;
