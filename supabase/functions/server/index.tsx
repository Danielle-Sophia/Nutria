import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

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

// Helper functions
function hashPassword(password: string): string {
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

function generateFolio(tipo: string): string {
  const prefix = tipo === 'profesional' ? 'PRO' : 'PAC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

function generateAccessToken(): string {
  return crypto.randomUUID();
}

// Health check endpoint
app.get("/make-server-deaf8e85/health", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabase.from("kv_store_deaf8e85").select("key").limit(1);
    if (error) {
      console.error("Health check DB error:", JSON.stringify(error));
      return c.json({ status: "error", db: false, error: JSON.stringify(error) }, 500);
    }
    return c.json({ status: "ok", db: true });
  } catch (err: any) {
    console.error("Health check error:", err?.message, err?.stack);
    return c.json({ status: "error", db: false, error: err?.message || String(err) }, 500);
  }
});

// Initialize demo users endpoint (idempotent)
app.post("/make-server-deaf8e85/init-demo", async (c) => {
  try {
    // Create demo professional
    let demoPro: any = null;
    try {
      demoPro = await kv.get('user:doctor@nutria.com');
    } catch (kvErr: any) {
      console.error("kv.get failed for demo check:", kvErr?.message, kvErr?.code, kvErr?.details, kvErr?.hint, JSON.stringify(kvErr));
      throw kvErr;
    }
    if (!demoPro) {
      const professional = {
        id: crypto.randomUUID(),
        email: 'doctor@nutria.com',
        password: hashPassword('doctor123'),
        nombre: 'Dr. Carlos',
        apellidos: 'Hernández López',
        cedulaProfesional: '12345678',
        especialidad: 'Nutrición Clínica',
        telefono: '5512345678',
        tipo: 'profesional',
        folio: generateFolio('profesional'),
        createdAt: new Date().toISOString(),
      };
      await kv.set('user:doctor@nutria.com', professional);

      // Create demo patient for this professional
      const patient = {
        id: crypto.randomUUID(),
        email: 'paciente@nutria.com',
        password: hashPassword('paciente123'),
        nombre: 'María',
        apellidos: 'García Rodríguez',
        edad: 35,
        sexoBiologico: 'Femenino',
        telefono: '5587654321',
        peso: 65,
        talla: 160,
        tipo: 'paciente',
        folio: generateFolio('paciente'),
        profesionalId: professional.id,
        createdAt: new Date().toISOString(),
      };
      await kv.set('user:paciente@nutria.com', patient);

      // Link patient to professional
      await kv.set(`professional:${professional.id}:patients`, [patient.id]);
    }

    return c.json({ success: true, message: "Demo users initialized" });
  } catch (error: any) {
    const details = {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      cause: String(error?.cause),
      stack: error?.stack,
    };
    console.error("Init demo error:", JSON.stringify(details));
    return c.json({ success: false, error: error?.message || String(error), details }, 500);
  }
});

// Clean database endpoint - keep only demo users
app.post("/make-server-deaf8e85/clean-database", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all records
    const { data: allRecords, error } = await supabase
      .from("kv_store_deaf8e85")
      .select("key, value");

    if (error) {
      throw new Error(error.message);
    }

    const keysToDelete: string[] = [];
    let deletedCount = 0;

    // Process all records
    for (const record of allRecords || []) {
      const key = record.key;

      // Keep demo users
      if (key === 'user:doctor@nutria.com' || key === 'user:paciente@nutria.com') {
        continue;
      }

      // Mark all other records for deletion
      keysToDelete.push(key);
    }

    // Delete all marked keys
    if (keysToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("kv_store_deaf8e85")
        .delete()
        .in("key", keysToDelete);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      deletedCount = keysToDelete.length;
    }

    // Reinitialize demo users to ensure they exist and are linked
    const demoPro = await kv.get('user:doctor@nutria.com');
    const demoPatient = await kv.get('user:paciente@nutria.com');

    if (demoPro && demoPatient) {
      // Make sure patient is linked to professional
      demoPatient.profesionalId = demoPro.id;
      await kv.set('user:paciente@nutria.com', demoPatient);

      // Set professional's patient list
      await kv.set(`professional:${demoPro.id}:patients`, [demoPatient.id]);
    }

    return c.json({
      success: true,
      message: "Base de datos limpiada exitosamente",
      deletedCount,
      keptUsers: ['doctor@nutria.com', 'paciente@nutria.com']
    });
  } catch (error: any) {
    console.error("Clean database error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Register endpoint
app.post("/make-server-deaf8e85/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellidos, cedulaProfesional, especialidad, telefono } = body;

    if (!email || !password || !nombre || !apellidos || !cedulaProfesional || !especialidad) {
      return c.json({ success: false, error: "Faltan campos requeridos" }, 400);
    }

    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ success: false, error: "El correo electrónico ya está registrado" }, 400);
    }

    const folio = generateFolio('profesional');
    const hashedPassword = hashPassword(password);

    const user = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      nombre,
      apellidos,
      cedulaProfesional,
      especialidad,
      telefono: telefono || '',
      tipo: 'profesional',
      folio,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, user);

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      message: "Cuenta creada exitosamente"
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ success: false, error: error.message || "Error al crear la cuenta" }, 500);
  }
});

