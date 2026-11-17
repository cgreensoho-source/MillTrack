import { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, RefreshCw, Trash2, X, Shield, User, Edit, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showFormModal, setShowFormModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirm_password: '',
        nip: '',
        phone: '',
        gender: 'L',
        role: 'operator'
    });

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, title: '', message: '', confirmText: '', confirmStyle: '' });
    const [notifyDialog, setNotifyDialog] = useState({ isOpen: false, title: '', message: '', isError: false });

    // Pengunci scroll layar belakang
    useEffect(() => {
        if (showFormModal || confirmDialog.isOpen || notifyDialog.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showFormModal, confirmDialog.isOpen, notifyDialog.isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let dataAman = [];
            if (response.data && Array.isArray(response.data.users)) {
                dataAman = response.data.users;
            } else if (Array.isArray(response.data)) {
                dataAman = response.data;
            } else if (Array.isArray(response.data?.data)) {
                dataAman = response.data.data;
            }

            setUsers(dataAman);
        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat', 'Tidak dapat mengambil data pengguna. Pastikan Anda memiliki akses Admin.', true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showNotify = (title, message, isError = false) => {
        setNotifyDialog({ isOpen: true, title, message, isError });
    };

    const openAddForm = () => {
        setFormData({
            username: '', password: '', confirm_password: '',
            nip: '', phone: '', gender: 'L', role: 'operator'
        });
        setEditingId(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowFormModal(true);
    };

    const openEditForm = (user) => {
        const userRole = (user.roles && user.roles.length > 0) ? user.roles[0].role_name : (user.role || 'operator');

        setFormData({
            username: user.username || user.name || '',
            nip: user.nip || '',
            phone: user.phone || '',
            gender: user.gender || 'L',
            role: userRole.toLowerCase(),
            password: '',
            confirm_password: ''
        });
        setEditingId(user.user_id || user.id);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!editingId || formData.password) {
            if (formData.password !== formData.confirm_password) {
                showNotify('Validasi Gagal', 'Password dan Konfirmasi Password tidak cocok!', true);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            const payload = {
                username: formData.username,
                nip: formData.nip,
                phone: formData.phone,
                gender: formData.gender,
                roles: [formData.role]
            };

            if (!editingId) {
                const safeName = formData.username.replace(/[^a-z0-9]/gi, '').toLowerCase();
                payload.email = `${safeName}_${Date.now()}@milltrack.local`;
            }

            if (formData.password) {
                payload.password = formData.password;
                payload.confirm_password = formData.confirm_password;
            }

            if (editingId) {
                await axios.put(`${API_BASE_URL}/admin/users/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotify('Berhasil', 'Data pengguna berhasil diupdate!', false);
            } else {
                await axios.post(`${API_BASE_URL}/auth/register`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotify('Berhasil', 'Pengguna baru berhasil didaftarkan!', false);
            }

            closeFormModal();
            fetchUsers();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan data pengguna';
            showNotify('Gagal Menyimpan', msg, true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (user) => {
        setConfirmDialog({
            isOpen: true,
            id: user.user_id || user.id,
            title: 'Hapus Pengguna?',
            message: `Tindakan ini akan menghapus akun "${user.username || user.name}" secara permanen. Anda yakin ingin melanjutkan?`,
            confirmText: 'Ya, Hapus Permanen',
            confirmStyle: 'bg-red-600 hover:bg-red-700 text-white'
        });
    };

    const executeDelete = async () => {
        const id = confirmDialog.id;
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify('Berhasil Dihapus', 'Data pengguna telah dihapus secara permanen.', false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menghapus pengguna dari sistem.';
            showNotify('Penghapusan Gagal', msg, true);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 relative min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-3 rounded-xl text-gray-700">
                        <UsersIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h2>
                        <p className="text-gray-500 text-sm mt-1">Daftar akun pekerja lapangan dan admin sistem.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={fetchUsers} className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition-colors" title="Segarkan Data">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={openAddForm} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md shadow-green-200 w-full md:w-auto justify-center">
                        <UserPlus size={20} /> Tambah User
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-green-50/80 text-gray-800 border-b border-green-100">
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">ID</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Info Pengguna</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Role / Hak Akses</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan="4" className="p-12 text-center text-gray-400">Memuat data pengguna...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="4" className="p-12 text-center text-gray-500">Belum ada data pengguna.</td></tr>
                    ) : (
                        users.map((user, index) => {
                            const roleName = (user.roles && user.roles.length > 0) ? user.roles[0].role_name : (user.role || 'OPERATOR');
                            const isAdmin = roleName.toLowerCase().includes('admin');

                            return (
                                <tr key={user.user_id || user.id || index} className="hover:bg-green-50/40 transition-colors">
                                    <td className="p-4 font-mono text-sm font-bold text-gray-600">{user.user_id || user.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{user.username || user.name || '-'}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">NIP: {user.nip || '-'} • No HP: {user.phone || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-max ${isAdmin ? 'bg-green-100 text-gray-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {isAdmin ? <Shield size={14} /> : <User size={14} />}
                                            {roleName}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditForm(user)} className="text-amber-500 hover:bg-amber-50 p-2 rounded-xl transition-colors border border-amber-100/50" title="Edit Pengguna">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => confirmDelete(user)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors border border-red-100/50" title="Hapus Pengguna">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {showFormModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-black text-gray-800">
                                {editingId ? 'Edit Data Pengguna' : 'Registrasi User Baru'}
                            </h3>
                            <button onClick={closeFormModal} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                                    <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">NIP (Nomor Induk Pegawai)</label>
                                    <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none font-mono transition-all" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nomor HP</label>
                                    <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none font-mono transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Jenis Kelamin</label>
                                    <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Role / Jabatan</label>
                                    <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                        <option value="operator">Operator (Lapangan)</option>
                                        <option value="admin">Admin (Dashboard)</option>
                                    </select>
                                </div>

                                <div className="hidden md:block"></div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Password {editingId && <span className="text-gray-400 font-medium text-xs ml-1">(Kosongkan jika tidak diganti)</span>}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingId}
                                            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 p-1 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Konfirmasi Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required={!editingId && formData.password.length > 0}
                                            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all"
                                            value={formData.confirm_password}
                                            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 p-1 transition-colors">
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={closeFormModal} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-green-200">
                                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner bg-red-50 text-red-500">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">{confirmDialog.title}</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">{confirmDialog.message}</p>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                            <button onClick={executeDelete} className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors shadow-md ${confirmDialog.confirmStyle}`}>
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notifyDialog.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in duration-300">
                        <div className={`p-5 flex items-center gap-3 border-b ${notifyDialog.isError ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            {notifyDialog.isError ? <AlertTriangle className="text-red-500" size={28} /> : <Info className="text-green-600" size={28} />}
                            <h3 className={`text-lg font-black ${notifyDialog.isError ? 'text-red-800' : 'text-gray-800'}`}>{notifyDialog.title}</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-6 font-medium leading-relaxed">{notifyDialog.message}</p>
                            <button onClick={() => setNotifyDialog({ isOpen: false, title: '', message: '', isError: false })} className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-colors ${notifyDialog.isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}