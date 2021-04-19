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
        console.log("in movies `find` hook", context.params.query)
        return context
      }
    ],
    get: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `get` hook", context.params.query)
        return context
      }
    ],
    create: [
      hooks.associateCurrentUser({
        as: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `create` hook", context.data)
        return context
      }
    ],
    update: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `update` hook", context.data)
        return context
      }
    ],
    patch: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      })
    ],
    remove: [
      hooks.restrictToOwner({
        ownerField: 'ownerId'
      }),
      async function(context) {
        console.log("in movies `remove` hook", context.data)
        return context
      }
    ]
  },

  after: {
    all: [],
    find: [],
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
