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
      <h1 style={styles.title}>Recetas</h1>

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

      {mostrarFormulario && (
        <div style={styles.card}>
          <h3>Nueva receta</h3>

          <input
            style={styles.input}
            placeholder="Nombre"
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

          <button style={styles.btnSecondary} onClick={agregarIngrediente}>
            Agregar ingrediente
          </button>

          <h4>Ingredientes</h4>

          <div style={styles.tableIngredients}>
            {nuevaReceta.ingredientes.map((i, index) => (
              <div key={index} style={styles.rowIng}>
                <span>{i.nombre}</span>
                <span>{i.cantidad}</span>
                <span>{i.unidad}</span>
                <span>${i.costo.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <button style={styles.btnPrimary} onClick={guardarReceta}>
            Guardar
          </button>
        </div>
      )}

      <div style={styles.table}>
        {recetasFiltradas.map((r) => (
          <>
            <div style={styles.row}>
              <div>{r.nombre}</div>
              <div>${Number(r.costo).toFixed(2)}</div>
              <div>${Number(r.precio_final).toFixed(2)}</div>
              <div>{r.tiempo_horas}</div>

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
                <h3>Procedimiento</h3>
                <p>{r.procedimiento}</p>

                <h3>Ingredientes</h3>

                <div style={styles.tableIngredients}>
                  {r.ingredientes?.map((i, index) => (
                    <div key={index} style={styles.rowIng}>
                      <span>{i.nombre}</span>
                      <span>{i.cantidad}</span>
                      <span>{i.unidad}</span>
                      <span>${Number(i.costo).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <p><b>Costo:</b> ${r.costo}</p>
                <p><b>Precio:</b> ${r.precio_final}</p>
                <p><b>Margen:</b> {r.margen}%</p>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const styles = {
  page: {
    padding: 20,
    background: "#f6f7fb",
    minHeight: "100vh",
  },
  title: {
    fontSize: 34,
    color: "#d63384",
  },
  topBar: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    padding: 12,
    background: "white",
    borderRadius: 10,
  },
  expand: {
    background: "#fff7f0",
    padding: 15,
    borderRadius: 10,
  },
  tableIngredients: {
    display: "grid",
    gap: 6,
  },
  rowIng: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    background: "#ffe5ec",
    padding: 8,
    borderRadius: 8,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  search: {
    flex: 1,
    padding: 10,
  },
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