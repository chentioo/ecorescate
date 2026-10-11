import { Order } from "@/types";

/**
 * Formatea un mensaje de WhatsApp limpio, profesional y detallado con los datos del pedido.
 */
export function formatWhatsAppOrderMessage(order: Partial<Order> & { id: string }): string {
  const code = order.orderCode || `ECO-${order.id.slice(-4)}`;
  const restaurant = order.restaurantName || "Restaurante Aliado";
  const pack = order.packName || "Pack Sorpresa";
  const quantity = order.quantity || 1;
  const total = order.totalPrice ? `S/ ${order.totalPrice.toFixed(2)}` : "S/ 14.90";
  const saved = order.moneySaved ? `S/ ${order.moneySaved.toFixed(2)}` : "S/ 20.00";
  const co2 = order.co2SavedKg ? `${order.co2SavedKg} kg` : "2.5 kg";
  const time = order.pickupTime || "Hoy, 20:00 - 21:30";
  const address = order.restaurantAddress || "Lima, Perú";
  const bringTaper = order.bringOwnContainer ? "✅ *Sí, el cliente lleva su propio táper 🌱*" : "❌ *No lleva táper (embalaje del local)*";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Lima")}`;

  const message = `🌱 *ECORESCATE PERÚ - COMPROBANTE DE RESERVA* 🌱
─────────────────────────────
¡Hola! Tu reserva ha sido confirmada con éxito.

🔖 *Código de Recojo:* \`${code}\`
🏪 *Local:* ${restaurant}
🍱 *Pack:* ${pack} (${quantity} unidad${quantity > 1 ? "es" : ""})
⏰ *Horario de Recojo:* ${time}
📍 *Dirección:* ${address}

💰 *Total Pagado:* ${total}
🎉 *Ahorraste:* ${saved}
🌍 *Impacto Ambiental:* ${co2} de CO2 evitado
♻️ *Táper Ecológico:* ${bringTaper}

🗺️ *Cómo llegar:* ${mapsUrl}
─────────────────────────────
⚠️ *Importante:* Muestra tu código \`${code}\` en la caja o barra del restaurante para recibir tu comida fresca. ¡Gracias por salvar comida del desperdicio! 🌎✨`;

  return message;
}

/**
 * Genera el enlace de WhatsApp listo para abrir o compartir
 */
export function getWhatsAppShareUrl(order: Partial<Order> & { id: string }, phoneNumber?: string): string {
  const text = encodeURIComponent(formatWhatsAppOrderMessage(order));
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

/**
 * Genera el template HTML del comprobante por correo electrónico
 */
export function generateOrderEmailHtml(order: Partial<Order> & { id: string }, customerName: string): string {
  const code = order.orderCode || `ECO-${order.id.slice(-4)}`;
  const restaurant = order.restaurantName || "Restaurante Aliado";
  const pack = order.packName || "Pack Sorpresa";
  const quantity = order.quantity || 1;
  const total = order.totalPrice ? `S/ ${order.totalPrice.toFixed(2)}` : "S/ 14.90";
  const saved = order.moneySaved ? `S/ ${order.moneySaved.toFixed(2)}` : "S/ 20.00";
  const co2 = order.co2SavedKg ? `${order.co2SavedKg} kg` : "2.5 kg";
  const time = order.pickupTime || "Hoy, 20:00 - 21:30";
  const address = order.restaurantAddress || "Lima, Perú";
  const dateStr = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Confirmada - EcoRescate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 30px; text-align: center; color: white; }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
    .title { font-size: 26px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { font-size: 14px; opacity: 0.9; margin: 0; }
    .content { padding: 32px 28px; }
    .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 24px; }
    .code-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; }
    .code-value { font-size: 28px; font-weight: 900; color: #16a34a; letter-spacing: 2px; font-family: monospace; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 20px 0 10px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-val { font-weight: 700; color: #0f172a; text-align: right; }
    .impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
    .impact-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 14px; text-align: center; }
    .impact-box.gold { background: #fffbeb; border-color: #fde68a; }
    .impact-box-val { font-size: 18px; font-weight: 900; color: #166534; }
    .impact-box.gold .impact-box-val { color: #92400e; }
    .impact-box-lbl { font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; }
    .impact-box.gold .impact-box-lbl { color: #b45309; }
    .taper-alert { background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #065f46; margin: 20px 0; }
    .btn { display: block; text-align: center; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: 700; font-size: 15px; margin-top: 24px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">🌱 EcoRescate Perú</div>
      <h1 class="title">¡Reserva Confirmada!</h1>
      <p class="subtitle">Hola ${customerName}, tu comida fresca te espera para ser rescatada.</p>
    </div>
    
    <div class="content">
      <div class="code-box">
        <div class="code-label">Código de Recojo</div>
        <div class="code-value">${code}</div>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">Muestra este código al llegar al local</p>
      </div>

      <div class="impact-grid">
        <div class="impact-box">
          <div class="impact-box-val">${co2}</div>
          <div class="impact-box-lbl">CO2 Evitado</div>
        </div>
        <div class="impact-box gold">
          <div class="impact-box-val">${saved}</div>
          <div class="impact-box-lbl">Dinero Ahorrado</div>
        </div>
      </div>

      <div class="section-title">Detalles del Pedido</div>
      <div class="info-row">
        <span class="info-label">Restaurante:</span>
        <span class="info-val">${restaurant}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pack Sorpresa:</span>
        <span class="info-val">${pack} (${quantity}x)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Horario de Recojo:</span>
        <span class="info-val" style="color: #16a34a;">${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dirección:</span>
        <span class="info-val">${address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha:</span>
        <span class="info-val" style="text-transform: capitalize;">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Pagado:</span>
        <span class="info-val" style="font-size: 16px; color: #16a34a;">${total}</span>
      </div>

      ${order.bringOwnContainer ? `
      <div class="taper-alert">
        🌱 <strong>¡Recordatorio Verde!</strong> Marcaste que llevarás tu propio táper ecológico. ¡Gracias por ayudarnos a reducir plástico!
      </div>
      ` : ''}

      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Lima")}" class="btn">
        📍 Ver Ruta en Google Maps
      </a>
    </div>

    <div class="footer">
      EcoRescate Perú • Ayudando al planeta plato a plato 🌱<br>
      Miraflores, Lima • Soporte: ayuda@ecorescate.pe
    </div>
  </div>
</body>
</html>
  `.trim();
}
