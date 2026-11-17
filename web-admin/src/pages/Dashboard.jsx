import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Clock, CheckCircle, Activity, FileText, ArrowRight, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSamples: 0,
        pendingSamples: 0,
        approvedSamples: 0,
        todaySamples: 0,
        totalStations: 0,
        totalUsers: 0
    });
    const [recentPending, setRecentPending] = useState([]);
    const [chartData, setChartData] = useState({
        lineLabels: [],
        lineData: [],
        doughnutData: [0, 0]
    });

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, title: '', message: '', confirmText: '', confirmStyle: '' });
    const [notifyDialog, setNotifyDialog] = useState({ isOpen: false, title: '', message: '', isError: false });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [samplesRes, stationsRes, usersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/samples`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/stations`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/admin/users`, { headers }).catch(() => ({ data: [] }))
            ]);

            const extractData = (res, key) => {
                if (res.data && Array.isArray(res.data[key])) return res.data[key];
                if (Array.isArray(res.data)) return res.data;
                if (Array.isArray(res.data?.data)) return res.data.data;
                return [];
            };

            const allSamples = extractData(samplesRes, 'samples');
            const allStations = extractData(stationsRes, 'stations');
            const allUsers = extractData(usersRes, 'users');

            const pending = allSamples.filter(s => !s.is_reviewed);
            const approved = allSamples.filter(s => s.is_reviewed);

            const todayStr = new Date().toISOString().split('T')[0];
            const todaySamples = allSamples.filter(s => s.created_at && s.created_at.startsWith(todayStr));

            setStats({
                totalSamples: allSamples.length,
                pendingSamples: pending.length,
                approvedSamples: approved.length,
                todaySamples: todaySamples.length,
                totalStations: allStations.length,
                totalUsers: allUsers.length
            });

            const sortedPending = [...pending].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
            setRecentPending(sortedPending);

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const lineDataPoints = last7Days.map(dateStr => {
                return allSamples.filter(s => s.created_at && s.created_at.startsWith(dateStr)).length;
            });

            const formattedLabels = last7Days.map(dateStr => {
                const d = new Date(dateStr);
                return `${d.getDate()}/${d.getMonth()+1}`;
            });

            setChartData({
                lineLabels: formattedLabels,
                lineData: lineDataPoints,
                doughnutData: [approved.length, pending.length]
            });

        } catch (err) {
            console.error(err);
            showNotify('Gagal Memuat', 'Terjadi kesalahan saat merangkum data dashboard.', true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const showNotify = (title, message, isError = false) => {
        setNotifyDialog({ isOpen: true, title, message, isError });
    };

    const confirmReview = (id) => {
        setConfirmDialog({
            isOpen: true, id,
            title: 'Setujui Laporan Secara Cepat',
            message: 'Apakah Anda yakin ingin menyetujui laporan sampel ini langsung dari Dashboard?',
            confirmText: 'Ya, Setujui',
            confirmStyle: 'bg-green-600 hover:bg-green-700 text-white'
        });
    };

    const executeConfirmAction = async () => {
        const id = confirmDialog.id;
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/admin/samples/${id}/review`, { is_reviewed: true }, { headers: { Authorization: `Bearer ${token}` } });
            showNotify('Berhasil', 'Laporan sampel telah disetujui (ACC).', false);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            showNotify('Gagal', 'Tindakan gagal dilakukan akibat kesalahan server.', true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
            x: { grid: { display: false } }
        },
        interaction: { intersect: false, mode: 'index' }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'inherit', weight: 'bold' } } }
        },
        cutout: '75%'
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-gray-400">
                <RefreshCw className="animate-spin mb-4 text-green-600" size={40} />
                <p className="font-bold text-lg text-gray-600">Menyusun Data Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 font-medium mt-1">Ringkasan aktivitas operasional Milltrack hari ini.</p>
                </div>
                <button onClick={fetchDashboardData} className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 hover:text-green-700 transition-colors shadow-sm flex items-center gap-2 font-bold text-sm">
                    <RefreshCw size={18} /> Segarkan
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Perlu Review</p>
                        <h3 className="text-4xl font-black text-gray-800">{stats.pendingSamples}</h3>
                    </div>
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Laporan Hari Ini</p>
                        <h3 className="text-4xl font-black text-gray-800">{stats.todaySamples}</h3>
                    </div>
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <Activity size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stasiun</p>
                        <h3 className="text-4xl font-black text-gray-800">{stats.totalStations}</h3>
                    </div>
                    <div className="bg-gray-100 text-gray-600 p-3 rounded-xl">
                        <MapPin size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pekerja</p>
                        <h3 className="text-4xl font-black text-gray-800">{stats.totalUsers}</h3>
                    </div>
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Activity className="text-green-600" size={20} /> Aktivitas 7 Hari Terakhir
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[250px] w-full">
                        <Line
                            options={lineChartOptions}
                            data={{
                                labels: chartData.lineLabels,
                                datasets: [{
                                    label: 'Jumlah Laporan',
                                    data: chartData.lineData,
                                    borderColor: '#16a34a',
                                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                    borderWidth: 3,
                                    pointBackgroundColor: '#ffffff',
                                    pointBorderColor: '#16a34a',
                                    pointBorderWidth: 2,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    fill: true,
                                    tension: 0.4
                                }]
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <LayoutDashboard className="text-green-600" size={20} /> Rasio Status
                        </h3>
                    </div>
                    <div className="flex-1 relative min-h-[250px] flex items-center justify-center">
                        <Doughnut
                            options={doughnutOptions}
                            data={{
                                labels: ['Telah di-ACC', 'Menunggu Review'],
                                datasets: [{
                                    data: chartData.doughnutData,
                                    backgroundColor: ['#16a34a', '#f97316'],
                                    borderWidth: 0,
                                    hoverOffset: 10
                                }]
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-black text-gray-800">{stats.totalSamples}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="text-orange-500" size={20} /> Membutuhkan Tindakan (Terbaru)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Laporan sampel yang belum disetujui.</p>
                    </div>
                    <Link to="/samples" className="text-sm font-bold text-green-600 hover:text-gray-800 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                        Lihat Semua <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <th className="p-4 font-bold text-xs uppercase tracking-wider pl-6">ID & Waktu</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider">Sampel & Stasiun</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider">Pelapor</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-right pr-6">Aksi Cepat</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {recentPending.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-gray-400 flex flex-col items-center">
                                    <CheckCircle size={32} className="text-green-300 mb-3" />
                                    <span className="font-bold text-gray-600 text-lg">Semua Selesai!</span>
                                    <span className="text-sm">Tidak ada laporan yang menunggu review.</span>
                                </td>
                            </tr>
                        ) : (
                            recentPending.map(sample => (
                                <tr key={sample.sample_id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="font-mono text-sm font-bold text-gray-600">{sample.sample_id}</div>
                                        <div className="text-xs text-gray-500 mt-1">{formatDate(sample.created_at)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{sample.sample_name || 'Tanpa Nama'}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">{typeof sample.station === 'object' ? sample.station?.station_name : (sample.station_name || '-')}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-700 text-sm">{typeof sample.user === 'object' ? sample.user?.username : (sample.user || '-')}</div>
                                    </td>
                                    <td className="p-4 pr-6 flex justify-end">
                                        <button onClick={() => confirmReview(sample.sample_id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm shadow-green-200">
                                            <CheckCircle size={14} /> ACC
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner bg-green-50 text-green-600">
                            <CheckCircle size={40} />
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