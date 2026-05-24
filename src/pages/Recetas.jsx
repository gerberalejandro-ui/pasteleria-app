import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Recetas() {
  const [insumos, setInsumos] =
    useState([]);

  const [recetas, setRecetas] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    recetaExpandida,
    setRecetaExpandida,
  ] = useState(null);

  const [nuevaReceta, setNuevaReceta] =
    useState({
      nombre: "",
      margen: 100,
      procedimiento: "",
      tiempo_horas: "",
      valor_hora: "",
      costo_luz: "",
      ingredientes: [],
    });

  const [insumoId, setInsumoId] =
    useState("");

  const [cantidad, setCantidad] =
    useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const ins = await supabase
      .from("insumos")
      .select("*");

    const rec = await supabase
      .from("recetas")
      .select("*")
      .order("nombre", {
        ascending: true,
      });

    if (ins.data) setInsumos(ins.data);

    if (rec.data) setRecetas(rec.data);
  };

  const agregarIngrediente = () => {
    const insumo = insumos.find(
      (i) =>
        i.id === parseInt(insumoId)
    );

    if (!insumo || !cantidad) return;

    let costo = 0;

    if (
      insumo.unidad === "kg" ||
      insumo.unidad === "litro"
    ) {
      costo =
        (insumo.precio / 1000) *
        parseFloat(cantidad);
    } else {
      costo =
        insumo.precio *
        parseFloat(cantidad);
    }

    const ingrediente = {
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad: parseFloat(cantidad),
      costo,
    };

    setNuevaReceta({
      ...nuevaReceta,
      ingredientes: [
        ...nuevaReceta.ingredientes,
        ingrediente,
      ],
    });

    setInsumoId("");
    setCantidad("");
  };

  const calcularCostoIngredientes =
    () => {
      return nuevaReceta.ingredientes.reduce(
        (acc, item) =>
          acc + item.costo,
        0
      );
    };

  const guardarReceta = async () => {
    if (
      !nuevaReceta.nombre ||
      nuevaReceta.ingredientes
        .length === 0
    ) {
      alert("Completa la receta");
      return;
    }

    const costoIngredientes =
      calcularCostoIngredientes();

    const manoObra =
      Number(
        nuevaReceta.tiempo_horas || 0
      ) *
      Number(
        nuevaReceta.valor_hora || 0
      );

    const costoFinal =
      costoIngredientes +
      manoObra +
      Number(
        nuevaReceta.costo_luz || 0
      );

    const precioFinal =
      costoFinal +
      (costoFinal *
        Number(
          nuevaReceta.margen || 0
        )) /
        100;

    const { error } =
      await supabase
        .from("recetas")
        .insert([
          {
            nombre:
              nuevaReceta.nombre,

            margen: Number(
              nuevaReceta.margen
            ),

            procedimiento:
              nuevaReceta.procedimiento,

            tiempo_horas: Number(
              nuevaReceta.tiempo_horas
            ),

            valor_hora: Number(
              nuevaReceta.valor_hora
            ),

            costo_luz: Number(
              nuevaReceta.costo_luz
            ),

            costo: costoFinal,

            precio_final:
              precioFinal,

            ingredientes:
              nuevaReceta.ingredientes,
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

  const eliminarReceta = async (
    id
  ) => {
    const confirmar =
      window.confirm(
        "¿Eliminar receta?"
      );

    if (!confirmar) return;

    await supabase
      .from("recetas")
      .delete()
      .eq("id", id);

    cargarDatos();
  };

  const recetasFiltradas =
    recetas.filter((r) =>
      r.nombre
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  return (
    <div
      style={{
        padding: 15,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          color: "#d63384",
          marginBottom: 20,
          fontSize: 32,
        }}
      >
        Recetas
      </h1>

      <div
        style={{
          display: "flex",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <button
          onClick={() =>
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
          style={{
            padding: 15,
            border: "none",
            borderRadius: 12,
            background: "#d63384",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            minWidth: 180,
          }}
        >
          {mostrarFormulario
            ? "Cerrar formulario"
            : "Nueva receta"}
        </button>

        <input
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            flex: 1,
            minWidth: 220,
            width: "100%",
            boxSizing:
              "border-box",
          }}
          placeholder="Buscar receta..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />
      </div>

      {mostrarFormulario && (
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
            display: "grid",
            gap: 18,
            width: "100%",
            maxWidth: 800,
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.1)",
            boxSizing:
              "border-box",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#d63384",
            }}
          >
            Nueva receta
          </h2>

          <div>
            <label>
              Nombre receta
            </label>

            <input
              style={inputStyle}
              placeholder="Ej: Torta Oreo"
              value={
                nuevaReceta.nombre
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  nombre:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Procedimiento
            </label>

            <textarea
              style={{
                ...inputStyle,
                minHeight: 120,
              }}
              placeholder="Paso a paso..."
              value={
                nuevaReceta.procedimiento
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  procedimiento:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Horas de trabajo
            </label>

            <input
              style={inputStyle}
              type="number"
              value={
                nuevaReceta.tiempo_horas
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  tiempo_horas:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Valor por hora
            </label>

            <input
              style={inputStyle}
              type="number"
              value={
                nuevaReceta.valor_hora
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  valor_hora:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Costo de luz
            </label>

            <input
              style={inputStyle}
              type="number"
              value={
                nuevaReceta.costo_luz
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  costo_luz:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Margen %
            </label>

            <input
              style={inputStyle}
              type="number"
              value={
                nuevaReceta.margen
              }
              onChange={(e) =>
                setNuevaReceta({
                  ...nuevaReceta,
                  margen:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Seleccionar insumo
            </label>

            <select
              style={inputStyle}
              value={insumoId}
              onChange={(e) =>
                setInsumoId(
                  e.target.value
                )
              }
            >
              <option value="">
                Seleccionar insumo
              </option>

              {insumos.map((i) => (
                <option
                  key={i.id}
                  value={i.id}
                >
                  {i.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              Cantidad
            </label>

            <input
              style={inputStyle}
              type="number"
              value={cantidad}
              onChange={(e) =>
                setCantidad(
                  e.target.value
                )
              }
            />
          </div>

          <button
            style={{
              padding: 12,
              border: "none",
              borderRadius: 10,
              background: "#ff8fab",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={agregarIngrediente}
          >
            Agregar ingrediente
          </button>

          <div>
            <h3
              style={{
                color: "#d63384",
              }}
            >
              Ingredientes
            </h3>

            {nuevaReceta.ingredientes.map(
              (i, index) => (
                <div
                  key={index}
                  style={{
                    background:
                      "#ffe5ec",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <strong>
                    {i.nombre}
                  </strong>

                  <p>
                    {i.cantidad}{" "}
                    {i.unidad}
                  </p>

                  <p>
                    Costo: $
                    {Number(
                      i.costo
                    ).toFixed(2)}
                  </p>
                </div>
              )
            )}
          </div>

          <h3
            style={{
              color: "#d63384",
            }}
          >
            Costo ingredientes: $
            {calcularCostoIngredientes().toFixed(
              2
            )}
          </h3>

          <button
            style={{
              padding: 15,
              border: "none",
              borderRadius: 12,
              background: "#d63384",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={guardarReceta}
          >
            Guardar receta
          </button>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            width: "100%",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 800,
              borderCollapse:
                "collapse",
            }}
          >
            <thead
              style={{
                background:
                  "#d63384",
                color: "white",
              }}
            >
              <tr>
                <th style={thStyle}>
                  Receta
                </th>

                <th style={thStyle}>
                  Costo
                </th>

                <th style={thStyle}>
                  Precio Final
                </th>

                <th style={thStyle}>
                  Horas
                </th>

                <th style={thStyle}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {recetasFiltradas.map(
                (r) => (
                  <>
                    <tr
                      key={r.id}
                      style={{
                        borderBottom:
                          "1px solid #eee",
                      }}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {r.nombre}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        $
                        {Number(
                          r.costo
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        $
                        {Number(
                          r.precio_final
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          r.tiempo_horas
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 10,
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              setRecetaExpandida(
                                recetaExpandida ===
                                  r.id
                                  ? null
                                  : r.id
                              )
                            }
                            style={{
                              padding:
                                "8px 12px",
                              border:
                                "none",
                              borderRadius: 8,
                              background:
                                "#ff8fab",
                              color:
                                "white",
                              cursor:
                                "pointer",
                              minWidth: 90,
                            }}
                          >
                            Ver
                          </button>

                          <button
                            onClick={() =>
                              eliminarReceta(
                                r.id
                              )
                            }
                            style={{
                              padding:
                                "8px 12px",
                              border:
                                "none",
                              borderRadius: 8,
                              background:
                                "#dc3545",
                              color:
                                "white",
                              cursor:
                                "pointer",
                              minWidth: 90,
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {recetaExpandida ===
                      r.id && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            background:
                              "#fff7f0",
                            padding: 20,
                          }}
                        >
                          <h3>
                            Procedimiento
                          </h3>

                          <p>
                            {
                              r.procedimiento
                            }
                          </p>

                          <h3>
                            Ingredientes
                          </h3>

                          {r.ingredientes?.map(
                            (
                              i,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                style={{
                                  background:
                                    "white",
                                  padding: 12,
                                  borderRadius: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <strong>
                                  {
                                    i.nombre
                                  }
                                </strong>

                                <p>
                                  Cantidad:{" "}
                                  {
                                    i.cantidad
                                  }{" "}
                                  {
                                    i.unidad
                                  }
                                </p>

                                <p>
                                  Costo:
                                  $
                                  {Number(
                                    i.costo
                                  ).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            )
                          )}

                          <p>
                            <strong>
                              Valor
                              hora:
                            </strong>{" "}
                            $
                            {
                              r.valor_hora
                            }
                          </p>

                          <p>
                            <strong>
                              Costo
                              luz:
                            </strong>{" "}
                            $
                            {
                              r.costo_luz
                            }
                          </p>

                          <p>
                            <strong>
                              Margen:
                            </strong>{" "}
                            {r.margen}%
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 5,
  boxSizing: "border-box",
  fontSize: 15,
};

const thStyle = {
  padding: 15,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: 15,
  whiteSpace: "nowrap",
};