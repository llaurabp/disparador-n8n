import { useState } from 'react';
import {
  Box, Button, Input, Text, Stack, Heading, Field
} from '@chakra-ui/react';
import {
    useColorModeValue,
  } from "../components/ui/color-mode"

  import { toaster } from "../components/ui/toaster"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
        toaster.create({
        title: 'Campos obrigatórios',
        description: '⚠️ Preencha o e-mail e a senha.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://test-n8n-webhook.logiczap.app/webhook/disparador-login-laura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log({data})
      if (!response.ok || data.status === 'error') {
        toaster.create({
          title: 'Erro no login',
          description: data.message || '❌ Erro inesperado.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setResultado("⚠️ E-mail ou senha inválidos.");
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_instance', data.instancia);
      toaster.create({
        title: 'Sucesso!',
        description: '✅ Login realizado com sucesso.',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });
      setResultado("✅ Login realizado com sucesso.");

      setTimeout(() => {
        window.location.href = '/disparo';
      }, 1000);

    } catch {
        toaster.create({
        title: 'Erro de conexão',
        description: '❌ Erro ao conectar com o servidor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setResultado("❌ Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bgGradient="linear(to-tr, gray.100, gray.50)"
      px={4}
    >
      <Stack spacing={6} align="center">
        <Heading size="lg">Disparador - LógicZAP</Heading>
        <Text fontSize="md" color="gray.600">Acesse com sua conta</Text>

        <Box
          w={{ base: '90%', sm: '400px' }}
          bg={cardBg}
          p={8}
          borderRadius="xl"
          boxShadow={cardShadow}
        >
          <Stack spacing={5}>
          <Field.Root required>
          <Field.Label fontWeight="bold">E-mail
          <Field.RequiredIndicator />
          </Field.Label>
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              size="lg"
              variant="filled"
            />
      </Field.Root>

            <Field.Root required>
        <Field.Label fontWeight="bold">Senha
        <Field.RequiredIndicator />

        </Field.Label>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              size="lg"
              variant="filled"
            />
      </Field.Root>

            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleLogin}
              isLoading={loading}
              rounded="md"
            >
              Entrar
            </Button>
            <Text fontWeight="bold" color="gray.700" mt={4}>
            {resultado}
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
