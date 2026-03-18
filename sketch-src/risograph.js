/**
 * An advanced Canvas2D example of creating artwork for a Risograph printer.
 * This exports multiple layers: each color as a black & white mask,
 * a proof (composite of all colours), and a JSON metadata of ink colours & intensities.
 * @author Matt DesLauriers (@mattdesl)
 */

const sketcher = require('canvas-sketch');
const seedRandom = require('seed-random');
const randomUtil = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const settings = {
    scaleToView: false,
    dimensions: [6000, 4000],
    pixelsPerInch: 300,
    exportPixelRatio: 2,
};

const runtimeParams = { opacity: 1 };

const sketch = ({ width, height, render }) => {
    const colorCount = 4;

    const palette = randomUtil.shuffle(randomUtil.pick(palettes))
        .slice(0, colorCount);

    let currentSeed;

    // Build a list of "layers", each corresponding to a print color
    const colors = palette;
    const layers = colors.map((color, i, list) => {
        // Create a render buffer for each color layer
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        return {
            color,
            canvas,
            context,
            alpha: 1,
            shapes: []
        };
    });

    // Background color
    const background = 'white';

    // Provide an initial generation
    generate();

    // And update every X milliseconds
    //setInterval(generate, 1500);

    return function (props) {
        const {
            canvas,
            context,
            width, height
        } = props;

        // The background colour of our paper
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        // Draw all layers with their true colours
        drawLayers(props, false);

        // Now let's create a composite for all our layers
        context.globalCompositeOperation = 'multiply';
        layers.forEach(layer => {
            // Blend in the new layer
            context.drawImage(layer.canvas, 0, 0, width, height);
        });
        // Revert to default blending
        context.globalCompositeOperation = 'source-over';

        // And now we draw each layer as a white/black mask
        drawLayers(props, true);

        // Export the composite, each layer mask, and the colors JSON
        return [
            // The composite with a custom file name
            { data: canvas, file: `${currentSeed}-composite.png` },
            // Each individual layer as a black/white mask
            ...layers.map((layer, i) => {
                return { data: layer.canvas, file: `${currentSeed}-layer-${i}.png` };
            }),
            // Some colour/ink data to go along with each layer
            { data: serialize(), file: `${currentSeed}-layers.json` }
        ];
    };

    // Utility functions, hoisted to closure scope
    // --

    // Get a random float between [min..max] range
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Return a list of random squares between [0..1] range
    function createShapes(count = 10) {
        return Array.from(new Array(count)).map(() => {
            const margin = 2;
            const x = random(margin, width - margin);
            const y = random(margin, height - margin);
            const size = random(1600, 400);
            const radius = size / 2;

            const types = ['square', 'circle', 'arc'];
            const type = types[Math.floor(Math.random() * types.length)];
            switch (type) {
                case 'square':
                    return context => context.fillRect(x - size / 2, y - size / 2, size, size);
                case 'circle':
                    return context => {
                        context.beginPath();
                        context.arc(x, y, radius, 0, Math.PI * 2, false);
                        context.fill();
                    };
                case 'arc':
                    const lineWidth = random(30, 80);
                    const start = Math.PI * 2 * random(-1, 1);
                    const length = Math.PI * 2 * random(0.25, 0.5);
                    return context => {
                        context.beginPath();
                        context.arc(x, y, radius, start, start + length, false);
                        context.lineWidth = lineWidth;
                        context.stroke();
                    };
            }
            return [
                x, y,
                size, size
            ];
        });
    }

    // A function to update the generative artwork with new content
    function generate() {
        currentSeed = String(Math.floor(Math.random() * 100000));
        seedRandom(currentSeed, { global: true });

        const softIndex = Math.floor(Math.random() * layers.length);
        layers.forEach((layer, i) => {
            layer.alpha = i === softIndex ? 0.75 : 1;
            layer.shapes = createShapes(Math.floor(random(5, 20)));
        });
        render();
    }

    // Serialize the layer data to a JSON string
    function serialize() {
        return JSON.stringify(layers.map(layer => {
            return { color: layer.color, alpha: layer.alpha };
        }));
    }

    // Draw each layer to its own canvas buffer
    function drawLayers(props, mask) {
        const {
            canvasWidth, canvasHeight,
            width, height,
            scaleX, scaleY
        } = props;

        // Draw each layer on top to create a final composite
        layers.forEach(layer => {
            // Make sure the layer buffer size matches the composite size
            layer.canvas.width = canvasWidth;
            layer.canvas.height = canvasHeight;

            // Scale the layer context the same as the composite context
            layer.context.save();
            layer.context.scale(scaleX, scaleY);

            // Clear the layer canvas
            layer.context.clearRect(0, 0, width, height);

            // When rendering black/white masks, use a white background
            if (mask) {
                layer.context.fillStyle = 'white';
                layer.context.fillRect(0, 0, width, height);
            }

            // Draw each shape with the color of this layer,
            // or when rendering split layers, draw with black
            layer.context.fillStyle = mask ? 'white' : layer.color;
            layer.context.strokeStyle = mask ? 'black' : layer.color;
            layer.context.globalAlpha = mask ? 1 : (layer.alpha * (runtimeParams.opacity ?? 1));
            layer.shapes.forEach(shape => {
                shape(layer.context);
            });

            // Restore layer context & draw it onto the final composite
            layer.context.restore();
        });
    }
};

const managerPromise = sketcher(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
