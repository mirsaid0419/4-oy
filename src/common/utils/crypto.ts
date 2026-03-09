import * as CryptoJS from 'crypto-js';

// Backendda bu kalit .env dan kelishi shart.
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'KinoTime_Secret_Key_2026_@!';

/**
 * Ma'lumotni shifrlaydi (AES)
 */
export const encryptData = (data: any): string => {
    try {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    } catch (error) {
        return data;
    }
};

/**
 * Shifrlangan ma'lumotni ochadi
 */
export const decryptData = (ciphertext: string): any => {
    try {
        // Agar ciphertext o'zi bo'sh bo'lsa
        if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;

        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) return ciphertext; // Decode xatoligi bo'lsa

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        return ciphertext;
    }
};
