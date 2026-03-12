import { Menu, ChevronDown } from "lucide-react";
import { AppRole, useFirebase } from "@/components/FirebaseProvider";

export default function Navbar({
  role,
  setRole,
  toggleSidebar,
}: {
  role: AppRole;
  setRole: (r: AppRole) => void;
  toggleSidebar: () => void;
}) {
  const { appUser } = useFirebase();
  const roles: AppRole[] = appUser?.roles || ["Visitante"];

  return (
    <nav className="bg-[#1a237e] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-lg hidden sm:block">
          Sistema de Solicitações
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {roles.length > 1 && (
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Trocar Perfil <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-slate-100 overflow-hidden">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 ${role === r ? "bg-slate-50 font-semibold text-[#004b85]" : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <span className="bg-[#004b85] px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border border-white/10">
          {role}
        </span>
      </div>
    </nav>
  );
}
