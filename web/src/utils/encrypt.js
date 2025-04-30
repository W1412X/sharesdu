export function encrypt(input) {
    console.log('encrypt', input);
    if (input === null || input === undefined || input === '') {
        return input;
    }
    let encrypted = '';
    for (let i = 0; i < input.length; i++) {
        let charCode = input.charCodeAt(i);
        encrypted += String.fromCharCode((charCode + 1) % 0x110000);
    }
    console.log('encrypted', encrypted);
    return encrypted;
}

export function decrypt(encrypted) {
    console.log('decrypt', encrypted);
    if (encrypted === null || encrypted === undefined || encrypted === '') {
        return encrypted;
    }
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
        let charCode = encrypted.charCodeAt(i);
        if (charCode === 0) {
            charCode = 0x110000 - 1;
        } else {
            charCode -= 1;
        }
        decrypted += String.fromCharCode(charCode);
    }
    console.log('decrypted', decrypted);
    return decrypted;
}
