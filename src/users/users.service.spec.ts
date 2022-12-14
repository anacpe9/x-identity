import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Connection, connect, Model } from 'mongoose';

import { UsersService } from './users.service';
import { User, UserSchema } from '../common/database/schemas/users.schema';

import configuration from '../configurations';
// const config = configuration();

describe('UsersService', () => {
  let service: UsersService;
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
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      providers: [UsersService, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    // await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signup with valid payload must success and receive mongo-id', async () => {
    const newId = await service.signup({
      email: 'ana.cpe9@gmail.com',
      displayName: 'Anucha Nualsi',
      password: '@nuchaNuals1',
      confirmPassword: '@nuchaNuals1',
    });

    expect(typeof newId).toBe('string');
    expect(newId).toMatch(/^[0-9a-fA-F]{24}$/);
  });

  it('should throw Error when signup payload is invalid', async () => {
    // expect.assertions(1);
    try {
      const newId = await service.signup({
        email: 'ana.cpe9',
        displayName: 'Anucha Nualsi',
        password: null,
        confirmPassword: null,
      });
    } catch (errors) {
      expect(Array.isArray(errors)).toBe(true);
      for (const err of errors) {
        expect(err).toHaveProperty('property');
      }
    }
  });

  it('should throw Error when signup payload just invalid email', async () => {
    // expect.assertions(1);
    try {
      const newId = await service.signup({
        email: 'ana.cpe9',
        displayName: 'Anucha Nualsi',
        password: '@nuchaNuals1',
        confirmPassword: '@nuchaNuals1',
      });
    } catch (errors) {
      expect(Array.isArray(errors)).toBe(true);
      for (const err of errors) {
        expect(err).toHaveProperty('property');
      }
    }
  });

  it('the email is duplicated', async () => {
    expect.assertions(1);
    try {
      const newId = await service.signup({
        email: 'ana.cpe9@gmail.com',
        displayName: 'Anucha Nualsi',
        password: '@nuchaNuals1',
        confirmPassword: '@nuchaNuals1',
      });
    } catch (err) {
      expect(err.message).toBe('the email is duplicated');
    }
  });

  it('wrong password pattern', async () => {
    // expect.assertions(2);
    try {
      const newId = await service.signup({
        email: 'ana.cpe1@gmail.com',
        displayName: 'Anucha Nualsi',
        password: '@nuchaN',
        confirmPassword: '@nuchaN',
      });
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.message.startsWith('the password should')).toBe(true);
    }
  });

  it('login by signup user', async () => {
    const user = await service.findByLogin({
      email: 'ana.cpe9@gmail.com',
      password: '@nuchaNuals1',
    });
    expect(typeof user).toBe('object');
    expect(user).toHaveProperty('id');
    expect(user.id).toHaveLength(24);
  });

  it('User or Password invalid [001]', async () => {
    expect.assertions(1);
    try {
      const user = await service.findByLogin({
        email: 'ana.cpe8@gmail.com',
        password: '@nuchaNuals1',
      });
    } catch (err) {
      expect(err.message).toBe('User or Password invalid [001]');
    }
  });

  it('User or Password invalid [002]', async () => {
    expect.assertions(1);
    try {
      const user = await service.findByLogin({
        email: 'ana.cpe9@gmail.com',
        password: '@nuchaNuals11',
      });
    } catch (err) {
      expect(err.message).toBe('User or Password invalid [002]');
    }
  });
});
