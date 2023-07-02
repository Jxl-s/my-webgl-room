import * as THREE from "three";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

function setOutlinePass(composer, params) {
    const outlinePass = new OutlinePass(
        new THREE.Vector2(800, 600),
        params.scene,
        params.camera
    );

    outlinePass.edgeStrength = 10;
    outlinePass.edgeGlow = 0;
    outlinePass.edgeThickness = 1;
    
    // Set colors
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set("#ffffff");
    outlinePass.hiddenEdgeColor.set("#777777");

    composer.outlinePass = outlinePass;
    composer.object.addPass(outlinePass);
}

export default function (composer, params) {
    setOutlinePass(composer, params);
}
