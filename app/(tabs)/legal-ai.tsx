import { useRorkAgent, createRorkTool } from "@rork/toolkit-sdk";
import { MessageCircle, Send, Sparkles, FileText } from "lucide-react-native";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import Colors from "@/constants/colors";

export default function LegalAIScreen() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { messages, sendMessage, status } = useRorkAgent({
    tools: {
      gerarMinuta: createRorkTool({
        description: "Gera uma minuta jurídica portuguesa sobre um tema específico solicitado pelo advogado. Use esta ferramenta quando o advogado pedir para gerar, criar ou elaborar uma minuta.",
        zodSchema: z.object({
          tipo: z.string().describe("Tipo de minuta (ex: contrato, procuração, petição inicial, recurso, parecer)"),
          tema: z.string().describe("Tema ou assunto da minuta"),
          conteudo: z.string().describe("Conteúdo completo da minuta gerada em formato português, formatado adequadamente com todas as secções necessárias"),
        }),
        execute(input) {
          return input.conteudo;
        },
      }),
    },
  });
  const isLoading = status === "streaming";
  


  useEffect(() => {
    if (scrollViewRef.current && messages.length > 1) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      try {
        const userInput = input.trim();
        setInput("");
        
        if (messages.length === 0) {
          const systemContext = `Você é um assistente jurídico especializado em legislação portuguesa. Auxilie advogados com questões sobre leis de Portugal, jurisprudência portuguesa, Código Civil Português, Código Penal Português, e procedimentos legais em Portugal. Forneça respostas precisas, cite artigos relevantes quando apropriado, e mantenha um tom profissional. Quando o advogado solicitar a geração de uma minuta, use a ferramenta gerarMinuta fornecendo o conteúdo completo da minuta em formato adequado ao sistema legal português.\n\nPergunta: ${userInput}`;
          await sendMessage(systemContext);
        } else {
          await sendMessage(userInput);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
      }
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === "user";
    
    return (
      <View
        key={`${message.id}-${index}`}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {!isUser && (
            <View style={styles.aiHeader}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.aiLabel}>Assistente Jurídico</Text>
            </View>
          )}
          
          {message.parts.map((part: any, partIndex: number) => {
            if (part.type === "text") {
              return (
                <Text
                  key={`${message.id}-${partIndex}`}
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {part.text}
                </Text>
              );
            }
            if (part.type === "tool" && part.toolName === "gerarMinuta") {
              if (part.state === "output-available") {
                return (
                  <View key={`${message.id}-${partIndex}`} style={styles.minutaContainer}>
                    <View style={styles.minutaHeader}>
                      <FileText size={16} color={Colors.primary} />
                      <Text style={styles.minutaTitle}>Minuta Gerada</Text>
                    </View>
                    <Text style={styles.minutaText}>{part.output}</Text>
                  </View>
                );
              }
              if (part.state === "input-streaming" || part.state === "input-available") {
                return (
                  <View key={`${message.id}-${partIndex}`} style={styles.minutaGenerating}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.minutaGeneratingText}>A gerar minuta...</Text>
                  </View>
                );
              }
            }
            return null;
          })}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <MessageCircle size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Assistente Jurídico IA</Text>
            <Text style={styles.emptyDescription}>
              Tire dúvidas sobre legislação portuguesa e gere minutas jurídicas personalizadas.
            </Text>
            
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Exemplos:</Text>
              {[
                "Qual o prazo para recurso no processo civil português?",
                "Explique o artigo 280º do Código Civil",
                "Gera uma minuta de contrato de arrendamento urbano",
                "Cria uma procuração forense para tribunal cível",
              ].map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionCard}
                  onPress={() => setInput(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Pensando...</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Faça perguntas sobre leis ou solicite minutas..."
              placeholderTextColor={Colors.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 32,
    lineHeight: 24,
  },
  suggestionsContainer: {
    width: "100%",
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  suggestionCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    width: "100%",
    flexDirection: "row" as const,
  },
  userMessageContainer: {
    justifyContent: "flex-end" as const,
  },
  aiMessageContainer: {
    justifyContent: "flex-start" as const,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.surface,
  },
  aiText: {
    color: Colors.text,
  },
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  minutaContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  minutaHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.primary}30`,
  },
  minutaTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  minutaText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  minutaGenerating: {
    marginTop: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: 12,
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 8,
  },
  minutaGeneratingText: {
    fontSize: 13,
    color: Colors.primary,
    fontStyle: "italic" as const,
  },
});
