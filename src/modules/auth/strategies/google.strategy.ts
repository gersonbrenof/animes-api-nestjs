import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const googleCallback = configService.get<string>('GOOGLE_CALLBACK_URL');

    // 📌 LOG DE DIAGNÓSTICO: Agora dentro do constructor
    console.log('📌 GOOGLE_CALLBACK_URL LIDO DO ENV:', googleCallback);

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: googleCallback,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // 🕵️ ESPIONAGEM: Mostra no terminal tudo o que o Google enviou
    console.log('\n--- 🕵️ DADOS RECEBIDOS DO GOOGLE ---');
    console.log(JSON.stringify(profile, null, 2));
    console.log('--------------------------------------\n');

    try {
      const { name, emails, photos } = profile;
      
      // Blindagem: Lendo os dados com segurança para não quebrar se algo vier vazio
      const user = {
        email: emails && emails.length > 0 ? emails[0].value : null,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos && photos.length > 0 ? photos[0].value : null,
        accessToken,
      };
      
      console.log('✅ USUÁRIO FORMATADO NA STRATEGY:', user);
      done(null, user);
    } catch (error) {
      console.error('❌ ERRO DENTRO DA GOOGLE STRATEGY:', error);
      done(error, false);
    }
  }
}