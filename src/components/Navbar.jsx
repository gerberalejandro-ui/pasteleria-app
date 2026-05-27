import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Navbar({ user }) {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      style={{
        background: "#ffd6e0",
        padding: "15px 20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {/* LOGO / TITULO */}
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#d63384",
          }}
        >
          Pastelería App
        </div>

        {/* LINKS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link to="/" style={linkStyle}>
            Insumos
          </Link>

          <Link to="/recetas" style={linkStyle}>
            Recetas
          </Link>

          {/* 👑 ADMIN SOLO VISIBLE PARA VOS */}
          {user?.email === "gerber.alejandro@gmail.com" && (
            <Link to="/admin" style={linkStyle}>
              Admin
            </Link>
          )}
        </div>

        {/* USUARIO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "#6c757d",
              fontWeight: "bold",
              fontSize: 14,
              wordBreak: "break-word",
            }}
          >
            {user?.email}
          </div>

          <button
            onClick={logout}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              background: "#d63384",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  background: "white",
  color: "#d63384",
  padding: "10px 16px",
  borderRadius: 10,
  fontWeight: "bold",
  fontSize: 15,
  transition: "0.2s",
};