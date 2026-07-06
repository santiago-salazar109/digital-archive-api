# Digital Archive Management API

Este proyecto consiste en el desarrollo de una Interfaz de Programación de Aplicaciones (API) orientada al Backend, diseñada con el propósito de dominar los fundamentos de la programación del lado del servidor, la implementación de buenas prácticas de desarrollo y el control de versiones robusto.

La API está enfocada en la gestión técnica de un catálogo de documentos, transcripciones y manuscritos históricos, permitiendo su registro, consulta, actualización y organización por categorías analíticas.

---

## Objetivos de Aprendizaje

- Comprender la arquitectura Cliente-Servidor y el funcionamiento del protocolo HTTP.
- Desarrollar una API RESTful estructurada, modular y escalable.
- Manipular flujos de datos mediante operaciones CRUD (Create, Read, Update, Delete).
- Gestionar variables de entorno y configuraciones de seguridad esenciales.
- Implementar capas de validación de datos y un sistema profesional de manejo de errores.
- Conectar un sistema de persistencia de datos (Base de Datos Relacional) en una fase avanzada.

---

## Tecnologías y Herramientas

- **Entorno de ejecución:** Node.js
- **Lenguaje de programación:** JavaScript (ES6+)
- **Framework de servidor:** Express.js
- **Control de versiones:** Git y GitHub
- **Pruebas de endpoints:** Postman
- **Base de datos:** PostgreSQL (Fase de diseño e integración)

---

## Arquitectura de la API y Estado de Endpoints

A continuación se detallan las rutas programadas para la interacción con el catálogo de documentos históricos y su estado de desarrollo actual:

| Método | Endpoint | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| GET | /api/documentos | Obtener la colección completa de documentos del archivo | Implementado (Memoria) |
| GET | /api/documentos/:id | Buscar un documento específico mediante su identificador único | Implementado (Memoria) |
| POST | /api/documentos | Registrar un nuevo documento con sus respectivos metadatos | Implementado (Memoria) |
| PUT | /api/documentos/:id | Actualizar el registro o la transcripción de un documento existente | Implementado (Memoria) |
| DELETE | /api/documentos/:id | Eliminar un documento del registro del sistema | Implementado (Memoria) |

---

## Modelo de Datos (Diagrama Entidad-Relación)

Estructura lógica diseñada para la migración hacia el motor de base de datos relacional. Este diagrama define la entidad principal y sus restricciones de tipos de datos. 

```mermaid
erDiagram
FONDOS_ARCHIVISTICOS ||--|{ DOCUMENTOS : contiene
INVESTIGADORES ||--|{ DOCUMENTOS : registra
DOCUMENTOS ||--|{ TRANSCRIPCIONES : posee
INVESTIGADORES ||--|{ TRANSCRIPCIONES : transcribe

FONDOS_ARCHIVISTICOS {
int id PK
varchar nombre
text descripcion
}
INVESTIGADORES {
int id PK
varchar nombre
varchar correo
varchar rol
}
DOCUMENTOS {
int id PK
int fondo_id FK
int investigador_id FK
varchar titulo
int anio
varchar ubicacion_fisica
text contexto_historico
}
TRANSCRIPCIONES {
int id PK
int documento_id FK
int investigador_id FK
text texto_paleografico
text notas_criticas
timestamp fecha_creacion
}