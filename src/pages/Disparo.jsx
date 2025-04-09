import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Box, Button, Input, Text, Textarea, Stack, Heading,FileUpload,CloseButton, InputGroup
} from '@chakra-ui/react';
import { LuFileUp } from "react-icons/lu"
import {
  useColorModeValue,
} from "../components/ui/color-mode"


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
      transformHeader: header => header.trim(),

      complete: function (results) {
        const linhas = results.data.filter(row => row['TELEFONE']);
  
        if (linhas.length === 0) {
          setResultado("⚠️ Nenhuma linha válida com a coluna TELEFONE encontrada.");
          return;
        }
  
        setLinhasPersonalizadas(linhas);
        setResultado(`✅ ${linhas.length} contatos prontos para personalização.`);
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
  
    const mensagensFinal = linhasPersonalizadas.map(row => {
      let msg = mensagem;
  
      Object.keys(row).forEach(key => {
        const trimmedKey = key.trim();
        const regex = new RegExp(`\\$${trimmedKey}`, 'gi'); 
        msg = msg.replace(regex, row[key]?.trim?.() ?? '');
      });
      
  
      const telefoneKey = Object.keys(row).find(k => k.toLowerCase() === 'telefone');
      const numero = telefoneKey ? row[telefoneKey] : '';
  
      return {
        telefone: numero,
        mensagem: msg,
      };
    });
  
    const formData = new FormData();
    formData.append("Mensagens", JSON.stringify(mensagensFinal));
  
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
      setMensagem('');
      setLinhasPersonalizadas([]);
      setImagem(null);
      setCsvFile(null);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setResultado("✅ Disparo enviado com sucesso!");
    } catch (err) {
      console.error(err);
      setResultado(`❌ Erro ao enviar: ${err.message}`);
    }
  };
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');

  useEffect(() => {
    console.log("✅ Componente Disparo carregado");
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bgGradient="linear(to-tr, gray.100, gray.50)"
      px={4}
    >
      <Stack spacing={6} align="center" mb={6}>
        <Heading size="lg">Disparo de Mensagens</Heading>
        <Text fontSize="md" color="gray.600">
          Use variáveis como <b>$NOME</b>, <b>$TELEFONE</b> com base nas colunas do CSV.
        </Text>
      </Stack>

      <Box
        w={{ base: '100%', sm: '500px' }}
        p={8}
        bg={cardBg}
        borderRadius="xl"
        boxShadow={cardShadow}
      >
        <Stack spacing={5}>
          <Textarea
            placeholder="Olá $NOME, tudo bem?"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            size="lg"
            variant="filled"
          />
          <Input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            size="md"
          /> 
          <Input
            type="file"
            accept="image/*"
            onChange={e => setImagem(e.target.files[0])}
            size="md"
          />

          {imagem && (
            <Stack direction="row" spacing={4} align="center">
              <Text fontSize="sm" flex="1" noOfLines={1}>
                📎 {imagem.name}
              </Text>
              <Button size="sm" colorScheme="red" onClick={() => setImagem(null)}>
                Remover
              </Button>
            </Stack>
          )}

          <Button colorScheme="teal" size="lg" onClick={handleSubmit}>
            ENVIAR
          </Button>

          {resultado && (
            <Text fontWeight="bold" color="gray.700" mt={4}>
              {resultado}
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
