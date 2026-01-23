import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Swagger
  const config = new DocumentBuilder()
    .setTitle('API AnimeSite')
    .setDescription('API para site de animes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 🔹 Define porta
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // 🔹 Exibe link para abrir no navegador
  const url = await app.getUrl(); // pega host + porta
  console.log(`\n🚀 Aplicação rodando em: ${url}`);
  console.log(`📄 Swagger disponível em: ${url}/docs\n`);
}

bootstrap();
