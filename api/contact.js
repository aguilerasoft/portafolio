// api/contact.js
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
        const { name, email, phone, message } = req.body;

        // Validación básica
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Email y Mensaje)' });
        }

        // 🔐 Configuración de Gmail desde variables de entorno
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

        // Crear contenido del email
        const mailOptions = {
            from: `"Contacto Portafolio" <${GMAIL_USER}>`,
            to: GMAIL_USER, // Se envía a ti mismo
            replyTo: email, // Permite responder directamente al cliente
            subject: `📥 ¡Nuevo mensaje de contacto de ${name}!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                        .header { background: linear-gradient(135deg, #4361ee, #00f0ff); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                        .stat { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                        .label { color: #64748b; font-weight: 600; width: 120px; flex-shrink: 0; }
                        .value { color: #1e293b; font-weight: 700; text-align: right; word-break: break-all; }
                        .message-box { background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #4361ee; margin-top: 15px; white-space: pre-wrap; font-family: inherit; }
                        .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">📥 Nuevo Mensaje Recibido</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Alguien quiere trabajar contigo o tiene una consulta</p>
                    </div>
                    
                    <div class="content">
                        <p>Hola <strong>Cristian</strong>,</p>
                        <p>Has recibido un nuevo mensaje a través del formulario de contacto de tu portafolio:</p>
                        
                        <div class="info-box">
                            <h3 style="color: #4361ee; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">📋 Datos del Remitente</h3>
                            
                            <div class="stat">
                                <span class="label">👤 Nombre:</span>
                                <span class="value">${name}</span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">📧 Email:</span>
                                <span class="value"><a href="mailto:${email}">${email}</a></span>
                            </div>
                            
                            <div class="stat">
                                <span class="label">📱 Teléfono:</span>
                                <span class="value">${phone || 'No especificado'}</span>
                            </div>

                            <div class="stat">
                                <span class="label">📅 Fecha:</span>
                                <span class="value">${new Date().toLocaleString('es-VE', { 
                                    timeZone: 'America/Caracas',
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}</span>
                            </div>
                        </div>

                        <h3 style="color: #4361ee; margin-bottom: 5px;">💬 Mensaje:</h3>
                        <div class="message-box">${message}</div>
                        
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${email}?subject=Re: Mensaje desde mi portafolio" 
                               style="background: #4361ee; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; 
                                      display: inline-block; font-weight: 600; box-shadow: 0 4px 10px rgba(67, 97, 238, 0.2);">
                                ✉️ Responder por Email
                            </a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Esta consulta fue enviada automáticamente desde tu portafolio web</p>
                        <p>© ${new Date().getFullYear()} Cristian Aguilera - Desarrollador FullStack</p>
                    </div>
                </body>
                </html>
            `,
            text: `Nuevo mensaje de contacto de ${name} (${email}):
            
👤 Nombre: ${name}
📧 Email: ${email}
📱 Teléfono: ${phone || 'No especificado'}
📅 Fecha: ${new Date().toLocaleString('es-VE')}

Mensaje:
----------------------------------------
${message}
----------------------------------------

Para responder, envía un correo a: ${email}
            `
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Mensaje enviado:', info.messageId);
        
        res.status(200).json({
            success: true,
            message: 'Mensaje enviado correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error enviando mensaje de contacto:', error);
        
        res.status(500).json({
            success: false,
            error: 'Error al enviar el mensaje de contacto',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
