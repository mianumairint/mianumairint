import TopNavBar from "@/components/shared/TopNavBar";
import SideNavBar from "@/components/shared/SideNavBar";
import Footer from "@/components/shared/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import BottomNavBar from "@/components/shared/BottomNavBar";
import CartSlideOver from "@/components/shared/CartSlideOver";
import SearchModal from "@/components/shared/SearchModal";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <SearchModal />
      <CartSlideOver />
      <main className="min-h-screen pt-[88px] pb-20 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <LanguageSwitcher />
      <BottomNavBar />
    </>
  );
}
