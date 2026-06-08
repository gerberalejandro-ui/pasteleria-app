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
    margen: "",
    procedimiento: "",
    tiempo_horas: "",
    horas_luz: "",
    ingredientes: [],
   // margen: 30,
  });

  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarDatos();
    cargarConfig();
  }, []);

  /* ================= CONFIG COSTOS ================= */
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
    await supabase
      .from("costo_config")
      .update({
        valor: config.costo_hora_hombre,
      })
      .eq("clave", "costo_hora_hombre");

    await supabase
      .from("costo_config")
      .update({
        valor: config.costo_luz_hora,
      })
      .eq("clave", "costo_luz_hora");

    alert("Configuración guardada 💾");

    cargarConfig();
  };

  const cargarDatos = async () => {
    const ins = await supabase.from("insumos").select("*");
    const rec = await supabase.from("recetas").select("*");

    if (ins.data) setInsumos(ins.data);
    if (rec.data) setRecetas(rec.data);
  };

  /* ================= UNIDADES ================= */
 /* const formatearUnidad = (unidad, cantidad) => {
  const c = Number(cantidad);

  if (unidad === "kg") return `${c} kg`;

  if (unidad === "litro") return `${c} litros`;

  return `${c} ${unidad}`;
};*/
const formatearUnidad = (unidad, cantidad) => {
  const c = Number(cantidad);

  if (unidad === "kg") return `${c} gr`;

  if (unidad === "litro") return `${c} ml`;

  return `${c} ${unidad}`;
};

  /* ================= INGREDIENTES ================= */
  const agregarIngrediente = () => {
  const insumo = insumos.find(
    (i) => String(i.id) === String(insumoId)
  );

  if (!insumo || !cantidad) return;

  const c = Number(cantidad);

  const costo =
    insumo.unidad === "kg"
      ? (Number(insumo.precio) / 1000) * c
      : insumo.unidad === "litro"
      ? (Number(insumo.precio) / 1000) * c
      : Number(insumo.precio) * c;

  const ingrediente = {
    nombre: insumo.nombre,
    unidad: insumo.unidad,
    cantidad: c,
    costo,
  };

  setNuevaReceta((prev) => ({
    ...prev,
    ingredientes: [...prev.ingredientes, ingrediente],
  }));

  setInsumoId("");
  setCantidad("");
};

