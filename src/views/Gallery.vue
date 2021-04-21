<template>
  <v-container class="py-8">
    <v-row>
      <v-col class="text-center">
        <figure
          v-for="imageName in imageNames"
          :key="imageName"
          style="width: 300px;"
          class="d-inline-flex ma-3 justify-center"
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
  name: "gallery",
  components: {
    FeedImage,
  },
  data: () => ({
    imageNames: [
      "dither_I",
      "pixel_shifting_I",
      "pixel_shifting_II",
      "pixel_shifting_III",
      "pixel_shifting_IV",
      "origin_I",
      "origin_XI",
      "origin_V",
      "noname_I",
      "noname_II",
      "noname_III",
      "noname_IV",
      "noname_V",
      "noname_VI",
      "noname_VII",
      "noname_VIII",
      "noname_IX",
      "noname_X",
      "noname_XI",
      "noname_XII",
      "hodgepodge_colors_V",
      "hodgepodge_colors_VI",
      "hodgepodge_colors_VIII",
      "hodgepodge_colors_XI",
      "flower",
      "carnation_flower_I",
      "carnation_flower_IV",
      "carnation_flower_V",
      "carnation_flower_XIV",
      "carnation_flower_XV",
      "carnation_flower_XXIV",
      "layers_I",
      "layers_II",
      "layers_III",
    ],
  }),
};
</script>
