import { 
  Body, 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Req, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { R2Service } from './r2.service'; // 👈 Importa o novo serviço do R2
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user.entity';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly r2Service: R2Service, // 👈 Injeta o R2Service aqui
    ) {}

    // cria um usuario normal
    @Post()
    @ApiOperation({ summary: 'Registrar um novo usuário comum' })
    create(@Body() dto: CreateUserDto) {
        return this.userService.createUser(
            dto.nome, 
            dto.email, 
            dto.password, 
            UserRole.USER
        );
    }

    // cria um usuario admin
    @Post('admin')
    @ApiOperation({ summary: 'Registrar um novo usuário administrador' })
    createAdmim(@Body() dto: CreateUserDto) {
        return this.userService.createUser(
            dto.nome,
            dto.email,
            dto.password,
            UserRole.ADMIN
        );
    }

    // Rota para VISUALIZAR o próprio perfil
    @Get('profile')
    @UseGuards(AuthGuard('jwt')) // 🔒 Exige Token JWT
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obter o perfil do usuário autenticado' })
    async getProfile(@Req() req) {
        const userId = req.user.id; 
        return this.userService.getProfile(userId);
    }

    // Rota para EDITAR o próprio perfil (nome, email ou senha)
    @Patch('profile')
    @UseGuards(AuthGuard('jwt')) // 🔒 Exige Token JWT
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar informações textuais do perfil do usuário autenticado' })
    async updateProfile(
        @Req() req,
        @Body() dto: UpdateUserDto,
    ) {
        const userId = req.user.id;
        return this.userService.update(userId, dto);
    }

    // 👇 ADICIONADO: Nova rota para fazer upload da foto de perfil diretamente (PNG/JPEG)
    @Patch('profile/avatar')
    @UseGuards(AuthGuard('jwt')) // 🔒 Exige Token JWT
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file')) // Captura o arquivo com a chave 'file' no form-data
    @ApiConsumes('multipart/form-data') // Habilita o multipart/form-data no Swagger
    @ApiOperation({ summary: 'Fazer upload da foto de perfil diretamente para o Cloudflare R2' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary', // Renderiza o botão de selecionar arquivo no Swagger
            description: 'Selecione um arquivo de imagem (JPEG/PNG)',
          },
        },
      },
    })
    async uploadAvatar(
      @Req() req,
      @UploadedFile() file: Express.Multer.File, // Captura o arquivo interceptado
    ) {
      const userId = req.user.id;

      // 1. Faz o upload do buffer da imagem para o Cloudflare R2 e obtém a URL pública
      const fotoUrl = await this.r2Service.uploadFile(file);

      // 2. Salva a nova URL da foto gerada pelo R2 na coluna 'foto' do usuário no banco
      return this.userService.update(userId, { foto: fotoUrl });
    }
}