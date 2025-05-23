import express from 'express';
import cors from 'cors';
import metricsRoutes from './routes/metricsRoute';
import { config } from './config/config';

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(cors({
  credentials: true
}));

app.use('/api/metrics', metricsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
