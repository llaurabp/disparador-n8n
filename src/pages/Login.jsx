import { useState, useEffect } from 'react';
import {
  Box, Button, Input, Text, Stack,
} from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMensagem('⚠️ Preencha o e-mail e a senha.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await fetch('https://test-n8n-webhook.logiczap.app/webhook/disparador-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await resposta.json();

      if (!resposta.ok || data.status === 'error') {
        setMensagem(`❌ ${data.message || 'Erro no login'}`);
        setCarregando(false);
        return;
      }

      // Sucesso! Armazenar token e redirecionar
      localStorage.setItem('auth_token', data.token);
      setMensagem('✅ Login realizado com sucesso!');
      setTimeout(() => {
        window.location.href = '/disparo'; // redirecione para sua tela de disparo
      }, 1000);

    } catch (erro) {
      console.error(erro);
      setMensagem('❌ Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    console.log("✅ Tela de login carregada");
  }, []);

  return (
    <Box
      margin={0}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100vw"
      height="100vh"
    >
      <Text fontSize="2xl" fontWeight="bold">Disparador - LógicZAP</Text>
      <Text fontSize="lg" mt={2}>Faça login para continuar</Text>

      <Box
        maxW="30vw"
        margin="8"
        padding={5}
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        width="100%"
      >
        <Stack spacing={4}>
          <Box>
            <Text>E-mail:</Text>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
            />
          </Box>

          <Box>
            <Text>Senha:</Text>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </Box>

          <Button colorScheme="teal" onClick={handleLogin} isLoading={carregando}>
            Entrar
          </Button>

          {mensagem && (
            <Text fontWeight="bold" mt={2} color={mensagem.includes('✅') ? 'green.500' : 'red.500'}>
              {mensagem}
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
