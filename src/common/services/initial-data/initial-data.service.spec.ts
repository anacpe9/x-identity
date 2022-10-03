import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { InitialDataService } from './initial-data.service';
import { Connection, connect, Model } from 'mongoose';
import { User, UserSchema } from '../../database/schemas/users.schema';

describe('InitialDataService', () => {
  let service: InitialDataService;
  // let appController: AppController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();

    await mongoose.disconnect();

    if (mongod) await mongod.stop();
  });

  // afterEach(async () => {
  //   const collections = mongoConnection.collections;
  //   for (const key in collections) {
  //     const collection = collections[key];
  //     await collection.deleteMany({});
  //   }
  // });

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    await mongod.start();
    await mongod.ensureInstance();

    const mongoUri = await mongod.getUri();
    mongoConnection = (await connect(mongoUri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialDataService, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile();

    service = module.get<InitialDataService>(InitialDataService);
  });

  beforeEach(async () => {
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('must have admin user', async () => {
    await service.onModuleInit();
    const success = await service.hasAdminUser();

    expect(success).toEqual(true);
  });
});
