import React, { useState } from 'react';
import { LeaderboardUser, SquadChallenge } from '../types';
import { Trophy, Users, Check, Flame, ArrowUpRight } from 'lucide-react';

interface CommunityTabProps {
  tokens: number;
  onAddTokens: (amount: number, reason: string) => void;
}

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

  const handleCompleteChallenge = (id: string, reward: number, title: string) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, completed: true, progress: 100 } : c)
    );
    onAddTokens(reward, `Desafío Squad Completado: ${title}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Community Intro */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-glass-noir border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-bio-orange/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-bio-orange/20 text-bio-orange border border-bio-orange/30 uppercase tracking-widest mb-3 inline-block">
          SQUADS BIO-ELITE
        </span>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Comunidad</h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Mídete y colabora con los biohackers de élite más consistentes. Participa en desafíos neuro-conductuales conjuntos para multiplicar tus NTK.
        </p>
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
