{
  "entities": {
    "User": {
      "title": "User",
      "description": "A user of the PPGPsi system",
      "type": "object",
      "properties": {
        "uid": { "type": "string", "description": "Firebase Auth UID" },
        "email": { "type": "string", "format": "email" },
        "nome": { "type": "string" },
        "roles": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Roles like Discente, Docente, Secretaria, Conselho"
        },
        "telefone": { "type": "string" },
        "celular": { "type": "string" },
        "endereco": { "type": "string" },
        "status": { "type": "string", "enum": ["Ativo", "Inativo"] },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["uid", "email", "nome", "roles"]
    },
    "Request": {
      "title": "Request",
      "description": "A request submitted by a student or professor",
      "type": "object",
      "properties": {
        "userId": { "type": "string", "description": "UID of the requester" },
        "nomeSolicitante": { "type": "string" },
        "emailSolicitante": { "type": "string" },
        "tipoSolicitacao": { "type": "string" },
        "status": { "type": "string" },
        "detalhes": {
          "type": "string",
          "description": "JSON stringified details of the request"
        },
        "historicoAprovacao": {
          "type": "string",
          "description": "JSON stringified array of history objects"
        },
        "valorSolicitado": { "type": "number" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      },
      "required": ["userId", "tipoSolicitacao", "status", "createdAt"]
    },
    "Meeting": {
      "title": "Meeting",
      "description": "A CPG meeting",
      "type": "object",
      "properties": {
        "nome": { "type": "string" },
        "dataReuniao": { "type": "string", "format": "date-time" },
        "dataInicioPeriodo": { "type": "string", "format": "date-time" },
        "dataFimPeriodo": { "type": "string", "format": "date-time" },
        "prazoFechamento": { "type": "string", "format": "date-time" },
        "status": { "type": "string", "enum": ["Aberto", "Fechado"] },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["nome", "dataReuniao", "status"]
    },
    "MuralPost": {
      "title": "Mural Post",
      "description": "A post on the community mural",
      "type": "object",
      "properties": {
        "userId": { "type": "string" },
        "nomeUsuario": { "type": "string" },
        "conteudo": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["userId", "nomeUsuario", "conteudo", "createdAt"]
    }
  },
  "firestore": {
    "users": {
      "schema": { "$ref": "#/entities/User" },
      "description": "Collection of users"
    },
    "requests": {
      "schema": { "$ref": "#/entities/Request" },
      "description": "Collection of requests"
    },
    "meetings": {
      "schema": { "$ref": "#/entities/Meeting" },
      "description": "Collection of meetings"
    },
    "mural_posts": {
      "schema": { "$ref": "#/entities/MuralPost" },
      "description": "Collection of mural posts"
    }
  }
}
