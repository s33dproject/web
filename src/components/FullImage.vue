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
import { getSrc, getThumbSrc } from "../utils/cloudinary.helper";

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
      return getSrc(this.name);
    },
    lazySrc() {
      return getThumbSrc(this.name);
    }
  }
};
</script>
