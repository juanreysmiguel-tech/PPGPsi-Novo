import { useState, useRef, useEffect } from "react";
import { X, Upload, File as FileIcon } from "lucide-react";
import { RequestConfig } from "@/lib/requestConfig";
import { createNewRequest } from "@/lib/backend";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function NewRequestModal({
  appUser,
  categoryFilter,
  onClose,
  onRefresh,
}: {
  appUser: any;
  categoryFilter: string | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [requestType, setRequestType] = useState("");
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculation logic
  useEffect(() => {
    if (!requestType) return;
    const config = RequestConfig[requestType];
    if (!config) return;

    let calculatedValue = 0;

    if (config.hasDiariaCalculation) {
      const inicio = dynamicData["diaria-data-inicio"];
      const fim = dynamicData["diaria-data-fim"];
      const local = dynamicData["diaria-localizacao"];
      const presencial = dynamicData["diaria-presencial"];

      if (inicio && fim && local && presencial === "Sim") {
        const d1 = new Date(inicio);
        const d2 = new Date(fim);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        if (local === "São Paulo (Estado)") {
          calculatedValue = diffDays * 150; // Example value
        } else if (local === "Outro Estado (Brasil)") {
          calculatedValue = diffDays * 320; // Example value
        } else if (local === "Exterior") {
          calculatedValue = diffDays * 500; // Example value
        }
      }
    }

    if (config.hasCurrencyLogic && !calculatedValue) {
      const original = parseFloat(dynamicData["fin-valor-original"]) || 0;
      const moeda = dynamicData["fin-moeda"];

      if (moeda === "Real (BRL)") {
        calculatedValue = original;
      } else if (moeda === "Dolar (USD)") {
        calculatedValue = original * 5.0; // Example conversion
      } else if (moeda === "Euro (EUR)") {
        calculatedValue = original * 5.5; // Example conversion
      } else if (moeda === "Libra (GBP)") {
        calculatedValue = original * 6.5; // Example conversion
      } else {
        calculatedValue = original;
      }
    }

    if (requestType === "8") {
      // Trancamento de Matrícula
      const today = new Date();
      const semester = today.getMonth() < 6 ? 1 : 2;
      const period = `${semester}º Semestre / ${today.getFullYear()}`;
      if (dynamicData["trancamento-periodo"] !== period) {
        setDynamicData((prev) => ({ ...prev, "trancamento-periodo": period }));
      }
    }

    if (calculatedValue > 0) {
      setDynamicData((prev) => {
        if (prev["diaria-valor-calculado"] !== calculatedValue.toFixed(2)) {
          return { ...prev, "diaria-valor-calculado": calculatedValue.toFixed(2) };
        }
        return prev;
      });
    } else {
      setDynamicData((prev) => {
        if (prev["diaria-valor-calculado"]) {
          const next = { ...prev };
          delete next["diaria-valor-calculado"];
          return next;
        }
        return prev;
      });
    }
  }, [
    dynamicData["diaria-data-inicio"],
    dynamicData["diaria-data-fim"],
    dynamicData["diaria-localizacao"],
    dynamicData["diaria-presencial"],
    dynamicData["fin-valor-original"],
    dynamicData["fin-moeda"],
    requestType
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setDynamicData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !requestType) return;

    setSubmitting(true);
    try {
      const fileUrls: { url: string; name: string }[] = [];

      for (const file of selectedFiles) {
        try {
          // Attempt direct upload to Storage First
          const fileRef = ref(
            storage,
            `requests/${appUser.uid}/${Date.now()}_${file.name}`
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          fileUrls.push({ url, name: file.name });
        } catch (uploadError: any) {
          console.warn("Storage upload failed (likely CORS), falling back to Base64 dataURI", uploadError);
          // Hard fallback to Base64 to ensure the request is not dropped due to GCP configuration errors 
          // Allowing up to 4MB sizes
          if (file.size < 4 * 1024 * 1024) {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
            });
            fileUrls.push({ url: base64, name: file.name });
          } else {
            console.error("File sequence dropped:", file.name);
            alert(`O arquivo ${file.name} ( ${(file.size / 1024 / 1024).toFixed(1)} MB ) é muito pesado para o método de backup e não pôde ser enviado por bloqueio de sistema do Servidor. O limite atual é de 4 MB. Sua solicitação vai prosseguir sem ele.`);
          }
        }
      }

      const config = RequestConfig[requestType];
      const isFinanceiro = config?.category === "financial";

      // Extract value for financial requests
      let valorSolicitado = 0;
      if (isFinanceiro) {
        const valorStr = dynamicData["diaria-valor-calculado"] || dynamicData["Valor Solicitado (R$)"] || dynamicData["fin-valor-original"] || "0";
        valorSolicitado = parseFloat(valorStr) || 0;
      }

      const detalhes = {
        ...dynamicData,
        fileUrls,
      };

      await createNewRequest({
        userId: appUser.uid,
        nomeSolicitante: appUser.nome,
        emailSolicitante: appUser.email,
        tipoSolicitacao: config?.title || requestType,
        detalhes: JSON.stringify(detalhes),
        valorSolicitado,
      });

      alert("Solicitação enviada com sucesso!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Erro ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderDynamicFields = () => {
    if (!requestType) {
      return (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm text-center">
          Selecione um tipo acima para preencher o formulário.
        </div>
      );
    }

    const config = RequestConfig[requestType];
    if (!config) return null;

    return (
      <div className="space-y-4 mt-4">
        {config.fields.map((field: any, idx: number) => {
          const id = field.id || field.label;

          // Handle conditionals
          if (field.conditional && field.showWhen) {
            const triggerValue = dynamicData[field.showWhen.field];
            if (triggerValue !== field.showWhen.value) return null;
          }

          if (field.type === "heading") {
            return (
              <h6 key={idx} className="font-bold text-[#004b85] border-b pb-2 mt-6">
                {field.label}
              </h6>
            );
          }

          if (field.type === "info") {
            return (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-200">
                {field.label}
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={id}
                  checked={!!dynamicData[id]}
                  onChange={(e) => handleInputChange(id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor={id} className="text-sm text-slate-700">
                  {field.label}
                </label>
              </div>
            );
          }

          if (field.type === "radio") {
            return (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex flex-wrap gap-4">
                  {field.options.map((opt: string) => (
                    <div key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`${id}-${opt}`}
                        name={id}
                        value={opt}
                        checked={dynamicData[id] === opt}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        required={field.required}
                      />
                      <label htmlFor={`${id}-${opt}`} className="text-sm text-slate-700">
                        {opt}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={dynamicData[id] || ""}
                  onChange={(e) => handleInputChange(id, e.target.value)}
                  required={field.required}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {field.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {field.helpText && <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>}
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={dynamicData[id] || ""}
                  onChange={(e) => handleInputChange(id, e.target.value)}
                  required={field.required}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {field.helpText && <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>}
              </div>
            );
          }

          if (field.type === "file") {
            // We only support one main file attachment in this simplified version
            // For a real app, you'd want to support multiple files per field
            return null;
          }

          return (
            <div key={idx}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                value={dynamicData[id] || ""}
                onChange={(e) => handleInputChange(id, e.target.value)}
                required={field.required}
                readOnly={field.readonly}
                className={`w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${field.readonly ? "bg-slate-100 text-slate-600" : ""}`}
                step={field.step}
              />
              {field.helpText && <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>}
            </div>
          );
        })}

        {/* Global File Attachment */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Anexar Documentos (Opcional)
          </label>
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            />
            <Upload className="text-slate-400 mb-2" size={24} />
            <p className="text-sm text-slate-600 font-medium">
              Clique para selecionar arquivos
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOC, JPG ou PNG (Max 5MB por arquivo)
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-[#004b85] overflow-hidden">
                    <FileIcon size={18} className="shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-[#004b85] text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg">Nova Solicitação</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Solicitação
              </label>
              <select
                value={requestType}
                onChange={(e) => {
                  setRequestType(e.target.value);
                  setDynamicData({}); // Reset data on type change
                }}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Selecione o tipo...</option>
                {Object.entries(RequestConfig)
                  .filter(([_, config]) => !categoryFilter || config.category === categoryFilter)
                  .map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.title}
                    </option>
                  ))}
              </select>
            </div>

            {renderDynamicFields()}

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !requestType}
                className="bg-[#004b85] hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Enviar Solicitação"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
