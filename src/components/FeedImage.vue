<template>
  <router-link :to="`/artwork/${name}`">
    <v-img
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
const baseUrl = "https://res.cloudinary.com/gmaiolo/image/upload";

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
      return `${baseUrl}/w_300,h_300/s33d/${this.name}`;
    },
    lazySrc() {
      return `${baseUrl}/t_media_lib_thumb/s33d/${this.name}`;
    }
  }
};
</script>

<style></style>
