import {
  Home,
  Megaphone,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Settings,
  BookOpen,
  PenTool,
  CalendarDays
} from "lucide-react";
import { AppRole, useFirebase } from "@/components/FirebaseProvider";

export type TabType =
  | "Início"
  | "Mural"
  | "Reuniões"
  | "Financeiro"
  | "Solicitações"
  | "Calendário"
  | "Usuários"
  | "PPGPsiu"
  | "PTT"
  | "Defesa";

export default function Sidebar({
  role,
  isOpen,
  activeTab,
  onTabChange,
}: {
  role: AppRole;
  isOpen: boolean;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const { appUser, logOut } = useFirebase();

  return (
    <div
      className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isOpen ? "w-64" : "w-0 overflow-hidden"}`}
    >
      <div className="p-4 bg-[#004b85] text-center font-bold text-xl border-b border-white/10 shrink-0 whitespace-nowrap">
        PPGPsi
        <span className="block text-xs font-normal text-white/70">
          Gestão CPG
        </span>
      </div>
      <div className="p-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
        <NavItem
          icon={<Home size={20} />}
          label="Início"
          active={activeTab === "Início"}
          onClick={() => onTabChange("Início")}
        />
        {role !== "Visitante" && (
          <>
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mt-6 mb-2 whitespace-nowrap">
              Menu Principal
            </div>
            <NavItem
              icon={<Megaphone size={20} />}
              label="Mural da Comunidade"
              active={activeTab === "Mural"}
              onClick={() => onTabChange("Mural")}
            />
            <NavItem
              icon={<Calendar size={20} />}
              label="Reuniões CPG"
              active={activeTab === "Reuniões"}
              onClick={() => onTabChange("Reuniões")}
            />

            {(role === "Discente" || role === "Docente") && (
              <>
                <NavItem
                  icon={<BookOpen size={20} />}
                  label="Consultar Periódicos (PPGPsiu)"
                  active={activeTab === "PPGPsiu"}
                  onClick={() => onTabChange("PPGPsiu")}
                />
                <NavItem
                  icon={<PenTool size={20} />}
                  label="Crie seu PTT"
                  active={activeTab === "PTT"}
                  onClick={() => onTabChange("PTT")}
                />
              </>
            )}

            {role === "Discente" && (
              <NavItem
                icon={<CalendarDays size={20} />}
                label="Agendar Defesa"
                active={activeTab === "Defesa"}
                onClick={() => onTabChange("Defesa")}
              />
            )}

            {(role === "Discente" ||
              role === "Secretaria" ||
              role === "Conselho") && (
                <NavItem
                  icon={<DollarSign size={20} />}
                  label={role === "Discente" ? "PROEX $" : "Gestão Financeira"}
                  active={activeTab === "Financeiro"}
                  onClick={() => onTabChange("Financeiro")}
                />
              )}

            {role === "Secretaria" && (
              <>
                <NavItem
                  icon={<FileText size={20} />}
                  label="Gestão de Solicitações"
                  active={activeTab === "Solicitações"}
                  onClick={() => onTabChange("Solicitações")}
                />
                <NavItem
                  icon={<Settings size={20} />}
                  label="Gestão Calendário"
                  active={activeTab === "Calendário"}
                  onClick={() => onTabChange("Calendário")}
                />
                <NavItem
                  icon={<Users size={20} />}
                  label="Gestão Usuários"
                  active={activeTab === "Usuários"}
                  onClick={() => onTabChange("Usuários")}
                />
              </>
            )}

            {role === "Docente" && (
              <>
                <NavItem
                  icon={<FileText size={20} />}
                  label="Gestão de Solicitações"
                  active={activeTab === "Solicitações"}
                  onClick={() => onTabChange("Solicitações")}
                />
                <NavItem
                  icon={<DollarSign size={20} />}
                  label="Recursos PROEX"
                  active={activeTab === "Financeiro"}
                  onClick={() => onTabChange("Financeiro")}
                />
              </>
            )}
          </>
        )}
      </div>
      <div className="p-4 bg-black/20 border-t border-white/10 shrink-0 whitespace-nowrap">
        <div className="text-xs text-white/40 mb-1">Logado como:</div>
        <div className="font-bold text-sm truncate">
          {appUser?.nome || "Usuário"}
        </div>
        <div className="text-xs text-white/50 truncate mb-3">
          {appUser?.email || ""}
        </div>
        <button
          onClick={logOut}
          className="w-full py-2 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors whitespace-nowrap ${active ? "bg-[#004b85] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
    >
      {icon}
      {label}
    </button>
  );
}