// Login endpoint
app.post("/make-server-deaf8e85/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ success: false, error: "Email y contraseña son requeridos" }, 400);
    }

    const user = await kv.get(`user:${email}`);

    if (!user) {
      return c.json({ success: false, error: "Credenciales inválidas" }, 401);
    }

    if (!verifyPassword(password, user.password)) {
      return c.json({ success: false, error: "Credenciales inválidas" }, 401);
    }

    const accessToken = generateAccessToken();
    await kv.set(`token:${accessToken}`, { userId: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      accessToken,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ success: false, error: error.message || "Error al iniciar sesión" }, 500);
  }
});

// Request password reset
app.post("/make-server-deaf8e85/auth/request-password-reset", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ success: false, error: "Email es requerido" }, 400);
    }

    const user = await kv.get(`user:${email}`);

    if (!user) {
      // Don't reveal if user exists or not for security
      return c.json({
        success: true,
        message: "Si el correo existe, recibirás un código de recuperación"
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await kv.set(`reset:${email}`, {
      code: resetCode,
      expiresAt,
      email
    });

    console.log(`Password reset code for ${email}: ${resetCode}`);

    return c.json({
      success: true,
      message: "Código de recuperación generado",
      resetCode, // In production, send via email instead
      expiresIn: "15 minutos"
    });
  } catch (error: any) {
    console.error("Request password reset error:", error);
    return c.json({ success: false, error: error.message || "Error al solicitar recuperación" }, 500);
  }
});

// Reset password with code
app.post("/make-server-deaf8e85/auth/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return c.json({ success: false, error: "Email, código y nueva contraseña son requeridos" }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ success: false, error: "La contraseña debe tener al menos 6 caracteres" }, 400);
    }

    const resetData = await kv.get(`reset:${email}`);

    if (!resetData) {
      return c.json({ success: false, error: "Código inválido o expirado" }, 400);
    }

    if (new Date() > new Date(resetData.expiresAt)) {
      await kv.del(`reset:${email}`);
      return c.json({ success: false, error: "El código ha expirado. Solicita uno nuevo" }, 400);
    }

    if (resetData.code !== code) {
      return c.json({ success: false, error: "Código incorrecto" }, 400);
    }

    const user = await kv.get(`user:${email}`);

    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    // Update password
    const hashedPassword = hashPassword(newPassword);
    user.password = hashedPassword;
    await kv.set(`user:${email}`, user);

    // Delete reset code
    await kv.del(`reset:${email}`);

    return c.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return c.json({ success: false, error: error.message || "Error al restablecer contraseña" }, 500);
  }
});

// Professional - Add Patient
app.post("/make-server-deaf8e85/professional/patients", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const professional = await kv.get(`user:${tokenData.email}`);
    if (!professional || professional.tipo !== 'profesional') {
      return c.json({ success: false, error: "No autorizado" }, 403);
    }

    const body = await c.req.json();
    const { email, password, nombre, apellidos, fechaNacimiento, edad, sexoBiologico, telefono, peso, talla, domicilio, estadoCivil, escolaridad, alergias } = body;

    if (!email || !password || !nombre || !apellidos || !sexoBiologico) {
      return c.json({ success: false, error: "Faltan campos requeridos" }, 400);
    }
    if (!fechaNacimiento && !edad) {
      return c.json({ success: false, error: "Se requiere fecha de nacimiento o edad" }, 400);
    }

    const edadFinal = edad ?? (() => {
      const hoy = new Date();
      const [y, m, d] = (fechaNacimiento as string).split('-').map(Number);
      let e = hoy.getFullYear() - y;
      const mo = hoy.getMonth() + 1;
      if (mo < m || (mo === m && hoy.getDate() < d)) e--;
      return Math.max(0, e);
    })();

    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ success: false, error: "El correo electrónico ya está registrado" }, 400);
    }

    const folio = generateFolio('paciente');
    const hashedPassword = hashPassword(password);

    const patient = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      nombre,
      apellidos,
      fechaNacimiento: fechaNacimiento || null,
      edad: edadFinal,
      sexoBiologico,
      telefono: telefono || '',
      peso: peso || null,
      talla: talla || null,
      domicilio: domicilio || '',
      estadoCivil: estadoCivil || '',
      escolaridad: escolaridad || '',
      alergias: alergias || '',
      tipo: 'paciente',
      folio,
      profesionalId: professional.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, patient);

    const patientsList = await kv.get(`professional:${professional.id}:patients`) || [];
    patientsList.push(patient.id);
    await kv.set(`professional:${professional.id}:patients`, patientsList);

    const { password: _, ...patientWithoutPassword } = patient;

    return c.json({
      success: true,
      patient: patientWithoutPassword,
      message: "Paciente creado exitosamente"
    });
  } catch (error: any) {
    console.error("Add patient error:", error);
    return c.json({ success: false, error: error.message || "Error al crear paciente" }, 500);
  }
});

