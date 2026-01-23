import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { access } from 'fs';
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

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role, // ✅ mostra a permissão
            },
        };
    }
    async register(dto: CreateUserDto) {
        try {
            const user = await this.userService.createUser(dto.email, dto.password);
            const { password, ...result } = user; // 🔹 remove a senha antes de retornar
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}