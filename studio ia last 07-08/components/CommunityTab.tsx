import React, { useState } from 'react';
import { LeaderboardUser, SquadChallenge } from '../types';
import { getPublicBaseUrl } from '../utils/downloadHelper';
import { Trophy, Users, Check, Flame, ArrowUpRight, UserPlus, Gift, Copy, Share2, Smartphone, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface CommunityTabProps {
  tokens: number;
  onAddTokens: (amount: number, reason: string) => void;
}

interface InvitedGuest {
  id: string;
  name: string;
  contact: string;
  relation: string;
  status: 'confirmed' | 'pending';
  rewardEarned: number;
  createdAt: string;
}

const INITIAL_GUESTS: InvitedGuest[] = [
  {
    id: 'g-1',
    name: 'Carlos Mendoza (Hermano)',
    contact: 'carlos.m@gmail.com',
    relation: 'Familia (+35)',
    status: 'confirmed',
    rewardEarned: 250,
    createdAt: 'Ayer, 14:20'
  },
  {
    id: 'g-2',
    name: 'Dra. Elena Ramos',
    contact: 'elena.biomed@hotmail.com',
    relation: 'Amigo/a',
    status: 'pending',
    rewardEarned: 0,
    createdAt: 'Hace 3 horas'
  }
];

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, username: "Neuro_Guerrero_88", tokens: 12450, bioScore: 97 },
  { rank: 2, username: "Soberano_Bio", tokens: 11200, bioScore: 96 },
  { rank: 3, username: "Eva_Mitocondrial", tokens: 10880, bioScore: 95 },
  { rank: 4, username: "SincroCircadico", tokens: 9150, bioScore: 93 },
  { rank: 5, username: "PranaWarrior", tokens: 8430, bioScore: 92 }
];

const INITIAL_CHALLENGES: SquadChallenge[] = [
  {
    id: 'sunc_sync',
    title: "Sincronización Solar",
    description: "Sincroniza luz solar matutina 5 días seguidos para anclar tu ritmo circadiano.",
    reward: 300,
    participants: 1245,
    progress: 80,
    completed: false
  },
  {
    id: 'dopa_fast',
    title: "Ayuno de Dopamina (24h)",
    description: "Cero azúcares añadidos ni redes sociales recreativas por un día completo.",
    reward: 500,
    participants: 842,
    progress: 100,
    completed: true
  }
];

