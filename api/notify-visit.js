// api/notify-visit.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Configura CORS para Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const data = req.body;
        
        // Validación básica
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Datos inválidos' });
        }

        // 🔐 Configuración de Gmail desde variables de entorno
        // Configura esto en Vercel Dashboard -> Settings -> Environment Variables
        const GMAIL_USER = process.env.GMAIL_USER;
        const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
        
        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('❌ Faltan variables de entorno en Vercel');
            return res.status(500).json({ 
                error: 'Configuración del servidor incompleta',
                note: 'Configura GMAIL_USER y GMAIL_APP_PASSWORD en Vercel'
            });
        }

        // Configurar transporte de Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD
            }
        });

        // Obtener información del visitante
        const userAgent = data.userAgent || 'No disponible';
        const pageUrl = data.pageUrl || 'Portafolio principal';
        const referrer = data.referrer || 'Directo';
        
        // Crear contenido del email
        const mailOptions = {
            from: `"Portafolio Cristian Aguilera" <${GMAIL_USER}>`,
            to: GMAIL_USER, // Se envía a ti mismo
            replyTo: GMAIL_USER,
            subject: '🚀 ¡Nueva visita en tu portafolio!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                        .stat { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                        .label { color: #64748b; font-weight: 600; }
                        .value { color: #1e293b; font-weight: 700; }
                        .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">¡Nueva Visita Detectada!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Alguien está explorando tu portafolio profesional</p>
                    </div>
                    
                    <div class="content">
                        <p>Hola <strong>Cristian</strong>,</p>
                        <p>Se ha detectado una nueva visita en tu portafolio web.</p>
                        
                        <div class="info-box">
                            <h3 style="color: #4361ee; margin-top: 0;">📊 Detalles de la Visita</h3>
                            
                            <div class="stat">
                                <span class="label">📅 Fecha y Hora:</span>
                                <span class="value">${new Date().toLocaleString('es-VE', { 
                                    timeZone: 'America/Caracas',
                                    dateStyle: 'full',
                                    timeStyle: 'medium'
                                })}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">🌐 Página Visitada:</span>
                                <span class="value">${pageUrl}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">🔗 Procedencia:</span>
                                <span class="value">${referrer}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">💻 Navegador:</span>
                                <span class="value">${userAgent.substring(0, 80)}${userAgent.length > 80 ? '...' : ''}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">📱 Dispositivo:</span>
                                <span class="value">${data.platform || 'No detectado'}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">🗺️ Idioma:</span>
                                <span class="value">${data.language || 'No detectado'}</span>
                            </div>
                        </div>
                        
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="https://wa.me/584241222517" 
                               style="background: #25D366; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; 
                                      display: inline-block; font-weight: 600;">
                                📱 Contactar por WhatsApp
                            </a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Esta notificación fue generada automáticamente desde tu portafolio web</p>
                        <p>© ${new Date().getFullYear()} Cristian Aguilera - Desarrollador FullStack</p>
                    </div>
                </body>
                </html>
            `,
            text: `Nueva visita en tu portafolio:
            
📅 Fecha: ${new Date().toLocaleString('es-VE')}
🌐 Página: ${pageUrl}
🔗 Procedencia: ${referrer}
💻 Navegador: ${userAgent.substring(0, 100)}
📱 Dispositivo: ${data.platform || 'No detectado'}
🗺️ Idioma: ${data.language || 'No detectado'}

¡Sigue creando cosas increíbles!

Esta notificación fue generada automáticamente desde tu portafolio web.`
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado:', info.messageId);
        
        // Responder éxito al cliente
        res.status(200).json({
            success: true,
            message: 'Notificación enviada correctamente',
            timestamp: new Date().toISOString(),
            emailId: info.messageId
        });
        
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);
        
        // Respuesta de error detallada
        res.status(500).json({
            success: false,
            error: 'Error al enviar notificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            suggestion: 'Verifica las variables de entorno GMAIL_USER y GMAIL_APP_PASSWORD en Vercel'
        });
    }
};