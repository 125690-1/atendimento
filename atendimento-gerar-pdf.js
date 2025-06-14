document.getElementById("gerar-pdf").addEventListener("click", function () {
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
  const atendente = document.getElementById("atendido-por").value.toUpperCase();
  const lead = document.getElementById("lead").value.toUpperCase();
  const solicitante = document.getElementById("solicitado-por").value.toUpperCase();
  const ane = document.getElementById("ane").value.toUpperCase();
  const osInput = document.getElementById("campo-os");
  const ordemServico = osInput ? osInput.value.toUpperCase() : "";

  // Cabeçalho
  doc.setDrawColor(0);
  doc.line(15, 18, 195, 18);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FORMULÁRIO DE ATENDIMENTO", 105, 26, null, null, "center");
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
  doc.text(atendente, 52, 47);

  doc.setFont("helvetica", "bold");
  doc.text("LEAD:", 150, 47);
  doc.setFont("helvetica", "normal");
  doc.text(lead, 165, 47);

  doc.setFont("helvetica", "bold");
  doc.text("SOLICITADO POR:", 14, 54);
  doc.setFont("helvetica", "normal");
  doc.text(solicitante, 56, 54);

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
  doc.text("ATENDENTE", 44, rodapeY + 5);
  doc.line(115, rodapeY, 190, rodapeY);
  doc.text("SOLICITANTE", 139, rodapeY + 5);

  const tipo = "ATENDIMENTO";
  const nomeArquivo = ordemServico
    ? `${tipo} ${ordemServico}.pdf`
    : `${tipo} ${ane}.pdf`;
  doc.save(nomeArquivo);

  // Enviar para o backend Flask
  const payload = {
    base,
    data: data.replaceAll(" / ", "/"), // Envia como 09/06/2025
    atendido_por: atendente,
    lead,
    solicitado_por: solicitante,
    ane,
    tipo: "ATENDIMENTO",
    ordem_servico: ordemServico,
    materiais: materiais.map(linha => ({
      codigo: linha[0],
      descricao: linha[1],
      un: linha[2],
      qtd: linha[3]
    }))
  };

  fetch("https://backend-controle-materiais-818351890829.southamerica-east1.run.app/enviar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
  .then(resultado => {
    if (resultado.status === "sucesso") {
      alert("✅ Dados enviados com sucesso para o Controle Materiais!");
    } else {
      alert("❌ Erro ao enviar os dados: " + resultado.mensagem);
    }
  })
  .catch(error => {
    console.error("Erro ao enviar:", error);
    alert("❌ Erro de conexão com o servidor.");
  });
});
