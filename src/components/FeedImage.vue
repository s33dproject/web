<template>
  <router-link :to="`/artwork/${name}`">
    <v-img
      eager
      contain
      height="300"
      max-width="300"
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
import { getFeedSrc, getThumbSrc } from "../utils/cloudinary.helper";

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
      return getFeedSrc(this.name);
    },
    lazySrc() {
      return getThumbSrc(this.name);
    }
  }
};
</script>

<style></style>