export const CommunityTab: React.FC<CommunityTabProps> = ({ tokens, onAddTokens }) => {
  const [challenges, setChallenges] = useState<SquadChallenge[]>(INITIAL_CHALLENGES);
  
  // Referral & Family Program State
  const [guests, setGuests] = useState<InvitedGuest[]>(INITIAL_GUESTS);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestRelation, setGuestRelation] = useState('Familia (+35)');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const referralCode = "BIO-FAMILY-9920";
  const referralUrl = `${getPublicBaseUrl()}/?ref=${referralCode}`;

  const handleCompleteChallenge = (id: string, reward: number, title: string) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, completed: true, progress: 100 } : c)
    );
    onAddTokens(reward, `Desafío Squad Completado: ${title}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestContact.trim()) return;

    const newGuest: InvitedGuest = {
      id: `g-${Date.now()}`,
      name: guestName.trim(),
      contact: guestContact.trim(),
      relation: guestRelation,
      status: 'pending',
      rewardEarned: 0,
      createdAt: 'Ahora mismo'
    };

    setGuests(prev => [newGuest, ...prev]);
    setGuestName('');
    setGuestContact('');
    
    setToastMessage(`¡Invitación enviada a ${newGuest.name}! Ganarás +250 NTK cuando confirme su registro.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmGuest = (guestId: string, name: string) => {
    setGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        return {
          ...g,
          status: 'confirmed',
          rewardEarned: 250
        };
      }
      return g;
    }));

    onAddTokens(250, `Registro Confirmado de Invitado: ${name}`);
    setToastMessage(`🎉 ¡Felicidades! ${name} se registró en la app. Has recibido +250 NTK.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-bio-green to-neuro-blue text-dark font-black p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 fill-dark" />
          <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Community Intro */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-bio-orange/20 text-bio-orange border border-bio-orange/30 uppercase tracking-widest mb-3 inline-block">
          SQUADS BIO-ELITE & RED FAMILIAR
        </span>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Comunidad & Programa de Invitados</h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Mídete con biohackers de élite e invita a tus familiares y amigos a cuidar su salud. Gana <strong className="text-bio-green">+250 NTK</strong> de recompensa directa por cada invitado que confirme su registro en la app.
        </p>
      </div>

      {/* SECCIÓN ESPECIAL: PROGRAMA DE INVITADOS & RED FAMILIAR (+250 NTK) */}
      <div className="bg-gradient-to-br from-bio-green/10 via-black to-neuro-blue/10 border border-bio-green/30 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-bio-green/20 border border-bio-green/40 flex items-center justify-center text-bio-green font-black text-xl">
              🎁
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                Recompensas por Invitados & Familiares
                <span className="text-[9px] font-black bg-bio-green text-dark px-2 py-0.5 rounded-md uppercase">
                  +250 NTK
                </span>
              </h3>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-0.5">
                invita a personas +35 a cuidar su salud • Reciben +100 NTK de Bienvenida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/60 p-2 rounded-2xl border border-white/10">
            <Gift className="w-4 h-4 text-bio-green" />
            <span className="text-xs font-black text-white">Recompensa: <strong className="text-bio-green">+250 NTK</strong></span>
          </div>
        </div>

        {/* Link & Code Sharing Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              Tu Código Único de Referido
            </span>
            <div className="flex items-center justify-between bg-black/80 p-3 rounded-xl border border-bio-green/30">
              <span className="text-sm font-black text-bio-green font-mono">{referralCode}</span>
              <button 
                onClick={handleCopyLink}
                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-bio-green" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Comparte este código o tu enlace personal para que tus invitados reciban su bono inicial.
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              Compartir Directo por WhatsApp o Redes
            </span>
            <div className="flex gap-2">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! Te invito a probar Healthy + Brain para cuidar tu salud y energía con inteligencia artificial fácil de usar. Registrate con mi enlace y recibe +100 NTK gratis: ${referralUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-bio-green text-dark font-black text-xs uppercase tracking-wider rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-green/10"
              >
                <Share2 className="w-4 h-4 stroke-[3]" /> Enviar por WhatsApp
              </a>
            </div>
            <span className="text-[9px] text-bio-green font-bold uppercase">✓ Tus invitados mayores de 35 años aprenderán fácil en 1 Clic</span>
          </div>
        </div>

        {/* Invitation Form */}
        <form onSubmit={handleSendInvitation} className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-bio-green" />
            Registrar Nuevo Invitado (Familiar o Amigo)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                Nombre de la Persona
              </label>
              <input 
                type="text" 
                placeholder="Ej. Mamá María, Tío Roberto..." 
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-bio-green"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                Correo o WhatsApp
              </label>
              <input 
                type="text" 
                placeholder="ejemplo@correo.com o teléfono" 
                value={guestContact}
                onChange={e => setGuestContact(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-bio-green"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                Relación / Categoria
              </label>
              <select 
                value={guestRelation}
                onChange={e => setGuestRelation(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-bio-green"
              >
                <option value="Familia (+35)">Familia (+35 años)</option>
                <option value="Pareja">Pareja</option>
                <option value="Amigo/a">Amigo/a</option>
                <option value="Compañero/a">Compañero/a de Trabajo</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-bio-green to-neuro-blue text-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-green/20"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            Enviar Invitación Directa (+250 NTK al Confirmar)
          </button>
        </form>

        {/* Invited List & Confirmation Status */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Historial de Invitados & Confirmaciones ({guests.length})
          </h4>

          <div className="space-y-2">
            {guests.map(guest => (
              <div 
                key={guest.id} 
                className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{guest.name}</span>
                    <span className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md uppercase">
                      {guest.relation}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">{guest.contact} • Registrado: {guest.createdAt}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {guest.status === 'confirmed' ? (
                    <span className="text-[10px] font-black text-bio-green bg-bio-green/10 border border-bio-green/30 px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-bio-green" /> Confirmado (+250 NTK)
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-bio-orange bg-bio-orange/10 border border-bio-orange/20 px-2.5 py-1 rounded-lg uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendiente
                      </span>
                      <button 
                        onClick={() => handleConfirmGuest(guest.id, guest.name)}
                        className="py-1.5 px-3 bg-bio-green text-dark font-black text-[10px] uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-1 shadow-md shadow-bio-green/20"
                        title="Simular que el invitado descargó la app y confirmó su cuenta"
                      >
                        <Check className="w-3 h-3 stroke-[3]" /> Simular Confirmación (+250 NTK)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-6 border-white/5 bg-white/2">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-bio-orange" />
          <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Ranking Global Bio-Elite</h3>
        </div>

        <div className="space-y-3">
          {INITIAL_LEADERBOARD.map((user) => (
            <div 
              key={user.rank}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                user.isSelf 
                  ? 'bg-bio-orange/10 border-bio-orange/30' 
                  : 'bg-black/20 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black w-6 text-center ${
                  user.rank === 1 ? 'text-bio-orange' : 
                  user.rank === 2 ? 'text-neuro-blue' : 
                  user.rank === 3 ? 'text-bio-green' : 'text-gray-500'
                }`}>
                  #{user.rank}
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-tight">{user.username}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Métricas</span>
                  <span className="text-xs font-black text-neuro-blue">{user.bioScore}% Readiness</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Balance</span>
                  <span className="text-xs font-black text-bio-orange">{user.tokens.toLocaleString()} NTK</span>
                </div>
              </div>
            </div>
          ))}

          {/* Self Position */}
          <div className="flex items-center justify-between p-4 rounded-2xl border bg-bio-orange/10 border-bio-orange/30">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black w-6 text-center text-bio-orange">#15</span>
              <span className="text-sm font-black text-white uppercase tracking-tight">Tú (Bio-Guerrero)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Métricas</span>
                <span className="text-xs font-black text-neuro-blue">92% Readiness</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Balance</span>
                <span className="text-xs font-black text-bio-orange">{tokens.toLocaleString()} NTK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Challenges */}
      <div className="glass-card p-6 border-white/5 bg-white/2">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-neuro-blue" />
          <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Desafíos Grupales Activos</h3>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neuro-blue/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-neuro-blue transition-colors">
                    {challenge.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {challenge.participants.toLocaleString()} participantes activos
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-bio-orange bg-bio-orange/10 border border-bio-orange/20 px-2 py-0.5 rounded-full uppercase">
                    +{challenge.reward} NTK
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium leading-relaxed pr-6">
                {challenge.description}
              </p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                  <span>Progreso</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-neuro-blue to-bio-green h-full rounded-full" style={{ width: `${challenge.progress}%` }}></div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {challenge.completed ? (
                  <span className="text-[10px] font-black text-bio-green bg-bio-green/10 border border-bio-green/20 px-3 py-1.5 rounded-xl uppercase tracking-widest inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Logrado y Recompensado
                  </span>
                ) : (
                  <button 
                    onClick={() => handleCompleteChallenge(challenge.id, challenge.reward, challenge.title)}
                    className="py-2.5 px-4 bg-white/5 border border-white/10 hover:border-neuro-blue hover:bg-neuro-blue/10 hover:text-neuro-blue text-[10px] font-black text-gray-400 rounded-xl uppercase tracking-widest transition-all"
                  >
                    Marcar Completado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
