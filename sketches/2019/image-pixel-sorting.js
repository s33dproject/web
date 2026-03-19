const canvasSketch = require("canvas-sketch");
const load = require("load-asset");

const runtimeParams = { skipChance: 0.75 };

canvasSketch(async ({ update }) => {
  // Await the image loader, it returns the loaded <img>
  const image = await load("../assets/images/mam.jpg");

  // Once the image is loaded, we can update the output
  // settings to match it
  update({
    dimensions: [image.width, image.height],
    scaleToView: true,
  });

  // Now render our sketch
  return ({ context, width, height }) => {
    // Draw the loaded image to the canvas
    context.drawImage(image, 0, 0, width, height);

    // Extract bitmap pixel data
    const pixels = context.getImageData(0, 0, width, height);

    // Manipulate pixel data
    const data = pixels.data;
    let len = width;
    while (len) {
      const newX = Math.floor(Math.random() * len--);
      const oldX = len;

      if (Math.random() > (runtimeParams.skipChance ?? 0.75)) continue;

      for (let y = 0; y < height; y++) {
        // Sometimes leave column in tact
        if (Math.random() > 0.925) continue;

        // Copy new random column into old column
        const newIndex = newX + y * width;
        const oldIndex = oldX + y * width;

        // Make 'grayscale' by just copying blue channel
        data[oldIndex * 4 + 0] = data[newIndex * 4 + 0];
        data[oldIndex * 4 + 1] = data[newIndex * 4 + 1];
        data[oldIndex * 4 + 2] = data[newIndex * 4 + 2];
        data[oldIndex * 4 + 3] = data[newIndex * 4 + 3];
      }
    }
    // Put new pixels back into canvas
    context.putImageData(pixels, 0, 0);
  };
}).then((manager) => {
  if (typeof window !== "undefined") {
    require("./s33d-params").setupParamsListener(Promise.resolve(manager), runtimeParams);
  }
});
