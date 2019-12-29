<template>
  <v-app-bar app clipped-left flat light class="light">
    <v-app-bar-nav-icon v-if="isMobile" @click.stop="toggleDrawer" />
    <v-toolbar-title>S33D</v-toolbar-title>
    <template v-if="!isMobile">
      <v-spacer></v-spacer>
      <v-btn text>EXHIBITIONS</v-btn>
      <v-btn text>FEED</v-btn>
      <v-btn text>GALLERY</v-btn>
      <v-btn text>ABOUT</v-btn>
      <v-btn text>CONTACT</v-btn>
    </template>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppBar",
  props: {
    toggleDrawer: {
      required: true,
      type: Function
    }
  },
  computed: {
    isMobile() {
      // to use for showing/hiding nav drawer icon maybe?
      return this.$vuetify.breakpoint.xs;
    }
  }
};
</script>

<style lang="scss" scoped>
.light * {
  font-weight: 300;
}
</style>
