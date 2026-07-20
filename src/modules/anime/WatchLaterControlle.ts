import { Controller, Get, Post, Delete, Param, ParseIntPipe, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express'; 
import { WatchLaterService } from './watch-later.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('Watch Later')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
@Controller('watch-later')
export class WatchLaterController {
    constructor(private readonly watchLaterService: WatchLaterService) { }

    private getUserId(req: any): string {
        const userId = req.user?.id || req.user?.sub || req.user?.userId; 
        
        if (!userId) {
            throw new UnauthorizedException('Usuário não autenticado ou token ausente.');
        }
        return String(userId);
    }

    @Post(':id')
    @ApiOperation({ summary: 'Adicionar anime à lista do usuário' })
    @ApiParam({ name: 'id', example: 5114, description: 'ID do anime' })
    async add(
        @Param('id', ParseIntPipe) animeId: number,
        @Req() req: Request, 
    ) {
        const userId = this.getUserId(req);
        return this.watchLaterService.addToList(userId, animeId);
    }

    @Get()
    @ApiOperation({ summary: 'Listar animes da lista do usuário logado' })
    async findAll(@Req() req: Request) {
        const userId = this.getUserId(req);
        return this.watchLaterService.getWatchList(userId);
    }

    // NOVA ROTA: Obter recomendações via IA
    @Get('recommendations')
    @ApiOperation({ summary: 'Obter recomendações de animes via IA baseadas na lista' })
    async getRecommendations(@Req() req: Request) {
        const userId = this.getUserId(req);
        return this.watchLaterService.getRecommendations(userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover um anime da lista do usuário' })
    @ApiParam({ name: 'id', example: 5114 })
    async remove(
        @Param('id', ParseIntPipe) animeId: number,
        @Req() req: Request,
    ) {
        const userId = this.getUserId(req);
        return this.watchLaterService.removeFromList(userId, animeId);
    }
}