<template>
  <v-row>
    <v-col id="col" cols="12" class="text-center pa-0">
      <canvas id="canvas"></canvas>
    </v-col>
  </v-row>
</template>

<script>
export default {
  mounted() {
    const canvas = document.getElementById("canvas");
    canvas.width = document.getElementById("col").clientWidth;
    canvas.height = document.querySelector(".v-content__wrap").clientHeight;

    const context = canvas.getContext("2d", { alpha: false });
    const center = {
      x: canvas.width >> 1,
      y: canvas.height >> 1
    };

    context.setTransform(1, 0, 0, 1, center.x, center.y);
    context.lineWidth = 2;
    context.strokeStyle = "rgba(0,0,0,0.8)";
    context.shadowBlur = 160;

    function render(ms) {
      ms = ms / 4;
      context.globalAlpha = 0.77;
      context.fillRect(-600, -600, 2200, 2200); // podria achicarlo
      context.globalAlpha = 1;
      context.beginPath();
      context.rotate(0.0025);
      context.shadowColor = `hsl(${ms * 0.1}, 100%, 100%)`;
      context.shadowBlur = 0.01; // in 16 this is fun
      const step = Math.PI / ((ms % 200) + 50);
      let angle = 0;
      while (angle < Math.PI * 2) {
        const tan = Math.tan(ms * 0.00025);
        const cos = Math.cos(ms * 0.00015 * angle * tan);
        const sin = Math.sin(ms * 0.01);
        const len = 150 + 150 * cos * sin;
        context.lineTo(len * Math.cos(angle), len * Math.sin(tan));
        angle += step;
      }
      context.stroke();
      context.globalCompositeOperation = "lighter";
      context.shadowBlur = 0;
      context.drawImage(context.canvas, -center.x, -center.y);
      context.drawImage(context.canvas, -center.x + 1, -center.y + 1);
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
/* placeholder */
</style>
