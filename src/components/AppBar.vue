<template>
  <v-app-bar app clipped-left flat light>
    <v-app-bar-nav-icon v-if="isMobile" @click.stop="toggleDrawer" />
    <v-toolbar-title class="font-weight-light">
      <router-link to="/">S33D</router-link>
    </v-toolbar-title>
    <template v-if="!isMobile">
      <v-spacer></v-spacer>
      <!--<v-btn text>EXHIBITIONS</v-btn>
      <v-btn text>FEED</v-btn>-->
      <v-btn to="/" text>GALLERY</v-btn>
      <v-btn to="/About" text>ABOUT</v-btn>
      <v-btn to="/Contact" text>CONTACT</v-btn>
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
