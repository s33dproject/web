/**
 * Helper to wire up s33d params (postMessage from run view) to a sketch.
 * Call after canvasSketch(), passing the promise and your runtimeParams object.
 * Also handles s33d-capture for Add variant (canvas export).
 */
function setupParamsListener(managerPromise, runtimeParams) {
  if (typeof window === "undefined") return;
  managerPromise.then((manager) => {
    window.addEventListener("message", (e) => {
      if (e.data?.type === "s33d-params" && e.data.params) {
        Object.assign(runtimeParams, e.data.params);
        if (manager && typeof manager.render === "function") manager.render();
      }
      if (e.data?.type === "s33d-capture") {
        const sendFallback = () => {
          try {
            const canvas = document.querySelector("canvas");
            if (canvas) {
              const dataUrl = canvas.toDataURL("image/png");
              window.parent.postMessage({ type: "s33d-capture-result", dataUrl }, "*");
            }
          } catch (err) {
            // ignore
          }
        };
        if (manager && typeof manager.exportFrame === "function") {
          manager.exportFrame({ save: false })
            .then((result) => {
              const dataURL = Array.isArray(result) ? result[0]?.dataURL : result?.dataURL;
              if (dataURL) {
                window.parent.postMessage({ type: "s33d-capture-result", dataUrl: dataURL }, "*");
              } else {
                sendFallback();
              }
            })
            .catch(sendFallback);
        } else {
          sendFallback();
        }
      }
    });
  });
}

module.exports = { setupParamsListener };
