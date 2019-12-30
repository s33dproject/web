<template>
  <router-link :to="`/artwork/${name}`">
    <v-img
      eager
      aspect-ratio="1"
      height="300"
      width="300"
      min-width="300"
      :src="src"
      :lazy-src="lazySrc"
    >
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="indigo"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>
  </router-link>
</template>

<script>
const baseUrl = "https://res.cloudinary.com/s33d/image/upload";
const folder = "artworks";

export default {
  name: "FeedImage",
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    src() {
      return `${baseUrl}/f_png,w_300,h_300/${folder}/${this.name}`;
    },
    lazySrc() {
      return `${baseUrl}/f_jpg,t_media_lib_thumb/${folder}/${this.name}`;
    }
  }
};
</script>

<style></style>
