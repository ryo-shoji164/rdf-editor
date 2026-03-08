import { type Step } from 'react-joyride'
import { type TFunction } from 'i18next'

export const getSteps = (t: TFunction): Step[] => [
  {
    target: 'body',
    placement: 'center',
    content: t('onboarding.steps.welcome'),
    disableBeacon: true,
  },
  {
    target: '#joyride-toolbar',
    placement: 'bottom',
    content: t('onboarding.steps.toolbar'),
  },
  {
    target: '#joyride-mode-toggle',
    placement: 'bottom',
    content: t('onboarding.steps.modeToggle'),
  },
  {
    target: '#joyride-view-toggle',
    placement: 'bottom',
    content: t('onboarding.steps.viewToggle'),
  },
  {
    target: '#joyride-templates',
    placement: 'bottom',
    content: t('onboarding.steps.templates'),
  },
  {
    target: '#joyride-editor',
    placement: 'right',
    content: t('onboarding.steps.editor'),
  },
  {
    target: '#joyride-graph',
    placement: 'left',
    content: t('onboarding.steps.graph'),
  },
  {
    target: '#joyride-table',
    placement: 'top',
    content: t('onboarding.steps.table'),
  },
  {
    target: '#joyride-help',
    placement: 'bottom',
    content: t('onboarding.steps.help'),
  },
]
