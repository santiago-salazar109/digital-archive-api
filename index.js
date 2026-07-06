const express = require('express');
const app = express();
const PORT = 3000;

// Importar la conexion a la base de datos para activar el Pool
const pool = require('./config/db');

// Middleware crítico: Configura el servidor para parsear e interpretar 
// estructuras de datos complejas enviadas en formato JSON dentro del cuerpo (body) de las peticiones.
app.use(express.json());

/**
 * REPOSITORIO PROVISIONAL EN MEMORIA (MOCK DATA)
 * Representa de forma temporal la estructura de nuestro archivo histórico digital.
 * Cada objeto simula un registro documental con sus respectivos metadatos archivísticos y paleográficos.
 * NOTA: Este arreglo se eliminará una vez se implemente la persistencia de datos en la base de datos SQL.
 */
const documentosHistoricos = [
    {
        id: 1,
        titulo: "Expediente sobre disputa de tierras - Juana Quirós",
        anio: 1785,
        ubicacion_archivo: "Archivo General de la Nación, Sección Colonia, Caja 12, Carpeta 3",
        contexto_historico: "Litigio territorial civil procesado en el Virreinato durante las reformas borbónicas.",
        transcripcion_paleografica: "En la ciudad de... ante mí el escribano público compareció Juana Quirós, vecina de este partido..."
    },
    {
        id: 2,
        titulo: "Manuscrito de cuentas de la Real Hacienda",
        anio: 1792,
        ubicacion_archivo: "Archivo Histórico Regional, Fondo Protocolos, Tomo 45",
        contexto_historico: "Registro de recaudación de impuestos locales de la corona española.",
        transcripcion_paleografica: "Cuenta y razón de los caudales de Real Hacienda pertenecientes al año de mil setecientos noventa y dos..."
    }
];

/**
 * ENDPOINT 1: CONSULTA GENERAL DEL CATÁLOGO (GET)
 * Ruta: /api/documentos
 * Objetivo: Recuperar la totalidad de los folios indexados en el sistema.
 * Retorna un objeto que indica el volumen total de registros y el arreglo con los datos.
 */
// Endpoint para obtener la coleccion completa de documentos desde PostgreSQL
app.get('/api/documentos', async (req, res) => {
    try {
        // Ejecutar la consulta SQL para traer todos los registros de la tabla
        const resultado = await pool.query('SELECT * FROM documentos ORDER BY id ASC');
        
        // Responder al cliente con las filas devueltas por la base de datos
        res.json(resultado.rows);
    } catch (error) {
        // Registro del error en el servidor para depuracion tecnica
        console.error('Error al consultar la tabla documentos:', error.message);
        
        // Respuesta formal de error HTTP 500 al cliente
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            detalle: 'No se pudo recuperar el catalogo documental en este momento.' 
        });
    }
});

/**
 * ENDPOINT 2: BÚSQUEDA SELECTIVA POR UNIDAD DE REGISTRO (GET)
 * Ruta: /api/documentos/:id
 * Objetivo: Localizar un expediente específico mediante su código identificador único.
 */
// Endpoint para obtener un documento especifico mediante su ID unico
app.get('/api/documentos/:id', async (req, res) => {
    // Extraer el parametro ID de la URL
    const { id } = req.params;

    try {
        // Ejecutar consulta parametrizada por motivos de seguridad
        const consulta = 'SELECT * FROM documentos WHERE id = $1';
        const resultado = await pool.query(consulta, [id]);

        // Validar si el documento existe en la base de datos
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `El documento con el ID ${id} no existe en el archivo digital.`
            });
        }

        // Si existe, retornar unicamente el primer objeto encontrado
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(`Error al consultar el documento con ID ${id}:`, error.message);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: 'Ocurrio un fallo al procesar la busqueda en la base de datos.'
        });
    }
});

/**
 * ENDPOINT 3: INCORPORACIÓN DE NUEVOS EXPEDIENTES AL ARCHIVO (POST)
 * Ruta: /api/documentos
 * Objetivo: Catalogar y almacenar un nuevo documento histórico con su transcripción elemental.
 */
