/**
 * Mixin to implement some action when element comes into view
 *
 * Add custom directive `v-activate-on-intersection` to an element to add
 * an observer which will add `v-activate-xyz` classes to indicate
 * intersection state.
 * 
 */

import observeIntersection from '@/mixins/observe-intersection.js';
import vObserveIntersection from "@/directives/v-observe-intersection.js";

import { logMessage } from '@/utils/logger.js'

export default {
  name: 'mixins/activate-on-intersection',
  directives: {
    activateOnIntersection: vObserveIntersection
  },
  mixins: [observeIntersection],
  data() {
    return {
      intsecObserverBehavior: {
        // keep observing to de-activate when out-of-view 
        observeOnlyOnce: false,
      },
      // the component that implements this observer is expected to set:
      // intSecObsv: {
      //   activeIDs: [],
      // }
    };
  },
  computed: {
  },
  methods: {
    intsecHandler(target, opts) {
      if (opts && opts.init) {
        this.intsecInit(target)
      } else if (opts && opts.inview) {
        this.intsecActivate(target)
      } else if (opts && !opts.observedonce) {
        this.intsecDeActivate(target)
      }
    },
    intsecInit(el) {
      if (!el.classList.contains('v-activate--init')) {
        logMessage("actOnIntsecHandler INIT: " + el.id)
        el.classList.add('v-activate--init')
      }
    },
    intsecActivate(el) {
      if (!el.classList.contains('v-activate--active')) {
        el.classList.remove('v-activate--init')
        el.classList.remove('v-activate--deactive')
        el.classList.add('v-activate--active')
        // add new id and filter to prevent duplicate entries
        this.intSecObsv.activeIDs.push(el.id)
        this.intSecObsv.activeIDs = 
          this.intSecObsv.activeIDs
            .filter((x,i,a) => a.indexOf(x) === i)
        logMessage("actOnIntsecHandler ACTIVATE: " + el.id)
        logMessage("  ... active IDs: ", this.intSecObsv.activeIDs)
      }
    },
    intsecDeActivate(el) {
      if (!el.classList.contains('v-activate--deactive')) {
        el.classList.remove('v-activate--init')
        el.classList.remove('v-activate--active')
        el.classList.add('v-activate--deactive')
        this.intSecObsv.activeIDs = this.intSecObsv.activeIDs.filter(id => id!==el.id)
        logMessage("actOnIntsecHandler DE-ACTIVATE: " + el.id)
        logMessage("  ... active IDs: ", this.intSecObsv.activeIDs)
      }
    }
  }
}