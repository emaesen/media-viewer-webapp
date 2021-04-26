const app = require('../src/app')

const userid = process.env.OWNER_ID
const query = {
  $select: ['path', "_id"]
}
if (!userid) {
  console.error("getDBMovies Error: No userid defined. Please export OWNER_ID")
  return
}

async function findUser() {
  const user = await app.service('users').get(userid)
  return user
}

async function getMovies() {
  try {
    const user = await findUser()
    //console.log({user})
    //https://docs.feathersjs.com/api/services.html#params
    const movies = await app.service('movies').find({user, query})
    const pathList = movies.data.map(m => m.path)
    console.log("getDBMovies Info: movies in DB: ", pathList)
    return pathList
  } catch(err) {
    console.error("getDBMovies Error: ", err.errorType, err.key)
  }
}


module.exports.getMovies = getMovies

// allow command line execution:
// `node utils/getDBMovies.js`
if(require.main == module) getMovies()