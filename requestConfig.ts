import { useState, useEffect } from "react";
import { AppRole } from "@/components/FirebaseProvider";
import { Search, Shield, User as UserIcon, Check } from "lucide-react";
import { fetchAllUsers, updateUserRoles } from "@/lib/backend";

interface UserData {
  id: string;
  uid: string;
  email: string;
  nome: string;
  roles: AppRole[];
}

const ALL_ROLES: AppRole[] = [
  "Visitante",
  "Discente",
  "Docente",
  "Secretaria",
  "Conselho",
];

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: UserData) => {
    setEditingUser(user.id);
    setSelectedRoles(user.roles || []);
  };

  const handleRoleToggle = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSaveRoles = async (userId: string) => {
    setSaving(true);
    try {
      // Ensure at least Visitante is assigned if empty
      const finalRoles: AppRole[] =
        selectedRoles.length > 0 ? selectedRoles : ["Visitante"];

      await updateUserRoles(userId, finalRoles);

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, roles: finalRoles } : u)),
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating roles:", error);
      alert("Erro ao atualizar papéis do usuário.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Gestão de Usuários
        </h1>
        <p className="text-slate-500 text-lg">
          Gerencie os papéis e permissões de acesso ao sistema
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b85] focus:border-transparent"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredUsers.length} usuários
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Usuário</th>
                <th className="p-4 font-semibold">Papéis (Roles)</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#004b85]"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.nome}
                          </div>
                          <div className="text-sm text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <div className="flex flex-wrap gap-2">
                          {ALL_ROLES.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleToggle(role)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 transition-colors ${
                                selectedRoles.includes(role)
                                  ? "bg-[#004b85] text-white border-[#004b85]"
                                  : "bg-white text-slate-600 border-slate-300 hover:border-[#004b85]"
                              }`}
                            >
                              {selectedRoles.includes(role) && (
                                <Check size={12} />
                              )}
                              {role}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.roles &&
                            user.roles.map((role) => (
                              <span
                                key={role}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  role === "Visitante"
                                    ? "bg-slate-100 text-slate-600"
                                    : role === "Secretaria"
                                      ? "bg-purple-100 text-purple-700"
                                      : role === "Docente"
                                        ? "bg-blue-100 text-blue-700"
                                        : role === "Conselho"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editingUser === user.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveRoles(user.id)}
                            disabled={saving}
                            className="px-3 py-1.5 text-sm bg-[#004b85] text-white hover:bg-blue-800 rounded-lg transition-colors font-medium disabled:opacity-50"
                          >
                            {saving ? "Salvando..." : "Salvar"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 text-sm border border-slate-200 text-slate-600 hover:border-[#004b85] hover:text-[#004b85] rounded-lg transition-colors font-medium flex items-center gap-1 ml-auto"
                        >
                          <Shield size={14} /> Editar Papéis
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
