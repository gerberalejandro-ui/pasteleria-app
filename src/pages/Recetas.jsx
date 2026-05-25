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
    margen: 100,
    procedimiento: "",
    tiempo_horas: "",
    valor_hora: "",
    costo_luz: "",
    ingredientes: [],
  });

  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const ins = await supabase.from("insumos").select("*");
    const rec = await supabase.from("recetas").select("*").order("nombre", { ascending: true });

    if (ins.data) setInsumos(ins.data);
    if (rec.data) setRecetas(rec.data);
  };

  const agregarIngrediente = () => {
    const insumo = insumos.find((i) => i.id === parseInt(insumoId));
    if (!insumo || !cantidad) return;

    let costo = 0;

    if (insumo.unidad === "kg" || insumo.unidad === "litro") {
      costo = (insumo.precio / 1000) * parseFloat(cantidad);
    } else {
      costo = insumo.precio * parseFloat(cantidad);
    }

    const ingrediente = {
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad: parseFloat(cantidad),
      costo,
    };

    setNuevaReceta({
      ...nuevaReceta,
      ingredientes: [...nuevaReceta.ingredientes, ingrediente],
    });

    setInsumoId("");
    setCantidad("");
  };

  const calcularCostoIngredientes = () => {
    return nuevaReceta.ingredientes.reduce((acc, item) => acc + item.costo, 0);
  };

  const guardarReceta = async () => {
    if (!nuevaReceta.nombre || nuevaReceta.ingredientes.length === 0) {
      alert("Completa la receta");
      return;
    }

    const costoIngredientes = calcularCostoIngredientes();
    const manoObra =
      Number(nuevaReceta.tiempo_horas || 0) *
      Number(nuevaReceta.valor_hora || 0);

    const costoFinal =
      costoIngredientes + manoObra + Number(nuevaReceta.costo_luz || 0);

    const precioFinal =
      costoFinal + (costoFinal * Number(nuevaReceta.margen || 0)) / 100;

    const { error } = await supabase.from("recetas").insert([
      {
        nombre: nuevaReceta.nombre,
        margen: Number(nuevaReceta.margen),
        procedimiento: nuevaReceta.procedimiento,
        tiempo_horas: Number(nuevaReceta.tiempo_horas),
        valor_hora: Number(nuevaReceta.valor_hora),
        costo_luz: Number(nuevaReceta.costo_luz),
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
      margen: 100,
      procedimiento: "",
      tiempo_horas: "",
      valor_hora: "",
      costo_luz: "",
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
      
      <div style={styles.header}>
        <h1 style={styles.title}>Recetas</h1>

        <div style={styles.actions}>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={styles.btnPrimary}
          >
            {mostrarFormulario ? "Cerrar formulario" : "Nueva receta"}
          </button>

          <input
            style={styles.search}
            placeholder="Buscar receta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div style={styles.card}>
          <h2 style={styles.subtitle}>Nueva receta</h2>

          <input
            style={styles.input}
            placeholder="Nombre receta"
            value={nuevaReceta.nombre}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, nombre: e.target.value })
            }
          />

          <textarea
            style={{ ...styles.input, minHeight: 120 }}
            placeholder="Procedimiento"
            value={nuevaReceta.procedimiento}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, procedimiento: e.target.value })
            }
          />

          <div style={styles.grid}>
            <input
              style={styles.input}
              type="number"
              placeholder="Horas"
              value={nuevaReceta.tiempo_horas}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, tiempo_horas: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Valor hora"
              value={nuevaReceta.valor_hora}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, valor_hora: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Costo luz"
              value={nuevaReceta.costo_luz}
              onChange={(e) =>
                setNuevaReceta({ ...nuevaReceta, costo_luz: e.target.value })
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
          </div>

          <button style={styles.btnSecondary} onClick={agregarIngrediente}>
            Agregar ingrediente
          </button>

          <h3 style={styles.sectionTitle}>Ingredientes</h3>

          {nuevaReceta.ingredientes.map((i, index) => (
            <div key={index} style={styles.ingredient}>
              <b>{i.nombre}</b>
              <span>{i.cantidad} {i.unidad}</span>
              <span>${Number(i.costo).toFixed(2)}</span>
            </div>
          ))}

          <button style={styles.btnPrimary} onClick={guardarReceta}>
            Guardar receta
          </button>
        </div>
      )}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Receta</th>
              <th>Costo</th>
              <th>Precio</th>
              <th>Horas</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {recetasFiltradas.map((r) => (
              <>
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>${Number(r.costo).toFixed(2)}</td>
                  <td>${Number(r.precio_final).toFixed(2)}</td>
                  <td>{r.tiempo_horas}</td>
                  <td>
                    <button style={styles.btnSmall}>
                      Ver
                    </button>

                    <button
                      style={{ ...styles.btnSmall, background: "#dc3545" }}
                      onClick={() => eliminarReceta(r.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 20,
    background: "#f6f7fb",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    color: "#d63384",
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },
  tableCard: {
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginBottom: 10,
  },
  search: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  },
  btnPrimary: {
    background: "#d63384",
    color: "white",
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "#ff8fab",
    color: "white",
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 10,
  },
  btnSmall: {
    padding: "6px 10px",
    marginRight: 5,
    borderRadius: 8,
    border: "none",
    background: "#ff8fab",
    color: "white",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  ingredient: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    background: "#ffe5ec",
    borderRadius: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 15,
    color: "#d63384",
  },
};