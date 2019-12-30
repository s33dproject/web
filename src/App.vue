<template>
  <v-app dark>
    <NavigationDrawer :value="drawer" />
    <AppBar :toggle-drawer="toggleDrawer" />
    <v-content>
      <transition name="fade">
        <router-view />
      </transition>
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

<style lang="scss">
/* fade transition */
.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

/* overwrites */
.v-application .v-application--wrap a {
  text-decoration: none;
  color: inherit;
}
</style>
