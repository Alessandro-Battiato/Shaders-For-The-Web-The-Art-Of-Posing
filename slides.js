const paintings = [
    { src: "image1.jpg", title: "1 / 6" },
    { src: "image2.jpg", title: "2 / 6" },
    { src: "image3.jpg", title: "3 / 6" },
    { src: "image4.jpg", title: "4 / 6" },
    { src: "image5.jpg", title: "5 / 6" },
    { src: "image6.jpg", title: "6 / 6" },
];

const prevTag = document.querySelector("nav a.prev"); // select nav's anchor tag with prev class
const nextTag = document.querySelector("nav a.next"); // select nav's anchor tag with next class
const descriptionTag = document.querySelector("header div");

const canvas = document.querySelector("div.canvas-holder canvas");
const sandbox = new GlslCanvas(canvas);
sandbox.load(frag(paintings));

let startIndex = 0;
let endIndex = 0;
let timeline = performance.now() - 9999; // performance now = how long has this page been running for (it's the equivalent of time on Kodelife for GLSL), we also take away a lot from the value of performance.now (using - 9999) as to fix the issue of the image morphing on page load

const sizer = function () {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const s = Math.min(ww, wh);
    const dpi = window.devicePixelRatio;

    canvas.width = s * 0.6 * dpi;
    canvas.height = s * 0.9 * dpi;
    canvas.style.width = Math.round(s * 0.6) + "px";
    canvas.style.height = Math.round(s * 0.9) + "px";
};

const next = function () {
    endIndex = endIndex + 1;

    if (endIndex > paintings.length - 1) {
        endIndex = 0;
    }

    update();
};

const prev = function () {
    endIndex = endIndex - 1;

    if (endIndex < 0) {
        endIndex = paintings.length - 1;
    }

    update();
};

const update = function () {
    descriptionTag.innerHTML = paintings[endIndex].title;
    timeline = performance.now();

    sandbox.setUniform("startIndex", startIndex);
    sandbox.setUniform("endIndex", endIndex);
    tick(); // we also run tick after we set these uniforms to fix the "flash" we can see when updating the images while changing them through the slideshow's next/prev

    // for the next time we update
    startIndex = endIndex;
};

const tick = function () {
    const diff = (performance.now() - timeline) / 1000; // performance.now - timeline is basically like the difference from WHEN we started initially (because we set timeline to be equal to performance.now) to where we are now using performance.now, we also divide it by 1000 because performance.now is REALLY quick, it runs in milliseconds so we slow it down
    sandbox.setUniform("timeline", diff);
    requestAnimationFrame(tick); // tick runs for each frame
};

const load = function () {
    sizer();
    tick();

    paintings.forEach((painting, index) => {
        sandbox.setUniform(`textures[${index}]`, painting.src);
    });
};

// events
load();

nextTag.addEventListener("click", function (event) {
    event.preventDefault();
    next();
});

prevTag.addEventListener("click", function (event) {
    event.preventDefault();
    prev();
});

window.addEventListener("resize", function () {
    sizer();
});
