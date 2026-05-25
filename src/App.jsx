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
import Admin from "./pages/Admin";

export default function App() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingPerfil, setCheckingPerfil] = useState(false);

  // 🔥 SOLO ESTA FUNCIÓN FUE MEJORADA
  const cargarPerfil = async (userId) => {
    setCheckingPerfil(true);

    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.log("Error cargando perfil:", error);
        setPerfil(null);
        return;
      }

      setPerfil(data || null);
    } catch (err) {
      console.log("Exception perfil:", err);
      setPerfil(null);
    } finally {
      setCheckingPerfil(false);
    }
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
    return <div style={{ padding: 30 }}>Cargando...</div>;
  }

  // 🔐 usuario logueado pero NO aprobado
  if (user && perfil?.aprobado === false) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Usuario pendiente de aprobación</h2>
        <p>
          Tu cuenta fue creada pero aún no fue habilitada por el administrador.
        </p>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  // ✅ ÚNICA FUENTE DE VERDAD
  const isAutorizado = user && perfil?.aprobado === true;

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#fff7f0" }}>
        {isAutorizado && <Navbar user={user} />}

        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={isAutorizado ? <Navigate to="/" /> : <Login />}
          />

          {/* PROTEGIDAS */}
          <Route
            path="/"
            element={isAutorizado ? <Insumos /> : <Navigate to="/login" />}
          />

          <Route
            path="/recetas"
            element={isAutorizado ? <Recetas /> : <Navigate to="/login" />}
          />

          <Route
            path="/productos"
            element={isAutorizado ? <Productos /> : <Navigate to="/login" />}
          />

          <Route
            path="/producto/:id"
            element={
              isAutorizado ? <DetalleProducto /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/dashboard"
            element={isAutorizado ? <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={isAutorizado ? <Admin /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}