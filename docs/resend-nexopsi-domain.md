# Resend: dominio Nexopsi

Dominio cadastrado no Resend:

```text
nexopsi.com.br
```

Status atual no Resend:

```text
not started
```

O status ficara pendente ate os registros abaixo serem adicionados no DNS do dominio.

## Registros obrigatorios para envio

### DKIM

```text
Type: TXT
Name: resend._domainkey
Content: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCoetQuludPzLuAsbbXa7GYE5lZm2ORu7VBgVDNi91DyCsUOqMtzskIOfq5L/NItNyrBjVBtSNTWAT8CzAS1EgVLEnB8rxRQDDcnzdHWgq58Ck9UrkTDBiuJknkpdN6OHHG9A6t73hVlY3XlnSEcU0J2/0P8008i0HYPb86g5JAIwIDAQAB
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

## Opcional: recebimento de emails

Ative apenas se quiser receber emails pelo Resend.

```text
Type: MX
Name: @
Content: inbound-smtp.sa-east-1.amazonaws.com
Priority: 0
TTL: Auto
```

## Remetente planejado

```text
Nexopsi <noreply@nexopsi.com.br>
```

Esse remetente so deve ser usado em producao depois que o dominio estiver verificado no Resend.
