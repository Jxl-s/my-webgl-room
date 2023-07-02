import Experience from "../Experience/Experience";

class Controller {
    static controllers = [];

    Init() {}
    Start() {}
    Update() {}

    constructor() {
        Controller.controllers.push(this);
        this._experience = new Experience();
    }

    get experience() {
        return this._experience;
    }

    static get(type) {
        return this.controllers.find((controller) => controller instanceof type);
    }
}

export default Controller;