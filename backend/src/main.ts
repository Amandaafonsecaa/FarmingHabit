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

  // CORS só para o site do jogo (CORS_ORIGIN, separado por vírgula; padrão: dev e Docker locais)
  const origins = (
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

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
      'API REST para Habit Tracker gamificado com módulos de Usuários, Metas, Missões e Recompensas.',
    )
    .setVersion('1.0.0')
    .addTag('users', 'Operações de usuários, perfis e progresso do jogador (Level, XP, Moedas)')
    .addTag('missions', 'Desafios e missões com recompensas de XP e Moedas')
    .addTag('rewards', 'Catálogo de itens e resgate de recompensas com moedas')
    .addTag(
      'goals',
      'Check-ins das metas e colheita da recompensa num único pedido',
    )
    .addTag('progress', 'Ganhos do jogador (colheitas e bônus da semana), calculados pelo servidor')
    .addBearerAuth()
    .build();

  // Documentação só fora de produção: em produção a API não se descreve para quem chega
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🎮 Backend rodando em: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production')
    console.log(`📚 Swagger disponível em: http://localhost:${port}/api`);
}

bootstrap();
