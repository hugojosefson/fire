const width = 384;
const height = 120;

const $canvas = document.createElement('canvas');
Object.assign($canvas, {width, height});

const ctx = $canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);

const range = (start, end, fn) => {
    if (start >= 0 && end > start && typeof fn === 'function') {
        for (let i = start; i <= end; i++) {
            fn(i);
        }
    } else {
        throw new Error('start, end and fn must be correctly defined!');
    }
};

const palette = [];
range(192, 255, i => palette[i] = [255, 255, 255, 255]);
range(128, 191, i => palette[i] = [i * 2, i * 1, i * 0.5, i]);
range(64, 127, i => palette[i] = [i * 2, i * 1, i * 0.5, i]);
range(0, 63, i => palette[i] = [i * 2, i * 1, i * 0.5, i]);

const render = (colorValues, intoData) => range(0, width * height - 1, index => intoData.set(colorFromColorValue(colorValues[index]), index << 2));

const colorFromColorValue = colorValue => palette[colorValue] || [0, 0, 0, 0];

const randomColorValue = () => Math.floor(Math.random() * 256);
const nextColorValue = currentColorValue => (currentColorValue + 2) % 256;

const updateState = (prevColorValues, nextColorValues) => {

    // generate bottom line
    for (let i = width * height; i < width * (height + 2); i++) {
        const prevColorValue = prevColorValues[i];
        const newColorValue = prevColorValue === 0 ? randomColorValue() : nextColorValue(prevColorValue);
        nextColorValues[i] = newColorValue;
    }

    // burn upwards
    for (let i = width; i < width * height; i++) {
        nextColorValues[i] = (
                prevColorValues[i + 0 * width - 1] + prevColorValues[i + 0 * width] + prevColorValues[i + 0 * width + 1] +
                prevColorValues[i + 1 * width - 1] /*+ 00000000000000000000000000*/ + prevColorValues[i + 1 * width + 1] +
                prevColorValues[i + 2 * width - 1] + prevColorValues[i + 2 * width] + prevColorValues[i + 2 * width + 1] - 8
            ) >> 3;
    }

};

const colorValuesArrays = [0, 1].map(() => {
    const colorValues = new Array(width * (height + 2));
    colorValues.fill(0);
    return colorValues;
});
let nextColorValuesArrayIndex = 0;
const update = () => {

    // update state
    const prevColorValuesArrayIndex = nextColorValuesArrayIndex;
    nextColorValuesArrayIndex = (nextColorValuesArrayIndex + 1) % 2;
    updateState(colorValuesArrays[prevColorValuesArrayIndex], colorValuesArrays[nextColorValuesArrayIndex]);

    // render state into imageData.data
    render(colorValuesArrays[nextColorValuesArrayIndex], imageData.data);

    // write imageData to canvas
    ctx.putImageData(imageData, 0, 0);

    // next
    window.requestAnimationFrame(update);
};

// start
window.requestAnimationFrame(update);
document.body.appendChild($canvas);
