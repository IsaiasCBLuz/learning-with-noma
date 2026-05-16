import smtplib
import secrets
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from ..config import settings


def generate_temp_password() -> str:
    chars = string.ascii_letters + string.digits
    while True:
        pwd = "".join(secrets.choice(chars) for _ in range(10))
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd


def _send(to: str, subject: str, html: str, plain: str) -> None:
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


def send_invite_email(to: str, name: str, username: str, temp_password: str) -> None:
    login_url = f"{settings.FRONTEND_URL}/aluno/login"
    first_name = name.split()[0]

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

    html = f"""<!DOCTYPE html>
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
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:26px;color:#F5EFE4;font-weight:600;line-height:1.2;">
              Bem-vinda à NOMA, {first_name}!
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#5a6a4a;line-height:1.7;">
              Você foi cadastrado(a) na plataforma pela <strong>Teacher Juli</strong>.
              Use os dados abaixo para fazer seu primeiro acesso.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;border-radius:14px;margin:0 0 28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7A8A6A;font-weight:600;">Seus dados de acesso</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#2E3B24;">
                    <span style="color:#7A8A6A;">Usuário:</span>&nbsp;&nbsp;<strong>{username}</strong>
                  </p>
                  <p style="margin:0;font-size:14px;color:#2E3B24;">
                    <span style="color:#7A8A6A;">Senha temporária:</span>&nbsp;&nbsp;
                    <strong style="font-family:monospace;font-size:16px;letter-spacing:0.08em;color:#4A5E3A;">{temp_password}</strong>
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:14px;color:#7A8A6A;line-height:1.7;">
              Ao entrar pela primeira vez, você será solicitado(a) a criar uma senha pessoal.
            </p>

            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#4A5E3A;border-radius:50px;">
                  <a href="{login_url}" style="display:inline-block;padding:14px 32px;color:#F5EFE4;text-decoration:none;font-size:14px;font-weight:600;">
                    Acessar minha área →
                  </a>
                </td>
              </tr>
            </table>
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

    _send(to, "Seu acesso à NOMA English School", html, plain)
