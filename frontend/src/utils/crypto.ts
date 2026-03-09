import CryptoJS from 'crypto-js';

// Bu kalitni idealda .env dan olish kerak, lekin frontendda u baribir ochiq bo'ladi.
// Obfuscation bilan birga bu ancha murakkablashadi.
const SECRET_KEY = 'KinoTime_Secret_Key_2026_@!';

/**
 * Ma'lumotni shifrlaydi (AES)
 */
export const encryptData = (data: any): string => {
    try {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return data;
    }
};

/**
 * Shifrlangan ma'lumotni ochadi
 */
export const decryptData = (ciphertext: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        // console.error('Decryption error:', error);
        return ciphertext; // Agar shifrlanmagan bo'lsa o'zini qaytaradi
    }
};

/**
 * URL uchun xavfsiz shifrlash (AES + base64 replacement)
 */
export const encryptUrlId = (id: string | number): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString();
        // URL uchun xavfli belgilarni almashtiramiz
        return encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (error) {
        return id.toString();
    }
};

/**
 * URL dan kelgan shifrlangan ID ni ochish
 */
export const decryptUrlId = (encryptedId: string): string => {
    try {
        // Almashtirilgan belgilarni qaytaramiz
        let base64 = encryptedId.replace(/-/g, '+').replace(/_/g, '/');
        // Padding qo'shamiz (agar kerak bo'lsa)
        while (base64.length % 4 !== 0) base64 += '=';

        const bytes = CryptoJS.AES.decrypt(base64, SECRET_KEY);
        const originalId = bytes.toString(CryptoJS.enc.Utf8);
        return originalId;
    } catch (error) {
        return encryptedId;
    }
};
