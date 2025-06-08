import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Button, Box, Typography, Paper, TextField,
  Alert, CircularProgress, Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

// Import data structure components
import ArrayDemo from '../../models/computer_science/Array';
import DequeDemo from '../../models/computer_science/Deque';
import ListDemo from '../../models/computer_science/List';
import DoublyLinkedListDemo from '../../models/computer_science/DoublyLinkedList';
import { UnorderedMapScene } from '../../models/computer_science/UnorderedMap';
import AVLTreeDemo from '../../models/computer_science/Map';
import { UnorderedSetScene } from '../../models/computer_science/UnorderedSet';
import AVLSetDemo from '../../models/computer_science/Set';
import AVLMultiSetDemo from '../../models/computer_science/Multiset';
import PriorityQueueDemo from '../../models/computer_science/PriorityQueue';
import QueueDemo from '../../models/computer_science/Queue';
import StackDemo from '../../models/computer_science/Stack';
import UnorderedMap from '../../models/computer_science/UnorderedMap';
import UnorderedSet from '../../models/computer_science/UnorderedSet';

// Styled components
const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
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
  width: '100%',
  overflow: 'hidden',
}));

const CodeSection = styled(Box)(({ theme }) => ({
  flex: 0.5,
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const IOSection = styled(Box)(({ theme }) => ({
  flex: 0.1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const VisualizationSection = styled(Box)(({ theme }) => ({
  flex: 10,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
  height: '100%',
  overflow: 'auto',
}));

const ContainerGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const GroupTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
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

  // State for data structures
  const [elements, setElements] = useState([1, 2, 3, 4, 5]);
  const [buckets, setBuckets] = useState(Array(8).fill([]).map(() => []));
  const [root, setRoot] = useState(null);
  const [type, setType] = useState("max");

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

        <VisualizationSection>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Data Structure Visualization
          </Typography>

          <ContainerGroup>
            <GroupTitle variant="subtitle1">
              Unordered Containers
            </GroupTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <UnorderedMap 
                    buckets={buckets}
                    showControls={false}
                    height="100%"
                    width="100%"
                    canvasHeight="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <UnorderedSet 
                    buckets={buckets}
                    showControls={false}
                    height="100%"
                    width="100%"
                    canvasHeight="100%"
                  />
                </Box>
              </Grid>
            </Grid>
          </ContainerGroup>

          <ContainerGroup>
            <GroupTitle variant="subtitle1">
              Ordered Containers
            </GroupTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <AVLTreeDemo 
                    root={root}
                    onRootChange={setRoot}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    edgeColor="#D4A5A5"
                    width="100%"
                    height="100%"
                    canvasHeight="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <AVLSetDemo 
                    root={root}
                    onRootChange={setRoot}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    edgeColor="#D4A5A5"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <AVLMultiSetDemo 
                    root={root}
                    onRootChange={setRoot}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    edgeColor="#D4A5A5"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <PriorityQueueDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    type={type}
                    onTypeChange={setType}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    edgeColor="#D4A5A5"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
            </Grid>
          </ContainerGroup>

          <ContainerGroup>
            <GroupTitle variant="subtitle1">
              Linear Containers
            </GroupTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ArrayDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    highlightGetColor="#D4A5A5"
                    highlightSetColor="#9B6B9E"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <DequeDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    frontIndicatorColor="#D4A5A5"
                    backIndicatorColor="#9B6B9E"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ListDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    arrowColor="#D4A5A5"
                    nullColor="#9B6B9E"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <DoublyLinkedListDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    arrowColor="#D4A5A5"
                    nullColor="#9B6B9E"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <QueueDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    frontIndicatorColor="#D4A5A5"
                    backIndicatorColor="#9B6B9E"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <StackDemo 
                    elements={elements}
                    onElementsChange={setElements}
                    backgroundColor="#2D2D2D"
                    textColor="#D4D4D4"
                    nodeColor="#9B6B9E"
                    topIndicatorColor="#D4A5A5"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </Grid>
            </Grid>
          </ContainerGroup>
        </VisualizationSection>
      </EditorContent>
    </EditorContainer>
  );
};

export default CppEditor; 