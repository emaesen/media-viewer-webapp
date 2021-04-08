import Vue from "vue";
import App from "./App";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faAlignJustify, // list layout
  faCheck, // check
  faCompress, // compress - box corners
  faCompressArrowsAlt, // compress - arrows
  faExpand, // expand - box corners
  faExpandArrowsAlt, // expand - arrows
  faFilter, // filter
  faHome, // home
  faPause, // pause
  faPlay, // start, play
  faSignInAlt, // log/sign in
  faSignOutAlt, // log/sign out
  faSortAmountDown, // sort down
  faSortAmountUp, // sort up
  faSpinner, // spinner
  faStar, // star
  faStop, // stop
  faTachometerAlt, // dashboard
  faUserCheck, // logged-in user
  faUserPlus, // register new user
  faVideo, // video
  faVolumeDown, // volume down/low
  faVolumeMute, // volume muted
  faVolumeUp, // volume up/high
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as farStar // star
} from "@fortawesome/free-regular-svg-icons";

import router from "./router";
import store from "./store";

import "./registerServiceWorker";

library.add(
  faAlignJustify,
  faCheck,
  faCompress,
  faCompressArrowsAlt,
  faExpand,
  faExpandArrowsAlt,
  faFilter,
  faHome,
  faPause,
  faPlay,
  faSignInAlt,
  faSignOutAlt,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faStar,
  farStar,
  faStop,
  faTachometerAlt,
  faUserCheck,
  faUserPlus,
  faVideo,
  faVolumeDown,
  faVolumeMute,
  faVolumeUp,
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
