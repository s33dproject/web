/**
 * Helper to wire up s33d params (postMessage from run view) to a sketch.
 * Call after canvasSketch(), passing the promise and your runtimeParams object.
 */
function setupParamsListener(managerPromise, runtimeParams) {
  if (typeof window === "undefined") return;
  managerPromise.then((manager) => {
    window.addEventListener("message", (e) => {
      if (e.data?.type === "s33d-params" && e.data.params) {
        Object.assign(runtimeParams, e.data.params);
        if (manager && typeof manager.render === "function") manager.render();
      }
    });
  });
}

module.exports = { setupParamsListener };
