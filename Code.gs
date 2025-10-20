const PLANILHA_CONFIG = [
  {
    name: 'Histórico Visitantes',
    headers: ['ID', 'Data', 'Número Armário', 'Nome Visitante', 'Nome Paciente', 'Leito', 'Volumes', 'Hora Início', 'Hora Fim', 'Status', 'Tipo']
  },
  {
    name: 'Histórico Acompanhantes',
    headers: ['ID', 'Data', 'Número Armário', 'Nome Acompanhante', 'Nome Paciente', 'Leito', 'Volumes', 'Hora Início', 'Hora Fim', 'Status', 'Tipo']
  },
  {
    name: 'Visitantes',
    headers: ['ID', 'Número', 'Status', 'Nome Visitante', 'Nome Paciente', 'Leito', 'Volumes', 'Hora Início', 'Hora Prevista', 'Data Registro']
  },
  {
    name: 'Acompanhantes',
    headers: ['ID', 'Número', 'Status', 'Nome Acompanhante', 'Nome Paciente', 'Leito', 'Volumes', 'Hora Início', 'Data Registro']
  },
  {
    name: 'Cadastro Armários',
    headers: ['ID', 'Número', 'Tipo', 'Unidade', 'Localização', 'Status', 'Data Cadastro']
  },
  {
    name: 'Unidades',
    headers: ['ID', 'Nome', 'Status', 'Data Cadastro']
  },
  {
    name: 'Usuários',
    headers: ['ID', 'Nome', 'Email', 'Perfil', 'Acesso Visitantes', 'Acesso Acompanhantes', 'Data Cadastro', 'Status']
  },
  {
    name: 'LOGS',
    headers: ['Data/Hora', 'Usuário', 'Ação', 'Detalhes', 'IP']
  }
];

const CACHE_SECONDS = 60;
const LOCK_TIMEOUT = 30000;
const CACHE_PREFIX = 'ARMARIO_APP_';
const ESTATISTICA_KEYS = ['visitante', 'acompanhante', 'ambos', 'admin'];

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet() {
  var template = HtmlService.createTemplateFromFile('index');
  var output = template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('Sistema de Armários Hospitalares');

  return output;
}

function doPost(e) {
  return handlePost(e);
}

