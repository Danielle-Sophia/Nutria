import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase admin client (for server operations)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize Supabase client for token verification
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Helper function to verify JWT token and get user
async function verifyToken(userTokenHeader: string | null) {
  console.log('verifyToken called with X-User-Token:', userTokenHeader ? userTokenHeader.substring(0, 20) + '...' : 'null');
  
  if (!userTokenHeader) {
    console.log('verifyToken: No user token in X-User-Token header');
    return { error: 'No authorization token provided', user: null };
  }
  
  const token = userTokenHeader;
  console.log('verifyToken: Extracted token length:', token.length);
  
  try {
    // Create a client with the user's token to verify it
    const supabaseWithToken = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Get user from token
    const { data: { user }, error } = await supabaseWithToken.auth.getUser();
    
    if (error || !user) {
      console.log('verifyToken: Token verification failed:', error?.message || 'No user found', 'Error object:', error);
      return { error: 'Invalid or expired token', user: null };
    }
    
    console.log('verifyToken: Success! User ID:', user.id);
    return { error: null, user };
  } catch (err) {
    console.log('verifyToken: Exception during verification:', err);
    return { error: 'Token verification exception', user: null };
  }
}

// Helper function to generate unique folio
async function generateFolio(): Promise<string> {
  const counterKey = 'folio:counter';
  const currentCounter = await kv.get(counterKey);
  const nextNumber = currentCounter ? parseInt(currentCounter) + 1 : 1000;
  await kv.set(counterKey, nextNumber.toString());
  return `NUT${nextNumber.toString().padStart(6, '0')}`;
}

