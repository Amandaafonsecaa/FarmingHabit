// Carrega o .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY...) antes de qualquer módulo ler process.env
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // A foto da motivação viaja como data URL: o limite padrão de 100 KB do corpo é pouco
  app.useBodyParser('json', { limit: '1mb' });

  // Habilita CORS para conexão com o frontend
  app.enableCors();

  // Validação global com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração completa do Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gamified Habit Tracker API')
    .setDescription(
      'API REST para Habit Tracker gamificado com módulos de Usuários, Hábitos, Missões e Recompensas.',
    )
    .setVersion('1.0.0')
    .addTag('users', 'Operações de usuários, perfis e progresso do jogador (Level, XP, Moedas)')
    .addTag('habits', 'Gerenciamento de hábitos e acompanhamento percentual de progresso (0-100%)')
    .addTag('missions', 'Desafios e missões com recompensas de XP e Moedas')
    .addTag('rewards', 'Catálogo de itens e resgate de recompensas com moedas')
    .addTag('progress', 'Ganhos do jogador (colheitas, bônus da semana e baús), calculados pelo servidor')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🎮 Backend rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api`);
}

bootstrap();
