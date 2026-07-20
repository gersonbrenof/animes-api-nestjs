import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy'; // 👈 IMPORTADO: Se salvou na mesma pasta do JwtStrategy, mude o caminho para './google.strategy'
import { UserModule } from '../user/user.module'; // importa UserModule

@Module({
  imports: [
    ConfigModule, 
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // sua chave do .env
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserModule, // 🔹 necessário para injetar UserService
  ],
  // 👇 ADICIONADO: GoogleStrategy registrado na lista de provedores do módulo
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}