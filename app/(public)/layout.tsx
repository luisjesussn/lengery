import { CurrencyProvider } from "@/lib/currency-context";
import { CartProvider } from "@/lib/cart-context";
import { SiteConfigProvider } from "@/lib/site-config-context";
import { getSiteConfig } from "@/lib/settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();

  return (
    <SiteConfigProvider config={config}>
      <CurrencyProvider blueRate={config.usdArsRate}>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </CurrencyProvider>
    </SiteConfigProvider>
  );
}
