/**
 * do to avoid much requests try to get the access token  
 */
let locks={
    token:false,
};

export function setLock(name,value) {
  locks[name] = value;
}

export function getLock(name) {
  if(locks[name]==undefined){
    return false;
  }
  return locks[name];
}

/**
 * try to get the lock and wait for the lock
 * @param {String} key 
 * @returns 
 */
export async function acquireLock(key) {
  // eslint-disable-next-line
  while (true) {
    if (!getLock(key)) {
      setLock(key, true);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * release lock
 * @param {String} key 
 */
export function releaseLock(key) {
  setLock(key, false);
}

/**
 * just wait the lock  
 * @param {String} name 
 */
export async function waitForLock(name) {
  while(getLock(name)){
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}