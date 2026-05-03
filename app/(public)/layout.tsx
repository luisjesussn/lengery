import { CurrencyProvider } from "@/lib/currency-context";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const blueRate = Number(process.env.NEXT_PUBLIC_USD_ARS ?? 1200);

  return (
    <CurrencyProvider blueRate={blueRate}>
      <CartProvider>
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </CurrencyProvider>
  );
}
