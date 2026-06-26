"""
NOMA Email Service — send transactional emails via SMTP.
Templates for invite, booking notifications, assessment, payment reminders.
"""
import smtplib
import secrets
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from ..config import settings


def generate_temp_password() -> str:
    """Generate a secure temporary password with uppercase, lowercase, and digits."""
    chars = string.ascii_letters + string.digits
    while True:
        pwd = "".join(secrets.choice(chars) for _ in range(10))
        if (any(c.isupper() for c in pwd)
                and any(c.islower() for c in pwd)
                and any(c.isdigit() for c in pwd)):
            return pwd


def _send(to: str, subject: str, html: str, plain: str) -> None:
    """Send an email via SMTP. Skips silently if SMTP_PASSWORD is not configured."""
    if not settings.SMTP_PASSWORD:
        print(f"[EMAIL SKIP] SMTP_PASSWORD not set. Would send to {to}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"NOMA English School <{settings.SMTP_USER}>"
    msg["To"] = to
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to, msg.as_string())


# ── Email wrapper for HTML ────────────────────────────────────────────────────

def _wrap_email(title: str, body_html: str) -> str:
    """Wrap body content in the NOMA email template."""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fdfaf5;border-radius:20px;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#2E3B24;padding:32px 40px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8881A;font-weight:600;">NOMA English School</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:24px;color:#F5EFE4;font-weight:600;line-height:1.3;">
              {title}
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            {body_html}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(74,94,58,0.1);">
            <p style="margin:0;font-size:12px;color:#9aaa8a;line-height:1.6;">
              Dúvidas? Fale com a Teacher Juli pelo
              <a href="https://wa.me/5515988137161" style="color:#4A5E3A;">WhatsApp (15) 98813-7161</a>
              ou <a href="https://instagram.com/learnwith.noma" style="color:#4A5E3A;">@learnwith.noma</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


# ── Invite (new student or admin) ─────────────────────────────────────────────

def send_invite_email(to: str, name: str, username: str, temp_password: str) -> None:
    first_name = name.split()[0]
    login_url = f"{settings.FRONTEND_URL}/login"

    plain = f"""Olá, {first_name}!

Você foi cadastrado(a) na plataforma NOMA English School pela Teacher Juli.

Seus dados de acesso:
  Usuário: {username}
  Senha temporária: {temp_password}

Acesse: {login_url}

Na sua primeira entrada, você será solicitado(a) a criar uma senha pessoal.

Qualquer dúvida, fale com a Teacher Juli pelo WhatsApp (15) 98813-7161.

NOMA English School
"""

    body = f"""
<p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
  Você foi cadastrado(a) na plataforma pela <strong>Teacher Juli</strong>.
  Use os dados abaixo para fazer seu primeiro acesso.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7A8A6A;font-weight:600;">Seus dados de acesso</p>
    <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Usuário:</span>&nbsp;&nbsp;<strong>{username}</strong>
    </p>
    <p style="margin:0;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Senha temporária:</span>&nbsp;&nbsp;
      <strong style="font-family:monospace;font-size:16px;letter-spacing:0.08em;color:#4A5E3A;">{temp_password}</strong>
    </p>
  </td></tr>
</table>
<p style="margin:0 0 28px;font-size:14px;color:#7A8A6A;line-height:1.7;">
  Ao entrar pela primeira vez, você será solicitado(a) a criar uma senha pessoal.
</p>
<table cellpadding="0" cellspacing="0">
  <tr><td style="background:#4A5E3A;border-radius:50px;">
    <a href="{login_url}" style="display:inline-block;padding:14px 32px;color:#F5EFE4;text-decoration:none;font-size:14px;font-weight:600;">
      Acessar minha área →
    </a>
  </td></tr>
</table>"""

    html = _wrap_email(f"Bem-vindo(a) à NOMA, {first_name}!", body)
    _send(to, "Seu acesso à NOMA English School", html, plain)


# ── Booking confirmed ─────────────────────────────────────────────────────────

