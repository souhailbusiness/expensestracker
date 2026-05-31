'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('Message sent successfully! We will respond within 24-48 hours.');
        setFormData({ name: '', email: '', subject: 'general', message: '' });
      } else {
        setSubmitStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('An error occurred. Please try again later.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1F5FD,white_55%)] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 pt-24">
        <div className="rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Have a question, feedback, or a feature suggestion? We would love to hear from you! The ExpensesTracker team is dedicated to building the best possible experience for our users, and your insights help us improve every single day.
          </p>

          <div className="mt-8 space-y-2">
            <p className="text-slate-600">
              <strong className="text-slate-900">Support & Partnership Inquiries:</strong>{' '}
              <a href="mailto:support@expensestracker.com" className="text-indigo-600 hover:text-indigo-700">
                support@expensestracker.com
              </a>
            </p>
            <p className="text-slate-600">
              <strong className="text-slate-900">Response Time:</strong> We typically respond to all inquiries within 24 to 48 business hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                rows={6}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {submitStatus && (
              <div className={`rounded-lg p-4 text-sm font-semibold ${
                submitStatus.includes('successfully')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3 rounded-lg"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
