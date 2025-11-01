const request = require('supertest');
const app = require('../index');

describe('Backend basic endpoints', () => {
  test('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /api/public/startup-profile/:username returns 200 or 404', async () => {
    const username = 'testuser';
    const res = await request(app).get(`/api/public/startup-profile/${username}`);
    // Accept either 200 (found) or 404 (not found). DB/config may cause other statuses in some envs.
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('profile');
    }
  });
});
