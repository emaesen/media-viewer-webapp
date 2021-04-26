import Vue from "vue";
import App from "./App";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  // these use default "fas" prefix
  faCheck, // check
  faCompress, // compress - box corners
  faCompressArrowsAlt, // compress - arrows
  faExpand, // expand - box corners
  faExpandArrowsAlt, // expand - arrows
  faFastBackward, // larger jump/skip backwards
  faFastForward, //larger jump/skip forwards
  faFilter, // filter
  faHome, // home
  faMinusSquare, // minus sign in square
  faPause, // pause
  faPlay, // start, play
  faPlusSquare, // plus sign in square
  faSignInAlt, // log/sign in
  faSignOutAlt, // log/sign out
  faSortAmountDown, // sort down
  faSortAmountUp, // sort up
  faSpinner, // spinner
  faStar, // star
  faStepBackward, // small jump/skip backwards
  faStepForward, // small jump/skip forwards
  faStop, // stop
  faTachometerAlt, // dashboard
  faUserCheck, // logged-in user
  faUserPlus, // register new user
  faFilm, // movie
  faVolumeDown, // volume down/low
  faVolumeMute, // volume muted
  faVolumeUp, // volume up/high
} from "@fortawesome/free-solid-svg-icons";
import {
  // these require explicit "far" prefix
  faStar as farStar, // star
} from "@fortawesome/free-regular-svg-icons";

import router from "./router";
import store from "./store";

//import "./registerServiceWorker";

library.add(
  faCheck,
  faCompress,
  faCompressArrowsAlt,
  faExpand,
  faExpandArrowsAlt,
  faFastBackward,
  faFastForward,
  faFilter,
  faHome,
  faMinusSquare,
  faPause,
  faPlay,
  faPlusSquare,
  faSignInAlt,
  faSignOutAlt,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faStar,
  farStar,
  faStepBackward,
  faStepForward,
  faStop,
  faTachometerAlt,
  faUserCheck,
  faUserPlus,
  faFilm,
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
