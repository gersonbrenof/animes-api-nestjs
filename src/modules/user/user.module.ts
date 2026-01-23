import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 🔹 importa a entidade
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // 🔹 exporta para outros módulos
})
export class UserModule {}
