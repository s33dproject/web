import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    // route level code-splitting
    // this generates a separate chunk (home.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function() {
      return import(/* webpackChunkName: "home" */ "../views/NoName.vue");
    }
  },
  {
    path: "/gallery",
    name: "gallery",
    component: function() {
      return import(/* webpackChunkName: "artwork" */ "../views/Gallery.vue");
    }
  },
  {
    path: "/artwork/:name",
    name: "artwork",
    component: function() {
      return import(/* webpackChunkName: "artwork" */ "../views/Artwork.vue");
    }
  },
  {
    path: "/about",
    name: "about",
    component: function() {
      return import(/* webpackChunkName: "about" */ "../views/About.vue");
    }
  },
  {
    path: "/contact",
    name: "contact",
    component: function() {
      return import(/* webpackChunkName: "contact" */ "../views/Contact.vue");
    }
  },
  {
    path: "*",
    name: "404",
    component: function() {
      return import(/* webpackChunkName: "404" */ "../views/404.vue");
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
