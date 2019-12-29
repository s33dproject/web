<template>
  <v-app dark>
    <NavigationDrawer :value="drawer" />
    <AppBar :toggle-drawer="toggleDrawer" />
    <v-content>
      <router-view />
    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import NavigationDrawer from "./components/NavigationDrawer";
import AppBar from "./components/AppBar";
import Footer from "./components/Footer";

export default {
  name: "App",
  components: {
    NavigationDrawer,
    AppBar,
    Footer
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
