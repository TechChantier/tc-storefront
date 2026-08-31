import type { StorefrontTemplate } from "@/themes/contracts";
import { ClassicLayout } from "./layout";
import { ClassicAboutPage } from "./pages/about";
import { ClassicContactPage } from "./pages/contact";
import { ClassicHomePage } from "./pages/home";
import { ClassicSignupPage } from "./pages/signup";

const classicTheme: StorefrontTemplate = {
  Layout: ClassicLayout,
  HomePage: ClassicHomePage,
  AboutPage: ClassicAboutPage,
  ContactPage: ClassicContactPage,
  SignupPage: ClassicSignupPage,
};

export default classicTheme;
