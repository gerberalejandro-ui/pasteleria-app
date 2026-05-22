import React, { useState, useEffect } from "react";

export default function App() {
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]);

  const [nuevoInsumo, setNuevoInsumo] = useState({
    nombre: "",
    unidad: "",
    precio: "",
  });

  const [nuevaReceta, setNuevaReceta] = useState({
    nombre: "",
    margen: 100,
    ingredientes: [],
  });

  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [cantidadIngrediente, setCantidadIngrediente] = useState("");

  useEffect(() => {
    const datosInsumos = localStorage.getItem("insumos");
    const datosRecetas = localStorage.getItem("recetas");

    if (datosInsumos) setInsumos(JSON.parse(datosInsumos));
    if (datosRecetas) setRecetas(JSON.parse(datosRecetas));
  }, []);

  useEffect(() => {
    localStorage.setItem("insumos", JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem("recetas", JSON.stringify(recetas));
  }, [recetas]);

  const agregarInsumo = () => {
    if (!nuevoInsumo.nombre || !nuevoInsumo.precio) return;

    const nuevo = {
      id: Date.now(),
      nombre: nuevoInsumo.nombre,
      unidad: nuevoInsumo.unidad,
      precio: parseFloat(nuevoInsumo.precio),
    };

    setInsumos([...insumos, nuevo]);

    setNuevoInsumo({
      nombre: "",
      unidad: "",
      precio: "",
    });
  };

  const agregarIngrediente = () => {
  if (!ingredienteSeleccionado || !cantidadIngrediente)
    return;

  const insumo = insumos.find(
    (i) => i.id === parseInt(ingredienteSeleccionado)
  );

  if (!insumo) return;

  let costo = 0;

  // Conversiones automáticas

  if (insumo.unidad === "kg") {
    costo =
      (insumo.precio / 1000) *
      parseFloat(cantidadIngrediente);
  } else if (insumo.unidad === "litro") {
    costo =
      (insumo.precio / 1000) *
      parseFloat(cantidadIngrediente);
  } else {
    costo =
      insumo.precio *
      parseFloat(cantidadIngrediente);
  }

  const ingrediente = {
    nombre: insumo.nombre,
    unidad: insumo.unidad,
    cantidad: parseFloat(cantidadIngrediente),
    costo,
  };

  setNuevaReceta({
    ...nuevaReceta,
    ingredientes: [
      ...nuevaReceta.ingredientes,
      ingrediente,
    ],
  });

  setIngredienteSeleccionado("");
  setCantidadIngrediente("");
};

const calcularCosto = (ingredientes) => {
  return ingredientes.reduce((acc, item) => {
    return acc + item.costo;
  }, 0);
};
  const guardarReceta = () => {
    if (
      !nuevaReceta.nombre ||
      nuevaReceta.ingredientes.length === 0
    )
      return;

    const costo = calcularCosto(nuevaReceta.ingredientes);

    const precioFinal =
      costo + (costo * nuevaReceta.margen) / 100;

    const receta = {
      id: Date.now(),
      nombre: nuevaReceta.nombre,
      ingredientes: nuevaReceta.ingredientes,
      margen: nuevaReceta.margen,
      costo,
      precioFinal,
    };

    setRecetas([...recetas, receta]);

    setNuevaReceta({
      nombre: "",
      margen: 100,
      ingredientes: [],
    });
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial",
        background: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <h1>Sistema de Costos para Pastelería</h1>

      <hr />

      <h2>Agregar Insumo</h2>

      <input
        placeholder="Nombre"
        value={nuevoInsumo.nombre}
        onChange={(e) =>
          setNuevoInsumo({
            ...nuevoInsumo,
            nombre: e.target.value,
          })
        }
      />

     <select
  value={nuevoInsumo.unidad}
  onChange={(e) =>
    setNuevoInsumo({
      ...nuevoInsumo,
      unidad: e.target.value,
    })
  }
>
  <option value="">Seleccionar unidad</option>
  <option value="kg">Kilogramos</option>
  <option value="g">Gramos</option>
  <option value="litro">Litros</option>
  <option value="ml">Mililitros</option>
  <option value="unidad">Unidad</option>
</select>

      <input
        type="number"
        placeholder="Precio"
        value={nuevoInsumo.precio}
        onChange={(e) =>
          setNuevoInsumo({
            ...nuevoInsumo,
            precio: e.target.value,
          })
        }
      />

      <button onClick={agregarInsumo}>
        Guardar Insumo
      </button>

      <hr />

      <h2>Crear Receta</h2>

      <input
        placeholder="Nombre del producto"
        value={nuevaReceta.nombre}
        onChange={(e) =>
          setNuevaReceta({
            ...nuevaReceta,
            nombre: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Margen %"
        value={nuevaReceta.margen}
        onChange={(e) =>
          setNuevaReceta({
            ...nuevaReceta,
            margen: parseFloat(e.target.value),
          })
        }
      />

      <div>
        <select
          value={ingredienteSeleccionado}
          onChange={(e) =>
            setIngredienteSeleccionado(e.target.value)
          }
        >
          <option value="">Seleccionar insumo</option>

          {insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidadIngrediente}
          onChange={(e) =>
            setCantidadIngrediente(e.target.value)
          }
        />

        <button onClick={agregarIngrediente}>
          Agregar Ingrediente
        </button>
      </div>

      <h3>Ingredientes</h3>

      {nuevaReceta.ingredientes.map((i, index) => (
        <div key={index}>
          {i.nombre} - {i.cantidad} {i.unidad}
        </div>
      ))}

      <p>
        Costo actual: $
        {calcularCosto(
          nuevaReceta.ingredientes
        ).toFixed(2)}
      </p>

      <button onClick={guardarReceta}>
        Guardar Receta
      </button>

      <hr />

      <h2>Productos Guardados</h2>

      {recetas.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            background: "white",
          }}
        >
          <h3>{r.nombre}</h3>

          {r.ingredientes.map((i, idx) => (
            <div key={idx}>
              {i.nombre} - {i.cantidad} {i.unidad}
            </div>
          ))}

          <p>
            <strong>Costo:</strong> $
            {r.costo.toFixed(2)}
          </p>

          <p>
            <strong>Precio Final:</strong> $
            {r.precioFinal.toFixed(2)}
          </p>

          <p>
            <strong>Ganancia:</strong> {r.margen}%
          </p>
        </div>
      ))}
    </div>
  );
}