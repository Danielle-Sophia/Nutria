import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Login } from './components/Login';
import { Registro } from './components/Registro';
import { RecuperarContrasena } from './components/RecuperarContrasena';
import { MenuPrincipalProfesional } from './components/MenuPrincipalProfesional';
import { MenuPrincipalPaciente } from './components/MenuPrincipalPaciente';
import { MisPacientes } from './components/MisPacientes';
import { Expediente } from './components/Expediente';
import { TablasEvolucion } from './components/TablasEvolucion';
import { Configuracion } from './components/Configuracion';
import { RegistroAlimentos } from './components/RegistroAlimentos';
import { RegistrarActividad } from './components/RegistrarActividad';
import { RegistrarGlucosa } from './components/RegistrarGlucosa';
import { RegistrarSintomas } from './components/RegistrarSintomas';
import { SincronizarSensor } from './components/SincronizarSensor';
import { AgendarCita } from './components/AgendarCita';
import { CalcularInsulina } from './components/CalcularInsulina';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '420px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          },
          // Success
          success: {
            duration: 3500,
            style: {
              background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
              color: '#155724',
              border: '1px solid #c3e6cb',
            },
            iconTheme: {
              primary: '#28a745',
              secondary: '#fff',
            },
          },
          // Error
          error: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #f8d7da 0%, #fde8e9 100%)',
              color: '#721c24',
              border: '1px solid #f5c6cb',
            },
            iconTheme: {
              primary: '#dc3545',
              secondary: '#fff',
            },
          },
          // Loading
          loading: {
            style: {
              background: 'linear-gradient(135deg, #d1ecf1 0%, #e0f3f7 100%)',
              color: '#0c5460',
              border: '1px solid #bee5eb',
            },
            iconTheme: {
              primary: '#17a2b8',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

          {/* Professional Routes */}
          <Route path="/menu-profesional" element={<MenuPrincipalProfesional />} />
          <Route path="/mis-pacientes" element={<MisPacientes />} />
          <Route path="/expediente/:id" element={<Expediente />} />
          <Route path="/expedientes" element={<MisPacientes />} />
          <Route path="/tablas-evolucion" element={<TablasEvolucion />} />
          <Route path="/configuracion" element={<Configuracion />} />
          
          {/* Patient Routes */}
          <Route path="/menu-paciente" element={<MenuPrincipalPaciente />} />
          <Route path="/alimentos" element={<RegistroAlimentos />} />
          <Route path="/actividad-fisica" element={<RegistrarActividad />} />
          <Route path="/glucosa" element={<RegistrarGlucosa />} />
          <Route path="/sintomas" element={<RegistrarSintomas />} />
          <Route path="/sincronizar-sensor" element={<SincronizarSensor />} />
          <Route path="/agendar-cita" element={<AgendarCita />} />
          <Route path="/calcular-insulina" element={<CalcularInsulina />} />
        </Routes>
      </Router>
    </>
  );
}