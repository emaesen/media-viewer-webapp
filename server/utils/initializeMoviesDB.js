const app = require('../src/app')
const { getVideoAssets } = require('./getMediaAssets')
//console.log({app})

const userid = process.env.OWNER_ID

if (!userid) {
  console.error("initializeMoviesDB Error: No userid defined. Please export OWNER_ID")
  return
}

async function findUser() {
  const user = await app.service('users').get(userid)
  return user
}


async function createMovies() {

  const user = await findUser()
  console.log({user})

  const movies = await getVideoAssets()
  //console.log({movies})

  movies.forEach(movie => {
    createMovie(movie, user)
  })
}

async function createMovie(data, user) {
  try {
    // for some reason, the feathers service is not correctly setting
    // the ownerId property, so we explicitly add it here:
    movie.ownerId = user._id
    const movie = await app.service('movies').create(data, user)
    console.log("initializeMoviesDB Info: movie added: ", movie.path)
  } catch(err) {
    console.error("initializeMoviesDB Error: ", err.errorType, err.key)
  }
}

module.exports.createMovies = createMovies

// allow command line execution:
// `node getMediaAssets.js`
if(require.main == module) createMovies()
