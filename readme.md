![logo-green](https://github.com/user-attachments/assets/ce3a6839-464d-4786-a4e3-5b8ca02716c8)


Natours is a dynamic full-stack web application designed for travel enthusiasts looking to explore and book exciting nature tours worldwide. Built with Node.js, Express, and MongoDB, this platform provides users with a seamless experience to search, book, and manage their tours. With robust features such as authentication, user profile management, and secure payment processing, Natours ensures a reliable and user-friendly experience. Additionally, users can explore tours on a map, read reviews, and view ratings to help them make informed decisions.

## Overview

Natours is a comprehensive web application that allows users to discover and book a variety of nature tours, each carefully curated to offer an adventurous and unforgettable experience.

Visitors can browse through all available tours and access detailed information about each one, even without an account. Once signed up or logged in, users can easily book their desired tours. Additionally, users have the opportunity to write a single review for each tour they experience, sharing their insights and contributing to the community.

The backend of Natours is powered by a robust RESTful API, handling all user requests and managing bookings efficiently. The frontend is built with server-side rendering, ensuring enhanced SEO performance and delivering a smooth, intuitive user experience.

## Key features:

#### Authentication and Authorization

- Sign up, log in, log out, update, and reset password.
- User roles: regular user, guide, lead guide, admin.
- Secure password management and user session handling.

#### User Profile Management

- Update username, profile photo, email, and password.
- Manage account details through a user-friendly dashboard.

#### Tour Booking

- Browse through a curated list of nature tours, each with detailed information including itinerary, difficulty level, duration, guides, and price.
- Manage bookings, view tours on a map, and access user reviews and ratings.
- Only regular users can book tours and make secure payments.
- Users can see all their booked tours in one place.

#### Payment Processing

Secure credit card payments for tour bookings, ensuring a safe and seamless transaction process.

#### Review System

- Regular users can write, edit, and delete reviews for tours they have booked.
- All users can view reviews for each tour, contributing to an informed community experience.
- Admins have the ability to manage and delete reviews.

#### Admin and Guide Features

- Admins and lead guides can create, update, and delete tours.
- Admins and lead guides can manually create bookings, manage all bookings, and have full control over the platform.
- Admins can oversee user activities and ensure the smooth operation of the app.

#### Favorite Tours

- Users can add booked tours to their list of favorite tours for easy access.
- Manage your list of favorites, adding and removing tours as desired.

## Tech Stack

The Natours project is built using the following technologies:

#### Core (Backend API)

- Node.js: JavaScript runtime environment for building scalable server-side applications.
- Express.js: Fast, unopinionated, minimalist web framework for Node.js, used to build the API and manage routes.

#### Database

- MongoDB: NoSQL database for storing data related to tours, users, reviews, and bookings.
- Mongoose: Elegant MongoDB object modeling for Node.js, providing schema-based solutions for application data.

#### Security

- JWT (JSON Web Tokens): Used for securely handling user authentication and authorization.
- Bcrypt: Password hashing library to secure user passwords.
- Express Mongoose Sanitize: Middleware to sanitize user-supplied data, preventing MongoDB Operator Injection.
- Express Rate Limit: Middleware for rate-limiting API requests to prevent abuse.
- Helmet: Helps secure Express apps by setting various HTTP headers.
- HPP: Middleware to protect against HTTP Parameter Pollution attacks.
- XSS Filters: Output filtering to prevent Cross-Site Scripting (XSS) attacks.

#### Website (Frontend)

- Pug: High-performance template engine used for server-side rendering of the frontend.
- Leaflet: Open-source JavaScript library for mobile-friendly interactive maps, used to display tour locations.

#### Other

- Stripe: Payment processing platform integrated for secure tour bookings.
- Nodemailer: Tool for sending emails, such as confirmation emails or password reset links.
- Multer: Middleware for handling file uploads, particularly useful for user profile photos.
- Compression: Middleware to compress response bodies for optimized performance.
- Sharp: High-performance image processing library used for manipulating and optimizing images.
- Morgan: HTTP request logger middleware for better visibility into API requests.

## Installation

To set up the Natours project locally, follow these steps:

Clone the repository

```
git clone https://github.com/your-username/natours.git
```

Navigate to the project directory

```
cd natours/
```

Install the dependencies

```
npm install
```

## Usage

To start the development server, follow these steps:

### Configure environment variables

Ensure that all necessary environment variables are set up correctly. This typically includes variables for database connection, API keys, and other configurations.
Start MongoDB using Docker Compose

```
docker-compose up
```

Run the Node.js web application

```
npm run start:dev
```

## Access the Natours website

Open your web browser and visit http://localhost:3000 to access the Natours application.

# API Documentation

For detailed information about the API endpoints and how to interact with them, please refer to the API documentation file.

# Setting Up Your Local Environment ⚙️

If you'd like to explore and modify the codebase on your local machine, follow these steps:

**1.Clone the repository**

```
git clone https://github.com/your-username/natours.git
```

**2.Navigate to the cloned repository**

```
cd natours/
```

**3.Install the necessary dependencies**

```
npm install
```

**4.Set up external service accounts**

If you don't already have them, create accounts with the following services:

- MongoDB: For your database.
- Leaflet: For map and location services.
- Stripe: For payment processing.
- Vrevo: For sending transactional emails.
- Mailtrap: For email testing in a safe environment.

**5.Configure environment variables**

In your .env file, set the following environment variables:

```
DATABASE=your-mongodb-database-url
DATABASE_PASSWORD=your-mongodb-password

SECRET=your-json-web-token-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=yourrealemail@example.com

BREVO_API=apiKey
BREVO_HOST=your-brevo-host
BREVO_PORT=587
BREVO_LOGIN=Your-brevo-login
BREVO_PASSWORD=Your-brevo-password

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=your-sendgrid-password

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

**6.Start the server**

```
npm run start:dev
```

**7.Access the application**

Your app should now be running and accessible at http://localhost:3000.

# Deployed Version 🚀

Feel free to check out the live demo of the Natours project:

👉🏻 [Live Demo](https://natours-iotm.onrender.com/)

# Acknowledgement 🙏🏻

This project is part of an online course I took on Udemy. Special thanks to Jonas Schmedtmann for creating this fantastic course!

Course [Link: 9Node.js, Express, MongoDB & More: The Complete Bootcamp 2019](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)

# License

The Natours project is licensed under the GNU General Public License v2.0. You are free to use, modify, and distribute this code as long as you adhere to the terms of the license.
