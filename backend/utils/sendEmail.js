import nodemailer from 'nodemailer';

// Lazy-loaded transporter - only created when needed
let transporter = null;

/**
 * Get or create the SMTP transporter
 */
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP_USER and SMTP_PASSWORD environment variables are required for sending emails');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify transporter configuration
    transporter.verify((error) => {
      if (error) {
        console.error('SMTP configuration error:', error.message);
      } else if (process.env.NODE_ENV === 'development') {
        console.log('✓ SMTP transporter verified successfully');
      }
    });
  }

  return transporter;
};

/**
 * Send welcome email to newly registered user
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const homepageUrl = `${frontendUrl}/`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; text-align: center;">Welcome to NepFund! 🎉</h1>
          <p>Dear ${name},</p>
          <p>Thank you for joining NepFund! We're thrilled to have you as part of our community dedicated to making a positive impact in Nepal.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${homepageUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit NepFund</a>
          </div>
          <p>Best regards,<br>The NepFund Team</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"NepFund" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to NepFund!',
      html: htmlContent,
    };

    const info = await getTransporter().sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

/**
 * Send donation receipt email with PDF attachment
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {Buffer} pdfBuffer - The PDF Buffer from receiptGenerator.js
 */
export const sendDonationReceiptEmail = async (email, name, pdfBuffer) => {
  try {
    const mailOptions = {
      from: `"NepFund Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Donation Receipt - NepFund',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
            <h2 style="color: #4f46e5; margin-top: 0;">Thank You for Your Kindness!</h2>
            <p>Dear ${name},</p>
            <p>We have successfully received your donation. Your support helps us drive real impact in our communities.</p>
            <p><strong>Please find your official donation receipt attached to this email as a PDF.</strong></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 14px; color: #666;">If you have any questions regarding this transaction, feel free to contact our support team.</p>
            <p>With gratitude,<br/><strong>The NepFund Team</strong></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Donation_Receipt_${new Date().getTime()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await getTransporter().sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Receipt email sent successfully to:', email);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    // Returning success: false instead of throwing so the main payment logic isn't broken
    return { success: false, error: error.message };
  }
};

/**
 * Generic email sending function
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"NepFund" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    };

    const info = await getTransporter().sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendWelcomeEmail,
  sendDonationReceiptEmail,
  sendEmail,
};