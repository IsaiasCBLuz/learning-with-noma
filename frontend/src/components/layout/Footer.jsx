import { Box, Typography, IconButton, Link } from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: '#2E3B24',
        color: '#F5EFE4',
        py: 5,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 0.5 }}
      >
        NOMA
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Lora", serif',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          opacity: 0.7,
          mb: 2,
        }}
      >
        Own your path.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        <IconButton
          href="https://www.instagram.com/learnwith.noma"
          target="_blank"
          sx={{ color: '#F5EFE4', opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          href="https://wa.me/5515988137161"
          target="_blank"
          sx={{ color: '#F5EFE4', opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <WhatsAppIcon />
        </IconButton>
      </Box>

      <Typography sx={{ fontSize: '0.75rem', opacity: 0.5 }}>
        © {new Date().getFullYear()} NOMA · Teacher Juli ·{' '}
        <Link href="#politica" sx={{ color: 'inherit', textDecoration: 'underline' }}>
          Política de Privacidade
        </Link>
      </Typography>
    </Box>
  )
}
