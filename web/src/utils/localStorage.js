import { decrypt, encrypt } from "./encrypt";

class LocalStorage{
    constructor() {
        this.localStorage = window.localStorage;
    }
    getItem(key) {
        key=encrypt(key);
        return decrypt(this.localStorage.getItem(key));
    }
    setItem(key, value) {
        key=encrypt(key);
        value=encrypt(value);
        this.localStorage.setItem(key, value);
    }
    removeItem(key) {
        key=encrypt(key);
        this.localStorage.removeItem(key);
    }
    clear() {
        this.localStorage.clear();
    }
}

export const selfDefineLocalStorage = new LocalStorage();