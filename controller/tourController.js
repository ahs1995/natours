const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const AppError = require('../utilitis/appError');
const catchAsync = require('../utilitis/catchAsync');

const fs = require('fs');
const {
  deleteOne,
  updateOne,
  getOneDoc,
  createDoc,
  getAllDocs,
} = require('./handlerFactory');

// Uploading multiple files using  multer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourPhotos = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // COVER
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // IMAGES
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.tourAlias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// get all tours
exports.getAllTours = getAllDocs(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // BUILD QUERY

//   // 1A)FILTERING
//   const queryObj = { ...req.query };
//   const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   excludedFields.forEach((el) => delete queryObj[el]);

//   //1B) ADVANCED FILTERING
//   let queryStr = JSON.stringify(queryObj);

//   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/, (match) => `$${match}`);

//   let query = Tour.find(JSON.parse(queryStr));

//   // 2)SORTING
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');

//     query = query.sort(sortBy);
//   } else {
//     query = query.sort('-createdAt');
//   }

//   // 3)FIELD LIMITING
//   if (req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
//   } else {
//     query = query.select('-__v');
//   }

//   // 4)PAGINATION
//   const page = req.query.page * 1 || 1;
//   const limit = req.query.limit * 1 || 100;
//   const skip = (page - 1) * limit;

//   query = query.skip(skip).limit(limit);

//   if (req.query.page) {
//     const numTours = await Tour.countDocuments();
//     if (skip >= numTours) throw new Error('This page does not exist');
//   }

//   // EXECUTE QUERY
//   const tours = await query;

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours,
//     },
//   });
// });

// Get single tour
exports.getTour = getOneDoc(Tour, { path: 'reviews' });

// Create new Tour
exports.createTour = createDoc(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.create(req.body);

//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// Update tour

exports.updateTour = updateOne(Tour);

// Delete a tour

exports.deleteTour = deleteOne(Tour);

// AGGREGATION PIPELINE

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new AppError('Please provide lat,lng in the format lat,lng', 404));
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide lat,lng in the format lat,lng', 404));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
