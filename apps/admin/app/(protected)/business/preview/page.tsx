import { DayHours } from '../../../../features/business/repositories/business-repo';
import { getBusinessAction } from '../../../../features/business/actions/business-actions';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from 'lucide-react';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const dynamic = 'force-dynamic';

export default async function BusinessPreviewPage() {
  const business = await getBusinessAction();

  const renderHours = (dayData: DayHours) => {
    if (dayData.isClosed) return <span className="text-stone-400">Closed</span>;
    return (
      <span>
        {dayData.openTime} - {dayData.closeTime}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      {/* Admin Preview Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.08] px-4 py-3 flex items-center justify-between shadow-glass">
        <div className="flex items-center gap-4">
          <Link
            href="/business"
            className="p-2 hover:bg-black/5 rounded-xl transition-colors text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-sm text-black">Live Preview Mode</h1>
            <p className="text-xs text-stone-600">Viewing '{business.status}' state</p>
          </div>
        </div>
        <div className="text-xs font-semibold bg-black text-white px-3 py-1 rounded-full shadow-sm">
          Preview Active
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-24">
        {/* Meta / SEO Preview Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-600 border-b border-black/[0.08] pb-2">
            Search Engine Preview
          </h2>
          <div className="max-w-2xl bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-black/[0.08] shadow-glass">
            <div className="text-sm text-stone-600 mb-1 flex items-center gap-2">
              {business.favicon && (
                <img src={business.favicon} alt="Favicon" className="w-4 h-4 rounded-full" />
              )}
              {business.website || 'https://example.com'}
            </div>
            <div className="text-xl text-black font-semibold hover:underline cursor-pointer mb-1">
              {business.seoTitle}
            </div>
            <div className="text-sm text-stone-700">{business.seoDescription}</div>
            <div className="mt-4 pt-4 border-t border-black/[0.06]">
              <p className="text-xs text-stone-600">
                <span className="font-bold text-black">Keywords:</span> {business.keywords}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Page Preview Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-600 border-b border-black/[0.08] pb-2">
            Contact Page Preview
          </h2>

          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-black/[0.08]">
            {business.coverImage && (
              <div className="h-48 md:h-64 w-full relative">
                <img src={business.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-8 flex items-center gap-6">
                    {business.logo && (
                      <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                        <img
                          src={business.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-white">
                      <h3 className="text-3xl font-bold tracking-tight mb-1">{business.name}</h3>
                      <p className="text-stone-200 font-medium text-lg">{business.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 space-y-8 bg-[#F8F9FA]">
                <div>
                  <h4 className="text-xl font-bold text-black mb-4">Get in Touch</h4>
                  <p className="text-stone-700 mb-6">{business.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-stone-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-black">Visit Us</p>
                      <p className="text-stone-700 mt-1">
                        {business.street}
                        <br />
                        {business.city}, {business.state} {business.postalCode}
                        <br />
                        {business.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-stone-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-black">Call or WhatsApp</p>
                      <p className="text-stone-700 mt-1">{business.phone}</p>
                      {business.whatsapp && business.whatsapp !== business.phone && (
                        <p className="text-stone-700">{business.whatsapp} (WhatsApp)</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-stone-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-black">Email</p>
                      <p className="text-stone-700 mt-1">{business.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-stone-500" />
                  <h4 className="text-xl font-bold text-black">Opening Hours</h4>
                </div>

                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="flex justify-between items-center py-2 border-b border-black/[0.06] last:border-0"
                    >
                      <span className="font-semibold capitalize text-stone-700">{day}</span>
                      <span className="text-black font-bold text-right">
                        {renderHours(business.hours[day])}
                      </span>
                    </div>
                  ))}
                </div>

                {business.hours.holidayHours && (
                  <div className="mt-6 p-4 rounded-xl bg-black/[0.04] border border-black/10 text-black text-sm">
                    <span className="font-bold block mb-1">Holiday Note:</span>
                    {business.hours.holidayHours}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Preview Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-600 border-b border-black/[0.08] pb-2">
            Footer Preview
          </h2>

          <footer className="bg-stone-900 text-stone-400 py-16 px-8 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div>
                <h4 className="text-stone-50 text-lg font-bold mb-4">{business.name}</h4>
                <p className="text-sm mb-6 max-w-xs">{business.tagline}</p>
                <div className="flex gap-4">
                  {business.instagram && (
                    <Instagram className="w-5 h-5 hover:text-stone-50 cursor-pointer transition-colors" />
                  )}
                  {business.facebook && (
                    <Facebook className="w-5 h-5 hover:text-stone-50 cursor-pointer transition-colors" />
                  )}
                  {business.youtube && (
                    <Youtube className="w-5 h-5 hover:text-stone-50 cursor-pointer transition-colors" />
                  )}
                  {business.linkedin && (
                    <Linkedin className="w-5 h-5 hover:text-stone-50 cursor-pointer transition-colors" />
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-stone-50 text-lg font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>{business.street}</li>
                  <li>
                    {business.city}, {business.state} {business.postalCode}
                  </li>
                  <li className="pt-4">{business.phone}</li>
                  <li>{business.email}</li>
                </ul>
              </div>

              <div>
                <h4 className="text-stone-50 text-lg font-bold mb-4">Hours</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Mon - Fri</span>
                    <span>
                      {business.hours.monday.isClosed
                        ? 'Closed'
                        : `${business.hours.monday.openTime} - ${business.hours.monday.closeTime}`}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span>
                      {business.hours.saturday.isClosed
                        ? 'Closed'
                        : `${business.hours.saturday.openTime} - ${business.hours.saturday.closeTime}`}
                    </span>
                  </li>
                  <li className="flex justify-between text-rose-400">
                    <span>Sunday</span>
                    <span>
                      {business.hours.sunday.isClosed
                        ? 'Closed'
                        : `${business.hours.sunday.openTime} - ${business.hours.sunday.closeTime}`}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
