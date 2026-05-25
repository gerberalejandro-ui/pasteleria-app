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
    margen: 0, // ✔ GANANCIA % ahora 0 por default
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

  /* ================= UNIDADES ================= */
  const formatearUnidad = (unidad, cantidad) => {
    const c = Number(cantidad);

    if (unidad === "kg") return `${c} g`;
    if (unidad === "litro") return `${c} ml`;

    return `${c} ${unidad}`;
  };

  const agregarIngrediente = () => {
    const insumo = insumos.find((i) => i.id === parseInt(insumoId));
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

    setNuevaReceta({
      ...nuevaReceta,
      ingredientes: [...nuevaReceta.ingredientes, ingrediente],
    });

    setInsumoId("");
    setCantidad("");
  };

  const calcularCostoIngredientes = () =>
    nuevaReceta.ingredientes.reduce((acc, item) => acc + item.costo, 0);

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 15, width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ color: "#d63384", marginBottom: 20, fontSize: 32 }}>
        Recetas
      </h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? "Cerrar" : "Nueva receta"}
        </button>

        <input
          placeholder="Buscar receta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {/* FORM */}
      {mostrarFormulario && (
        <div style={{ padding: 15, background: "#fff", borderRadius: 10 }}>
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

          {/* ✔ GANANCIA % (RENOMBRADO VISUALMENTE) */}
          <input
            type="number"
            placeholder="Ganancia %"
            value={nuevaReceta.margen}
            onChange={(e) =>
              setNuevaReceta({ ...nuevaReceta, margen: e.target.value })
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

          <select value={insumoId} onChange={(e) => setInsumoId(e.target.value)}>
            <option>Seleccionar insumo</option>
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

          <button onClick={agregarIngrediente}>Agregar ingrediente</button>
        </div>
      )}

      {/* LISTA */}
      <div>
        {recetasFiltradas.map((r) => (
          <div key={r.id} style={{ marginBottom: 10, padding: 10, background: "#fff" }}>
            
            {/* ✔ TITULOS AGREGADOS */}
            <div><b>🧾 Receta:</b> {r.nombre}</div>
            <div><b>💰 Costo:</b> ${Number(r.costo).toFixed(2)}</div>
            <div><b>💵 Precio final:</b> ${Number(r.precio_final).toFixed(2)}</div>
            <div><b>⏱ Horas:</b> {r.tiempo_horas}</div>
            <div><b>📈 Ganancia %:</b> {r.margen}</div>

            <button onClick={() =>
              setRecetaExpandida(recetaExpandida === r.id ? null : r.id)
            }>
              Ver
            </button>

            <button
              onClick={() =>
                supabase.from("recetas").delete().eq("id", r.id).then(cargarDatos)
              }
            >
              Eliminar
            </button>

            {recetaExpandida === r.id && (
              <div style={{ marginTop: 10 }}>
                <b>Procedimiento:</b>
                <p>{r.procedimiento}</p>

                <b>Ingredientes:</b>
                {r.ingredientes?.map((i, index) => (
                  <div key={index}>
                    {i.nombre} - {formatearUnidad(i.unidad, i.cantidad)} - ${i.costo}
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