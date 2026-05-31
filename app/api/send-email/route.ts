import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const subjectMap: { [key: string]: string } = {
      general: 'General Inquiry',
      technical: 'Technical Support',
      feature: 'Feature Request',
      billing: 'Billing',
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'i79916475@gmail.com',
      subject: `ExpensesTracker Contact: ${subjectMap[subject] || subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subjectMap[subject] || subject}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #4f46e5;">
              <strong>Message:</strong>
              <p style="white-space: pre-wrap; color: #374151;">${message}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
              This email was sent from the ExpensesTracker contact form.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[send-email] error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
