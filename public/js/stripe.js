import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_QcqUhZwc8wXFQXRrgkuVlnRx00wL9Iri73');

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    // for GET method we don't need to pass config object to axios
    // in axios the actual data from response is stored in Object property 'data'
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (e) {
    console.log(e);
    showAlert('error', e);
  }
};
