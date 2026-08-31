import type { StorefrontTemplate } from "@/themes/contracts";
import { ClassicLayout } from "./layout";
import { ClassicAboutPage } from "./pages/about";
import { ClassicCategoryListPage } from "./pages/categories";
import { ClassicCheckoutPage } from "./pages/checkout";
import { ClassicContactPage } from "./pages/contact";
import { ClassicHomePage } from "./pages/home";
import { ClassicProductPage } from "./pages/product";
import { ClassicProductListPage } from "./pages/products";
import { ClassicSignupPage } from "./pages/signup";

const classicTheme: StorefrontTemplate = {
  Layout: ClassicLayout,
  HomePage: ClassicHomePage,
  AboutPage: ClassicAboutPage,
  ContactPage: ClassicContactPage,
  SignupPage: ClassicSignupPage,
  CategoryListPage: ClassicCategoryListPage,
  ProductListPage: ClassicProductListPage,
  ProductPage: ClassicProductPage,
  CheckoutPage: ClassicCheckoutPage,
};

export default classicTheme;
