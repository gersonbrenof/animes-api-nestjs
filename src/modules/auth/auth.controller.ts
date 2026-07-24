import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService, 
  ) {}
@Get('me')
@UseGuards(AuthGuard('jwt')) // Garante que o usuário esteja logado
async getMe(@Req() req) {
  return req.user; // O Passport injeta o usuário aqui
}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

@Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(loginDto.email, loginDto.password);
    
    // 1. Define o token no cookie (segurança)
    this.setAuthCookie(res, access_token);
    
    // 2. Retorna o token e o usuário no JSON (para o seu Frontend usar)
    return { 
      access_token, // ✅ Adicione o token aqui
      user 
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res: Response) {
  const authData = await this.authService.validateGoogleUser(req.user);
  
  this.setAuthCookie(res, authData.access_token);

  const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  
  // 🟢 Redireciona para a rota do Callback no React enviando o token
  return res.redirect(`${frontendUrl}/auth/callback?token=${authData.access_token}`);
}
  // MÉTODO AUXILIAR PRIVADO DE SEGURANÇA
  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true, // Protege contra XSS
      secure: process.env.NODE_ENV === 'production', // Só HTTPS em prod
      sameSite: 'lax', // Protege contra CSRF
      maxAge: 3600000 * 24, // 24 horas
      path: '/'
    });
  }
}