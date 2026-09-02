import type { StorefrontTemplate } from "@/themes/contracts";
import { VibrantLayout } from "./layout";
import { VibrantAboutPage } from "./pages/about";
import { VibrantCartPage } from "./pages/cart";
import { VibrantCategoryListPage } from "./pages/categories";
import { VibrantCheckoutPage } from "./pages/checkout";
import { VibrantContactPage } from "./pages/contact";
import { VibrantHomePage } from "./pages/home";
import { VibrantProductPage } from "./pages/product";
import { VibrantProductListPage } from "./pages/products";
import { VibrantSignupPage } from "./pages/signup";
import { VibrantSuccessPage } from "./pages/success";

const vibrantTheme: StorefrontTemplate = {
  Layout: VibrantLayout,
  HomePage: VibrantHomePage,
  AboutPage: VibrantAboutPage,
  ContactPage: VibrantContactPage,
  SignupPage: VibrantSignupPage,
  CategoryListPage: VibrantCategoryListPage,
  ProductListPage: VibrantProductListPage,
  ProductPage: VibrantProductPage,
  CartPage: VibrantCartPage,
  CheckoutPage: VibrantCheckoutPage,
  SuccessPage: VibrantSuccessPage,
};

export default vibrantTheme;
