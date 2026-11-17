import { useState, useEffect } from 'react';
import { MapPin, Plus, RefreshCw, QrCode, Trash2, X, AlertTriangle, Info, Map, Download } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Stations() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [activeStation, setActiveStation] = useState(null);
    const [qrImageUrl, setQrImageUrl] = useState(null);
    const [loadingQr, setLoadingQr] = useState(false);

    const [showFormModal, setShowFormModal] = useState(false);
    const [formData, setFormData] = useState({ station_name: '', coordinate: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, title: '', message: '', confirmText: '', confirmStyle: '' });
    const [notifyDialog, setNotifyDialog] = useState({ isOpen: false, title: '', message: '', isError: false });

    // Pengunci scroll layar belakang
    useEffect(() => {
        if (showModal || showFormModal || confirmDialog.isOpen || notifyDialog.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showModal, showFormModal, confirmDialog.isOpen, notifyDialog.isOpen]);

    const fetchStations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/stations`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let dataAman = [];
            if (response.data && Array.isArray(response.data.stations)) {
                dataAman = response.data.stations;
            } else if (Array.isArray(response.data)) {
                dataAman = response.data;
            } else if (Array.isArray(response.data?.data)) {
                dataAman = response.data.data;
            }

            setStations(dataAman);
        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat', 'Tidak dapat mengambil data stasiun dari server. Pastikan koneksi internet aman.', true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const showNotify = (title, message, isError = false) => {
        setNotifyDialog({ isOpen: true, title, message, isError });
    };

    const handleViewQR = async (station) => {
        setActiveStation(station);
        setShowModal(true);
        setLoadingQr(true);
        setQrImageUrl(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/stations/${station.station_id}/qr`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const imageUrl = URL.createObjectURL(response.data);
            setQrImageUrl(imageUrl);
        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat QR', 'Gambar QR Code gagal diambil dari server.', true);
            closeModal();
        } finally {
            setLoadingQr(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
        setQrImageUrl(null);
        setActiveStation(null);
    };

    const openAddForm = () => {
        setFormData({ station_name: '', coordinate: '' });
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setFormData({ station_name: '', coordinate: '' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/stations`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify('Berhasil', 'Stasiun baru berhasil ditambahkan ke dalam sistem.', false);
            closeFormModal();
            fetchStations();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan data stasiun.';
            showNotify('Penambahan Gagal', msg, true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (station) => {
        setConfirmDialog({
            isOpen: true,
            id: station.station_id,
            title: 'Hapus Stasiun?',
            message: `Tindakan ini akan menghapus stasiun "${station.station_name}" secara permanen dari database. Anda yakin ingin melanjutkan?`,
            confirmText: 'Ya, Hapus Permanen',
            confirmStyle: 'bg-red-600 hover:bg-red-700 text-white'
        });
    };

    const executeDelete = async () => {
        const id = confirmDialog.id;
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/admin/stations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify('Berhasil Dihapus', 'Stasiun telah dihapus dari sistem secara permanen.', false);
            fetchStations();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menghapus stasiun ini dari server.';
            showNotify('Penghapusan Gagal', msg, true);
        }
    };

    // Fungsi pembantu untuk membuat nama file yang rapi (menghapus spasi)
    const getSafeFilename = (name) => {
        if (!name) return 'Milltrack';
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 relative min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-3 rounded-xl text-gray-700">
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Kelola Stasiun
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Daftar lokasi target scan untuk pekerja lapangan.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchStations}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition-colors"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={openAddForm}
                        className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md shadow-green-200/50 w-full md:w-auto justify-center"
                    >
                        <Plus size={20} /> Tambah Stasiun
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <RefreshCw className="animate-spin mb-4 text-green-600" size={36} />
                    <p className="font-medium">Memuat data stasiun dari server...</p>
                </div>
            ) : stations.length === 0 ? (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <Map size={48} className="text-gray-300 mb-4" />
                    <span className="font-bold text-gray-600 text-lg mb-1">Belum Ada Stasiun</span>
                    <span className="text-sm">Klik tombol "Tambah Stasiun" untuk membuat titik lokasi baru.</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {stations.map((station) => (
                        <div key={station.station_id} className="bg-white border border-gray-200 hover:border-green-300 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-50 p-2.5 rounded-xl text-green-600 border border-green-100">
                                    <MapPin size={22} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                    ID: {station.station_id}
                                </span>
                            </div>

                            <div className="flex-1 mb-5">
                                <h3 className="font-black text-gray-800 text-lg mb-1 line-clamp-2">{station.station_name}</h3>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 break-all">
                                    {station.coordinate || 'Koordinat belum disetel'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleViewQR(station)}
                                    className="flex-1 text-green-700 bg-green-50 hover:bg-green-100 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold border border-green-100/50"
                                >
                                    <QrCode size={18} /> Lihat QR
                                </button>
                                <button
                                    onClick={() => confirmDelete(station)}
                                    className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors border border-red-100/50"
                                    title="Hapus Stasiun"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showFormModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-black text-gray-800">Tambah Stasiun Baru</h3>
                            <button onClick={closeFormModal} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Stasiun</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none transition-all"
                                    placeholder="Contoh: Stasiun Press / Loading Ramp"
                                    value={formData.station_name}
                                    onChange={(e) => setFormData({...formData, station_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Koordinat GPS Target (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white focus:outline-none font-mono text-sm transition-all"
                                    placeholder="-6.2088, 106.8456"
                                    value={formData.coordinate}
                                    onChange={(e) => setFormData({...formData, coordinate: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1.5 font-medium">Kosongkan jika stasiun ini tidak membutuhkan validasi jarak GPS.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-green-200"
                                >
                                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-in zoom-in duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-700 shadow-inner">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 leading-tight">{activeStation?.station_name}</h3>
                            <div className="flex justify-center gap-3 mt-2 text-sm">
                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-bold">ID: {activeStation?.station_id}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] mb-6 relative">
                            {loadingQr ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                    <RefreshCw className="animate-spin mb-3 text-green-500" size={36} />
                                    <span className="text-sm font-bold">Membuat QR Code...</span>
                                </div>
                            ) : qrImageUrl ? (
                                <>
                                    <img src={qrImageUrl} alt="QR Code Stasiun" className="w-48 h-48 object-contain rounded-xl mb-4 bg-white p-2 shadow-sm" />
                                    <a
                                        href={qrImageUrl}
                                        download={`QR_Stasiun_${getSafeFilename(activeStation?.station_name)}.png`}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                                    >
                                        <Download size={18} /> Unduh QR Code
                                    </a>
                                </>
                            ) : (
                                <span className="text-sm text-red-400 font-bold flex flex-col items-center gap-2 py-8">
                                    <AlertTriangle size={24} /> Gambar tidak tersedia
                                </span>
                            )}
                        </div>

                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 py-2 rounded-lg border border-gray-100">
                            Scan Melalui Aplikasi Milltrack
                        </p>
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