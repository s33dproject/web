<template>
  <v-container class="px-0 pt-8" fluid>
    <h1 class="font-weight-light text-center pb-4">{{ name }}</h1>
    <figure>
      <FullImage :name="name" />
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