// Professional - Get Patients
app.get("/make-server-deaf8e85/professional/patients", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const professional = await kv.get(`user:${tokenData.email}`);
    if (!professional || professional.tipo !== 'profesional') {
      return c.json({ success: false, error: "No autorizado" }, 403);
    }

    const allUsers = await kv.getByPrefix("user:");
    const patients = allUsers.filter((user: any) =>
      user.tipo === 'paciente' && user.profesionalId === professional.id
    );

    const patientsWithoutPasswords = patients.map((patient: any) => {
      const { password: _, ...patientWithoutPassword } = patient;
      return patientWithoutPassword;
    });

    return c.json({
      success: true,
      patients: patientsWithoutPasswords,
    });
  } catch (error: any) {
    console.error("Get patients error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener pacientes" }, 500);
  }
});

// Patient - Get by ID
app.get("/make-server-deaf8e85/patient/:id", async (c) => {
  try {
    const patientId = c.req.param('id');
    const allUsers = await kv.getByPrefix("user:");
    const patient = allUsers.find((user: any) => user.id === patientId);

    if (!patient) {
      return c.json({ success: false, error: "Paciente no encontrado" }, 404);
    }

    const { password: _, ...patientWithoutPassword } = patient;

    return c.json({
      success: true,
      patient: patientWithoutPassword,
    });
  } catch (error: any) {
    console.error("Get patient error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener paciente" }, 500);
  }
});

// Patient - Save Glucose Record
app.post("/make-server-deaf8e85/patient/glucose", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const user = await kv.get(`user:${tokenData.email}`);
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    const body = await c.req.json();
    const { glucoseValue, date, time, notes, patientId } = body;

    const targetPatientId = patientId || user.id;

    const record = {
      id: crypto.randomUUID(),
      patientId: targetPatientId,
      glucoseValue,
      date,
      time,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    const recordKey = `glucose:${targetPatientId}:${record.id}`;
    await kv.set(recordKey, record);

    return c.json({
      success: true,
      record,
      message: "Registro de glucosa guardado exitosamente"
    });
  } catch (error: any) {
    console.error("Save glucose error:", error);
    return c.json({ success: false, error: error.message || "Error al guardar registro" }, 500);
  }
});

// Patient - Get Glucose Records
app.get("/make-server-deaf8e85/patient/:id/glucose", async (c) => {
  try {
    const patientId = c.req.param('id');
    const records = await kv.getByPrefix(`glucose:${patientId}:`);

    const sortedRecords = records.sort((a: any, b: any) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return c.json({
      success: true,
      records: sortedRecords,
    });
  } catch (error: any) {
    console.error("Get glucose records error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener registros" }, 500);
  }
});

// User - Upload Profile Picture
app.post("/make-server-deaf8e85/user/profile-picture", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const user = await kv.get(`user:${tokenData.email}`);
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    const body = await c.req.json();
    const { imageBase64, fileName } = body;

    if (!imageBase64) {
      return c.json({ success: false, error: "No se proporcionó imagen" }, 400);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const bucketName = 'make-deaf8e85-profile-pictures';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Convert base64 to Uint8Array
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique file name
    const fileExtension = fileName?.split('.').pop() || 'jpg';
    const uniqueFileName = `${user.id}-${Date.now()}.${fileExtension}`;

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldFileName = user.profilePicture.split('/').pop();
      if (oldFileName) {
        await supabase.storage.from(bucketName).remove([oldFileName]);
      }
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ success: false, error: "Error al subir imagen" }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(uniqueFileName, 31536000); // 1 year in seconds

    if (!signedUrlData?.signedUrl) {
      return c.json({ success: false, error: "Error al generar URL de imagen" }, 500);
    }

    // Update user profile with picture URL
    user.profilePicture = signedUrlData.signedUrl;
    await kv.set(`user:${user.email}`, user);

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      profilePictureUrl: signedUrlData.signedUrl,
      message: "Foto de perfil actualizada exitosamente"
    });
  } catch (error: any) {
    console.error("Upload profile picture error:", error);
    return c.json({ success: false, error: error.message || "Error al subir foto de perfil" }, 500);
  }
});

