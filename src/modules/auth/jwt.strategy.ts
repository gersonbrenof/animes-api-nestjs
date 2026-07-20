import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET não definido no .env');

        super({
            // 👇 A MUDANÇA ESTÁ AQUI: Extratores separados, dando prioridade ao Bearer
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(), // 1º Prioridade: Cabeçalho Authorization
                (req: Request) => {                       // 2º Prioridade: Cookies de sessão antiga
                    return req?.cookies?.access_token || null;
                },
            ]),
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const userId = Number(payload.sub); 
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role, 
        };
    }
}