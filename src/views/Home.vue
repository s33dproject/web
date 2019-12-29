<template>
  <v-container>
    <v-row>
      <v-col class="py-8 text-center">
        <div v-for="n in 25" :key="n" class="d-inline-block mx-1">
          <FeedImage />
        </div>
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
  }
};
</script>
