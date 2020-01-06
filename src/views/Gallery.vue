<template>
  <v-container class="py-8">
    <v-row>
      <v-col class="text-center">
        <figure v-for="imageName in imageNames" :key="imageName" class="d-inline-block mx-1">
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
    FeedImage
  },
  data: () => ({
    imageNames: [
      "fur_indigo_tp",
      "fur_green_tp",
      "fur_yellow_tp",
      "fur_violet_tp",
      "fur_red_tp",
      "fur_orange_tp",
      "fur_black_tp",
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
      "geometry_platforms_I",
      "geometry_platforms_II",
      "geometry_platforms_III",
      "geometry_platforms_IV",
      "geometry_platforms_V",
      "geometry_platforms_VI",
      "geometry_platforms_VII",
      "geometry_platforms_VIII",
      "hodgepodge_colors_I",
      "hodgepodge_colors_III",
      "hodgepodge_colors_V",
      "hodgepodge_colors_VI",
      "hodgepodge_colors_VIII",
      "hodgepodge_colors_XI",
      "hodgepodge_colors_XIV",
      "hodgepodge_colors_XV",
      "hodgepodge_colors_XVI",
      "dither_I",
      "flower",
      "origin_I",
      "origin_XI",
      "origin_V",
      "pixel_shifting_I",
      "pixel_shifting_II",
      "pixel_shifting_III",
      "pixel_shifting_IV",
      "carnation_flower_I",
      "carnation_flower_IV",
      "carnation_flower_V",
      "carnation_flower_XIV",
      "carnation_flower_XV",
      "carnation_flower_XXIV",
      "hodgepodge_I",
      "hodgepodge_IV",
      "hodgepodge_V",
      "hodgepodge_VII",
      "hodgepodge_X",
      "hodgepodge_XI",
      "layers_I",
      "layers_II",
      "layers_III"
    ]
  })
};
</script>
