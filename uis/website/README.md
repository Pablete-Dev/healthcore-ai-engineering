# Hito 1 — Sitio web publico HealthCore

## Objetivo
Implementar el primer punto de contacto digital de HealthCore con una landing publica y un formulario de consulta para pacientes, sin backend ni confirmacion real de citas.

## Alcance
- Landing Page publica.
- Formulario de consulta/aplicacion para pacientes.
- Validaciones completas en JavaScript Vanilla.
- Version completa en ingles y espanol.
- Diseno responsive mobile-first con Tailwind CSS.
- Accesibilidad base requerida para evaluacion.
- SEO tecnico con Schema.org en JSON-LD.

## Estructura
- `index.html`
- `index.es.html`
- `application.html`
- `application.es.html`
- `validation.js`
- `README.md`

## Landing
La landing incluye:
- Header con marca HealthCore, navegacion y selector EN | ES.
- Hero con CTA al formulario.
- Seccion de servicios (3 grupos requeridos).
- Seccion Por que HealthCore con beneficios clave.
- Seccion de ubicaciones de EE. UU. (6 clinicas).
- Seccion de contacto.
- Footer con redes y copyright.

## Formulario
El formulario implementa todos los campos y atributos `name` solicitados:
- `first_name`, `last_name`, `date_of_birth`, `email`, `phone`.
- `preferred_language`, `preferred_clinic`, `preferred_date`, `preferred_time`, `service_type`.
- `new_patient`, `has_insurance`, `insurance_provider`, `insurance_member_id`.
- `health_concern`, `contact_consent`, `patient_id` (condicional).

Adicionalmente:
- Texto visible para proveedores en `partnerships@healthcore.com`.
- Boton de envio y boton de limpieza.
- Mensaje de exito de solicitud de consulta (sin confirmar cita).

### Formulario progresivo de 4 pasos
Para reducir carga cognitiva y mejorar la experiencia sin eliminar datos del contexto, el formulario se organizo como wizard de un unico `<form>`:

1. Datos personales.
2. Preferencias de consulta.
3. Informacion del paciente.
4. Motivo y confirmacion.

Comportamiento UX del wizard:
- Indicador de progreso accesible (paso actual, nombre del paso y barra).
- Navegacion con botones Continuar/Atras manteniendo valores.
- Validacion por paso antes de avanzar.
- Progressive disclosure en campos condicionales (`patient_id` y datos de seguro).
- Validacion completa al enviar en el ultimo paso.

## Validaciones
Validaciones implementadas en `validation.js`:
- Nombre y apellido: 2-50, solo letras, con acentos/tilde/diacriticos permitidos (incluye n/ñ y u/ü).
- Fecha de nacimiento: no futura y edad entre 0 y 120.
- Email con formato valido.
- Telefono internacional iniciando por `+` y codigo de pais.
- Fecha preferida: minimo proximo dia habil y maximo 60 dias.
- Regla Paediatric Care: paciente menor de 18.
- Seguro: si `has_insurance = Yes`, `insurance_provider` e `insurance_member_id` son obligatorios con sus reglas.
- Paciente recurrente: muestra `patient_id` cuando `new_patient = No`; si se completa, valida `HC-` + 6 alfanumericos.
- Consulta medica (`health_concern`): 20-500 y contador en tiempo real.
- Consentimiento obligatorio antes de enviar.
- Advertencia no bloqueante para combinaciones Evening + clinica con disponibilidad limitada.

## Idiomas
Se usa estrategia de archivos separados para auditoria clara:
- Ingles: `index.html`, `application.html`
- Espanol: `index.es.html`, `application.es.html`

El selector EN | ES conecta ambas versiones de landing y formulario.

## Accesibilidad
Medidas aplicadas:
- Estructura semantica con `header`, `nav`, `main`, `section`, `article`, `footer`.
- Navegacion por teclado y estados de foco visibles.
- Labels asociados con `for`/`id`.
- `fieldset` y `legend` en grupos de radio.
- `aria-invalid`, `aria-describedby` y `aria-live` para errores/estados dinamicos.
- Enlace de salto a contenido principal.

## SEO
Se implementa Schema.org en landing (JSON-LD):
- Entidad `MedicalOrganization` para HealthCore.
- Seis entidades `MedicalClinic` para clinicas de EE. UU. con `name`, `telephone`, `openingHours`, `parentOrganization`.

## Ejecucion
Desde la carpeta `uis/website`:

```bash
npx http-server . -p 3000 -a 0.0.0.0
```

## Pruebas
Verificacion manual realizada:
- Navegacion y enlaces entre landing/formulario EN/ES.
- Responsive en mobile/tablet/desktop.
- Reglas de validacion individuales y cruzadas.
- Mensajes de error especificos y mensaje de exito.
- Reset completo de estados, errores, warnings y campos condicionales.
- Warning Evening no bloqueante.
- Presencia de JSON-LD en ambas landing.

## Fuera de alcance
No implementado en este hito:
- backend
- API
- base de datos
- autenticacion
- almacenamiento de pacientes
- reservas reales
- automatizaciones
- IA
- dashboards
- funcionalidades de hitos futuros
