const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utilitis/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utilitis/appError');
const { promisify } = require('util');
const Email = require('../utilitis/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove passeword from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'Success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists or password is correct

  // 2.1 Find the a specific user document with the provided email and password
  const user = await User.findOne({ email }).select('+password');

  // 2.2 Check where the password is correct and use logic of calling the instance function in the if statement to not block execution incase there user is not found,

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If user exists and password is correct  generate a JWT token and send it with the response

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'Success',
  //   token,
  // });

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expiresIn: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in please login to get access', 401)
    );
  }
  // 2)Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this user no longer exists.', 401)
    );
  }

  // 4)Check if user changed password after the token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  // Grant access to the protected route
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not permitted to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Check if the user exists with the email address
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user found with this email', 404));
  }

  // 2)Generate token for the user

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // 3)Send the token on email

  const resetURL = `${req.protocol}:// ${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this
email!`;

  try {
    await new Email(user, resetURL).passwordReset();

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was en error sending this email.please try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'Success',
  //   token,
  //   Message: 'Password has been successfully reset!',
  // });
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if the provided password match with the password in the user document.
  if (!user.checkPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('You have provided a wrong password', 401));
  }

  // 3) Set the new password in the doc
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Generate jwt token for login
  // const token = signToken(user._id);

  // // 5)Send the response with the token
  // res.status(200).json({
  //   status: 'Success',
  //   token,
  //   message: 'Password updated successfully!',
  // });
  createSendToken(user, 200, res);

  next();
});
