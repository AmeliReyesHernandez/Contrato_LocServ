import React, { useEffect, useState, ElementType, Fragment } from "react";
import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";
import { createUser, createContract } from "./contract";
import {
  HomeIcon,
  UserIcon,
  ClipboardIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  WalletIcon,
  CubeTransparentIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Transition, Dialog } from "@headlessui/react";

type NavKey = "dashboard" | "services" | "profile" | "history";

interface Transaction {
  id: string;
  type: 'register' | 'contract';
  serviceId?: string;
  serviceName?: string;
  amount?: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  txHash?: string;
  error?: string;
}

// A simple, reusable logo component
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <CubeTransparentIcon className="w-8 h-8 text-indigo-500" />
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-800 dark:text-white">LocServ</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Servicios Locales</span>
      </div>
    </div>
  );
}

export default function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [route, setRoute] = useState<NavKey>("dashboard");
  const [showTxModal, setShowTxModal] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [themeDark, setThemeDark] = useState<boolean>(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const pushLog = (t: string) =>
    setLogs((s) => [`[${new Date().toLocaleTimeString()}] ${t}`, ...s].slice(0, 100));

  const handleRegister = async () => {
    if (!publicKey) return;
    const txId = `REG-${Date.now()}`;
    try {
      pushLog("Registrando usuario...");
      const response = await createUser(publicKey, "Usuario", "Demo", "Test", "demo@example.com", 123);
      pushLog("Usuario registrado exitosamente!");

      // Add to transaction history
      setTransactions(prev => [{
        id: txId,
        type: 'register',
        timestamp: Date.now(),
        status: 'success',
        txHash: response?.hash || 'N/A'
      }, ...prev]);
    } catch (e: any) {
      console.error(e);
      pushLog(`Error al registrar: ${e.message}`);
      setTransactions(prev => [{
        id: txId,
        type: 'register',
        timestamp: Date.now(),
        status: 'failed',
        error: e.message
      }, ...prev]);
    }
  };

  const handleHire = async (serviceId: string, price: string) => {
    if (!publicKey) {
      pushLog("Por favor conecta tu wallet primero");
      return;
    }
    const contractId = `C-${Date.now()}`;
    const service = demoServices.find(s => s.id === serviceId);
    try {
      pushLog(`Contratando servicio ${serviceId}...`);
      const numericPrice = parseInt(price.replace(/[^0-9]/g, '')) || 100;

      const response = await createContract(
        contractId,
        serviceId,
        publicKey,
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 86400000).toISOString().split('T')[0],
        numericPrice
      );

      if (response && response.hash) {
        pushLog(`✅ Contrato creado: ${contractId}`);
        pushLog(`🔗 Hash: ${response.hash}`);
        pushLog(`📊 Estado: ${response.status}`);
        pushLog(`💰 Fee gastado: ~0.0001 XLM`);

        // Show success modal
        setCurrentTxHash(response.hash);
        setShowTxModal(true);

        // Add to transaction history
        setTransactions(prev => [{
          id: contractId,
          type: 'contract',
          serviceId,
          serviceName: service?.title || serviceId,
          amount: price,
          timestamp: Date.now(),
          status: 'success',
          txHash: response.hash
        }, ...prev]);
      } else {
        pushLog(`⚠️ Transacción enviada pero sin confirmación`);
      }
    } catch (e: any) {
      console.error(e);
      pushLog(`❌ Error al contratar: ${e.message}`);
      setTransactions(prev => [{
        id: contractId,
        type: 'contract',
        serviceId,
        serviceName: service?.title || serviceId,
        amount: price,
        timestamp: Date.now(),
        status: 'failed',
        error: e.message
      }, ...prev]);
    }
  };

  const connectFreighter = async () => {
    try {
      if (publicKey) {
        pushLog("Wallet ya conectada");
        return;
      }

      pushLog("Iniciando conexión con Freighter...");
      const connectedResponse = await isConnected();
      if (!connectedResponse.isConnected) {
        pushLog("Solicitando permiso de acceso...");
        await requestAccess();
      }

      const addressResponse = await getAddress();
      if (addressResponse.address) {
        pushLog(`Wallet conectada: ${addressResponse.address}`);
        setPublicKey(addressResponse.address);
      } else {
        pushLog("No se pudo obtener la clave pública.");
      }
    } catch (err: any) {
      console.error(err);
      pushLog(`Error al conectar con Freighter: ${err?.message || 'Desconocido'}`);
    }
  };

  useEffect(() => {
    // Auto-connect on mount if Freighter is available
    const autoConnect = async () => {
      try {
        const connectedResponse = await isConnected();
        if (connectedResponse.isConnected) {
          const addressResponse = await getAddress();
          if (addressResponse.address) {
            setPublicKey(addressResponse.address);
            pushLog(`Wallet auto-conectada: ${addressResponse.address}`);
          }
        }
      } catch (err) {
        // Freighter not installed or not available
      }
    };
    autoConnect();
  }, []);

  useEffect(() => {
    // Apply theme and save preference
    if (themeDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [themeDark]);

  const demoServices = [
    { id: "S1", title: "Electricista Profesional", desc: "Instalaciones y reparaciones eléctricas seguras.", price: "50 XLM" },
    { id: "S2", title: "Clases de Guitarra Acústica", desc: "Aprende desde cero. Todos los niveles.", price: "75 XLM" },
    { id: "S3", title: "Plomería de Emergencia", desc: "Solución a fugas, atascos y más, 24/7.", price: "100 XLM" },
    { id: "S4", title: "Diseño Gráfico y Branding", desc: "Logos, publicidad y material de marca.", price: "200 XLM" },
    { id: "S5", title: "Asesoría de Jardinería", desc: "Crea y mantén tu jardín ideal.", price: "40 XLM" },
    { id: "S6", title: "Reparación de Computadoras", desc: "Hardware y software, virus y lentitud.", price: "80 XLM" },
    { id: "S7", title: "Clases de Yoga", desc: "Sesiones personalizadas o grupales. Mejora tu bienestar.", price: "60 XLM" },
    { id: "S8", title: "Carpintería a Medida", desc: "Muebles personalizados y reparaciones de madera.", price: "150 XLM" },
    { id: "S9", title: "Fotografía Profesional", desc: "Eventos, retratos y productos. Calidad garantizada.", price: "300 XLM" },
    { id: "S10", title: "Limpieza de Hogar", desc: "Servicio completo de limpieza residencial.", price: "90 XLM" },
    { id: "S11", title: "Clases de Inglés", desc: "Aprende inglés con profesor certificado.", price: "70 XLM" },
    { id: "S12", title: "Asesoría Legal", desc: "Consultas legales en derecho civil y familiar.", price: "250 XLM" },
    { id: "S13", title: "Desarrollo Web", desc: "Sitios web modernos y responsivos.", price: "500 XLM" },
    { id: "S14", title: "Paseo de Mascotas", desc: "Cuido y paseo de perros. Servicio confiable.", price: "30 XLM" },
    { id: "S15", title: "Clases de Cocina", desc: "Aprende recetas mexicanas e internacionales.", price: "85 XLM" },
  ];

  function Header() {
    return (
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 md:hidden">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">{route}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setThemeDark((v) => !v)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {themeDark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-indigo-500" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectFreighter}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors"
          >
            <WalletIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : "Conectar Wallet"}
            </span>
          </motion.button>
        </div>
      </header>
    );
  }

  function Sidebar() {
    const NavItem = ({ navKey, icon: Icon, label }: { navKey: NavKey; icon: ElementType; label: string }) => (
      <li>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            setRoute(navKey);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${route === navKey
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
        >
          <Icon className="w-6 h-6" />
          <span>{label}</span>
        </motion.button>
      </li>
    );

    const sidebarContent = (
      <aside className="flex flex-col w-64 p-4 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="px-2 pt-2 pb-6">
          <Logo />
        </div>
        <nav>
          <ul className="flex flex-col gap-2">
            <NavItem navKey="dashboard" icon={HomeIcon} label="Dashboard" />
            <NavItem navKey="services" icon={ClipboardIcon} label="Servicios" />
            <NavItem navKey="history" icon={ClockIcon} label="Historial" />
            <NavItem navKey="profile" icon={UserIcon} label="Mi Perfil" />
          </ul>
        </nav>
        <div className="mt-auto p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">Logs del Sistema</h4>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 h-32 overflow-y-auto font-mono">
            {logs.length > 0 ? logs.map((log, i) => <p key={i}>{log}</p>) : <p>No hay actividad reciente.</p>}
          </div>
        </div>
      </aside>
    );

    return (
      <>
        {/* Mobile Sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <div className="fixed inset-0 flex z-40">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
                  {sidebarContent}
                </Dialog.Panel>
              </Transition.Child>
              <div className="flex-shrink-0 w-14" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }


  function PageContent() {
    return (
      <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {route === "dashboard" && <Dashboard />}
            {route === "services" && <ServicesPage />}
            {route === "history" && <HistoryPage />}
            {route === "profile" && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  function Dashboard() {
    const StatCard = ({ title, value, icon: Icon, delay = 0 }: { title: string, value: string | number, icon: ElementType, delay?: number }) => (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow flex items-center gap-4"
      >
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
          <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
      </motion.div>
    );

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Servicios Disponibles" value={demoServices.length} icon={ClipboardIcon} />
          <StatCard title="Wallet Status" value={publicKey ? "Conectado" : "No Conectado"} icon={WalletIcon} delay={0.1} />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Servicios Destacados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoServices.slice(0, 3).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">{s.title}</h4>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full">{s.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <motion.button
                    onClick={() => handleHire(s.id, s.price)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Solicitar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ServicesPage() {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Todos los Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {demoServices.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-5 flex flex-col text-center items-center"
            >
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
              <div className="mt-4">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{s.price}</p>
                <motion.button
                  onClick={() => handleHire(s.id, s.price)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Contratar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  function ProfilePage() {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Mi Perfil</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Wallet</h3>
            <div className="mt-4 p-4 w-full bg-gray-50 dark:bg-gray-800 rounded-lg text-center break-all font-mono text-sm text-gray-600 dark:text-gray-300">
              {publicKey ? publicKey : "No has conectado tu wallet"}
            </div>
            {!publicKey && (
              <motion.button
                onClick={connectFreighter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Conectar ahora
              </motion.button>
            )}
            {publicKey && (
              <motion.button
                onClick={handleRegister}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Registrarse (Demo)
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  function HistoryPage() {
    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'success':
          return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">✅ Exitoso</span>;
        case 'failed':
          return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">❌ Fallido</span>;
        case 'pending':
          return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">⏳ Pendiente</span>;
        default:
          return null;
      }
    };

    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Historial de Transacciones</h2>

        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-12 text-center"
          >
            <ClockIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No hay transacciones aún</h3>
            <p className="text-gray-500 dark:text-gray-400">Tus transacciones aparecerán aquí cuando contrates servicios o te registres.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {tx.type === 'register' ? '👤 Registro de Usuario' : `🛒 ${tx.serviceName}`}
                      </h3>
                      {getStatusBadge(tx.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID de Transacción</p>
                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{tx.id}</p>
                      </div>

                      {tx.amount && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{tx.amount}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(tx.timestamp)}</p>
                      </div>

                      {tx.txHash && tx.txHash !== 'N/A' && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Hash de Blockchain</p>
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>

                    {tx.error && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{tx.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <PageContent />
      </div>

      {/* Transaction Success Modal */}
      <Transition.Root show={showTxModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowTxModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        ¡Transacción Exitosa!
                      </Dialog.Title>
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tu transacción ha sido confirmada en la blockchain de Stellar.
                        </p>

                        {currentTxHash && (
                          <>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hash de Transacción</p>
                              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                {currentTxHash}
                              </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                💡 <strong>Nota sobre Freighter:</strong> Las invocaciones de contratos inteligentes no siempre aparecen en el historial de Freighter, pero están 100% confirmadas en la blockchain.
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Puedes ver esta transacción en Stellar Expert haciendo clic abajo.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${currentTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2"
                    >
                      Ver en Stellar Expert
                    </a>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 sm:col-start-1 sm:mt-0"
                      onClick={() => setShowTxModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}