<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="text-center py-8">
          <div v-for="n in 10" :key="n" class="d-inline-block mx-1">
            <FeedImage />
          </div>
        </v-card>
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
