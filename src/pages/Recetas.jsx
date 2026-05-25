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
      costoIngredientes +
      manoObra +
      Number(nuevaReceta.costo_luz || 0);

    const precioFinal =
      costoFinal +
      (costoFinal * Number(nuevaReceta.margen || 0)) / 100;

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
    <div style={{ padding: 15, width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ color: "#d63384", marginBottom: 20, fontSize: 32 }}>
        Recetas
      </h1>

      {/* ... TODO TU CÓDIGO IGUAL ... */}

      <tbody>
        {recetasFiltradas.map((r) => (
          <>
            <tr key={r.id}>
              {/* TODO IGUAL */}
            </tr>

            {recetaExpandida === r.id && (
              <tr>
                <td colSpan="5" style={{ background: "#fff7f0", padding: 20 }}>
                  
                  {/* 🔥 NUEVO LAYOUT TIPO EXCEL */}
                  <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>

                    {/* IZQUIERDA: INGREDIENTES */}
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <h3>Ingredientes</h3>

                      {r.ingredientes?.map((i, index) => (
                        <div
                          key={index}
                          style={{
                            background: "white",
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 10,
                          }}
                        >
                          <strong>{i.nombre}</strong>
                          <p>
                            {i.cantidad} {i.unidad}
                          </p>
                          <p>Costo: ${Number(i.costo).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* DERECHA: DATOS */}
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <h3>Detalle</h3>

                      <p><strong>Procedimiento:</strong></p>
                      <p>{r.procedimiento}</p>

                      <p><strong>Valor hora:</strong> ${r.valor_hora}</p>
                      <p><strong>Costo luz:</strong> ${r.costo_luz}</p>
                      <p><strong>Margen:</strong> {r.margen}%</p>
                    </div>

                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </div>
  );
}