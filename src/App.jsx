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
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingPerfil, setCheckingPerfil] = useState(false);

  const cargarPerfil = async (userId) => {
    setCheckingPerfil(true);

    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setPerfil(null);
    } else {
      setPerfil(data);
    }

    setCheckingPerfil(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user || null;

      setUser(sessionUser);

      if (sessionUser) {
        await cargarPerfil(sessionUser.id);
      }

      setLoading(false);
    };

    init();

    const { data: listener } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const sessionUser = session?.user || null;

        setUser(sessionUser);

        if (sessionUser) {
          await cargarPerfil(sessionUser.id);
        } else {
          setPerfil(null);
        }
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  };

  if (loading || checkingPerfil) {
    return (
      <div style={{ padding: 30 }}>
        Cargando...
      </div>
    );
  }

  // ❌ LOGUEADO PERO NO APROBADO
  if (user && perfil && perfil.aprobado === false) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2>Usuario pendiente de aprobación</h2>
        <p>Tu cuenta fue creada pero aún no fue habilitada por el administrador.</p>

        <button onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#fff7f0" }}>
        {user && perfil?.aprobado && (
          <Navbar user={user} />
        )}

        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={
              user && perfil?.aprobado ? (
                <Navigate to="/" />
              ) : (
                <Login />
              )
            }
          />

          {/* PROTEGIDAS */}
          <Route
            path="/"
            element={
              user && perfil?.aprobado ? (
                <Insumos />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/recetas"
            element={
              user && perfil?.aprobado ? (
                <Recetas />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/productos"
            element={
              user && perfil?.aprobado ? (
                <Productos />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/producto/:id"
            element={
              user && perfil?.aprobado ? (
                <DetalleProducto />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              user && perfil?.aprobado ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}