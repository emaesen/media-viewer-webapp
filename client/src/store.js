import Vue from "vue";
import Vuex from "vuex";
import feathersVuex from "feathers-vuex";
import feathersClient from "./feathers-client";

import { logMessage } from '@/utils/logger.js'

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, {
  idField: "_id"
});
const movieBasePath = "/media/movies/"

Vue.use(Vuex);
Vue.use(FeathersVuex);

feathersClient.service('movies')
  .hooks({
    after: {
      find: [
        context => {
          // https://feathers-vuex-v1.netlify.app/common-patterns.html#accessing-the-store-from-hooks
          context.result.data.map(m => {
            // add some properties that are UI-specific and will be 
            // prevented in movies.hooks.js from persistence to DB.

            // Calculate some sort of "quality factor"
            let qf = 4*1000*1000*m.meta.sizeInMB / m.meta.durationInSec / m.meta.height / m.meta.width
            qf = qf.toFixed(1)
            m.ui = {
              src: movieBasePath + m.path,
              qf: qf
            }
            // metaDurationInSec and sortName are used for filtering
            // and need to be at the top level 
            m.metaDurationInSec = 1 * m.meta.durationInSec
            m.sortName = m.basename.toLowerCase().replaceAll(/[-_+]/gi,"").replace(".mp4","")
          })
          logMessage("store-movies - after_find hook", context)
        }
      ]
    }
  })


export default new Vuex.Store({
  state: {
    timeTick: new Date().getTime(),
  },
  getters: {
    timeTick: state => state.timeTick,
  },
  mutations: {
    // can be used directly for synchronous events
    SET_TIME_TICK: (state, tick) => (state.timeTick = tick),
  },
  actions: {
    // for async functionality - commit a mutation
    // e.g. setTimeTick: (context, tick) => context.commit("SET_TIME_TICK", tick)
  },
  plugins: [
    service("users", {
      instanceDefaults: {
        username: "",
        password: ""
      }
    }),
    service("movies", {
      instanceDefaults: {
        path: "",
        basename: "",
        meta: {},
        level1: "",
        rating: 0,
        ui: {},
        watchedAt: null
      }
    }),
    service("music", {
      instanceDefaults: {
      }
    }),
    // Setup the auth plugin.
    auth({ userService: "users" })
  ]
});
