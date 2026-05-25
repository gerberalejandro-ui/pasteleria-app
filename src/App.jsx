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
  const [init, setInit] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        const sessionUser = data?.session?.user || null;
        setUser(sessionUser);

        if (sessionUser) {
          const { data: perfilData } = await supabase
            .from("perfiles")
            .select("*")
            .eq("id", sessionUser.id)
            .maybeSingle();

          setPerfil(perfilData || null);
        }
      } catch (e) {
        console.log("INIT ERROR:", e);
        setPerfil(null);
        setUser(null);
      } finally {
        setInit(true);
      }
    };

    initApp();

    const { data: listener } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const sessionUser = session?.user || null;

        setUser(sessionUser);

        if (sessionUser) {
          const { data: perfilData } = await supabase
            .from("perfiles")
            .select("*")
            .eq("id", sessionUser.id)
            .maybeSingle();

          setPerfil(perfilData || null);
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

  if (!init) {
    return <div style={{ padding: 30 }}>Cargando...</div>;
  }

  // 🔐 usuario logueado pero NO aprobado
  if (user && perfil && perfil.aprobado === false) {
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

  // ✅ estado único de autorización
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