import { useEffect, useState } from 'react'
import Joyride, { CallBackProps, STATUS } from 'react-joyride'
import { useTranslation } from 'react-i18next'
import { getSteps } from '../../lib/onboarding/steps'

interface OnboardingTourProps {
    run: boolean
    onFinish: () => void
}

const ONBOARDING_KEY = 'rdf-editor-onboarding-complete'

export default function OnboardingTour({ run, onFinish }: OnboardingTourProps) {
    const { t } = useTranslation()
    const [isReady, setIsReady] = useState(false)

    // Avoid running on the very first mount if we aren't sure about the DOM
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500)
        return () => clearTimeout(timer)
    }, [])

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            localStorage.setItem(ONBOARDING_KEY, 'true')
            onFinish()
        }
    }

    if (!isReady) return null

    return (
        <Joyride
            steps={getSteps(t)}
            run={run}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            disableScrolling={false}
            callback={handleJoyrideCallback}
            locale={{
                back: t('onboarding.buttons.back'),
                close: t('onboarding.buttons.close'),
                last: t('onboarding.buttons.last'),
                next: t('onboarding.buttons.next'),
                skip: t('onboarding.buttons.skip'),
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#3b82f6', // accent-blue
                    backgroundColor: '#1e1e2e', // surface
                    textColor: '#cdd6f4', // text-primary
                    arrowColor: '#1e1e2e',
                },
                buttonNext: {
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                },
                buttonBack: {
                    fontSize: '12px',
                    marginRight: '8px',
                    color: '#a6adc8', // text-muted
                },
                buttonSkip: {
                    fontSize: '12px',
                    color: '#a6adc8',
                },
                tooltipContent: {
                    fontSize: '13px',
                    padding: '10px 5px',
                },
                tooltipTitle: {
                    fontSize: '15px',
                    fontWeight: 'bold',
                },
            }}
        />
    )
}