// Health check endpoint
app.get("/make-server-deaf8e85/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES
// ============================================

// Register new professional
app.post("/make-server-deaf8e85/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellidos, cedulaProfesional, especialidad, telefono } = body;

    console.log('Registration attempt for email:', email);

    // Validate required fields
    if (!email || !password || !nombre || !apellidos || !cedulaProfesional || !especialidad) {
      return c.json({ success: false, error: 'Todos los campos requeridos deben ser proporcionados' }, 400);
    }

    // Validate cedula format (7-8 digits)
    if (!/^\d{7,8}$/.test(cedulaProfesional)) {
      return c.json({ success: false, error: 'La cédula profesional debe tener 7 u 8 dígitos' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server hasn't been configured
      user_metadata: { 
        nombre,
        apellidos,
        tipo: 'profesional'
      }
    });

    if (error) {
      console.log('Supabase auth error during registration:', error.message);
      return c.json({ success: false, error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ success: false, error: 'Error al crear usuario' }, 500);
    }

    // Generate folio
    const folio = await generateFolio();

    // Store user data in KV store
    const userData = {
      id: data.user.id,
      email,
      nombre,
      apellidos,
      cedulaProfesional,
      especialidad,
      telefono: telefono || '',
      tipo: 'profesional',
      folio,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${data.user.id}`, JSON.stringify(userData));

    console.log('Professional registered successfully:', email, 'with folio:', folio);

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email,
        nombre,
        apellidos,
        especialidad,
        tipo: 'profesional',
        folio,
      },
      message: 'Cuenta creada exitosamente'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, error: 'Error al procesar el registro' }, 500);
  }
});

// Login (frontend will use Supabase client directly, this is for additional checks)
app.post("/make-server-deaf8e85/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return c.json({ success: false, error: 'Email y contraseña son requeridos' }, 400);
    }

    // Use regular client to sign in user
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.log('Login error:', error?.message || 'No user data');
      return c.json({ success: false, error: 'Credenciales inválidas' }, 401);
    }

    if (!data.session) {
      console.log('No session created during login');
      return c.json({ success: false, error: 'Error al crear sesión' }, 500);
    }

    // Get user data from KV store
    const userDataStr = await kv.get(`user:${data.user.id}`);
    
    if (!userDataStr) {
      console.log('User data not found in KV store for user:', data.user.id);
      return c.json({ success: false, error: 'Usuario no encontrado en la base de datos' }, 404);
    }

    const userData = JSON.parse(userDataStr);

    console.log('Login successful for:', email, 'type:', userData.tipo, 'token length:', data.session.access_token.length);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user: {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        tipo: userData.tipo,
        folio: userData.folio,
        especialidad: userData.especialidad || null,
        cedulaProfesional: userData.cedulaProfesional || null,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Error al procesar el inicio de sesión' }, 500);
  }
});

// Get current user info
app.get("/make-server-deaf8e85/auth/me", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    // Get user data from KV store
    const userDataStr = await kv.get(`user:${user.id}`);
    
    if (!userDataStr) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    const userData = JSON.parse(userDataStr);

    return c.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        tipo: userData.tipo,
        folio: userData.folio,
        especialidad: userData.especialidad || null,
        telefono: userData.telefono || null,
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ success: false, error: 'Error al obtener información del usuario' }, 500);
  }
});

// ============================================
// PROFESSIONAL ROUTES
// ============================================

// Get all patients for a professional
app.get("/make-server-deaf8e85/professional/patients", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    // Get professional's patients list
    const patientsListStr = await kv.get(`professional:${user.id}:patients`);
    const patientIds: string[] = patientsListStr ? JSON.parse(patientsListStr) : [];

    if (patientIds.length === 0) {
      return c.json({ success: true, patients: [] });
    }

    // Get all patients data
    const patientKeys = patientIds.map(id => `user:${id}`);
    const patientsData = await kv.mget(patientKeys);

    const patients = patientsData
      .filter(data => data !== null)
      .map(data => {
        const patient = JSON.parse(data);
        return {
          id: patient.id,
          nombre: patient.nombre,
          apellidos: patient.apellidos,
          edad: patient.edad || 0,
          sexoBiologico: patient.sexoBiologico || 'No especificado',
          correo: patient.email,
          telefono: patient.telefono || '',
          folio: patient.folio,
        };
      });

    return c.json({ success: true, patients });

  } catch (error) {
    console.error('Get patients error:', error);
    return c.json({ success: false, error: 'Error al obtener lista de pacientes' }, 500);
  }
});

// Add new patient
app.post("/make-server-deaf8e85/professional/patients", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    const body = await c.req.json();
    const { email, password, nombre, apellidos, edad, sexoBiologico, telefono, peso, talla } = body;

    console.log('Adding patient by professional:', user.id);

    // Validate required fields
    if (!email || !password || !nombre || !apellidos || !edad || !sexoBiologico) {
      return c.json({ success: false, error: 'Todos los campos requeridos deben ser proporcionados' }, 400);
    }

    // Create patient user with Supabase Auth
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        nombre,
        apellidos,
        tipo: 'paciente'
      }
    });

    if (authError) {
      console.log('Supabase auth error during patient creation:', authError.message);
      return c.json({ success: false, error: authError.message }, 400);
    }

    if (!data.user) {
      return c.json({ success: false, error: 'Error al crear paciente' }, 500);
    }

    // Generate folio
    const folio = await generateFolio();

    // Store patient data in KV store
    const patientData = {
      id: data.user.id,
      email,
      nombre,
      apellidos,
      edad: parseInt(edad),
      sexoBiologico,
      telefono: telefono || '',
      peso: peso ? parseFloat(peso) : null,
      talla: talla ? parseFloat(talla) : null,
      tipo: 'paciente',
      folio,
      professionalId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${data.user.id}`, JSON.stringify(patientData));

    // Add patient to professional's list
    const patientsListStr = await kv.get(`professional:${user.id}:patients`);
    const patientsList: string[] = patientsListStr ? JSON.parse(patientsListStr) : [];
    patientsList.push(data.user.id);
    await kv.set(`professional:${user.id}:patients`, JSON.stringify(patientsList));

    console.log('Patient created successfully:', email, 'with folio:', folio);

    return c.json({
      success: true,
      patient: {
        id: data.user.id,
        nombre,
        apellidos,
        edad: parseInt(edad),
        sexoBiologico,
        correo: email,
        telefono: telefono || '',
        folio,
      },
      message: 'Paciente agregado exitosamente'
    });

  } catch (error) {
    console.error('Add patient error:', error);
    return c.json({ success: false, error: 'Error al agregar paciente' }, 500);
  }
});

// ============================================
// USER ROUTES
// ============================================

