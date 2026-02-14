// rental-service/app.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 4000;

// Paramètres DB (par défaut pour Kubernetes)
const dbConfig = {
  host: process.env.DB_HOST || 'postgres-service',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'carrental',
  user: process.env.DB_USER || 'carrental',
  password: process.env.DB_PASSWORD || 'carrentalpass',
};

const pool = new Pool(dbConfig);

app.use(express.json());

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', service: 'rental-service', db: 'OK' });
  } catch (err) {
    console.error('DB error in /health:', err);
    res.status(500).json({ status: 'ERROR', service: 'rental-service', db: 'ERROR' });
  }
});

// Liste des locations
app.get('/rentals', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, customer, car_id AS "carId", start_date AS "startDate", end_date AS "endDate" FROM rentals ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rentals:', err);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Détails d'une location
app.get('/rentals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      'SELECT id, customer, car_id AS "carId", start_date AS "startDate", end_date AS "endDate" FROM rentals WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching rental:', err);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

// Créer une nouvelle location
app.post('/rentals', async (req, res) => {
  const { customer, carId, startDate, endDate } = req.body;
  if (!customer || !carId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rentals (customer, car_id, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer, car_id AS "carId", start_date AS "startDate", end_date AS "endDate"`,
      [customer, carId, startDate, endDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating rental:', err);
    res.status(500).json({ error: 'Failed to create rental' });
  }
});

app.listen(port, () => {
  console.log(`rental-service listening on port ${port}`);
});
