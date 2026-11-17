import { useState, useEffect } from 'react';
import { LayoutDashboard, RefreshCw, FileText, FileDown, CheckCircle, Clock, Search, Calendar, X, Image as ImageIcon, MapPin, User, Fingerprint, Trash2, Edit, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ImageWithAuth = ({ imageId, onImageClick }) => {
    const [imgUrl, setImgUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/images/${imageId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(response.data);
                setImgUrl(url);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchImage();
    }, [imageId]);

    if (loading) return <div className="w-full h-40 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-400 border border-gray-200">Memuat foto...</div>;
    if (!imgUrl) return <div className="w-full h-40 bg-red-50 rounded-xl flex items-center justify-center text-xs text-red-400 border border-red-100">Gagal memuat</div>;

    return (
        <div onClick={() => onImageClick(imgUrl)} className="cursor-pointer block border border-gray-200 rounded-xl overflow-hidden hover:opacity-85 transition-opacity shadow-sm">
            <img src={imgUrl} alt="Sampel" className="w-full h-40 object-cover" />
        </div>
    );
};

export default function Samples() {
    const [samples, setSamples] = useState([]);
    const [stationOptions, setStationOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ sample_name: '', condition: '', station_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null, title: '', message: '', confirmText: '', confirmStyle: '' });
    const [notifyDialog, setNotifyDialog] = useState({ isOpen: false, title: '', message: '', isError: false });

    // Pengunci scroll layar belakang
    useEffect(() => {
        if (detailModalOpen || editModalOpen || confirmDialog.isOpen || notifyDialog.isOpen || enlargedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [detailModalOpen, editModalOpen, confirmDialog.isOpen, notifyDialog.isOpen, enlargedImage]);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/samples`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let dataAman = [];
            if (response.data && Array.isArray(response.data.samples)) {
                dataAman = response.data.samples;
            } else if (Array.isArray(response.data)) {
                dataAman = response.data;
            } else if (Array.isArray(response.data?.data)) {
                dataAman = response.data.data;
            }
            setSamples(dataAman);
        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat', 'Tidak dapat mengambil data dari server. Pastikan koneksi aman.', true);
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
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
            setStationOptions(dataAman);
        } catch (err) {
            console.error("Gagal memuat list stasiun untuk fitur edit", err);
        }
    };

    useEffect(() => {
        fetchSamples();
        fetchStations();
    }, []);

    const showNotify = (title, message, isError = false) => {
        setNotifyDialog({ isOpen: true, title, message, isError });
    };

    const handleExportPDF = async (id) => {
        showNotify('Memproses Dokumen', 'Sedang mengunduh file PDF, harap tunggu sebentar...', false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/samples/${id}/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Sampel_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setNotifyDialog({ isOpen: false, title: '', message: '', isError: false });
        } catch (err) {
            console.error(err);
            showNotify('Gagal Unduh', 'Dokumen PDF gagal diunduh atau fitur belum tersedia di server.', true);
        }
    };

    const confirmReview = (id) => {
        setConfirmDialog({
            isOpen: true, type: 'REVIEW', id,
            title: 'Setujui Laporan',
            message: 'Apakah Anda yakin ingin menyetujui laporan sampel ini? Status tidak dapat dikembalikan ke pending setelah disetujui.',
            confirmText: 'Ya, Setujui Laporan',
            confirmStyle: 'bg-green-600 hover:bg-green-700 text-white'
        });
    };

    const confirmDelete = (id) => {
        setConfirmDialog({
            isOpen: true, type: 'DELETE', id,
            title: 'Hapus Laporan',
            message: 'Tindakan ini akan menghapus laporan secara permanen dari database. Anda yakin ingin melanjutkan?',
            confirmText: 'Ya, Hapus Permanen',
            confirmStyle: 'bg-red-600 hover:bg-red-700 text-white'
        });
    };

    const executeConfirmAction = async () => {
        const { type, id } = confirmDialog;
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const token = localStorage.getItem('token');
            if (type === 'REVIEW') {
                await axios.put(`${API_BASE_URL}/admin/samples/${id}/review`, { is_reviewed: true }, { headers: { Authorization: `Bearer ${token}` } });
                showNotify('Berhasil', 'Laporan sampel telah disetujui (ACC).', false);
                // Update state langsung agar tidak perlu close modal
                setDetailData(prev => prev && prev.sample_id === id ? { ...prev, is_reviewed: true } : prev);
            } else if (type === 'DELETE') {
                await axios.delete(`${API_BASE_URL}/samples/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                showNotify('Berhasil', 'Data laporan sampel berhasil dihapus.', false);
                // Tutup modal jika yang dihapus adalah yang sedang dibuka
                if (detailData && detailData.sample_id === id) {
                    setDetailModalOpen(false);
                }
            }
            fetchSamples();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Tindakan gagal dilakukan akibat kesalahan server.';
            showNotify('Gagal', msg, true);
        }
    };

    const openEditForm = (sample) => {
        setEditData({
            sample_name: sample.sample_name || '',
            condition: sample.condition || '',
            station_id: sample.station_id || (sample.station ? sample.station.station_id : '') || ''
        });
        setEditingId(sample.sample_id);
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                sample_name: editData.sample_name,
                condition: editData.condition,
                station_id: editData.station_id ? parseInt(editData.station_id) : null
            };

            await axios.put(`${API_BASE_URL}/admin/samples/${editingId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify('Berhasil', 'Perubahan data laporan sampel telah disimpan.', false);
            setEditModalOpen(false);
            fetchSamples();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan perubahan.';
            showNotify('Gagal Menyimpan', msg, true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDetail = async (id) => {
        setDetailModalOpen(true);
        setLoadingDetail(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/samples/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDetailData(response.data.data || response.data);
        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat Detail', 'Detail laporan tidak dapat diakses saat ini.', true);
            setDetailModalOpen(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredSamples = samples.filter((sample) => {
        const matchesSearch = (sample.sample_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(sample.sample_id || '').includes(searchTerm);
        const matchesTab = activeTab === 'reviewed' ? sample.is_reviewed : !sample.is_reviewed;
        let matchesDate = true;
        if (filterDate) {
            if (sample.created_at) {
                const d = new Date(sample.created_at);
                const sampleDateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                matchesDate = sampleDateOnly === filterDate;
            } else {
                matchesDate = false;
            }
        }
        return matchesSearch && matchesTab && matchesDate;
    });

    const pendingCount = samples.filter(s => !s.is_reviewed).length;
    const reviewedCount = samples.filter(s => s.is_reviewed).length;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 relative min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-3 rounded-xl text-gray-700">
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Data Laporan Sampel</h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola dan tinjau hasil pengecekan sampel dari lapangan.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Cari ID atau Nama Sampel..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="relative">
                        <input type="date" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-600 transition-all outline-none" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>

                    <button onClick={fetchSamples} className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition-colors">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('pending')} className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'pending' ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
                    Menunggu Review
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{pendingCount}</span>
                    {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>}
                </button>
                <button onClick={() => setActiveTab('reviewed')} className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'reviewed' ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
                    Sudah Direview
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{reviewedCount}</span>
                    {activeTab === 'reviewed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>}
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-green-50/80 text-gray-800 border-b border-green-100">
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">ID & Waktu</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Informasi Sampel</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Catatan</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan="4" className="p-12 text-center text-gray-400">Memuat data sinkronisasi...</td></tr>
                    ) : filteredSamples.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <FileText size={32} className="text-gray-300 mb-3" />
                                <span className="font-medium text-gray-500">Tidak ada data ditemukan</span>
                            </td>
                        </tr>
                    ) : (
                        filteredSamples.map((sample) => (
                            <tr key={sample.sample_id} className="hover:bg-green-50/40 transition-colors">
                                <td className="p-4">
                                    <div className="font-mono text-sm font-bold text-gray-600">{sample.sample_id}</div>
                                    <div className="text-xs text-gray-500 mt-1">{formatDate(sample.created_at)}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{sample.sample_name || 'Tanpa Nama'}</div>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                        {typeof sample.station === 'object' ? sample.station?.station_name : (sample.station_name || '-')}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={typeof sample.condition === 'string' ? sample.condition : ''}>
                                    {typeof sample.condition === 'string' ? sample.condition : '-'}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        {!sample.is_reviewed && (
                                            <button onClick={() => confirmReview(sample.sample_id)} className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-green-200">
                                                <CheckCircle size={14} /> ACC
                                            </button>
                                        )}
                                        <button onClick={() => openEditForm(sample)} className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-lg transition-colors border border-amber-100" title="Edit Data">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => confirmDelete(sample.sample_id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-red-100" title="Hapus Permanen">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
                                        <button onClick={() => handleOpenDetail(sample.sample_id)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-blue-200">
                                            Detail
                                        </button>
                                        <button onClick={() => handleExportPDF(sample.sample_id)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-gray-200" title="Unduh PDF">
                                            <FileDown size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {detailModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 sm:p-6">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

                        {/* HEADER MODAL DETAIL (Di sini letak tombol ACC-nya) */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Detail Laporan Pemeriksaan</h3>
                                {detailData && <p className="text-sm text-gray-500 mt-1 font-mono">ID Referensi: {detailData.sample_id}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                {detailData && !detailData.is_reviewed && (
                                    <button onClick={() => confirmReview(detailData.sample_id)} className="hidden md:flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold transition-colors shadow-sm">
                                        <CheckCircle size={16} /> ACC Laporan Ini
                                    </button>
                                )}
                                <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1 rounded-b-3xl">
                            {loadingDetail ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <RefreshCw className="animate-spin mb-4 text-green-600" size={32} />
                                    <p className="font-medium">Mengambil data lengkap...</p>
                                </div>
                            ) : detailData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-50 pb-2">
                                                <FileText size={18} /> Informasi Utama
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Nama Sampel</p>
                                                <p className="font-bold text-gray-800 text-lg">{typeof detailData.sample_name === 'string' ? detailData.sample_name : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Waktu Pemeriksaan</p>
                                                <p className="font-medium text-gray-800">{formatDate(detailData.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Status Verifikasi</p>
                                                {detailData.is_reviewed ? (
                                                    <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-md text-xs font-black bg-green-100 text-green-700 uppercase tracking-wide">
                                                        <CheckCircle size={14} /> Selesai Direview
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black bg-orange-100 text-orange-700 uppercase tracking-wide">
                                                            <Clock size={14} /> Menunggu Review
                                                        </span>
                                                        <button onClick={() => confirmReview(detailData.sample_id)} className="md:hidden bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm">
                                                            <CheckCircle size={14} /> ACC Sekarang
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Catatan / Kondisi Fisik</p>
                                                <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-700 text-sm whitespace-pre-wrap leading-relaxed min-h-[4rem]">
                                                    {typeof detailData.condition === 'string' ? detailData.condition : 'Tidak ada catatan khusus yang dilampirkan.'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-50 pb-2">
                                                    <MapPin size={18} /> Data Lokasi Scan
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Nama Stasiun Target</p>
                                                    <p className="font-bold text-gray-800">
                                                        {detailData.station && typeof detailData.station === 'object'
                                                            ? (detailData.station.station_name || detailData.station.name || 'Tanpa Nama')
                                                            : (detailData.station_name || detailData.station || '-')}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Koordinat (Stasiun)</p>
                                                        <div className="font-mono text-xs bg-gray-50 text-gray-700 px-2 py-1.5 rounded-md inline-block mt-1 border border-gray-200">
                                                            {detailData.station?.coordinate || '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-green-600 uppercase">Koordinat (User Scan)</p>
                                                        <div className="font-mono text-xs bg-green-50 text-gray-800 px-2 py-1.5 rounded-md inline-block mt-1 border border-green-200 font-bold">
                                                            {detailData.user_coordinate || detailData.scan_coordinate || detailData.coordinate || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-50 pb-2">
                                                    <User size={18} /> Petugas Lapangan
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 border border-gray-200">
                                                        <Fingerprint size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Dilaporkan Oleh</p>
                                                        <p className="font-bold text-gray-800">
                                                            {detailData.user && typeof detailData.user === 'object'
                                                                ? (detailData.user.username || detailData.user.name || 'Sistem / Tidak Diketahui')
                                                                : (detailData.user || detailData.username || 'Sistem / Tidak Diketahui')}
                                                        </p>
                                                        {typeof detailData.user === 'object' && detailData.user?.nip && (
                                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">NIP: {detailData.user.nip}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {Array.isArray(detailData.images) && detailData.images.length > 0 && (
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-50 pb-3 mb-4">
                                                <ImageIcon size={18} /> Lampiran Visual ({detailData.images.length} Foto)
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {detailData.images.map((img, idx) => (
                                                    <ImageWithAuth key={idx} imageId={img?.image_id || img?.id} onImageClick={setEnlargedImage} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">Data laporan tidak ditemukan atau telah dihapus.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-black text-gray-800">Edit Laporan Sampel</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Sampel</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50" value={editData.sample_name} onChange={(e) => setEditData({...editData, sample_name: e.target.value})} placeholder="Contoh: Sampel A" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Stasiun</label>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50" value={editData.station_id} onChange={(e) => setEditData({...editData, station_id: e.target.value})} required>
                                    <option value="" disabled>Pilih Stasiun target...</option>
                                    {stationOptions.map(st => (
                                        <option key={st.station_id} value={st.station_id}>{st.station_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Catatan / Kondisi Fisik</label>
                                <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none min-h-[100px] bg-gray-50" value={editData.condition} onChange={(e) => setEditData({...editData, condition: e.target.value})} placeholder="Tuliskan catatan kondisi fisik..." />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${confirmDialog.type === 'DELETE' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {confirmDialog.type === 'DELETE' ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">{confirmDialog.title}</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">{confirmDialog.message}</p>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                            <button onClick={executeConfirmAction} className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors shadow-md ${confirmDialog.confirmStyle}`}>
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notifyDialog.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] p-4">
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

            {enlargedImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[80] p-4 sm:p-8 cursor-zoom-out" onClick={() => setEnlargedImage(null)}>
                    <button onClick={() => setEnlargedImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors z-[90]">
                        <X size={32} />
                    </button>
                    <img src={enlargedImage} alt="Diperbesar" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-200 cursor-default" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}