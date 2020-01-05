<template>
  <v-navigation-drawer :value="value" app clipped disable-resize-watcher>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">S33D</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>EXHIBITIONS</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>FEED</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>GALLERY</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item to="/about">
        <v-list-item-content>
          <v-list-item-title>ABOUT</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item to="/contact">
        <v-list-item-content>
          <v-list-item-title>CONTACT</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "NavigationDrawer",
  props: {
    value: {
      required: true,
      type: Boolean
    }
  }
};
</script>

<style lang="scss" scoped>
.v-list-item__title {
  font-weight: 300 !important;
}
</style>
