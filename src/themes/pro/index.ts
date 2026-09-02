import type { StorefrontTemplate } from "@/themes/contracts";
import { ProLayout } from "./layout";
import { ProAboutPage } from "./pages/about";
import { ProCartPage } from "./pages/cart";
import { ProCategoryListPage } from "./pages/categories";
import { ProCheckoutPage } from "./pages/checkout";
import { ProContactPage } from "./pages/contact";
import { ProHomePage } from "./pages/home";
import { ProProductPage } from "./pages/product";
import { ProProductListPage } from "./pages/products";
import { ProSignupPage } from "./pages/signup";
import { ProSuccessPage } from "./pages/success";

const proTheme: StorefrontTemplate = {
  Layout: ProLayout,
  HomePage: ProHomePage,
  AboutPage: ProAboutPage,
  ContactPage: ProContactPage,
  SignupPage: ProSignupPage,
  CategoryListPage: ProCategoryListPage,
  ProductListPage: ProProductListPage,
  ProductPage: ProProductPage,
  CartPage: ProCartPage,
  CheckoutPage: ProCheckoutPage,
  SuccessPage: ProSuccessPage,
};

export default proTheme;
