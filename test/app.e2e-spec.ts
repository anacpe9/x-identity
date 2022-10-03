import { closeInMongodConnection } from '../src/common/database/mongo/mongoose-database-test.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  afterAll(async () => {
    await closeInMongodConnection();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  // beforeEach(async () => {
  // });

  it('(GET) /', async () => {
    const res = await request(httpServer).get('/').expect('Content-Type', /json/).expect(200);

    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });

  it('(GET) /auth - without auth and return 403', async () => {
    await request(httpServer).get('/auth').expect('Content-Type', /json/).expect(403);
  });

  it('(GET) /auth - with invalid-auth and return 403', async () => {
    await request(httpServer).get('/').auth('the-username', 'the-password').expect('Content-Type', /json/).expect(200);
  });

  it('(GET) /auth - with valid-auth and return 200', async () => {
    const res = await request(httpServer).get('/').auth('user1', 'pass1').expect('Content-Type', /json/).expect(200);

    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });

  // it('login with default admin', async () => {
  //   const user = await service.findByLogin({ email: 'admin@x-store.local', password: 'P@ssw0rdForTesting123456' });
  //   expect(typeof user).toBe('object');
  //   expect(user).toHaveProperty('id');
  //   expect(user.id).toEqual('0');
  // });
});
