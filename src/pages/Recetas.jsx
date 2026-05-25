import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Recetas() {
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaExpandida, setRecetaExpandida] = useState(null);

  const [config, setConfig] = useState({
    costo_hora_hombre: 0,
    costo_luz_hora: 0,
  });

  const [nuevaReceta, setNuevaReceta] = useState({
    nombre: "",
    procedimiento: "",
    tiempo_horas: "",
    horas_luz: "",
    ingredientes: [],
  });

  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarDatos();
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    const { data } = await supabase.from("costo_config").select("*");

    if (data) {
      const cfg = {};
      data.forEach((c) => (cfg[c.clave] = Number(c.valor)));

      setConfig({
        costo_hora_hombre: cfg.costo_hora_hombre || 0,
        costo_luz_hora: cfg.costo_luz_hora || 0,
      });
    }
  };

  const guardarConfig = async () => {
    await supabase.from("costo_config").upsert([
      { clave: "costo_hora_hombre", valor: config.costo_hora_hombre },
      { clave: "costo_luz_hora", valor: config.costo_luz_hora },
    ]);

    alert("Configuración guardada 💾");
  };

  const cargarDatos = async () => {
    const ins = await supabase.from("insumos").select("*");
    const rec = await supabase.from("recetas").select("*");

    if (ins.data) setInsumos(ins.data);
    if (rec.data) setRecetas(rec.data);
  };

  const formatearUnidad = (unidad, cantidad) => {
    const c = Number(cantidad);

    if (unidad === "kg") return `${c} g`;
    if (unidad === "litro") return `${c} ml`;

    return `${c} ${unidad}`;
  };

  /* ================= FIX SOLO AQUÍ ================= */
  const agregarIngrediente = () => {
    const insumo = insumos.find((i) => String(i.id) === String(insumoId));
    if (!insumo || !cantidad) return;

    const c = Number(cantidad);

    const costo =
      insumo.unidad === "kg" || insumo.unidad === "litro"
        ? (insumo.precio / 1000) * c
        : insumo.precio * c;

    const ingrediente = {
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad: c,
      costo,
    };

    // 🔥 FIX REAL (estado seguro)
    setNuevaReceta((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, ingrediente],
    }));

    setInsumoId("");
    setCantidad("");
  };

  const calcularCostoIngredientes = () =>
    nuevaReceta.ingredientes.reduce((a, b) => a + b.costo, 0);

  const guardarReceta = async () => {
    const ingredientes = calcularCostoIngredientes();

    const manoObra =
      Number(nuevaReceta.tiempo_horas || 0) * config.costo_hora_hombre;

    const luz =
      Number(nuevaReceta.horas_luz || 0) * config.costo_luz_hora;

    const costoFinal = ingredientes + manoObra + luz;

    const precioFinal =
      costoFinal + (costoFinal * Number(nuevaReceta.margen || 0)) / 100;

    await supabase.from("recetas").insert([
      {
        ...nuevaReceta,
        costo: costoFinal,
        precio_final: precioFinal,
      },
    ]);

    cargarDatos();

    setNuevaReceta({
      nombre: "",
      margen: 30,
      procedimiento: "",
      tiempo_horas: "",
      horas_luz: "",
      ingredientes: [],
    });

    setMostrarFormulario(false);
  };

  const eliminarReceta = async (id) => {
    await supabase.from("recetas").delete().eq("id", id);
    cargarDatos();
  };

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🧾 Recetas</h1>

      <div style={styles.topBar}>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? "Cerrar" : "Nueva receta"}
        </button>

        <input
          placeholder="🔎 Buscar receta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {mostrarFormulario && (
        <div style={styles.card}>
          <input
            placeholder="Nombre receta"
            value={nuevaReceta.nombre}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })
            }
          />

          <textarea
            placeholder="Procedimiento"
            value={nuevaReceta.procedimiento}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, procedimiento: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Horas trabajo"
            value={nuevaReceta.tiempo_horas}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, tiempo_horas: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Horas luz"
            value={nuevaReceta.horas_luz}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, horas_luz: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Margen %"
            value={nuevaReceta.margen}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, margen: e.target.value })
            }
          />

          <select
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
          >
            <option value="">➕ Insumo</option>
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />

          <button onClick={agregarIngrediente}>
            ➕ Agregar ingrediente
          </button>

          <button onClick={guardarReceta}>
            💾 Guardar receta
          </button>
        </div>
      )}

      <div>
        {recetasFiltradas.map((r) => (
          <div key={r.id}>
            <div>🧾 {r.nombre}</div>
            <div>💰 ${r.costo}</div>
            <div>💵 ${r.precio_final}</div>
            <div>⏱ {r.tiempo_horas}</div>

            <button onClick={() => eliminarReceta(r.id)}>
              🗑 Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 20, background: "#f6f7fb", minHeight: "100vh" },
  title: { fontSize: 32, color: "#d63384" },
  topBar: { display: "flex", gap: 10, marginBottom: 20 },
  card: { background: "white", padding: 20, borderRadius: 12 },
};