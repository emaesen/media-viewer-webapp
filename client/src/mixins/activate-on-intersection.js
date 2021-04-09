/**
 * Mixin to implement animation when element comes into view
 *
 * Add custom directive `v-activate-on-intersection` to an element to add
 * an observer which will trigger an animation behavior 
 * (default class is defined by this.defaultAnimationClass;
 *  override this with a custom class on the element).
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
        this.init(target)
      } else if (opts && opts.inview) {
        this.activate(target)
      } else {
        this.deActivate(target)
      }
    },
    init(el) {
      if (!el.classList.contains('v-activate--init')) {
        logMessage("activate intsecHandler INIT: " + el.id)
        el.classList.add('v-activate--init')
      }
    },
    activate(el) {
      if (!el.classList.contains('v-activate--active')) {
        el.classList.remove('v-activate--init')
        el.classList.remove('v-activate--deactive')
        el.classList.add('v-activate--active')
        this.intSecObsv.activeIDs.push(el.id)
        logMessage("activate intsecHandler ACTIVATE: " + el.id)
        logMessage("  ... active IDs: ", this.intSecObsv.activeIDs)
      }
    },
    deActivate(el) {
      if (!el.classList.contains('v-activate--deactive')) {
        el.classList.remove('v-activate--init')
        el.classList.remove('v-activate--active')
        el.classList.add('v-activate--deactive')
        this.intSecObsv.activeIDs = this.intSecObsv.activeIDs.filter(id => id!==el.id)
        logMessage("activate intsecHandler DE-ACTIVATE: " + el.id)
        logMessage("  ... active IDs: ", this.intSecObsv.activeIDs)
      }
    }
  }
}