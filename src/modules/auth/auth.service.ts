import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email ou senha inválidos');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou senha inválidos');

    const payload = {
        sub: user.id,
        role: user.role,
    };

    // ✅ O retorno deve incluir o token na raiz, junto com o objeto user
    return {
        access_token: this.jwtService.sign(payload), // Este é o token que estava faltando
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
}

    async register(dto: CreateUserDto) {
        try {
            const user = await this.userService.createUser(dto.nome, dto.email, dto.password);
            const { password, ...result } = user; // 🔹 remove a senha antes de retornar
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            throw new BadRequestException(message);
        }
    }

    // 👇 ADICIONADO: Esse método vai salvar/logar os dados do Google perfeitamente
  async validateGoogleUser(googleUser: any) {
        if (!googleUser) {
            throw new BadRequestException('Dados do usuário do Google não fornecidos.');
        }

        // 🟢 CORREÇÃO: O Google Passport geralmente retorna os dados assim:
        // emails: [{ value: '...' }], name: { givenName: '...', familyName: '...' }, photos: [{ value: '...' }]
        
        const email = googleUser.email || (googleUser.emails && googleUser.emails.length > 0 ? googleUser.emails[0].value : null);
        
        let nomeCompleto = '';
        if (googleUser.firstName || googleUser.lastName) {
            nomeCompleto = `${googleUser.firstName || ''} ${googleUser.lastName || ''}`.trim();
        } else if (googleUser.displayName) {
            nomeCompleto = googleUser.displayName; // Formato padrão do Google
        } else if (googleUser.name) {
            nomeCompleto = `${googleUser.name.givenName || ''} ${googleUser.name.familyName || ''}`.trim();
        }

        const fotoUrl = googleUser.picture || (googleUser.photos && googleUser.photos.length > 0 ? googleUser.photos[0].value : null);

        if (!email) {
            // Log para você ver no terminal o que o Google realmente enviou se falhar
            console.error("DEBUG - Dados do Google recebidos:", googleUser); 
            throw new BadRequestException('Não foi possível obter o e-mail da conta do Google.');
        }

        // 1. Procura no seu UserService se o e-mail já existe
        let user = await this.userService.findByEmail(email);

        // 2. Se não existir, registra ele automaticamente
        if (!user) {
            // Geramos uma senha aleatória complexa com hash
            const senhaAleatoria = await bcrypt.hash(Math.random().toString(36).substring(2) + Date.now().toString(), 10);

            user = await this.userService.createUser(
                nomeCompleto || 'Usuário', // Garante que o nome não vá vazio
                email, 
                senhaAleatoria,
            );
        }

        // 3. Monta o Payload para o JWT
        const payload = {
            sub: user.id,
            role: user.role,
        };

        // 4. Retorna para o controlador
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                nome: user.nome,
                foto: fotoUrl
            },
        };
    }
}