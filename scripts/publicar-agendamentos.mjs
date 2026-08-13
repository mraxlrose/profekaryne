import { readFile, writeFile } from 'node:fs/promises';

const arquivoDeAgenda = 'content/agendamentos.json';
const arquivosPermitidos = new Set([
  'content/site.json', 'content/agenda.json', 'content/contatos.json', 'content/valores.json', 'content/jogos.json'
]);

function caminhoSeguro(caminho) {
  return typeof caminho === 'string' && caminho.split('.').every((parte) => /^[A-Za-z0-9_]+$/.test(parte));
}

function alterar(objeto, caminho, valor) {
  const partes = caminho.split('.');
  let destino = objeto;
  for (let indice = 0; indice < partes.length - 1; indice += 1) {
    const chave = partes[indice];
    if (!Object.hasOwn(destino, chave)) throw new Error(`Campo inexistente: ${caminho}`);
    destino = destino[chave];
  }
  const ultimaChave = partes.at(-1);
  if (!Object.hasOwn(destino, ultimaChave)) throw new Error(`Campo inexistente: ${caminho}`);
  destino[ultimaChave] = valor;
}

const agenda = JSON.parse(await readFile(arquivoDeAgenda, 'utf8'));
const agora = new Date();
const pendentes = [];
const aplicaveis = [];

for (const item of agenda.itens || []) {
  const data = new Date(item.data);
  if (!item.ativo || Number.isNaN(data.getTime()) || data > agora) {
    pendentes.push(item);
    continue;
  }
  if (!arquivosPermitidos.has(item.arquivo) || !caminhoSeguro(item.campo) || typeof item.valor !== 'string') {
    console.warn(`Agendamento ignorado por configuração inválida: ${item.descricao || 'sem descrição'}`);
    pendentes.push(item);
    continue;
  }
  aplicaveis.push(item);
}

for (const item of aplicaveis) {
  const conteudo = JSON.parse(await readFile(item.arquivo, 'utf8'));
  alterar(conteudo, item.campo, item.valor);
  await writeFile(item.arquivo, `${JSON.stringify(conteudo, null, 2)}\n`);
  console.log(`Publicado: ${item.descricao} (${item.arquivo} → ${item.campo})`);
}

if (aplicaveis.length) {
  agenda.itens = pendentes;
  await writeFile(arquivoDeAgenda, `${JSON.stringify(agenda, null, 2)}\n`);
}

