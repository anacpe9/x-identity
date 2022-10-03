import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Constants } from './common/constants';

function setupSwagger(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle(Constants.APP_NAME)
    .setDescription(Constants.APP_DESCRIPTION)
    .setVersion(Constants.APP_VERSION)
    // .addBasicAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'acl-token',
        in: 'header',
        description: 'authorized token from server',
      },
      'acl-token',
    );

  const servers = process.env.SWAGGER_BASE_API ? [process.env.SWAGGER_BASE_API] : ['/', '/api', '/data'];
  servers.forEach((path) => documentBuilder.addServer(path));

  const swaggerOptions = documentBuilder.build();
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      urls: [
        {
          url: '../swagger-ui-json',
          description: 'x-identity API Spec (json)',
        },
      ],
    },
  };

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('swagger-ui', app, swaggerDocument, swaggerCustomOptions);
}

async function bootstrap() {
  const env = process.env.NODE_ENV || 'development';
  Logger.log(`Application starting on ${env} environment`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['debug'],
  });

  // app.useGlobalFilters(new ErrorsFilter());
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('http.port') || 3000;

  process.on('unhandledRejection', (reason, promise) => {
    Logger.warn('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  if (process.env.ENABLE_SWAGGER === 'true' || env !== 'production') setupSwagger(app);

  await app.listen(+port);
  Logger.log(`Application started and listen on ${await app.getUrl()}`);
}
bootstrap();
