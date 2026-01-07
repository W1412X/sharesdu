/**
 * 因为缓存是内存存储
 * 所以恢复状态与缓存保持一致，改为内存存储
 */
class StateStorage{
    constructor() {
        this.stateStorage = new Map();
    }
    getItem(key) {
        console.log("getItem",key,this.stateStorage.get(key));
        return this.stateStorage.get(key);
    }
    setItem(key, value) {
        console.log("setItem",key,value);
        this.stateStorage.set(key, value);
    }
    removeItem(key) {
        this.stateStorage.delete(key);
    }
    clear() {
        this.stateStorage.forEach((value, key) => {
            this.stateStorage.delete(key);
        });
    }
}
const stateStorage = new StateStorage();
export default stateStorage;