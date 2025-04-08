import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Box, Button, Input, Text, Textarea, Stack, Heading,FileUpload,CloseButton, InputGroup
} from '@chakra-ui/react';
import { LuFileUp } from "react-icons/lu"
import {
  useColorModeValue,
} from "../components/ui/color-mode"

import { toaster } from "../components/ui/toaster"


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
        const linhas = results.data.filter(row => row['TELEFONE']);
        if (linhas.length === 0) {
          toaster.create({
            title: 'Arquivo inválido',
            description: "⚠️ Nenhuma linha com a coluna TELEFONE.",
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
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
        setResultado(`✅ ${mensagensProcessadas.length} mensagens preparadas.`);
      },
      error: function (err) {
        console.error(err);
        toaster.create({
          title: 'Erro ao processar CSV',
          description: '❌ Verifique o arquivo.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  const handleSubmit = async () => {
    if (!mensagem || !csvFile || linhasPersonalizadas.length === 0) {
      toaster.create({
        title: 'Campos incompletos',
        description: '⚠️ Preencha todos os campos e envie um CSV válido.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
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
      toaster.create({
        title: 'Sucesso',
        description: '✅ Disparo enviado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setResultado('');
    } catch (err) {
      console.error(err);
      toaster.create({
        title: 'Erro ao enviar',
        description: `❌ ${err.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
          resize="none"
            minH={"120px"}
            placeholder="Olá $NOME, tudo bem?"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            size="lg"
            variant="filled"
          />
      {/* <FileUpload.Root gap="1" maxWidth="300px" accept={["file/csv"]} >
      <FileUpload.HiddenInput />
      <FileUpload.Label>Arquivo CSV formatado</FileUpload.Label>
      <InputGroup
        startElement={<LuFileUp />}
        endElement={
          <FileUpload.ClearTrigger asChild>
            <CloseButton
              me="-1"
              size="xs"
              variant="plain"
              focusVisibleRing="inside"
              focusRingWidth="2px"
              pointerEvents="auto"
            />
          </FileUpload.ClearTrigger>
        }
      >
        <Input asChild onChange={handleCsvUpload} accept='.csv' type="file"> 
          <FileUpload.Trigger>
            <FileUpload.FileText lineClamp={1} />
          </FileUpload.Trigger>
        </Input>
      </InputGroup>
    </FileUpload.Root>
     */}
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
