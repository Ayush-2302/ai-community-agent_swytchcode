import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Replace this with your real public image URL
const IMAGE_URL = "https://backend-portfolio-aips.onrender.com/api/images/ayush/ayu.png"; 

// Reusable email header
const emailHeader = (title = "Ayush Kumar Portfolio") => `
  <div style="text-align: center;">
    <img src="${IMAGE_URL}" alt="Ayush Kumar" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" />
    <h2 style="color: #2c3e50; margin: 20px 0 10px;">${title}</h2>
  </div>
`;

// Reusable email footer
const emailFooter = () => `
  <hr style="margin: 30px 0;" />
  <footer style="text-align: center; font-size: 12px; color: #aaa;">
    View my work: 
    <a href="https://ayush07.netlify.app/" style="color: #3b82f6; text-decoration: none;">Portfolio</a> • 
    <a href="https://github.com/Ayush-2302" style="color: #3b82f6; text-decoration: none;">GitHub</a> • 
    <a href="https://www.linkedin.com/in/ayush-kumar-3b9798270/" style="color: #3b82f6; text-decoration: none;">LinkedIn</a>
  </footer>
`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

// Send email to customer
export const sendEmailToCostumer = async (email, name) => {
  const mailOptions = {
    from: "Ayush Kumar",
    to: email,
    subject: "Get You Soon!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        ${emailHeader()}
        <p>Dear ${name},</p>
        <p>I have received your message and will get back to you shortly.</p>
        <p>Thank you for reaching out!</p>
        <p>Best regards,</p>
        <p>Ayush Kumar</p>
        ${emailFooter()}
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully to:", email);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

// Send email to self
export const sendEmailToSelf = async (name, email, phone, message) => {
  const mailOptions = {
    from: name,
    to: "ayushkumarakt@gmail.com",
    subject: message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        ${emailHeader("Customer Inquiry")}
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${emailFooter()}
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent to self.");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

// Password reset
export const sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        ${emailHeader("Reset Your Password")}
        <p>To reset your password, click the link below:</p>
        <a href="${resetUrl}" style="color: #3b82f6;">Reset Password</a>
        ${emailFooter()}
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent to:", email);
  } catch (error) {
    console.error("Error sending reset email:", error.message);
  }
};

// Email verification
export const sendVerificationEmail = async (first_name, email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Verify Your Email – Ayush Kumar Portfolio",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        ${emailHeader()}
        <p>Hi ${first_name},</p>
        <p>Thank you for registering! Please verify your email by clicking the button below:</p>
        <div style="margin: 20px 0;">
          <a href="${url}" style="padding: 12px 24px; background-color: #22c55e; color: white; border-radius: 6px; text-decoration: none;">Verify Email</a>
        </div>
        <p>If you didn’t sign up, you can ignore this email.</p>
        ${emailFooter()}
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

// Send account password
export const sendPasswordEmail = async (name, to, password) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to,
    subject: "Your New Account Password – Ayush Kumar Portfolio",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        ${emailHeader()}
        <p>Hi ${name},</p>
        <p>Your account has been verified.</p>
        <p><strong>Temporary Password:</strong> 
          <span style="background-color: #f1f1f1; padding: 4px 10px; border-radius: 4px; font-family: monospace;">${password}</span>
        </p>
        <p>Please log in and change your password as soon as possible.</p>
        ${emailFooter()}
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password email sent to:", to);
  } catch (error) {
    console.error("Error sending password email:", error.message);
    throw new Error("Failed to send password email");
  }
};
