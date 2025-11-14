import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'kaushalkhadka789@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'iwej uyol qvzr szmu',
  },
});

// Verify transporter configuration (only log errors)
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  }
  // Success is silent - no need to log on every server restart
});

/**
 * Send welcome email to newly registered user
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Email sending result
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const homepageUrl = `${frontendUrl}/`;

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NepFund!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .content p {
            margin-bottom: 15px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to NepFund! 🎉</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for joining NepFund! We're thrilled to have you as part of our community dedicated to making a positive impact in Nepal.</p>
            <p>NepFund is a crowdfunding platform where you can:</p>
            <ul>
              <li>Support meaningful campaigns and causes</li>
              <li>Create your own fundraising campaigns</li>
              <li>Make a difference in your community</li>
              <li>Earn reward points for your contributions</li>
            </ul>
            <p>We're here to help you get started. If you have any questions or need assistance, please don't hesitate to reach out to us.</p>
            <p style="text-align: center;">
              <a href="${homepageUrl}" class="button">Visit NepFund</a>
            </p>
            <p>Once again, welcome aboard! We look forward to seeing the positive impact you'll make.</p>
            <p>Best regards,<br>The NepFund Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} NepFund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
      Welcome to NepFund!
      
      Dear ${name},
      
      Thank you for joining NepFund! We're thrilled to have you as part of our community dedicated to making a positive impact in Nepal.
      
      NepFund is a crowdfunding platform where you can:
      - Support meaningful campaigns and causes
      - Create your own fundraising campaigns
      - Make a difference in your community
      - Earn reward points for your contributions
      
      We're here to help you get started. If you have any questions or need assistance, please don't hesitate to reach out to us.
      
      Visit NepFund: ${homepageUrl}
      
      Once again, welcome aboard! We look forward to seeing the positive impact you'll make.
      
      Best regards,
      The NepFund Team
      
      ---
      This is an automated email. Please do not reply to this message.
      © ${new Date().getFullYear()} NepFund. All rights reserved.
    `;

    // Email options
    const mailOptions = {
      from: `"NepFund" <${process.env.SMTP_USER || 'kaushalkhadka789@gmail.com'}>`,
      to: email,
      subject: 'Welcome to NepFund!',
      text: textContent,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // Email sent successfully (logged only in development for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Welcome email sent to:', email);
    }
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

/**
 * Generic email sending function (for future use)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<Object>} - Email sending result
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"NepFund" <${process.env.SMTP_USER || 'kaushalkhadka789@gmail.com'}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    };

    const info = await transporter.sendMail(mailOptions);
    // Email sent successfully (logged only in development for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Email sent to:', to);
    }
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendWelcomeEmail,
  sendEmail,
};

