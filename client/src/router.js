import Vue from "vue";
import Router from "vue-router";

import store from "./store";

Vue.use(Router);

function checkAuth(to, from, next, target) {
  store
    .dispatch("auth/authenticate")
    .then(() => {
      console.log("authenticated ...");
      // authentication succeeded
      // if target is defined, redirect to target, else stay on page
      next(target);
    })
    .catch(() => {
      console.log("not authenticated ...");
      // authentication failed
      // redirect to login
      next("/login");
    });
}
function logOut(to, from, next) {
  console.log("logging out...");
  store.dispatch("auth/logout").then(() => {
    // Clear the store state of data services
    // to prevent data from previous logins to bleed through
    // when one user logs out and another logs in, in the same tab.
    store.commit("movies/clearAll");
    store.commit("music/clearAll");
    next();
  });
}

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: () =>
        import(/* webpackChunkName: "home" */ "./views/Home.vue"),
      beforeEnter(to, from, next) {
        checkAuth(to, from, next, "movies");
      },
      meta: {
        title: "Media Viewer"
      }
    },
    {
      path: "/register",
      name: "register",
      component: () =>
        import(/* webpackChunkName: "register" */ "./views/Register.vue"),
      beforeEnter(to, from, next) {
        logOut(to, from, next);
      },
      meta: {
        title: "Register - Media Viewer"
      }
    },
    {
      path: "/login",
      name: "login",
      component: () =>
        import(/* webpackChunkName: "login" */ "./views/Login.vue"),
      beforeEnter(to, from, next) {
        logOut(to, from, next);
      },
      meta: {
        title: "Login - Media Viewer"
      }
    },
    {
      path: "/movies",
      name: "movies",
      component: () =>
        import(/* webpackChunkName: "movies" */ "./views/Movies.vue"),
      beforeEnter: checkAuth,
      meta: {
        title: "Movies - Media Viewer"
      }
    },
  ]
});


export default router;