function handlePost(e) {
  if (!e || !e.parameter) {
    return respond({ success: false, error: 'Requisição inválida: nenhum parâmetro informado.' });
  }

  var params = e.parameter;
  var action = params.action;

  if (!action) {
    return respond({ success: false, error: 'Ação não informada.' });
  }

  try {
    switch (action) {
      case 'getArmarios':
        return respond(ArmarioService.list(params.tipo));
      case 'cadastrarArmario':
        return respond(ArmarioService.create(params));
      case 'liberarArmario':
        return respond(ArmarioService.release(Number(params.id), params.tipo));
      case 'getUsuarios':
        return respond(UsuarioService.list());
      case 'cadastrarUsuario':
        return respond(UsuarioService.create(params));
      case 'removerUsuario':
        return respond(UsuarioService.remove(Number(params.id)));
      case 'getLogs':
        return respond(LogService.list());
      case 'getNotificacoes':
        return respond(NotificacaoService.list());
      case 'getEstatisticas':
        return respond(EstatisticaService.dashboard(params.tipoUsuario));
      case 'getHistorico':
        return respond(HistoricoService.list(params.tipo));
      case 'getCadastroArmarios':
        return respond(ArmarioService.listCadastro());
      case 'cadastrarArmarioFisico':
        return respond(ArmarioService.createCadastro(params));
      case 'removerCadastroArmario':
        return respond(ArmarioService.removeCadastro(Number(params.id)));
      default:
        return respond({ success: false, error: 'Ação não reconhecida' });
    }
  } catch (error) {
    LogService.register('ERRO', 'handlePost', error.toString(), '');
    return respond({ success: false, error: error.toString() });
  }
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function getUnidades() {
  return { success: true, data: UnidadeService.list() };
}

function getCadastroArmarios() {
  return ArmarioService.listCadastro();
}

function getUsuarios() {
  return UsuarioService.list();
}

function getLogs() {
  return LogService.list();
}

function getNotificacoes() {
  return NotificacaoService.list();
}

function getArmarios(params) {
  return ArmarioService.list(params && params.tipo);
}

function cadastrarArmario(params) {
  return ArmarioService.create(params || {});
}

function liberarArmario(params) {
  return ArmarioService.release(Number(params && params.id), params && params.tipo);
}

function getHistorico(params) {
  return HistoricoService.list(params && params.tipo);
}

function getEstatisticas(params) {
  return EstatisticaService.dashboard(params && params.tipoUsuario);
}

function cadastrarArmarioFisico(params) {
  return ArmarioService.createCadastro(params || {});
}

function removerCadastroArmario(params) {
  return ArmarioService.removeCadastro(Number(params && params.id));
}

function cadastrarUsuario(params) {
  return UsuarioService.create(params || {});
}

function removerUsuario(params) {
  return UsuarioService.remove(Number(params && params.id));
}

function inicializarPlanilha() {
  return withLock('init', function() {
    try {
      ensureSheets();
      clearCache(['UNIDADES', 'USUARIOS', 'CADASTRO_ARMARIOS', 'ARMARIOS_visitante', 'ARMARIOS_acompanhante']);
      LogService.register('SISTEMA', 'Inicialização', 'Planilha inicializada com sucesso', '');
      return { success: true, message: 'Planilha inicializada com sucesso' };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  });
}

function ensureSheets() {
  var ss = getSpreadsheet();
  PLANILHA_CONFIG.forEach(function(config) {
    var sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      formatHeader(sheet, config.headers.length);
    }
    sheet.setFrozenRows(1);
  });
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Aba "' + name + '" não encontrada.');
  }
  return sheet;
}

function formatHeader(sheet, columns) {
  sheet.getRange(1, 1, 1, columns)
    .setBackground('#2c6e8f')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
}

