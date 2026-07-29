import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Middleware para ler cookies
  app.use(cookieParser());

  // 🔹 Trata origens do .env (suporta múltiplas URLs separadas por vírgula no FRONTEND_URL)
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : [];

  // 🔹 Lista de origens permitidas (Desenvolvimento Local + Produção)
  const allowedOrigins = [
    // Localhost na porta 3000 (IPv4 e IPv6)
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',

    // Localhost na porta 5173 (Vite / React)
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://[::1]:5173',

    // Origens de produção vindas das variáveis de ambiente
    ...envOrigins,
  ].filter(Boolean);

  // 🔹 Configuração flexível de CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Libera chamadas sem 'origin' (Postman, Swagger local, Server-to-Server)
      // ou se a origem estiver cadastrada na lista
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem ${origin} não permitida pelo CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true, // Necessário para suporte a cookies e sessões
  });

  // 🔹 Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API AnimeSite')
    .setDescription('API para site de animes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const url = await app.getUrl();
  console.log(`\n🚀 Aplicação rodando em: ${url}`);
  console.log(`🌍 Origens permitidas no CORS:`, allowedOrigins);
}

bootstrap();