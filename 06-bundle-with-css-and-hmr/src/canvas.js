const width = 384;
const height = 120;

const $canvas = document.createElement('canvas');
Object.assign($canvas, {width, height});

const ctx = $canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);

const data = imageData.data;

// Set all pixels opaque
for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255;
}

// todo: keep separate colorValue array
// todo: render from colorValue array
// todo: add double buffering

const colorFromColorValue = colorValue => ({
    r: colorValue,
    g: colorValue >> 1,
    b: colorValue >> 2,
    a: 255
});

const randomColor = () => colorFromColorValue(Math.floor(Math.random() * 256));
const nextColor = currentColorValue => colorFromColorValue((currentColorValue + 2) % 256);

const update = () => {
    // generate bottom line
    for (let i = width * 4 * (height - 2); i < data.length; i += 4) {
        const currentColorValue = data[i];
        const newColor = currentColorValue > 0 ? nextColor(currentColorValue) : randomColor();
        data[i] = newColor.r;
        data[i + 1] = newColor.g;
        data[i + 2] = newColor.b;
        data[i + 3] = newColor.a;
    }

    // burn upwards
    for (let i = width * 4; i < width * 4 * (height - 2); i += 4) {
        [0, 1, 2].forEach(n => {
            data[i + n] = (
                    data[i + n - 4] + data[i + n] + data[i + n + 4] +
                    data[i + n + (width - 1) * 4] + data[i + n + (width + 1) * 4] +
                    data[i + n + (2 * width - 1) * 4] + data[i + n + 2 * width * 4] + data[i + n + (2 * width + 1) * 4] +
                    -6
                ) >> 3;
        });
    }
    
    // write to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // next
    window.requestAnimationFrame(update);
};

// start
window.requestAnimationFrame(update);
document.body.appendChild($canvas);
