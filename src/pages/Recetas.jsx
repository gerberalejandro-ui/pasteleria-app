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
    margen: 30,
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
      data.forEach((c) => {
        cfg[c.clave] = Number(c.valor);
      });

      setConfig({
        costo_hora_hombre: cfg.costo_hora_hombre || 0,
        costo_luz_hora: cfg.costo_luz_hora || 0,
      });
    }
  };

  const cargarDatos = async () => {
    const ins = await supabase.from("insumos").select("*");
    const rec = await supabase.from("recetas").select("*");

    if (ins.data) setInsumos(ins.data);
    if (rec.data) setRecetas(rec.data);
  };

  /* ================= UNIDADES CORREGIDAS ================= */
  const formatearUnidad = (unidad, cantidad) => {
    const cant = Number(cantidad);

    if (unidad === "kg") return `${cant} g`;
    if (unidad === "litro") return `${cant} ml`;

    return `${cant} ${unidad}`;
  };

  const agregarIngrediente = () => {
    const insumo = insumos.find((i) => i.id === parseInt(insumoId));
    if (!insumo || !cantidad) return;

    const cant = Number(cantidad);

    let costo =
      insumo.unidad === "kg" || insumo.unidad === "litro"
        ? (insumo.precio / 1000) * cant
        : insumo.precio * cant;

    const ingrediente = {
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad: cant,
      costo,
    };

    setNuevaReceta({
      ...nuevaReceta,
      ingredientes: [...nuevaReceta.ingredientes, ingrediente],
    });

    setInsumoId("");
    setCantidad("");
  };

  const calcularCostoIngredientes = () =>
    nuevaReceta.ingredientes.reduce((acc, i) => acc + i.costo, 0);

  const guardarReceta = async () => {
    const costoIngredientes = calcularCostoIngredientes();

    const manoObra =
      Number(nuevaReceta.tiempo_horas || 0) * config.costo_hora_hombre;

    const costoLuz =
      Number(nuevaReceta.horas_luz || 0) * config.costo_luz_hora;

    const costoFinal = costoIngredientes + manoObra + costoLuz;

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
      <h1 style={styles.title}>Recetas</h1>

      <div style={styles.topBar}>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)} style={styles.btnPrimary}>
          {mostrarFormulario ? "Cerrar" : "Nueva receta"}
        </button>

        <input
          style={styles.search}
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* FORM */}
      {mostrarFormulario && (
        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="Nombre"
            value={nuevaReceta.nombre}
            onChange={(e) => setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })}
          />

          <textarea
            style={styles.input}
            placeholder="Procedimiento"
            value={nuevaReceta.procedimiento}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, procedimiento: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Horas trabajo"
            value={nuevaReceta.tiempo_horas}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, tiempo_horas: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Horas luz"
            value={nuevaReceta.horas_luz}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, horas_luz: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Margen %"
            value={nuevaReceta.margen}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, margen: e.target.value })
            }
          />

          {/* ingredientes */}
          <select value={insumoId} onChange={(e) => setInsumoId(e.target.value)} style={styles.input}>
            <option>Seleccionar insumo</option>
            {insumos.map((i) => (
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

          <button onClick={agregarIngrediente} style={styles.btnSecondary}>
            Agregar ingrediente
          </button>

          <button onClick={guardarReceta} style={styles.btnPrimary}>
            Guardar receta
          </button>
        </div>
      )}

      {/* LISTA */}
      <div style={styles.table}>
        {recetasFiltradas.map((r) => (
          <>
            <div key={r.id} style={styles.row}>
              <div><b>Receta:</b> {r.nombre}</div>
              <div><b>Costo:</b> ${r.costo}</div>
              <div><b>Precio:</b> ${r.precio_final}</div>
              <div><b>Horas:</b> {r.tiempo_horas}</div>

              <div>
                <button
                  style={styles.btnSmall}
                  onClick={() =>
                    setRecetaExpandida(recetaExpandida === r.id ? null : r.id)
                  }
                >
                  Ver
                </button>

                <button
                  style={{ ...styles.btnSmall, background: "#dc3545" }}
                  onClick={() => eliminarReceta(r.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {recetaExpandida === r.id && (
              <div style={styles.expand}>
                <h3>{r.nombre}</h3>

                <p>{r.procedimiento}</p>

                <h4>Ingredientes</h4>

                {r.ingredientes?.map((i, index) => (
                  <div key={index} style={styles.rowIng}>
                    <span>{i.nombre}</span>
                    <span>{formatearUnidad(i.unidad, i.cantidad)}</span>
                    <span>${i.costo}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

/* STYLES (igual base pero mejor layout) */
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
    alignItems: "center",
  },
  expand: {
    background: "#fff7f0",
    padding: 15,
    borderRadius: 10,
  },
  rowIng: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    background: "#ffe5ec",
    padding: 8,
    marginBottom: 5,
    borderRadius: 8,
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
    marginRight: 10,
  },
  btnSmall: {
    marginRight: 5,
    background: "#ff8fab",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
  },
};