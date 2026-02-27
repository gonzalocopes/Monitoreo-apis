<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Project Status">
  <img src="https://img.shields.io/badge/Architecture-Microservices-blue.svg" alt="Microservices">
  <img src="https://img.shields.io/badge/Next.js-14.x-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Node.js-22.x-green?logo=node.js" alt="Node.js">
  
  <h1>🛡️ API Sentinel</h1>
  <p><b>Plataforma Avanzada de Monitoreo de APIs y Respuesta a Incidentes.</b></p>
  <p>Construida con una arquitectura de microservicios para proveer observabilidad de endpoints en tiempo real, chequeos de salud programados y alertas.</p>
</div>

---

## 📖 Descripción General

**API Sentinel** es una plataforma tipo SaaS resiliente, escalable y observable diseñada para monitorear la salud, el tiempo de actividad (uptime) y la latencia de APIs críticas y servicios web.

Desarrollado como una demostración de prácticas modernas de ingeniería de software, este proyecto demuestra la capacidad de diseñar e implementar un sistema distribuido utilizando una **Arquitectura de Microservicios**, **Colas de Tareas Asíncronas**, y un **Frontend Moderno con Server-Side Rendering (SSR)**.

Este proyecto tiene como objetivo resaltar los patrones avanzados de backend (Service API Gateways, Programación Basada en Eventos) combinados con una interfaz de usuario realista, responsiva y construida bajo la tendencia de diseño *Glassmorphism*.

---

## ✨ Características Principales

- **Arquitectura de Microservicios:** 5 servicios de Node.js especializados y desacoplados (Gateway, Auth, Monitor, Scheduler, Notification).
- **Encolamiento de Trabajos Asíncronos:** Utiliza **BullMQ** y **Redis** para realizar chequeos de estado HTTP en segundo plano, siendo distribuidos, confiables y tolerantes a fallos.
- **Mapeo de Datos Relacionales:** Esquema de base de datos administrado mediante **Prisma ORM** mapeado hacia **PostgreSQL**.
- **Dashboard en Tiempo Real:** Una interfaz gráfica premium y minimalista construida con **Next.js** y **Tailwind CSS**.
- **Infraestructura Contenerizada:** Configuración del entorno local en un solo comando usando **Docker Compose** para bases de datos y capas de caché.

---

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado como un *monorepo* que contiene los siguientes servicios independientes:

1. **API Gateway (Puerto 3000):** El punto único de entrada para todas las solicitudes del cliente. Maneja el límite de peticiones (rate-limiting), registros básicos de logs, y enruta el tráfico hacia los microservicios correspondientes superiores.
2. **Auth Service (Puerto 3001):** Gestiona el registro de usuarios, la autenticación y la emisión de tokens JWT.
3. **Monitor Service (Puerto 3002):** Maneja las operaciones CRUD principales para los endpoints REST que registran los usuarios.
4. **Scheduler Service:** Opera como un *background worker*. Obtiene los endpoints activos y aprovecha **BullMQ (Redis)** para programar pruebas de ping HTTP, registrando la latencia y los códigos de estado.
5. **Notification Service:** Escucha los cambios de estado (por ejemplo, de `ONLINE` a `OFFLINE`) e imita el envío de alertas (Email, Webhooks de Slack).
6. **Frontend App (Puerto 3003):** El cliente de Next.js que presenta el Dashboard, la Línea de Tiempo de Incidentes y la Interfaz de Configuraciones.

---

## 💻 Stack Tecnológico

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router, React)
- **Estilos:** Tailwind CSS (Premium Glassmorphism y Micro-animaciones)
- **Fecheo de Datos:** Axios

