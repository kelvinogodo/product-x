import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />
    </>
  );
}
