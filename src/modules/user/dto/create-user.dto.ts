import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto { 
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Gerson Otaku' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  nome!: string; // 👈 Adicionado o '!' aqui

  @ApiProperty({ description: 'Email do usuário', example: 'gerson@email.com' })
  @IsEmail({}, { message: 'Informe um email válido' })
  @IsNotEmpty()
  email!: string; // 👈 Adicionado o '!' aqui

  @ApiProperty({ description: 'Senha do usuário', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string; // 👈 Adicionado o '!' aqui
}