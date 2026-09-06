import type { Mode } from '../store'

export const modes: { id: Mode; name: string; icon: string; hint: string }[] = [
  { id: 'anatomie', name: 'Anatomie', icon: '🫀', hint: 'Struktury srdce a vrstvy' },
  { id: 'funkce', name: 'Jak srdce funguje', icon: '🔄', hint: 'Srdeční cyklus a tok krve' },
  { id: 'prevodni', name: 'Převodní systém', icon: '⚡', hint: 'Šíření vzruchu a EKG' },
  { id: 'nemoci', name: 'Nemoci', icon: '🩺', hint: 'Patologie na modelu a EKG' },
  { id: 'infarkt', name: 'Infarkt krok za krokem', icon: '🧭', hint: 'Od plátu k nekróze' },
  { id: 'lecba', name: 'Léčba', icon: '🩹', hint: 'Stent, bypass, trombolýza…' },
  { id: 'prevence', name: 'Prevence', icon: '🛡️', hint: 'Rizikové faktory a kalkulačka' },
]
