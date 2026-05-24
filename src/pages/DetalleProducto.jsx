import {
  useParams,
  Link,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

export default function DetalleProducto() {
  const { id } = useParams();

  const [producto, setProducto] =
    useState(null);

  useEffect(() => {
    obtenerProducto();
  }, []);

  const obtenerProducto = async () => {
    const { data } = await supabase
      .from("recetas")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setProducto(data);
    }
  };

  if (!producto) {
    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <Link to="/productos">
        ← Volver
      </Link>

      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 20,
          marginTop: 20,
          maxWidth: 700,
        }}
      >
        <h1>{producto.nombre}</h1>

        <hr />

        <h2>Ingredientes</h2>

        {producto.ingredientes.map(
          (i, index) => (
            <div
              key={index}
              style={{
                padding: 10,
                borderBottom:
                  "1px solid #eee",
              }}
            >
              {i.nombre} —{" "}
              {i.cantidad} {i.unidad}
            </div>
          )
        )}

        <hr />

        <p>
          <strong>Costo:</strong> $
          {Number(
            producto.costo
          ).toFixed(2)}
        </p>

        <p>
          <strong>
            Precio Final:
          </strong>{" "}
          $
          {Number(
            producto.precio_final
          ).toFixed(2)}
        </p>

        <p>
          <strong>Margen:</strong>{" "}
          {producto.margen}%
        </p>
      </div>
    </div>
  );
}