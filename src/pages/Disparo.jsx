import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Box, Button, Input, Text, Textarea, Stack,
} from '@chakra-ui/react';

export default function Disparo() {
  const [mensagem, setMensagem] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [imagem, setImagem] = useState(null);
  const [resultado, setResultado] = useState('');
  const [linhasPersonalizadas, setLinhasPersonalizadas] = useState([]);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const linhas = results.data.filter(row => row['TELEFONE']); // Garante que TELEFONE esteja presente

        if (linhas.length === 0) {
          setResultado("⚠️ Nenhuma linha válida com a coluna TELEFONE encontrada.");
          return;
        }

        const mensagensProcessadas = linhas.map(row => {
          let msg = mensagem;

          Object.keys(row).forEach(key => {
            const regex = new RegExp(`\\$${key}`, 'g');
            msg = msg.replace(regex, row[key] ?? '');
          });

          return {
            telefone: row['TELEFONE'],
            mensagem: msg,
          };
        });

        setLinhasPersonalizadas(mensagensProcessadas);
        setResultado(`✅ ${mensagensProcessadas.length} mensagens personalizadas preparadas.`);
      },
      error: function (err) {
        console.error(err);
        setResultado("❌ Erro ao ler o arquivo CSV.");
      }
    });
  };

  const handleSubmit = async () => {
    if (!mensagem || !csvFile || linhasPersonalizadas.length === 0) {
      setResultado("⚠️ Preencha todos os campos e envie um CSV válido.");
      return;
    }

    const formData = new FormData();
    formData.append("Mensagens", JSON.stringify(linhasPersonalizadas));

    if (imagem) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const base64 = e.target.result.split(',')[1];
        formData.append("envio", "imagem");
        formData.append("arquivo", base64);
        await enviarDados(formData);
      };
      reader.readAsDataURL(imagem);
    } else {
      formData.append("envio", "texto");
      await enviarDados(formData);
    }
  };

  const enviarDados = async (formData) => {
    try {
      const res = await fetch('https://test-n8n-webhook.logiczap.app/webhook/disparador-disparo', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setResultado("✅ Disparo enviado com sucesso!");
    } catch (err) {
      console.error(err);
      setResultado(`❌ Erro ao enviar: ${err.message}`);
    }
  };

  useEffect(() => {
    console.log("✅ Componente Disparo carregado");
  }, []);
 
  return (
    <Box margin={0} display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"} width={"100vw"} height={"100vh"}>
      <Text fontSize={"2xl"} fontWeight={"bold"}>Disparo de Mensagens</Text>
      <Text fontSize={"lg"}>Use variáveis como <b>$NOME</b>, <b>$TELEFONE</b> etc. com base nas colunas do CSV.</Text>

      <Box maxW={"30vw"} margin={"8"} padding={5} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text>Mensagem com variáveis:</Text>
        <Textarea
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          placeholder="Olá $NOME, tudo bem?"
        />

        <Text mt={3}>Arquivo CSV com colunas TELEFONE, NOME etc:</Text>
        <Input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
        />

        <Text mt={3}>Imagem (opcional):</Text>
        <Input
          type="file"
          accept="image/*"
          onChange={e => setImagem(e.target.files[0])}
        />

        {imagem && (
          <Stack direction="row" spacing={4} mt={3}>
            <Text fontSize="sm" flex="1" noOfLines={1}>
              📎 {imagem.name}
            </Text>
            <Button colorScheme="red" size="sm" onClick={() => setImagem(null)}>
              Remover
            </Button>
          </Stack>
        )}

        <Button colorScheme="teal" mt={5} onClick={handleSubmit}>
          ENVIAR
        </Button>

        <Text fontWeight={"bold"} mt={5}>{resultado}</Text>
      </Box>
    </Box>
  );
}
