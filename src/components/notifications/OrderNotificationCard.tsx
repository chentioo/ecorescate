"use client";

import { useState } from "react";
import { 
  MessageCircle, 
  Mail, 
  Bell, 
  Copy, 
  Check, 
  Send, 
  Eye, 
  X, 
  Loader2, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  Smartphone
} from "lucide-react";
import { Order } from "@/types";
import { getWhatsAppShareUrl, formatWhatsAppOrderMessage } from "@/lib/notifications";
import { useAuth } from "@/components/auth/AuthProvider";

interface OrderNotificationCardProps {
  order: Partial<Order> & { id: string };
}

export function OrderNotificationCard({ order }: OrderNotificationCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Estados para Correo Electrónico
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(order.userEmail || user?.email || "");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentData, setEmailSentData] = useState<{
    success: boolean;
    message: string;
    emailHtml?: string;
    deliveryStatus?: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Estados para Recordatorio / Alerta Web
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // 1. Copiar comprobante al portapapeles
  const handleCopyText = async () => {
    try {
      const text = formatWhatsAppOrderMessage(order);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Error al copiar texto:", e);
    }
  };

  // 2. Abrir WhatsApp
  const handleOpenWhatsApp = () => {
    const url = getWhatsAppShareUrl(order);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 3. Enviar Comprobante por Correo
  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recipientEmail.trim()) return;

    setSendingEmail(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          email: recipientEmail.trim(),
          customerName: order.userName || user?.displayName || recipientEmail.split("@")[0],
          type: "order_created",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailSentData(data);
      } else {
        setEmailSentData({
          success: false,
          message: data.error || "No se pudo enviar el correo.",
        });
      }
    } catch (err: any) {
      setEmailSentData({
        success: false,
        message: err.message || "Error al conectar con el servicio de correo.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // 4. Activar Alerta de Recojo en el Navegador
  const handleToggleReminder = async () => {
    if (reminderActive) {
      setReminderActive(false);
      setReminderMessage(null);
      return;
    }

    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setReminderActive(true);
          setReminderMessage(`¡Alerta activada! Te notificaremos antes de tu recojo (${order.pickupTime || "en tu horario"}).`);
          
          // Notificación inmediata de prueba
          new Notification("🌱 EcoRescate: Alerta Programada", {
            body: `Tu pedido ${order.orderCode || "ECO"} en ${order.restaurantName || "el local"} está listo para recojo en ${order.pickupTime || "el horario pactado"}.`,
            icon: "/logos/LaluchaLogo.jpg",
          });
        } else {
          setReminderActive(true);
          setReminderMessage(`¡Alerta guardada en EcoRescate! Te avisaremos cuando se acerque el horario.`);
        }
      } catch (e) {
        setReminderActive(true);
        setReminderMessage(`¡Alerta guardada en EcoRescate!`);
      }
    } else {
      setReminderActive(true);
      setReminderMessage(`¡Alerta programada en EcoRescate!`);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-600 p-1.5 rounded-lg">
            <Share2 className="size-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Comprobante & Alertas
          </span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          En vivo
        </span>
      </div>

      {/* Botones de Notificación en Cuadrícula */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Botón WhatsApp */}
        <button
          onClick={handleOpenWhatsApp}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm hover:shadow text-xs group"
          title="Abrir comprobante en WhatsApp"
        >
          <Smartphone className="size-4 group-hover:scale-110 transition-transform" />
          <span>Enviar a WhatsApp</span>
        </button>

        {/* Botón Correo Electrónico */}
        <button
          onClick={() => setEmailOpen(!emailOpen)}
          className={`flex items-center justify-center gap-2 border font-bold py-2.5 px-3 rounded-xl transition-all text-xs ${
            emailOpen
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
          }`}
        >
          <Mail className="size-4 text-emerald-600" />
          <span>{emailSentData?.success ? "Correo Enviado ✓" : "Comprobante Email"}</span>
        </button>
      </div>

      {/* Botón Secundario: Copiar Texto o Activar Campana */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
        <button
          onClick={handleCopyText}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span className="text-emerald-700">¡Copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-slate-400" />
              <span>Copiar resumen en texto</span>
            </>
          )}
        </button>

        <button
          onClick={handleToggleReminder}
          className={`inline-flex items-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-lg transition-colors ${
            reminderActive
              ? "text-amber-700 bg-amber-50 border border-amber-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white"
          }`}
        >
          <Bell className={`size-3.5 ${reminderActive ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
          <span>{reminderActive ? "Alerta Activa" : "Recordarme"}</span>
        </button>
      </div>

      {/* Banner de Confirmación de Recordatorio */}
      {reminderMessage && (
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
          <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="leading-snug">{reminderMessage}</span>
        </div>
      )}

      {/* Desplegable de Envío de Correo */}
      {emailOpen && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-inner space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Enviar Comprobante por Correo
            </span>
            <button 
              onClick={() => setEmailOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="flex gap-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              required
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={sendingEmail}
              className="bg-primary hover:bg-leaf-deep text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </form>

          {/* Resultado del Envío de Correo */}
          {emailSentData && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
              emailSentData.success 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <div className="flex items-center gap-1.5">
                {emailSentData.success ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="size-4 text-red-600 shrink-0" />
                )}
                <span>{emailSentData.message}</span>
              </div>

              {emailSentData.emailHtml && (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1 bg-white hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded border border-emerald-200 text-[10px] shrink-0 transition-colors"
                >
                  <Eye className="size-3" />
                  <span>Ver Correo</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Previsualización del Correo Electrónico Recibido */}
      {previewOpen && emailSentData?.emailHtml && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Cabecera del Modal */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-400" />
                <span className="font-bold text-sm">Vista Previa: Correo Entregado</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {emailSentData.deliveryStatus === "sent" ? "Enviado con Resend" : "Simulación Exitosa"}
                </span>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Metadatos del Inbox simulado */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-600 space-y-1">
              <div><strong>De:</strong> EcoRescate Perú &lt;pedidos@ecorescate.pe&gt;</div>
              <div><strong>Para:</strong> {recipientEmail}</div>
              <div><strong>Asunto:</strong> 🌱 ¡Reserva Confirmada [{order.orderCode || "ECO"}]! Tu comida te espera en {order.restaurantName || "el local"}</div>
            </div>

            {/* Cuerpo del Correo en iFrame */}
            <div className="flex-1 overflow-auto bg-slate-100 p-2">
              <iframe
                title="Email Preview"
                srcDoc={emailSentData.emailHtml}
                className="w-full h-[450px] bg-white rounded-xl border border-slate-200"
              />
            </div>

            {/* Pie del Modal */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