function withLock(key, callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function withCache(key, callback, seconds) {
  var cache = CacheService.getScriptCache();
  var cacheKey = CACHE_PREFIX + key;
  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  var result = callback();
  cache.put(cacheKey, JSON.stringify(result), seconds || CACHE_SECONDS);
  return result;
}

function clearCache(keys) {
  var cache = CacheService.getScriptCache();
  var resolved = keys.map(function(key) { return CACHE_PREFIX + key; });
  cache.removeAll(resolved);
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function sanitizeNumber(value, fallback) {
  var parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function toFiniteNumber(value) {
  var parsed = Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
}

function nextId(collection, property) {
  var source = collection || [];
  var ids = source
    .map(function(item) {
      var value = property ? item[property] : item;
      return toFiniteNumber(value);
    })
    .filter(function(id) {
      return id !== null;
    });
  return ids.length ? Math.max.apply(null, ids) + 1 : 1;
}

function parseHoraPrevista(value) {
  var texto = normalizeText(value);
  if (!texto) {
    return '';
  }
  var partes = texto.split(':');
  if (partes.length < 2) {
    return '';
  }
  var horas = Number(partes[0]);
  var minutos = Number(partes[1]);
  if (isNaN(horas) || isNaN(minutos)) {
    return '';
  }
  var agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), horas, minutos, 0, 0);
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  var parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function toBoolean(value, defaultValue) {
  if (value === null || value === undefined || value === '') {
    return defaultValue === undefined ? false : defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  if (typeof value === 'string') {
    var normalized = value.trim().toLowerCase();
    if (['true', '1', 'sim', 'yes', 'verdadeiro'].indexOf(normalized) !== -1) {
      return true;
    }
    if (['false', '0', 'nao', 'não', 'no', 'falso'].indexOf(normalized) !== -1) {
      return false;
    }
  }

  return Boolean(value);
}

function timestamp() {
  return new Date();
}

var LogService = {
  register: function(usuario, acao, detalhes, ip) {
    var sheet = getSheet('LOGS');
    sheet.appendRow([new Date(), usuario, acao, detalhes, ip || '']);
    clearCache(['LOGS']);
  },
  list: function() {
    return withCache('LOGS', function() {
      var sheet = getSheet('LOGS');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, data: [] };
      }
      var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
      var data = values.map(function(row) {
        return {
          dataHora: row[0],
          usuario: row[1],
          acao: row[2],
          detalhes: row[3],
          ip: row[4]
        };
      });
      return { success: true, data: data.reverse() };
    });
  }
};

var UnidadeService = {
  list: function() {
    return withCache('UNIDADES', function() {
      var sheet = getSheet('Unidades');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return [];
      }
      return sheet
        .getRange(2, 1, lastRow - 1, 4)
        .getValues()
        .map(function(row) {
          var id = toFiniteNumber(row[0]);
          if (id === null) {
            return null;
          }
          return {
            id: id,
            nome: normalizeText(row[1]),
            status: normalizeText(row[2]),
            dataCadastro: row[3]
          };
        })
        .filter(function(item) {
          return item !== null;
        });
    });
  },
  create: function(nome) {
    var texto = normalizeText(nome);
    if (!texto) {
      return { success: false, error: 'Informe o nome da unidade.' };
    }

    return withLock('unidades', function() {
      var sheet = getSheet('Unidades');
      var unidades = UnidadeService.list();
      var jaExiste = unidades.some(function(unidade) {
        return unidade.nome.toLowerCase() === texto.toLowerCase();
      });

      if (jaExiste) {
        return { success: false, error: 'Já existe uma unidade com este nome.' };
      }

      var novoId = nextId(unidades, 'id');
      sheet.appendRow([novoId, texto, 'ativa', timestamp()]);
      clearCache(['UNIDADES']);
      LogService.register('SISTEMA', 'Cadastro Unidade', 'Unidade ' + texto + ' cadastrada', '');
      return { success: true, id: novoId };
    });
  }
};

