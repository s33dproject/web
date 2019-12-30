<template>
  <v-img
    contain
    aspect-ratio="1"
    max-width="100%"
    max-height="80vh"
    :src="src"
    :lazy-src="lazySrc"
  >
    <template v-slot:placeholder>
      <v-row class="fill-height ma-0" align="center" justify="center">
        <v-progress-circular indeterminate color="indigo"></v-progress-circular>
      </v-row>
    </template>
  </v-img>
</template>

<script>
const baseUrl = "https://res.cloudinary.com/s33d/image/upload";
const folder = "artworks";

export default {
  name: "FullImage",
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    src() {
      return `${baseUrl}/f_png/${folder}/${this.name}`;
    },
    lazySrc() {
      return `${baseUrl}/f_jpg,t_media_lib_thumb/${folder}/${this.name}`;
    }
  }
};
</script>
