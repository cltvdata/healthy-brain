import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Chrome, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  CloudLightning
} from 'lucide-react';
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle 
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess 
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onAuthSuccess(email);
      onClose();
    } catch (err: any) {
      console.error("Authentication error:", err);
      // Friendly messages based on Firebase error codes
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de correo electrónico no válido.');
      } else {
        setError(err.message || 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user && user.email) {
        onAuthSuccess(user.email);
        onClose();
      }
    } catch (err: any) {
      console.error("Google Sign-in error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes o usa Correo/Contraseña.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Se canceló la autenticación con Google.');
      } else {
        setError('Google Sign-In bloqueado por restricciones del iframe. Utilice registro por Correo/Contraseña para una sincronización 100% garantizada.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0c10] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-fade-in">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1"
          id="close-auth-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-full bg-neuro-blue/10 border border-neuro-blue/20 flex items-center justify-center mx-auto text-neuro-blue shadow-lg shadow-neuro-blue/10">
            <CloudLightning className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            {isSignUp ? 'Crear Cuenta Healthy + Brain' : 'Sincronizar cuenta de Bio-ID'}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {isSignUp 
              ? 'Regístrate para persistir tus biométricos, tokens NTK y configuraciones en la nube de forma segura.'
              : 'Inicia sesión para restaurar tus datos de wearables, retos activos y saldo de tokens.'}
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="flex bg-black p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              !isSignUp ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isSignUp ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <div className="relative flex items-center bg-white/2 border border-white/5 rounded-2xl focus-within:border-neuro-blue/50 transition-all">
              <span className="pl-4 text-gray-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@dominio.com"
                className="w-full bg-transparent border-none focus:ring-0 py-3 px-3 text-xs text-white placeholder-gray-600 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative flex items-center bg-white/2 border border-white/5 rounded-2xl focus-within:border-neuro-blue/50 transition-all">
              <span className="pl-4 text-gray-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="****** (Mínimo 6 caracteres)"
                className="w-full bg-transparent border-none focus:ring-0 py-3 px-3 text-xs text-white placeholder-gray-600 outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neuro-blue text-dark font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-neuro-blue/15 hover:bg-neuro-blue/90"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isSignUp ? 'CREAR MI CUENTA' : 'INICIAR SESIÓN'}
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative px-3 bg-[#0b0c10] text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            O
          </span>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          <Chrome className="w-4 h-4 text-[#ea4335]" />
          <span>Ingresar con Google</span>
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-bio-orange/10 border border-bio-orange/20 text-bio-orange rounded-xl text-xs font-medium flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-bio-green" />
          <span>Encriptación AES-256 en base Firestore</span>
        </div>

      </div>
    </div>
  );
};
