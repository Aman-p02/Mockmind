import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Create a test app instance
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

describe('General API Tests', () => {
    it('should return 200 for health check', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/unknown');
        expect(res.status).toBe(404);
    });
});
