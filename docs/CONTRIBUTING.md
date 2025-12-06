# 🤝 Guía de Contribución - Bazar Abem

¡Gracias por tu interés en contribuir a Bazar Abem! Esta guía te ayudará a empezar.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Proceso de Desarrollo](#proceso-de-desarrollo)
5. [Estándares de Código](#estándares-de-código)
6. [Commits y Pull Requests](#commits-y-pull-requests)
7. [Reportar Bugs](#reportar-bugs)
8. [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código:

- Sé respetuoso y considerado
- Acepta críticas constructivas
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros

---

## 🎯 ¿Cómo puedo contribuir?

### Reportar Bugs
- Usa el sistema de issues de GitHub
- Describe el bug claramente
- Incluye pasos para reproducirlo
- Menciona tu entorno (OS, Node version, etc.)

### Sugerir Mejoras
- Abre un issue con la etiqueta "enhancement"
- Describe la funcionalidad deseada
- Explica por qué sería útil
- Proporciona ejemplos si es posible

### Contribuir Código
- Corregir bugs
- Implementar nuevas funcionalidades
- Mejorar documentación
- Optimizar rendimiento
- Agregar tests

### Mejorar Documentación
- Corregir errores tipográficos
- Aclarar instrucciones confusas
- Agregar ejemplos
- Traducir a otros idiomas

---

## 🛠️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/bazar-abem-react.git
cd bazar-abem-react

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/ORIGINAL/bazar-abem-react.git
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE bazar_abem_dev;
EXIT;

# Configurar .env
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Ejecutar migraciones
cd backend
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Iniciar en Modo Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔄 Proceso de Desarrollo

### 1. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama para tu feature/fix
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 2. Hacer Cambios

- Escribe código limpio y legible
- Sigue los estándares de código
- Agrega comentarios cuando sea necesario
- Actualiza la documentación si es relevante

### 3. Probar Cambios

```bash
# Backend
cd backend
npm run build  # Verificar que compila
npm run dev    # Probar funcionalmente

# Frontend
cd frontend
npm run build  # Verificar que compila
npm run dev    # Probar funcionalmente
```

### 4. Commit y Push

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar funcionalidad X"

# Push a tu fork
git push origin feature/nombre-descriptivo
```

### 5. Crear Pull Request

- Ve a GitHub y crea un Pull Request
- Describe los cambios realizados
- Referencia issues relacionados
- Espera revisión y feedback

---

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Bueno
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

const obtenerUsuario = async (id: number): Promise<Usuario> => {
  // Implementación
};

// ❌ Malo
const obtenerUsuario = async (id: any) => {
  // Sin tipos
};
```

### React Components

```typescript
// ✅ Bueno
interface Props {
  titulo: string;
  onClose: () => void;
}

const Modal: React.FC<Props> = ({ titulo, onClose }) => {
  return (
    <div className="modal">
      <h2>{titulo}</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

// ❌ Malo
const Modal = (props: any) => {
  return <div>{props.titulo}</div>;
};
```

### Naming Conventions

```typescript
// Variables y funciones: camelCase
const nombreUsuario = "Juan";
const obtenerDatos = () => {};

// Componentes y Clases: PascalCase
class Usuario {}
const MiComponente = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_URL = "http://localhost:3000";
const MAX_INTENTOS = 3;

// Archivos:
// - Componentes: PascalCase.tsx
// - Utilidades: camelCase.ts
// - Tipos: camelCase.ts o index.ts
```

### Imports

```typescript
// ✅ Bueno - Ordenado y agrupado
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/common';
import { useAuth } from '@/hooks';
import { formatDate } from '@/utils';

import type { Usuario } from '@/types';

// ❌ Malo - Desordenado
import { formatDate } from '@/utils';
import React from 'react';
import type { Usuario } from '@/types';
import { Button } from '@/components/common';
```

### Comentarios

```typescript
// ✅ Bueno - Comentarios útiles
/**
 * Calcula el total de una venta incluyendo impuestos
 * @param subtotal - Subtotal sin impuestos
 * @param tasaImpuesto - Tasa de impuesto (0.18 para 18%)
 * @returns Total con impuestos incluidos
 */
const calcularTotal = (subtotal: number, tasaImpuesto: number): number => {
  return subtotal * (1 + tasaImpuesto);
};

// ❌ Malo - Comentarios obvios
// Esta función suma dos números
const sumar = (a: number, b: number) => a + b;
```

---

## 📦 Commits y Pull Requests

### Formato de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de rendimiento
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
feat(ventas): agregar filtro por método de pago
fix(auth): corregir validación de token expirado
docs(readme): actualizar instrucciones de instalación
style(dashboard): mejorar espaciado de cards
refactor(api): simplificar lógica de reportes
perf(db): agregar índice a tabla de ventas
test(auth): agregar tests para login
chore(deps): actualizar dependencias
```

### Pull Requests

**Título:**
```
[Tipo] Descripción breve
```

**Descripción:**
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He probado que funciona correctamente
```

---

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug

**Para Reproducir**
Pasos para reproducir:
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
Descripción de lo que esperabas que sucediera

**Screenshots**
Si aplica, agrega screenshots

**Entorno:**
 - OS: [e.g. Windows 10]
 - Node: [e.g. 18.0.0]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante
```

---

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda

**Describe alternativas que has considerado**
Otras soluciones o funcionalidades que consideraste

**Contexto Adicional**
Cualquier otra información, screenshots, etc.
```

---

## 🧪 Testing

### Escribir Tests

```typescript
// Ejemplo de test para backend
describe('AuthController', () => {
  it('debe autenticar usuario con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

// Ejemplo de test para frontend
describe('LoginPage', () => {
  it('debe mostrar formulario de login', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});
```

---

## 📚 Recursos Útiles

### Documentación
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Herramientas
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [Prisma Studio](https://www.prisma.io/studio)

---

## ❓ Preguntas

Si tienes preguntas:
1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta "question"

---

## 🎉 ¡Gracias por Contribuir!

Cada contribución, grande o pequeña, es valiosa. ¡Gracias por ayudar a mejorar Bazar Abem!

---

**Última actualización**: Diciembre 2024
