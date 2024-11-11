// example.js
import { productChangePrice, productChangeStocks, fetchBearerToken, useCredentials, productImport } from "./helpers/api.js";
import { sleep } from 'k6'; // Import sleep function
import {
  accountLogin,
  accountRegister,
  addProductToCart, guestRegistration,
  placeOrder, visitCartPage, visitConfirmPage,
  visitNavigationPage,
  visitProductDetailPage,
  visitSearchPage,
  visitStorefront
} from "./helpers/storefront.js";

export const options = {
  scenarios: {
    home: {
      executor: 'constant-vus',
      vus: 125,
      duration: '59m',
      exec: 'homepage'
    },
    search: {
      executor: 'constant-vus',
      vus: 100,
      duration: '59m',
      exec: 'search'
    },
    category: {
      executor: 'constant-vus',
      vus: 100,
      duration: '59m',
      exec: 'category'
    },
    product: {
      executor: 'constant-vus',
      vus: 500,
      duration: '59m',
      exec: 'product'
    },
    checkout_loggedin: {
      executor: 'constant-vus',
      vus: 2,
      duration: '59m',
      exec: 'checkoutLoggedin'
    },
    checkout_register: {
      executor: 'constant-vus',
      vus: 6,
      duration: '59m',
      exec: 'checkoutRegister'
    },
    checkout_guest: {
      executor: 'constant-vus',
      vus: 42,
      duration: '59m',
      exec: 'checkoutGuest'
      }
  }
};

export function homepage() {
  visitStorefront();
  sleep(0.8);
}

export function search() {
  visitSearchPage();
  sleep(0.8);
}

export function category() {
  visitNavigationPage();
  sleep(0.8);
}

export function product() {
  visitProductDetailPage();
  sleep(0.8);
}
export function checkoutGuest() {
  visitStorefront();
  guestRegistration();
  for (let i = 0; i < 6; i++) {
    addProductToCart(visitProductDetailPage().id);
  }
  visitCartPage();
  visitConfirmPage();
  placeOrder();
  sleep(0.8);
}
export function checkoutLoggedin() {
  var userEmail = "frl.a.sanduleasa@shopware.com";
  visitStorefront();
  accountLogin(userEmail);
// add 5 products to cart
  for (let i = 0; i < 6; i++) {
    addProductToCart(visitProductDetailPage().id);
  }
  visitCartPage();
  visitConfirmPage();
  placeOrder();
  sleep(0.8);
}
export function checkoutRegister() {
  visitStorefront();
  accountRegister();
  for (let i = 0; i < 6; i++) {
    addProductToCart(visitProductDetailPage().id);
  }
  visitCartPage();
  visitConfirmPage();
  placeOrder();
  sleep(0.8);
}
