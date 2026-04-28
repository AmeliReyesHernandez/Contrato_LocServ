import express from 'express';
import cors from 'cors';
import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configuración de la Red
const CONTRACT_ID = 'CCAULP76EYM2AKZLSCO3OFVSVAFHFIZDDX7ZDNBNVZZJTNMLW3IHOGZ6';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new StellarSdk.rpc.Server(RPC_URL);

// =============================================================================
// 🛠️ FUNCIONES DE AYUDA (Interacción Real con la Blockchain)
// =============================================================================

async function leerContrato(metodo: string, args: any[] = []) {
    try {
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        const tx = new StellarSdk.TransactionBuilder(
            new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
            { fee: '100', networkPassphrase: StellarSdk.Networks.TESTNET }
        )
        .addOperation(contract.call(metodo, ...args))
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

        const result = await server.simulateTransaction(tx);
        
        if (StellarSdk.rpc.Api.isSimulationSuccess(result) && result.result) {
            return StellarSdk.scValToNative(result.result.retval);
        }
        return { success: false, error: 'La simulación falló' };
    } catch (error: any) {
        console.error('Error en blockchain:', error);
        throw error;
    }
}

async function ejecutarContrato(metodo: string, args: any[] = []) {
    // En un backend real, aquí firmarías con una Secret Key.
    // Por ahora, simulamos que la ejecución es exitosa para no bloquear el flujo.
    console.log(`Ejecutando método: ${metodo} con argumentos:`, args);
    return { success: true, txHash: 'simulated_tx_hash', valor: 'Operación simulada desde backend' };
}

// =============================================================================
// 🌐 ENDPOINTS (Rutas de la API)
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        mensaje: 'El servidor de LocServ está funcionando correctamente',
        timestamp: new Date().toISOString() 
    });
});

// --- LECTURA ---

/* GET /saludar/:nombre */
app.get('/saludar/:nombre', async (req, res) => {
    try {
        console.log(`📥 Solicitando saludo para ${req.params.nombre}...`);
        const arg = StellarSdk.nativeToScVal(req.params.nombre, { type: 'string' });
        const resultado = await leerContrato('saludar', [arg]);
        
        res.json({ success: true, datos: resultado });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* GET /contrato/:id */
app.get('/contrato/:id', async (req, res) => {
    try {
        const arg = StellarSdk.nativeToScVal(req.params.id, { type: 'string' });
        const resultado = await leerContrato('consultar_estado_contrato', [arg]);
        res.json({ success: true, datos: resultado });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* GET /calificacion/:id */
app.get('/calificacion/:id', async (req, res) => {
    try {
        const arg = StellarSdk.nativeToScVal(req.params.id, { type: 'string' });
        const resultado = await leerContrato('consultar_calificacion', [arg]);
        res.json({ success: true, datos: resultado });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- ESCRITURA ---

/* POST /usuario/crear */
app.post('/usuario/crear', async (req, res) => {
    try {
        const { id_usuario, nombre, ag_patemo, ag_matemo, correo, direccion } = req.body;
        const resultado = await ejecutarContrato('crear_usuario', [id_usuario, nombre, ag_patemo, ag_matemo, correo, direccion]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* PUT /usuario/actualizar */
app.put('/usuario/actualizar', async (req, res) => {
    try {
        const { id_usuario, nuevo_correo, nueva_direccion } = req.body;
        const resultado = await ejecutarContrato('actualizar_cuenta', [id_usuario, nuevo_correo, nueva_direccion]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* POST /usuario/servicio/agregar */
app.post('/usuario/servicio/agregar', async (req, res) => {
    try {
        const { id_usuario, id_servicio } = req.body;
        const resultado = await ejecutarContrato('agregar_servicio', [id_usuario, id_servicio]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* POST /servicio/crear */
app.post('/servicio/crear', async (req, res) => {
    try {
        const { id_servicio, nombre, categoria, descripcion, disponibilidad, precio } = req.body;
        const resultado = await ejecutarContrato('crear_servicio', [id_servicio, nombre, categoria, descripcion, disponibilidad, precio]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* PUT /servicio/modificar */
app.put('/servicio/modificar', async (req, res) => {
    try {
        const { id_servicio, nuevos_datos } = req.body;
        const resultado = await ejecutarContrato('modificar_servicio', [id_servicio, nuevos_datos]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* POST /contrato/crear */
app.post('/contrato/crear', async (req, res) => {
    try {
        const { id_contrato, id_servicio, id_usuario, fecha_inicio, fecha_fin, monto_total } = req.body;
        const resultado = await ejecutarContrato('crear_contrato', [id_contrato, id_servicio, id_usuario, fecha_inicio, fecha_fin, monto_total]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* POST /calificacion/agregar */
app.post('/calificacion/agregar', async (req, res) => {
    try {
        const { id_calificacion, id_servicio, id_usuario, valor, comentario, fecha } = req.body;
        const resultado = await ejecutarContrato('agregar_calificacion', [id_calificacion, id_servicio, id_usuario, valor, comentario, fecha]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* POST /transaccion/generar */
app.post('/transaccion/generar', async (req, res) => {
    try {
        const { id_transaccion, id_contrato, monto, metodo_pago, fecha_pago } = req.body;
        const resultado = await ejecutarContrato('generar_transaccion', [id_transaccion, id_contrato, monto, metodo_pago, fecha_pago]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* PUT /transaccion/confirmar */
app.put('/transaccion/confirmar', async (req, res) => {
    try {
        const { id_transaccion } = req.body;
        const resultado = await ejecutarContrato('confirmar_pago', [id_transaccion]);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`=================================================`);
    console.log(`🚀 Servidor LocServ corriendo en http://localhost:${port}`);
    console.log(`=================================================`);
});
