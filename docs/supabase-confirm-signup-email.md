# Template de Email: Confirmar Cadastro

Use este conteudo em Supabase > Authentication > Email Templates > Confirm signup.

## Subject

Bem-vinda a Nexopsi - confirme seu acesso

## HTML Body

```html
<div style="margin:0;padding:0;background:#f6f8f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#245b68;padding:28px 32px;color:#ffffff;">
              <div style="font-size:26px;font-weight:800;letter-spacing:0.2px;">Nexopsi</div>
              <div style="margin-top:8px;font-size:14px;line-height:22px;color:#d9efea;">Gestao clinica simples, segura e profissional.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 16px;">
              <h1 style="margin:0;font-size:24px;line-height:32px;color:#1f2937;">Bem-vinda a Nexopsi.</h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:24px;color:#667085;">
                Seu cadastro foi iniciado com sucesso. Para ativar seu acesso e entrar na plataforma, confirme seu e-mail pelo botao abaixo.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 32px 28px;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#245b68;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px;">
                Confirmar meu acesso
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 26px;">
              <div style="border:1px solid #d8eee8;background:#eef8f5;border-radius:10px;padding:16px;">
                <div style="font-size:14px;font-weight:800;color:#245b68;">Seguro e confidencial</div>
                <p style="margin:8px 0 0;font-size:13px;line-height:21px;color:#667085;">
                  A Nexopsi foi criada para apoiar a rotina clinica com organizacao, privacidade e acesso protegido.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 30px;">
              <p style="margin:0;font-size:13px;line-height:21px;color:#667085;">
                Se voce nao solicitou este cadastro, ignore este e-mail com seguranca.
              </p>
              <p style="margin:16px 0 0;font-size:13px;line-height:21px;color:#667085;">
                Atenciosamente,<br />
                <strong style="color:#1f2937;">Equipe Nexopsi</strong>
              </p>
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

## Plain Text Body

```text
Bem-vinda a Nexopsi.

Seu cadastro foi iniciado com sucesso. Para ativar seu acesso e entrar na plataforma, confirme seu e-mail pelo link abaixo:

{{ .ConfirmationURL }}

Seguro e confidencial:
A Nexopsi foi criada para apoiar a rotina clinica com organizacao, privacidade e acesso protegido.

Se voce nao solicitou este cadastro, ignore este e-mail com seguranca.

Equipe Nexopsi
Criado por ColliDev
```

## Observacao

O e-mail de confirmacao e enviado diretamente pelo Supabase Auth. Por isso, a troca do texto em ingles precisa ser feita no painel do Supabase, usando o template acima.
