import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseDatabaseModule } from './common/database/mongo/mongoose-database.module';
// import { PostgresDatabaseModule } from './common/database/postgres/pg-database.module';
import { AppRouteLoggerMiddleware } from './app-route-logger.middleware';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtIgnoreExpirationStrategy, JwtStrategy } from './authz/jwt.guard';
import { InitialDataService } from './common/services/initial-data/initial-data.service';

// mongo schemas
import { User, UserSchema } from './common/database/schemas/users.schema';

import configuration from './configurations';

const config = configuration();
const dbModules: any[] = [];

// if (config?.db?.pg?.activate) {
//   const dbModule =
//     process.env.NODE_ENV === 'test'
//       ? // eslint-disable-next-line @typescript-eslint/no-var-requires
//         require('./common/database/postgres/pg-database-test.module').rootMongooseTestModule()
//       : PostgresDatabaseModule;
//   dbModules.push(dbModule);
// }

const mongooseModules: DynamicModule[] = [];
if (config?.db?.mongo?.activate) {
  const dbModule =
    process.env.NODE_ENV === 'test'
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('./common/database/mongo/mongoose-database-test.module').rootMongooseTestModule()
      : MongooseDatabaseModule;

  dbModules.push(dbModule);
  mongooseModules.push(MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]));
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ...mongooseModules,
    ...dbModules,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey:
          configService.get<string>('auth.jwt.algorithms') && configService.get<string>('auth.jwt.private_key')
            ? Buffer.from(configService.get<string>('auth.jwt.private_key'), 'base64')
            : configService.get<string>('auth.jwt.secret'),
      }),
    }),
  ],
  controllers: [AppController],
  exports: [AppService, JwtStrategy, JwtIgnoreExpirationStrategy],
  providers: [AppService, JwtStrategy, JwtIgnoreExpirationStrategy, InitialDataService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppRouteLoggerMiddleware)
      .exclude('/access-control(/+)(.*)', '/health-check(.*)', '/worker(/+)(.*)')
      .forRoutes('/');
  }
}
