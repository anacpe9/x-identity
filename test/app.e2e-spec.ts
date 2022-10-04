import { ErrorFilter } from './../src/common/filters/error.filter';
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
    app.enableShutdownHooks();
    app.useGlobalFilters(new ErrorFilter());

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

  let adminToken: string;
  it('POST /auth/login - login with default admin [test]', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        password: 'P@ssw0rdForTesting123456',
      });

    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('user');
    expect(typeof res.body.user).toBe('object');

    adminToken = res.body.token;
  });

  it('GET /auth/whoami - test admin token', async () => {
    const res = await request(httpServer)
      .get('/auth/whoami')
      .set('Accept', 'application/json')
      .set('acl-token', `${adminToken}`);

    expect(res.status).toEqual(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('role');
    expect(res.body.id).toEqual('0');
  });

  it('GET /auth/whoami - without token, must failed', async () => {
    const res = await request(httpServer).get('/auth/whoami').set('Accept', 'application/json');

    expect(res.status).toEqual(401);
  });

  it('GET /auth/whoami - invalid jwt form token, just failed', async () => {
    const res = await request(httpServer).get('/auth/whoami').set('Accept', 'application/json').set('acl-token', `1`);

    expect(res.status).toEqual(401);
  });

  it('POST /auth/login - invalid user, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local-aabbcc',
        password: 'P@ssw0rdForTesting123456',
      });

    expect(res.status).toEqual(401);
  });

  it('POST /auth/login - invalid pass, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        password: 'P@ssw0rdForTesting123456-1234',
      });

    expect(res.status).toEqual(401);
  });

  it('POST /auth/login - both invalid user/pass, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/login')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        password: 'P@ssw0rdForTesting123456-1234',
      });

    expect(res.status).toEqual(401);
  });

  it('POST /auth/signup - sign up with missing - 01, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/signup')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'string',
        displayName: 'string',
        password: 'string',
        confirmPassword: 'string',
      });

    expect(res.status).toEqual(400);
  });

  it('POST /auth/signup - sign up with wrong password pattern - 02, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/signup')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        displayName: 'string',
        password: 'string',
        confirmPassword: 'string',
      });

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message.startsWith('the password should be at least 8 characters')).toBe(true);
  });

  it('POST /auth/signup - sign up with password and confirm is mismatched, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/signup')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        displayName: 'string',
        password: 'P@ssw0rdForTesting123456',
        confirmPassword: 'string',
      });

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message.startsWith('password and confirm-password is mismatched')).toBe(true);
  });

  it('POST /auth/signup - sign up with existed email, must failed', async () => {
    const res = await request(httpServer)
      .post('/auth/signup')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@x-store.local',
        displayName: 'string',
        password: 'P@ssw0rdForTesting123456',
        confirmPassword: 'P@ssw0rdForTesting123456',
      });

    expect(res.status).toEqual(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message.startsWith('the email is duplicated')).toBe(true);
  });

  it('POST /auth/signup - sign up with valid email, must success', async () => {
    const res = await request(httpServer)
      .post('/auth/signup')
      .set('Content-type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        email: 'user@x-store.local',
        displayName: 'User in Memory',
        password: 'P@ssw0rdForTesting123456',
        confirmPassword: 'P@ssw0rdForTesting123456',
      });

    expect(res.status).toEqual(201);
  });
});
