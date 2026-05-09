'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  businessName: string;
  serviceNeeded: string;
  budgetRange: string;
  projectDetails: string;
  honeypot: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    businessName: '',
    serviceNeeded: '',
    budgetRange: '',
    projectDetails: '',
    honeypot: '',
  });

  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address';
    if (!formData.serviceNeeded) newErrors.serviceNeeded = 'Please select a service';
    if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
    if (!formData.projectDetails.trim()) newErrors.projectDetails = 'Please provide project details';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot spam check
    if (formData.honeypot) {
      console.log('Spam detected');
      return;
    }

    // Validate form
    if (!validateForm()) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields correctly.',
      });
      return;
    }

    setStatus({ type: 'loading', message: 'Sending your request...' });

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          businessName: formData.businessName || 'Not provided',
          serviceNeeded: formData.serviceNeeded,
          budgetRange: formData.budgetRange,
          projectDetails: formData.projectDetails,
          honeypot: formData.honeypot,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      setStatus({
        type: 'success',
        message: "Thanks! We've received your request. We'll contact you within 24 hours.",
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        businessName: '',
        serviceNeeded: '',
        budgetRange: '',
        projectDetails: '',
        honeypot: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Send error:', error);
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      setStatus({
        type: 'error',
        message: `Something went wrong: ${message}`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-cyan-500/10 bg-slate-800/30 p-8 shadow-glow">
      {/* Honeypot field (hidden from users) */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Name and Email - Two columns */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Full Name *</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${
                errors.name ? 'border-red-500/50' : 'border-cyan-500/10'
              }`}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </label>
        </div>

        <div>
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Email Address *</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@business.com"
              className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${
                errors.email ? 'border-red-500/50' : 'border-cyan-500/10'
              }`}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </label>
        </div>
      </div>

      {/* Business Name - Optional */}
      <div>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="font-medium">Business Name (optional)</span>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your company name"
            className="w-full rounded-xl border border-cyan-500/10 bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
          />
        </label>
      </div>

      {/* Service Needed - Dropdown */}
      <div>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="font-medium">Service Needed *</span>
          <select
            name="serviceNeeded"
            value={formData.serviceNeeded}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${
              errors.serviceNeeded ? 'border-red-500/50' : 'border-cyan-500/10'
            }`}
          >
            <option value="">Select a service...</option>
            <option value="Website Development">Website Development</option>
            <option value="Hosting & Deployment">Hosting & Deployment</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Custom Project">Custom Project</option>
          </select>
          {errors.serviceNeeded && <p className="text-xs text-red-400">{errors.serviceNeeded}</p>}
        </label>
      </div>

      {/* Budget Range - Dropdown */}
      <div>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="font-medium">Budget Range *</span>
          <select
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 ${
              errors.budgetRange ? 'border-red-500/50' : 'border-cyan-500/10'
            }`}
          >
            <option value="">Select a budget range...</option>
            <option value="₱5,000–₱20,000">₱5,000–₱20,000</option>
            <option value="₱20,000–₱50,000">₱20,000–₱50,000</option>
            <option value="₱50,000+">₱50,000+</option>
          </select>
          {errors.budgetRange && <p className="text-xs text-red-400">{errors.budgetRange}</p>}
        </label>
      </div>

      {/* Project Details - Textarea */}
      <div>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="font-medium">Project Details *</span>
          <textarea
            name="projectDetails"
            value={formData.projectDetails}
            onChange={handleChange}
            rows={6}
            placeholder="Tell us about your project, goals, and what you're looking for. Be as detailed as possible..."
            className={`w-full rounded-xl border bg-slate-900/50 px-4 py-3 text-brand-text outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 resize-none ${
              errors.projectDetails ? 'border-red-500/50' : 'border-cyan-500/10'
            }`}
          />
          {errors.projectDetails && <p className="text-xs text-red-400">{errors.projectDetails}</p>}
        </label>
      </div>

      {/* Status Messages */}
      {status.type !== 'idle' && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : status.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between gap-4 pt-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status.type === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-glow"
        >
          {status.type === 'loading' ? (
            <>
              <span className="inline-block animate-spin mr-2">↻</span>
              Sending...
            </>
          ) : (
            'Send Inquiry'
          )}
        </button>
        <p className="text-xs text-gray-400">We'll respond within 24 hours on business days.</p>
      </div>
    </form>
  );
}
