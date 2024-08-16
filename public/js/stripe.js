/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import Stripe from 'stripe';
const stripe = new Stripe(
  'pk_test_51PlpL0RxaUtLg9jj90fc5e3ihj3lAeNMhgDgcCr7JDanMl3a1LYWM5aHD2yvOItf8RCzzbjD8ry9HSITcQQxBaoA00UZvpCtjw'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + chanre credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });

    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
