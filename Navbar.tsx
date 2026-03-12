import React, { useState } from "react";
import { submitDefesa, searchQualisPeriodicos } from "@/lib/backend";
import { useFirebase } from "@/components/FirebaseProvider";
import { CheckCircle, AlertCircle, CalendarDays, Upload } from "lucide-react";

export default function DefesaView() {
  const { appUser } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nivel: "Mestrado",
    titulo: "",
    data_defesa: "",
    horario_defesa: "",
    local: "",
  });

  const [artigos, setArtigos] = useState<any[]>([
    { apa: "", issn: "", titulo: "", qualisValido: false, estrato: "", arquivo: null }
  ]);
  const [validatingIdx, setValidatingIdx] = useState<number | null>(null);

  const handleNivelChange = (nivel: string) => {
    setFormData({ ...formData, nivel });
    if (nivel === "Doutorado" && artigos.length < 2) {
      setArtigos([...artigos, { apa: "", issn: "", titulo: "", qualisValido: false, estrato: "", arquivo: null }]);
    } else if (nivel === "Mestrado" && artigos.length > 1) {
      setArtigos([artigos[0]]);
    }
  };

  const validateQualis = async (idx: number) => {
    const art = artigos[idx];
    if (!art.issn && !art.titulo) {
      alert("Informe ISSN ou Título para validar o Qualis.");
      return;
    }
    setValidatingIdx(idx);
    try {
      const res = await searchQualisPeriodicos({ issn: art.issn, titulo: art.titulo });
      if (res.success && res.results && res.results.length > 0) {
        const bestMatch = res.results.find((r: any) => ['A1', 'A2', 'A3', 'A4'].includes(r.estrato)) || res.results[0];
        const isTopStrata = ['A1', 'A2', 'A3', 'A4'].includes(bestMatch.estrato);

        const newArtigos = [...artigos];
        newArtigos[idx] = {
          ...art,
          qualisValido: isTopStrata,
          estrato: bestMatch.estrato,
          periodicoEncontrado: bestMatch.titulo
        };
        setArtigos(newArtigos);
        if (!isTopStrata) alert(`Periódico encontrado com estrato ${bestMatch.estrato}. É necessário A1-A4.`);
      } else {
        alert("Periódico não encontrado no Qualis.");
      }
    } catch (e: any) {
      alert("Erro ao validar: " + e.message);
    } finally {
      setValidatingIdx(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return alert("Usuário não autenticado");

    // Check if required valid articles are met
    const requirement = formData.nivel === "Mestrado" ? 1 : 2;
    // For UI feedback we only submit valid articles or whatever is there, checking reqs first
    const validCount = artigos.filter(a => a.qualisValido).length;
    if (validCount < requirement) {
      return alert(`O nível ${formData.nivel} exige ${requirement} artigo(s) válido(s)(A1 - A4).`);
    }

    setLoading(true);

    // Import Storage functions locally to avoid breaking component load if Firebase is not fully configured
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('@/lib/firebase');

    const processArtigos = await Promise.all(artigos.map(async (art, idx) => {
      let fileUrl = null;
      if (art.arquivo && storage) {
        try {
          const fileName = `defesa_comprovantes/${appUser.id}_artigo_${idx}_${Date.now()}_${art.arquivo.name}`;
          const storageRef = ref(storage, fileName);
          const snapshot = await uploadBytes(storageRef, art.arquivo);
          fileUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error("Erro no upload do comprovante:", uploadError);
          throw new Error(`Falha no upload do comprovante do Artigo ${idx + 1}`);
        }
      } else if (art.qualisValido && !art.arquivo) {
        throw new Error(`O comprovante (arquivo) do Artigo ${idx + 1} é obrigatório.`);
      }

      // Return without the File object, which can't be stored in Firestore
      const { arquivo, ...restArtigo } = art;
      return { ...restArtigo, fileUrl };
    }));

    const payload = {
      userId: appUser.id,
      nomeUsuario: appUser.nome,
      categoria: "Defesa",
      titulo: "Agendamento de Defesa",
      ...formData,
      artigos: processArtigos
    };
    await submitDefesa(payload);
    alert("Agendamento de Defesa enviado com sucesso!");
    // Reset form
    setFormData({ nivel: "Mestrado", titulo: "", data_defesa: "", horario_defesa: "", local: "" });
    setArtigos([{ apa: "", issn: "", titulo: "", qualisValido: false, estrato: "", arquivo: null }]);
  } catch (err: any) {
    alert("Erro ao enviar: " + err.message);
  } finally {
    setLoading(false);
  }
};

return (
  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
    <div>
      <h1 className="text-3xl font-bold text-slate-800">🎓 Agendar Defesa</h1>
      <p className="text-slate-500 mt-2">Registre os dados da sua defesa e valide os artigos exigidos pelo programa.</p>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">1. Dados da Defesa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nível</label>
              <select
                className="w-full border p-2.5 rounded-lg bg-slate-50"
                value={formData.nivel}
                onChange={e => handleNivelChange(e.target.value)}
                required
              >
                <option value="Mestrado">Mestrado</option>
                <option value="Doutorado">Doutorado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título do Trabalho</label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Defesa</label>
              <input
                type="date"
                className="w-full border p-2.5 rounded-lg"
                value={formData.data_defesa}
                onChange={e => setFormData({ ...formData, data_defesa: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
              <input
                type="time"
                className="w-full border p-2.5 rounded-lg"
                value={formData.horario_defesa}
                onChange={e => setFormData({ ...formData, horario_defesa: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Local (ou Link da Reunião)</label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg"
                value={formData.local}
                onChange={e => setFormData({ ...formData, local: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">2. Validação de Artigos (Qualis)</h2>
          <p className="text-sm text-slate-500">Mestrado exige 1 artigo em estrato A1-A4. Doutorado exige 2 artigos.</p>

          {artigos.map((art, idx) => (
            <div key={idx} className={`p - 4 rounded - xl border ${art.qualisValido ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700">Artigo {idx + 1}</h3>
                {art.qualisValido && <span className="flex items-center text-emerald-600 text-sm font-bold gap-1"><CheckCircle size={16} /> Comprovado (Qualis {art.estrato})</span>}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Referência APA completa</label>
                  <textarea
                    className="w-full border p-2 rounded-lg text-sm disabled:opacity-75"
                    rows={2}
                    value={art.apa}
                    onChange={e => {
                      const newArt = [...artigos];
                      newArt[idx].apa = e.target.value;
                      setArtigos(newArt);
                    }}
                    disabled={art.qualisValido}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">ISSN do Periódico</label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded-lg text-sm disabled:opacity-75"
                      placeholder="Ex: 1234-5678"
                      value={art.issn}
                      onChange={e => {
                        const newArt = [...artigos];
                        newArt[idx].issn = e.target.value;
                        setArtigos(newArt);
                      }}
                      disabled={art.qualisValido}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Ou Título do Periódico</label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded-lg text-sm disabled:opacity-75"
                      value={art.titulo}
                      onChange={e => {
                        const newArt = [...artigos];
                        newArt[idx].titulo = e.target.value;
                        setArtigos(newArt);
                      }}
                      disabled={art.qualisValido}
                    />
                  </div>
                </div>

                {!art.qualisValido && (
                  <button
                    type="button"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => validateQualis(idx)}
                    disabled={validatingIdx === idx}
                  >
                    {validatingIdx === idx ? "Buscando na base..." : "Verificar no Sistema Qualis CAPES"}
                  </button>
                )}
                {art.qualisValido && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-sm font-medium text-emerald-800">
                      {art.periodicoEncontrado && `✅ ${art.periodicoEncontrado}`} (Qualis {art.estrato})
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 flex flex-col gap-2">
                      <label className="block text-sm font-medium text-slate-700">Comprovante Obrigatório (Aceite/Publicação)</label>
                      <p className="text-xs text-slate-500">Faça o upload do arquivo para comprovar sua submissão/aceite neste periódico.</p>
                      <input
                        type="file"
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          const newArt = [...artigos];
                          newArt[idx].arquivo = file;
                          setArtigos(newArt);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200 text-center">
          <button
            type="submit"
            className="bg-[#004b85] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "Processando..." : <><CalendarDays size={20} /> Solicitar Agendamento de Defesa</>}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
