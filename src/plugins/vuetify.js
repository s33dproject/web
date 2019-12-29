import Vue from "vue";
import Vuetify from "vuetify/lib";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas, faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

Vue.component("font-awesome-icon", FontAwesomeIcon);
library.add(fas, faCookieBite, faInstagram);

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "faSvg"
  }
});
