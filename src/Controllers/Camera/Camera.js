import Controller from "../Controller";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class CameraController extends Controller {
    Start() {
        // Move back the camera a little
        const cameraObject = this.experience.camera.object;
        cameraObject.position.set(15, 7, -7);

        this.controls = new OrbitControls(cameraObject, this.experience.canvas);
        this.controls.enableDamping = true;
    }

    Update() {
        this.controls.update();
    }
}

export default CameraController;