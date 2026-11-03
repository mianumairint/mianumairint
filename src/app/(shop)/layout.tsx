import TopNavBar from "@/components/shared/TopNavBar";
import SideNavBar from "@/components/shared/SideNavBar";
import Footer from "@/components/shared/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import SearchModal from "@/components/shared/SearchModal";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <SearchModal />
      <main className="min-h-screen pt-[88px]">{children}</main>
      <Footer />
      <WhatsAppButton />
      <LanguageSwitcher />
    </>
  );
}
