import { AppProps } from "next/app";
import { useSession, SessionProvider } from 'next-auth/react';
import '@/styles/globals.css';
import Sidebar, { SidebarItem } from "@/components/Sidebar";
import { FaBell, FaHome, FaVideo } from "react-icons/fa";

function AppBar() {
  const { data: session } = useSession();

  return (
    session ? (
      <Sidebar>
        <SidebarItem icon={<FaHome />} text="Dashboard" active />
        <SidebarItem icon={<FaBell />} text="Events" active />
        <SidebarItem icon={<FaVideo />} text="Sources" active />
      </Sidebar>
    ) : null
);
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}