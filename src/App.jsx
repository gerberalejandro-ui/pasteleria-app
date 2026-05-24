import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Insumos from "./pages/Insumos";
import Recetas from "./pages/Recetas";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#fff7f0" }}>
        {user && <Navbar user={user} />}

        <Routes>
          {/* LOGIN SIEMPRE ACCESIBLE */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Login />
            }
          />

          {/* RUTAS PROTEGIDAS */}
          <Route
            path="/"
            element={user ? <Insumos /> : <Navigate to="/login" />}
          />

          <Route
            path="/recetas"
            element={user ? <Recetas /> : <Navigate to="/login" />}
          />

          <Route
            path="/productos"
            element={user ? <Productos /> : <Navigate to="/login" />}
          />

          <Route
            path="/producto/:id"
            element={user ? <DetalleProducto /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}