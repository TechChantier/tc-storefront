import type { StorefrontTemplate } from "@/themes/contracts";
import { ProLayout } from "./layout";
import { ProAboutPage } from "./pages/about";
import { ProCategoryListPage } from "./pages/categories";
import { ProContactPage } from "./pages/contact";
import { ProHomePage } from "./pages/home";
import { ProProductPage } from "./pages/product";
import { ProProductListPage } from "./pages/products";
import { ProSignupPage } from "./pages/signup";

const proTheme: StorefrontTemplate = {
  Layout: ProLayout,
  HomePage: ProHomePage,
  AboutPage: ProAboutPage,
  ContactPage: ProContactPage,
  SignupPage: ProSignupPage,
  CategoryListPage: ProCategoryListPage,
  ProductListPage: ProProductListPage,
  ProductPage: ProProductPage,
};

export default proTheme;
