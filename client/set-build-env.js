//const path = require('path')
const readdirp = require('readdirp')
const fse = require('fs-extra')

const ENV_FILE = ".env"
const BUILD_PROP = "VUE_APP_BUILD_AT"
const LEVELS1_PROP = "VUE_APP_LEVELS1"
const LEVELS2_PROP = "VUE_APP_LEVELS2"
const LEVELS3_PROP = "VUE_APP_LEVELS3"

const moviesFolder = "./public/media/movies"
const settings = {
  depth: 5,
  type: 'directories',
  alwaysStat: false,
  lstat: false
};

const uniqueFilter = (value, index, self) => {
  return self.indexOf(value) === index
}

async function setBuildInfo() {
  await fse.ensureFile(ENV_FILE)
  let buildData = getBuildInfo()
  let levelsData = await getMovieLevels()
  const data = buildData + '\n' + levelsData
  await fse.outputFile(ENV_FILE, data, 'utf-8')
  console.log('INFO: updating file ' + ENV_FILE + ':\n' + data)
}

function getBuildInfo() {
  const options = { dateStyle: "medium", timeStyle: "short" }
  const now =(new Date()).toLocaleString('en-US', options)
  let data = BUILD_PROP + "=" + now
  return data
}


async function getMovieLevels() {
  if (moviesFolder) {
    // Iterate recursively through a moviesFolder
    // Node.js V9.0.0 implementation:
    let levels1 = []
    let levels2 = []
    let levels3 = []
    allFolders = await readdirp.promise(moviesFolder, settings)
    allFolders.forEach( entry => {
        //console.log('set-build-env entry:', entry)
        entry.path = entry.path.replace(/\\/g, '/')
        const splitPath = entry.path.split('/')
        if (splitPath[0]) levels1.push(splitPath[0])
        if (splitPath[1]) levels2.push(splitPath[1])
        if (splitPath[2]) levels3.push(splitPath[2])
      }
    )

    levels1 = levels1.filter(uniqueFilter)
    levels2 = levels2.filter(uniqueFilter)
    levels3 = levels3.filter(uniqueFilter)

    let data = LEVELS1_PROP + "=" + levels1.join(",") + "\n" +
               LEVELS2_PROP + "=" + levels2.join(",") + "\n" +
               LEVELS3_PROP + "=" + levels3.join(",") + "\n"
    //console.log('set-build-env levels:', data)
    return data
  } 
}

setBuildInfo()
