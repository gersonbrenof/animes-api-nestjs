import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser'; // 👈 Correção: Import default

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Middleware para ler cookies
  app.use(cookieParser());

  // 🔹 Configuração de CORS com .env
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  app.enableCors({
    origin: frontendUrl, // Usa a variável do .env
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Essencial para cookies
  });

  // 🔹 Swagger
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
  console.log(`🌍 Frontend autorizado: ${frontendUrl}`);
}

bootstrap();