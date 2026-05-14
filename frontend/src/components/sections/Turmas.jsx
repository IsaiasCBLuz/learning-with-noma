import { Box, Typography, Grid, Chip } from '@mui/material'

const TURMAS = [
  {
    name: 'NOMA Sprouts',
    age: '8 a 11 anos',
    tag: 'Pequenos exploradores',
    color: '#f5e6c8',
    desc: 'Inglês como aventura. Histórias, jogos e descobertas que tornam o aprendizado natural e divertido.',
  },
  {
    name: 'NOMA Buds',
    age: '12 a 17 anos',
    tag: 'Cultura, tecnologia e mundo',
    color: '#dde8d5',
    desc: 'Conectando o inglês com a realidade dos jovens — séries, música, tendências e o futuro que eles vão construir.',
  },
  {
    name: 'NOMA Bloom',
    age: '18+ anos',
    tag: 'Trabalho, viagens e relacionamentos',
    color: '#ede8df',
    desc: 'Inglês para a vida adulta. Conversas reais, vocabulário prático e confiança para qualquer situação.',
  },
]

const ESTILOS = [
  {
    icon: '✈',
    name: 'Flow',
    desc: 'Comunicação em primeiro lugar. Prática oral intensa com situações reais.',
  },
  {
    icon: '🌱',
    name: 'Roots',
    desc: 'Base gramatical sólida. Estrutura para quem quer ler, escrever e falar com precisão.',
  },
  {
    icon: '🐝',
    name: 'Bee',
    desc: 'Suporte escolar contextualizado. Inglês da escola com significado, sem decoreba.',
  },
]

const METODOS = [
  {
    icon: '✦',
    name: 'Quest',
    desc: 'Novo tema a cada aula. Vocabulário construído por contexto e descoberta.',
  },
  {
    icon: '✦',
    name: 'Level',
    desc: 'Gamificado. Desafios, conquistas e progressão que tornam o aprendizado viciante.',
  },
]

export default function Turmas() {
  return (
    <Box id="turmas" sx={{ background: '#F5EFE4', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Turmas */}
        <Typography variant="h2" sx={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#2E3B24', mb: 1 }}>
          Turmas
        </Typography>
        <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 5 }}>
          Cada idade, uma jornada única.
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {TURMAS.map((t) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box
                sx={{
                  background: t.color,
                  borderRadius: 3,
                  p: 3.5,
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Chip
                  label={t.age}
                  size="small"
                  sx={{ background: 'rgba(46,59,36,0.1)', color: '#2E3B24', mb: 2, fontSize: '0.75rem' }}
                />
                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 0.5 }}>
                  {t.name}
                </Typography>
                <Typography
                  sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', fontSize: '0.85rem', color: '#7A8A6A', mb: 2 }}
                >
                  {t.tag}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: '#4A5E3A', lineHeight: 1.65 }}>
                  {t.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Estilos */}
        <Typography variant="h3" sx={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: '#2E3B24', mb: 1 }}>
          Estilos de ensino
        </Typography>
        <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 4 }}>
          Como você aprende melhor?
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {ESTILOS.map((e) => (
            <Grid item xs={12} sm={4} key={e.name}>
              <Box sx={{ p: 3, border: '1px solid rgba(74,94,58,0.2)', borderRadius: 2, height: '100%' }}>
                <Typography sx={{ fontSize: '1.5rem', mb: 1.5 }}>{e.icon}</Typography>
                <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 1 }}>
                  {e.name}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: '#7A8A6A', lineHeight: 1.6 }}>
                  {e.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Métodos */}
        <Typography variant="h3" sx={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: '#2E3B24', mb: 1 }}>
          Métodos
        </Typography>
        <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 4 }}>
          A dinâmica das aulas.
        </Typography>
        <Grid container spacing={3}>
          {METODOS.map((m) => (
            <Grid item xs={12} sm={6} key={m.name}>
              <Box sx={{ p: 3, background: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(46,59,36,0.06)' }}>
                <Typography sx={{ color: '#C8881A', mb: 1 }}>{m.icon}</Typography>
                <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 1 }}>
                  {m.name}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: '#7A8A6A', lineHeight: 1.6 }}>
                  {m.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
