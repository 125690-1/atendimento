
async function enviarParaPlanilha() {
  const base = document.getElementById("base").value.toUpperCase();
  const data = document.getElementById("data").value;
  const mro = document.getElementById("atendido-por")?.value?.toUpperCase() || document.getElementById("recebido-por")?.value?.toUpperCase();
  const operacao = document.getElementById("solicitado-por")?.value?.toUpperCase() || document.getElementById("entregue-por")?.value?.toUpperCase();
  const lead = document.getElementById("lead").value.toUpperCase();
  const ane = document.getElementById("ane").value.toUpperCase();
  const ordemServico = document.getElementById("campo-os").value.toUpperCase();

  const materiais = Array.from(document.querySelectorAll("#tabela-materiais tr")).map(tr => {
    const inputs = tr.querySelectorAll("input");
    return {
      codigo: (inputs[0]?.value || "").toUpperCase(),
      descricao: (inputs[1]?.value || "").toUpperCase(),
      un: (inputs[2]?.value || "").toUpperCase(),
      qtd: (inputs[3]?.value || "")
    };
  }).filter(mat => mat.codigo && mat.descricao);

  const dados = {
    tipo: "ATENDIMENTO",
    base,
    data,
    mro,
    operacao,
    lead,
    ane,
    ordem_de_servico: ordemServico,
    materiais
  };

  try {
    const response = await fetch("https://backend-controle-materiais-818351890829.southamerica-east1.run.app/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const result = await response.json();
    console.log("Resultado:", result);
    alert(result.mensagem || result.erro || "Erro desconhecido.");
  } catch (err) {
    alert("Erro ao enviar para a planilha: " + err);
  }
}

// === VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ===
let tipoOrdemSelecionado = "";

function mostrarCampoOS(tipo) {
  tipoOrdemSelecionado = tipo;
  const container = document.getElementById("os-container");
  let input = `<label for="campo-os">Ordem de Serviço (${tipo})</label>`;

  if (tipo === "INC") {
    input += `<input type="text" id="campo-os" maxlength="8" pattern="\d{8}" inputmode="numeric" placeholder="Somente números">`;
  } else {
    input += `<input type="text" id="campo-os" value="${tipo}" maxlength="10" pattern="${tipo}\d{8}" inputmode="numeric">`;
  }

  container.innerHTML = input;

  const osInput = document.getElementById("campo-os");
  osInput.addEventListener("input", () => {
    if (tipo === "INC") {
      osInput.value = osInput.value.replace(/\D/g, "").slice(0, 8);
    } else {
      osInput.value = tipo + osInput.value.replace(/\D/g, "").slice(0, 8);
    }
  });
}

function validarCamposObrigatorios() {
  const base = document.getElementById("base").value.trim();
  const data = document.getElementById("data").value.trim();
  const mro = document.getElementById("atendido-por").value.trim();
  const lead = document.getElementById("lead").value.trim();
  const operacao = document.getElementById("solicitado-por").value.trim();
  const ane = document.getElementById("ane").value.trim();
  const osInput = document.getElementById("campo-os");
  const ordemServico = osInput ? osInput.value.trim() : "";

  if (!base) return alert("⚠️ Preencha o campo BASE.");
  if (!data) return alert("⚠️ Preencha o campo DATA.");
  if (!mro) return alert("⚠️ Preencha o campo ATENDIDO POR.");
  if (!lead) return alert("⚠️ Preencha o campo LEAD.");
  if (!operacao) return alert("⚠️ Preencha o campo SOLICITADO POR.");
  if (!ane && !ordemServico) return alert("⚠️ Preencha ao menos o campo ANE ou a ORDEM DE SERVIÇO.");

  if (ane && !/^\d{7}$/.test(ane)) {
    return alert("⚠️ O campo ANE deve conter exatamente 7 dígitos numéricos.");
  }

  if (ordemServico) {
    if (tipoOrdemSelecionado === "INC" && !/^\d{8}$/.test(ordemServico)) {
      return alert("⚠️ Ordem de serviço (INC) deve conter exatamente 8 números.");
    }
    if ((tipoOrdemSelecionado === "DT" || tipoOrdemSelecionado === "BA") && !new RegExp(`^${tipoOrdemSelecionado}\d{8}$`).test(ordemServico)) {
      return alert(`⚠️ Ordem de serviço (${tipoOrdemSelecionado}) deve ter o formato ${tipoOrdemSelecionado} + 8 números.(${tipoOrdemSelecionado}xxxxxxxx)`);
    }
  }

  return true;
}

document.getElementById("gerar-pdf").addEventListener("click", async function () {
  if (!validarCamposObrigatorios()) return;
  await enviarParaPlanilha();
  const doc = new window.jspdf.jsPDF();

  // Coletar dados
  const base = document.getElementById("base").value.toUpperCase();
  const dataInput = document.getElementById("data").value;
  let data = "";
  if (dataInput) {
    const partes = dataInput.split("-");
    if (partes.length === 3) {
      data = `${partes[2]} / ${partes[1]} / ${partes[0]}`;
    }
  }
  const atendeu = document.getElementById("atendido-por").value.toUpperCase();
  const lead = document.getElementById("lead").value.toUpperCase();
  const solicitou = document.getElementById("solicitado-por").value.toUpperCase();
  const ane = document.getElementById("ane").value.toUpperCase();
  const osInput = document.getElementById("campo-os");
  const ordemServico = osInput ? osInput.value.toUpperCase() : "";

  // Cabeçalho
  doc.setDrawColor(0);
  doc.line(15, 18, 195, 18);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FORMULÁRIO DE DEVOLUÇÃO", 105, 26, null, null, "center");
  doc.line(15, 30, 195, 30);

  // Dados do formulário
  doc.setFontSize(13);

  doc.setFont("helvetica", "bold");
  doc.text("BASE:", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.text(base, 29, 40);

  doc.setFont("helvetica", "bold");
  doc.text("DATA:", 150, 40);
  doc.setFont("helvetica", "normal");
  doc.text(data, 165, 40);

  doc.setFont("helvetica", "bold");
  doc.text("ATENDIDO POR:", 14, 47);
  doc.setFont("helvetica", "normal");
  doc.text(atendeu, 52, 47);

  doc.setFont("helvetica", "bold");
  doc.text("LEAD:", 150, 47);
  doc.setFont("helvetica", "normal");
  doc.text(lead, 165, 47);

  doc.setFont("helvetica", "bold");
  doc.text("SOLICITADO POR:", 14, 54);
  doc.setFont("helvetica", "normal");
  doc.text(solicitou, 56, 54);

  doc.setFont("helvetica", "bold");
  doc.text("ANE:", 150, 54);
  doc.setFont("helvetica", "normal");
  doc.text(ane, 162, 54);

  if (ordemServico) {
    doc.setFont("helvetica", "bold");
    doc.text("ORDEM DE SERVIÇO:", 14, 61);
    doc.setFont("helvetica", "normal");
    doc.text(ordemServico, 63, 61);
  }

  // Tabela de materiais
  const materiais = Array.from(document.querySelectorAll("#tabela-materiais tr")).map(tr => {
    const tds = tr.querySelectorAll("input");
    return [
      (tds[0]?.value || "").toUpperCase(),
      (tds[1]?.value || "").toUpperCase(),
      (tds[2]?.value || "").toUpperCase(),
      (tds[3]?.value || "")
    ];
  }).filter(row => row.some(cell => cell.trim() !== ""));

  const tabelaInicio = ordemServico ? 70 : 65;

  doc.autoTable({
    startY: tabelaInicio,
    head: [["CÓDIGO", "DESCRIÇÃO DO MATERIAL", "UN", "QTD."]],
    body: materiais,
    headStyles: {
      fillColor: [64, 64, 64],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 13,
      halign: 'center'
    },
    styles: {
      fontSize: 11,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 120 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' }
    }
  });

  // Rodapé com assinatura
  const pageHeight = doc.internal.pageSize.height;
  const rodapeY = pageHeight - 18;
  doc.line(20, rodapeY, 98, rodapeY);
  doc.text("MRO", 52, rodapeY + 5);
  doc.line(115, rodapeY, 190, rodapeY);
  doc.text("OPERAÇÃO", 139, rodapeY + 5);

  const tipo = "ATENDIMENTO";
  const nomeArquivo = ordemServico
    ? `${tipo} ${ordemServico}.pdf`
    : `${tipo} ${ane}.pdf`;
  doc.save(nomeArquivo);
});
