<template>
  <v-footer app light>
    <v-card flat tile class="d-flex pa-auto transparent" width="100%">
      <span class="ma-auto body-2">S33D © {{ new Date().getFullYear() }}</span>
      <v-spacer></v-spacer>
      <div class="d-inline-block">
        <v-btn
          x-small
          icon
          v-for="link in links"
          :key="link.url"
          :href="link.url"
          target="_blank"
          class="mx-4"
        >
          <font-awesome-icon :icon="link.icon" size="2x" />
        </v-btn>
      </div>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    links: {
      flashcookie: {
        icon: "cookie-bite",
        url: "https://s33d.flashcookie.com/"
      },
      instagram: {
        icon: ["fab", "instagram"],
        url: "https://www.instagram.com/s33dproject/"
      }
    }
  })
};
</script>
