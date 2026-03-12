import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  X,
  Clock,
  DollarSign,
  AlertTriangle,
  User,
} from "lucide-react";
import { useFirebase } from "@/components/FirebaseProvider";
import { fetchRequestsByRole } from "@/lib/backend";
import RequestDetailModal from "./RequestDetailModal";

export default function ConselhoDashboard() {
  const { appUser } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchRequests = async () => {
    try {
      const reqs = await fetchRequestsByRole("Conselho");
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

  const pendingRequests = requests.filter(
    (r) =>
      r.status === "Aguardando CG" ||
      r.status === "Em Análise pela Comissão de Gestão (CG)",
  );
  const approvedRequests = requests.filter((r) =>
    r.status.includes("Aprovado pela CG"),
  );
  const recentApprovals = approvedRequests.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 right-40 mb-10 w-32 h-32 rounded-full bg-emerald-300 opacity-20 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Painel do Conselho (CG)
              </h1>
              <p className="text-emerald-100 font-medium mt-1">
                Gestão de Auxílios Financeiros e Pareceres
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aguardando Parecer"
          value={pendingRequests.length.toString()}
          icon={<Clock className="text-amber-500" />}
          color="border-amber-500"
        />
        <StatCard
          title="Aprovados (Mês)"
          value={approvedRequests.length.toString()}
          icon={<CheckCircle className="text-emerald-500" />}
          color="border-emerald-500"
        />
        <StatCard
          title="Depósitos Realizados"
          value="0"
          icon={<DollarSign className="text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title="Total Aprovado"
          value="R$ 0,00"
          icon={<FileText className="text-indigo-500" />}
          color="border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xl">⚠️</span>
              <h3 className="font-bold text-slate-800">
                Aguardando Meu Parecer
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            </div>
            <button className="text-sm font-medium text-[#004b85] hover:underline">
              Ver Todos →
            </button>
          </div>
          <div className="p-4 flex-1 bg-slate-50">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004b85]"></div>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-3">✅</div>
                <p>Nenhum pedido aguardando análise da CG.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-amber-400 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded border border-slate-200 truncate max-w-[150px]">
                        {req.tipoSolicitacao}
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Aguardando CG
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mt-3">
                      {req.nomeSolicitante}
                    </h4>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> Requer parecer
                      </span>
                      <span className="text-[#004b85] text-xs font-bold">
                        Analisar →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Parecerista da Vez */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Parecerista da Vez
              </h3>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Prof. Dr. Carlos Silva
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Próximo na fila de distribuição
                </p>
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
          userRole="Conselho"
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
