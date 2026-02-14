// rental-service/app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Données en mémoire pour l'instant
let rentals = [
  { id: 1, customer: 'Alice', carId: 1, startDate: '2025-02-01', endDate: '2025-02-05' },
  { id: 2, customer: 'Bob',   carId: 2, startDate: '2025-02-10', endDate: '2025-02-12' }
];

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'rental-service' });
});

// Liste des locations
app.get('/rentals', (req, res) => {
  res.json(rentals);
});

// Détails d'une location
app.get('/rentals/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rental = rentals.find(r => r.id === id);
  if (!rental) {
    return res.status(404).json({ error: 'Rental not found' });
  }
  res.json(rental);
});

// Créer une nouvelle location
app.post('/rentals', (req, res) => {
  const { customer, carId, startDate, endDate } = req.body;
  if (!customer || !carId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const newId = rentals.length ? rentals[rentals.length - 1].id + 1 : 1;
  const rental = { id: newId, customer, carId, startDate, endDate };
  rentals.push(rental);
  res.status(201).json(rental);
});

app.listen(port, () => {
  console.log(`rental-service listening on port ${port}`);
});
