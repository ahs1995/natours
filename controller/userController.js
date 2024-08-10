const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utilitis/appError');
const User = require('../models/userModel');
const catchAsync = require('../utilitis/catchAsync');
const {
  deleteOne,
  updateOne,
  getOneDoc,
  createDoc,
  getAllDocs,
} = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// User authorized
// Update user name and email for authenticated user
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)Check for password or passwordConfirm fields
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Password is not required for this route.', 400));
  }

  // 2) Filter out fields from request object
  const filteredBody = filteredObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3)update the user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true,
  });

  // 4) Send the updated user in response

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
  next();
});

// Delete user for authenticated user

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
  });
});

// Admin authorized
// Get all user
exports.getAllUsers = getAllDocs(User);
// exports.getAllUsers = async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       users,
//     },
//   });
// };

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Get single user
exports.getUser = getOneDoc(User);
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     Message: 'No routes defined with the given URL',
//   });
// };

// Create user
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'No routes defined with the given URL',
  });
};

// Update user
exports.updateUser = updateOne(User);

// Delete user
exports.deleteUser = deleteOne(User);
