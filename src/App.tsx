import { BrowserRouter as Router, Routes, Route } from 'react-router';
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
  );
}