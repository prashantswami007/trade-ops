import {
  AlertCircle,
  Check,
  DollarSign,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";


const API_BASE = import.meta.env.VITE_API_BASE;

export default function TradeOpsApp() {
  const [stats, setStats] = useState({
    total_volume_settled: 0,
    total_commissions_earned: 0,
    failed_trade_count: 0,
  });
  const [trades, setTrades] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTrades();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard-stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/trades`);
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select an XML file" });
      return;
    }

    const formData = new FormData();
    formData.append("trades", file);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload-trades`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setFile(null);
        fetchStats();
        fetchTrades();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 font-sans text-slate-200">
      <div className="w-full">
        {/* Container expanded to full width with max constraint only for ultra-wide screens */}
        <div
          id="dashboard"
          className="w-full max-w-480 mx-auto px-3 sm:px-6 lg:px-8 py-4"
        >
          {/* Navbar */}
          <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 mb-6 rounded-xl sm:rounded-none -mx-3 sm:mx-0 w-full">
            <div className="w-full px-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* small text for mobile view */}
                    <h1 className="text-xs sm:text-base md:text-lg font-bold text-white tracking-wide leading-none truncate">
                      TradeOps Simulator
                    </h1>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5 truncate">
                      Back-Office Settlement
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                  <a
                    href="#dashboard"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#about"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="#contact"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Stats Cards - Optimized spacing for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6">
            <div
              className="bg-linear-to-br from-slate-800/80 to-slate-900/80
              backdrop-blur border border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                    Volume Settled
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
                    ${stats.total_volume_settled?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                </div>
              </div>
            </div>

            <div
              className="bg-linear-to-br from-slate-800/80 to-slate-900/80
              backdrop-blur border border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                    Commissions
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono">
                    ${stats.total_commissions_earned?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                </div>
              </div>
            </div>

            <div
              className="bg-linear-to-br from-slate-800/80 to-slate-900/80
              backdrop-blur border border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition duration-500"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
                    Failed Trades
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-400 font-mono">
                    {stats.failed_trade_count || 0}
                  </p>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section - Reduced padding and fixed button size */}
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/60 rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              Process Trade Settlement
            </h2>
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <label className="flex-1 cursor-pointer group">
                <div
                  className="border-2 border-dashed border-slate-600 group-hover:border-slate-500 rounded-xl
                  p-6 bg-slate-900/40 text-center transition-colors h-full flex flex-col justify-center items-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-white mb-2 transition-colors" />
                  <p className="text-slate-300 font-medium text-sm">
                    {file ? (
                      <span className="text-emerald-400">{file.name}</span>
                    ) : (
                      "Click to select XML file"
                    )}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full md:w-auto md:min-w-50 px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-500
                hover:from-emerald-500 hover:to-emerald-400
                disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed
                text-white rounded-xl font-semibold text-sm transition-all shadow-lg
                flex items-center justify-center gap-2 transform active:scale-95"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span>Process Settlement</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {message && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}
          </div>

          {/* Trades Table - Compact view */}
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/60">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-400" />
                Recent Transactions
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-900/50">
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3">ID</th>
                    <th className="px-4 sm:px-6 py-3">Client</th>
                    <th className="px-4 sm:px-6 py-3">Stock</th>
                    <th className="px-4 sm:px-6 py-3">Type</th>
                    <th className="px-4 sm:px-6 py-3 text-right">Value</th>
                    <th className="px-4 sm:px-6 py-3">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {trades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-700/30 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-3 text-sm text-slate-500 font-mono">
                        #{trade.id}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-slate-200 font-medium">
                        {trade.client_name}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-slate-300">
                        <span className="bg-slate-700/50 px-2 py-1 rounded text-xs font-mono">
                          {trade.stock_symbol}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            trade.type === "BUY"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-right text-white font-mono font-medium">
                        ${parseFloat(trade.total_value).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-slate-400">
                        {new Date(trade.settlement_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            trade.status === "SETTLED"
                              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/5 text-red-400 border-red-500/20"
                          }`}
                        >
                          {trade.status === "SETTLED" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trades.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                  <div className="bg-slate-800 rounded-full p-4">
                    <Upload className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-sm">
                    No trades processed yet. Upload XML to start.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div
              id="about"
              className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-xl"
            >
              <h2 className="text-lg font-bold text-white mb-2">
                About TradeOps
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                The system validates bulk equity trades, calculates settlement
                values and commissions providing operational visibility.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                  XML Ingestion
                </span>
                <span className="text-xs bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                  Auto Settlement
                </span>
                <span className="text-xs bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                  Audit Trail
                </span>
              </div>
            </div>

            <div
              id="contact"
              className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-xl"
            >
              <h2 className="text-lg font-bold text-white mb-4">Support</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Technical</p>
                    <p className="text-slate-500 text-xs">tech@tradeops.sim</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Operations</p>
                    <p className="text-slate-500 text-xs">ops@tradeops.sim</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 py-6 text-center text-xs text-slate-600 border-t border-slate-800/50">
            <p>© 2025 TradeOps Simulator • Educational Portfolio</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
