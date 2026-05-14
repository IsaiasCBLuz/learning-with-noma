import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const ITEMS = [
  {
    title: 'Quais dados coletamos?',
    content: 'Nome, email e WhatsApp (opcional) ao preencher o quiz ou criar sua conta. Respostas do quiz para personalizar sua experiência.',
  },
  {
    title: 'Como usamos seus dados?',
    content: 'Para entrar em contato após o quiz, gerenciar seus agendamentos e personalizar sua jornada de aprendizado. Nunca vendemos, compartilhamos ou usamos para publicidade.',
  },
  {
    title: 'Por quanto tempo mantemos?',
    content: 'Dados do quiz e contato: até 2 anos. Agendamentos: até 6 meses após a conclusão. Conta de aluno: enquanto o contrato estiver ativo.',
  },
  {
    title: 'Seus direitos (LGPD)',
    content: 'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo WhatsApp: +55 15 98813-7161.',
  },
]

export default function Politica() {
  return (
    <Box
      id="politica"
      sx={{ background: '#2E3B24', py: { xs: 5, md: 8 }, px: { xs: 3, md: 6 } }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EFE4', mb: 1 }}
        >
          Política de Privacidade
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Lora", serif',
            fontStyle: 'italic',
            color: 'rgba(245,239,228,0.6)',
            mb: 4,
            fontSize: '0.875rem',
          }}
        >
          Conforme a LGPD (Lei nº 13.709/2018)
        </Typography>

        {ITEMS.map((item) => (
          <Accordion
            key={item.title}
            sx={{
              background: 'rgba(245,239,228,0.05)',
              border: '1px solid rgba(245,239,228,0.1)',
              borderRadius: '8px !important',
              mb: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(245,239,228,0.7)' }} />}>
              <Typography sx={{ color: '#F5EFE4', fontSize: '0.9rem', fontWeight: 400 }}>
                {item.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: 'rgba(245,239,228,0.7)', fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.7 }}>
                {item.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}
