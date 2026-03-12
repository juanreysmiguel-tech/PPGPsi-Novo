import { useState } from "react";
import { X } from "lucide-react";
import { processRequestStatus } from "@/lib/backend";
import { AppRole } from "@/components/FirebaseProvider";

export default function RequestDetailModal({
  request,
  userRole,
  userEmail,
  onClose,
  onRefresh,
}: {
  request: any;
  userRole: AppRole;
  userEmail: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [justificativa, setJustificativa] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!request) return null;

  let details: any = {};
  try {
    details = JSON.parse(request.detalhes || "{}");
  } catch (e) {}

  let history: any[] = [];
  try {
    history = JSON.parse(request.historicoAprovacao || "[]");
  } catch (e) {}

  const handleAction = async (action: string) => {
    setProcessing(true);
    try {
      const isFinancial =
        request.tipoSolicitacao.includes("Financeiro") ||
        request.tipoSolicitacao.startsWith("FIN_");

      let newStatus = "";
      if (userRole === "Docente") {
        if (action === "Aprovar") {
          newStatus = isFinancial ? "Aguardando CG" : "Pendente";
        } else if (action === "Rejeitar") {
          newStatus = "Reprovado pelo Orientador";
        } else if (action === "Elucidar") {
          newStatus = "Retornado ao Aluno";
        }
      } else if (userRole === "Secretaria" || userRole === "Coordenação") {
        if (action === "Aprovar") {
          newStatus = "Aprovado na CPG";
        } else if (action === "Rejeitar") {
          newStatus = "Reprovado na CPG";
        } else if (action === "Pautar") {
          newStatus = "Em Pauta";
        } else if (action === "Retornar") {
          newStatus = "Retornado ao Aluno";
        }
      } else if (userRole === "Conselho" || userRole === "CG") {
        if (action === "Aprovar") {
          newStatus = "Aprovado pela CG (Aguardando Trâmite da Secretaria)";
        } else if (action === "Rejeitar") {
          newStatus = "Indeferido / Recusado";
        } else if (action === "Elucidar") {
          newStatus = "Aguardando Elucidação (Retornado para Ajustes)";
        }
      }

      await processRequestStatus(
        request.id,
        newStatus,
        justificativa || `Ação: ${action}`,
        userEmail,
        userRole
      );

      alert(`Status atualizado para: ${newStatus}`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Erro ao processar a solicitação.");
    } finally {
      setProcessing(false);
    }
  };

  const statusLower = (request.status || "").toLowerCase();
  const isPending = statusLower.includes("aguardando") || statusLower === "pendente";
  const isEmPauta = statusLower.includes("em pauta") || statusLower.includes("pautado");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-[#004b85] text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg">{request.tipoSolicitacao}</h2>
            <p className="text-sm opacity-80">
              {request.nomeSolicitante || request.idUsuario} | Status: {request.status}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow flex flex-col md:flex-row gap-6">
          {/* Left: Details */}
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Detalhes da Solicitação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(details).map(([key, value]) => {
                if (key === "fileUrl" || key === "fileName" || key === "fileUrls" || key === "justificativa") return null;
                return (
                  <div key={key}>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {key}
                    </span>
                    <span className="font-medium text-slate-800">{String(value)}</span>
                  </div>
                );
              })}
            </div>

            {details.justificativa && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Justificativa
                </span>
                <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {details.justificativa}
                </p>
              </div>
            )}

            {details.fileUrl && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Anexo
                </span>
                <a
                  href={details.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  📎 {details.fileName || "Ver Documento"}
                </a>
              </div>
            )}

            {details.fileUrls && details.fileUrls.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Anexos
                </span>
                <div className="space-y-2">
                  {details.fileUrls.map((file: any, idx: number) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium bg-blue-50 p-2 rounded-lg border border-blue-100"
                    >
                      📎 <span className="truncate">{file.name || `Documento ${idx + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Area based on Role */}
            {((userRole === "Docente" && statusLower.includes("aguardando orientador")) ||
              ((userRole === "Secretaria" || userRole === "Coordenação") && (isPending || isEmPauta)) ||
              ((userRole === "Conselho" || userRole === "CG") && statusLower.includes("aguardando cg"))) && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Seu Parecer / Justificativa
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3"
                  rows={3}
                  placeholder="Digite suas observações..."
                ></textarea>

                <div className="flex flex-wrap gap-2">
                  {userRole === "Docente" && (
                    <>
                      <button
                        onClick={() => handleAction("Elucidar")}
                        disabled={processing}
                        className="flex-1 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg font-medium transition-colors"
                      >
                        ❓ Pedir Ajustes
                      </button>
                      <button
                        onClick={() => handleAction("Rejeitar")}
                        disabled={processing}
                        className="flex-1 py-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors"
                      >
                        ❌ Rejeitar
                      </button>
                      <button
                        onClick={() => handleAction("Aprovar")}
                        disabled={processing}
                        className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                      >
                        ✅ Aprovar
                      </button>
                    </>
                  )}

                  {(userRole === "Secretaria" || userRole === "Coordenação") && (
                    <>
                      {isPending && (
                        <button
                          onClick={() => handleAction("Pautar")}
                          disabled={processing}
                          className="flex-1 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium transition-colors"
                        >
                          📥 Pautar na CPG
                        </button>
                      )}
                      {isEmPauta && (
                        <>
                          <button
                            onClick={() => handleAction("Rejeitar")}
                            disabled={processing}
                            className="flex-1 py-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors"
                          >
                            ❌ Reprovar na CPG
                          </button>
                          <button
                            onClick={() => handleAction("Aprovar")}
                            disabled={processing}
                            className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                          >
                            ✅ Aprovar na CPG
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {(userRole === "Conselho" || userRole === "CG") && (
                    <>
                      <button
                        onClick={() => handleAction("Elucidar")}
                        disabled={processing}
                        className="flex-1 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg font-medium transition-colors"
                      >
                        ❓ Pedir Elucidação
                      </button>
                      <button
                        onClick={() => handleAction("Rejeitar")}
                        disabled={processing}
                        className="flex-1 py-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors"
                      >
                        ❌ Negar
                      </button>
                      <button
                        onClick={() => handleAction("Aprovar")}
                        disabled={processing}
                        className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                      >
                        ✅ Aprovar Solicitação
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="w-full md:w-1/3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Histórico</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum histórico registrado.</p>
              ) : (
                history.map((h: any, i: number) => (
                  <div key={i} className="relative pl-4 border-l-2 border-blue-200 pb-4 last:pb-0">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                    <p className="text-xs text-slate-500 mb-1">
                      {new Date(h.date).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm font-bold text-slate-800">{h.action}</p>
                    <p className="text-xs text-slate-600">{h.user}</p>
                    {h.justification && (
                      <p className="text-xs text-slate-500 mt-1 italic">&quot;{h.justification}&quot;</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
