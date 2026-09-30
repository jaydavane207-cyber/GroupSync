import express from 'express';
import cors from 'cors';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'GroupSync API', timestamp: new Date() });
});

app.use('/api', routes);

app.use(errorHandlerMiddleware);

export default app;