var ArmarioService = {
  list: function(tipo) {
    var categoria = tipo === 'acompanhante' ? 'Acompanhantes' : 'Visitantes';
    var cacheKey = 'ARMARIOS_' + (tipo === 'acompanhante' ? 'acompanhante' : 'visitante');

    return withCache(cacheKey, function() {
      var sheet = getSheet(categoria);
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, data: [] };
      }

      var colunas = tipo === 'acompanhante' ? 9 : 10;
      var values = sheet.getRange(2, 1, lastRow - 1, colunas).getValues();
      var data = values
        .map(function(row) {
          var id = toFiniteNumber(row[0]);
          if (id === null) {
            return null;
          }
          var volumes = toFiniteNumber(row[6]);
          var item = {
            id: id,
            numero: normalizeText(row[1]),
            status: normalizeText(row[2]),
            nomeVisitante: normalizeText(row[3]),
            nomePaciente: normalizeText(row[4]),
            leito: normalizeText(row[5]),
            volumes: volumes !== null ? volumes : 0,
            horaInicio: normalizeText(row[7]),
            tipo: tipo || (categoria === 'Acompanhantes' ? 'acompanhante' : 'visitante')
          };
          if (tipo !== 'acompanhante') {
            var horaPrevistaValor = row[8];
            var dataPrevista = parseDateValue(horaPrevistaValor);
            if (!dataPrevista && horaPrevistaValor) {
              var horaConvertida = parseHoraPrevista(horaPrevistaValor);
              dataPrevista = horaConvertida || null;
            }
            item.horaPrevista = dataPrevista ? dataPrevista.toISOString() : normalizeText(horaPrevistaValor);
          }
          return item;
        })
        .filter(function(item) {
          return item !== null;
        });

      return { success: true, data: data };
    });
  },
  create: function(params) {
    var tipo = params.tipo === 'acompanhante' ? 'acompanhante' : 'visitante';
    var numero = normalizeText(params.numero);
    var nomeVisitante = normalizeText(params.nomeVisitante);
    var nomePaciente = normalizeText(params.nomePaciente);
    var leito = normalizeText(params.leito);
    var volumes = sanitizeNumber(params.volumes, 0);
    var horaPrevista = '';
    if (tipo === 'visitante') {
      var horaPrevistaData = parseHoraPrevista(params.horaPrevista);
      if (!horaPrevistaData) {
        return { success: false, error: 'Informe um horário previsto válido no formato HH:MM.' };
      }
      horaPrevista = horaPrevistaData;
    }

    if (!numero) {
      return { success: false, error: 'Informe o número do armário.' };
    }
    if (!nomeVisitante) {
      return { success: false, error: 'Informe o responsável pelo armário.' };
    }
    if (!nomePaciente) {
      return { success: false, error: 'Informe o paciente associado.' };
    }

    return withLock('armario_' + tipo, function() {
      var sheet = getSheet(tipo === 'acompanhante' ? 'Acompanhantes' : 'Visitantes');
      var existing = ArmarioService.list(tipo).data;
      var emUso = existing.some(function(item) {
        return item.numero === numero && item.status !== 'livre';
      });
      if (emUso) {
        return { success: false, error: 'Armário já está em uso.' };
      }

      var novoId = nextId(existing, 'id');
      var linha = [
        novoId,
        numero,
        'em-uso',
        nomeVisitante,
        nomePaciente,
        leito,
        volumes,
        timestamp().toLocaleTimeString('pt-BR'),
        timestamp()
      ];
      if (tipo === 'visitante') {
        linha.splice(8, 0, horaPrevista);
      }

      sheet.appendRow(linha);

      HistoricoService.registrar({
        tipo: tipo,
        numero: numero,
        responsavel: nomeVisitante,
        paciente: nomePaciente,
        leito: leito,
        volumes: volumes
      });

      clearCache([
        'ARMARIOS_visitante',
        'ARMARIOS_acompanhante',
        'HISTORICO_visitante',
        'HISTORICO_acompanhante',
        'NOTIFICACOES'
      ].concat(ESTATISTICA_KEYS.map(function(key) { return 'ESTATISTICAS_' + key; })));

      LogService.register('SISTEMA', 'Cadastro Armário', 'Armário ' + numero + ' vinculado a ' + nomeVisitante, '');

      return {
        success: true,
        id: novoId
      };
    });
  },
  release: function(id, tipo) {
    var sheetName = tipo === 'acompanhante' ? 'Acompanhantes' : 'Visitantes';
    return withLock('armario_release_' + sheetName, function() {
      var sheet = getSheet(sheetName);
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: false, error: 'Nenhum armário cadastrado.' };
      }

      var colunas = tipo === 'acompanhante' ? 9 : 10;
      var values = sheet.getRange(2, 1, lastRow - 1, colunas).getValues();
      var linhaIndex = -1;
      var dadosArmario = null;

      values.forEach(function(row, index) {
        if (row[0] === id) {
          linhaIndex = index + 2;
          dadosArmario = row;
        }
      });

      if (linhaIndex === -1) {
        return { success: false, error: 'Armário não encontrado.' };
      }

      var novaLinha = [id, dadosArmario[1], 'livre', '', '', '', 0, '', timestamp()];
      if (tipo !== 'acompanhante') {
        novaLinha.splice(8, 0, '');
      }

      sheet.getRange(linhaIndex, 1, 1, novaLinha.length).setValues([novaLinha]);

      HistoricoService.finalizar(dadosArmario[1], tipo);

      clearCache([
        'ARMARIOS_visitante',
        'ARMARIOS_acompanhante',
        'HISTORICO_visitante',
        'HISTORICO_acompanhante',
        'NOTIFICACOES'
      ].concat(ESTATISTICA_KEYS.map(function(key) { return 'ESTATISTICAS_' + key; })));

      LogService.register('SISTEMA', 'Liberação Armário', 'Armário ' + dadosArmario[1] + ' liberado', '');
      return { success: true, message: 'Armário liberado com sucesso' };
    });
  },
  listCadastro: function() {
    return withCache('CADASTRO_ARMARIOS', function() {
      var sheet = getSheet('Cadastro Armários');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, data: [] };
      }
      var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      var data = values
        .map(function(row) {
          var id = toFiniteNumber(row[0]);
          if (id === null) {
            return null;
          }
          return {
            id: id,
            numero: normalizeText(row[1]),
            tipo: normalizeText(row[2]),
            unidade: normalizeText(row[3]),
            localizacao: normalizeText(row[4]),
            status: normalizeText(row[5]),
            dataCadastro: row[6]
          };
        })
        .filter(function(item) {
          return item !== null;
        });
      return { success: true, data: data };
    });
  },
  createCadastro: function(params) {
    var tipo = params && params.tipo === 'acompanhante' ? 'acompanhante' : 'visitante';
    var metodo = params && params.metodo === 'intervalo' ? 'intervalo' : (params && params.metodo === 'unico' ? 'unico' : 'sequencia');
    var quantidade = sanitizeNumber(params && params.quantidade, 1);
    var sequenciaInicial = sanitizeNumber(params && params.sequenciaInicial, 1);
    var intervaloInicio = sanitizeNumber(params && params.intervaloInicio, NaN);
    var intervaloFim = sanitizeNumber(params && params.intervaloFim, NaN);
    var prefixo = normalizeText(params && params.prefixo);
    var separador = params && params.separador !== undefined ? String(params.separador) : '-';
    var zeroPad = sanitizeNumber(params && params.zeroPad, 0);
    var unidade = normalizeText((params && params.unidade) || '');
    var localizacao = normalizeText((params && params.localizacao) || '');
    var numeroInformado = normalizeText(params && params.numero);
    var MAX_ARMARIOS_POR_LOTE = 500;

    if (zeroPad < 0) {
      zeroPad = 0;
    }
    if (zeroPad > 6) {
      zeroPad = 6;
    }

    return withLock('cadastro_armarios', function() {
      var sheet = getSheet('Cadastro Armários');
      var cadastro = ArmarioService.listCadastro().data;
      var numerosExistentes = cadastro.map(function(item) { return item.numero; });
      var existentesSet = {};
      numerosExistentes.forEach(function(numero) {
        existentesSet[numero] = true;
      });

      var novos = [];
      var novosSet = {};

      function montarNumero(valor) {
        var numeroBase = '';
        if (typeof valor === 'number' && !isNaN(valor)) {
          var numeroNumerico = Number(valor);
          var sinal = numeroNumerico < 0 ? '-' : '';
          if (zeroPad > 0) {
            numeroBase = sinal + String(Math.abs(numeroNumerico)).padStart(zeroPad, '0');
          } else {
            numeroBase = String(numeroNumerico);
          }
        } else {
          numeroBase = String(valor);
        }

        if (prefixo) {
          return prefixo + (separador ? separador : '') + numeroBase;
        }
        return numeroBase;
      }

      function registrarNumero(numero) {
        if (!numero) {
          throw new Error('Número de armário inválido.');
        }
        if (existentesSet[numero] || novosSet[numero]) {
          throw new Error('Não foi possível gerar numeração sem conflitos. Ajuste o prefixo, número ou intervalo informado.');
        }
        novosSet[numero] = true;
        novos.push(numero);
      }

      try {
        if (metodo === 'unico') {
          if (!numeroInformado) {
            throw new Error('Informe o número do armário que deseja cadastrar.');
          }
          registrarNumero(numeroInformado);
        } else if (metodo === 'intervalo') {
          if (isNaN(intervaloInicio) || isNaN(intervaloFim)) {
            throw new Error('Informe números válidos para o intervalo.');
          }
          if (intervaloFim < intervaloInicio) {
            throw new Error('O final do intervalo deve ser maior ou igual ao início.');
          }
          var totalIntervalo = intervaloFim - intervaloInicio + 1;
          if (totalIntervalo > MAX_ARMARIOS_POR_LOTE) {
            throw new Error('Cadastre no máximo ' + MAX_ARMARIOS_POR_LOTE + ' armários por vez.');
          }
          for (var valor = intervaloInicio; valor <= intervaloFim; valor++) {
            registrarNumero(montarNumero(valor));
          }
        } else {
          // sequencia automática
          if (quantidade <= 0) {
            throw new Error('Informe uma quantidade válida de armários.');
          }
          if (quantidade > MAX_ARMARIOS_POR_LOTE) {
            throw new Error('Cadastre no máximo ' + MAX_ARMARIOS_POR_LOTE + ' armários por vez.');
          }
          if (sequenciaInicial <= 0 || isNaN(sequenciaInicial)) {
            throw new Error('Informe um número inicial válido para a sequência.');
          }
          for (var i = 0; i < quantidade; i++) {
            registrarNumero(montarNumero(sequenciaInicial + i));
          }
        }
      } catch (erro) {
        return { success: false, error: erro.message };
      }

      if (!novos.length) {
        return { success: false, error: 'Nenhum armário foi gerado para cadastro.' };
      }

      var baseId = nextId(cadastro, 'id') - 1;
      novos.forEach(function(numero, index) {
        sheet.appendRow([
          baseId + index + 1,
          numero,
          tipo,
          unidade || 'NAC Eletiva',
          localizacao || 'Não informado',
          'ativo',
          timestamp()
        ]);
      });

      clearCache(['CADASTRO_ARMARIOS']);
      LogService.register('SISTEMA', 'Cadastro Armário Físico', 'Armários cadastrados: ' + novos.join(', '), '');

      return { success: true, numeros: novos };
    });
  },
  removeCadastro: function(id) {
    var cadastroId = toFiniteNumber(id);
    if (cadastroId === null) {
      return { success: false, error: 'Identificador do armário inválido.' };
    }

    return withLock('cadastro_armarios', function() {
      var sheet = getSheet('Cadastro Armários');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: false, error: 'Nenhum armário cadastrado.' };
      }

      var valores = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      var indice = -1;
      var registro = null;

      for (var i = 0; i < valores.length; i++) {
        var rowId = toFiniteNumber(valores[i][0]);
        if (rowId === cadastroId) {
          indice = i;
          registro = valores[i];
          break;
        }
      }

      if (indice === -1) {
        return { success: false, error: 'Armário não encontrado.' };
      }

      sheet.deleteRow(indice + 2);
      clearCache(['CADASTRO_ARMARIOS']);

      var numero = registro ? normalizeText(registro[1]) : '';
      LogService.register('SISTEMA', 'Remoção Armário Físico', 'Armário ' + (numero || cadastroId) + ' removido do cadastro', '');

      return { success: true, message: 'Armário removido com sucesso.' };
    });
  }
};

