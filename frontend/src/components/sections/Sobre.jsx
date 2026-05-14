import { Box, Typography, Grid } from '@mui/material'

const VALUES = [
  { title: 'Acolhimento', desc: 'Um espaço seguro onde errar faz parte do processo.' },
  { title: 'Leveza', desc: 'Aprender não precisa ser pesado. Aqui, é com prazer.' },
  { title: 'Autenticidade', desc: 'Seu inglês, do seu jeito. Sem fórmulas prontas.' },
  { title: 'Progresso Real', desc: 'Sem ilusões. Evolução consistente, passo a passo.' },
]

export default function Sobre() {
  return (
    <Box
      id="sobre"
      sx={{
        background: '#2E3B24',
        color: '#F5EFE4',
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(245,239,228,0.03) 0px,
            rgba(245,239,228,0.03) 1px,
            transparent 1px,
            transparent 12px
          )`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ mb: 6, maxWidth: 700 }}>
          <Typography
            component="p"
            sx={{
              fontFamily: '"Lora", serif',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'rgba(245,239,228,0.85)',
              mb: 2,
            }}
          >
            "Nossa missão é transformar o aprendizado do inglês em uma jornada autêntica e significativa."
          </Typography>
          <Typography
            sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'rgba(245,239,228,0.6)', lineHeight: 1.7 }}
          >
            Na NOMA, acreditamos que cada pessoa aprende de um jeito único. Por isso, combinamos método pedagógico sólido com uma abordagem humana — para que você não apenas aprenda inglês, mas se conecte com o idioma de verdade.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid item xs={12} sm={6} md={3} key={v.title}>
              <Box
                sx={{
                  border: '1px solid rgba(245,239,228,0.15)',
                  borderRadius: 2,
                  p: 3,
                  background: 'rgba(245,239,228,0.07)',
                  height: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1.2rem',
                    mb: 1,
                    color: '#E5A82A',
                  }}
                >
                  {v.title}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'rgba(245,239,228,0.7)', lineHeight: 1.6 }}>
                  {v.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
