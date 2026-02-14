// rental-service/app.js
const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch');


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

  // 1) Vérifier que la voiture existe via cars-service
  try {
    const carResponse = await fetch(`http://cars-service:3000/cars/${carId}`);
    if (!carResponse.ok) {
      if (carResponse.status === 404) {
        return res.status(400).json({ error: `Car with id ${carId} does not exist` });
      }
      console.error('Error from cars-service:', carResponse.status, await carResponse.text());
      return res.status(502).json({ error: 'Failed to validate car with cars-service' });
    }

    const car = await carResponse.json();
    console.log('Car validated from cars-service:', car);
  } catch (err) {
    console.error('Error calling cars-service:', err);
    return res.status(502).json({ error: 'Could not reach cars-service' });
  }

  // 2) Vérifier qu'il n'y a pas de conflit de dates pour cette voiture
  try {
    const conflictCheck = await pool.query(
      `SELECT id FROM rentals 
       WHERE car_id = $1 
         AND start_date <= $3 
         AND end_date >= $2`,
      [carId, startDate, endDate]
    );
    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Car ${carId} is already rented during this period` 
      });
    }
  } catch (err) {
    console.error('Error checking date conflicts:', err);
    return res.status(500).json({ error: 'Failed to check availability' });
  }

  // 3) Insérer la location en base
  let newRental;
  try {
    const result = await pool.query(
      `INSERT INTO rentals (customer, car_id, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer, car_id AS "carId", start_date AS "startDate", end_date AS "endDate"`,
      [customer, carId, startDate, endDate]
    );
    newRental = result.rows[0];
  } catch (err) {
    console.error('Error creating rental:', err);
    return res.status(500).json({ error: 'Failed to create rental' });
  }

  // 4) Marquer la voiture comme louée dans cars-service
  try {
    const rentResponse = await fetch(`http://cars-service:3000/cars/${carId}/rent`, {
      method: 'PUT'
    });
    if (rentResponse.ok) {
      console.log(`Car ${carId} marked as rented in cars-service`);
    } else {
      console.warn(`Could not mark car ${carId} as rented: ${rentResponse.status}`);
      // On ne bloque pas la création, la location est déjà en base
    }
  } catch (err) {
    console.warn('Error calling cars-service /rent:', err);
    // Pas bloquant non plus
  }

  res.status(201).json(newRental);
});

// Supprimer une location
app.delete('/rentals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  try {
    // 1) Récupérer la location pour avoir le carId
    const result = await pool.query(
      'SELECT car_id AS "carId" FROM rentals WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    const carId = result.rows[0].carId;
    
    // 2) Supprimer la location
    await pool.query('DELETE FROM rentals WHERE id = $1', [id]);
    
    // 3) Libérer la voiture dans cars-service
    try {
      const returnResponse = await fetch(`http://cars-service:3000/cars/${carId}/return`, {
        method: 'PUT'
      });
      if (returnResponse.ok) {
        console.log(`Car ${carId} marked as available in cars-service`);
      } else {
        console.warn(`Could not mark car ${carId} as available: ${returnResponse.status}`);
      }
    } catch (err) {
      console.warn('Error calling cars-service /return:', err);
    }
    
    res.json({ message: 'Rental deleted', id });
  } catch (err) {
    console.error('Error deleting rental:', err);
    res.status(500).json({ error: 'Failed to delete rental' });
  }
});



app.listen(port, () => {
  console.log(`rental-service listening on port ${port}`);
});
