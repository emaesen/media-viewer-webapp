const readdirp = require('readdirp')
const fse = require('fs-extra')
const VideoLib = require('node-video-lib')

// https://www.npmjs.com/package/readdirp
const folder = '/test-symlink/videos'
const settings = {
  fileFilter: ['*.mp4'],
  depth: 5,
  type: 'files',
  alwaysStat: false,
  lstat: false
};

let allFiles = []

async function getVideoAssets() {
  // Iterate recursively through a folder
  for await (const entry of readdirp(folder, settings)) {
    try {
      const file = entry.fullPath
      const fd = await fse.open(file, 'r')
      const movie = VideoLib.MovieParser.parse(fd)
      const meta = {
        durationInSec: movie.relativeDuration().toFixed(0),
        resolution: movie.resolution(),
        sizeInMB: (movie.size() / 1000 / 1000).toFixed(1)
      }
      entry.meta = meta
      const splitPath = entry.path.split('\\').reverse()
      entry.splitPath = splitPath
      delete entry.dirent
      //console.log('getVideoAssets movie', entry)
      allFiles.push(entry)
      fse.closeSync(fd)
    } catch (err) {
      console.error('getVideoAssets Error:', err)
    }
  }
  return allFiles
}

async function videoAssets() {
  const assets = await getVideoAssets()
  console.log(assets)
  return assets
}

module.exports.videoAssets = videoAssets

// allow command line execution:
// `node getMediaAssets.js`
if(require.main == module) videoAssets()
