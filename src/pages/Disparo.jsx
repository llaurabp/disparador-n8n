import { useState, useRef } from "react";
//                      , useEffect } from 'react';
import Papa from "papaparse";
import {
  Box,
  Button,
  Input,
  Text,
  Textarea,
  Stack,
  Heading,
  Link,
  Group,
  Field,
  FileUpload,
  CloseButton,
  InputGroup,
  Icon,
} from "@chakra-ui/react";
// FileUpload,CloseButton, InputGroup
import { LuUpload, LuFileUp } from "react-icons/lu";
import { useColorModeValue } from "../components/ui/color-mode";
import { Link as RouterLink } from "react-router-dom";

export default function Disparo() {
  const [mensagem, setMensagem] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [isClickable, setIsClickable] = useState(false);
  const [linhasPersonalizadas, setLinhasPersonalizadas] = useState([]);
  const inputCsvRef = useRef(null);
  const inputImageRef = useRef(null);
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log(">> file:", file);
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),

      complete: function (results) {
        const linhas = results.data.filter((row) => row["TELEFONE"]);

        if (linhas.length === 0) {
          setResult(
            "⚠️ Nenhuma linha válida com a coluna TELEFONE encontrada."
          );
          return;
        }

        setLinhasPersonalizadas(linhas);
        setResult(`✅ ${linhas.length} contatos prontos para personalização.`);
      },
      error: function (err) {
        console.error(err);
        setResult("❌ Erro ao ler o arquivo CSV.");
      },
    });
  };

  const handleSubmit = async () => {
    if (!mensagem || !csvFile || linhasPersonalizadas.length === 0) {
      setResult("⚠️ Preencha todos os campos e envie um CSV válido.");
      return;
    }

    const mensagensFinal = linhasPersonalizadas.map((row) => {
      let msg = mensagem;

      Object.keys(row).forEach((key) => {
        const trimmedKey = key.trim();
        const regex = new RegExp(`\\$${trimmedKey}`, "gi");
        msg = msg.replace(regex, row[key]?.trim?.() ?? "");
      });

      const telefoneKey = Object.keys(row).find(
        (k) => k.toLowerCase() === "telefone"
      );
      const numero = telefoneKey ? row[telefoneKey] : "";

      return {
        telefone: numero,
        mensagem: msg,
      };
    });

    const formData = new FormData();
    formData.append("Mensagens", JSON.stringify(mensagensFinal));

    if (image) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const base64 = e.target.result.split(",")[1];
        formData.append("envio", "image");
        formData.append("arquivo", base64);

        if (localStorage.getItem("auth_instance") === null) {
          setResult("⚠️ Instância não encontrada. Faça ");
          setIsClickable(true);
          return;
        }
        setIsClickable(false);
        formData.append("instancia", localStorage.getItem("auth_instance"));

        for (const value of formData.values()) {
          console.log("if", value);
        }
        await enviarDados(formData);
      };
      reader.readAsDataURL(image);
    } else {
      formData.append("envio", "texto");

      if (localStorage.getItem("auth_instance") === null) {
        setResult("⚠️ Instância não encontrada. Faça ");
        setIsClickable(true);
        return;
      }
      setIsClickable(false);
      formData.append("instancia", localStorage.getItem("auth_instance"));

      for (const value of formData.values()) {
        console.log("else", value);
      }
      await enviarDados(formData);
    }
  };

  const enviarDados = async (formData) => {
    try {
      const res = await fetch(
        "https://test-n8n-webhook.logiczap.app/webhook/disparador-laura",
        {
          method: "POST",
          body: formData,
        }
      );
      setMensagem("");
      setResult("");
      setLinhasPersonalizadas([]);
      setImage(null);
      setCsvFile(null);
      if (inputCsvRef.current) {
        inputCsvRef.current.value = "";
      }
      if (inputImageRef.current) {
        inputImageRef.current.value = "";
      }
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      setResult("✅ Disparo enviado com sucesso!");
    } catch (err) {
      console.error(err);
      setResult(`❌ Erro ao enviar: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_instance");
    window.location.href = "/";
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bgGradient="linear(to-tr, gray.100, gray.50)"
      px={4}
      position={"relative"}
    >
      <Button
        position="absolute"
        top="8"
        right="8"
        size="sm"
        onClick={handleLogout}
      >
        Sair
      </Button>

      <Stack spacing={6} align="center" mb={6}>
        <Heading size="lg">Disparo de Mensagens</Heading>
        <Text fontSize="md" color="gray.600">
          Use variáveis como <b>$NOME</b>, <b>$TELEFONE</b> com base nas colunas
          do CSV.
        </Text>
      </Stack>

      <Box
        w={{ base: "100%", sm: "500px" }}
        p={8}
        bg={cardBg}
        borderRadius="xl"
        boxShadow={cardShadow}
      >
        <Stack spacing={5}>
          <Textarea
            autoresize
            maxH="20lh"
            minH="10lh"
            placeholder="Olá $NOME, tudo bem?"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            size="lg"
            variant="filled"
          />

          {/* 
          <Field.Root>
          <FileUpload.Root gap="1" maxWidth="300px">
            <FileUpload.HiddenInput />
            <FileUpload.Label fontWeight="bold">Arquivo CSV
            <Field.RequiredIndicator />
            </FileUpload.Label>
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
              <Input asChild>
                <FileUpload.Trigger>
                  <FileUpload.FileText lineClamp={1} />
                </FileUpload.Trigger>
              </Input>
            </InputGroup>
          </FileUpload.Root>
          </Field.Root> */}

            <FileUpload.Root gap="1" maxWidth="300px">
              <FileUpload.HiddenInput
                id="csvFile"
                ref={inputCsvRef}
                accept=".csv"
                onChange={(e) => {
                  handleCsvUpload(e);
                  const file = e.target.files[0];
                  if (file) setCsvFile(file);
                }}
              />

              <FileUpload.Label fontWeight="bold">
                Arquivo CSV
              </FileUpload.Label>

              <InputGroup
                startElement={<LuFileUp />}
                endElement={
                  csvFile && (
                    <CloseButton
                      me="-1"
                      size="xs"
                      variant="plain"
                      focusVisibleRing="inside"
                      focusRingWidth="2px"
                      pointerEvents="auto"
                      onClick={() => {
                        setResult("");
                        setCsvFile(null);
                        if (inputCsvRef.current) {
                          inputCsvRef.current.value = "";
                        }
                      }}
                    />
                  )
                }
              >
                <Input asChild>
                  <FileUpload.Trigger>
                    <FileUpload.FileText lineClamp={1}>
                      {csvFile ? csvFile.name : "Selecione um arquivo CSV"}
                    </FileUpload.FileText>
                  </FileUpload.Trigger>
                </Input>
              </InputGroup>
            </FileUpload.Root>

          {/* <Group attached w="full" maxW="sm">
            <Field.Root required>
              <Field.Label fontWeight="bold">
                Arquivo CSV
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                id="csvFile"
                ref={inputCsvRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                size="md"
                flex="1"
                placeholder={
                  csvFile ? csvFile.name : "Selecione um arquivo CSV"
                }
              />
            </Field.Root>
            {csvFile && (
              <Button
                bg="bg.subtle"
                variant="outline"
                onClick={() => {
                  setResult("");
                  setCsvFile(null);
                  if (inputCsvRef.current) {
                    inputCsvRef.current.value = "";
                  }
                }}
              >
                Remover
              </Button>
            )}
          </Group> */}

          <Box>
            <Field.Root>
              <Field.Label fontWeight="bold">Imagem</Field.Label>
              <Input
                ref={inputImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                size="md"
              />
            </Field.Root>
            {image && (
              <Button
                bg="bg.subtle"
                variant="outline"
                onClick={() => {
                  setResult("");
                  setImage(null);
                  if (inputImageRef.current) {
                    inputImageRef.current.value = "";
                  }
                }}
              >
                Remover
              </Button>
            )}
          </Box>
          <Button colorScheme="teal" size="lg" onClick={handleSubmit}>
            ENVIAR
          </Button>
          {result && (
            <Text fontWeight="bold" color="gray.700" mt={4}>
              {result}{" "}
              {isClickable && (
                <Link
                  as={RouterLink}
                  to="/"
                  color="gray.500"
                  textDecoration="underline"
                >
                  login novamente.
                </Link>
              )}
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
