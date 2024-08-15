import { LuChevronFirst, LuChevronLast, LuMoreVertical } from "react-icons/lu";
import { useContext, createContext, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const SidebarContext = createContext({ expanded: false });

export default function Sidebar({ children }: any) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={`h-screen fixed top-0 left-0 transition-all ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <Image
            src="/trackit-logo.png"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32 h-8" : "w-0 h-0"
            }`}
            width={0}
            height={0}
            sizes="100vw"
            alt="Trackit logo"
            priority
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <LuChevronFirst /> : <LuChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <UserProfile expanded={expanded} />
      </nav>
    </aside>
  );
}

function UserProfile({ expanded }: { expanded: boolean }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {data: session} = useSession();
  const email = session?.user?.email;

  return (
    <div className="border-t flex p-3 relative">
      <img
        src={`https://ui-avatars.com/api/?name=${email}&background=fca5a5`}
        alt=""
        className="w-10 h-10 rounded-md"
      />
      <div
        className={`
          flex justify-between items-center
          overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
      `}
      >
        <div className="leading-4">
          <h4 className="font-semibold">{email?.split('@')[0]}</h4>
          <span className="text-xs text-gray-600">{email}</span>
        </div>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <LuMoreVertical size={20} />
        </button>
      </div>

      {isDropdownOpen && (
        <div className="absolute bottom-14 right-0 w-48 bg-white shadow-lg rounded-lg border p-2">
          <button
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => signOut()}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export function SidebarItem({ icon, text, active, alert }: any) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-red-200 to-red-100 text-red-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-red-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-red-100 text-red-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
