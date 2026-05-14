import { Box, Typography, Grid } from '@mui/material'

export default function TeacherJuli() {
  return (
    <Box
      id="teacher"
      sx={{ background: '#F5EFE4', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Grid container spacing={6} alignItems="center">
          {/* Foto: frontend/public/images/teacher-juli.jpg */}
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src="/images/teacher-juli.jpg"
              alt="Teacher Juli"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
              sx={{
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
            {/* Placeholder enquanto a foto não for adicionada */}
            <Box
              sx={{
                display: 'none',
                width: '100%',
                aspectRatio: '3/4',
                background: 'rgba(74,94,58,0.1)',
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7A8A6A',
                fontSize: '0.875rem',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography sx={{ color: '#7A8A6A', fontSize: '0.8rem' }}>
                Adicione a foto em:
              </Typography>
              <Typography sx={{ color: '#4A5E3A', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                frontend/public/images/teacher-juli.jpg
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography
              variant="h2"
              sx={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#2E3B24', mb: 2 }}
            >
              Teacher Juli
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Lora", serif',
                fontStyle: 'italic',
                color: '#C8881A',
                mb: 3,
                fontSize: '1rem',
              }}
            >
              "Recalculando rota" — a história da NOMA
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 300,
                color: '#4A5E3A',
                lineHeight: 1.8,
                mb: 2,
              }}
            >
              Comecei a faculdade de farmácia. Não era o que eu queria, mas era o caminho "certo". Um dia resolvi parar, respirar e recalcular a rota — e foi aí que o inglês entrou na minha vida de verdade.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 300,
                color: '#4A5E3A',
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              NOMA vem de nômade. A ideia de pertencer a vários lugares ao mesmo tempo, de não ter um único caminho fixo. É exatamente o que quero para os meus alunos: um inglês que os leve a qualquer lugar — real ou metafórico.
            </Typography>

            <Box
              sx={{
                p: 3,
                background: 'rgba(74,94,58,0.07)',
                borderLeft: '3px solid #C8881A',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Lora", serif',
                  fontStyle: 'italic',
                  color: '#2E3B24',
                  lineHeight: 1.7,
                }}
              >
                "Eu não ensino inglês. Eu abro uma porta para que cada aluno descubra o seu próprio caminho dentro do idioma."
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
