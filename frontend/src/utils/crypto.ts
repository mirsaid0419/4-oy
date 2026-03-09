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
