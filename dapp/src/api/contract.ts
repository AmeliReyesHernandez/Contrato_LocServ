// Use the global StellarSdk loaded from CDN (same as App.tsx)
const StellarSdk: any = (window as any).StellarSdk;

// Configuración de la red de prueba
const server = StellarSdk ? new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org") : null;

// Dirección simulada del contrato (reemplazar con la real)
const CONTRACT_ADDRESS = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

/**
 * Obtiene la lista de servicios desde el contrato (o datos simulados)
 * @returns {Promise<Array>} Lista de servicios
 */
export async function obtenerServicios() {
  console.log("Consultando servicios del contrato...");
  try {
    // Aquí iría la llamada real al contrato Soroban
    // Por ahora, retornamos datos simulados
    const serviciosSimulados = [
      { id: "S1", title: "Electricista Profesional", desc: "Instalaciones y reparaciones eléctricas seguras.", price: "1000", provider: "Carlos Mendoza", rating: 4.8, address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" },
      { id: "S2", title: "Clases de Guitarra Acústica", desc: "Aprende desde cero. Todos los niveles.", price: "1500", provider: "Ana García", rating: 4.9, address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" },
      { id: "S3", title: "Plomería de Emergencia", desc: "Solución a fugas, atascos y más, 24/7.", price: "2000", provider: "Roberto Silva", rating: 4.7, address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" },
      { id: "S4", title: "Diseño Gráfico y Branding", desc: "Logos, publicidad y material de marca.", price: "4000", provider: "Laura Martínez", rating: 5.0, address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" },
      { id: "S5", title: "Asesoría de Jardinería", desc: "Crea y mantén tu jardín ideal.", price: "800", provider: "Pedro Ramírez", rating: 4.6, address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" },
      { id: "S6", title: "Reparación de Computadoras", desc: "Hardware y software, virus y lentitud.", price: "1600", provider: "Miguel Torres", rating: 4.8, address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" },
      { id: "S7", title: "Clases de Yoga", desc: "Sesiones personalizadas o grupales. Mejora tu bienestar.", price: "1200", provider: "Sofia López", rating: 4.9, address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" },
      { id: "S8", title: "Carpintería a Medida", desc: "Muebles personalizados y reparaciones de madera.", price: "3000", provider: "Jorge Hernández", rating: 4.7, address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" },
      { id: "S9", title: "Fotografía Profesional", desc: "Eventos, retratos y productos. Calidad garantizada.", price: "6000", provider: "Diana Ruiz", rating: 5.0, address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" },
      { id: "S10", title: "Limpieza de Hogar", desc: "Servicio completo de limpieza residencial.", price: "1800", provider: "María Flores", rating: 4.8, address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" },
      { id: "S11", title: "Clases de Inglés", desc: "Aprende inglés con profesor certificado.", price: "1400", provider: "John Smith", rating: 4.9, address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" },
      { id: "S12", title: "Asesoría Legal", desc: "Consultas legales en derecho civil y familiar.", price: "5000", provider: "Lic. Patricia Gómez", rating: 4.8, address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" },
      { id: "S13", title: "Desarrollo Web", desc: "Sitios web modernos y responsivos.", price: "10000", provider: "David Chen", rating: 5.0, address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" },
      { id: "S14", title: "Paseo de Mascotas", desc: "Cuido y paseo de perros. Servicio confiable.", price: "600", provider: "Andrea Morales", rating: 4.7, address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" },
      { id: "S15", title: "Clases de Cocina", desc: "Aprende recetas mexicanas e internacionales.", price: "1700", provider: "Chef Mario Sánchez", rating: 4.9, address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" }
    ];
    return serviciosSimulados;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return [];
  }
}

/**
 * Contrata un servicio (simula una transacción al contrato)
 * @param {object} servicio - El servicio a contratar
 * @param {string} publicKey - Clave pública del usuario
 * @param {function} signTransaction - Función de Freighter para firmar
 * @returns {Promise<object>} Resultado de la transacción
 */
export async function contratarServicio(servicio: any, publicKey: string, signTransaction: any) {
  console.log("Firmando con Freighter...");
  console.log("Enviando a la red...");
  
  try {
    // Aquí iría la lógica real para invocar el contrato en Soroban
    // usando stellar-sdk y soroban-client
    
    // Simulamos una transacción exitosa
    const txHash = "sim_" + Math.random().toString(36).substring(2, 15);
    console.log("Transacción exitosa:", txHash);
    
    return { 
      success: true, 
      hash: txHash,
      message: `Servicio ${servicio.title} contratado exitosamente` 
    };
  } catch (error) {
    console.error("Error en la transacción:", error);
    throw error;
  }
}
