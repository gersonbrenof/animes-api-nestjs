import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

// O 'PartialType' herda 'nome', 'email' e 'password' do CreateUserDto, tornando-os opcionais.
export class UpdateUserDto extends PartialType(CreateUserDto) {
  
  @ApiPropertyOptional({ 
    description: 'URL pública da foto de perfil hospedada no Cloudflare R2', 
    example: 'https://pub-8725ec97647c4965b73927e2a34e439f.r2.dev/foto-usuario.jpg' 
  })
  @IsString()
  @IsOptional()
  foto?: string; // Aceita a URL da foto retornada pelo R2
}