// User - Update Profile
app.put("/make-server-deaf8e85/user/profile", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const user = await kv.get(`user:${tokenData.email}`);
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    const body = await c.req.json();
    const { nombre, apellidos, telefono, especialidad, direccion, fechaNacimiento } = body;

    // Update allowed fields
    if (nombre) user.nombre = nombre;
    if (apellidos) user.apellidos = apellidos;
    if (telefono !== undefined) user.telefono = telefono;
    if (especialidad && user.tipo === 'profesional') user.especialidad = especialidad;
    if (direccion !== undefined && user.tipo === 'paciente') user.direccion = direccion;
    if (fechaNacimiento !== undefined && user.tipo === 'paciente') user.fechaNacimiento = fechaNacimiento;

    await kv.set(`user:${user.email}`, user);

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      message: "Perfil actualizado exitosamente"
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return c.json({ success: false, error: error.message || "Error al actualizar perfil" }, 500);
  }
});

// User - Change Password
app.post("/make-server-deaf8e85/user/change-password", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const user = await kv.get(`user:${tokenData.email}`);
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json({ success: false, error: "Contraseña actual y nueva son requeridas" }, 400);
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return c.json({ success: false, error: "Contraseña actual incorrecta" }, 401);
    }

    // Validate new password
    if (newPassword.length < 8) {
      return c.json({ success: false, error: "La nueva contraseña debe tener al menos 8 caracteres" }, 400);
    }

    // Update password
    user.password = hashPassword(newPassword);
    await kv.set(`user:${user.email}`, user);

    return c.json({
      success: true,
      message: "Contraseña cambiada exitosamente"
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return c.json({ success: false, error: error.message || "Error al cambiar contraseña" }, 500);
  }
});

// ── Historia Clínica - Get ─────────────────────────────────────
app.get("/make-server-deaf8e85/patient/:id/historia-clinica", async (c) => {
  try {
    const patientId = c.req.param('id');
    const data = await kv.get(`hc:${patientId}`);
    return c.json({ success: true, data: data ?? null });
  } catch (error: any) {
    console.error("Get historia clinica error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener historia clínica" }, 500);
  }
});

// ── Historia Clínica - Save ────────────────────────────────────
app.post("/make-server-deaf8e85/patient/:id/historia-clinica", async (c) => {
  try {
    const patientId = c.req.param('id');
    const body = await c.req.json();
    await kv.set(`hc:${patientId}`, { ...body, savedAt: new Date().toISOString() });
    return c.json({ success: true, message: "Historia clínica guardada exitosamente" });
  } catch (error: any) {
    console.error("Save historia clinica error:", error);
    return c.json({ success: false, error: error.message || "Error al guardar historia clínica" }, 500);
  }
});

