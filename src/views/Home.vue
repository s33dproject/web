<template>
  <v-container class="py-8">
    <v-row>
      <v-col class="text-center">
        <figure
          v-for="imageName in imageNames"
          :key="imageName"
          class="d-inline-block mx-1"
        >
          <FeedImage :name="imageName" />
        </figure>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FeedImage from "../components/FeedImage";

export default {
  name: "home",
  components: {
    FeedImage
  },
  data: () => ({
    imageNames: [
      "bw_fur",
      "flower",
      "chars",
      "pacmen_1",
      "chars_1",
      "pacmen_2",
      "chars_0",
      "flower_5",
      "pacmen_5"
    ]
  })
};
</script>
