import { CurrencyProvider } from "@/lib/currency-context";
import { CartProvider } from "@/lib/cart-context";
import { SETTING_KEYS, getSetting } from "@/lib/settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const blueRate = Number(process.env.NEXT_PUBLIC_USD_ARS ?? 1200);
  const logoUrl = await getSetting(SETTING_KEYS.HEADER_LOGO_URL);

  return (
    <CurrencyProvider blueRate={blueRate}>
      <CartProvider>
        <Header logoUrl={logoUrl} />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </CurrencyProvider>
  );
}
