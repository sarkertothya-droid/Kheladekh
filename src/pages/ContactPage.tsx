import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export const ContactPage: React.FC = () => {
  const { submitContactMessage, settings } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Contact Us</h1>
        <p className="text-sm text-[#A5B1C2] mt-1">
          Questions about fixtures, partnerships, or support? Reach out at{' '}
          <span className="text-white">{settings.contactEmail}</span> or use the form below.
        </p>
      </div>

      <div className="bg-[#151E2B] rounded-3xl border border-white/10 p-6 sm:p-8">
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs text-[#16D98A] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            Your message has been received. Our team will respond shortly.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Name</label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Email</label>
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Subject</label>
            <input
              type="text"
              required
              maxLength={160}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="How can we help?"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Message</label>
            <textarea
              required
              rows={5}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="w-full p-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};