def send_booking_confirmed_email(to: str, name: str, booking_date: str, time_slot: str) -> None:
    first_name = name.split()[0]

    plain = f"""Olá, {first_name}!

Sua aula foi confirmada:
  Data: {booking_date}
  Horário: {time_slot}

Nos vemos lá! 🎓

NOMA English School
"""

    body = f"""
<p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
  Sua aula foi <strong style="color:#4A5E3A;">confirmada</strong>! 🎉
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7A8A6A;font-weight:600;">Detalhes da aula</p>
    <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Data:</span>&nbsp;&nbsp;<strong>{booking_date}</strong>
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Horário:</span>&nbsp;&nbsp;<strong>{time_slot}</strong>
    </p>
    <p style="margin:0;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Duração:</span>&nbsp;&nbsp;<strong>1h30</strong>
    </p>
  </td></tr>
</table>
<p style="margin:0;font-size:14px;color:#7A8A6A;line-height:1.7;">
  Nos vemos lá! Qualquer mudança, acesse sua área ou fale com a Teacher Juli.
</p>"""

    html = _wrap_email(f"Aula confirmada, {first_name}! 🎓", body)
    _send(to, f"Aula confirmada — {booking_date} às {time_slot}", html, plain)


# ── Booking cancelled ─────────────────────────────────────────────────────────

def send_booking_cancelled_email(to: str, name: str, booking_date: str, time_slot: str,
                                  reason: str = None) -> None:
    first_name = name.split()[0]
    reason_text = f"\nMotivo: {reason}" if reason else ""

    plain = f"""Olá, {first_name}!

Sua aula do dia {booking_date} às {time_slot} foi cancelada.{reason_text}

Você pode agendar uma nova aula na sua área do aluno.

NOMA English School
"""

    reason_html = f'<p style="margin:16px 0 0;font-size:14px;color:#7A8A6A;">Motivo: {reason}</p>' if reason else ""

    body = f"""
<p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
  Sua aula foi <strong style="color:#c0392b;">cancelada</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Data:</span>&nbsp;&nbsp;<strong>{booking_date}</strong>
    </p>
    <p style="margin:0;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Horário:</span>&nbsp;&nbsp;<strong>{time_slot}</strong>
    </p>
    {reason_html}
  </td></tr>
</table>
<p style="margin:0;font-size:14px;color:#7A8A6A;line-height:1.7;">
  Você pode agendar uma nova aula na sua área do aluno.
</p>"""

    html = _wrap_email(f"Aula cancelada, {first_name}", body)
    _send(to, f"Aula cancelada — {booking_date} às {time_slot}", html, plain)


# ── Assessment available ──────────────────────────────────────────────────────

def send_assessment_email(to: str, name: str, assessment_title: str) -> None:
    first_name = name.split()[0]
    url = f"{settings.FRONTEND_URL}/aluno/avaliacoes"

    plain = f"""Olá, {first_name}!

Uma nova avaliação está disponível: {assessment_title}

Acesse sua área do aluno para realizá-la.

NOMA English School
"""

    body = f"""
<p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
  Uma nova avaliação está disponível para você! 📝
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0;font-size:16px;color:#2E3B24;font-weight:600;">
      {assessment_title}
    </p>
  </td></tr>
</table>
<table cellpadding="0" cellspacing="0">
  <tr><td style="background:#4A5E3A;border-radius:50px;">
    <a href="{url}" style="display:inline-block;padding:14px 32px;color:#F5EFE4;text-decoration:none;font-size:14px;font-weight:600;">
      Realizar avaliação →
    </a>
  </td></tr>
</table>"""

    html = _wrap_email(f"Nova avaliação, {first_name}! 📝", body)
    _send(to, f"Nova avaliação disponível — {assessment_title}", html, plain)


# ── Payment reminder ──────────────────────────────────────────────────────────

def send_payment_reminder_email(to: str, name: str, amount: str, due_date: str) -> None:
    first_name = name.split()[0]

    plain = f"""Olá, {first_name}!

Lembrete: você tem um pagamento pendente.
  Valor: R$ {amount}
  Vencimento: {due_date}

Qualquer dúvida, fale com a Teacher Juli.

NOMA English School
"""

    body = f"""
<p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
  Lembrete de pagamento pendente.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Valor:</span>&nbsp;&nbsp;<strong>R$ {amount}</strong>
    </p>
    <p style="margin:0;font-size:14px;color:#2E3B24;">
      <span style="color:#7A8A6A;">Vencimento:</span>&nbsp;&nbsp;<strong>{due_date}</strong>
    </p>
  </td></tr>
</table>"""

    html = _wrap_email(f"Pagamento pendente, {first_name}", body)
    _send(to, f"Lembrete de pagamento — vencimento {due_date}", html, plain)
