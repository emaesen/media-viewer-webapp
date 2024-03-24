
const { getMovies } = require('./getDBMovies')

const readdirp = require('readdirp')
const fs = require('fs')
const VideoLib = require('node-video-lib')


// https://www.npmjs.com/package/readdirp
const folder = "../client/public/media/movies"
const settings = {
  fileFilter: ['*.mp4'],
  depth: 5,
  type: 'files',
  alwaysStat: false,
  lstat: false
};
const nodeVersion = process.version
console.log("INFO: nodeVersion = ", nodeVersion)

let allFiles = []

function parseMovieFile(entry, fd) {
  const movie = VideoLib.MovieParser.parse(fd)
  const resolution = movie.resolution().split('x')
  const width = resolution[0]
  const height = resolution[1]
  const meta = {
    durationInSec: movie.relativeDuration().toFixed(0),
    width: width,
    height: height,
    sizeInMB: (movie.size() / 1000 / 1000).toFixed(1)
  }
  entry.meta = meta
  const splitPath = entry.path.split('/')
  splitPath.pop()
  if (splitPath[0]) entry.level1 = splitPath[0]
  if (splitPath[1]) entry.level2 = splitPath[1]
  if (splitPath[2]) entry.level3 = splitPath[2]
  // random number
  entry.rnr = Math.round(Math.random()/Math.max(Math.random(), 0.01)*1e5)
  // remove what we don't need
  delete entry.dirent
  delete entry.fullPath
  delete entry.stats
  console.log('getMediaAssets movie:', entry)
  return entry
}

async function getVideoAssets() {
  const moviePathsInDB = await getMovies()
  //console.log("getMediaAssets Info: movies in DB: ", moviePathsInDB)

  if (folder) {
    console.log('getMediaAssets folder:', folder)
    // Iterate recursively through a folder
    // Node.js V9.0.0 implementation:

    allFiles = await readdirp.promise(folder, settings)
    //console.log('getMediaAssets movies readdirp:', allFiles)
    allFiles = allFiles
      .filter(entry => {
          entry.path = entry.path.replace(/\\/g, '/')
          const isAlreadyInDB = moviePathsInDB.indexOf(entry.path)>=0
          if (isAlreadyInDB) {
            console.log("getMediaAssets Info: is already in DB:", entry.path)
          }
          return !isAlreadyInDB
      })
      .map( entry => {
        try {
          const file = entry.fullPath
          console.log('getMediaAssets opening file:', file)
          const fd = fs.openSync(file, 'r')
          entry = parseMovieFile(entry, fd)
          fs.closeSync(fd)
        } catch (err) {
          console.error('getMediaAssets Error:', err)
        }
        return entry
      })
   
    //console.log('getMediaAssets movies:', allFiles)
    return allFiles
  } else {
    console.error("getMediaAssets Error: No video assets folder defined. Please export VIDEOS_FOLDER")
  }
}

module.exports.getVideoAssets = getVideoAssets

// allow command line execution:
// `node utils/getMediaAssets.js`
if(require.main == module) getVideoAssets()
