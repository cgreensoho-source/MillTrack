import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MapPin, Users, LogOut, Menu, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [userData, setUserData] = useState({
        name: localStorage.getItem('username') || 'Admin',
        role: localStorage.getItem('role') || 'Administrator'
    });

    const location = useLocation();
    const navigate = useNavigate();

    // Kunci scroll saat sidebar atau modal logout terbuka
    useEffect(() => {
        if (isSidebarOpen || showLogoutConfirm) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSidebarOpen, showLogoutConfirm]);

    const triggerLogout = () => {
        setIsSidebarOpen(false); // Tutup sidebar mobile kalau lagi kebuka
        setShowLogoutConfirm(true);
    };

    const executeLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
        { path: '/samples', icon: <FileText size={22} />, label: 'Laporan Sampel' },
        { path: '/stations', icon: <MapPin size={22} />, label: 'Kelola Stasiun' },
        { path: '/users', icon: <Users size={22} />, label: 'Kelola Pengguna' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Overlay Sidebar Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                {/* Desktop Toggle Button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="absolute -right-3.5 top-8 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-sm hover:text-gray-900 hover:border-gray-300 transition-colors hidden lg:flex items-center justify-center z-50 hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <div className={`h-24 flex items-center border-b border-gray-200 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-8'}`}>
                    <img
                        src="/icon.png"
                        alt="MillTrack Logo"
                        className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} object-contain shrink-0 transition-all duration-300`}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
                            <span className="font-black text-xl text-gray-900 tracking-tight leading-none truncate">MillTrack</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">Admin Panel</span>
                        </div>
                    )}
                </div>

                <div className={`flex-1 py-8 flex flex-col gap-2 overflow-y-auto overscroll-contain transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center rounded-xl transition-all font-bold text-sm overflow-hidden whitespace-nowrap ${
                                    isCollapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3.5'
                                } ${
                                    isActive
                                        ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100/50'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <div className={`${isActive ? 'text-green-600' : 'text-gray-400'} shrink-0`}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
                                {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-6 bg-green-600 rounded-full shrink-0"></div>}
                            </Link>
                        );
                    })}
                </div>

                <div className={`p-4 border-t border-gray-200 flex flex-col gap-3 shrink-0 transition-all duration-300 ${isCollapsed ? 'items-center px-2' : ''}`}>
                    <Link to="/profile" onClick={() => setIsSidebarOpen(false)} title={isCollapsed ? "Profil Pengguna" : ""} className={`bg-gray-50 rounded-xl border border-gray-100 flex items-center hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer group shadow-sm hover:shadow-md ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
                        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userData.name}&background=dcfce7&color=16a34a&bold=true`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in duration-300">
                                <span className="text-sm font-bold text-gray-800 truncate group-hover:text-gray-800 transition-colors">{userData.name}</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider truncate">{userData.role}</span>
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={triggerLogout}
                        title={isCollapsed ? "Keluar Sistem" : ""}
                        className={`flex items-center justify-center rounded-xl transition-colors font-bold text-sm text-red-500 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? 'p-3.5 w-max' : 'gap-3 px-4 py-3 w-full'}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">Keluar Sistem</span>}
                    </button>
                    
                    {!isCollapsed && (
                        <div className="text-center text-gray-400 mt-2 animate-in fade-in duration-300 overflow-hidden">
                            <p className="text-xs font-medium whitespace-nowrap">&copy; {new Date().getFullYear()} CGreen. All rights reserved.</p>
                        </div>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 lg:hidden shrink-0">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icon.png"
                            alt="MillTrack Logo"
                            className="w-14 h-14 object-contain shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="font-black text-lg text-gray-900">MillTrack</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* MODAL KONFIRMASI KELUAR */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner bg-red-50 text-red-500">
                            <LogOut size={36} className="ml-1" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Keluar Sistem?</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Anda harus masuk kembali untuk mengakses panel kontrol ini.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeLogout}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-200"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}