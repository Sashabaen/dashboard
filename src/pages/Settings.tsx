import { useState } from 'react';
import { User, Mail, Tag, Save, CheckCircle2 } from 'lucide-react';
import { useRater } from '../context/RaterContext';

const allExpertise = [
  'Creative Writing',
  'Technical',
  'Explanation',
  'Factual',
  'Persuasive Writing',
  'Analysis',
  'Code Review',
  'Translation',
];

export default function Settings() {
  const { profile, updateProfile } = useRater();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [expertise, setExpertise] = useState<string[]>(profile.expertise);
  const [saved, setSaved] = useState(false);

  const toggleExpertise = (item: string) => {
    setExpertise(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    updateProfile({ name, email, expertise });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges =
    name !== profile.name ||
    email !== profile.email ||
    JSON.stringify(expertise.sort()) !== JSON.stringify([...profile.expertise].sort());

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your rater profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-4 h-4 text-gray-400" />
              Name
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Areas of Expertise
            </label>
            <div className="flex flex-wrap gap-2">
              {allExpertise.map(item => (
                <button
                  key={item}
                  onClick={() => toggleExpertise(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    expertise.includes(item)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
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
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{profile.totalRatings}</p>
            <p className="text-xs text-gray-500 mt-1">Total Ratings</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(profile.averageTimeMs / 1000)}s
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg. Time</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(profile.agreementRate * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Agreement Rate</p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {[
            ['A', 'Select Response A'],
            ['B', 'Select Response B'],
            ['T', 'Select Tie'],
            ['X', 'Select Both Bad'],
            ['1-5', 'Set confidence level'],
            ['Enter', 'Submit rating'],
            ['S', 'Skip task'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600">{desc}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-500 border border-gray-200">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
