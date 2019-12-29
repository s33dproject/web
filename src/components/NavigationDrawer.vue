<template>
  <v-navigation-drawer :value="value" app clipped disable-resize-watcher>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">S33D</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>
    <v-list dense>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>date_range</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>EXHIBITIONS</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>color_lens</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>FEED</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>photo_library</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>GALLERY</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>eco</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>ABOUT</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>mail</v-icon>
        </v-list-item-action>
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
