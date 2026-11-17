import { useState, useEffect } from 'react';
import { User, Phone, Hash, Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        username: localStorage.getItem('username') || 'Admin',
        role: localStorage.getItem('role') || 'Administrator',
        nip: '-',
        phone: '-',
        gender: '-'
    });

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const currentUsername = localStorage.getItem('username');

                const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let usersList = [];
                if (response.data && Array.isArray(response.data.users)) {
                    usersList = response.data.users;
                } else if (Array.isArray(response.data)) {
                    usersList = response.data;
                } else if (Array.isArray(response.data?.data)) {
                    usersList = response.data.data;
                }

                const myData = usersList.find(u =>
                    (u.username && u.username.toLowerCase() === currentUsername?.toLowerCase()) ||
                    (u.name && u.name.toLowerCase() === currentUsername?.toLowerCase())
                );

                if (myData) {
                    let roleName = 'Administrator';
                    if (myData.roles && Array.isArray(myData.roles) && myData.roles.length > 0) {
                        roleName = myData.roles[0].role_name || myData.roles[0];
                    } else if (myData.role) {
                        roleName = myData.role;
                    }

                    setUser({
                        username: myData.username || myData.name || currentUsername,
                        role: roleName,
                        nip: myData.nip || '-',
                        phone: myData.phone || '-',
                        gender: myData.gender || '-'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProfile();
    }, []);

    const formatGender = (genderStr) => {
        if (!genderStr) return '-';
        const g = String(genderStr).toLowerCase();
        if (['l', 'm', 'male', 'laki-laki', 'laki'].includes(g)) return 'Laki-laki';
        if (['p', 'f', 'female', 'perempuan', 'wanita'].includes(g)) return 'Perempuan';
        return genderStr;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 max-w-3xl mx-auto relative min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all w-max -ml-3">
                <ArrowLeft size={18} /> Kembali
            </button>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-green-600">
                    <RefreshCw size={40} className="animate-spin mb-4" />
                    <p className="font-bold text-gray-500">Menyinkronkan data profil...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-10 mb-8 text-center sm:text-left">
                        <div className="w-32 h-32 rounded-full bg-green-100 border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex-shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${user.username}&background=dcfce7&color=16a34a&bold=true&size=128`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-2 sm:mt-6">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{user.username}</h2>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black bg-green-100 text-gray-800 uppercase tracking-widest mt-3 shadow-sm">
                                <Shield size={14} /> {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-green-100 transition-all group">
                            <div className="bg-gray-100 p-3.5 rounded-xl text-gray-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm"><Hash size={24} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">NIP (Induk Pegawai)</p>
                                <p className="font-black text-gray-800 text-lg">{user.nip}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all group">
                            <div className="bg-blue-100 p-3.5 rounded-xl text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm"><Phone size={24} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nomor HP</p>
                                <p className="font-black text-gray-800 text-lg">{user.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-purple-100 transition-all group md:col-span-2">
                            <div className="bg-purple-100 p-3.5 rounded-xl text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm"><User size={24} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jenis Kelamin</p>
                                <p className="font-black text-gray-800 text-lg">
                                    {formatGender(user.gender)}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}