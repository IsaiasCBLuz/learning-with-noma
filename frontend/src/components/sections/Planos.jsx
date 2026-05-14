import { Box, Typography, Grid, Chip } from '@mui/material'

const PLANOS = [
  {
    group: 'Light',
    sub: '1x por semana',
    variants: [
      { name: 'Light', credits: 4, period: 'Mensal', tag: '' },
      { name: 'Light+', credits: 12, period: 'Trimestral', tag: '' },
      { name: 'Light++', credits: 24, period: 'Semestral', tag: '' },
      { name: 'Light ✦', credits: 48, period: 'Anual', tag: 'Melhor custo-benefício' },
    ],
    color: '#f0ead8',
  },
  {
    group: 'Full',
    sub: '2x por semana',
    variants: [
      { name: 'Full', credits: 8, period: 'Mensal', tag: '' },
      { name: 'Full+', credits: 24, period: 'Trimestral', tag: '' },
      { name: 'Full++', credits: 48, period: 'Semestral', tag: '' },
      { name: 'Full ✦', credits: 96, period: 'Anual', tag: 'Melhor custo-benefício' },
    ],
    color: '#dde8d5',
  },
  {
    group: 'Bee',
    sub: 'Suporte escolar',
    variants: [
      { name: 'Bee', credits: 4, period: 'Mensal', tag: 'Especial' },
    ],
    color: '#f5e8cf',
  },
]

export default function Planos() {
  return (
    <Box
      id="planos"
      sx={{ background: '#F5EFE4', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography variant="h2" sx={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#2E3B24', mb: 1 }}>
          Planos
        </Typography>
        <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 2 }}>
          Cada plano usa créditos — uma aula = um crédito.
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#7A8A6A', mb: 6, fontWeight: 300 }}>
          Aulas de 1h30 · Valores sob consulta
        </Typography>

        <Grid container spacing={4}>
          {PLANOS.map((plano) => (
            <Grid item xs={12} md={plano.group === 'Bee' ? 12 : 6} key={plano.group}>
              <Box
                sx={{
                  background: plano.color,
                  borderRadius: 3,
                  p: 4,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#2E3B24', mb: 0.5 }}
                >
                  {plano.group}
                </Typography>
                <Typography
                  sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', fontSize: '0.9rem', mb: 3 }}
                >
                  {plano.sub}
                </Typography>

                <Grid container spacing={2}>
                  {plano.variants.map((v) => (
                    <Grid item xs={12} sm={plano.group === 'Bee' ? 4 : 6} key={v.name}>
                      <Box
                        sx={{
                          background: 'rgba(255,255,255,0.65)',
                          borderRadius: 2,
                          p: 2.5,
                          border: '1px solid rgba(74,94,58,0.12)',
                          position: 'relative',
                        }}
                      >
                        {v.tag && (
                          <Chip
                            label={v.tag}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: 12,
                              background: '#C8881A',
                              color: '#fff',
                              fontSize: '0.65rem',
                            }}
                          />
                        )}
                        <Typography
                          sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.25rem', fontWeight: 500, mb: 0.5 }}
                        >
                          {v.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#7A8A6A', mb: 0.5 }}>{v.period}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#4A5E3A', fontWeight: 500 }}>
                          {v.credits} créditos
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#7A8A6A', fontWeight: 300, mb: 2 }}>
            Ficou com dúvida sobre qual plano é o ideal pra você?
          </Typography>
          <Typography
            component="a"
            href="https://wa.me/5515988137161?text=Oi%20Teacher%20Juli!%20Quero%20saber%20mais%20sobre%20os%20planos."
            target="_blank"
            sx={{
              color: '#4A5E3A',
              fontWeight: 500,
              fontSize: '0.875rem',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Fale comigo no WhatsApp →
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
