const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-authentication-hooks');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `before-find` hook", context.params.query)
        return context
      }
    ],
    get: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `before-get` hook", context.params.query)
        return context
      }
    ],
    create: [
      hooks.associateCurrentUser({
        as: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `before-create` hook", context.data.path)
        return context
      }
    ],
    update: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        // prevent ui-specific properties from cluttering the DB
        delete context.data.ui
        console.log("in movies `before-update` hook", context.data)
        return context
      }
    ],
    patch: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `before-patch` hook", context.data)
        return context
      }
    ],
    remove: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `before-remove` hook", context.data)
        return context
      }
    ]
  },

  after: {
    all: [],
    find: [
      async function(context) {
        console.log("in movies `after-find` hook", {total: context.result.total})
        return context
      }
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
