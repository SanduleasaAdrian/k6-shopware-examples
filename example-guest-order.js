import {
  addProductToCart,
  guestOrder, placeOrder,
  visitCartPage,
  visitConfirmPage,
  visitProductDetailPage,
  visitStorefront,
} from "./helpers/storefront.js";

export default function () {
  visitStorefront();
  guestOrder();
  addProductToCart(visitProductDetailPage().id);
  visitCartPage();
  visitConfirmPage();
  placeOrder();
}