/**
 * mixin that adds Intersection Observer to determine when an object is in view.
 * 
 * Add custom directive `v-observe-intersection` to an element to add
 * an observer.
 * 
 * Mixin caller must implement an `intsecHandler(target)` function to do 
 * something interesting on view intersection of the target object;
 */
import vObserveIntersection from "@/directives/v-observe-intersection.js";

const YES = "yes";
const NO = "no";

const dataIntsecObservable = 'intsecObservable';
const dataIntsecInview = 'intsecInview';
const dataIntsecObserved = 'intsecObserved';

export default {
  name: 'mixins/observe-intersection',
  directives: {
    observeIntersection: vObserveIntersection
  },
  data() {
    return {
      intsecObserver: undefined,
      intsecObserverOptions: {
        rootMargin: '-20px',
        threshold: [0,0.01],
      },
      intsecObserverBehavior: {
        observeOnlyOnce: true,
      },
    };
  },
  computed: {
  },
  beforeMount() {
    if ('IntersectionObserver' in window) {
      this.intsecObserver = new IntersectionObserver(
        entries => {
          entries.forEach(this.handleIntersection)
        }, 
        this.intsecObserverOptions
      );
    }
  },
  beforeDestroy() {
    if ('IntersectionObserver' in window) {
      this.intsecObserver.disconnect();
    }
  },
  methods: {
    // eslint-disable-next-line
    handleIntersection({intersectionRatio, isIntersecting, target}, observer) {
      if (intersectionRatio > 0) {
        target.dataset[dataIntsecObserved] ++
        if (target.dataset[dataIntsecObservable] === YES) {
          this.intsecHandler(target, {inview:true});
          target.dataset[dataIntsecInview] = YES
        }
        if (this.intsecObserverBehavior.observeOnlyOnce) {
          target.dataset[dataIntsecObservable] = NO;
          this.intsecObserver.unobserve(target)
          delete target.dataset[dataIntsecInview]
        }
      } else {
        if (target.dataset[dataIntsecObservable] === YES 
            && target.dataset[dataIntsecObserved] == 0) {
          this.intsecHandler(target, {init:true});
        }
        target.dataset[dataIntsecInview] = NO
        this.intsecHandler(target, {inview:false});
      }
    },
    intsecHandler(/*target, opts*/) {
      // ADD THIS METHOD WITH DESIRED IMPLEMENTATION IN UPSTREAM MIXIN/COMPONENT
    }
  }
}