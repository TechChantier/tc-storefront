import type { ComponentType, ReactNode } from "react";

export type ThemeLayoutProps = {
  children: ReactNode;
};

export type StorefrontTemplate = {
  Layout: ComponentType<ThemeLayoutProps>;
  HomePage: ComponentType;
  AboutPage: ComponentType;
  ContactPage: ComponentType;
  SignupPage: ComponentType;
  CategoryListPage: ComponentType;
  ProductListPage: ComponentType;
  ProductPage: ComponentType;
  CartPage: ComponentType;
  CheckoutPage: ComponentType;
};
