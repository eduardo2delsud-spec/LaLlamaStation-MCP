import { Activity, Cpu, Play, RefreshCw, Save, ShieldAlert } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { brainApi } from "../services/api.service";

interface BrainSettingsProps {
	project: string;
}

export const BrainSettings: React.FC<BrainSettingsProps> = ({ project }) => {
	const [threshold, setThreshold] = useState("3");
	const [model, setModel] = useState("llama3.2");
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [consolidating, setConsolidating] = useState(false);
	const [consolidationRes, setConsolidationRes] = useState<{ consolidatedGroups?: number; deletedMemories?: number } | null>(null);
	const [successMsg, setSuccessMsg] = useState("");

	const fetchSettings = useCallback(async () => {
		setLoading(true);
		try {
			const [thRes, modRes] = await Promise.all([
				brainApi.get("/api/settings/delegation_threshold"),
				brainApi.get("/api/settings/consolidation_model"),
			]);
			if (thRes.data.value) setThreshold(thRes.data.value);
			if (modRes.data.value) setModel(modRes.data.value);
		} catch (error) {
			console.error("Error fetching brain settings", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	const handleSave = async () => {
		setSaving(true);
		setSuccessMsg("");
		try {
			await Promise.all([
				brainApi.post("/api/settings", { key: "delegation_threshold", value: threshold }),
				brainApi.post("/api/settings", { key: "consolidation_model", value: model }),
			]);
			setSuccessMsg("Ajustes guardados exitosamente.");
			setTimeout(() => setSuccessMsg(""), 3000);
		} catch (error) {
			console.error("Error saving settings", error);
		} finally {
			setSaving(false);
		}
	};

	const handleConsolidate = async () => {
		if (!window.confirm(`¿Iniciar consolidación de memorias para el proyecto "${project}"?`)) return;
		setConsolidating(true);
		setConsolidationRes(null);
		try {
			const res = await brainApi.post("/api/memory/consolidate", { project });
			setConsolidationRes(res.data);
		} catch (error) {
			console.error("Error consolidating memories", error);
		} finally {
			setConsolidating(false);
		}
	};

	return (
		<div className="card-glass" style={{ padding: "24px", minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", gap: "28px" }}>
			<div className="flex-between">
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<Cpu size={20} style={{ color: "var(--accent)" }} />
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 600 }}>Configuración y Mantenimiento Cognitivo</h3>
						<p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
							Ajusta el comportamiento de gatillos de intervención y mantenimiento automatizado.
						</p>
					</div>
				</div>
				<button onClick={handleSave} className="btn-send" disabled={saving || loading} style={{ width: "auto", padding: "0 20px" }}>
					{saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
					<span>{saving ? "Guardando..." : "Guardar Ajustes"}</span>
				</button>
			</div>

			{successMsg && (
				<div style={{ padding: "12px 16px", background: "rgba(34, 197, 94, 0.15)", color: "var(--success)", borderRadius: "8px", fontSize: "13px" }}>
					{successMsg}
				</div>
			)}

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
				{/* Umbral de Delegación */}
				<div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent)" }}>
						<ShieldAlert size={18} />
						<h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>Gatillos de Delegación (Threshold)</h4>
					</div>
					<p style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "16px", lineHeight: 1.5 }}>
						Número máximo de búsquedas idénticas permitidas en un lapso de 5 minutos antes de forzar al agente a detenerse o cambiar de fase SDD.
					</p>
					<input
						type="number"
						min="1"
						max="10"
						value={threshold}
						onChange={(e) => setThreshold(e.target.value)}
						className="input-field"
						style={{ width: "100%", background: "var(--bg-input)" }}
					/>
				</div>

				{/* Modelo de Consolidación */}
				<div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent)" }}>
						<Activity size={18} />
						<h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>Modelo de Consolidación</h4>
					</div>
					<p style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "16px", lineHeight: 1.5 }}>
						Modelo de IA utilizado por Ollama para ejecutar la agrupación y resumen de aprendizajes redundantes en background.
					</p>
					<input
						type="text"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className="input-field"
						style={{ width: "100%", background: "var(--bg-input)" }}
					/>
				</div>
			</div>

			{/* Consolidación Manual */}
			<div style={{ background: "rgba(79, 140, 255, 0.05)", border: "1px solid rgba(79, 140, 255, 0.2)", borderRadius: "12px", padding: "20px", marginTop: "auto" }}>
				<div className="flex-between" style={{ flexWrap: "wrap", gap: "16px" }}>
					<div>
						<h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent)", marginBottom: "4px" }}>
							Mantenimiento Proactivo: Consolidación Manual
						</h4>
						<p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
							Analiza memorias redundantes del proyecto <b>{project}</b> y fusionalas en Key Learnings limpios.
						</p>
					</div>
					<button
						onClick={handleConsolidate}
						className="btn-send"
						disabled={consolidating}
						style={{ width: "auto", padding: "0 24px", background: "var(--accent)", color: "#000" }}
					>
						{consolidating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
						<span>{consolidating ? "Consolidando..." : "Ejecutar Consolidación"}</span>
					</button>
				</div>

				{consolidationRes && (
					<div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "13px", display: "flex", gap: "16px", borderLeft: "3px solid var(--accent)" }}>
						<div>Grupos Consolidados: <b>{consolidationRes.consolidatedGroups || 0}</b></div>
						<div>Memorias Antiguas Eliminadas: <b>{consolidationRes.deletedMemories || 0}</b></div>
					</div>
				)}
			</div>
		</div>
	);
};