// ── Diagnóstico - Generate with Gemini ────────────────────────
// Resolve the best available Gemini flash model dynamically
async function resolveGeminiModel(apiKey: string): Promise<string> {
  const preferred = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`
    );
    if (!res.ok) return preferred[0];
    const data = await res.json();
    const available: string[] = (data.models ?? [])
      .filter((m: any) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
      .map((m: any) => (m.name as string).replace('models/', ''));
    for (const p of preferred) {
      if (available.includes(p)) return p;
    }
    const fallback = available.find(n => n.includes('flash')) ?? available[0];
    return fallback ?? preferred[0];
  } catch {
    return preferred[0];
  }
}

app.post("/make-server-deaf8e85/patient/:id/diagnostico/generar", async (c) => {
  try {
    const patientId = c.req.param('id');
    const { datosAnonimizados } = await c.req.json();

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) return c.json({ success: false, error: "API de Gemini no configurada" }, 500);

    const model = await resolveGeminiModel(geminiKey);
    console.log('Using Gemini model:', model);

    const prompt = `Eres un asistente clínico especializado en diagnóstico médico para profesionales de la salud. Analiza los siguientes datos clínicos del paciente y genera una lista de posibles diagnósticos o problemas de salud a considerar. Responde ÚNICAMENTE con un objeto JSON válido con la propiedad "diagnosticos" que contenga un array de strings. Cada string debe ser un diagnóstico o problema médico conciso en español. No incluyas planes de tratamiento. Prioriza los diagnósticos más relevantes según los datos.

Datos clínicos del paciente:
${datosAnonimizados}

Formato de respuesta requerido:
{"diagnosticos": ["Diagnóstico 1", "Diagnóstico 2", "Diagnóstico 3"]}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return c.json({ success: false, error: "Error al consultar Gemini" }, 500);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"diagnosticos":[]}';
    const parsed = JSON.parse(rawText);
    const diagnosticos: string[] = parsed.diagnosticos ?? [];

    const existing = await kv.get(`dx:${patientId}`) ?? {};
    await kv.set(`dx:${patientId}`, {
      ...existing,
      generados: diagnosticos,
      generadoAt: new Date().toISOString(),
    });

    return c.json({ success: true, diagnosticos });
  } catch (error: any) {
    console.error("Generate diagnostico error:", error);
    return c.json({ success: false, error: error.message || "Error al generar diagnóstico" }, 500);
  }
});

// ── Diagnóstico - Get ──────────────────────────────────────────
app.get("/make-server-deaf8e85/patient/:id/diagnostico", async (c) => {
  try {
    const patientId = c.req.param('id');
    const data = await kv.get(`dx:${patientId}`);
    return c.json({ success: true, data: data ?? null });
  } catch (error: any) {
    console.error("Get diagnostico error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener diagnóstico" }, 500);
  }
});

// ── Diagnóstico - Save specialist selections ───────────────────
app.put("/make-server-deaf8e85/patient/:id/diagnostico", async (c) => {
  try {
    const patientId = c.req.param('id');
    const { seleccionados, notas } = await c.req.json();
    const existing = await kv.get(`dx:${patientId}`) ?? {};
    await kv.set(`dx:${patientId}`, {
      ...existing,
      seleccionados: seleccionados ?? [],
      notas: notas ?? '',
      savedAt: new Date().toISOString(),
    });
    return c.json({ success: true, message: "Diagnóstico guardado exitosamente" });
  } catch (error: any) {
    console.error("Save diagnostico error:", error);
    return c.json({ success: false, error: error.message || "Error al guardar diagnóstico" }, 500);
  }
});

// Food - Save Food Record
app.post("/make-server-deaf8e85/patient/food", async (c) => {
  try {
    const userToken = c.req.header('X-User-Token');
    if (!userToken) {
      return c.json({ success: false, error: "No autorizado" }, 401);
    }

    const tokenData = await kv.get(`token:${userToken}`);
    if (!tokenData) {
      return c.json({ success: false, error: "Token inválido" }, 401);
    }

    const user = await kv.get(`user:${tokenData.email}`);
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }

    const body = await c.req.json();
    const {
      foodName,
      foodGroup,
      quantity,
      unit,
      mealType,
      location,
      preparedBy,
      consumptionOrder,
      date,
      time,
      nutritionalInfo,
      patientId
    } = body;

    const targetPatientId = patientId || user.id;

    const record = {
      id: crypto.randomUUID(),
      patientId: targetPatientId,
      foodName,
      foodGroup,
      quantity,
      unit,
      mealType,
      location,
      preparedBy,
      consumptionOrder: consumptionOrder || '',
      date,
      time,
      nutritionalInfo: nutritionalInfo || {},
      createdAt: new Date().toISOString(),
    };

    const recordKey = `food:${targetPatientId}:${record.id}`;
    await kv.set(recordKey, record);

    return c.json({
      success: true,
      record,
      message: "Registro de alimentos guardado exitosamente"
    });
  } catch (error: any) {
    console.error("Save food error:", error);
    return c.json({ success: false, error: error.message || "Error al guardar registro" }, 500);
  }
});

// Food - Get Food Records
app.get("/make-server-deaf8e85/patient/:id/food", async (c) => {
  try {
    const patientId = c.req.param('id');
    const records = await kv.getByPrefix(`food:${patientId}:`);

    const sortedRecords = records.sort((a: any, b: any) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return c.json({
      success: true,
      records: sortedRecords,
    });
  } catch (error: any) {
    console.error("Get food records error:", error);
    return c.json({ success: false, error: error.message || "Error al obtener registros" }, 500);
  }
});

Deno.serve(app.fetch);