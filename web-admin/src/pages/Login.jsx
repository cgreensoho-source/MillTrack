import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);

            const token = response.data.token || response.data.data?.token;
            const userData = response.data.user || response.data.data?.user || response.data.data;

            if (!token) {
                setErrorMsg('Sistem tidak memberikan token akses.');
                setIsLoading(false);
                return;
            }

            let roleName = '';
            if (userData?.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
                roleName = userData.roles[0].role_name || '';
            } else if (userData?.role) {
                roleName = userData.role;
            }

            if (!roleName.toLowerCase().includes('admin')) {
                setErrorMsg('Akses Ditolak! Portal ini khusus untuk Administrator.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('username', userData.username || userData.name || 'Admin');
            localStorage.setItem('role', roleName);
            navigate('/');
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Username atau password salah.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gray-100">
            {/* Bagian Kiri: Form Login */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-6">
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-10">
                        <img
                            src="/icon.png"
                            alt="Logo"
                            className="h-28 mx-auto object-contain mb-6"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div className="hidden justify-center items-center h-28 mb-6 text-green-700">
                            <ShieldCheck size={100} />
                        </div>

                        <h2 className="text-xl font-black text-gray-800 mb-1 tracking-widest uppercase">MillTrack</h2>
                        <p className="text-xs font-medium text-gray-600">Portal Akses Administrator</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                        {errorMsg && (
                            <div className="mb-6 bg-red-800 p-4 rounded-xl flex items-start gap-3 shadow-md">
                                <AlertTriangle className="text-white shrink-0" size={20} />
                                <p className="text-sm font-bold text-white leading-relaxed">{errorMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors">
                                        <User size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                                        placeholder="Nama Pengguna"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors">
                                        <Lock size={22} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                                        placeholder="Kata Sandi"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-all shadow-md shadow-green-200 flex justify-center items-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <RefreshCw size={24} className="animate-spin" /> : 'MASUK'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center">
                    <p className="text-gray-500 text-xs tracking-[1.5px] mb-2">from</p>
                    <img 
                        src="/cgreen.png" 
                        alt="CGreen" 
                        className="h-7 object-contain" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <p className="hidden text-red-700 font-bold text-xs mt-1">ASSET ERROR</p>
                </div>
            </div>

            {/* Bagian Kanan: Desain Hijau Mengalir (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 bg-green-700 relative items-center justify-center overflow-hidden">
                {/* Elemen Abstrak Mengalir (Flowing Blobs) */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Blob 1 */}
                    <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-green-500 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] mix-blend-screen opacity-30 blur-2xl animate-[spin_30s_linear_infinite]"></div>
                    
                    {/* Blob 2 */}
                    <div className="absolute bottom-[-20%] left-[-15%] w-[800px] h-[800px] bg-green-800 rounded-[60%_40%_30%_70%/50%_60%_40%_50%] mix-blend-multiply opacity-60 blur-2xl animate-[spin_40s_linear_infinite_reverse]"></div>
                    
                    {/* Blob 3 */}
                    <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] bg-green-400 rounded-[50%_50%_60%_40%/40%_40%_60%_60%] mix-blend-overlay opacity-40 blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
                    
                    {/* Garis Gelombang Tipis SVG (Subtle Wave Pattern) */}
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-20">
                        <path d="M0,50 C30,20 70,80 100,50 L100,100 L0,100 Z" fill="url(#grad1)" />
                        <path d="M0,70 C40,90 60,30 100,60 L100,100 L0,100 Z" fill="url(#grad2)" />
                        <defs>
                            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#14532d" stopOpacity="0.8" />
                            </linearGradient>
                            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#14532d" stopOpacity="0.9" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Cahaya putih tipis untuk kesan glassmorphism */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full mix-blend-overlay blur-[100px] opacity-10"></div>
                </div>
            </div>
        </div>
    );
}