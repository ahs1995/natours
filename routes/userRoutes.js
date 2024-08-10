const express = require('express');

const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);

Router.post('/forgetpassword', authController.forgetPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);

// Protect all routes after this middleware
Router.use(authController.protect);

Router.patch('/updatepassword', authController.updatePassword);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
Router.delete('/deleteme', userController.deleteMe);

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
