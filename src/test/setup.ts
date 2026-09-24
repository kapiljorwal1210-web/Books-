import '@testing-library/jest-dom';

// Mock Web Speech API
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
    pending: false,
    speaking: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  } as any;

  (window as any).SpeechSynthesisUtterance = function (text: string) {
    return {
      text,
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: null,
      lang: 'en-US',
      onend: null,
      onerror: null
    };
  };

  // Mock localStorage if needed
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    }
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
  });
}
