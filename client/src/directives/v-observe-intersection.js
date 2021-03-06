/**
 * Custom directive to add intersection observer to an element.
 *
 * To be used in conjunction with the intersection mixin; which handles the 
 * lifecycle of an Intersection Observer and makes it available through 
 * property `intsecObserver`.
 */

import {logError,logMessage} from '@/utils/logger.js'

const YES = "yes";
const NO = "no";

const intsecObsCacheKey = 'intsecObserverCache';
const intsecObsKey = 'intsecObserver';
const dataIntsecObservable = 'intsecObservable';
const dataIntsecObserved = 'intsecObserved';

let enableIntsecObs = true;

function markObservable(el) {
  el.dataset[dataIntsecObservable] = YES;
  el.dataset[dataIntsecObserved] = 0;
}
function markUnobservable(el) {
  el.dataset[dataIntsecObservable] = NO;
}

function cacheObserver(el, observer) {
  el[intsecObsCacheKey] = observer;
}
function uncacheObserver(el) {
  delete el[intsecObsCacheKey];
}

function observe(el, observer) {
  if (enableIntsecObs && observer instanceof IntersectionObserver) {
    observer.observe(el);
    markObservable(el);
    cacheObserver(el, observer);
    logMessage("observe " + el.id, {observer})
  }
}
function unobserve(el, observer) {
  if (enableIntsecObs) {
    if (el && observer instanceof IntersectionObserver) {
      observer.unobserve(el);
      logMessage("unobserve " + el.id, {observer})
    }
    if (el) {
      markUnobservable(el);
      uncacheObserver(el);
    }
  }
}

export default {
  // doc: https://vuejs.org/v2/guide/custom-directive.html
  inserted(el, binding, vnode) {
    if (enableIntsecObs) {
      let observer = vnode.context[intsecObsKey];
      if (observer instanceof IntersectionObserver) {
        observe(el, observer);
      } else {
        logError("Provide `" + binding.name + "` Intersection Observer through `" + intsecObsKey + "` property")
      }
    }
  },

  update(el, binding, vnode, oldVnode) {
    if (enableIntsecObs) {
      let observer = vnode.context[intsecObsKey];
      let oldObserver = oldVnode.context[intsecObsKey];
      let isSameObserver = observer === oldObserver;

      if (isSameObserver) {
        return;
      } else {
        unobserve(el, oldObserver);
        observe(el, observer);
      }
    }
  },

  unbind(el) {
    if (enableIntsecObs) {
      unobserve(el, el[intsecObsCacheKey]);
    }
  }
};
