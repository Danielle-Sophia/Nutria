import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Login } from './components/Login';
import { Registro } from './components/Registro';
import { MenuPrincipalProfesional } from './components/MenuPrincipalProfesional';
import { MenuPrincipalPaciente } from './components/MenuPrincipalPaciente';
import { MisPacientes } from './components/MisPacientes';
import { Expediente } from './components/Expediente';
import { TablasEvolucion } from './components/TablasEvolucion';
import { Configuracion } from './components/Configuracion';
import { RegistrarAlimentos } from './components/RegistrarAlimentos';
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
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
          },
          // Success
          success: {
            duration: 3000,
            style: {
              background: '#d4edda',
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
              background: '#f8d7da',
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
              background: '#d1ecf1',
              color: '#0c5460',
              border: '1px solid #bee5eb',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Professional Routes */}
          <Route path="/menu-profesional" element={<MenuPrincipalProfesional />} />
          <Route path="/mis-pacientes" element={<MisPacientes />} />
          <Route path="/expediente/:id" element={<Expediente />} />
          <Route path="/expedientes" element={<MisPacientes />} />
          <Route path="/tablas-evolucion" element={<TablasEvolucion />} />
          <Route path="/configuracion" element={<Configuracion />} />
          
          {/* Patient Routes */}
          <Route path="/menu-paciente" element={<MenuPrincipalPaciente />} />
          <Route path="/alimentos" element={<RegistrarAlimentos />} />
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