<template>
  <v-container class="font-weight-light" justify-center align-content-center>
    <v-row>
      <v-col id="col" cols="12" class="text-center">
        <canvas id="canvas"></canvas>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  mounted() {
    const canvas = document.getElementById("canvas");
    canvas.width = document.getElementById("col").clientWidth - 100;
    canvas.height =
      document.querySelector(".v-content__wrap").clientHeight - 100;

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
      context.fillRect(-400, -400, 1200, 1200); // podria achicarlo
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
        const len = 150 + 150 * cos * sin;
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
/* placeholder */
</style>
