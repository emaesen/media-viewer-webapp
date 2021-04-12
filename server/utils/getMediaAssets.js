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

let allFiles = []

async function getVideoAssets() {
  if (folder) {
    console.log('getMediaAssets folder:', folder)
    // Iterate recursively through a folder
    for await (let entry of readdirp(folder, settings)) {
      try {
        const file = entry.fullPath
        const fd = await fse.open(file, 'r')
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
        //console.log('getMediaAssets movie', entry)
        allFiles.push(entry)
        fse.closeSync(fd)
      } catch (err) {
        console.error('getMediaAssets Error:', err)
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
