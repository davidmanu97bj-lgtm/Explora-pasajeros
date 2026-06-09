EXPLORA PWA - tarjeta final de captura + WhatsApp guardado local

Cambios incluidos:
- El botón final de presupuesto mantiene el flujo con Guardar.
- Al tocar Guardar se abre directamente la tarjeta elegante final con tus datos.
- La tarjeta indica que el pasajero puede tomar una captura de pantalla.
- Debajo de la tarjeta aparecen solo dos opciones: Salir y Enviar a WhatsApp.
- Enviar a WhatsApp pide país + número, guarda el presupuesto completo en localStorage y NO abre WhatsApp automáticamente.
- Se reemplazó el texto “presupuesto guardado en esta tablet” por un modal elegante “Guardado exitosamente” con botón Aceptar.
- Se mantiene el presupuesto guardado con idioma, moneda, alojamiento, servicios, descuentos, total efectivo, total tarjeta y WhatsApp.
- Se mantiene la corrección de combos Brasil: Parque das Aves / Aquafoz con Parque Nacional do Iguaçu muestran Combo Brasil, precio anterior tachado y descuento aplicado.
- Service Worker actualizado para forzar nueva caché.

Subir/reemplazar TODOS estos archivos en GitHub Pages:
- index.html
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png

- Patch final: el botón Guardar presupuesto abre directamente la tarjeta elegante final; incluye Salir / Enviar a WhatsApp y ajuste automático para una sola captura.

Actualización:
- Al guardar el WhatsApp y aceptar “Guardado exitosamente”, vuelve al login.
- El botón Salir de la tarjeta final vuelve al login.
