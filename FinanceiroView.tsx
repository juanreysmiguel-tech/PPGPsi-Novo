"use client";
import { useState, useEffect } from "react";
import Sidebar, { TabType } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StudentDashboard from "@/components/StudentDashboard";
import SecretariatDashboard from "@/components/SecretariatDashboard";
import ProfessorDashboard from "@/components/ProfessorDashboard";
import ConselhoDashboard from "@/components/ConselhoDashboard";
import UserManagement from "@/components/UserManagement";
import Mural from "@/components/Mural";
import PpgPsiuView from "@/components/PpgPsiuView";
import PttView from "@/components/PttView";
import DefesaView from "@/components/DefesaView";
import FinanceiroView from "@/components/FinanceiroView";
import { useFirebase, AppRole } from "@/components/FirebaseProvider";

export default function Home() {
  const { user, appUser, loading, signingIn, signIn } = useFirebase();
  const [role, setRole] = useState<AppRole>("Visitante");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("Início");

  useEffect(() => {
    if (appUser && appUser.roles.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(appUser.roles[0]);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole("Visitante");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab("Início");
  }, [appUser]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004b85]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="bg-[#004b85] text-white p-4 rounded-xl mb-6">
            <h1 className="text-2xl font-bold">PPGPsi</h1>
            <p className="text-sm opacity-80">Sistema de Gestão CPG</p>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Bem-vindo
          </h2>
          <p className="text-slate-500 mb-8">
            Faça login com sua conta institucional para acessar o sistema.
          </p>
          <button
            onClick={signIn}
            disabled={signingIn}
            className="w-full bg-[#004b85] hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Conectando...
              </>
            ) : (
              "Entrar com Google"
            )}
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === "Usuários" && role === "Secretaria") {
      return <UserManagement />;
    }

    if (activeTab === "Mural") {
      return <Mural />;
    }

    if (activeTab === "PPGPsiu") return <PpgPsiuView />;
    if (activeTab === "PTT") return <PttView />;
    if (activeTab === "Defesa") return <DefesaView />;
    if (activeTab === "Financeiro") return <FinanceiroView role={role} />;

    if (activeTab === "Início") {
      if (role === "Discente") return <StudentDashboard />;
      if (role === "Secretaria")
        return <SecretariatDashboard onTabChange={setActiveTab} />;
      if (role === "Docente") return <ProfessorDashboard />;
      if (role === "Conselho") return <ConselhoDashboard />;
      if (role === "Visitante") {
        return (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-800">
              Bem-vindo ao PPGPsi
            </h2>
            <p className="text-slate-500 mt-3 text-lg">
              Selecione um perfil no menu superior para visualizar o painel
              correspondente.
            </p>
          </div>
        );
      }
    }

    return (
      <div className="text-center py-20 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-slate-800">{activeTab}</h2>
        <p className="text-slate-500 mt-3 text-lg">
          Esta seção está em desenvolvimento.
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar
          role={role}
          setRole={setRole}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
