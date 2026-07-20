import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; //  Adicionado para ler as credenciais do .env
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { R2Service } from './r2.service'; //  Adicionado o serviço do Cloudflare R2

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 🔹 importa a entidade
    ConfigModule, // 👈 Permite que o R2Service injete o ConfigService
  ], 
  providers: [
    UserService, 
    R2Service, // 👈 Registra o serviço de upload do R2
  ],
  controllers: [UserController],
  exports: [UserService], // 🔹 exporta para outros módulos
})
export class UserModule {}