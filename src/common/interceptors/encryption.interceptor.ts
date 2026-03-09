import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { decryptData, encryptData } from '../utils/crypto';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const noEncryption = request.headers['x-no-encryption'] === 'true';

        // 1. Kiruvchi ma'lumotni ochish (Decryption)
        if (!noEncryption && request.body && request.body.encrypted) {
            try {
                const decrypted = decryptData(request.body.encrypted);
                if (decrypted) {
                    request.body = decrypted;
                }
            } catch (e) {
                // Decryption failed
            }
        }

        // 2. Chiquvchi ma'lumotni shifrlash (Encryption)
        return next.handle().pipe(
            map((data) => {
                if (noEncryption) return data;

                // Agar data obyekt bo'lsa va binary emas bo'lsa shifrlaymiz
                if (data && typeof data === 'object' && !(data instanceof Buffer)) {
                    return encryptData(data);
                }
                return data;
            }),
        );
    }
}
