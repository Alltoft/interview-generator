export default function SkeletonCard() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--c-border)',
        padding: '1.5rem 0',
        display: 'flex',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          width: '1.5rem',
          height: '0.75rem',
          borderRadius: '2px',
          background: 'var(--c-border)',
          marginTop: '0.2rem',
          animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div
          style={{
            height: '1rem',
            borderRadius: '2px',
            background: 'var(--c-border)',
            width: '90%',
            animation: 'skeleton-pulse 1.6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '1rem',
            borderRadius: '2px',
            background: 'var(--c-border)',
            width: '70%',
            animation: 'skeleton-pulse 1.6s ease-in-out infinite 0.2s',
          }}
        />
      </div>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
