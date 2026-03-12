import { useState } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText, CheckCircle, Clock } from "lucide-react";
import { AppRole } from "@/components/FirebaseProvider";

export default function FinanceiroView({ role }: { role: AppRole }) {
    const [activeTab, setActiveTab] = useState<"balanco" | "historico">("balanco");

    const totalDisponivel = role === "Docente" ? 8500 : 250000;
    const emUso = role === "Docente" ? 1200 : 45000;
    const executado = role === "Docente" ? 3500 : 120000;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 right-40 mb-10 w-32 h-32 rounded-full bg-emerald-400 opacity-20 blur-xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
                            <DollarSign size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {role === "Docente" ? "Meus Recursos PROEX" : "Gestão Financeira PROEX"}
                            </h1>
                            <p className="text-emerald-100 font-medium mt-1">
                                Acompanhamento e transparência na alocação de verbas
                            </p>
                        </div>
                    </div>
                    {(role === "Secretaria" || role === "Conselho") && (
                        <button className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                            <FileText size={18} /> Exportar Relatório
                        </button>
                    )}
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 mt-8 border-t border-white/20">
                    <div className="bg-black/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
                        <div>
                            <span className="text-sm font-semibold text-emerald-100 block mb-1">
                                Saldo Disponível
                            </span>
                            <span className="font-bold text-3xl text-white shadow-sm">
                                {totalDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="bg-emerald-500/30 p-3 rounded-full">
                            <ArrowDownRight className="text-emerald-100" size={24} />
                        </div>
                    </div>

                    <div className="bg-black/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
                        <div>
                            <span className="text-sm font-semibold text-emerald-100 block mb-1">
                                Em Empenho (Reservado)
                            </span>
                            <span className="font-bold text-3xl text-white shadow-sm">
                                {emUso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="bg-amber-500/30 p-3 rounded-full">
                            <Clock className="text-amber-100" size={24} />
                        </div>
                    </div>

                    <div className="bg-black/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
                        <div>
                            <span className="text-sm font-semibold text-emerald-100 block mb-1">
                                Executado
                            </span>
                            <span className="font-bold text-3xl text-white shadow-sm">
                                {executado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="bg-blue-500/30 p-3 rounded-full">
                            <CheckCircle className="text-blue-100" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        onClick={() => setActiveTab("balanco")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "balanco" ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                        Balanço Atual
                    </button>
                    <button
                        onClick={() => setActiveTab("historico")}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "historico" ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                        Histórico de Transações
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "balanco" ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Resumo Financeiro Consolidado</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Esta visualização detalhará a dotação orçamentária distribuída por rubricas (Capital, Custeio, Auxílios Diários, Passagens).
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Histórico Vazio</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                O extrato de movimentações será listado aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
