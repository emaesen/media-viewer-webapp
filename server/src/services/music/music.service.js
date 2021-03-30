// Initializes the `music` service on path `/music`
const createService = require('feathers-nedb');
const createModel = require('../../models/music.model');
const hooks = require('./music.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/music', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('music');

  service.hooks(hooks);
};
