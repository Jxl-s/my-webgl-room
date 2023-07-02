import * as THREE from "three";
import { gsap } from "gsap";
import Controller from "../Controller";
import Composer from "../../Experience/Composer";
import CameraController from "../Camera/Camera";

const options = {
    screenOffColor: new THREE.Color(0x000000),
    screenOnColor: new THREE.Color(0xffffff),
};

class MainController extends Controller {
    Start() {
        // Make a raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Load the room
        this.roomModel = this.experience.resources.get("roomModel");

        const roomTexture = this.experience.resources.get("roomTexture");
        roomTexture.flipY = false;
        roomTexture.colorSpace = THREE.SRGBColorSpace;

        const roomMaterial = new THREE.MeshBasicMaterial({
            map: roomTexture,
        });

        this.roomModel.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = roomMaterial;
            }
        });

        // Load the screen materials
        this.loadScreenMaterials();
        this.loadGlassMaterial();

        this.loadSelections();

        const onMouseMove = (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(
                this.mouse,
                this.experience.camera.object
            );

            this.checkSelections();
        };

        const onClick = (event) => {
            // Do the move checks (in case mobile)
            onMouseMove(event);

            if (this._selectedName !== "") {
                // Do the cool stuff
                if (this._selectedName === "BoxCover") {
                    this.onBoxClick();
                }

                if (this._selectedName === "ScreenA") {
                    this.onScreenAClick();
                }

                if (this._selectedName === "ScreenB") {
                    this.onScreenBClick();
                }
            }
        };

        const onEscape = (event) => {
            if (event.key !== "Escape") return;
            // restore any camera
            const camera = this.experience.camera.object;
            const cameraController = Controller.get(CameraController);
            const controls = cameraController.controls;

            gsap.to(camera.position, {
                duration: 1,
                x: 15,
                y: 7,
                z: -7,
                ease: "power2.out",
            });

            gsap.to(controls.target, {
                duration: 1,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.out",
            });

            // Close the other ones
            if (this._boxOpen) {
                this.onBoxClose();
            }

            if (this._screenAOpen) {
                this.onScreenAClose();
            }

            controls.enabled = true;
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onMouseMove);

        window.addEventListener("click", onClick);
        window.addEventListener("touchstart", onClick);

        window.addEventListener("keydown", onEscape);

        this.experience.scene.add(this.roomModel.scene);
    }

    loadScreenMaterials() {
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: options.screenOffColor,
        });

        const screenA = this.roomModel.scene.getObjectByName("ScreenA");
        const screenB = this.roomModel.scene.getObjectByName("ScreenB");

        screenA.material = screenMaterial;
        screenB.material = screenMaterial.clone();
    }

    loadGlassMaterial() {
        const glassMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
        });

        const caseGlass = this.roomModel.scene.getObjectByName("CaseGlass");
        caseGlass.material = glassMaterial;
    }

    loadSelections() {
        this._outlinePass = new Composer().outlinePass;
        this._selectedItems = [];

        const screenA = this.roomModel.scene.getObjectByName("ScreenA");
        const baseA = this.roomModel.scene.getObjectByName("Base");

        const screenB = this.roomModel.scene.getObjectByName("ScreenB");
        const baseB = this.roomModel.scene.getObjectByName("Base001");

        const boxCover = this.roomModel.scene.getObjectByName("SmallBoxHead");

        const bedShelfA = this.roomModel.scene.getObjectByName("Cube020");
        const bedShelfB = this.roomModel.scene.getObjectByName("Cube021");

        this._screenAItems = [screenA, baseA];
        this._screenBItems = [screenB, baseB];
        this._boxCoverItems = [boxCover];

        this._bedShelfAItems = [bedShelfA];
        this._bedShelfBItems = [bedShelfB];
    }

    checkSelections() {
        const screenAIntersects = this.raycaster.intersectObjects(
            this._screenAItems
        );
        const screenBIntersects = this.raycaster.intersectObjects(
            this._screenBItems
        );

        const boxCoverIntersects = this.raycaster.intersectObjects(
            this._boxCoverItems
        );

        const bedShelfAIntersects = this.raycaster.intersectObjects(
            this._bedShelfAItems
        );
        const bedShelfBIntersects = this.raycaster.intersectObjects(
            this._bedShelfBItems
        );

        let selectedName = "";

        if (screenAIntersects.length > 0) {
            this._selectedItems = this._screenAItems;
            selectedName = "ScreenA";
        }

        if (screenBIntersects.length > 0) {
            this._selectedItems = this._screenBItems;
            selectedName = "ScreenB";
        }

        if (boxCoverIntersects.length > 0) {
            this._selectedItems = this._boxCoverItems;
            selectedName = "BoxCover";
        }

        if (bedShelfAIntersects.length > 0) {
            this._selectedItems = this._bedShelfAItems;
            selectedName = "BedShelfA";
        }

        if (bedShelfBIntersects.length > 0) {
            this._selectedItems = this._bedShelfBItems;
            selectedName = "BedShelfB";
        }

        if (selectedName !== "") {
            // change the cursor
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
            this._selectedItems = [];
        }

        this._selectedName = selectedName;
        this._outlinePass.selectedObjects = this._selectedItems;
    }

    onBoxClick() {
        if (this._boxOpen === undefined) {
            this._boxOpen = false;
            this._boxOriginalPosition = this._boxCoverItems[0].position.clone();
        }

        this._boxOpen = !this._boxOpen;

        const camera = this.experience.camera.object;
        const cameraController = Controller.get(CameraController);
        const controls = cameraController.controls;

        if (this._boxOpen) {
            controls.enabled = false;
            gsap.to(this._boxCoverItems[0].position, {
                y: this._boxOriginalPosition.y + 2,
                duration: 1,
                ease: "power2.out",
            });

            gsap.to(camera.position, {
                x: this._boxCoverItems[0].position.x,
                y: this._boxCoverItems[0].position.y + 1,
                z: this._boxCoverItems[0].position.z + 1,
                duration: 1,
                ease: "power2.out",
            });

            gsap.to(controls.target, {
                x: this._boxCoverItems[0].position.x,
                y: this._boxCoverItems[0].position.y - 20,
                z: this._boxCoverItems[0].position.z,
                duration: 1,
                ease: "power2.out",
            });
        } else {
            this.onBoxClose();
        }
    }

    onBoxClose() {
        this._boxOpen = false;
        gsap.to(this._boxCoverItems[0].position, {
            y: this._boxOriginalPosition.y,
            duration: 1,
            ease: "power2.out",
        });
    }

    onScreenAClick() {
        if (this._screenAOpen === undefined) {
            this._screenAOpen = false;
        }

        this._screenAOpen = !this._screenAOpen;

        const screenA = this.roomModel.scene.getObjectByName("ScreenA");

        if (this._screenAOpen) {
            gsap.to(screenA.material.color, {
                r: options.screenOnColor.r,
                g: options.screenOnColor.g,
                b: options.screenOnColor.b,
                duration: 1,
            });

            // move the camera to the pc
            const camera = this.experience.camera.object;
            const cameraController = Controller.get(CameraController);
            const controls = cameraController.controls;

            controls.enabled = false;

            gsap.to(camera.position, {
                x: screenA.position.x - 1,
                y: screenA.position.y,
                z: screenA.position.z - 1.5,
                duration: 1,
                ease: "power2.out",
            });

            gsap.to(controls.target, {
                x: screenA.position.x,
                y: screenA.position.y,
                z: screenA.position.z,
                duration: 1,
                ease: "power2.out",
            });
        } else {
            gsap.to(screenA.material.color, {
                r: options.screenOffColor.r,
                g: options.screenOffColor.g,
                b: options.screenOffColor.b,
                duration: 1,
            });
        }
    }

    onScreenAClose() {}

    onScreenBClick() {
        if (this._screenBOpen === undefined) {
            this._screenBOpen = false;
        }

        this._screenBOpen = !this._screenBOpen;

        const screenB = this.roomModel.scene.getObjectByName("ScreenB");

        if (this._screenBOpen) {
            gsap.to(screenB.material.color, {
                r: options.screenOnColor.r,
                g: options.screenOnColor.g,
                b: options.screenOnColor.b,
                duration: 1,
            });

            // move the camera to the pc
            const camera = this.experience.camera.object;
            const cameraController = Controller.get(CameraController);
            const controls = cameraController.controls;

            controls.enabled = false;

            gsap.to(camera.position, {
                x: screenB.position.x - 0.5,
                y: screenB.position.y,
                z: screenB.position.z - 2,
                duration: 1,
                ease: "power2.out",
            });

            gsap.to(controls.target, {
                x: screenB.position.x,
                y: screenB.position.y,
                z: screenB.position.z,
                duration: 1,
                ease: "power2.out",
            });
        } else {
            gsap.to(screenB.material.color, {
                r: options.screenOffColor.r,
                g: options.screenOffColor.g,
                b: options.screenOffColor.b,
                duration: 1,
            });
        }
    }
}

export default MainController;
