import cors from 'cors';
import express from 'express';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { budgetsRouter } from './routes/budgets.js';
import { categoriesRouter } from './routes/categories.js';
import { summaryRouter } from './routes/summary.js';
import { transactionsRouter } from './routes/transactions.js';

migrate();
seed();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/summary', summaryRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
