import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Recetas() {
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaExpandida, setRecetaExpandida] = useState(null);

  const [nuevaReceta, setNuevaReceta] = useState({
    nombre: "",
    margen: "",
    procedimiento: "",
    horas_trabajo: "",
    horas_luz: "",
    ingredientes: [],
  });

  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  /* =========================
     ⚙️ CONFIGURACIÓN EDITABLE
  ========================= */
  const [costoHoraHombre, setCostoHoraHombre] = useState("");
  const [costoHoraLuz, setCostoHoraLuz] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const ins = await supabase.from("insumos").select("*");
    const rec = await supabase.from("recetas").select("*").order("nombre", { ascending: true });

    if (ins.data) setInsumos(ins.data);
    if (rec.data) setRecetas(rec.data);
  };

  /* =========================
     UNIDADES CORREGIDAS
  ========================= */
  const formatearUnidad = (unidad, cantidad) => {
    const cant = Number(cantidad);

    if (unidad === "kg") return `${cant} kg`;
    if (unidad === "litro") return `${cant} L`;

    return `${cant} ${unidad}`;
  };

  const agregarIngrediente = () => {
    const insumo = insumos.find((i) => i.id === parseInt(insumoId));
    if (!insumo || !cantidad) return;

    const cant = parseFloat(cantidad);

    let costo = 0;

    if (insumo.unidad === "kg" || insumo.unidad === "litro") {
      costo = (insumo.precio / 1000) * cant;
    } else {
      costo = insumo.precio * cant;
    }

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
    if (!nuevaReceta.nombre || nuevaReceta.ingredientes.length === 0) {
      alert("Completa la receta");
      return;
    }

    const costoIngredientes = calcularCostoIngredientes();

    const horasTrabajo = Number(nuevaReceta.horas_trabajo || 0);
    const horasLuz = Number(nuevaReceta.horas_luz || 0);

    const manoObra = horasTrabajo * Number(costoHoraHombre || 0);
    const luz = horasLuz * Number(costoHoraLuz || 0);

    const costoFinal = costoIngredientes + manoObra + luz;

    const precioFinal =
      costoFinal + (costoFinal * Number(nuevaReceta.margen || 0)) / 100;

    const { error } = await supabase.from("recetas").insert([
      {
        nombre: nuevaReceta.nombre,
        margen: Number(nuevaReceta.margen),
        procedimiento: nuevaReceta.procedimiento,
        horas_trabajo: horasTrabajo,
        horas_luz: horasLuz,
        costo_hora_hombre: Number(costoHoraHombre),
        costo_hora_luz: Number(costoHoraLuz),
        costo: costoFinal,
        precio_final: precioFinal,
        ingredientes: nuevaReceta.ingredientes,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error al guardar");
      return;
    }

    alert("Receta guardada");
    cargarDatos();

    setNuevaReceta({
      nombre: "",
      margen: "",
      procedimiento: "",
      horas_trabajo: "",
      horas_luz: "",
      ingredientes: [],
    });

    setMostrarFormulario(false);
  };

  const eliminarReceta = async (id) => {
    const confirmar = window.confirm("¿Eliminar receta?");
    if (!confirmar) return;

    await supabase.from("recetas").delete().eq("id", id);
    cargarDatos();
  };

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📋 Recetas</h1>

      {/* =========================
         CONFIGURACIÓN
      ========================= */}
      <div style={styles.card}>
        <h3>⚙️ Configuración de costos</h3>

        <label>Costo hora hombre</label>
        <input
          style={styles.input}
          type="number"
          placeholder="Ej: 2000"
          value={costoHoraHombre}
          onChange={(e) => setCostoHoraHombre(e.target.value)}
        />

        <label>Costo luz por hora</label>
        <input
          style={styles.input}
          type="number"
          placeholder="Ej: 300"
          value={costoHoraLuz}
          onChange={(e) => setCostoHoraLuz(e.target.value)}
        />
      </div>

      <div style={styles.topBar}>
        <button
          style={styles.btnPrimary}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
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
          <h3>➕ Nueva receta</h3>

          <input
            style={styles.input}
            placeholder="Nombre receta"
            value={nuevaReceta.nombre}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })
            }
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
            value={nuevaReceta.horas_trabajo}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, horas_trabajo: e.target.value })
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

          <select
            style={styles.input}
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
          >
            <option value="">Seleccionar insumo</option>
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />

          <button style={styles.btnSecondary} onClick={agregarIngrediente}>
            Agregar ingrediente
          </button>

          <div style={{ marginTop: 10 }}>
            {nuevaReceta.ingredientes.map((i, index) => (
              <div key={index} style={styles.rowIng}>
                <span>{i.nombre}</span>
                <span>{formatearUnidad(i.unidad, i.cantidad)}</span>
                <span>${i.costo.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <button style={styles.btnPrimary} onClick={guardarReceta}>
            Guardar receta
          </button>
        </div>
      )}

      {/* LISTA */}
      <div style={styles.table}>
        {recetasFiltradas.map((r) => (
          <div key={r.id} style={styles.row}>
            <div><b>{r.nombre}</b></div>
            <div>💰 ${Number(r.costo).toFixed(2)}</div>
            <div>💲 ${Number(r.precio_final).toFixed(2)}</div>
            <div>⏱ {r.horas_trabajo}h</div>

            <div>
              <button
                style={styles.btnSmall}
                onClick={() =>
                  setRecetaExpandida(recetaExpandida === r.id ? null : r.id)
                }
              >
                Ver
              </button>
            </div>

            {recetaExpandida === r.id && (
              <div style={styles.expand}>
                <h2>{r.nombre}</h2>
                <p>{r.procedimiento}</p>

                <h3>Ingredientes</h3>

                {r.ingredientes?.map((i, index) => (
                  <div key={index} style={styles.rowIng}>
                    <span>{i.nombre}</span>
                    <span>{formatearUnidad(i.unidad, i.cantidad)}</span>
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

/* estilos igual */
const styles = {
  page: { padding: 20, background: "#f6f7fb", minHeight: "100vh" },
  title: { fontSize: 34, color: "#d63384" },
  topBar: { display: "flex", gap: 10, marginBottom: 20 },
  card: { background: "white", padding: 20, borderRadius: 12 },
  table: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    background: "white",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  expand: { background: "#fff7f0", padding: 15, borderRadius: 10 },
  rowIng: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    padding: 8,
    background: "#ffe5ec",
    borderRadius: 8,
    marginBottom: 6,
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
};