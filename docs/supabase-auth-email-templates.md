# Templates de e-mail do Supabase Auth

Use estes conteudos em Supabase > Authentication > Email Templates.

Configuracoes importantes em Authentication > URL Configuration:

- Site URL: `https://nexopsi.app.br`
- Redirect URLs:
  - `https://nexopsi.app.br/dashboard`
  - `https://nexopsi.app.br/login`
  - `https://nexopsi.app.br/login?modo=redefinir-senha`
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/login`

Remetente profissional recomendado, depois do Resend verificado:

- Sender email address: `noreply@nexopsi.app.br`
- Sender name: `Nexopsi`

Nao use `Nexopsi <noreply@nexopsi.app.br>` no campo Sender email address do Supabase.

Templates prontos em HTML:

- `supabase/email-templates/confirm-signup.html`
- `supabase/email-templates/reset-password.html`

## Confirm signup

Subject:

```text
Bem-vinda a Nexopsi - confirme seu acesso
```

HTML Body:

```html
<div style="margin:0;padding:0;background:#f6f8f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#245b68;padding:30px 32px;color:#ffffff;">
              <div style="font-size:28px;font-weight:800;">Nexopsi</div>
              <div style="margin-top:8px;font-size:14px;line-height:22px;color:#d9efea;">Gestao clinica segura, moderna e profissional.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 12px;">
              <h1 style="margin:0;font-size:24px;line-height:32px;color:#1f2937;">Obrigada pela compra. Seja bem-vinda a Nexopsi.</h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:24px;color:#667085;">
                Seu acesso foi criado com sucesso. Para proteger sua conta e ativar a plataforma, confirme seu e-mail pelo botao abaixo.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 32px 30px;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">
                Confirmar meu acesso
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="border:1px solid #d8eee8;background:#eef8f5;border-radius:10px;padding:16px;">
                <div style="font-size:14px;font-weight:800;color:#245b68;">Seguro e confidencial</div>
                <p style="margin:8px 0 0;font-size:13px;line-height:21px;color:#667085;">
                  A Nexopsi foi criada para organizar pacientes, agenda, documentos, relatorios e financeiro com acesso protegido.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 30px;">
              <p style="margin:0;font-size:13px;line-height:21px;color:#667085;">Se voce nao reconhece este cadastro, ignore este e-mail.</p>
              <p style="margin:16px 0 0;font-size:13px;line-height:21px;color:#667085;">Atenciosamente,<br /><strong style="color:#1f2937;">Equipe Nexopsi</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;text-align:center;font-size:12px;line-height:18px;color:#98a2b3;">
              Nexopsi - criado por ColliDev
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
```

Plain Text Body:

```text
Obrigada pela compra. Seja bem-vinda a Nexopsi.

Seu acesso foi criado com sucesso. Para proteger sua conta e ativar a plataforma, confirme seu e-mail pelo link abaixo:

{{ .ConfirmationURL }}

A Nexopsi foi criada para organizar pacientes, agenda, documentos, relatorios e financeiro com acesso protegido.

Se voce nao reconhece este cadastro, ignore este e-mail.

Equipe Nexopsi
Criado por ColliDev
```

## Reset password

Subject:

```text
Redefina sua senha da Nexopsi com seguranca
```

HTML Body:

```html
<div style="margin:0;padding:0;background:#f6f8f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#245b68;padding:28px 32px;color:#ffffff;">
              <div style="font-size:28px;font-weight:800;">Nexopsi</div>
              <div style="margin-top:8px;font-size:14px;line-height:22px;color:#d9efea;">Redefinicao de senha</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 12px;">
              <h1 style="margin:0;font-size:24px;line-height:32px;color:#1f2937;">Crie uma nova senha com seguranca.</h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:24px;color:#667085;">
                Recebemos uma solicitacao para redefinir sua senha da Nexopsi. Clique no botao abaixo para criar uma nova senha de acesso.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 32px 30px;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">
                Redefinir minha senha
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 30px;">
              <p style="margin:0;font-size:13px;line-height:21px;color:#667085;">
                Se voce nao pediu essa redefinicao, ignore este e-mail. Sua senha atual continuara a mesma.
              </p>
              <p style="margin:16px 0 0;font-size:13px;line-height:21px;color:#667085;">Equipe Nexopsi<br />Criado por ColliDev</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
