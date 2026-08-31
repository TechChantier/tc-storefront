import type { StorefrontTemplate } from "@/themes/contracts";
import { ProLayout } from "./layout";
import { ProAboutPage } from "./pages/about";
import { ProContactPage } from "./pages/contact";
import { ProHomePage } from "./pages/home";
import { ProSignupPage } from "./pages/signup";

const proTheme: StorefrontTemplate = {
  Layout: ProLayout,
  HomePage: ProHomePage,
  AboutPage: ProAboutPage,
  ContactPage: ProContactPage,
  SignupPage: ProSignupPage,
};

export default proTheme;
