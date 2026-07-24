import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Middleware para ler cookies
  app.use(cookieParser());

  // 🔹 Monta a lista de origens permitidas (Local + Produção)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL, // Ex: https://otaku-shepere.onrender.com
  ].filter(Boolean) as string[]; // Remove valores undefined/nulos

  // 🔹 Configuração flexível de CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile, Postman, Swagger) ou origens da lista
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem ${origin} não permitida pelo CORS`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Essencial para cookies/sessão
  });

  // 🔹 Swagger
  const config = new DocumentBuilder()
    .setTitle('API AnimeSite')
    .setDescription('API para site de animes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const url = await app.getUrl();
  console.log(`\n🚀 Aplicação rodando em: ${url}`);
  console.log(`🌍 Origens permitidas no CORS:`, allowedOrigins);
}

bootstrap();