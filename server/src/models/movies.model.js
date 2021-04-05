const NeDB = require('nedb');
const path = require('path');

module.exports = function(app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'movies.db'),
    timestampData: true,
    autoload: true
  });

  // eslint-disable-next-line no-unused-vars
  Model.ensureIndex({ fieldName: 'path', unique: true }, function(err) {
    // handle errors...
    // err.errorType, err.key, err.message
    if (err) {
      console.log("movies.model ensureIndex error", err);
    }
  });

  return Model;
};
