import type { Preset } from '../types.ts';

/**
 * Default preset: cool grey surfaces, a near-black brand fill in light mode and
 * a near-white one in dark mode, and a blue focus ring. It is deliberately
 * plain so a project can pick its own brand colour (copy this file, change the
 * `primary-*` family, run `npm run tokens`).
 */
export const neutral: Preset = {
  id: 'neutral',
  label: 'Neutral',
  light: {
    background: '#f6f7f8',
    surface: '#ffffff',
    'surface-dim': '#f7f8fa',
    popover: '#ffffff',
    'surface-elevated': '#ffffff',
    secondary: '#f0f1f3',
    'hover-row': '#e8eaee',
    'surface-solid-secondary': '#e4e6ea',
    kbd: '#e4e6ea',
    'switch-off': '#878c96',
    scrim: 'rgb(10 12 16 / 0.55)',

    'text-primary': '#111318',
    'text-secondary': '#3d424d',
    'text-muted': '#5b616e',
    'text-inactive': '#6f7580',

    primary: '#18181b',
    'primary-foreground': '#fafafa',
    'primary-hover': '#3f3f46',
    'primary-container': '#27272a',
    'primary-text': '#18181b',
    'primary-highlight': '#2f5fd0',
    'primary-light': '#e8eaee',
    'primary-tint': '#f3f4f6',
    brand: '#2f5fd0',
    'brand-text': '#2f5fd0',
    'brand-tint': '#eaf0fc',

    'brand-panel-from': '#27272a',
    'brand-panel-to': '#09090b',

    stroke: '#e3e5e9',
    'stroke-subtle': '#eceef1',
    'stroke-strong': '#d3d6dc',

    'neutral-700': '#111318',
    'neutral-600': '#3d424d',
    'neutral-500': '#6f7580',
    'neutral-400': '#b8bcc4',
    'neutral-300': '#d3d6dc',
    'neutral-200': '#e4e6ea',
    'neutral-50': '#f0f1f3',

    sidebar: '#ffffff',
    'sidebar-foreground': '#111318',
    'sidebar-accent': '#eef0f3',
    'sidebar-accent-foreground': '#18181b',
    'sidebar-selected': '#18181b',
    'sidebar-selected-foreground': '#ffffff',
    'sidebar-border': '#e3e5e9',

    'chart-1': '#4c6ef5',
    'chart-2': '#37b24d',
    'chart-3': '#f59f00',
    'chart-4': '#e8590c',
    'chart-5': '#1098ad',
  },
  dark: {
    background: '#0e0f12',
    surface: '#1a1c21',
    'surface-dim': '#15171b',
    popover: '#252830',
    'surface-elevated': '#20232a',
    secondary: '#22252b',
    'hover-row': '#2e323b',
    'surface-solid-secondary': '#1f2228',
    kbd: '#262a31',
    'switch-off': '#6b717c',
    scrim: 'rgb(0 0 0 / 0.6)',

    'text-primary': '#f4f5f7',
    'text-secondary': '#c4c8d0',
    'text-muted': '#9a9fab',
    'text-inactive': '#9a9fab',

    primary: '#f4f5f7',
    'primary-foreground': '#111318',
    'primary-hover': '#d9dbe0',
    'primary-container': '#d9dbe0',
    'primary-text': '#f4f5f7',
    'primary-highlight': '#7da2ff',
    'primary-light': '#323744',
    'primary-tint': '#1f2228',
    brand: '#7da2ff',
    'brand-text': '#8aabff',
    'brand-tint': '#1f2a44',

    'brand-panel-from': '#27272a',
    'brand-panel-to': '#09090b',

    stroke: '#2a2d34',
    'stroke-subtle': '#22252b',
    'stroke-strong': '#3a3e47',

    'neutral-700': '#f4f5f7',
    'neutral-600': '#c4c8d0',
    'neutral-500': '#9a9fab',
    'neutral-400': '#5c616c',
    'neutral-300': '#3a3e47',
    'neutral-200': '#2a2d34',
    'neutral-50': '#17181c',

    sidebar: '#15171b',
    'sidebar-foreground': '#f4f5f7',
    'sidebar-accent': '#232730',
    'sidebar-accent-foreground': '#f4f5f7',
    'sidebar-selected': '#e8eaee',
    'sidebar-selected-foreground': '#111318',
    'sidebar-border': '#2a2d34',

    'chart-1': '#748ffc',
    'chart-2': '#51cf66',
    'chart-3': '#fcc419',
    'chart-4': '#ff922b',
    'chart-5': '#3bc9db',
  },
};
