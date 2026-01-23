import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET não definido no .env');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const userId = Number(payload.sub); // 🔹 converte para number
        const user = await this.userService.findById(userId);
        console.log('====================================');
        console.log('DEBUG JWT STRATEGY:');
        console.log('1. ID do Payload:', userId);
        console.log('2. Objeto User vindo do Service:', user);
        console.log('3. Role específica:', user?.role);
        console.log('====================================');

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        // 🔹 Retornando explicitamente id, email e role
        return {
            id: user.id,
            email: user.email,
            role: user.role, // essencial para o RolesGuard
        };

    }
}