// Update user profile
app.put("/make-server-deaf8e85/user/profile", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    const body = await c.req.json();
    const { nombre, apellidos, telefono, especialidad, direccion, fechaNacimiento } = body;

    // Get current user data
    const userDataStr = await kv.get(`user:${user.id}`);
    
    if (!userDataStr) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    const userData = JSON.parse(userDataStr);

    // Update fields
    if (nombre !== undefined) userData.nombre = nombre;
    if (apellidos !== undefined) userData.apellidos = apellidos;
    if (telefono !== undefined) userData.telefono = telefono;
    if (direccion !== undefined) userData.direccion = direccion;
    if (fechaNacimiento !== undefined) userData.fechaNacimiento = fechaNacimiento;
    if (especialidad !== undefined && userData.tipo === 'profesional') {
      userData.especialidad = especialidad;
    }

    userData.updatedAt = new Date().toISOString();

    // Save updated data
    await kv.set(`user:${user.id}`, JSON.stringify(userData));

    console.log('Profile updated for user:', user.id);

    return c.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        tipo: userData.tipo,
        folio: userData.folio,
        especialidad: userData.especialidad || null,
        telefono: userData.telefono || null,
        direccion: userData.direccion || null,
        fechaNacimiento: userData.fechaNacimiento || null,
      },
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ success: false, error: 'Error al actualizar perfil' }, 500);
  }
});

// ============================================
// PATIENT ROUTES
// ============================================

// Get patient details by ID
app.get("/make-server-deaf8e85/patient/:patientId", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    const patientId = c.req.param('patientId');

    // Get patient data from KV store
    const patientDataStr = await kv.get(`user:${patientId}`);
    
    if (!patientDataStr) {
      return c.json({ success: false, error: 'Paciente no encontrado' }, 404);
    }

    const patientData = JSON.parse(patientDataStr);

    // Verify access: professional owns patient OR user is viewing their own data
    if (patientData.tipo === 'paciente' && patientData.professionalId !== user.id && patientId !== user.id) {
      return c.json({ success: false, error: 'No tienes permiso para ver este paciente' }, 403);
    }

    return c.json({
      success: true,
      patient: {
        id: patientData.id,
        nombre: patientData.nombre,
        apellidos: patientData.apellidos,
        folio: patientData.folio,
        email: patientData.email,
        telefono: patientData.telefono || '',
        fechaNacimiento: patientData.fechaNacimiento || '',
        sexoBiologico: patientData.sexoBiologico || '',
        edad: patientData.edad || 0,
        direccion: patientData.direccion || '',
        peso: patientData.peso || null,
        talla: patientData.talla || null,
        tipo: patientData.tipo,
      }
    });

  } catch (error) {
    console.error('Get patient error:', error);
    return c.json({ success: false, error: 'Error al obtener información del paciente' }, 500);
  }
});

// Save glucose record
app.post("/make-server-deaf8e85/patient/glucose", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    const body = await c.req.json();
    const { glucoseValue, date, time, notes, patientId } = body;

    // Determine which patient ID to use
    const targetPatientId = patientId || user.id;

    // Validate required fields
    if (!glucoseValue || !date || !time) {
      return c.json({ success: false, error: 'Valor de glucosa, fecha y hora son requeridos' }, 400);
    }

    // Create glucose record
    const recordId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const glucoseRecord = {
      id: recordId,
      patientId: targetPatientId,
      glucoseValue: parseFloat(glucoseValue),
      date,
      time,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    // Save to KV store
    await kv.set(`glucose:${targetPatientId}:${recordId}`, JSON.stringify(glucoseRecord));

    console.log('Glucose record saved for patient:', targetPatientId);

    return c.json({
      success: true,
      record: glucoseRecord,
      message: 'Registro de glucosa guardado exitosamente'
    });

  } catch (error) {
    console.error('Save glucose error:', error);
    return c.json({ success: false, error: 'Error al guardar registro de glucosa' }, 500);
  }
});

// Get glucose records for a patient
app.get("/make-server-deaf8e85/patient/:patientId/glucose", async (c) => {
  try {
    const { error, user } = await verifyToken(c.req.header('X-User-Token'));
    
    if (error || !user) {
      return c.json({ success: false, error: error || 'No autorizado' }, 401);
    }

    const patientId = c.req.param('patientId');

    // Get all glucose records for this patient
    const glucoseRecordsStr = await kv.getByPrefix(`glucose:${patientId}:`);
    
    const records = glucoseRecordsStr
      .map(recordStr => JSON.parse(recordStr))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      success: true,
      records
    });

  } catch (error) {
    console.error('Get glucose records error:', error);
    return c.json({ success: false, error: 'Error al obtener registros de glucosa' }, 500);
  }
});

Deno.serve(app.fetch);