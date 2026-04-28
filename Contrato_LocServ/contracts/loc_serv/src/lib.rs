#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Map, Vec, String, Error, Bytes, Symbol, symbol_short};
use soroban_sdk::xdr::{ScErrorType, ScErrorCode};

#[contract]
pub struct LocServContract;

#[contractimpl]
impl LocServContract {
    // FUNCIÓN BÁSICA DE PRÁCTICA
    pub fn saludar(env: Env, nombre: String) -> String {
        nombre
    }

    pub fn crear_usuario(
        env: Env,
        id_usuario: String,
        nombre: String,
        ag_patemo: String,
        ag_matemo: String,
        correo: String,
        direccion: i32,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "usuarios");
        let mut usuarios: Map<String, (String, String, String, String, i32)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if usuarios.contains_key(id_usuario.clone()) {
            return Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput));
        }

        usuarios.set(id_usuario.clone(), (nombre.clone(), ag_patemo, ag_matemo, correo, direccion));
        env.storage().persistent().set(&key, &usuarios);

        // EVENTO PARA EL TALLER
        env.events().publish((Symbol::new(&env, "usuario_creado"), id_usuario), nombre);

        Ok(())
    }

    pub fn actualizar_cuenta(
        env: Env,
        id_usuario: String,
        nuevo_correo: String,
        nueva_direccion: i32,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "usuarios");
        let mut usuarios: Map<String, (String, String, String, String, i32)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if let Some((nombre, ag_patemo, ag_matemo, _, _)) = usuarios.get(id_usuario.clone()) {
            usuarios.set(id_usuario, (nombre, ag_patemo, ag_matemo, nuevo_correo, nueva_direccion));
            env.storage().persistent().set(&key, &usuarios);
            Ok(())
        } else {
            Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput))
        }
    }

    pub fn agregar_servicio(
        env: Env,
        id_usuario: String,
        id_servicio: String,
    ) -> Result<(), Error> {
        let key_symbol = Symbol::new(&env, "serv_list");
        let mut all_user_services: Map<String, Vec<String>> = env
            .storage()
            .persistent()
            .get(&key_symbol)
            .unwrap_or(Map::new(&env));

        let mut user_services = all_user_services.get(id_usuario.clone()).unwrap_or(Vec::new(&env));
        user_services.push_back(id_servicio);
        all_user_services.set(id_usuario, user_services);
        
        env.storage().persistent().set(&key_symbol, &all_user_services);
        Ok(())
    }

    pub fn crear_servicio(
        env: Env,
        id_servicio: String,
        nombre: String,
        categoria: String,
        descripcion: String,
        disponibilidad: i128,
        precio: i128,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "servicios");
        let mut servicios: Map<String, (String, String, String, i128, i128)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if servicios.contains_key(id_servicio.clone()) {
            return Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput));
        }

        servicios.set(id_servicio, (nombre, categoria, descripcion, disponibilidad, precio));
        env.storage().persistent().set(&key, &servicios);
        Ok(())
    }

    pub fn modificar_servicio(
        env: Env,
        id_servicio: String,
        nuevos_datos: (String, String, String, i128, i128),
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "servicios");
        let mut servicios: Map<String, (String, String, String, i128, i128)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if !servicios.contains_key(id_servicio.clone()) {
            return Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput));
        }

        servicios.set(id_servicio, nuevos_datos);
        env.storage().persistent().set(&key, &servicios);
        Ok(())
    }

    pub fn crear_contrato(
        env: Env,
        id_contrato: String,
        id_servicio: String,
        id_usuario: String,
        fecha_inicio: String,
        fecha_fin: String,
        monto_total: i128,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "contratos");
        let mut contratos: Map<String, (String, String, String, String, i128)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if contratos.contains_key(id_contrato.clone()) {
            return Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput));
        }

        contratos.set(id_contrato, (id_servicio, id_usuario, fecha_inicio, fecha_fin, monto_total));
        env.storage().persistent().set(&key, &contratos);

        // EVENTO PARA EL TALLER
        env.events().publish((Symbol::new(&env, "contrato_realizado"), id_contrato), monto_total);

        Ok(())
    }

    pub fn consultar_estado_contrato(
        env: Env,
        id_contrato: String,
    ) -> Option<(String, String, String, String, i128)> {
        let key = Symbol::new(&env, "contratos");
        let contratos: Map<String, (String, String, String, String, i128)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        contratos.get(id_contrato)
    }

    pub fn agregar_calificacion(
        env: Env,
        id_calificacion: String,
        id_servicio: String,
        id_usuario: String,
        valor: i32,
        comentario: String,
        fecha: u64,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "calif");
        let mut calificaciones: Map<String, (String, String, i32, String, u64)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        calificaciones.set(id_calificacion, (id_servicio, id_usuario, valor, comentario, fecha));
        env.storage().persistent().set(&key, &calificaciones);
        Ok(())
    }

    pub fn consultar_calificacion(
        env: Env,
        id_calificacion: String,
    ) -> Option<(String, String, i32, String, u64)> {
        let key = Symbol::new(&env, "calif");
        let calificaciones: Map<String, (String, String, i32, String, u64)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        calificaciones.get(id_calificacion)
    }

    pub fn generar_transaccion(
        env: Env,
        id_transaccion: String,
        id_contrato: String,
        monto: i128,
        metodo_pago: String,
        fecha_pago: u64,
    ) -> Result<(), Error> {
        let key = Symbol::new(&env, "trans");
        let mut transacciones: Map<String, (String, i128, String, u64, String)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        let estado = String::from_str(&env, "Pendiente");
        transacciones.set(id_transaccion, (id_contrato, monto, metodo_pago, fecha_pago, estado));
        env.storage().persistent().set(&key, &transacciones);
        Ok(())
    }

    pub fn confirmar_pago(env: Env, id_transaccion: String) -> Result<(), Error> {
        let key = Symbol::new(&env, "trans");
        let mut transacciones: Map<String, (String, i128, String, u64, String)> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));

        if let Some((id_contrato, monto, metodo_pago, fecha_pago, _)) =
            transacciones.get(id_transaccion.clone())
        {
            let estado = String::from_str(&env, "Completado");
            transacciones.set(id_transaccion, (id_contrato, monto, metodo_pago, fecha_pago, estado));
            env.storage().persistent().set(&key, &transacciones);
            Ok(())
        } else {
            Err(Error::from_type_and_code(ScErrorType::Contract, ScErrorCode::InvalidInput))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Env, String};

    #[test]
    fn test_saludar() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LocServContract);
        let client = LocServContractClient::new(&env, &contract_id);

        let nombre = String::from_str(&env, "Ameli");
        let respuesta = client.saludar(&nombre);
        
        assert_eq!(respuesta, nombre);
    }

    #[test]
    fn test_crear_usuario() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LocServContract);
        let client = LocServContractClient::new(&env, &contract_id);

        let id = String::from_str(&env, "user123");
        let nombre = String::from_str(&env, "Juan");
        let correo = String::from_str(&env, "juan@test.com");

        let result = client.crear_usuario(&id, &nombre, &nombre, &nombre, &correo, &123);
        assert!(result.is_ok());
    }
}