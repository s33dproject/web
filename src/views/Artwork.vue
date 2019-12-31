<template>
  <v-container class="px-0 pt-8" fluid>
    <figure>
      <FullImage :name="name" />
      <figcaption class="mt-2 font-weight-light text-center">{{ name }} — 2019</figcaption>
    </figure>
  </v-container>
</template>

<script>
import FullImage from "../components/FullImage";

export default {
  name: "Artwork",
  components: {
    FullImage
  },
  computed: {
    name() {
      return this.$router.currentRoute.params.name;
    }
  }
};
</script>
