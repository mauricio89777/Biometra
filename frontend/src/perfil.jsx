import React from "react";
import { AdminPanel } from "./components/AdminPanel";
import {ClientePanel }  from "./components/ClientePanel";




export const Perfil = ({ user, onLogout, onNavigate}) => {
  if (!user) return null;

  const rol = (user.role || user.rol || '').toLowerCase();
  
  if (rol === 'administrador'){
    return <AdminPanel user={user} onLogout={onLogout} onNavigate={onNavigate}/>;
  }
  return <ClientePanel user={user} onLogout={onLogout} onNavigate={onNavigate} />;
};