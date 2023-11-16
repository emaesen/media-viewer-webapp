
const doLog = process.env.NODE_ENV==="development" || 
              process.env.VUE_APP_LOG==="debug";

function padZeros(n, td) {
  var ns = n.toString(),
    l = ns.length,
    z = "";
  if (td > l) {
    for (var i = l; i < td; i++) {
      z += "0";
    }
  }
  return z + ns;
}

function timeStamp(){
  const date = new Date()
  return padZeros(date.getHours(),2) + ":" + 
         padZeros(date.getMinutes(),2) + ":" + 
         padZeros(date.getSeconds(),2) + ":" +
         padZeros(date.getMilliseconds(),4)
}

export function logMessage(text, ...args) {
  if(doLog) {
    console.log(timeStamp() + " \x1b[32m%s\x1b[0m", text, ...args)
  }
}

export function logWarning(text, ...args) {
  if(doLog) {
    console.warn(timeStamp() + " \x1b[34m%s\x1b[0m", text, ...args)
  }
}

export function logError(text, ...args) {
  if(doLog) {
    console.error(timeStamp() + " \x1b[31m%s\x1b[0m", text, ...args)
  }
}
