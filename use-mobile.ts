import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Calendar,
  Plus,
  Archive,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { useFirebase } from "@/components/FirebaseProvider";
import { TabType } from "@/components/Sidebar";
import { fetchRequestsByRole } from "@/lib/backend";
import RequestDetailModal from "./RequestDetailModal";

export default function SecretariatDashboard({
  onTabChange,
}: {
  onTabChange: (tab: TabType) => void;
}) {
  const { appUser } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchRequests = async () => {
    try {
      const reqs = await fetchRequestsByRole("Secretaria");
      setRequests(reqs);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingActions = requests.filter(
    (r) =>
      r.status === "Aguardando Orientador" ||
      r.status === "Pendente" ||
      r.status === "Em Pauta",
  );
  const approvedToday = requests.filter((r) => {
    if (!r.status.includes("Aprovado")) return false;
    const today = new Date().toDateString();
    const updated = new Date(r.updatedAt || r.createdAt).toDateString();
    return today === updated;
  }).length;

  const recentApprovals = requests
    .filter((r) => r.status.includes("Aprovado"))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 right-40 mb-10 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Painel da Secretaria
              </h1>
              <p className="text-indigo-100 font-medium mt-1">
                Visão geral e gestão do programa
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all shadow-sm flex items-center gap-2 text-white">
              <FileText size={18} /> Kanban
            </button>
            <button className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
              <Calendar size={18} /> Calendário
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aguardando Orientador"
          value={requests
            .filter((r) => r.status === "Aguardando Orientador")
            .length.toString()}
          icon={<Clock className="text-amber-500" />}
          color="border-amber-500"
        />
        <StatCard
          title="Pautados CPG"
          value={requests
            .filter((r) => r.status === "Em Pauta")
            .length.toString()}
          icon={<FileText className="text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title="Aprovados Hoje"
          value={approvedToday.toString()}
          icon={<CheckCircle className="text-emerald-500" />}
          color="border-emerald-500"
        />
        <StatCard
          title="Total Pendentes"
          value={pendingActions.length.toString()}
          icon={<AlertTriangle className="text-indigo-500" />}
          color="border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xl">⚠️</span>
              <h3 className="font-bold text-slate-800">Ações Pendentes</h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingActions.length}
              </span>
            </div>
            <button className="text-sm font-medium text-[#004b85] hover:underline">
              Ver Tudo →
            </button>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004b85]"></div>
              </div>
            ) : pendingActions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-3">✅</div>
                <p>Nenhuma ação pendente no momento.</p>
              </div>
            ) : (
              pendingActions.map((req) => {
                let statusColor = "bg-slate-50 text-slate-600";
                if (req.status === "Aguardando Orientador")
                  statusColor =
                    "bg-amber-50 text-amber-700 border border-amber-200";
                else if (req.status === "Pendente")
                  statusColor =
                    "bg-blue-50 text-blue-700 border border-blue-200";
                else if (req.status === "Em Pauta")
                  statusColor =
                    "bg-purple-50 text-purple-700 border border-purple-200";

                return (
                  <div
                    key={req.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center group gap-4"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${statusColor}`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {req.tipoSolicitacao}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1">
                        {req.nomeSolicitante}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="flex-1 sm:flex-none justify-center bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Analisar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Ações Rápidas
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => onTabChange("Usuários")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-[#004b85] hover:bg-blue-50 hover:text-[#004b85] transition-all text-slate-600 gap-2 group"
              >
                <div className="bg-slate-100 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-xs font-medium text-center">
                  Novo Usuário
                </span>
              </button>
              <button
                onClick={() => onTabChange("Calendário")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-all text-slate-600 gap-2 group"
              >
                <div className="bg-slate-100 group-hover:bg-amber-100 p-2 rounded-lg transition-colors">
                  <Calendar size={20} />
                </div>
                <span className="text-xs font-medium text-center">
                  Nova Reunião
                </span>
              </button>
              <button
                onClick={() => onTabChange("Usuários")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-600 gap-2 group"
              >
                <div className="bg-slate-100 group-hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                  <Users size={20} />
                </div>
                <span className="text-xs font-medium text-center">
                  Gerenciar Usuários
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-100 hover:text-slate-800 transition-all text-slate-600 gap-2 group">
                <div className="bg-slate-100 group-hover:bg-slate-200 p-2 rounded-lg transition-colors">
                  <Archive size={20} />
                </div>
                <span className="text-xs font-medium text-center">
                  Arquivo Morto
                </span>
              </button>
              <button className="col-span-2 flex items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all gap-2 font-medium">
                <FileSpreadsheet size={18} /> Importar ProPGWeb
              </button>
            </div>
          </div>

          {/* Próximas Reuniões */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Próximas Reuniões
              </h3>
              <button className="text-xs text-[#004b85] hover:underline font-medium">
                Ver todas
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-lg p-2 text-center min-w-[3rem]">
                    <div className="text-xs font-bold uppercase">Out</div>
                    <div className="text-lg font-black leading-none">25</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      Ordinária CPG
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      14:00 - Sala 102
                    </p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full">
                  Em 12 dias
                </span>
              </div>
            </div>
          </div>

          {/* Últimas Aprovações */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Últimas Aprovações
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentApprovals.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Nenhuma aprovação recente.
                </div>
              ) : (
                recentApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm truncate pr-2">
                        {req.nomeSolicitante}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(
                          req.updatedAt || req.createdAt,
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs truncate">
                      {req.tipoSolicitacao}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          userRole="Secretaria"
          userEmail={appUser?.email || ""}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 border-l-4 ${color} hover:-translate-y-1 transition-transform cursor-pointer`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}
