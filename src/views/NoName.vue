<template>
  <v-container fill-height fluid align-center justify-center class="pa-0">
    <div>
      <canvas id="canvas"></canvas>
    </div>
  </v-container>
</template>

<script>
export default {
  mounted() {
    const canvas = document.getElementById("canvas");
    const { clientWidth } = document.querySelector(".v-content__wrap");
    const size = clientWidth >= 400 ? 400 : clientWidth;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d", { alpha: false });
    const center = {
      x: canvas.width >> 1,
      y: canvas.height >> 1
    };

    context.setTransform(1, 0, 0, 1, center.x, center.y);
    context.lineWidth = 2;
    context.strokeStyle = "rgba(0,0,0,0.8)";
    context.shadowBlur = 16;
    context.imageSmoothingEnabled = true;

    function render(ms) {
      ms = ms / 4;
      context.globalAlpha = 0.77;
      context.fillRect(-250, -250, 750, 750); // podria achicarlo
      context.globalAlpha = 1;
      context.beginPath();
      context.rotate(0.025);
      context.shadowColor = `hsl(${ms * 0.1}, 100%, 75%)`;
      context.shadowBlur = 16;
      const step = Math.PI / ((ms % 200) + 50);
      let angle = 0;
      while (angle < Math.PI * 2) {
        context.moveTo(0, 0);
        const tan = Math.tan(ms * 0.00025);
        const cos = Math.cos(ms * 0.00015 * angle * tan);
        const sin = Math.sin(ms * 0.01);
        const len = 125 * cos * sin;
        context.lineTo(len * Math.cos(angle), len * Math.sin(angle));
        angle += step;
      }
      context.stroke();
      context.globalCompositeOperation = "lighter";
      context.shadowBlur = 0;
      context.drawImage(context.canvas, -center.x, -center.y);
      context.drawImage(context.canvas, -center.x, -center.y);
      context.globalCompositeOperation = "source-over";
    }

    function loop(ms) {
      render(ms);
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }
};
</script>

<style lang="scss" scoped>
.container {
  background-color: black;
}
</style>
