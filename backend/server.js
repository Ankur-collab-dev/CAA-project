import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Get documents count
app.get('/api/documents/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM documents');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content FROM documents ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Insert document into library
app.post('/api/documents', async (req, res) => {
  const { title, content, fileType, wordCount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO documents (title, content, file_type, word_count) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, content, fileType || 'pasted', wordCount || 0]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. List reports
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, reference_label, similarity, word_count, created_at FROM reports ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, reference_label, similarity, word_count, sentences, sources, created_at FROM reports WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Create report
app.post('/api/reports', async (req, res) => {
  const { title, referenceLabel, similarity, wordCount, sentences, sources } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reports (title, reference_label, similarity, word_count, sentences, sources) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        title,
        referenceLabel,
        similarity,
        wordCount,
        JSON.stringify(sentences),
        JSON.stringify(sources),
      ]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OriginCheck API server running on port ${PORT}`);
});

