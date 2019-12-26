<template>
  <v-app dark>
    <NavigationDrawer :value="drawer" />
    <AppBar :toggle-drawer="toggleDrawer" />
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import NavigationDrawer from "./components/NavigationDrawer";
import AppBar from "./components/AppBar";

export default {
  name: "App",
  components: {
    NavigationDrawer,
    AppBar
  },
  data: () => ({}),
  computed: {
    ...mapState(["drawer"])
  },
  methods: {
    ...mapMutations(["toggleDrawer"])
  }
};
</script>
