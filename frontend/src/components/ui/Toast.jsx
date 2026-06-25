import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1F2937', // ethos-elevated
          color: '#FFFFFF', // ethos-white
          border: '1px solid #374151', // ethos-border
          borderRadius: '0.5rem',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#10B981', // ethos-success
            secondary: '#1F2937',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444', // ethos-danger
            secondary: '#1F2937',
          },
        },
      }}
    />
  );
}
