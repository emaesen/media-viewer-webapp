/* very basic persistence logic */

const localStore = (typeof window !== 'undefined') && window.localStorage
const sessionStore = (typeof window !== 'undefined') && window.sessionStorage
const paginationState_Key = "vm:pagination-state"


/* generic functions */

function persistSessionData(key, value) {
  sessionStore && sessionStore.setItem(key, value)
}

function retrieveSessionData(key) {
  return sessionStore && sessionStore.getItem(key)
}

function clearSessionData(key) {
  return sessionStore && sessionStore.removeItem(key)
}

function persistLocalData(key, value) {
  localStore && localStore.setItem(key, value)
}

function retrieveLocalData(key) {
  return localStore && localStore.getItem(key)
}

function clearLocalData(key) {
  return localStore && localStore.removeItem(key)
}

function ensureNumber(val, curVal) {
  if (val !== null) {
    return 1 * val
  } else {
    return curVal
  }
}

function ensureBoolean(val, curVal) {
  if (val !== null) {
    if (val===1 || val==="true" || val===true) {
      return true
    } else {
      return false
    }
  } else {
    return curVal
  }
}

function ensureObject(val, curVal) {
  if (val !== null) {
    return val
  } else {
    return curVal
  }
}

/* get/set pagination state object */

export function persistPaginationState(obj) {
  const value = JSON.stringify(obj)
  persistLocalData(paginationState_Key, value)
}

export function retrievePaginationState(curObj) {
  if (curObj === undefined) {
    const value = retrieveLocalData(paginationState_Key)
    return JSON.parse(value)
  } else {
    const persistedPaginationState = retrievePaginationState()
    return ensureObject(persistedPaginationState, curObj)
  }
}

export function clearPaginationState() {
  clearLocalData(paginationState_Key)
}

export function hasPaginationState() {
  return retrievePaginationState() !== null
}