```

Plain Text Body:

```text
Crie uma nova senha com seguranca.

Recebemos uma solicitacao para redefinir sua senha da Nexopsi. Use o link abaixo para criar uma nova senha:

{{ .ConfirmationURL }}

Se voce nao pediu essa redefinicao, ignore este e-mail. Sua senha atual continuara a mesma.

Equipe Nexopsi
Criado por ColliDev
```

## Magic Link

Subject:

```text
Seu link seguro de acesso a Nexopsi
```

HTML Body:

```html
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8f7;padding:32px 16px;color:#1f2937;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="background:#245b68;padding:28px 32px;color:#ffffff;font-size:28px;font-weight:800;">Nexopsi</div>
    <div style="padding:34px 32px;">
      <h1 style="margin:0;font-size:24px;line-height:32px;">Acesse sua conta com seguranca.</h1>
      <p style="margin:16px 0 24px;font-size:15px;line-height:24px;color:#667085;">Clique no botao abaixo para entrar na Nexopsi sem digitar senha.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">Entrar na Nexopsi</a>
      <p style="margin:24px 0 0;font-size:13px;line-height:21px;color:#667085;">Se voce nao solicitou este acesso, ignore este e-mail.</p>
    </div>
  </div>
</div>
```

Plain Text Body:

```text
Acesse sua conta com seguranca.

Clique no link abaixo para entrar na Nexopsi sem digitar senha:

{{ .ConfirmationURL }}

Se voce nao solicitou este acesso, ignore este e-mail.
```

## Change email address

Subject:

```text
Confirme a troca de e-mail da sua conta Nexopsi
```

HTML Body:

```html
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8f7;padding:32px 16px;color:#1f2937;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="background:#245b68;padding:28px 32px;color:#ffffff;font-size:28px;font-weight:800;">Nexopsi</div>
    <div style="padding:34px 32px;">
      <h1 style="margin:0;font-size:24px;line-height:32px;">Confirme seu novo e-mail.</h1>
      <p style="margin:16px 0 24px;font-size:15px;line-height:24px;color:#667085;">Recebemos uma solicitacao para alterar o e-mail da sua conta. Para concluir, confirme pelo botao abaixo.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">Confirmar novo e-mail</a>
      <p style="margin:24px 0 0;font-size:13px;line-height:21px;color:#667085;">Se voce nao pediu essa alteracao, ignore este e-mail e mantenha sua conta protegida.</p>
    </div>
  </div>
</div>
```

Plain Text Body:

```text
Confirme seu novo e-mail.

Recebemos uma solicitacao para alterar o e-mail da sua conta. Para concluir, confirme pelo link abaixo:

{{ .ConfirmationURL }}

Se voce nao pediu essa alteracao, ignore este e-mail.
```

## Invite user

Subject:

```text
Voce foi convidada para acessar a Nexopsi
```

HTML Body:

```html
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8f7;padding:32px 16px;color:#1f2937;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="background:#245b68;padding:28px 32px;color:#ffffff;font-size:28px;font-weight:800;">Nexopsi</div>
    <div style="padding:34px 32px;">
      <h1 style="margin:0;font-size:24px;line-height:32px;">Seu convite para a Nexopsi chegou.</h1>
      <p style="margin:16px 0 24px;font-size:15px;line-height:24px;color:#667085;">Voce recebeu um convite para acessar a plataforma. Clique no botao abaixo para aceitar e criar sua senha.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">Aceitar convite</a>
      <p style="margin:24px 0 0;font-size:13px;line-height:21px;color:#667085;">Se voce nao reconhece este convite, ignore este e-mail.</p>
    </div>
  </div>
</div>
```

Plain Text Body:

```text
Seu convite para a Nexopsi chegou.

Voce recebeu um convite para acessar a plataforma. Use o link abaixo para aceitar e criar sua senha:

{{ .ConfirmationURL }}

Se voce nao reconhece este convite, ignore este e-mail.
```
