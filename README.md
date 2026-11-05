# 🎬 WellFair Movies App

Aplicación web Full Stack para la exploración, búsqueda y gestión de películas consumiendo la API v3 de **The Movie Database (TMDB)**. Diseñada bajo una arquitectura **Backend Proxy (BFF - Backend For Frontend)** para proteger credenciales y resolver lógica de fallbacks multilingües.

---

## 📋 Tabla de Contenidos
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración de Credenciales de TMDB](#-configuración-de-credenciales-de-tmdb)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Características Implementadas](#-características-implementadas)
- [Arquitectura y Decisiones Técnicas](#-arquitectura-y-decisiones-técnicas)

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Angular 17+ (Standalone Components):** Componentes modernos sin `NgModules`.
- **RxJS:** Programación reactiva (`Subject`, `debounceTime`, `distinctUntilChanged`, `forkJoin`).
- **Bootstrap 5 & Bootstrap Icons:** Diseño responsive, grid adaptable y modales interactivos.
- **TypeScript:** Tipado estricto e interfaces estructuradas (`Movie`, `Genre`, `Review`, `TMDBResponse`).

### **Backend**
- **Java 17 / Spring Boot 3:** Servidor proxy para ocultar y proteger la API Key de TMDB.
- **Spring RestClient:** Cliente HTTP sincrónico moderno (Spring 6+) para consumo REST.
- **Maven:** Gestión y construcción de dependencias Java.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (v18.x o superior) y **npm**
- **Java JDK** (v17 o superior)
- **Git**

---

## 🔑 Configuración de Credenciales de TMDB

1. Registra una cuenta de desarrollador en [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Dirígete a **Ajustes > API** y solicita una **API Read Access Token (v4 Bearer Token)**.
3. Abre el archivo de configuración del backend en:
   `backend/movies-backend/src/main/resources/application.properties`
4. Añade tu token en la propiedad correspondiente:

```properties
server.port=8080
tmdb.api.url=[https://api.themoviedb.org/3](https://api.themoviedb.org/3)
tmdb.api.token=TU_BEARER_TOKEN_AQUI