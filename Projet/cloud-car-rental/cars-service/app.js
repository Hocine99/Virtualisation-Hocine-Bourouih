// app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');


app.use(express.json());

// Servir les fichiers statiques du front
app.use(express.static(path.join(__dirname, 'public')));

// Route explicite pour l'UI
app.get('/ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Données en mémoire pour l'instant (on branchera PostgreSQL plus tard)
let cars = [
  { id: 1, plateNumber: 'AA-111-AA', brand: 'Renault', model: 'Clio', rented: false },
  { id: 2, plateNumber: 'BB-222-BB', brand: 'Peugeot', model: '208', rented: false },
  { id: 3, plateNumber: 'CC-333-CC', brand: 'Tesla', model: 'Model 3', rented: false }
];

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cars-service' });
});

// Liste des voitures
app.get('/cars', (req, res) => {
  res.json(cars);
});

// Détails d'une voiture
app.get('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const car = cars.find(c => c.id === id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  res.json(car);
});

// Louer une voiture
app.put('/cars/:id/rent', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const car = cars.find(c => c.id === id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  if (car.rented) {
    return res.status(400).json({ error: 'Car already rented' });
  }
  car.rented = true;
  res.json(car);
});

// Rendre une voiture
app.put('/cars/:id/return', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const car = cars.find(c => c.id === id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  if (!car.rented) {
    return res.status(400).json({ error: 'Car is not rented' });
  }
  car.rented = false;
  res.json(car);
});

app.listen(port, () => {
  console.log(`cars-service listening on port ${port}`);
});
