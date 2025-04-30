export function encrypt(input) {
    if (input == null || input == undefined || input == '') {
        return input;
    }
    let encrypted = '';
    for (let i = 0; i < input.length; i++) {
        let charCode = input.charCodeAt(i);
        encrypted += String.fromCharCode((charCode + i) % 0x110000);
    }
    return encrypted;
}

export function decrypt(encrypted) {
    if (encrypted == null || encrypted == undefined || encrypted == '') {
        return encrypted;
    }
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
        let charCode = encrypted.charCodeAt(i);
        let originalCharCode = (charCode - i + 0x110000) % 0x110000;
        decrypted += String.fromCharCode(originalCharCode);
    }
    return decrypted;
}