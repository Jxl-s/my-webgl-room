import EventEmitter from "../Util/EventEmitter";

class Sizes extends EventEmitter {
    constructor() {
        super();

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.trigger("resize");
        });
    }
}

export default Sizes;
