import { AppProps } from "next/app";
import { useSession, SessionProvider } from 'next-auth/react';
import '@/styles/globals.css';
import Sidebar, { SidebarItem } from "@/components/Sidebar";
import { FaBell, FaHome, FaVideo } from "react-icons/fa";
import { SidebarProvider, useSidebar } from "@/components/Sidebar/SidebarContext";

const AppBar = () => {
  const { data: session } = useSession();

  return (
    session ? (
      <Sidebar>
        <SidebarItem icon={<FaHome />} text="Dashboard" dest="/dashboard" />
        <SidebarItem icon={<FaBell />} text="Events" dest="/events" />
        <SidebarItem icon={<FaVideo />} text="Sources" dest="/sources" />
      </Sidebar>
    ) : null
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <SidebarProvider>
        <div className="flex">
          <AppBar />
          <Component {...pageProps} />
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}