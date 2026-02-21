import { useState } from 'react';
import {
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { useRater } from '../context/RaterContext';
import type { InsuranceLine } from '../types';

const allLines: InsuranceLine[] = [
  'General Liability',
  'Business Owners Policy',
  'Workers Compensation',
  'Commercial Auto',
  'Commercial Property',
  'Umbrella / Excess',
  'Professional Liability',
  'Cyber Liability',
  'Directors & Officers',
  'Employment Practices',
];

const allCarriers = [
  'The Hartford',
  'Travelers',
  'CNA',
  'Liberty Mutual',
  'Chubb',
  'Zurich',
  'Progressive Commercial',
  'Nationwide Agribusiness',
  'Coalition',
  'The Doctors Company',
  'ProAssurance',
  'Sentry Insurance',
  'Berkshire Hathaway',
  'AIG',
  'Markel',
];

export default function Settings() {
  const { profile, updateProfile } = useRater();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [agency, setAgency] = useState(profile.agency);
  const [phone, setPhone] = useState(profile.phone);
  const [state, setState] = useState(profile.state);
  const [licenseNumber, setLicenseNumber] = useState(profile.licenseNumber);
  const [preferredLines, setPreferredLines] = useState<InsuranceLine[]>(profile.preferredLines);
  const [carrierAppointments, setCarrierAppointments] = useState<string[]>(profile.carrierAppointments);
  const [saved, setSaved] = useState(false);

  const toggleLine = (line: InsuranceLine) => {
    setPreferredLines(prev =>
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const toggleCarrier = (carrier: string) => {
    setCarrierAppointments(prev =>
      prev.includes(carrier) ? prev.filter(c => c !== carrier) : [...prev, carrier]
    );
  };

  const handleSave = () => {
    updateProfile({ name, email, agency, phone, state, licenseNumber, preferredLines, carrierAppointments });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges =
    name !== profile.name ||
    email !== profile.email ||
    agency !== profile.agency ||
    phone !== profile.phone ||
    state !== profile.state ||
    licenseNumber !== profile.licenseNumber ||
    JSON.stringify([...preferredLines].sort()) !== JSON.stringify([...profile.preferredLines].sort()) ||
    JSON.stringify([...carrierAppointments].sort()) !== JSON.stringify([...profile.carrierAppointments].sort());

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your broker profile and carrier preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Broker Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-4 h-4 text-gray-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              Agency
            </label>
            <input
              type="text"
              value={agency}
              onChange={e => setAgency(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 text-gray-400" />
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Shield className="w-4 h-4 text-gray-400" />
              License Number
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preferred Lines */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Preferred Lines of Business</h2>
        <p className="text-sm text-gray-500">Select the commercial lines you most commonly write.</p>
        <div className="flex flex-wrap gap-2">
          {allLines.map(line => (
            <button
              key={line}
              onClick={() => toggleLine(line)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                preferredLines.includes(line)
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {line}
            </button>
          ))}
        </div>
      </div>

      {/* Carrier Appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Carrier Appointments</h2>
        <p className="text-sm text-gray-500">Select carriers you have active appointments with.</p>
        <div className="flex flex-wrap gap-2">
          {allCarriers.map(carrier => (
            <button
              key={carrier}
              onClick={() => toggleCarrier(carrier)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                carrierAppointments.includes(carrier)
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {carrier}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges && !saved}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            saved
              ? 'bg-success-500 text-white'
              : hasChanges
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile.totalSubmissions}</p>
            <p className="text-xs text-gray-500 mt-1">Total Submissions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-success-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile.totalBound}</p>
            <p className="text-xs text-gray-500 mt-1">Policies Bound</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(profile.conversionRate * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Conversion Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
