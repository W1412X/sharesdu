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
  return locks[name];
}

export async function waitForLock(name) {
    if (getLock(name)) {
      await new Promise(resolve => setTimeout(resolve, 500));  // 每隔 1 秒检查一次
      await waitForLock(name);
    }
  }