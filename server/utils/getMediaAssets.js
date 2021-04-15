const readdirp = require('readdirp')
const fse = require('fs-extra')
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
  console.log('getMediaAssets movie:', entry)
  return entry
}

async function getVideoAssets() {
  if (folder) {
    console.log('getMediaAssets folder:', folder)
    // Iterate recursively through a folder
    // Node.js V9.0.0 implementation:
    if (nodeVersion.replace(/v/i, "").split(".")[0] <  10) {
      console.log("Node version prior to V10 detected")
      allFiles = await readdirp.promise(folder, settings)
      //console.log('getMediaAssets movies readdirp:', allFiles)
      allFiles = allFiles.map( entry => {
        try {
          const file = entry.fullPath
          const fd = fse.openSync(file, 'r')
          entry = parseMovieFile(entry, fd)
          fse.closeSync(fd)
          return entry
        } catch (err) {
          console.error('getMediaAssets Error:', err)
        }
      })

    } else {

      // `for await` requires nodejs V10+
      for await (let entry of readdirp(folder, settings)) {
        try {
          const file = entry.fullPath
          const fd = await fse.open(file, 'r')
          entry = parseMovieFile(entry, fd)
          fse.closeSync(fd)
          allFiles.push(entry)
        } catch (err) {
          console.error('getMediaAssets Error:', err)
        }
      }
    }
   
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
