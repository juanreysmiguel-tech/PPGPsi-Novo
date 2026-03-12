import { useEffect, useState } from "react";
import { useFirebase } from "@/components/FirebaseProvider";
import { fetchMuralPosts, createMuralPost } from "@/lib/backend";
import { Megaphone } from "lucide-react";

export default function Mural() {
  const { appUser } = useFirebase();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await fetchMuralPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching mural posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !appUser) return;

    setSubmitting(true);
    try {
      await createMuralPost(appUser.uid, appUser.nome, newPost);
      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Erro ao publicar no mural.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
          <Megaphone size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Mural da Comunidade
          </h1>
          <p className="text-slate-500">
            Publicize sua pesquisa, artigos e produtos técnicos.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#004b85] text-white flex items-center justify-center font-bold text-xl shrink-0">
              {appUser?.nome.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-grow">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Compartilhe algo com a comunidade..."
                className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows={3}
                required
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting || !newPost.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publicando..." : "📤 Publicar"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">📭</div>
            <p>Nenhuma publicação ainda. Seja o primeiro a publicar!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xl shrink-0">
                  {post.nomeUsuario.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">
                      {post.nomeUsuario}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(post.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {post.conteudo}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
