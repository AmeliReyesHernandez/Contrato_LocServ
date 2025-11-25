import React, { useEffect, useState, ElementType } from "react";
import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";
import {
  HomeIcon,
  UserIcon,
  ClipboardIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type NavKey = "dashboard" | "services" | "profile";

export default function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [route, setRoute] = useState<NavKey>("dashboard");
  const [themeDark, setThemeDark] = useState<boolean>(false);

  const pushLog = (t: string) =>
    setLogs((s) => [new Date().toLocaleTimeString() + " — " + t, ...s].slice(0, 100));

  const connectFreighter = async () => {
    try {
      pushLog("Iniciando conexión con Freighter...");
      const isConn = await isConnected();
      if (!isConn) {
        pushLog("Solicitando permiso...");
        await requestAccess();
      }

      const pk = await getAddress();
      if (pk) {
        pushLog("Wallet conectada: " + pk);
        setPublicKey(pk);
      } else {
        pushLog("No se pudo obtener la dirección.");
      }
    } catch (err: any) {
      console.error(err);
      pushLog("Error Freighter: " + err?.message);
    }
  };

  useEffect(() => {
    if (themeDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [themeDark]);

  const demoServices = [
    { id: "S1", title: "Electricista local", desc: "Reparación general", price: "150 MXN" },
    { id: "S2", title: "Clases de guitarra", desc: "Nivel básico a avanzado", price: "200 MXN" },
    { id: "S3", title: "Plomería rápida", desc: "Fugas y atascos", price: "180 MXN" },
  ];

  function Navbar() {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md">
            {sidebarOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <div>
            <div className="text-lg font-bold">LocServ</div>
            <div className="text-xs text-gray-500">Intercambio de servicios locales</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setThemeDark((v) => !v)}
            className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {themeDark ? "Dark" : "Light"}
          </button>

          <button
            onClick={connectFreighter}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow"
          >
            {publicKey
              ? "Wallet: " + publicKey.slice(0, 6) + "..." + publicKey.slice(-6)
              : "Conectar Wallet"}
          </button>
        </div>
      </header>
    );
  }

  function Sidebar() {
    const item = (key: NavKey, Icon: ElementType, label: string) => (
      <button
        onClick={() => {
          setRoute(key);
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 p-3 rounded-lg ${
          route === key ? "bg-gray-200 dark:bg-gray-800" : ""
        } hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <span>{label}</span>
      </button>
    );

    return (
      <aside
        className={`w-72 p-4 bg-white dark:bg-gray-950 border-r h-full ${
          sidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {item("dashboard", HomeIcon, "Dashboard")}
          {item("services", ClipboardIcon, "Servicios")}
          {item("profile", UserIcon, "Perfil")}
        </nav>
      </aside>
    );
  }

  function Dashboard() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow"
          >
            <div className="text-sm text-gray-500">Servicios disponibles</div>
            <div className="text-3xl font-bold">{demoServices.length}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow"
          >
            <div className="text-sm text-gray-500">Wallet</div>
            <div className="text-xl">{publicKey ? publicKey : "No conectado"}</div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Servicios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoServices.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.03 }}
                className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow"
              >
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">{s.id}</div>
                  <div className="text-xs text-gray-400">{s.price}</div>
                </div>

                <div className="mt-3 font-semibold">{s.title}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => pushLog("Solicitado " + s.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                  >
                    Solicitar
                  </button>
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
        <h2 className="text-2xl font-semibold mb-4">Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoServices.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
              <div className="flex justify-between">
                <div className="font-semibold">{s.title}</div>
                <div>{s.price}</div>
              </div>

              <div className="mt-2 text-sm text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ProfilePage() {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Perfil</h2>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow">
          <div className="text-sm text-gray-500">Dirección de Wallet</div>
          <div className="break-all">{publicKey ? publicKey : "No conectado"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />

        <main className="p-6">
          {route === "dashboard" && <Dashboard />}
          {route === "services" && <ServicesPage />}
          {route === "profile" && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}