// Endpoint para insertar un nuevo documento historico en la base de datos
app.post('/api/documentos', async (req, res) => {
    // Extraer los campos enviados por el cliente en el cuerpo de la peticion
    const { fondo_id, investigador_id, titulo, anio, ubicacion_fisica, contexto_historico } = req.body;

    // Validacion basica de campos obligatorios segun las restricciones de la base de datos
    if (!titulo) {
        return res.status(400).json({
            error: 'Solicitud incorrecta',
            detalle: 'El campo "titulo" es estrictamente obligatorio.'
        });
    }

    try {
        // Sentencia SQL con marcadores de posicion y clausula RETURNING
        const consulta = `
            INSERT INTO documentos (fondo_id, investigador_id, titulo, anio, ubicacion_fisica, contexto_historico)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        // Arreglo de valores que reemplazaran a los marcadores $1 a $6 de forma segura
        const valores = [fondo_id, investigador_id, titulo, anio, ubicacion_fisica, contexto_historico];
        
        const resultado = await pool.query(consulta, valores);

        // Responder con el estado 201 (Created) y el objeto persistido en la base de datos
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al insertar el documento:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: 'No se pudo guardar el documento en el archivo digital.'
        });
    }
});

/**
 * ENDPOINT 4: ACTUALIZACIÓN INTERNA DE METADATOS O TRANSCRIPCIONES (PUT)
 * Ruta: /api/documentos/:id
 * Objetivo: Modificar, corregir o expandir la información o transcripción paleográfica de un documento existente.
 */
// Endpoint para actualizar un documento existente por su ID
app.put('/api/documentos/:id', async (req, res) => {
    const { id } = req.params;
    const { fondo_id, investigador_id, titulo, anio, ubicacion_fisica, contexto_historico } = req.body;

    if (!titulo) {
        return res.status(400).json({
            error: 'Solicitud incorrecta',
            detalle: 'El campo "titulo" no puede quedar vacío.'
        });
    }

    try {
        const consulta = `
            UPDATE documentos 
            SET fondo_id = $1, investigador_id = $2, titulo = $3, anio = $4, ubicacion_fisica = $5, contexto_historico = $6
            WHERE id = $7
            RETURNING *
        `;
        
        const valores = [fondo_id, investigador_id, titulo, anio, ubicacion_fisica, contexto_historico, id];
        const resultado = await pool.query(consulta, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `No se encontró ningún documento con el ID ${id} para actualizar.`
            });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar el documento con ID ${id}:`, error.message);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: 'Ocurrió un fallo al intentar actualizar el registro en la base de datos.'
        });
    }
});

/**
 * ENDPOINT 5: DEPURACIÓN O EXPULSIÓN DE REGISTROS (DELETE)
 * Ruta: /api/documentos/:id
 * Objetivo: Remover un documento del inventario digital por error de duplicidad o reclasificación.
 */
// Endpoint para eliminar un documento histórico por su ID de forma permanente
app.delete('/api/documentos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Sentencia SQL para borrar el registro filtrado por su ID único
        const consulta = 'DELETE FROM documentos WHERE id = $1 RETURNING *';
        const resultado = await pool.query(consulta, [id]);

        // Si la base de datos devuelve cero filas, el documento no existía
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `No se encontró ningún documento con el ID ${id} para eliminar.`
            });
        }

        // Responder al cliente confirmando el éxito de la operación
        res.json({
            mensaje: 'Documento eliminado exitosamente del archivo digital.',
            documento_eliminado: resultado.rows[0]
        });
    } catch (error) {
        console.error(`Error al eliminar el documento con ID ${id}:`, error.message);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: 'Ocurrió un fallo al intentar eliminar el registro en la base de datos.'
        });
    }
});

// Inicialización del proceso de escucha en la interfaz de red local
app.listen(PORT, () => {
    console.log(`[Servidor Activo] Escuchando peticiones HTTP correctamente en el puerto local ${PORT}`);
});