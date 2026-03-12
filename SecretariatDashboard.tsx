import { Megaphone, Search, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getQualisFilterOptions, searchQualisPeriodicos } from "@/lib/backend";

export default function PpgPsiuView() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ areas: [], estratos: [], eventos: [] });
  const [searchParams, setSearchParams] = useState({ issn: "", titulo: "", areaAvaliacao: "", estrato: "", evento: "" });
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await getQualisFilterOptions();
        setFilters(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const res = await searchQualisPeriodicos(searchParams);
      if (res.success) {
        setResults(res.results);
      } else {
        alert(res.error);
        setResults([]);
      }
    } catch (e: any) {
      alert("Erro na busca: " + e.message);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">📚 Consultar Periódicos (PPGPsiu)</h1>
          <p className="text-slate-500 text-lg">Validação de Periódicos na Base Qualis CAPES</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-[#004b85] mb-4 flex items-center gap-2">
          <Search size={20} /> Buscar Periódico
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ISSN</label>
            <input type="text" className="w-full border p-2.5 rounded-lg" placeholder="Ex: 1234-5678" value={searchParams.issn} onChange={e => setSearchParams({ ...searchParams, issn: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Título do Periódico</label>
            <input type="text" className="w-full border p-2.5 rounded-lg" placeholder="Ex: Journal of Psychology" value={searchParams.titulo} onChange={e => setSearchParams({ ...searchParams, titulo: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Área de Avaliação</label>
            <select className="w-full border p-2.5 rounded-lg" value={searchParams.areaAvaliacao} onChange={e => setSearchParams({ ...searchParams, areaAvaliacao: e.target.value })}>
              <option value="">Todas</option>
              {filters.areas.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estrato (Classificação)</label>
            <select className="w-full border p-2.5 rounded-lg" value={searchParams.estrato} onChange={e => setSearchParams({ ...searchParams, estrato: e.target.value })}>
              <option value="">Todos</option>
              {filters.estratos.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Evento de Classificação</label>
            <select className="w-full border p-2.5 rounded-lg" value={searchParams.evento} onChange={e => setSearchParams({ ...searchParams, evento: e.target.value })}>
              <option value="">Todos</option>
              {filters.eventos.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button onClick={handleSearch} disabled={searching} className="bg-[#004b85] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
            {searching ? "Buscando..." : "🔎 Buscar Periódico"}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-800">Resultados da Busca: {results.length} encontrado(s)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">ISSN</th>
                  <th className="p-4 font-semibold">Título</th>
                  <th className="p-4 font-semibold">Área</th>
                  <th className="p-4 font-semibold">Estrato</th>
                  <th className="p-4 font-semibold">Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum periódico encontrado.</td>
                  </tr>
                ) : (
                  results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{r.issn}</td>
                      <td className="p-4 text-slate-600 whitespace-normal">{r.titulo}</td>
                      <td className="p-4 text-slate-600">{r.areaAvaliacao}</td>
                      <td className="p-4">
                        <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${['A1', 'A2', 'A3', 'A4'].includes(r.estrato) ? 'bg-emerald-100 text-emerald-800' :
                            ['B1', 'B2', 'B3', 'B4'].includes(r.estrato) ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                          }`}>
                          {r.estrato}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{r.evento}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
