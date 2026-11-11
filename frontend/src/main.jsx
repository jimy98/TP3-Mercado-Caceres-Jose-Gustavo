import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { AuthProvider } from "./Auth";
import { AuthLayout } from "./AuthLayout";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Registro } from "./Registro";
import { Vehiculos } from "./Vehiculos";
import { VehiculoCrear } from "./VehiculoCrear";
import { VehiculoEditar } from "./VehiculoEditar";
import { VehiculoDetalles } from "./VehiculoDetalles";
import { Conductores } from "./Conductores";
import { ConductorCrear } from "./ConductorCrear";
import { ConductorEditar } from "./ConductorEditar";
import { ConductorDetalles } from "./ConductorDetalles";
import { Viajes } from "./Viajes";
import { ViajeCrear } from "./ViajeCrear";
import { ViajeEditar } from "./ViajeEditar";
import { ViajeDetalles } from "./ViajeDetalles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />

            <Route path="vehiculos" element={<AuthLayout />}>
              <Route index element={<Vehiculos />} />
              <Route path="crear" element={<VehiculoCrear />} />
              <Route path=":id" element={<VehiculoDetalles />} />
              <Route path=":id/editar" element={<VehiculoEditar />} />
            </Route>

            <Route path="conductores" element={<AuthLayout />}>
              <Route index element={<Conductores />} />
              <Route path="crear" element={<ConductorCrear />} />
              <Route path=":id" element={<ConductorDetalles />} />
              <Route path=":id/editar" element={<ConductorEditar />} />
            </Route>

            <Route path="viajes" element={<AuthLayout />}>
              <Route index element={<Viajes />} />
              <Route path="crear" element={<ViajeCrear />} />
              <Route path=":id" element={<ViajeDetalles />} />
              <Route path=":id/editar" element={<ViajeEditar />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

