const app = require('./src/app')
const { getVideoAssets } = require('./utils/getMediaAssets')
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
  
  // The movies service call params (with the user we just created)
  const params = { user }

  const movies = await getVideoAssets()
  //console.log({movies})

  movies.forEach(movie => {
    createMovie(movie, user)
  })
}

async function createMovie(data, user) {
  try {
    const movie = await app.service('movies').create(data, user)
    console.log("initializeMoviesDB Info: movie created ", movie.path)
  } catch(err) {
    console.error("initializeMoviesDB Error: ", err.errorType, err.key)
  }
}

createMovies()