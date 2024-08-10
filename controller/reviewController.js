const Review = require('../models/reviewModel');
const AppError = require('../utilitis/appError');

const catchAsync = require('../utilitis/catchAsync');
const {
  deleteOne,
  updateOne,
  getOneDoc,
  createDoc,
  getAllDocs,
} = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = createDoc(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;

//   const review = await Review.create(req.body);

//   if (!review) {
//     return next(new AppError('Failed to create new tour!', 400));
//   }

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

// exports.getReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       reviews,
//     },
//   });
// });

exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOneDoc(Review);
exports.getAllReviews = getAllDocs(Review);
