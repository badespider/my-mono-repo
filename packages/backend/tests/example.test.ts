import request from 'supertest';
import app from '../src/index';

describe('Example API CRUD Operations', () => {
  let createdItemId: string;

  it('should get all example items', async () => {
    const res = await request(app).get('/api/example');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new example item', async () => {
    const newItem = {
      name: 'Test Item',
      description: 'This is a test item',
    };

    const res = await request(app).post('/api/example').send(newItem);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', newItem.name);
    expect(res.body.data).toHaveProperty('description', newItem.description);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');

    createdItemId = res.body.data.id;
  });

  it('should fail to create item without name', async () => {
    const res = await request(app)
      .post('/api/example')
      .send({ description: 'No name provided' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Name is required');
  });

  it('should get a specific item by ID', async () => {
    const res = await request(app).get(`/api/example/${createdItemId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('id', createdItemId);
  });

  it('should return 404 for non-existent item', async () => {
    const res = await request(app).get('/api/example/nonexistent');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Item not found');
  });

  it('should update an existing item', async () => {
    const updatedData = {
      name: 'Updated Test Item',
      description: 'This item has been updated',
    };

    const res = await request(app)
      .put(`/api/example/${createdItemId}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', updatedData.name);
    expect(res.body.data).toHaveProperty(
      'description',
      updatedData.description
    );
  });

  it('should fail to update item without name', async () => {
    const res = await request(app)
      .put(`/api/example/${createdItemId}`)
      .send({ description: 'No name provided' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Name is required');
  });

  it('should delete an existing item', async () => {
    const res = await request(app).delete(`/api/example/${createdItemId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Item deleted successfully');
    expect(res.body.data).toHaveProperty('id', createdItemId);
  });

  it('should return 404 when trying to delete non-existent item', async () => {
    const res = await request(app).delete('/api/example/nonexistent');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Item not found');
  });
});
