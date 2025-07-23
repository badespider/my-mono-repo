import request from 'supertest';
import app from '../src/index';

describe('Health Check API', () => {
  it('should return 200 OK with status message', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('should return detailed health check with system info', async () => {
    const res = await request(app).get('/health/detailed');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('system');
  });
});

describe('Example API', () => {
  it('should return list of example items', async () => {
    const res = await request(app).get('/api/example');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should create a new example item', async () => {
    const res = await request(app).post('/api/example').send({
      name: 'New Item',
      description: 'Testing new item creation',
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'New Item');
  });
});
