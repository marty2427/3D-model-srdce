export interface RiskFactor {
  name: string
  modifiable: boolean
  text: string
  target?: string
}

export const riskFactors: RiskFactor[] = [
  { name: 'Věk', modifiable: false, text: 'Riziko roste s věkem – u mužů výrazněji po 45. roce, u žen po menopauze (asi po 55. roce), kdy zmizí ochranný vliv estrogenů.' },
  { name: 'Pohlaví', modifiable: false, text: 'Muži onemocní v průměru o 10 let dříve než ženy. U žen jsou ale příznaky infarktu často méně typické, a proto bývá rozpoznán později.' },
  { name: 'Rodinná zátěž', modifiable: false, text: 'Infarkt nebo mrtvice u otce či bratra před 55. rokem, u matky či sestry před 65. rokem zdvojnásobuje riziko. Dědí se sklon k vysokému cholesterolu i tlaku.' },
  { name: 'Kouření', modifiable: true, text: 'Nejsilnější ovlivnitelný faktor: poškozuje endotel, zvyšuje srážlivost a zdvojnásobuje riziko infarktu. Rok po zanechání kouření klesá riziko o polovinu, po 10–15 letech je téměř jako u nekuřáka.', target: '0 cigaret – včetně elektronických a „zahřívaného tabáku“' },
  { name: 'Vysoký krevní tlak', modifiable: true, text: 'Tlak nad 140/90 mm Hg poškozuje stěnu tepen a přetěžuje levou komoru. Nebolí – polovina lidí o něm neví. Měřte si tlak doma alespoň jednou ročně.', target: 'pod 130/80 mm Hg (u většiny dospělých)' },
  { name: 'Cholesterol (LDL)', modifiable: true, text: '[[ldl|LDL cholesterol]] je stavební kámen aterosklerotického plátu. Sníží ho strava s méně nasycenými tuky, pohyb a v případě potřeby [[statin|statiny]].', target: 'LDL pod 3,0 mmol/l u zdravých, pod 1,4 mmol/l po infarktu' },
  { name: 'Cukrovka', modifiable: true, text: 'Diabetes 2. typu zvyšuje riziko infarktu 2–4×; vysoká glykémie „cukruje“ bílkoviny cévní stěny. Diabetik má stejné riziko jako nediabetik po infarktu.', target: 'glykovaný hemoglobin (HbA1c) pod 53 mmol/mol' },
  { name: 'Nadváha a obezita', modifiable: true, text: 'Zejména tuk v břiše (obvod pasu nad 94 cm u mužů, 80 cm u žen) produkuje zánětlivé látky, zvyšuje tlak, cholesterol i riziko cukrovky.', target: '[[bmi|BMI]] 18,5–24,9, obvod pasu pod 94/80 cm' },
  { name: 'Nedostatek pohybu', modifiable: true, text: 'Pravidelný pohyb snižuje tlak, zlepšuje cholesterol i citlivost na inzulin a posiluje srdce. Stačí svižná chůze.', target: '150 minut střední zátěže týdně (např. 5× 30 minut chůze)' },
  { name: 'Nezdravá strava', modifiable: true, text: 'Přemíra soli, nasycených tuků, cukru a průmyslově zpracovaných potravin. Ochranná je středomořská strava: zelenina, ovoce, luštěniny, ryby, olivový olej, ořechy.', target: 'sůl pod 5 g denně, 400 g zeleniny a ovoce denně' },
  { name: 'Alkohol', modifiable: true, text: 'Bezpečná dávka neexistuje – alkohol zvyšuje tlak, přispívá k fibrilaci síní a kardiomyopatii. Dřívější „ochranný účinek“ malých dávek se nepotvrdil.', target: 'co nejméně, maximálně 1 (ženy) až 2 (muži) sklenky denně' },
  { name: 'Stres a spánek', modifiable: true, text: 'Chronický stres a spánek pod 6 hodin zvyšují tlak a hladinu stresových hormonů. Spánková apnoe (chrápání se zástavami dechu) je častou skrytou příčinou hypertenze.', target: '7–8 hodin spánku, vyšetření při chrápání s únavou' },
]

export interface RiskInput {
  age: number
  sex: 'm' | 'f'
  smoker: boolean
  sbp: number
  chol: number
  diabetes: boolean
  bmi: number
  active: boolean
  family: boolean
}

export const defaultRiskInput: RiskInput = {
  age: 50,
  sex: 'm',
  smoker: false,
  sbp: 130,
  chol: 5.2,
  diabetes: false,
  bmi: 26,
  active: true,
  family: false,
}

/**
 * Orientační odhad 10letého rizika kardiovaskulární příhody (v %).
 * Zjednodušený model inspirovaný tabulkami SCORE2 – slouží jen k ilustraci vlivu jednotlivých faktorů,
 * nenahrazuje lékařské vyšetření.
 */
export function estimateRisk(i: RiskInput): number {
  let r = 0.5 * Math.pow(2, (i.age - 40) / 8) // muž, 40 let: 0,5 %
  if (i.sex === 'f') r *= 0.5
  if (i.smoker) r *= 2.0
  r *= Math.pow(1.5, (i.sbp - 120) / 20)
  r *= Math.pow(1.3, i.chol - 5)
  if (i.diabetes) r *= 2.0
  r *= 1 + Math.max(0, i.bmi - 25) * 0.03
  if (!i.active) r *= 1.25
  if (i.family) r *= 1.5
  return Math.min(60, Math.max(0.3, r))
}

export function riskCategory(pct: number): { label: string; color: string; level: number; advice: string } {
  if (pct < 5) return { label: 'Nízké až mírné riziko', color: '#7ef29a', level: 0.15, advice: 'Udržujte zdravý životní styl a kontrolujte tlak a cholesterol každých 5 let.' }
  if (pct < 10) return { label: 'Střední riziko', color: '#ffd166', level: 0.4, advice: 'Zaměřte se na ovlivnitelné faktory – největší přínos má zanechání kouření, pohyb a úprava tlaku.' }
  if (pct < 20) return { label: 'Vysoké riziko', color: '#ff9f6b', level: 0.7, advice: 'Doporučuje se vyšetření u praktického lékaře – často je na místě léčba tlaku nebo cholesterolu.' }
  return { label: 'Velmi vysoké riziko', color: '#ff5a4a', level: 1, advice: 'Navštivte lékaře. Kombinace léků a změny životního stylu může riziko snížit o více než polovinu.' }
}
