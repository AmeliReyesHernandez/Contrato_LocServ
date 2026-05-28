import React, { useEffect, useState, ElementType, Fragment } from "react";
import { isConnected, requestAccess, getAddress, signTransaction } from "@stellar/freighter-api";

// Use the global StellarSdk loaded from CDN in index.html to avoid Vite bundling issues
const StellarSdk = (window as any).StellarSdk;

// Wait for StellarSdk to load if needed
const waitForStellarSdk = () => {
  return new Promise<void>((resolve) => {
    if ((window as any).StellarSdk) return resolve();
    const check = setInterval(() => {
      if ((window as any).StellarSdk) {
        clearInterval(check);
        resolve();
      }
    }, 100);
    setTimeout(() => resolve(), 5000); // Timeout after 5s
  });
};

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
  StarIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { Transition, Dialog, Menu } from "@headlessui/react";

// Types
type NavKey = "dashboard" | "services" | "profile";

// Import API functions
import { obtenerServicios } from "./api/contract";

// Components
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

function StarRating({ rating, interactive = false, onRate }: { rating: number, interactive?: boolean, onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={(e) => {
            e.stopPropagation();
            interactive && onRate && onRate(star);
          }}
        >
          {star <= (hover || rating) ? (
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      ))}
      {!interactive && <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>}
    </div>
  );
}

function Header({ route, themeDark, setThemeDark, publicKey, connectFreighter, disconnectWallet, setSidebarOpen, sidebarOpen }: any) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 md:hidden">
        <Bars3Icon className="w-6 h-6" />
      </button>
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">{route}</h1>
      </div>
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => setThemeDark((v: boolean) => !v)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <motion.div
            initial={false}
            animate={{ rotate: themeDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {themeDark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-indigo-500" />}
          </motion.div>
        </motion.button>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectFreighter}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-colors ${
              publicKey 
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
              : "bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700"
            }`}
          >
            <WalletIcon className="w-5 h-5"/>
            <span className="text-sm font-medium">
              {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : "Conectar Wallet"}
            </span>
          </motion.button>

          {publicKey && (
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <Bars3Icon className="w-6 h-6" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={connectFreighter}
                          className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-300'} group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                        >
                          Cambiar Cuenta
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={disconnectWallet}
                          className={`${active ? 'bg-red-500 text-white' : 'text-red-600 dark:text-red-400'} group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                        >
                          <PowerIcon className="w-4 h-4 mr-2" />
                          Desconectar
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ route, setRoute, sidebarOpen, setSidebarOpen, logs }: any) {
  const NavItem = ({ navKey, icon: Icon, label }: any) => (
    <li>
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          setRoute(navKey);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          route === navKey
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
          <NavItem navKey="profile" icon={UserIcon} label="Mi Perfil" />
        </ul>
      </nav>
      <div className="mt-auto p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Logs del Sistema</h4>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 h-32 overflow-y-auto font-mono">
          {logs.length > 0 ? logs.map((log: string, i: number) => <p key={i}>{log}</p>) : <p>No hay actividad reciente.</p>}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-0 flex z-40">
            <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
                {sidebarContent}
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)}></div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">{sidebarContent}</div>
      </div>
    </>
  );
}

