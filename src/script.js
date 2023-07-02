import Experience from "./Experience/Experience";

window.experience = new Experience({
    canvas: document.querySelector("canvas.webgl"),
    useComposer: true,
    usePhysics: false,
});
