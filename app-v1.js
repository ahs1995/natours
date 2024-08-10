const fs = require('fs');

const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('This is a middleware');
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Send Response with all tours data

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

// Send response with single tour data

app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'Fail',
      message: 'No tour found with the given ID',
    });
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

// Create new Tour from request data

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

// Update tour

app.patch('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'No tour found with given id',
    });
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour: 'Updated tour data',
    },
  });
});

// Delete a tour

app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'No tour found with given id',
    });
  }

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

// User

app.get('/api/v1/users', (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
});
app.get('/api/v1/users/:id', (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
});
app.post('/api/v1/users', (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
});
app.patch('/api/v1/users/:id', (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
});
app.delete('/api/v1/users/:id', (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening to the port ${PORT} `);
});
