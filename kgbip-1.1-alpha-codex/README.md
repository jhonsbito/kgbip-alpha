# KGBip

Central de atendimento para uma equipe cirúrgica que compartilha um canal de WhatsApp. O produto é desenhado para quatro pessoas e organiza conversas, exames, agenda, procedimentos, materiais, médicos, secretarias e respostas assistidas por IA.

## O que já está implementado

- Portal responsivo e navegável com caixa de entrada compartilhada, agenda, central de exames, kanban de cirurgias, materiais, contatos, automações, biblioteca, equipe, relatórios e configurações.
- Copiloto de IA que gera **rascunhos**, utiliza exemplos aprovados e sinaliza casos que precisam de aprovação humana.
- Política conservadora para triagem: conteúdos clínicos, agenda cirúrgica, materiais, convênio e baixa confiança nunca são liberados automaticamente.
- Endpoint de IA em `POST /api/ai/reply`, que funciona em modo demonstrativo seguro sem credenciais e passa a usar a API quando `OPENAI_API_KEY` estiver configurada.
- Endpoint de verificação e recepção de webhook da Meta em `/api/webhooks/whatsapp`, incluindo verificação de `X-Hub-Signature-256`.
- Endpoint de envio `POST /api/whatsapp/send`, que só chama a Cloud API no servidor e bloqueia mensagens sensíveis sem `approvedBy`.
- Endpoint de disponibilidade em `/api/health`.

## Executar localmente

```powershell
npm install --cache .\work\npm-cache
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Implantação

O projeto pode ser publicado na Vercel, Render, Railway ou em um servidor Docker. Para uma implantação de produção, configure as variáveis de `.env.example` no provedor e conecte um PostgreSQL gerenciado.

1. Publique este repositório em um Git remoto privado.
2. Crie um projeto no provedor e defina `NEXT_PUBLIC_APP_URL` com a URL final HTTPS.
3. Cadastre `https://seu-dominio.com/api/webhooks/whatsapp` como callback da Cloud API do WhatsApp e use o mesmo `WHATSAPP_VERIFY_TOKEN`.
4. Preencha `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` com as credenciais da Meta.
5. Antes de conectar dados reais, substitua as amostras visuais por uma camada persistente (PostgreSQL), autenticação por usuário, trilha de auditoria e armazenamento privado dos arquivos.

## Limites de segurança importantes

Esta primeira entrega não trata os dados demonstrativos como prontuário e não deve receber dados reais antes da etapa de produção. Exames e informações de saúde exigem controles de acesso, criptografia, auditoria, retenção e adequação à LGPD. A IA deve ajudar a equipe, não fornecer diagnóstico, interpretação de exame ou orientação clínica.