var HistoricoService = {
  list: function(tipo) {
    var sheetName = tipo === 'acompanhante' ? 'Histórico Acompanhantes' : 'Histórico Visitantes';
    var cacheKey = 'HISTORICO_' + (tipo === 'acompanhante' ? 'acompanhante' : 'visitante');

    return withCache(cacheKey, function() {
      var sheet = getSheet(sheetName);
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, data: [] };
      }
      var values = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
      var data = values
        .map(function(row) {
          var id = toFiniteNumber(row[0]);
          if (id === null) {
            return null;
          }
          var volumes = toFiniteNumber(row[6]);
          return {
            id: id,
            data: row[1],
            armario: normalizeText(row[2]),
            nome: normalizeText(row[3]),
            paciente: normalizeText(row[4]),
            leito: normalizeText(row[5]),
            volumes: volumes !== null ? volumes : 0,
            horaInicio: normalizeText(row[7]),
            horaFim: normalizeText(row[8]),
            status: normalizeText(row[9]),
            tipo: normalizeText(row[10])
          };
        })
        .filter(function(item) {
          return item !== null;
        });
      return { success: true, data: data.reverse() };
    });
  },
  registrar: function(dados) {
    var sheetName = dados.tipo === 'acompanhante' ? 'Histórico Acompanhantes' : 'Histórico Visitantes';
    var sheet = getSheet(sheetName);
    var historico = HistoricoService.list(dados.tipo).data;
    var novoId = nextId(historico, 'id');
    sheet.appendRow([
      novoId,
      timestamp(),
      dados.numero,
      dados.responsavel,
      dados.paciente,
      dados.leito,
      dados.volumes,
      timestamp().toLocaleTimeString('pt-BR'),
      '',
      'EM USO',
      dados.tipo
    ]);
    clearCache(['HISTORICO_visitante', 'HISTORICO_acompanhante']);
  },
  finalizar: function(numero, tipo) {
    var sheetName = tipo === 'acompanhante' ? 'Histórico Acompanhantes' : 'Histórico Visitantes';
    var sheet = getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return;
    }
    var values = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
    for (var i = values.length - 1; i >= 0; i--) {
      if (values[i][2] === numero && values[i][9] === 'EM USO') {
        sheet.getRange(i + 2, 9).setValue(timestamp().toLocaleTimeString('pt-BR'));
        sheet.getRange(i + 2, 10).setValue('FINALIZADO');
        clearCache(['HISTORICO_visitante', 'HISTORICO_acompanhante']);
        return;
      }
    }
  }
};

