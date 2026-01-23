import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer'; // 🔹 IMPORTAR O TIPO DIRETO DE MULTER
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Anime')
@ApiBearerAuth()
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  // 🔹 Criar anime (apenas admin) com upload de imagem
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiOperation({ summary: 'Criar novo anime (somente admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Cadastro de anime com foto',
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Naruto' },
        descricao: { type: 'string', example: 'Anime de ninjas' },
        genero: { type: 'string', example: 'Ação' },
        foto: { type: 'string', format: 'binary' },
        data_lancamento: { type: 'number', example: 2002 },
      },
      required: ['titulo', 'descricao', 'genero'],
    },
  })
  create(@Body() createAnimeDto: CreateAnimeDto, @UploadedFile() foto?: Multer.File) {
    if (foto) {
      createAnimeDto.foto = `uploads/${foto.originalname}`; // 🔹 agora correto
    }
    return this.animeService.create(createAnimeDto);
  }

  // 🔹 Atualizar anime (apenas admin) com upload
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiOperation({ summary: 'Atualizar anime (somente admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Atualização de anime (pode incluir nova foto)',
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Naruto' },
        descricao: { type: 'string', example: 'Anime de ninjas' },
        genero: { type: 'string', example: 'Ação' },
        foto: { type: 'string', format: 'binary' },
        data_lancamento: { type: 'number', example: 2002 },
      },
    },
  })
  update(
    @Param('id') id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
    @UploadedFile() foto?: Multer.File,
  ) {
    if (foto) {
      updateAnimeDto.foto = `uploads/${foto.originalname}`;
    }
    return this.animeService.update(id, updateAnimeDto);
  }
// 🔹 Atualização Parcial (PATCH) - Apenas Admin
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiOperation({ summary: 'Atualizar parcialmente um anime (somente admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Envie apenas os campos que deseja alterar (título, descrição, foto, etc.)',
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', nullable: true },
        descricao: { type: 'string', nullable: true },
        genero: { type: 'string', nullable: true },
        foto: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  updatePartial(
    @Param('id') id: number,
    @Body() updateAnimeDto: UpdateAnimeDto,
    @UploadedFile() foto?: Multer.File,
  ) {
    // A lógica é a mesma: se veio foto nova, atualiza o caminho.
    // Se não veio foto, o service mantém a antiga (se o DTO estiver vazio nesse campo).
    if (foto) {
      updateAnimeDto.foto = `uploads/${foto.originalname}`;
    }
    
    return this.animeService.update(id, updateAnimeDto);
  }
  // 🔹 Listar todos os animes
@Get()
  @ApiOperation({ summary: 'Listar animes (filtro opcional por título ou gênero)' })
  @ApiQuery({ name: 'titulo', required: false, description: 'Filtrar por nome do anime' })
  @ApiQuery({ name: 'genero', required: false, description: 'Filtrar por categoria/gênero' })
  findAll(
    @Query('titulo') titulo?: string,
    @Query('genero') genero?: string,
  ) {
    return this.animeService.findAll(titulo, genero);
  }

  // 🔹 Buscar anime por ID
  @Get(':id')
  @ApiOperation({ summary: 'Buscar anime pelo ID' })
  @ApiResponse({ status: 200, description: 'Anime retornado com sucesso' })
  findOne(@Param('id') id: number) {
    return this.animeService.findOne(id);
  }

  // 🔹 Deletar anime (apenas admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deletar anime (somente admin)' })
  remove(@Param('id') id: number) {
    return this.animeService.remove(id);
  }
}
