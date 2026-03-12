import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  X,
  Megaphone,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { useFirebase } from "@/components/FirebaseProvider";
import { fetchRequestsByRole, fetchUserRequests, fetchMuralPosts } from "@/lib/backend";
import RequestDetailModal from "./RequestDetailModal";
import NewRequestModal from "./NewRequestModal";

export default function ProfessorDashboard() {
  const { appUser } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [myFinancialRequests, setMyFinancialRequests] = useState<any[]>([]);
  const [muralPosts, setMuralPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs and Filters
  const [activeCategory, setActiveCategory] = useState<
    "academico" | "financeiro"
  >("academico");
  const [activeFilter, setActiveFilter] = useState<
    "pendentes" | "aceitos" | "pautados" | "recusados"
  >("pendentes");

  // Accordion state
  const [myRequestsOpen, setMyRequestsOpen] = useState(false);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  const fetchData = async () => {
    if (!appUser) return;
    try {
      // Fetch student requests (where advisor email matches or just all for now, assuming mock data)
      // In a real app, you'd filter by orientadorEmail == appUser.email
      const reqs = await fetchRequestsByRole("Docente");

      // Fetch own financial requests
      const userReqs = await fetchUserRequests(appUser.uid);
      const myFinReqs = userReqs.filter(req =>
        req.tipoSolicitacao.includes("Financeiro") || req.tipoSolicitacao.startsWith("FIN_")
      );

      setRequests(reqs);
      setMyFinancialRequests(myFinReqs);

      // Fetch Mural
      const posts = await fetchMuralPosts(2);
      setMuralPosts(posts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser]);

  const isFinType = (r: any) =>
    r.tipoSolicitacao.includes("Financeiro") ||
    r.tipoSolicitacao.startsWith("FIN_");

  const categoryRequests = requests.filter((r) =>
    activeCategory === "financeiro" ? isFinType(r) : !isFinType(r),
  );

  const filteredRequests = categoryRequests.filter((r) => {
    const s = (r.status || "").toLowerCase();
    if (activeFilter === "pendentes")
      return s.includes("aguardando orientador");
    if (activeFilter === "aceitos")
      return (
        s.includes("aprovado") ||
        s.includes("aceito") ||
        s.includes("com aval") ||
        s.includes("pendente")
      );
    if (activeFilter === "pautados")
      return s.includes("pautado") || s.includes("em pauta");
    if (activeFilter === "recusados")
      return (
        s.includes("reprovado") ||
        s.includes("recusado") ||
        s.includes("rejeitado")
      );
    return true;
  });

  const counts = {
    pendentes: categoryRequests.filter((r) =>
      (r.status || "").toLowerCase().includes("aguardando orientador"),
    ).length,
    aceitos: categoryRequests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return (
        s.includes("aprovado") ||
        s.includes("aceito") ||
        s.includes("com aval") ||
        s.includes("pendente")
      );
    }).length,
    pautados: categoryRequests.filter(
      (r) =>
        (r.status || "").toLowerCase().includes("pautado") ||
        (r.status || "").toLowerCase().includes("em pauta"),
    ).length,
    recusados: categoryRequests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return (
        s.includes("reprovado") ||
        s.includes("recusado") ||
        s.includes("rejeitado")
      );
    }).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-12">
      {/* Hero Header & Profile */}
      <div className="bg-gradient-to-r from-[#004b85] to-[#0074cc] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 right-40 mb-10 w-32 h-32 rounded-full bg-blue-300 opacity-20 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Olá, Prof. {appUser?.nome.split(" ")[0] || "Docente"}!
              </h1>
              <p className="text-blue-100 font-medium mt-1">
                {appUser?.email} • Painel do Docente
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all shadow-sm">
            Ver Relatórios PROEX
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 mt-8 border-t border-white/20">
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center items-center">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Orientandos
            </span>
            <span className="font-bold text-2xl text-white shadow-sm">3</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center items-center">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Pedidos Pendentes
            </span>
            <span className="font-bold text-2xl text-white shadow-sm">{counts.pendentes}</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center items-center">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Pedidos Aprovados
            </span>
            <span className="font-bold text-2xl text-white shadow-sm">{counts.aceitos}</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col justify-center items-center">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Meus Auxílios
            </span>
            <span className="font-bold text-2xl text-white shadow-sm">{myFinancialRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Mural da Comunidade Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Megaphone className="text-indigo-600" size={24} />
            <div>
              <h3 className="font-bold text-slate-800">
                Mural da Comunidade PPGPsi
              </h3>
              <p className="text-slate-600 text-sm">
                Publicize sua pesquisa, artigos e produtos técnicos.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {muralPosts.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center text-slate-500 border border-white">
              Nenhuma publicação ainda.
            </div>
          ) : (
            muralPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">
                    {post.nomeUsuario}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {post.conteudo}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orientandos Ativos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Users className="text-[#004b85]" size={20} />
            <h3 className="font-bold text-slate-800">Orientandos Ativos</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {["João da Silva", "Maria Oliveira", "Pedro Santos"].map(
              (name, i) => (
                <button
                  key={i}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      Prazo: 15/12/2026
                    </p>
                  </div>
                  {i === 0 && counts.pendentes > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                      ⚠️
                    </span>
                  )}
                  <span className="text-slate-300 group-hover:text-[#004b85] transition-colors">
                    →
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Pedidos de Alunos */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-[#004b85]" size={20} />
              <h3 className="font-bold text-slate-800">Pedidos de Alunos</h3>
            </div>

            {/* Primary Category Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-4">
              <button
                onClick={() => {
                  setActiveCategory("academico");
                  setActiveFilter("pendentes");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${activeCategory === "academico" ? "bg-white shadow-sm text-[#004b85]" : "text-slate-500 hover:text-slate-700"}`}
              >
                📚 Acadêmico
                <span className="bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">
                  {requests.filter((r) => !isFinType(r)).length}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory("financeiro");
                  setActiveFilter("pendentes");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${activeCategory === "financeiro" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                💰 Financeiro
                <span className="bg-emerald-100 text-emerald-800 text-xs py-0.5 px-2 rounded-full">
                  {requests.filter((r) => isFinType(r)).length}
                </span>
              </button>
            </div>

            {/* Status Sub-Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("pendentes")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeFilter === "pendentes" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                🟡 Aguardando{" "}
                <span className="ml-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {counts.pendentes}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("aceitos")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeFilter === "aceitos" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                🔵 Pendente{" "}
                <span className="ml-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                  {counts.aceitos}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("pautados")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeFilter === "pautados" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                🟣 Em Pauta{" "}
                <span className="ml-1 bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                  {counts.pautados}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("recusados")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeFilter === "recusados" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                ❌ Rejeitado{" "}
                <span className="ml-1 bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                  {counts.recusados}
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 flex-grow">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004b85]"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhum pedido nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => {
                  let statusColor = "border-slate-200";
                  let badgeClass = "bg-slate-100 text-slate-600";
                  const s = (req.status || "").toLowerCase();
                  if (s.includes("aguardando")) {
                    statusColor = "border-l-amber-400";
                    badgeClass = "bg-amber-100 text-amber-800";
                  } else if (s.includes("aprovado") || s.includes("aceito")) {
                    statusColor = "border-l-emerald-400";
                    badgeClass = "bg-emerald-100 text-emerald-800";
                  } else if (
                    s.includes("reprovado") ||
                    s.includes("recusado")
                  ) {
                    statusColor = "border-l-red-400";
                    badgeClass = "bg-red-100 text-red-800";
                  } else if (s.includes("pautado") || s.includes("em pauta")) {
                    statusColor = "border-l-purple-400";
                    badgeClass = "bg-purple-100 text-purple-800";
                  } else if (s.includes("pendente")) {
                    statusColor = "border-l-blue-400";
                    badgeClass = "bg-blue-100 text-blue-800";
                  }

                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`bg-white border rounded-xl p-4 border-l-4 ${statusColor} hover:shadow-md transition-shadow cursor-pointer`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-1 rounded border border-slate-200 mb-1 self-start">
                            {req.tipoSolicitacao}
                          </span>
                          <h4 className="font-bold text-slate-800">
                            {req.nomeSolicitante}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded ${badgeClass}`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between items-end">
                        {s.includes("aguardando orientador") ? (
                          <span className="text-amber-600 text-xs font-bold">
                            ⚠️ Aguardando seu parecer
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            Processado
                          </span>
                        )}
                        <div className="text-right">
                          <span className="text-slate-400 text-xs block mb-1">
                            {new Date(req.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                          <span className="text-[#004b85] text-xs font-bold">
                            Ver →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meus Pedidos Financeiros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setMyRequestsOpen(!myRequestsOpen)}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-lg">
                Meus Pedidos Financeiros
              </h3>
              <p className="text-slate-500 text-sm">
                Visualize e acompanhe seus próprios auxílios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-emerald-100 text-emerald-800 font-bold py-1 px-3 rounded-full text-sm">
              {myFinancialRequests.length}
            </span>
            {myRequestsOpen ? (
              <ChevronUp className="text-slate-400" />
            ) : (
              <ChevronDown className="text-slate-400" />
            )}
          </div>
        </button>

        {myRequestsOpen && (
          <div className="bg-slate-50 border-t border-slate-100 p-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : myFinancialRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-3">📭</div>
                <p>Você ainda não possui solicitações financeiras.</p>
                <button
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  + Novo Auxílio Financeiro
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsNewRequestModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                  >
                    + Novo Auxílio Financeiro
                  </button>
                </div>
                {myFinancialRequests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                        {r.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        📅 {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <h5 className="font-bold text-[#004b85] mb-3">
                      {r.tipoSolicitacao}
                    </h5>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="text-[#004b85] text-sm font-bold hover:underline"
                      >
                        Ver Detalhes →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Análise */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          userRole="Docente"
          userEmail={appUser?.email || ""}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchData}
        />
      )}

      {isNewRequestModalOpen && (
        <NewRequestModal
          appUser={appUser}
          categoryFilter="financial"
          onClose={() => setIsNewRequestModalOpen(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
