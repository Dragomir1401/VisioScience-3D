import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Button, Box, Typography, Paper, TextField,
  Alert, CircularProgress, IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  padding: '80px 0 0 0', // 80px pentru navbar
  background: 'linear-gradient(to bottom right, #f8edf7, #fdf6f6)',
}));

const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 80px)', // Scădem înălțimea navbar-ului
  backgroundColor: theme.palette.background.default,
  borderRadius: '0',
  overflow: 'hidden',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#9B6B9E', // Culoarea mulberry
  color: 'white',
}));

const EditorContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
}));

const CodeSection = styled(Box)(({ theme }) => ({
  flex: 2,
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const IOSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: '#f8edf7', // Culoarea lavender
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '&:hover fieldset': {
      borderColor: '#9B6B9E',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9B6B9E',
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  '&.MuiPaper-root': {
    borderColor: '#9B6B9E',
  },
}));

const defaultCode = `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`;

const CppEditorPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem('cppEditorCode');
    return savedCode || defaultCode;
  });
  const [input, setInput] = useState(() => {
    const savedInput = localStorage.getItem('cppEditorInput');
    return savedInput || '';
  });
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  // Save code and input to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cppEditorCode', code);
    localStorage.setItem('cppEditorInput', input);
  }, [code, input]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Fira Code, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
    });

    // Set custom theme colors
    monaco.editor.defineTheme('customTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#2D2D2D',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#3E3E3E',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });
    monaco.editor.setTheme('customTheme');
  };

  const handleRun = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('http://localhost:8000/cpp-compiler/compile-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compile and run code');
      }

      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.output);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode(defaultCode);
    setInput('');
    setOutput('');
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleBack = () => {
    navigate('/computer-science');
  };

  return (
    <PageContainer>
      <EditorContainer elevation={3}>
        <EditorHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">C++ Editor</Typography>
          </Box>
          <Box>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              sx={{ mr: 1, color: 'white' }}
              size="small"
            >
              Copy
            </Button>
            <Button
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{ mr: 1, color: 'white' }}
              size="small"
            >
              Reset
            </Button>
            <Button
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              variant="contained"
              sx={{ 
                backgroundColor: '#D4A5A5', // Culoarea rosy-brown
                '&:hover': {
                  backgroundColor: '#C49595',
                },
              }}
              disabled={isLoading}
              size="small"
            >
              {isLoading ? <CircularProgress size={24} /> : 'Run'}
            </Button>
          </Box>
        </EditorHeader>

        <EditorContent>
          <CodeSection>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              theme="customTheme"
              options={{
                fontSize: 14,
                fontFamily: 'Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
              }}
            />
          </CodeSection>

          <IOSection>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
              Input
            </Typography>
            <StyledTextField
              multiline
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
              Output
            </Typography>
            <StyledPaper
              variant="outlined"
              sx={{
                p: 2,
                minHeight: '100px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
              }}
            >
              {error ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              ) : null}
              {output}
            </StyledPaper>
          </IOSection>
        </EditorContent>
      </EditorContainer>
    </PageContainer>
  );
};

export default CppEditorPage; 