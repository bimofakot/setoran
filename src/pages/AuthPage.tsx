import React, { useState } from 'react';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react';

const AuthShell = ({ children, mode }: { children: React.ReactNode; mode: 'login' | 'signup' }) => (
  <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
    {/* Ambient background */}
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-600/4 blur-[80px]" />
    </div>

    <div className="relative w-full max-w-[420px] animate-fade-up">
      {/* Logo area */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
          bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500
          shadow-2xl shadow-violet-950/60 pulse-glow">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold text-gradient-brand tracking-tight">Keuanganku</h1>
        <p className="text-slate-500 text-sm mt-1.5">
          {mode === 'login' ? 'Masuk untuk melanjutkan' : 'Buat akun gratis sekarang'}
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#090e1a]/90 border border-white/08 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
        <div className="p-7">
          {children}
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs mt-5">
        Dengan {mode === 'login' ? 'masuk' : 'mendaftar'}, Anda menyetujui Kebijakan Privasi kami
      </p>
    </div>
  </div>
);

interface LoginProps { onSwitchToSignup: () => void; }

export const Login = ({ onSwitchToSignup }: LoginProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try { await login(identifier, password); }
    catch (err: any) { setError(err.message || 'Gagal login'); }
  };

  return (
    <AuthShell mode="login">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center">
          <LogIn size={15} className="text-violet-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Masuk</h2>
      </div>

      {error && (
        <div className="bg-red-500/8 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email atau Username"
          type="text"
          placeholder="email@gmail.com atau username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          icon={<AtSign size={15} />}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark pl-9 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
          Masuk Sekarang
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/06" /></div>
        <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#090e1a] text-slate-600">atau</span></div>
      </div>

      <Button type="button" variant="secondary" fullWidth onClick={onSwitchToSignup}>
        <UserPlus size={15} /> Buat Akun Baru
      </Button>
    </AuthShell>
  );
};

interface SignupProps { onSwitchToLogin: () => void; }

export const Signup = ({ onSwitchToLogin }: SignupProps) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Kata sandi tidak cocok'); return; }
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter'); return; }
    try { await signup(email, password, fullName, username); }
    catch (err: any) { setError(err.message || 'Gagal membuat akun'); }
  };

  return (
    <AuthShell mode="signup">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center">
          <UserPlus size={15} className="text-violet-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Buat Akun</h2>
      </div>

      {error && (
        <div className="bg-red-500/8 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input label="Nama Lengkap" type="text" placeholder="Nama lengkap Anda"
          value={fullName} onChange={(e) => setFullName(e.target.value)}
          icon={<User size={15} />} required />
        <Input label="Username" type="text" placeholder="huruf, angka, underscore"
          value={username} onChange={(e) => setUsername(e.target.value)}
          icon={<AtSign size={15} />} required />
        <Input label="Email" type="email" placeholder="email@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={15} />} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
            <input type={showPass ? 'text' : 'password'} placeholder="Minimal 6 karakter"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-dark pl-9 pr-10" required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <Input label="Konfirmasi Kata Sandi" type="password" placeholder="Ulangi kata sandi"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock size={15} />} required />
        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
          Buat Akun
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/06" /></div>
        <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#090e1a] text-slate-600">atau</span></div>
      </div>

      <Button type="button" variant="secondary" fullWidth onClick={onSwitchToLogin}>
        <LogIn size={15} /> Sudah Punya Akun?
      </Button>
    </AuthShell>
  );
};
