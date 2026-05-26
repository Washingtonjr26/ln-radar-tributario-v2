export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        LN Radar Tributário
      </h1>

      <p style={{ fontSize: '20px', maxWidth: '700px', textAlign: 'center' }}>
        Inteligência estratégica em Reforma Tributária para empresários.
      </p>
    </main>
  )
}