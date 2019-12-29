<template>
  <v-img
    aspect-ratio="1"
    max-width="100%"
    max-height="100%"
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
const baseUrl = "https://res.cloudinary.com/gmaiolo/image/upload";

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
      return `${baseUrl}/s33d/${this.name}`;
    },
    lazySrc() {
      return `${baseUrl}/t_media_lib_thumb/s33d/${this.name}`;
    }
  }
};
</script>

<style></style>
