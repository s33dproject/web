<template>
  <v-container fill-height fluid align-center justify-center class="pa-0">
    <div>
      <NoName />
    </div>
  </v-container>
</template>

<script>
import NoName from "../components/NoName";

export default {
  name: "Home",
  components: {
    NoName
  }
};
</script>

<style lang="scss" scoped>
.container {
  background-color: black;
}
</style>