const eliminarIngrediente = (index) => {
  setNuevaReceta((prev) => ({
    ...prev,
    ingredientes: prev.ingredientes.filter((_, i) => i !== index),
  }));
};
  const calcularCostoIngredientes = () =>
    nuevaReceta.ingredientes.reduce((a, b) => a + b.costo, 0);

  /* ================= GUARDAR ================= */
  const guardarReceta = async () => {
    // ✅ FIX
    if (nuevaReceta.ingredientes.length === 0) {
      alert("Agregá al menos un ingrediente");
      return;
    }

        const ingredientes = calcularCostoIngredientes();

        // traer config REAL desde supabase
        const { data: configDB } = await supabase
          .from("costo_config")
          .select("*");

        const cfg = {};

        configDB.forEach((c) => {
          cfg[c.clave] = Number(c.valor);
        });

        const manoObra =
          Number(nuevaReceta.tiempo_horas || 0) *
          Number(cfg.costo_hora_hombre || 0);

        const luz =
          Number(nuevaReceta.horas_luz || 0) *
          Number(cfg.costo_luz_hora || 0);

        const costoFinal = ingredientes + manoObra + luz;

    const precioFinal =
      costoFinal + (costoFinal * Number(nuevaReceta.margen || 0)) / 100;

    // ✅ FIX
   const { error } = await supabase.from("recetas").insert([
  {
    nombre: nuevaReceta.nombre,
    procedimiento: nuevaReceta.procedimiento,

    tiempo_horas: Number(nuevaReceta.tiempo_horas),
    horas_luz: Number(nuevaReceta.horas_luz),

    valor_hora: Number(manoObra),
    costo_luz: Number(luz),

    margen: Number(nuevaReceta.margen || 0),

    ingredientes: nuevaReceta.ingredientes,

    costo: Number(costoFinal),
    precio_final: Number(precioFinal),
  },
]);

    if (error) {
      console.log(error);
      alert("Error al guardar receta");
      return;
    }

    await cargarDatos();

    setNuevaReceta({
      nombre: "",
      margen: "",
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

 const recetasFiltradas = recetas
  .filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )
  .sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
    })
  );

  const recalcularRecetas = async () => {
  try {
    // Leer insumos actuales
    const { data: insumosDB, error: errorInsumos } =
      await supabase.from("insumos").select("*");

    if (errorInsumos) throw errorInsumos;

    // Leer configuración actual
    const { data: configDB, error: errorConfig } =
      await supabase.from("costo_config").select("*");

    if (errorConfig) throw errorConfig;

    const cfg = {};

    configDB.forEach((c) => {
      cfg[c.clave] = Number(c.valor);
    });

    // Leer recetas
    const { data: recetasDB, error: errorRecetas } =
      await supabase.from("recetas").select("*");

    if (errorRecetas) throw errorRecetas;

    for (const receta of recetasDB) {
      let costoIngredientes = 0;

      const ingredientesActualizados =
        receta.ingredientes?.map((ing) => {
          const insumoActual = insumosDB.find(
            (i) =>
              i.nombre?.toLowerCase().trim() ===
              ing.nombre?.toLowerCase().trim()
          );

          if (!insumoActual) {
            return ing;
          }

          let costo = 0;

          if (
            insumoActual.unidad === "kg" ||
            insumoActual.unidad === "litro"
          ) {
            costo =
              (Number(insumoActual.precio) / 1000) *
              Number(ing.cantidad);
          } else {
            costo =
              Number(insumoActual.precio) *
              Number(ing.cantidad);
          }

          costoIngredientes += costo;

          return {
            ...ing,
            costo,
          };
        }) || [];

      const manoObra =
        Number(receta.tiempo_horas || 0) *
        Number(cfg.costo_hora_hombre || 0);

      const luz =
        Number(receta.horas_luz || 0) *
        Number(cfg.costo_luz_hora || 0);

      const costoFinal =
        costoIngredientes +
        manoObra +
        luz;

      const precioFinal =
        costoFinal +
        (costoFinal * Number(receta.margen || 0)) / 100;

      const { error } = await supabase
        .from("recetas")
        .update({
          ingredientes: ingredientesActualizados,
          valor_hora: manoObra,
          costo_luz: luz,
          costo: costoFinal,
          precio_final: precioFinal,
        })
        .eq("id", receta.id);

      if (error) {
        console.log(
          `Error actualizando receta ${receta.nombre}`,
          error
        );
      }
    }

    await cargarDatos();

    alert("✅ Todas las recetas fueron recalculadas");
  } catch (err) {
    console.log(err);
    alert("❌ Error al recalcular recetas");
  }
};
  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🧾 Recetas</h1>

      {/* CONFIG COSTOS */}
      <div style={styles.configBox}>
        <h3>⚙️ Configuración de costos</h3>

        <div style={styles.grid}>
          <div>
            ⚡ Luz por hora
            <input
              style={styles.input}
              type="number"
              value={config.costo_luz_hora}
              onChange={(e) =>
                setConfig({ ...config, costo_luz_hora: e.target.value })
              }
            />
          </div>

          <div>
            👷 Hora hombre
            <input
              style={styles.input}
              type="number"
              value={config.costo_hora_hombre}
              onChange={(e) =>
                setConfig({ ...config, costo_hora_hombre: e.target.value })
              }
            />
          </div>
        </div>

        <button onClick={guardarConfig} style={styles.btnPrimary}>
          💾 Guardar configuración
        </button>
        <button
          onClick={recalcularRecetas}
          style={styles.btnSecondary}
        >
          🔄 Recalcular recetas
        </button>
      </div>

      {/* TOP */}
      <div style={styles.topBar}>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={styles.btnPrimary}
        >
          ➕ {mostrarFormulario ? "Cerrar" : "Nueva receta"}
        </button>

        <input
          style={styles.search}
          placeholder="🔎 Buscar receta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* FORM */}
      {mostrarFormulario && (
        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="🧾 Nombre"
            value={nuevaReceta.nombre}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })
            }
          />

          <textarea
            style={styles.input}
            placeholder="📌 Procedimiento"
            value={nuevaReceta.procedimiento}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, procedimiento: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="⏱ Horas trabajo"
            type="number"
            value={nuevaReceta.tiempo_horas}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, tiempo_horas: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="💡 Horas luz"
            type="number"
            value={nuevaReceta.horas_luz}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, horas_luz: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="📈 Margen %"
            type="number"
            value={nuevaReceta.margen || ""}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, margen: e.target.value })
            }
          />

          <select
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
            style={styles.input}
          >
            <option value="">➕ Insumo</option>

            {[...insumos]
              .sort((a, b) =>
                a.nombre.localeCompare(b.nombre, "es", {
                  sensitivity: "base",
                })
              )
              .map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Cantidad"
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />

          {/* ✅ FIX */}
          <button
            type="button"
            onClick={agregarIngrediente}
            style={styles.btnSecondary}
          >
            ➕ Agregar ingrediente
          </button>
           {nuevaReceta.ingredientes.map((i, index) => (
              <div key={index} style={styles.rowIng}>
                <span>{i.nombre}</span>

                <span>
                  {formatearUnidad(i.unidad, i.cantidad)}
                </span>

                <span>${i.costo}</span>

                <button
                  type="button"
                  onClick={() => eliminarIngrediente(index)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          <button onClick={guardarReceta} style={styles.btnPrimary}>
            💾 Guardar receta
          </button>
        </div>
      )}

      {/* LISTA */}
<div style={styles.table}>

  {/* TITULOS */}
  <div
    style={{
      ...styles.row,
      background: "#d63384",
      color: "white",
      fontWeight: "bold",
    }}
  >
    <div>🧾 Receta</div>
    <div>💰 Costo</div>
    <div>💵 Precio final</div>
    <div>⏱ Horas</div>
    <div>⚙️ Acciones</div>
  </div>

  {recetasFiltradas.map((r) => (
    <div key={r.id}>
            <div key={r.id} style={styles.row}>
              <div>🧾 {r.nombre}</div>
              <div>💰 ${r.costo}</div>
              <div>💵 ${r.precio_final}</div>
              <div>⏱ {r.tiempo_horas}</div>

              <div>
                <button
                  style={styles.btnSmall}
                  onClick={() =>
                    setRecetaExpandida(recetaExpandida === r.id ? null : r.id)
                  }
                >
                  👁 Ver
                </button>

                <button
                  style={{ ...styles.btnSmall, background: "#dc3545" }}
                  onClick={() => eliminarReceta(r.id)}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>

            {recetaExpandida === r.id && (
              <div style={styles.expand}>
                <h3>📌 {r.nombre}</h3>

                <p>
                  <strong>Procedimiento:</strong><br />
                  {r.procedimiento}
                </p>

               <h4>Detalles</h4>

                  <div style={styles.rowIng}>
                    <strong>Horas trabajo</strong>
                    <strong>Horas luz</strong>
                    <strong>Margen</strong>
                  </div>

                  <div style={styles.rowIng}>
                    <span>{r.tiempo_horas}</span>
                    <span>{r.horas_luz}</span>
                    <span>{r.margen || 0}%</span>
                  </div>

                  <div style={styles.rowIng}>
                    <strong>Costo</strong>
                    <strong>Precio final</strong>
                    <strong></strong>
                  </div>

                  <div style={styles.rowIng}>
                    <span>${r.costo}</span>
                    <span>${r.precio_final}</span>
                    <span></span>
                  </div>

                <h4>Ingredientes</h4>

                <div style={styles.rowIng}>
                  <strong>Ingrediente</strong>
                  <strong>Cantidad</strong>
                  <strong>Costo</strong>
                </div>

                {r.ingredientes?.map((i, index) => (
                  <div key={index} style={styles.rowIng}>
                    <span>{i.nombre}</span>

                    <span>
                     {i.unidad === "kg"
                      ? `${i.cantidad} gr`
                      : i.unidad === "litro"
                      ? `${i.cantidad} ml`
                      : `${i.cantidad} ${i.unidad}`}
                    </span>

                    <span>${i.costo}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { padding: 20, background: "#f6f7fb", minHeight: "100vh" },
  title: { fontSize: 32, color: "#d63384" },
  topBar: { display: "flex", gap: 10, marginBottom: 20 },
  card: { background: "white", padding: 20, borderRadius: 12 },
  table: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    background: "white",
    padding: 12,
    borderRadius: 10,
  },
  expand: { background: "#fff7f0", padding: 15, borderRadius: 10 },
  rowIng: {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 80px",
  padding: 8,
  background: "#ffe5ec",
  borderRadius: 8,
  marginBottom: 6,
  alignItems: "center",
},
  input: { width: "100%", padding: 10, marginBottom: 10 },
  search: { flex: 1, padding: 10 },
  btnPrimary: {
    background: "#d63384",
    color: "white",
    padding: 10,
    border: "none",
    borderRadius: 8,
  },
  btnSecondary: {
    background: "#ff8fab",
    color: "white",
    padding: 10,
    border: "none",
    borderRadius: 8,
  },
  btnSmall: {
    marginRight: 5,
    background: "#ff8fab",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
  },
  configBox: {
    background: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
};