var UsuarioService = {
  list: function() {
    return withCache('USUARIOS', function() {
      var sheet = getSheet('Usuários');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, data: [] };
      }
      var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      var data = values
        .map(function(row) {
          var id = toFiniteNumber(row[0]);
          if (id === null) {
            return null;
          }
          return {
            id: id,
            nome: normalizeText(row[1]),
            email: normalizeText(row[2]),
            perfil: normalizeText(row[3]) || 'usuario',
            acessoVisitantes: toBoolean(row[4], false),
            acessoAcompanhantes: toBoolean(row[5], false),
            dataCadastro: row[6],
            status: normalizeText(row[7])
          };
        })
        .filter(function(item) {
          return item !== null;
        });
      return { success: true, data: data };
    });
  },
  create: function(params) {
    var nome = normalizeText(params.nome);
    var email = normalizeText(params.email);
    var perfil = params.perfil === 'admin' ? 'admin' : 'usuario';
    var acessoVisitantes = toBoolean(params.acessoVisitantes, true);
    var acessoAcompanhantes = toBoolean(params.acessoAcompanhantes, true);

    if (!nome) {
      return { success: false, error: 'Informe o nome do usuário.' };
    }
    if (!email) {
      return { success: false, error: 'Informe o email do usuário.' };
    }

    return withLock('usuarios', function() {
      var usuarios = UsuarioService.list().data;
      var existe = usuarios.some(function(usuario) {
        return usuario.email.toLowerCase() === email.toLowerCase();
      });
      if (existe) {
        return { success: false, error: 'Já existe um usuário com este email.' };
      }

      var sheet = getSheet('Usuários');
      var novoId = nextId(usuarios, 'id');
      sheet.appendRow([
        novoId,
        nome,
        email,
        perfil,
        acessoVisitantes,
        acessoAcompanhantes,
        timestamp(),
        'ativo'
      ]);
      clearCache(['USUARIOS']);
      LogService.register(email, 'Cadastro Usuário', 'Usuário ' + nome + ' cadastrado', '');
      return { success: true, id: novoId };
    });
  },
  remove: function(id) {
    var usuarioId = toFiniteNumber(id);
    if (usuarioId === null) {
      return { success: false, error: 'Identificador do usuário inválido.' };
    }

    return withLock('usuarios', function() {
      var sheet = getSheet('Usuários');
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: false, error: 'Nenhum usuário cadastrado.' };
      }

      var valores = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      var indice = -1;
      var registro = null;

      for (var i = 0; i < valores.length; i++) {
        var rowId = toFiniteNumber(valores[i][0]);
        if (rowId === usuarioId) {
          indice = i;
          registro = valores[i];
          break;
        }
      }

      if (indice === -1) {
        return { success: false, error: 'Usuário não encontrado.' };
      }

      sheet.deleteRow(indice + 2);
      clearCache(['USUARIOS']);

      var nomeRemovido = registro ? normalizeText(registro[1]) : '';
      LogService.register('SISTEMA', 'Remoção Usuário', 'Usuário ' + (nomeRemovido || usuarioId) + ' removido', '');

      return { success: true, message: 'Usuário removido com sucesso.' };
    });
  }
};

