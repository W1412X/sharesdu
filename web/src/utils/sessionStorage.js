import { decrypt, encrypt } from "./encrypt";

class SessionStorage{
    constructor() {
        this.sessionStorage = window.sessionStorage;
    }
    getItem(key) {
        key=encrypt(key);
        return decrypt(this.sessionStorage.getItem(key));
    }
    setItem(key, value) {
        key=encrypt(key);
        value=encrypt(value);
        this.sessionStorage.setItem(key, value);
    }
    removeItem(key) {
        key=encrypt(key);
        this.sessionStorage.removeItem(key);
    }
    clear() {
        this.sessionStorage.clear();
    }
}

export const selfDefinedSessionStorage = new SessionStorage();