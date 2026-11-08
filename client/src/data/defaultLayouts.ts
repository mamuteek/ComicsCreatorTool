import { ComicPanel } from '../types/comic';

export interface LayoutTemplateDef {
  id: '1-panel' | '2-vertical' | '3-horizontal' | '4-grid' | '5-dynamic' | '6-classic';
  name: string;
  description: string;
  panelCount: number;
  panels: Omit<ComicPanel, 'id' | 'order' | 'bubbles' | 'description' | 'characterIds' | 'imagePrompt'>[];
}

export const LAYOUT_TEMPLATES: LayoutTemplateDef[] = [
  {
    id: '1-panel',
    name: 'Full Page Splash (1 Panel)',
    description: 'Hero cover page or dramatic climax scene taking up the whole page.',
    panelCount: 1,
    panels: [
      { x: 3, y: 3, width: 94, height: 94, shotType: 'wide-shot' },
    ],
  },
  {
    id: '2-vertical',
    name: '2 Tall Panels (Side by Side)',
    description: 'Great for two contrasting actions or a vertical panoramic shot.',
    panelCount: 2,
    panels: [
      { x: 3, y: 3, width: 45.5, height: 94, shotType: 'medium-shot' },
      { x: 51.5, y: 3, width: 45.5, height: 94, shotType: 'medium-shot' },
    ],
  },
  {
    id: '3-horizontal',
    name: '3 Rows (Classic Strip)',
    description: 'Three wide cinematic panels stacked vertically.',
    panelCount: 3,
    panels: [
      { x: 3, y: 3, width: 94, height: 29.5, shotType: 'wide-shot' },
      { x: 3, y: 35.5, width: 94, height: 29.5, shotType: 'medium-shot' },
      { x: 3, y: 67.5, width: 94, height: 29.5, shotType: 'action-shot' },
    ],
  },
  {
    id: '4-grid',
    name: '4-Panel Balanced Grid (2x2)',
    description: 'Clean four-panel story pacing with equal emphasis on each moment.',
    panelCount: 4,
    panels: [
      { x: 3, y: 3, width: 45.5, height: 45.5, shotType: 'medium-shot' },
      { x: 51.5, y: 3, width: 45.5, height: 45.5, shotType: 'close-up' },
      { x: 3, y: 51.5, width: 45.5, height: 45.5, shotType: 'medium-shot' },
      { x: 51.5, y: 51.5, width: 45.5, height: 45.5, shotType: 'action-shot' },
    ],
  },
  {
    id: '5-dynamic',
    name: '5-Panel Dynamic Action',
    description: 'One big top establishing panel followed by 4 fast-paced action panels below.',
    panelCount: 5,
    panels: [
      { x: 3, y: 3, width: 94, height: 42, shotType: 'wide-shot' },
      { x: 3, y: 48, width: 45.5, height: 22.5, shotType: 'medium-shot' },
      { x: 51.5, y: 48, width: 45.5, height: 22.5, shotType: 'close-up' },
      { x: 3, y: 73.5, width: 45.5, height: 23.5, shotType: 'close-up' },
      { x: 51.5, y: 73.5, width: 45.5, height: 23.5, shotType: 'action-shot' },
    ],
  },
  {
    id: '6-classic',
    name: '6-Panel Classic Comic Page (2x3)',
    description: 'Standard European bande dessinée layout with maximum narrative density.',
    panelCount: 6,
    panels: [
      { x: 3, y: 3, width: 45.5, height: 29, shotType: 'medium-shot' },
      { x: 51.5, y: 3, width: 45.5, height: 29, shotType: 'close-up' },
      { x: 3, y: 35.5, width: 45.5, height: 29, shotType: 'wide-shot' },
      { x: 51.5, y: 35.5, width: 45.5, height: 29, shotType: 'medium-shot' },
      { x: 3, y: 68, width: 45.5, height: 29, shotType: 'close-up' },
      { x: 51.5, y: 68, width: 45.5, height: 29, shotType: 'action-shot' },
    ],
  },
];