### Backend
- **Entorno de Ejecución:** [Node.js](https://nodejs.org/) y [Express.js](https://expressjs.com/)
- **Arquitectura:** Microservicios y API Gateway (`http-proxy-middleware`)
- **Gestor de Colas (Task Queue):** [BullMQ](https://docs.bullmq.io/) y Redis
- **Base de Datos:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)

### DevOps / Infraestructura
- **Contenerización:** Docker y Docker Compose
- **Gestión de Procesos:** Concurrently (Script de desarrollo del Monorepo)

---

## 🚀 Empezando (Guía de Instalación)

Sigue estas instrucciones para ejecutar el proyecto en tu máquina local.

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) y Docker Compose
- [Git](https://git-scm.com/)

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/TuUsuario/api-sentinel.git
   cd api-sentinel
   ```

2. **Instala las dependencias:**
   *(Ejecuta esto en la raíz del proyecto para instalar los paquetes de todos los espacios de trabajo)*
   ```bash
   npm install
   ```

3. **Inicia la Infraestructura (Bases de Datos):**
   ```bash
   docker-compose up -d
   ```
   *(Esto iniciará PostgreSQL y Redis en segundo plano a través de contenedores).*

4. **Inicializa la Base de Datos:**
   Empuja el esquema de Prisma al contenedor de PostgreSQL que se está ejecutando.
   ```bash
   cd apps/auth-service
   npx prisma db push
   cd ../..
   ```

### Ejecutando la Aplicación

Para simplificar la experiencia de desarrollo, el monorepo incluye un script para ejecutar todos los servicios backend de manera concurrente.

1. **Inicia todos los Microservicios:**
   ```bash
   npm run dev:services
   ```
   *(Esto levanta paralelamente los servicios Gateway, Auth, Monitor, Scheduler y Notification).*

2. **Inicia el Frontend (Next.js):**
   Abre una nueva sesión de terminal en la raíz del proyecto y ejecuta:
   ```bash
   npm run start:frontend
   ```

3. **Accede a la Aplicación:**
   Abre tu navegador web y navega a `http://localhost:3003`. 
   La aplicación te redirigirá automáticamente a la vista del Dashboard.

---

## 📂 Estructura del Proyecto

```text
api-sentinel/
├── apps/
│   ├── api-gateway/         # Proxy inverso y limitador de requests
│   ├── auth-service/        # Autenticación, Usuarios y JWT
│   ├── frontend/            # Aplicación de Interfaz de Usuario en Next.js
│   ├── monitor-service/     # APIs CRUD de configuración de Endpoints
│   ├── notification-service/# Despachador de alertas y eventos
│   └── scheduler-service/   # Workers que ejecutan los Pings por HTTP en BullMQ
├── docker-compose.yml       # Configuración de toda la infraestructura
└── package.json             # Scripts y espacios de trabajo del Monorepo (Workspaces)
```

---

## 👨‍💻 ¿Por qué este proyecto demuestra capacidades de nivel Semi-Senior?

- **Diseño de Sistemas (System Design):** Diseñé un sistema distribuido en lugar de una aplicación monolítica MVC tradicional, mostrando un claro entendimiento de la separación de responsabilidades, escalado independiente y tolerancia a fallos en la red.
- **Procesamiento Asíncrono:** La implementación de BullMQ + Redis demuestra que puedo manejar tareas en segundo plano (background jobs) prolongadas o periódicas sin bloquear el hilo principal (event loop) de Node.js.
- **Diseño de Base de Datos:** Utilicé un ORM moderno (Prisma) junto con una base de datos relacional robusta (PostgreSQL) para modelar esquemas normalizados y relaciones de datos reales, más allá de simple almacenamiento NoSQL.
- **UX/UI Moderno:** El frontend no es solo funcional; incorpora tendencias de diseño modernas (Glassmorphism), manejo de estados de carga (loading states), manejo de errores y diseño altamente responsivo. Demuestra capacidad Full-Stack con gran énfasis visual.
- **Mentalidad DevOps (Contenerización):** Proveer la infraestructura encapsulada en Docker Compose demuestra preocupación por la experiencia de desarrollo general (DX) y facilita que cualquier miembro del equipo levante el ecosistema de inmediato.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
*Hecho para validar y demostrar habilidades de desarrollo avanzado Full-Stack.*
