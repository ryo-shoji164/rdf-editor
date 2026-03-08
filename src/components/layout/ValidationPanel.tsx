import { AlertCircle, AlertTriangle, CheckCircle2, Info, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRdfStore } from '../../store/rdfStore'
import { useValidationStore } from '../../store/validationStore'
import type { ValidationResult } from '../../store/validationStore'

function SeverityIcon({ severity }: { severity: ValidationResult['severity'] }) {
  if (severity === 'error') return <AlertCircle size={13} className="text-accent-red shrink-0" />
  if (severity === 'warning')
    return <AlertTriangle size={13} className="text-accent-yellow shrink-0" />
  return <Info size={13} className="text-accent-blue shrink-0" />
}

export default function ValidationPanel() {
  const { t } = useTranslation()

  const shapesText = useValidationStore((s) => s.shapesText)
  const setShapesText = useValidationStore((s) => s.setShapesText)
  const results = useValidationStore((s) => s.results)
  const isValidating = useValidationStore((s) => s.isValidating)
  const runValidation = useValidationStore((s) => s.runValidation)
  const store = useRdfStore((s) => s.store)
  const turtleText = useRdfStore((s) => s.turtleText)

  function handleValidate() {
    runValidation(store, turtleText)
  }

  return (
    <div
      className="flex flex-col border-t border-surface-raised bg-surface-alt"
      style={{ height: 220 }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-surface-raised shrink-0">
        <Shield size={13} className="text-accent-purple" />
        <span className="text-xs font-medium text-text-primary">{t('validation.title')}</span>
        {isValidating && (
          <span className="text-xs text-text-muted ml-1">{t('validation.validating')}</span>
        )}
        {!isValidating && shapesText.trim() && results.length === 0 && (
          <span className="flex items-center gap-1 text-xs text-accent-green ml-1">
            <CheckCircle2 size={12} />
            {t('validation.conforms')}
          </span>
        )}
        {!isValidating && results.length > 0 && (
          <span className="text-xs text-accent-red ml-1">
            {results.length} {t('validation.violations')}
          </span>
        )}
        <button
          onClick={handleValidate}
          className="ml-auto px-2 py-0.5 text-xs rounded bg-surface-raised hover:bg-surface text-text-primary border border-surface-raised"
        >
          {t('validation.validate')}
        </button>
      </div>

      {/* Body: shapes editor on the left, results on the right */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* SHACL shapes input */}
        <div className="flex flex-col w-1/2 border-r border-surface-raised">
          <div className="px-3 py-1 text-[11px] text-text-muted border-b border-surface-raised shrink-0">
            {t('validation.shapesLabel')}
          </div>
          <textarea
            value={shapesText}
            onChange={(e) => setShapesText(e.target.value)}
            placeholder={t('validation.shapesPlaceholder')}
            className="flex-1 w-full p-2 text-xs font-mono bg-surface text-text-primary resize-none outline-none placeholder:text-text-muted"
            spellCheck={false}
          />
        </div>

        {/* Validation results */}
        <div className="flex flex-col w-1/2 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] text-text-muted border-b border-surface-raised shrink-0">
            {t('validation.resultsLabel')}
          </div>
          {results.length === 0 && !isValidating && (
            <div className="p-3 text-xs text-text-muted">
              {shapesText.trim() ? t('validation.noViolations') : t('validation.noShapes')}
            </div>
          )}
          {results.map((result, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 border-b border-surface-raised text-xs hover:bg-surface-raised"
            >
              <SeverityIcon severity={result.severity} />
              <div className="min-w-0">
                <div className="text-text-primary break-words">{result.message}</div>
                {result.focusNode && (
                  <div className="text-text-muted truncate mt-0.5">
                    {t('validation.focusNode')}: {result.focusNode}
                  </div>
                )}
                {result.path && (
                  <div className="text-text-muted truncate">
                    {t('validation.path')}: {result.path}
                  </div>
                )}
                {result.line != null && (
                  <div className="text-text-muted">
                    {t('validation.line')}: {result.line}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
