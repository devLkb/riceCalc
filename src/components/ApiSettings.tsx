export function ApiSettings({
  apiKeyDraft,
  apiEnabled,
  apiKeyActive,
  apiError,
  onApiKeyDraftChange,
  onToggleApi,
}: {
  apiKeyDraft: string
  apiEnabled: boolean
  apiKeyActive: string
  apiError: string
  onApiKeyDraftChange: (value: string) => void
  onToggleApi: () => void
}) {
  return (
    <section className="api-box" aria-label="API 설정">
      <label className="field-label" htmlFor="apiKeyInput">
        API Key
      </label>
      <div className="api-actions">
        <input
          id="apiKeyInput"
          className="input"
          type="password"
          value={apiKeyDraft}
          onChange={(event) => onApiKeyDraftChange(event.target.value)}
          placeholder="API Key 입력"
        />
        <button type="button" className="btn btn-neon" onClick={onToggleApi}>
          {apiEnabled ? 'API 비활성화' : 'API 활성화'}
        </button>
      </div>
      <p className="status">
        상태: <span className={apiEnabled ? 'ok' : 'off'}>{apiEnabled ? '활성' : '비활성'}</span>
      </p>
      {apiKeyActive && <p className="note">활성 키: {apiKeyActive.slice(0, 4)}****</p>}
      {apiError && <p className="error">{apiError}</p>}
      <p className="note">공용 PC에서는 로그아웃에 주의하세요.</p>
    </section>
  )
}
