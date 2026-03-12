import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  BookOpen,
  DollarSign,
  Megaphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useFirebase } from "@/components/FirebaseProvider";
import { fetchUserRequests, fetchNextActiveMeeting, fetchMuralPosts } from "@/lib/backend";
import NewRequestModal from "./NewRequestModal";
import RequestDetailModal from "./RequestDetailModal";

export default function StudentDashboard() {
  const { appUser } = useFirebase();
  const [requests, setRequests] = useState<any[]>([]);
  const [academicRequests, setAcademicRequests] = useState<any[]>([]);
  const [financialRequests, setFinancialRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newRequestCategory, setNewRequestCategory] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Next Meeting State
  const [nextMeeting, setNextMeeting] = useState<any>(null);

  // Mural State
  const [muralPosts, setMuralPosts] = useState<any[]>([]);

  const fetchRequests = async () => {
    if (!appUser) return;
    try {
      const userReqs = await fetchUserRequests(appUser.uid);

      const acad: any[] = [];
      const fin: any[] = [];

      userReqs.forEach((req) => {
        if (
          req.tipoSolicitacao.includes("Financeiro") ||
          req.tipoSolicitacao.startsWith("FIN_")
        ) {
          fin.push(req);
        } else {
          acad.push(req);
        }
      });

      setAcademicRequests(
        acad.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setFinancialRequests(
        fin.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextMeeting = async () => {
    try {
      const meeting = await fetchNextActiveMeeting();
      setNextMeeting(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
    }
  };

  const fetchMural = async () => {
    try {
      const posts = await fetchMuralPosts(2);
      setMuralPosts(posts);
    } catch (error) {
      console.error("Error fetching mural:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchNextMeeting();
    fetchMural();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("aguardando"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    if (s.includes("pautado") || s.includes("em pauta"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("aprovado"))
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s.includes("reprovado") || s.includes("rejeitado"))
      return "bg-red-100 text-red-800 border-red-200";
    if (s.includes("retornado"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const renderStepper = (status: string, isFinanceiro: boolean) => {
    const s = status.toLowerCase();
    const steps = isFinanceiro
      ? ["Enviado", "Orientador", "CG", "CPG", "Concluído"]
      : ["Enviado", "Orientador", "Secretaria", "CPG", "Concluído"];

    let currentIdx = 0;
    let isRejected = false;

    if (
      s.includes("prestação de contas") ||
      s.includes("concluído") ||
      s.includes("finalizado")
    )
      currentIdx = 4;
    else if (
      s.includes("aprovado na cpg") ||
      s.includes("aprovado cpg") ||
      s.includes("ressalvas")
    )
      currentIdx = 4;
    else if (s.includes("pautado") || s.includes("em pauta")) currentIdx = 3;
    else if (s.includes("aprovado cg") || s.includes("aguardando cpg"))
      currentIdx = 3;
    else if (
      s.includes("aguardando cg") ||
      s.includes("pendente") ||
      s.includes("com aval")
    )
      currentIdx = 2;
    else if (s.includes("aguardando orientador")) currentIdx = 1;
    else if (
      s.includes("reprovado") ||
      s.includes("rejeitado") ||
      s.includes("recusado")
    ) {
      isRejected = true;
      if (s.includes("orientador")) currentIdx = 1;
      else if (s.includes("cg")) currentIdx = 2;
      else currentIdx = 3;
    }

    return (
      <div className="flex justify-between relative pt-2">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        {steps.map((step, idx) => {
          let stepClass = "";
          let icon = String(idx + 1);

          if (isRejected && idx === currentIdx) {
            stepClass = "bg-red-500 border-red-500 text-white";
            icon = "✗";
          } else if (idx < currentIdx) {
            stepClass = "bg-emerald-500 border-emerald-500 text-white";
            icon = "✓";
          } else if (idx === currentIdx) {
            stepClass =
              "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-500/20";
          } else {
            stepClass = "bg-slate-100 border-slate-300 text-slate-400";
          }

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold mb-1 ${stepClass}`}
              >
                {icon}
              </div>
              <div
                className={`text-[10px] text-center leading-tight max-w-[50px] ${idx <= currentIdx ? "font-semibold text-slate-700" : "text-slate-400"}`}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRequestCards = (reqs: any[], isFinanceiro: boolean) => {
    if (reqs.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500">
          <div className="text-4xl mb-3">📭</div>
          <p>Nenhuma solicitação nesta categoria.</p>
          <button
            onClick={() => {
              setNewRequestCategory(isFinanceiro ? "financial" : "academic");
              setIsNewRequestModalOpen(true);
            }}
            className="mt-4 bg-[#004b85] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isFinanceiro
              ? "+ Solicitar Auxílio Financeiro"
              : "+ Solicitação à CPG"}
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {reqs.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full overflow-hidden"
          >
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(r.status)}`}
                >
                  {r.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  📅 {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <h4
                className="font-bold text-[#004b85] mb-4 line-clamp-2"
                title={r.tipoSolicitacao}
              >
                {r.tipoSolicitacao}
              </h4>

              <div className="border-t border-slate-100 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">
                      📋 Reunião:
                    </span>
                    <span className="font-medium text-slate-700 truncate block">
                      Sem reunião
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">🔢 ID:</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {r.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-auto">
                {renderStepper(r.status, isFinanceiro)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-100 mt-auto">
              {r.status === "Prestação de Contas Solicitada" && (
                <button className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-2 px-4 rounded-lg mb-2 shadow-sm transition-colors text-sm">
                  📤 Entregar Prestação de Contas
                </button>
              )}
              <button
                onClick={() => setSelectedRequest(r)}
                className="w-full border border-[#004b85] text-[#004b85] hover:bg-blue-50 font-medium py-1.5 px-4 rounded-lg transition-colors text-sm"
              >
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>
    );
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
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Olá, {appUser?.nome.split(" ")[0] || "Aluno"}!
              </h1>
              <p className="text-blue-100 font-medium mt-1">
                {appUser?.email} • Painel do Discente
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all shadow-sm">
            Editar Contatos
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 mt-8 border-t border-white/20">
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Orientador(a)
            </span>
            <span className="font-medium text-white shadow-sm">A definir</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Data Defesa
            </span>
            <span className="font-medium text-white shadow-sm">-</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Créditos
            </span>
            <span className="font-bold text-2xl text-white shadow-sm">0</span>
          </div>
          <div className="bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest block mb-1">
              Nível
            </span>
            <span className="font-medium text-white shadow-sm">Mestrado</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BookOpen size={18} /></div>
            <h3 className="text-slate-500 font-semibold text-sm">Total Pedidos</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{requests.length || (academicRequests.length + financialRequests.length)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Calendar size={18} /></div>
            <h3 className="text-slate-500 font-semibold text-sm">Em Análise</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {academicRequests.concat(financialRequests).filter(r => r.status.toLowerCase().includes('aguardando') || r.status.toLowerCase().includes('pendente')).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={18} /></div>
            <h3 className="text-slate-500 font-semibold text-sm">Aprovados</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">
            {academicRequests.concat(financialRequests).filter(r => r.status.toLowerCase().includes('aprovado') || r.status.toLowerCase().includes('concluído')).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
          <p className="font-medium text-indigo-100 text-sm mb-1">Precisa de ajuda?</p>
          <p className="font-bold text-lg leading-tight mb-3">Consulte nossos tutoriais e murais</p>
          <button className="text-xs bg-white text-indigo-600 font-bold py-1.5 px-3 rounded-lg self-start shadow-sm hover:bg-slate-50 transition-colors">Ver Guias</button>
        </div>
      </div>

      {/* 2. Next Meeting Alert */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">📅</div>
          <div>
            {nextMeeting ? (
              <>
                <div className="font-bold text-slate-800">
                  {nextMeeting.nome}
                </div>
                <div className="text-slate-500 text-sm">
                  Data:{" "}
                  {new Date(nextMeeting.dataReuniao).toLocaleDateString(
                    "pt-BR",
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-slate-800">
                  Carregando próxima reunião...
                </div>
                <div className="text-slate-500 text-sm">
                  Nenhuma reunião aberta no momento
                </div>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setNewRequestCategory(null);
            setIsNewRequestModalOpen(true);
          }}
          className="bg-[#004b85] hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          + Nova Solicitação
        </button>
      </div>

      {/* 3. Request Accordions */}
      <div className="space-y-4">
        {/* Acadêmico (CPG) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleAccordion("academico")}
            className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <BookOpen size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 text-lg">
                  Solicitações Acadêmicas (CPG)
                </h3>
                <p className="text-slate-500 text-sm">
                  Aproveitamento, coorientação, banca...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 font-bold py-1 px-3 rounded-full text-sm">
                {academicRequests.length}
              </span>
              {openAccordion === "academico" ? (
                <ChevronUp className="text-slate-400" />
              ) : (
                <ChevronDown className="text-slate-400" />
              )}
            </div>
          </button>

          {openAccordion === "academico" && (
            <div className="bg-slate-50 border-t border-slate-100">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderRequestCards(academicRequests, false)
              )}
            </div>
          )}
        </div>

        {/* Financeiro */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggleAccordion("financeiro")}
            className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 text-lg">
                  Solicitações Financeiras
                </h3>
                <p className="text-slate-500 text-sm">
                  Auxílios, Verbas PROEX, Bolsas, reembolsos...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-emerald-100 text-emerald-800 font-bold py-1 px-3 rounded-full text-sm">
                {financialRequests.length}
              </span>
              {openAccordion === "financeiro" ? (
                <ChevronUp className="text-slate-400" />
              ) : (
                <ChevronDown className="text-slate-400" />
              )}
            </div>
          </button>

          {openAccordion === "financeiro" && (
            <div className="bg-slate-50 border-t border-slate-100">
              <div className="p-4 pb-0 flex justify-end">
                <button
                  onClick={() => {
                    setNewRequestCategory("financial");
                    setIsNewRequestModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  + Novo Auxílio Financeiro
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                renderRequestCards(financialRequests, true)
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Mural da Comunidade */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
        <div className="flex items-center gap-3 mb-4">
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
        <div className="space-y-3">
          {muralPosts.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center text-slate-500 border border-white">
              Nenhuma publicação ainda. Seja o primeiro a publicar!
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

      {isNewRequestModalOpen && (
        <NewRequestModal
          appUser={appUser}
          categoryFilter={newRequestCategory}
          onClose={() => setIsNewRequestModalOpen(false)}
          onRefresh={fetchRequests}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          userRole="Discente"
          userEmail={appUser?.email || ""}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
}

