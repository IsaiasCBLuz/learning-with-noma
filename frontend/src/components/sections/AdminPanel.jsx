import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, Tab, Tabs, Grid,
  Chip, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

const PLAN_OPTIONS = [
  { value: 'light', label: 'Light (4cr / 1x semana)' },
  { value: 'light_plus', label: 'Light+ (12cr / 1x semana)' },
  { value: 'light_plusplus', label: 'Light++ (24cr / 1x semana)' },
  { value: 'light_star', label: 'Light ✦ (48cr / 1x semana)' },
  { value: 'full', label: 'Full (8cr / 2x semana)' },
  { value: 'full_plus', label: 'Full+ (24cr / 2x semana)' },
  { value: 'full_plusplus', label: 'Full++ (48cr / 2x semana)' },
  { value: 'full_star', label: 'Full ✦ (96cr / 2x semana)' },
  { value: 'bee', label: 'Bee (4cr / 1x semana)' },
]

const PLAN_LABEL = Object.fromEntries(PLAN_OPTIONS.map(p => [p.value, p.label]))

export default function AdminPanel({ open, onClose }) {
  const { adminLogin, isAdmin, logout } = useAuth()
  const [tab, setTab] = useState('students')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [bookings, setBookings] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [addDialog, setAddDialog] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', phone: '', plan: 'light', start_date: '', end_date: '' })
  const [addError, setAddError] = useState('')

  const fetchAll = useCallback(async () => {
    if (!isAdmin) return
    setDataLoading(true)
    try {
      const [s, b, q] = await Promise.all([
        api.get('/admin/students'),
        api.get('/bookings/admin/all'),
        api.get('/quiz/'),
      ])
      setStudents(s.data)
      setBookings(b.data)
      setQuizzes(q.data)
    } catch {
      // silent
    } finally {
      setDataLoading(false)
    }
  }, [isAdmin])

  useEffect(() => { if (isAdmin && open) fetchAll() }, [isAdmin, open, fetchAll])

  const handleAdminLogin = async () => {
    setAdminError('')
    setAdminLoading(true)
    try {
      await adminLogin(adminPassword)
    } catch {
      setAdminError('Senha incorreta')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Remover este aluno?')) return
    await api.delete(`/admin/students/${id}`)
    fetchAll()
  }

  const handleAddStudent = async () => {
    setAddError('')
    try {
      await api.post('/admin/students', {
        ...newStudent,
        start_date: newStudent.start_date || null,
        end_date: newStudent.end_date || null,
      })
      setAddDialog(false)
      setNewStudent({ name: '', email: '', password: '', phone: '', plan: 'light', start_date: '', end_date: '' })
      fetchAll()
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Erro ao criar aluno')
    }
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return
    await api.delete(`/bookings/${id}`)
    fetchAll()
  }

  const exportCSV = () => {
    const rows = [['Aluno', 'Data', 'Horário', 'Status', 'Criado em']]
    bookings.forEach(b => rows.push([
      b.student_name || '—', b.date, b.time_slot, b.status,
      new Date(b.created_at).toLocaleString('pt-BR'),
    ]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'agendamentos.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!open) return null

  return (
    <Box
      id="admin"
      sx={{
        position: 'fixed', inset: 0, zIndex: 1300,
        background: '#1a2412',
        overflowY: 'auto',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EFE4' }}
          >
            Painel Admin — NOMA
          </Typography>
          <Button variant="outlined" onClick={onClose} sx={{ color: '#F5EFE4', borderColor: 'rgba(245,239,228,0.3)' }}>
            Fechar
          </Button>
        </Box>

        {!isAdmin ? (
          <Box sx={{ maxWidth: 360, mx: 'auto', mt: 8 }}>
            <Typography sx={{ color: '#F5EFE4', mb: 2, textAlign: 'center' }}>
              Acesso restrito
            </Typography>
            <TextField
              type="password"
              label="Senha admin"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              InputLabelProps={{ sx: { color: 'rgba(245,239,228,0.6)' } }}
              inputProps={{ style: { color: '#F5EFE4' } }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(245,239,228,0.3)' } }}
            />
            {adminError && <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert>}
            <Button
              variant="contained"
              fullWidth
              onClick={handleAdminLogin}
              disabled={adminLoading}
              sx={{ background: '#C8881A', '&:hover': { background: '#E5A82A' } }}
            >
              Entrar
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button size="small" onClick={logout} sx={{ color: 'rgba(245,239,228,0.5)' }}>Sair do admin</Button>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                mb: 3,
                '& .MuiTab-root': { color: 'rgba(245,239,228,0.5)' },
                '& .Mui-selected': { color: '#F5EFE4' },
                '& .MuiTabs-indicator': { background: '#C8881A' },
              }}
            >
              <Tab label="Alunos" value="students" />
              <Tab label="Agendamentos" value="bookings" />
              <Tab label="Quiz" value="quiz" />
            </Tabs>

            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#C8881A' }} /></Box>
            ) : (
              <>
                {tab === 'students' && (
                  <StudentsTab
                    students={students}
                    onDelete={handleDeleteStudent}
                    onAdd={() => setAddDialog(true)}
                    onRefresh={fetchAll}
                  />
                )}
                {tab === 'bookings' && (
                  <BookingsTab bookings={bookings} onCancel={handleCancelBooking} onExport={exportCSV} />
                )}
                {tab === 'quiz' && <QuizTab quizzes={quizzes} />}
              </>
            )}
          </>
        )}
      </Box>

      {/* Add Student Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar aluno</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nome" value={newStudent.name} onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))} fullWidth size="small" />
            <TextField label="Email" type="email" value={newStudent.email} onChange={e => setNewStudent(p => ({ ...p, email: e.target.value }))} fullWidth size="small" />
            <TextField label="Senha inicial" type="password" value={newStudent.password} onChange={e => setNewStudent(p => ({ ...p, password: e.target.value }))} fullWidth size="small" />
            <TextField label="WhatsApp" value={newStudent.phone} onChange={e => setNewStudent(p => ({ ...p, phone: e.target.value }))} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Plano</InputLabel>
              <Select value={newStudent.plan} label="Plano" onChange={e => setNewStudent(p => ({ ...p, plan: e.target.value }))}>
                {PLAN_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Início (AAAA-MM-DD)" value={newStudent.start_date} onChange={e => setNewStudent(p => ({ ...p, start_date: e.target.value }))} fullWidth size="small" />
            <TextField label="Fim (AAAA-MM-DD)" value={newStudent.end_date} onChange={e => setNewStudent(p => ({ ...p, end_date: e.target.value }))} fullWidth size="small" />
            {addError && <Alert severity="error">{addError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddStudent}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function StudentsTab({ students, onDelete, onAdd, onRefresh }) {
  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'plan',
      headerName: 'Plano',
      flex: 1,
      renderCell: ({ row }) => row.profile ? (
        <Chip label={PLAN_LABEL[row.profile.plan] || row.profile.plan} size="small" sx={{ background: '#2E3B24', color: '#F5EFE4', fontSize: '0.7rem' }} />
      ) : '—',
    },
    {
      field: 'credits',
      headerName: 'Créditos',
      width: 140,
      renderCell: ({ row }) => row.profile
        ? `${row.profile.credits_used}/${row.profile.credits_total}`
        : '—',
    },
    {
      field: 'created_at',
      headerName: 'Cadastro',
      width: 140,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      renderCell: ({ row }) => (
        <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} sx={{ background: '#C8881A', '&:hover': { background: '#E5A82A' } }}>
          Novo aluno
        </Button>
      </Box>
      <Box sx={{ height: 500, background: '#fff', borderRadius: 2 }}>
        <DataGrid
          rows={students}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Box>
  )
}

function BookingsTab({ bookings, onCancel, onExport }) {
  const columns = [
    { field: 'student_name', headerName: 'Aluno', flex: 1 },
    { field: 'date', headerName: 'Data', width: 110 },
    { field: 'time_slot', headerName: 'Horário', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" sx={{ background: '#4A5E3A', color: '#fff', fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Agendado em',
      width: 150,
      renderCell: ({ value }) => new Date(value).toLocaleString('pt-BR'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      renderCell: ({ row }) => (
        <Button size="small" color="error" onClick={() => onCancel(row.id)}>Cancelar</Button>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" onClick={onExport} sx={{ color: '#F5EFE4', borderColor: 'rgba(245,239,228,0.3)' }}>
          Exportar CSV
        </Button>
      </Box>
      <Box sx={{ height: 500, background: '#fff', borderRadius: 2 }}>
        <DataGrid
          rows={bookings}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Box>
  )
}

function QuizTab({ quizzes }) {
  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'result_turma', headerName: 'Turma', width: 130 },
    { field: 'result_estilo', headerName: 'Estilo', width: 100 },
    { field: 'result_metodo', headerName: 'Método', width: 100 },
    { field: 'result_plano', headerName: 'Plano', width: 100 },
    {
      field: 'created_at',
      headerName: 'Data',
      width: 140,
      renderCell: ({ value }) => new Date(value).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <Box sx={{ height: 500, background: '#fff', borderRadius: 2 }}>
      <DataGrid
        rows={quizzes}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
      />
    </Box>
  )
}
