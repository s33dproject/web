<template>
  <v-img
    aspect-ratio="1"
    height="300"
    width="300"
    min-width="300"
    :src="`https://picsum.photos/300/300?image=${randomNumber}`"
    :lazy-src="`https://picsum.photos/10/10?image=${randomNumber}`"
  >
    <template v-slot:placeholder>
      <v-row class="fill-height ma-0" align="center" justify="center">
        <v-progress-circular indeterminate color="indigo"></v-progress-circular>
      </v-row>
    </template>
  </v-img>
</template>

<script>
export default {
  data: () => ({
    randomNumber: Math.floor(Math.random() * 100 + 1)
  })
};
</script>

<style></style>