function PageContent({ route, publicKey, pushLog, connectFreighter, disconnectWallet, handleHire, services, loadingServices, addServiceLocally }: any) {
  return (
    <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div key={route} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {route === "dashboard" && <Dashboard publicKey={publicKey} pushLog={pushLog} handleHire={handleHire} services={services} loadingServices={loadingServices} />}
          {route === "services" && <ServicesPage pushLog={pushLog} handleHire={handleHire} services={services} loadingServices={loadingServices} />}
          {route === "profile" && <ProfilePage publicKey={publicKey} connectFreighter={connectFreighter} disconnectWallet={disconnectWallet} services={services} pushLog={pushLog} addServiceLocally={addServiceLocally} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function Dashboard({ publicKey, pushLog, handleHire, services, loadingServices }: any) {
  const StatCard = ({ title, value, icon: Icon, delay = 0 }: any) => (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay }} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow flex items-center gap-4">
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
        <StatCard title="Servicios Disponibles" value={services.length} icon={ClipboardIcon} />
        <StatCard title="Wallet Status" value={publicKey ? "Conectado" : "No Conectado"} icon={WalletIcon} delay={0.1} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Servicios Destacados (API)</h3>
        {loadingServices ? (
          <p className="text-gray-500">Cargando servicios desde la API...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm flex flex-col">
                <div className="flex-grow">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">{s.title}</h4>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full">{s.price} XLM</span>
                  </div>
                  <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mt-1">Por {s.provider}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{s.desc}</p>
                  <div className="mt-3"><StarRating rating={s.rating} /></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => handleHire(s)} 
                    className="w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-white transition-colors"
                  >
                    Contratar (XLM)
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesPage({ pushLog, handleHire, services, loadingServices }: any) {
  if (loadingServices) return <p className="text-gray-500">Cargando servicios desde la API...</p>;
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Todos los Servicios (API)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 flex flex-col items-center text-center">
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">{s.title}</h3>
              <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mt-1">Por {s.provider}</p>
              <div className="flex justify-center mt-2">
                <StarRating rating={s.rating} interactive onRate={(r) => pushLog(`Calificado ${s.title} con ${r}★`)} />
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
            <div className="mt-4 w-full">
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{s.price} XLM</p>
              <button 
                onClick={() => handleHire(s)} 
                className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
              >
                Contratar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ publicKey, connectFreighter, disconnectWallet, services, pushLog, addServiceLocally }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({ title: '', desc: '', price: '' });

  const handleAddService = async (e: any) => {
    e.preventDefault();
    if (!publicKey) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const newServiceId = "S" + Date.now();
      
      pushLog("📡 Enviando servicio al backend...");
      
      const res = await fetch(`${backendUrl}/servicio/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_servicio: newServiceId,
          nombre: newService.title,
          categoria: "General",
          descripcion: newService.desc,
          disponibilidad: true,
          precio: newService.price
        })
      });
      
      if (!res.ok) {
        pushLog(`❌ Error del servidor (${res.status}): ${res.statusText}`);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        addServiceLocally({
          id: newServiceId,
          title: newService.title,
          desc: newService.desc,
          price: newService.price,
          provider: "Tú (" + publicKey.slice(0, 4) + '...' + publicKey.slice(-4) + ")",
          address: publicKey,
          rating: 0
        });
        pushLog("✅ Servicio creado (backend).");
        setShowAddForm(false);
        setNewService({ title: '', desc: '', price: '' });
      } else {
        pushLog("❌ Error: " + (data.error || "No especificado"));
      }
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        pushLog("❌ No se puede conectar al backend. ¿Está corriendo en " + (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + "?");
      } else {
        pushLog("❌ Error: " + err.message);
      }
    }
  };

  const userServices = services ? services.filter((s: any) => s.address === publicKey) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
            <UserIcon className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
          </div>
          {publicKey && <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>}
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Usuario LocServ</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono break-all px-4">{publicKey || "Wallet no conectada"}</p>
        {publicKey ? (
          <button onClick={disconnectWallet} className="mt-8 w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors">
            <PowerIcon className="w-5 h-5" /> Desconectar
          </button>
        ) : (
          <button onClick={connectFreighter} className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30">Conectar Wallet</button>
        )}
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><ClipboardIcon className="w-6 h-6 text-indigo-500" /> Mis Servicios</h3>
            {publicKey && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {showAddForm ? 'Cancelar' : 'Agregar Servicio'}
              </button>
            )}
          </div>
          
          {publicKey ? (
            <div className="space-y-6">
              {showAddForm && (
                <form onSubmit={handleAddService} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                  <h4 className="font-bold text-gray-800 dark:text-white">Nuevo Servicio</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                    <input required type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. Plomería" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea required value={newService.desc} onChange={e => setNewService({...newService, desc: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Descripción del servicio" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (XLM)</label>
                    <input required type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. 10" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">Guardar Servicio</button>
                </form>
              )}

              {userServices.length > 0 ? (
                <div className="space-y-4">
                  {userServices.map((s: any) => (
                    <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center"><CubeTransparentIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
                        <div className="flex-grow"><h4 className="font-bold text-gray-800 dark:text-white">{s.title}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{s.price} XLM</p></div>
                      </div>
                      <div className="self-end sm:self-auto"><StarRating rating={s.rating || 5} /></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No has agregado ningún servicio aún.</div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Conecta tu wallet para ver o agregar tus servicios.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [route, setRoute] = useState<NavKey>("dashboard");
  const [themeDark, setThemeDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const pushLog = (t: string) => setLogs((s) => [`[${new Date().toLocaleTimeString()}] ${t}`, ...s].slice(0, 100));

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await obtenerServicios();
      setServices(data);
      pushLog(`✅ ${data.length} servicios cargados desde la API`);
    } catch (e: any) {
      pushLog(`❌ Error cargando servicios: ${e.message}`);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const connectFreighter = async () => {
    try {
      pushLog("Buscando Freighter...");
      const extractAddress = (res: any): string => {
        if (res && typeof res === 'object') {
          if (res.address) return res.address;
          if (res.error) pushLog(`Error de Freighter: ${res.error}`);
          return "";
        } else if (typeof res === 'string') {
          return res;
        }
        return "";
      };
      
      let connected = false;
      try {
        const isConnResult = await isConnected();
        connected = typeof isConnResult === 'object' ? (isConnResult as any).isConnected : !!isConnResult;
      } catch (e) {
        connected = false;
      }

      if (!connected) {
        pushLog("❌ Freighter no está instalado o detectado");
        return;
      }

      pushLog("Obteniendo dirección de la wallet...");
      let addressResult = await getAddress();
      let address = extractAddress(addressResult);

      if (!address) {
        pushLog("Solicitando permiso de acceso al sitio...");
        await requestAccess();
        addressResult = await getAddress();
        address = extractAddress(addressResult);
      }

      if (address) {
        pushLog(`Wallet conectada: ${address}`);
        setPublicKey(address);
      } else {
        pushLog("❌ No se pudo obtener la clave pública. Por favor abre Freighter y autoriza este sitio.");
      }
    } catch (err: any) {
      console.error(err);
      pushLog(`Error al conectar con Freighter: ${err?.message || 'Desconocido'}`);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    pushLog("Desconectado.");
  };

  const authenticateWithPasskey = async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        alert("Tu navegador no soporta Passkeys o biometría (Accessly).");
        return false;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const existingCredentialIdBase64 = localStorage.getItem("locserv_passkey_id");

      if (existingCredentialIdBase64) {
        // Authenticate with existing passkey
        const credentialId = Uint8Array.from(atob(existingCredentialIdBase64), c => c.charCodeAt(0));
        
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            allowCredentials: [{
              id: credentialId,
              type: "public-key",
            }],
            userVerification: "required",
            timeout: 60000,
          },
        });
        return !!credential;
      } else {
        // First time: Create new passkey
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const credential: any = await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: {
              name: "LocServ - Accessly",
            },
            user: {
              id: userId,
              name: "usuario@locserv.com",
              displayName: "Usuario LocServ",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 },
            ],
            authenticatorSelection: {
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        if (credential && credential.rawId) {
          const idArray = new Uint8Array(credential.rawId);
          const base64Id = btoa(Array.from(idArray).map(b => String.fromCharCode(b)).join(''));
          localStorage.setItem("locserv_passkey_id", base64Id);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Error en autenticación Passkey:", error);
      return false;
    }
  };

  const handleHire = async (service: any) => {
    if (!publicKey) {
      pushLog("❌ Conecta tu wallet primero");
      return;
    }

    pushLog("🔑 Verificando identidad con Passkey/Accessly...");
    const isAuthenticated = await authenticateWithPasskey();
    
    if (!isAuthenticated) {
      pushLog("❌ Autenticación cancelada o fallida. El pago no se realizará.");
      return;
    }

    try {
      if (!StellarSdk) {
        pushLog("❌ Error: Stellar SDK no ha cargado. Reintentando...");
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!(window as any).StellarSdk) {
          pushLog("❌ Stellar SDK no disponible. Recarga la página.");
          return;
        }
      }
      pushLog(`Iniciando pago por ${service.title}...`);
      
      const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      
      pushLog("Cargando tu cuenta...");
      let account;
      try {
        account = await server.loadAccount(publicKey);
      } catch (e: any) {
        if (e.response && e.response.status === 404) {
          throw new Error(`Tu cuenta no existe en testnet. Fondea tu cuenta aquí: https://laboratory.stellar.org/#account-creator?network=testnet`);
        }
        throw e;
      }
      
      // Check if account has minimum balance
      const minBalance = parseFloat(service.price) + 2; // price + base reserve + fee
      if (parseFloat(account.balances[0].balance) < minBalance) {
        throw new Error(`Saldo insuficiente. Necesitas al menos ${minBalance} XLM. Obtén fondos en: https://laboratory.stellar.org/#account-creator?network=testnet`);
      }

      // Check if destination account exists
      let destinationExists = true;
      try {
        await server.loadAccount(service.address);
      } catch (e: any) {
        if (e.response && e.response.status === 404) {
          destinationExists = false;
        } else {
          throw e; // Re-throw if it's not a 404
        }
      }

      const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: TESTNET_PASSPHRASE,
      });

      if (!destinationExists) {
        pushLog("La cuenta del proveedor no existe, creándola...");
        // createAccount requires at least 1 XLM starting balance
        const createAmount = Math.max(parseFloat(service.price), 1).toString();
        transactionBuilder.addOperation(StellarSdk.Operation.createAccount({
          destination: service.address,
          startingBalance: createAmount,
        }));
      } else {
        transactionBuilder.addOperation(StellarSdk.Operation.payment({
          destination: service.address,
          asset: StellarSdk.Asset.native(),
          amount: service.price,
        }));
      }
      
      const transaction = transactionBuilder
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();
      pushLog("Firmando con Freighter...");
      
      const signedResult = await signTransaction(xdr, {
        network: "TESTNET",
        networkPassphrase: TESTNET_PASSPHRASE,
      });

      if (!signedResult || signedResult.error) {
        throw new Error(signedResult?.error?.message || "La firma fue cancelada.");
      }

      const signedXdr = signedResult.signedTxXdr;
      pushLog("Enviando a la red...");
      
      const signedTx = new StellarSdk.Transaction(signedXdr, TESTNET_PASSPHRASE);
      const result = await server.submitTransaction(signedTx);

      if (result.hash) {
        setSuccessTxHash(result.hash);
        pushLog(`✅ ¡Pago exitoso!`);
      } else {
        throw new Error("No se recibió el hash de la transacción.");
      }
    } catch (e: any) {
      console.error("Error en handleHire:", e);
      let msg = e.message || "Error desconocido";
      if (e.response && e.response.data && e.response.data.extras) {
        msg = JSON.stringify(e.response.data.extras.result_codes);
      }
      pushLog(`❌ Error: ${msg}`);
    }
  };

  useEffect(() => {
    if (themeDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [themeDark]);

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
        <Sidebar route={route} setRoute={setRoute} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} logs={logs} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header route={route} themeDark={themeDark} setThemeDark={setThemeDark} publicKey={publicKey} connectFreighter={connectFreighter} disconnectWallet={disconnectWallet} setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <PageContent route={route} publicKey={publicKey} pushLog={pushLog} connectFreighter={connectFreighter} disconnectWallet={disconnectWallet} handleHire={handleHire} services={services} loadingServices={loadingServices} addServiceLocally={(s: any) => setServices(prev => [s, ...prev])} />
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successTxHash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSuccessTxHash(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Pago Exitoso!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Tu transacción ha sido registrada en la red Stellar.</p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors mb-3"
              >
                Ver en Stellar Expert
              </a>
              <button
                onClick={() => setSuccessTxHash(null)}
                className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}