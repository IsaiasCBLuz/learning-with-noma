import { useState, useRef } from 'react'
import {
  AppBar, Toolbar, Box, IconButton, Drawer, List, ListItem,
  Button, Typography, Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { useAuth } from '../../contexts/AuthContext'

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Turmas', href: '#turmas' },
  { label: 'Planos', href: '#planos' },
  { label: 'Teacher Juli', href: '#teacher' },
  { label: 'Área do Aluno', href: '#aluno' },
]

const ADMIN_CLICK_COUNT = 5

export default function Navbar({ onAdminTrigger }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  const handleLogoClick = () => {
    clickCountRef.current += 1
    clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 2000)
    if (clickCountRef.current >= ADMIN_CLICK_COUNT) {
      clickCountRef.current = 0
      onAdminTrigger?.()
    }
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(245,239,228,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(74,94,58,0.12)',
          height: 72,
          justifyContent: 'center',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
          {/* Logo — coloque frontend/public/images/logo.png para ativar */}
          <Box
            onClick={handleLogoClick}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="NOMA"
              onError={(e) => { e.target.style.display = 'none' }}
              sx={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 600,
                fontSize: '1.5rem',
                color: '#2E3B24',
                letterSpacing: '0.05em',
              }}
            >
              NOMA
            </Typography>
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {NAV_LINKS.map((l) => (
              <Button
                key={l.href}
                href={l.href}
                sx={{
                  color: '#2E3B24',
                  fontSize: '0.8125rem',
                  fontWeight: 300,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  '&:hover': { color: '#4A5E3A', transform: 'none', background: 'none' },
                }}
              >
                {l.label}
              </Button>
            ))}
            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
              <IconButton size="small" href="https://www.instagram.com/learnwith.noma" target="_blank" sx={{ color: '#4A5E3A', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" href="https://wa.me/5515988137161" target="_blank" sx={{ color: '#4A5E3A', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Box>
            {user ? (
              <Button variant="outlined" size="small" onClick={logout} sx={{ ml: 1 }}>
                Sair
              </Button>
            ) : (
              <Button variant="contained" size="small" href="#aluno" sx={{ ml: 1 }}>
                Descubra seu plano
              </Button>
            )}
          </Box>

          {/* Mobile */}
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' }, color: '#2E3B24' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300, background: '#F5EFE4', p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#2E3B24' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List disablePadding>
          {NAV_LINKS.map((l) => (
            <ListItem key={l.href} disablePadding sx={{ mb: 1 }}>
              <Button
                fullWidth
                href={l.href}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#2E3B24',
                  fontSize: '1rem',
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {l.label}
              </Button>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2, borderColor: 'rgba(74,94,58,0.2)' }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton href="https://www.instagram.com/learnwith.noma" target="_blank" sx={{ color: '#4A5E3A' }}>
            <InstagramIcon />
          </IconButton>
          <IconButton href="https://wa.me/5515988137161" target="_blank" sx={{ color: '#4A5E3A' }}>
            <WhatsAppIcon />
          </IconButton>
        </Box>
        {user ? (
          <Button variant="outlined" fullWidth onClick={() => { logout(); setDrawerOpen(false) }}>Sair</Button>
        ) : (
          <Button variant="contained" fullWidth href="#aluno" onClick={() => setDrawerOpen(false)}>Descubra seu plano</Button>
        )}
      </Drawer>

      {/* Spacer */}
      <Box sx={{ height: 72 }} />
    </>
  )
}
