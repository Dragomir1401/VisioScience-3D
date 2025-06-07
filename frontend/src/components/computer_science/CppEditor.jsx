import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Button, Box, Typography, Paper, TextField,
  Alert, CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';


// Styled components
const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  borderRadius: '8px',
  overflow: 'hidden',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
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
  backgroundColor: theme.palette.background.paper,
}));

const defaultCode = `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`;

const CppEditor = () => {
  const [code, setCode] = useState(defaultCode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

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

  return (
    <EditorContainer elevation={3}>
      <EditorHeader>
        <Typography variant="h6">C++ Editor</Typography>
        <Box>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{ mr: 1 }}
            size="small"
          >
            Copy
          </Button>
          <Button
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{ mr: 1 }}
            size="small"
          >
            Reset
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={handleRun}
            variant="contained"
            color="secondary"
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
            theme="vs-dark"
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
          <Typography variant="subtitle1" gutterBottom>
            Input
          </Typography>
          <TextField
            multiline
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Output
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: '100px',
              backgroundColor: 'background.default',
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
          </Paper>
        </IOSection>
      </EditorContent>
    </EditorContainer>
  );
};

export default CppEditor; 