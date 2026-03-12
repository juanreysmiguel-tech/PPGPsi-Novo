export default function PttView() {
    return (
        <div className="max-w-6xl mx-auto h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">📝 Crie seu PTT</h1>
                <p className="text-slate-500 text-lg">Guia para elaboração de Produto Técnico e Tecnológico. Criado por Juan Rodrigo Reys Miguel</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <iframe
                    src="https://script.google.com/macros/s/AKfycbxaJ0YQxmGoAvIb2B7zpXVmiDbm9fpfoorgctfYVD-_Uw0IPlCvIUm9K8C6JL_LtzuG/exec"
                    className="w-full h-full"
                    frameBorder="0"
                    title="PTT Applet"
                />
            </div>
        </div>
    );
}
