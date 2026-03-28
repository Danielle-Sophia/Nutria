import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import imgRegistrar from "figma:asset/014a7d00a40d56526e789e2e4f9dde6b606274b4.png";
import { Header } from "./Header";
import { Tooltip } from "./Tooltip";

export function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    cedulaProfesional: "",
    especialidad: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
  });

  const [errors, setErrors] = useState({
    cedulaProfesional: "",
    nombre: "",
    apellidos: "",
    password: "",
    confirmPassword: "",
    api: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });

  const validateCedula = (cedula: string): boolean => {
    // Valida que la cédula profesional tenga entre 7 y 8 dígitos
    const cedulaRegex = /^\d{7,8}$/;
    return cedulaRegex.test(cedula);
  };

  const validateName = (name: string): boolean => {
    // Valida que solo contenga letras, espacios y acentos
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return nameRegex.test(name);
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password))
      score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) {
      setPasswordStrength({
        score,
        text: "Débil",
        color: "bg-red-500",
      });
    } else if (score <= 3) {
      setPasswordStrength({
        score,
        text: "Media",
        color: "bg-yellow-500",
      });
    } else {
      setPasswordStrength({
        score,
        text: "Fuerte",
        color: "bg-green-500",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear API error when user types
    setErrors((prev) => ({
      ...prev,
      api: "",
    }));

    // Validación en tiempo real para cédula profesional
    if (name === "cedulaProfesional") {
      if (value && !validateCedula(value)) {
        setErrors((prev) => ({
          ...prev,
          cedulaProfesional:
            "La cédula debe tener 7 u 8 dígitos numéricos",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          cedulaProfesional: "",
        }));
      }
    }

    // Validación para nombre
    if (name === "nombre") {
      if (value && !validateName(value)) {
        setErrors((prev) => ({
          ...prev,
          nombre: "El nombre solo puede contener letras",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          nombre: "",
        }));
      }
    }

    // Validación para apellidos
    if (name === "apellidos") {
      if (value && !validateName(value)) {
        setErrors((prev) => ({
          ...prev,
          apellidos:
            "Los apellidos solo pueden contener letras",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          apellidos: "",
        }));
      }
    }

    // Validación de fortaleza de contraseña
    if (name === "password") {
      if (value) {
        checkPasswordStrength(value);
      } else {
        setPasswordStrength({ score: 0, text: "", color: "" });
      }

      // Validar coincidencia con confirmación
      if (
        formData.confirmPassword &&
        value !== formData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Las contraseñas no coinciden",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }

    // Validación de confirmación de contraseña
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Las contraseñas no coinciden",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    let hasErrors = false;

    if (!validateName(formData.nombre)) {
      setErrors((prev) => ({
        ...prev,
        nombre: "El nombre solo puede contener letras",
      }));
      hasErrors = true;
    }

    if (!validateName(formData.apellidos)) {
      setErrors((prev) => ({
        ...prev,
        apellidos: "Los apellidos solo pueden contener letras",
      }));
      hasErrors = true;
    }

    if (!validateCedula(formData.cedulaProfesional)) {
      setErrors((prev) => ({
        ...prev,
        cedulaProfesional:
          "La cédula debe tener 7 u 8 dígitos numéricos",
      }));
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      hasErrors = true;
    }

    if (formData.password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password:
          "La contraseña debe tener al menos 8 caracteres",
      }));
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsLoading(true);

    try {
      console.log("Registration attempt:", formData.email);
      
      const result = await authAPI.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        cedulaProfesional: formData.cedulaProfesional,
        especialidad: formData.especialidad,
        telefono: formData.telefono,
      });

      if (result.success) {
        toast.success(`¡Cuenta creada exitosamente!\n\nBienvenido/a, ${formData.nombre} ${formData.apellidos}\nTu folio es: ${result.user.folio}\n\nPor favor inicia sesión.`);
        navigate("/");
      } else {
        setErrors((prev) => ({
          ...prev,
          api: result.error || 'Error al crear la cuenta',
        }));
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors((prev) => ({
        ...prev,
        api: error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.',
      }));
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center pt-16 pb-10">
      {/* Background Image */}
      <img
        alt=""
        className="fixed inset-0 max-w-none object-cover pointer-events-none w-full h-full"
        src={imgRegistrar}
      />

      {/* Header */}
      <Header />

      {/* Registration Form Container */}
      <div className="relative w-[640px] h-[940px] z-10 my-6">
        <div className="absolute bg-[rgba(255,255,255,0.85)] inset-0 rounded-[20px]" />

        {/* Form Content */}
        <div className="relative w-full h-full">
          {/* Title */}
          <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-1/2 -translate-x-1/2 not-italic text-[48px] text-black text-nowrap top-[37px]">
            Crea tu cuenta
          </p>

          {/* Warning Message */}
          <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[calc(50%-240px)] not-italic text-[18px] text-black top-[124px] w-[480px] text-left">
            Recuerda que debes ser un profesional de la salud
            para crear una cuenta
          </p>

          {/* Login Link */}
          <div className="absolute left-[74px] top-[193px]">
            <span className="font-['Poppins:Regular',sans-serif] text-[18px] text-black">
              ¿Ya tienes una cuenta?{" "}
            </span>
            <Link
              to="/"
              className="[text-underline-position:from-font] decoration-solid font-['Poppins:Bold',sans-serif] text-[#458dff] text-[18px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Inicia sesión
            </Link>
          </div>

          {/* API Error Message */}
          {errors.api && (
            <div className="absolute left-[74px] top-[220px] w-[492px] bg-red-50 border border-red-300 rounded-[10px] p-3">
              <p className="text-red-600 text-[14px] font-['Poppins:Regular',sans-serif]">
                {errors.api}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name and Last Name Fields */}
            <div className="absolute left-[75px] top-[240px] w-[492px]">
              <div className="inline-block w-[242px] align-top">
                <label
                  htmlFor="nombre"
                  className="block font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[10px]"
                >
                  Nombre (s)
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-[#e1e9f2] h-[40px] w-full rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="absolute left-[75px] top-[300px] text-red-500 text-[14px] font-['Poppins:Regular',sans-serif]">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div className="inline-block w-[227px] ml-[23px] align-top">
                <label
                  htmlFor="apellidos"
                  className="block font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[10px]"
                >
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-[#e1e9f2] h-[40px] w-full rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                  placeholder="Pérez García"
                />
                {errors.apellidos && (
                  <p className="absolute left-[300px] top-[300px] text-red-500 text-[14px] font-['Poppins:Regular',sans-serif]">
                    {errors.apellidos}
                  </p>
                )}
              </div>
            </div>

            {/* Professional License Field */}
            <div>
              <div className="absolute left-[75px] top-[325px] flex items-center">
                <label
                  htmlFor="cedulaProfesional"
                  className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
                >
                  Cédula profesional (CP)
                </label>
                <Tooltip text="La cédula profesional debe tener 7 u 8 dígitos numéricos. Es el número oficial emitido por la SEP que te acredita como profesional." />
              </div>
              <input
                id="cedulaProfesional"
                name="cedulaProfesional"
                type="text"
                value={formData.cedulaProfesional}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`absolute bg-[#e1e9f2] h-[40px] left-1/2 -translate-x-1/2 top-[361px] w-[492px] rounded-[10px] px-4 text-black outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                  errors.cedulaProfesional
                    ? "ring-2 ring-red-500"
                    : "focus:ring-[#458dff]"
                }`}
                placeholder="12345678"
              />
              {errors.cedulaProfesional && (
                <p className="absolute left-[75px] top-[405px] text-red-500 text-[14px] font-['Poppins:Regular',sans-serif]">
                  {errors.cedulaProfesional}
                </p>
              )}
            </div>

            {/* Specialty Field */}
            <div>
              <div className="absolute left-[75px] top-[425px] flex items-center">
                <label
                  htmlFor="especialidad"
                  className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
                >
                  Especialidad
                </label>
                <Tooltip text="Ingresa tu área de especialización médica o de salud, por ejemplo: Nutrición clínica, Medicina general, Endocrinología, etc." />
              </div>
              <input
                id="especialidad"
                name="especialidad"
                type="text"
                value={formData.especialidad}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="absolute bg-[#e1e9f2] h-[40px] left-1/2 -translate-x-1/2 top-[461px] w-[492px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="Nutrición clínica"
              />
            </div>

            {/* Email Field */}
            <div>
              <div className="absolute left-[75px] top-[509px] flex items-center">
                <label
                  htmlFor="email"
                  className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
                >
                  Correo electrónico
                </label>
                <Tooltip text="Utiliza un correo electrónico válido y profesional. Este será tu nombre de usuario para acceder a la plataforma." />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="absolute bg-[#e1e9f2] h-[40px] left-1/2 -translate-x-1/2 top-[545px] w-[492px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="absolute left-[75px] top-[593px] flex items-center">
                <label
                  htmlFor="password"
                  className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
                >
                  Contraseña
                </label>
                <Tooltip text="Crea una contraseña segura con al menos 8 caracteres. Se recomienda incluir letras mayúsculas, minúsculas, números y símbolos." />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="absolute bg-[#e1e9f2] h-[41px] left-1/2 -translate-x-1/2 top-[625px] w-[492px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
              {passwordStrength.text && !errors.password && (
                <div className="absolute left-[75px] top-[670px] flex items-center gap-2">
                  <div
                    className={`h-2 w-[100px] rounded-full ${passwordStrength.color}`}
                  />
                  <span
                    className={`text-[14px] font-['Poppins:Regular',sans-serif] ${
                      passwordStrength.score <= 2
                        ? "text-red-600"
                        : passwordStrength.score <= 3
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    Contraseña {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="absolute left-[75px] top-[670px] text-red-500 text-[14px] font-['Poppins:Regular',sans-serif]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="absolute left-[75px] top-[700px] flex items-center">
                <label
                  htmlFor="confirmPassword"
                  className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
                >
                  Confirmar contraseña
                </label>
                <Tooltip text="Repite la contraseña para confirmar que la has escrito correctamente." />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`absolute bg-[#e1e9f2] h-[41px] left-1/2 -translate-x-1/2 top-[732px] w-[492px] rounded-[10px] px-4 text-black outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                  errors.confirmPassword
                    ? "ring-2 ring-red-500"
                    : "focus:ring-[#458dff]"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="absolute left-[75px] top-[776px] text-red-500 text-[14px] font-['Poppins:Regular',sans-serif]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="absolute left-[174px] top-[810px] w-[292px] h-[60px] bg-[#39588a] rounded-[15px] hover:bg-[#2d4570] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins:Bold',sans-serif] text-[24px] text-white">
                {isLoading ? 'Creando...' : 'Crear cuenta'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}