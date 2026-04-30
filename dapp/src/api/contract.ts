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
      { 
        id: "S1", 
        title: "Electricista Profesional", 
        desc: "Instalaciones y reparaciones eléctricas seguras.", 
        price: "15", 
        provider: "Juan Pérez", 
        rating: 4.8, 
        address: "GADC2E4ELUT4OMIWEEJKXX47IE7QDJDI7YCVOKZ62Q2XBTS2UAAQJ2ZU" 
      },
      { 
        id: "S2", 
        title: "Clases de Guitarra Acústica", 
        desc: "Aprende desde cero. Todos los niveles.", 
        price: "20", 
        provider: "Elena García", 
        rating: 5.0, 
        address: "GC7TVDUFHPIXQJ3NGGQ6JKXVAWD76L2JR35MYKKHUONOSBK4PXRSNM2A" 
      },
      { 
        id: "S3", 
        title: "Plomería de Emergencia", 
        desc: "Solución a fugas, atascos y más, 24/7.", 
        price: "18", 
        provider: "Roberto Torres", 
        rating: 4.5, 
        address: "GCKVHP6HDZFXSQAKLHXQJX7FWO33DN7X3BXXQZFEBSCPITCJIKG42EHD" 
      }
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