var NotificacaoService = {
  list: function() {
    return withCache('NOTIFICACOES', function() {
      var agora = new Date();
      var notificacoes = [];
      ['visitante', 'acompanhante'].forEach(function(tipo) {
        var armarios = ArmarioService.list(tipo).data;
        armarios.forEach(function(armario) {
          if (armario.status === 'em-uso' && armario.horaPrevista) {
            var horaPrevista = parseDateValue(armario.horaPrevista);
            if (!horaPrevista) {
              return;
            }
            var diff = (horaPrevista.getTime() - agora.getTime()) / (1000 * 60);
            if (diff <= 0) {
              notificacoes.push({
                tipo: 'danger',
                titulo: 'Armário ' + armario.numero + ' vencido',
                tempo: 'Expirou há ' + Math.abs(Math.round(diff)) + ' minutos'
              });
            } else if (diff <= 10) {
              notificacoes.push({
                tipo: 'warning',
                titulo: 'Armário ' + armario.numero + ' próximo do horário',
                tempo: 'Vencerá em ' + Math.round(diff) + ' minutos'
              });
            }
          }
        });
      });
      return { success: true, data: notificacoes };
    });
  }
};

var EstatisticaService = {
  dashboard: function(tipoUsuario) {
    return withCache('ESTATISTICAS_' + (tipoUsuario || 'admin'), function() {
      var tipos = [];
      if (tipoUsuario === 'visitante') {
        tipos = ['visitante'];
      } else if (tipoUsuario === 'acompanhante') {
        tipos = ['acompanhante'];
      } else if (tipoUsuario === 'ambos' || tipoUsuario === 'admin') {
        tipos = ['visitante', 'acompanhante'];
      } else {
        tipos = ['visitante'];
      }

      var estatisticas = { livres: 0, emUso: 0, proximo: 0, vencidos: 0 };
      var agora = new Date();

      tipos.forEach(function(tipo) {
        ArmarioService.list(tipo).data.forEach(function(armario) {
          if (armario.status === 'livre') {
            estatisticas.livres += 1;
            return;
          }
          if (armario.status === 'em-uso') {
            if (armario.horaPrevista) {
              var horaPrevista = parseDateValue(armario.horaPrevista);
              if (horaPrevista) {
                var diff = (horaPrevista.getTime() - agora.getTime()) / (1000 * 60);
                if (diff < 0) {
                  estatisticas.vencidos += 1;
                } else if (diff <= 10) {
                  estatisticas.proximo += 1;
                } else {
                  estatisticas.emUso += 1;
                }
              } else {
                estatisticas.emUso += 1;
              }
            } else {
              estatisticas.emUso += 1;
            }
          }
        });
      });

      return { success: true, data: estatisticas };
    });
  }
};
