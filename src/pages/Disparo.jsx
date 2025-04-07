import { useState, useEffect } from 'react';
import { Box, Button, Input, Text, Textarea, Stack } from '@chakra-ui/react';

export default function Disparo() {
  const [mensagem, setMensagem] = useState('');
  const [numeros, setNumeros] = useState('');
  const [imagem, setImagem] = useState(null);
  const [resultado, setResultado] = useState('');

  const handleSubmit = async () => {
    if (!mensagem || !numeros) {
      setResultado("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

    const formData = new FormData();
    const numerosArray = numeros
      .split(/\r?\n|,/)
      .map(n => n.trim())
      .filter(n => n);

    formData.append("Mensagem", mensagem);
    formData.append("Numeros", numerosArray.join('\n'));

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
      const res = await fetch('https://test-n8n-webhook.logiczap.app/webhook/teste-disparador', {
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
      <Text fontSize={"lg"}>Envie mensagens para vários números de WhatsApp de uma vez!</Text>

      <Box maxW={"30vw"} margin={"8"} padding={5} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text>Mensagem:</Text>
        <Textarea
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
        />

        <Text mt={3}>Números (um por linha ou separados por vírgula):</Text>
        <Textarea
          rows={5}
          value={numeros}
          onChange={e => setNumeros(e.target.value)}
          placeholder="+5585999999999, +5585988888888"
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
