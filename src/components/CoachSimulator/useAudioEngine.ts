import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface ChatMessage {
  sender: string;
  text: string;
}

export function useAudioEngine(messages: ChatMessage[], setInputVal: React.Dispatch<React.SetStateAction<string>>) {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sanitizeTextForSpeech = (text: string) => {
    if (!text) return '';
    return text
      .replace(/## 📋 /g, '')
      .replace(/## 💬 /g, '')
      .replace(/\* \*\*(.*?)\*\*/g, '$1')
      .replace(/---/g, '')
      .replace(/### 🔍 /g, '')
      .replace(/\*/g, '');
  };

  const speakText = (text: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const cleanText = sanitizeTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      if (!isMounted.current) return;
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };
    utterance.onerror = () => {
      if (!isMounted.current) return;
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    setIsPlayingSpeech(true);
    setIsPausedSpeech(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeech = (textToSpeak: string) => {
    if (!window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }
    
    if (!textToSpeak) return;

    if (isPlayingSpeech) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
      }
      return;
    }

    speakText(textToSpeak);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  const toggleVoiceMode = () => {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);
    if (nextMode) {
      if (messages?.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.sender !== 'coach') {
          speakText(lastMsg.text);
        }
      }
    } else {
      handleStopSpeech();
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (window.speechSynthesis) {
      handleStopSpeech();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!isMounted.current) return;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (!isMounted.current) return;
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (!isMounted.current) return;
        toast.error("Speech recognition error.");
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!isMounted.current) return;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      toast.error("Failed to start speech recognition.");
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  return {
    isPlayingSpeech,
    isPausedSpeech,
    isVoiceMode,
    isListening,
    handleSpeech,
    handleStopSpeech,
    speakText,
    toggleVoiceMode,
    handleMicClick
  };
}
