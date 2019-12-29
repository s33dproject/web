<template>
  <v-container>
    <v-row>
      <v-col class="py-8 text-center">
        <div
          v-for="imagePath in imagePaths"
          :key="imagePath"
          class="d-inline-block mx-1"
        >
          <FeedImage :path="imagePath" />
        </div>
        <div v-for="n in 23" :key="n" class="d-inline-block mx-1">
          <FeedImagePlaceholder />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FeedImagePlaceholder from "../components/FeedImagePlaceholder";
import FeedImage from "../components/FeedImage";

export default {
  name: "home",
  components: {
    FeedImagePlaceholder,
    FeedImage
  },
  data: () => ({
    imagePaths: ["/s33d/fur.jpg", "/s33d/flower.png"]
  })
};
</script>
