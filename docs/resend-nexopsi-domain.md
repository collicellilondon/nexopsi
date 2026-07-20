# Resend: dominio Nexopsi

Dominio atual configurado no Resend:

```text
nexopsi.app.br
```

Observacao: embora o site possa usar `www.nexopsi.app.br`, para envio de e-mail o Resend exibiu o dominio como `nexopsi.app.br`. O remetente profissional planejado fica:

```text
Nexopsi <noreply@nexopsi.app.br>
```

O dominio so sera verificado depois que os registros abaixo forem adicionados no DNS.

## Registros obrigatorios para envio

### DKIM

```text
Type: TXT
Name: resend._domainkey
Content: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLx1oTs6M/740I0pTsfOOUcsFcZ9abzJX6IWm+rqBuX2l71r+PaTvkuqpuEPUj8AJuJ1glT3y+bPsJYuo/tjFdz+XHv5+r7ziwDANQpntoJAB1Cg/Lc/+nEt2zpPD564RLvbqBANPmoiUEFBp9jzMjynXbXuCT/nalH0k4SEh1rwIDAQAB
TTL: Auto
```

### MAIL FROM / Bounce MX

```text
Type: MX
Name: send
Content: feedback-smtp.sa-east-1.amazonses.com
Priority: 10
TTL: Auto
```

### SPF

```text
Type: TXT
Name: send
Content: v=spf1 include:amazonses.com ~all
TTL: Auto
```

## Depois de adicionar no DNS

1. Abra o Resend.
2. Va em `Domains`.
3. Abra `nexopsi.app.br`.
4. Clique em `Verify DNS Records` ou `I've added the records`.
5. Aguarde a verificacao.

Pode levar alguns minutos ou algumas horas, dependendo do provedor de DNS.
