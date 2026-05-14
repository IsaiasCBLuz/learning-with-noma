import { Box, Typography, Grid } from '@mui/material'

const ESSENCIAS = [
  {
    icon: '✦',
    color: '#C8881A',
    title: 'Confiança',
    desc: 'Você vai falar inglês. Não é questão de se, é questão de quando.',
  },
  {
    icon: '✦',
    color: '#4A5E3A',
    title: 'Evolução',
    desc: 'Cada aula é um passo. Cada passo é crescimento.',
  },
  {
    icon: '✦',
    color: '#6B7E59',
    title: 'Curiosidade',
    desc: 'O inglês abre portas para mundos que você ainda vai descobrir.',
  },
  {
    icon: '✦',
    color: '#E5A82A',
    title: 'Humanidade',
    desc: 'Você não é um aluno. Você é uma pessoa com uma história.',
  },
]

export default function Valores() {
  return (
    <Box
      id="essencia"
      sx={{
        background: '#F5EFE4',
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            color: '#2E3B24',
            mb: 1,
          }}
        >
          Nossa essência
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Lora", serif',
            fontStyle: 'italic',
            color: '#7A8A6A',
            mb: 6,
          }}
        >
          Os princípios que guiam cada aula.
        </Typography>

        <Grid container spacing={3}>
          {ESSENCIAS.map((e) => (
            <Grid item xs={12} sm={6} md={3} key={e.title}>
              <Box
                sx={{
                  background: '#fff',
                  borderRadius: 3,
                  p: 3.5,
                  height: '100%',
                  boxShadow: '0 2px 12px rgba(46,59,36,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(46,59,36,0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: e.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: '#F5EFE4',
                    fontSize: '1.1rem',
                  }}
                >
                  {e.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.25rem', mb: 1, color: '#2E3B24' }}
                >
                  {e.title}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: '#7A8A6A', lineHeight: 1.6 }}>
                  {e.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
