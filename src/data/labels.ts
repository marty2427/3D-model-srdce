import type { StructureId } from './structures'
import type { V3 } from '../three/geometry'

export interface LabelDef {
  id: StructureId
  at: V3
  short?: string
  /** popisek patří k vrstvě */
  layer: 'svalovina' | 'chlopne' | 'koronarni' | 'prevodni' | 'cevy'
  /** zobrazit jen při řezu */
  cutOnly?: boolean
}

export const labelDefs: LabelDef[] = [
  { id: 'prava-sin', at: [-1.45, 1.15, 0.2], layer: 'svalovina' },
  { id: 'leva-sin', at: [1.2, 1.25, -0.5], layer: 'svalovina' },
  { id: 'prava-komora', at: [-1.2, -0.7, 0.6], layer: 'svalovina' },
  { id: 'leva-komora', at: [1.35, -1.1, -0.1], layer: 'svalovina' },
  { id: 'septum', at: [-0.05, -0.75, 0.1], short: 'Přepážka', layer: 'svalovina', cutOnly: true },
  { id: 'trikuspidalni', at: [-0.8, 0.4, 0.6], short: 'Trikuspidální chl.', layer: 'chlopne' },
  { id: 'mitralni', at: [0.75, 0.2, -0.4], short: 'Mitrální chl.', layer: 'chlopne' },
  { id: 'aortalni', at: [0.3, 0.32, -0.05], short: 'Aortální chl.', layer: 'chlopne' },
  { id: 'pulmonalni', at: [-0.35, 0.8, 0.6], short: 'Pulmonální chl.', layer: 'chlopne' },
  { id: 'horni-duta-zila', at: [-0.8, 2.45, -0.1], short: 'Horní dutá žíla', layer: 'cevy' },
  { id: 'dolni-duta-zila', at: [-0.75, -1.6, -0.55], short: 'Dolní dutá žíla', layer: 'cevy' },
  { id: 'plicnice', at: [0.3, 1.25, 0.4], layer: 'cevy' },
  { id: 'plicni-zily', at: [1.6, 0.9, -0.95], layer: 'cevy' },
  { id: 'aorta', at: [0.25, 2.45, -0.5], layer: 'cevy' },
  { id: 'ria', at: [0.12, -0.95, 0.95], short: 'RIA (LAD)', layer: 'koronarni' },
  { id: 'rcx', at: [1.35, 0.15, -0.3], short: 'RCX', layer: 'koronarni' },
  { id: 'rca', at: [-1.5, 0.05, 0.1], short: 'RCA', layer: 'koronarni' },
  { id: 'sa-uzel', at: [-1.0, 1.42, 0.12], short: 'SA uzel', layer: 'prevodni' },
  { id: 'av-uzel', at: [-0.45, 0.42, -0.08], short: 'AV uzel', layer: 'prevodni' },
  { id: 'hisuv-svazek', at: [-0.3, 0.2, 0.0], short: 'Hisův svazek', layer: 'prevodni' },
  { id: 'tawarova-ramenka', at: [0.1, -0.6, 0.0], short: 'Tawarova raménka', layer: 'prevodni' },
  { id: 'purkynova-vlakna', at: [0.35, -1.5, 0.1], short: 'Purkyňova vlákna', layer: 'prevodni' },
]
