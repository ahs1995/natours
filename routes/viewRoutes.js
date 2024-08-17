const express = require('express');
const authController = require('./../controller/authController');
const viewsController = require('./../controller/viewsController');

const Router = express.Router();

Router.use(viewsController.alerts);

Router.get('/', authController.isLoggedIn, viewsController.getOverview);
Router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
Router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
Router.get('/signup', viewsController.getSignupForm);
Router.get('/me', authController.protect, viewsController.getAccount);
Router.get('/my-tours', authController.protect, viewsController.getMyTours);

module.exports = Router;
