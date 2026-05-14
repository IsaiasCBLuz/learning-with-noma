import { Box, Typography, Button, keyframes } from '@mui/material'

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`

// Coloque o arquivo da logo em: frontend/public/images/logo.png
// Se ainda não tiver a imagem, o fallback mostra "N"
const LOGO_SRC = '/images/logo.png'

export default function Hero() {
  return (
    <Box
      id="inicio"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        px: 3,
        background: '#F5EFE4',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-30%',
          right: '-20%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,94,58,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Floating logo */}
      <Box
        sx={{
          width: 100,
          height: 100,
          mb: 4,
          animation: `${float} 3s ease-in-out infinite`,
        }}
      >
        <Box
          component="img"
          src={LOGO_SRC}
          alt="NOMA"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {/* Fallback se a imagem não existir */}
        <Box
          sx={{
            display: 'none',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(74,94,58,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600, color: '#4A5E3A' }}>
            N
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontSize: 'clamp(3.5rem, 8vw, 7rem)',
          fontWeight: 500,
          color: '#2E3B24',
          lineHeight: 1.05,
          mb: 1,
        }}
      >
        Own your{' '}
        <Box component="em" sx={{ fontStyle: 'italic', color: '#4A5E3A' }}>
          path.
        </Box>
      </Typography>

      <Typography
        sx={{
          fontFamily: '"Lora", serif',
          fontStyle: 'italic',
          color: '#7A8A6A',
          fontSize: '1rem',
          mb: 0.5,
        }}
      >
        Escola virtual de inglês
      </Typography>
      <Typography
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          color: '#7A8A6A',
          fontSize: '0.8125rem',
          fontWeight: 300,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          mb: 3,
        }}
      >
        By Teacher Juli
      </Typography>

      <Typography
        sx={{
          maxWidth: 520,
          color: '#7A8A6A',
          fontSize: '0.9375rem',
          fontWeight: 300,
          lineHeight: 1.7,
          mb: 4,
        }}
      >
        Aprender inglês não precisa ser uma tortura. Aqui, você aprende do seu jeito — com método, leveza e propósito.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="contained" size="large" href="#quiz" sx={{ px: 4, py: 1.5 }}>
          Fazer o Quiz
        </Button>
        <Button variant="outlined" size="large" href="#turmas" sx={{ px: 4, py: 1.5 }}>
          Conhecer as turmas
        </Button>
      </Box>
    </Box>
  )
}
