import { Box, Typography, Grid, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const BENEFITS = [
  '30 minutos de conversa real',
  'Diagnóstico do seu nível atual',
  'Apresentação personalizada das turmas',
  'Sem compromisso, sem pressão',
]

export default function AulaExperimental() {
  return (
    <Box
      id="experimental"
      sx={{ background: '#2E3B24', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#F5EFE4',
                mb: 2,
              }}
            >
              Aula Experimental
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Lora", serif',
                fontStyle: 'italic',
                color: '#E5A82A',
                mb: 3,
                fontSize: '1.05rem',
              }}
            >
              Gratuita. Sem compromisso.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 300,
                color: 'rgba(245,239,228,0.75)',
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              Antes de começar, você vai ter uma conversa comigo. Vamos entender onde você está e para onde quer ir — juntos.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://wa.me/5515988137161?text=Oi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental!"
              target="_blank"
              sx={{
                background: '#C8881A',
                color: '#F5EFE4',
                px: 4,
                py: 1.5,
                '&:hover': { background: '#E5A82A' },
              }}
            >
              Agendar pelo WhatsApp
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <List disablePadding>
              {BENEFITS.map((b) => (
                <ListItem key={b} disablePadding sx={{ mb: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#E5A82A', fontSize: '1.1rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={b}
                    primaryTypographyProps={{
                      fontSize: '0.9375rem',
                      fontWeight: 300,
                      color: 'rgba(245,239,228,0.85)',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
