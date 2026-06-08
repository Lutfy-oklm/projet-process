import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Eye,
  Lock,
  Mail,
  Moon,
  Palette,
  Search,
  Shield,
  SlidersHorizontal,
  Sun,
  Trash2,
  User,
  UserPlus,
  Users
} from 'lucide-react';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const roles = [
  {
    name: 'Administrateur',
    description: 'Acces complet a la plateforme, aux roles et aux parametrages.',
    users: 2,
    tone: 'border-red-100 bg-red-50 text-red-700'
  },
  {
    name: 'Owner Processus',
    description: 'Pilote les processus, valide les versions et suit les risques.',
    users: 7,
    tone: 'border-blue-100 bg-blue-50 text-blue-700'
  },
  {
    name: 'Contributeur',
    description: 'Met a jour les fiches, documents et plans d’action.',
    users: 14,
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-700'
  },
  {
    name: 'Lecteur',
    description: 'Consulte les processus, diagrammes et tableaux de bord.',
    users: 31,
    tone: 'border-slate-200 bg-slate-100 text-slate-700'
  }
];

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onThemeChange }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [documentAlerts, setDocumentAlerts] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'Jean Martin', email: 'jean.martin@entreprise.fr', role: 'Owner Processus', status: 'Actif' },
    { id: 'u-2', name: 'Sophie Bernard', email: 'sophie.bernard@entreprise.fr', role: 'Administrateur', status: 'Actif' },
    { id: 'u-3', name: 'Claire Petit', email: 'claire.petit@entreprise.fr', role: 'Contributeur', status: 'Invite' },
    { id: 'u-4', name: 'Michel Blanc', email: 'michel.blanc@entreprise.fr', role: 'Lecteur', status: 'Actif' }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const addUser = () => {
    const id = Date.now().toString();
    setUsers(previous => [
      {
        id,
        name: 'Nouvel utilisateur',
        email: `utilisateur-${id.slice(-4)}@entreprise.fr`,
        role: 'Lecteur',
        status: 'Invite'
      },
      ...previous
    ]);
  };

  const updateUserRole = (userId: string, role: string) => {
    setUsers(previous => previous.map(user => user.id === userId ? { ...user, role } : user));
  };

  const deleteUser = (userId: string) => {
    if (window.confirm('Supprimer cet utilisateur de la plateforme ?')) {
      setUsers(previous => previous.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5 dark:border-[#0b1424] dark:bg-[#030812]">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Administration</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">Parametres</h1>
          <p className="mt-1 text-sm text-slate-500">
            Profil, preferences, notifications, apparence et preparation des roles utilisateurs.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="app-surface rounded-xl p-6">
            <SectionTitle icon={User} title="Profil utilisateur" />
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-[#00030a]">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">Utilisateur</h2>
                <p className="text-sm text-slate-500">Administrateur processus</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <ProfileField icon={Mail} label="Email" value="utilisateur@entreprise.fr" />
              <ProfileField icon={Shield} label="Role principal" value="Administrateur" />
              <ProfileField icon={Lock} label="Authentification" value="Prete pour SSO / MFA" />
            </div>
          </section>

          <section className="app-surface rounded-xl p-6">
            <SectionTitle icon={SlidersHorizontal} title="Preferences de travail" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <PreferenceCard
                title="Mode compact"
                description="Densifier les listes et tableaux pour les usages quotidiens."
                enabled={compactMode}
                onToggle={() => setCompactMode(!compactMode)}
              />
              <PreferenceCard
                title="Actions rapides"
                description="Afficher les raccourcis importants dans les pages metier."
                enabled
                onToggle={() => undefined}
              />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="app-surface rounded-xl p-6">
            <SectionTitle icon={Bell} title="Notifications" />
            <div className="mt-5 space-y-3">
              <ToggleRow
                title="Notifications email"
                description="Recevoir les alertes importantes par email."
                enabled={emailNotifications}
                onToggle={() => setEmailNotifications(!emailNotifications)}
              />
              <ToggleRow
                title="Revisions a effectuer"
                description="Alerte quand une revue processus approche."
                enabled={reviewAlerts}
                onToggle={() => setReviewAlerts(!reviewAlerts)}
              />
              <ToggleRow
                title="Nouveaux documents"
                description="Alerte lors de l'ajout ou suppression d'un document."
                enabled={documentAlerts}
                onToggle={() => setDocumentAlerts(!documentAlerts)}
              />
            </div>
          </section>

          <section className="app-surface rounded-xl p-6">
            <SectionTitle icon={Palette} title="Apparence" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`rounded-xl border p-4 text-left transition ${
                  theme === 'light'
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
                }`}
              >
                <Sun className="mb-3 h-5 w-5" />
                <p className="font-bold">Theme clair</p>
                <p className="mt-1 text-sm opacity-75">Interface lumineuse pour usage bureau.</p>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`rounded-xl border p-4 text-left transition ${
                  theme === 'dark'
                    ? 'border-white bg-white text-[#00030a]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
                }`}
              >
                <Moon className="mb-3 h-5 w-5" />
                <p className="font-bold">Theme sombre</p>
                <p className="mt-1 text-sm opacity-75">Bleu nuit profond proche du noir.</p>
              </button>
            </div>
          </section>
        </div>

        <section className="app-surface mt-6 rounded-xl p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle icon={Users} title="Gestion des roles" />
            <button className="app-button-primary" onClick={addUser}>
              <UserPlus className="h-4 w-4" />
              Inviter un utilisateur
            </button>
          </div>

          <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100">Utilisateurs</h3>
                  <p className="text-sm text-slate-500">Preparation du module d'administration et future authentification.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Rechercher..."
                    className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-[#0b1424]">
                      <th className="py-2 pr-3">Nom</th>
                      <th className="py-2 pr-3">Role</th>
                      <th className="py-2 pr-3">Statut</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-slate-100 last:border-0 dark:border-[#0b1424]">
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-slate-950 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={user.role}
                            onChange={(event) => updateUserRole(user.id, event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-[#15243a] dark:bg-[#030812] dark:text-slate-100"
                          >
                            {roles.map(role => <option key={role.name} value={role.name}>{role.name}</option>)}
                          </select>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.status === 'Actif' ? 'border-emerald-200 bg-emerald-100 text-emerald-800' : 'border-amber-200 bg-amber-100 text-amber-800'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
              <h3 className="font-bold text-slate-950 dark:text-slate-100">Preparation authentification</h3>
              <div className="mt-4 space-y-3">
                <AuthReadiness label="SSO entreprise" value="Pret" />
                <AuthReadiness label="MFA" value="Prepare" />
                <AuthReadiness label="Permissions par role" value="Actif" />
                <AuthReadiness label="Journal d'acces" value="A relier au backend" />
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Shield className="h-4 w-4" />
            Roles disponibles
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roles.map(role => (
              <div key={role.name} className="rounded-xl border border-slate-100 p-4 dark:border-[#0b1424]">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${role.tone}`}>
                  {role.name}
                </span>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{role.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-[#0b1424]">
                  <span className="text-sm font-semibold text-slate-500">Utilisateurs</span>
                  <span className="text-lg font-bold text-slate-950 dark:text-slate-100">
                    {users.filter(user => user.role === role.name).length || role.users}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const AuthReadiness: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-[#060d19]">
    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    <span className="text-sm font-bold text-slate-950 dark:text-slate-100">{value}</span>
  </div>
);

interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-[#00030a]">
      <Icon className="h-5 w-5" />
    </span>
    <h2 className="text-xl font-bold text-slate-950 dark:text-slate-100">{title}</h2>
  </div>
);

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-[#0b1424]">
    <Icon className="h-4 w-4 text-blue-500" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

interface ToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleRow: React.FC<ToggleProps> = ({ title, description, enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-[#0b1424] dark:hover:bg-white"
  >
    <span>
      <span className="block font-semibold text-slate-950 dark:text-slate-100">{title}</span>
      <span className="mt-1 block text-sm text-slate-500">{description}</span>
    </span>
    <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
    </span>
  </button>
);

const PreferenceCard: React.FC<ToggleProps> = ({ title, description, enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rounded-xl border p-4 text-left transition ${
      enabled
        ? 'border-blue-200 bg-blue-50 text-blue-800'
        : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#0b1424] dark:bg-[#030812] dark:text-slate-300 dark:hover:bg-white dark:hover:text-[#00030a]'
    }`}
  >
    <CheckCircle className="mb-3 h-5 w-5" />
    <p className="font-bold">{title}</p>
    <p className="mt-1 text-sm opacity-80">{description}</p>
  </button>
);

export default SettingsPage;
