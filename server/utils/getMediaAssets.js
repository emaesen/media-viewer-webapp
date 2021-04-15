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
  entry.path = entry.path.replace(/\\/g, '/')
  const splitPath = entry.path.split('/')
  splitPath.pop()
  entry.splitPath = splitPath
  // remove what we don't need
  delete entry.dirent
  delete entry.fullPath
  delete entry.stats
  console.log('getMediaAssets movie:', entry)
  return entry
}

async function getVideoAssets() {
  if (folder) {
    console.log('getMediaAssets folder:', folder)
    // Iterate recursively through a folder
    // Node.js V9.0.0 implementation:

    allFiles = await readdirp.promise(folder, settings)
    //console.log('getMediaAssets movies readdirp:', allFiles)
    allFiles = allFiles.map( entry => {
      try {
        const file = entry.fullPath
        const fd = fs.openSync(file, 'r')
        entry = parseMovieFile(entry, fd)
        fs.closeSync(fd)
        return entry
      } catch (err) {
        console.error('getMediaAssets Error:', err)
      }
    })
   
    //console.log('getMediaAssets movies:', allFiles)
    return allFiles
  } else {
    console.error("getMediaAssets Error: No video assets folder defined. Please export VIDEOS_FOLDER")
  }
}

module.exports.getVideoAssets = getVideoAssets

// allow command line execution:
// `node getMediaAssets.js`
if(require.main == module) getVideoAssets()
