import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Button, Box, Typography, Paper, TextField,
  Alert, CircularProgress, IconButton, Tooltip,
  List, ListItem, ListItemIcon, ListItemText,
  Chip, Dialog, DialogContent
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Import 3D scenes
import Vector from '../models/computer_science/Vector';
import CppList from '../models/computer_science/List';
import Map from '../models/computer_science/Map';
import Set from '../models/computer_science/Set';
import Queue from '../models/computer_science/Queue';
import Stack from '../models/computer_science/Stack';
import Deque from '../models/computer_science/Deque';
import PriorityQueue from '../models/computer_science/PriorityQueue';
import UnorderedMap from '../models/computer_science/UnorderedMap';
import UnorderedSet from '../models/computer_science/UnorderedSet';
import Multiset from '../models/computer_science/Multiset';

const PageContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  padding: '80px 0 0 0', 
  background: 'linear-gradient(to bottom right, #f8edf7, #fdf6f6)',
}));

const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 80px)', 
  backgroundColor: theme.palette.background.default,
  borderRadius: '0',
  overflow: 'hidden',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#9B6B9E',
  color: 'white',
}));

const EditorContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
}));

const Resizer = styled('div')(({ theme }) => ({
  width: '4px',
  cursor: 'col-resize',
  backgroundColor: '#9B6B9E',
  opacity: 0.5,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1,
  },
  '&.dragging': {
    opacity: 1,
    backgroundColor: '#D4A5A5',
  },
}));

const HorizontalResizer = styled(Resizer)({
  width: '100%',
  height: '4px',
  cursor: 'row-resize',
});

const CodeSection = styled(Box)(({ theme }) => ({
  flex: '1 1 60%',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '300px',
  maxWidth: '80%',
}));

const IOSection = styled(Box)(({ theme }) => ({
  flex: '1 1 40%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  backgroundColor: '#f8edf7',
  minWidth: '250px',
  gap: theme.spacing(2),
}));

const OutputSection = styled(Box)(({ theme }) => ({
  flex: '0 0 150px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
  maxHeight: '300px',
}));

const AnalysisSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
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

const ZoomControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginRight: theme.spacing(2),
  '& .MuiIconButton-root': {
    color: 'white',
    padding: theme.spacing(0.5),
  },
}));

const ZoomLevel = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '0.875rem',
  minWidth: '40px',
  textAlign: 'center',
}));

const DataStructureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: '#9B6B9E',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#D4A5A5',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const SceneDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#f8edf7',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: '100%',
    maxHeight: '450px',
    height: '450px',
    width: '100%',
    position: 'relative',
    margin: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiBackdrop-root': {
    display: 'none',
  },
}));

const SceneContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  width: '100%',
}));

const SceneHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#9B6B9E',
  color: 'white',
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
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('cppEditorFontSize');
    return savedSize ? parseInt(savedSize) : 14;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [codeWidth, setCodeWidth] = useState(() => {
    const savedWidth = localStorage.getItem('cppEditorCodeWidth');
    return savedWidth ? parseFloat(savedWidth) : 60;
  });
  const [outputHeight, setOutputHeight] = useState(() => {
    const savedHeight = localStorage.getItem('cppEditorOutputHeight');
    return savedHeight ? parseFloat(savedHeight) : 150;
  });
  const [dataStructures, setDataStructures] = useState([]);
  const editorRef = useRef(null);
  const resizerRef = useRef(null);
  const horizontalResizerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showScene, setShowScene] = useState(false);

  // Map structure names to their components
  const structureComponents = {
    'vector': Vector,
    'list': CppList,
    'map': Map,
    'set': Set,
    'queue': Queue,
    'stack': Stack,
    'deque': Deque,
    'priority_queue': PriorityQueue,
    'unordered_map': UnorderedMap,
    'unordered_set': UnorderedSet,
    'multiset': Multiset,
  };

  useEffect(() => {
    localStorage.setItem('cppEditorCode', code);
    localStorage.setItem('cppEditorInput', input);
    localStorage.setItem('cppEditorFontSize', fontSize.toString());
    localStorage.setItem('cppEditorCodeWidth', codeWidth.toString());
    localStorage.setItem('cppEditorOutputHeight', outputHeight.toString());
  }, [code, input, fontSize, codeWidth, outputHeight]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: 'Fira Code, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
    });

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

  const handleZoomIn = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const handleZoomOut = () => {
    const newSize = Math.max(fontSize - 2, 8);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !editorContainerRef.current) return;

    const containerRect = editorContainerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth >= 30 && newWidth <= 80) {
      setCodeWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleHorizontalMouseDown = (e) => {
    setIsDraggingHorizontal(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleHorizontalMouseMove = (e) => {
    if (!isDraggingHorizontal || !editorContainerRef.current) return;

    const containerRect = editorContainerRef.current.getBoundingClientRect();
    const newHeight = e.clientY - containerRect.top;
    
    if (newHeight >= 100 && newHeight <= 300) {
      setOutputHeight(newHeight);
    }
  };

  const handleHorizontalMouseUp = () => {
    setIsDraggingHorizontal(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleHorizontalMouseMove);
    document.addEventListener('mouseup', handleHorizontalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleHorizontalMouseMove);
      document.removeEventListener('mouseup', handleHorizontalMouseUp);
    };
  }, [isDraggingHorizontal]);

  const analyzeCode = (code) => {
    const structures = [];
    const patterns = {
      'vector': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?vector\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Dynamic array with contiguous storage'
      },
      'list': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?list\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Doubly-linked list'
      },
      'deque': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?deque\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Double-ended queue'
      },
      'array': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?array\s*<[^,]+,\s*\d+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Fixed-size array'
      },
      
      'unordered_map': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_map\s*<[^,]+,\s*[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based map'
      },
      'unordered_set': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_set\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based set'
      },
      'unordered_multimap': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_multimap\s*<[^,]+,\s*[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based multimap'
      },
      'unordered_multiset': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_multiset\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based multiset'
      },
      
      'map': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)map\s*<[^,]+,\s*[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted key-value pairs'
      },
      'set': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)set\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted unique elements'
      },
      'multimap': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)multimap\s*<[^,]+,\s*[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted key-value pairs with duplicate keys'
      },
      'multiset': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)multiset\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted elements with duplicates'
      },
      
      'queue': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?queue\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'FIFO queue'
      },
      'stack': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?stack\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'LIFO stack'
      },
      'priority_queue': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?priority_queue\s*<[^>]+>(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'Priority queue'
      }
    };

    for (const [structure, info] of Object.entries(patterns)) {
      if (info.pattern.test(code)) {
        structures.push({
          name: structure,
          type: info.type,
          description: info.description
        });
      }
    }

    setDataStructures(structures);
  };

  useEffect(() => {
    analyzeCode(code);
  }, [code]);

  const handleStructureClick = (structure) => {
    if (structureComponents[structure.name]) {
      setSelectedStructure(structure);
      setShowScene(true);
    }
  };

  const handleCloseScene = () => {
    setShowScene(false);
    setTimeout(() => {
      setSelectedStructure(null);
    }, 300);
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ZoomControls>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} size="small">
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <ZoomLevel>{fontSize}px</ZoomLevel>
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} size="small">
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
            </ZoomControls>
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
                backgroundColor: '#D4A5A5', 
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

        <EditorContent ref={editorContainerRef}>
          <CodeSection sx={{ flex: `${codeWidth} 1 0` }}>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              theme="customTheme"
              options={{
                fontSize: fontSize,
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

          <Resizer
            ref={resizerRef}
            onMouseDown={handleMouseDown}
            className={isDragging ? 'dragging' : ''}
          />

          <IOSection sx={{ flex: `${100 - codeWidth} 1 0` }}>
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
            />

            <HorizontalResizer
              ref={horizontalResizerRef}
              onMouseDown={handleHorizontalMouseDown}
              className={isDraggingHorizontal ? 'dragging' : ''}
            />

            <OutputSection sx={{ height: `${outputHeight}px` }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
                Output
              </Typography>
              <StyledPaper
                variant="outlined"
                sx={{
                  p: 2,
                  flex: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                }}
              >
                {error ? (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                ) : null}
                {output}
              </StyledPaper>
            </OutputSection>

            <AnalysisSection>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
                Identified Data Structures
              </Typography>
              <StyledPaper
                variant="outlined"
                sx={{
                  p: 2,
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                {dataStructures.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {['ordered', 'unordered', 'adaptor'].map(type => {
                      const typeStructures = dataStructures.filter(s => s.type === type);
                      if (typeStructures.length === 0) return null;
                      
                      return (
                        <Box key={type}>
                          <Typography variant="subtitle2" sx={{ 
                            color: '#9B6B9E',
                            textTransform: 'capitalize',
                            mb: 1
                          }}>
                            {type} Containers
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {typeStructures.map((structure) => (
                              <Tooltip 
                                key={structure.name}
                                title={`Click to view ${structure.name} visualization`}
                                placement="top"
                              >
                                <DataStructureChip
                                  icon={<DataObjectIcon />}
                                  label={structure.name}
                                  onClick={() => handleStructureClick(structure)}
                                  sx={{
                                    backgroundColor: type === 'ordered' ? '#9B6B9E' :
                                                   type === 'unordered' ? '#D4A5A5' :
                                                   '#C49595',
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data structures found in the code.
                  </Typography>
                )}
              </StyledPaper>
            </AnalysisSection>

            {selectedStructure && (
              <SceneDialog
                open={showScene}
                onClose={handleCloseScene}
                hideBackdrop
                disablePortal
                sx={{
                  position: 'relative',
                  marginTop: 2,
                }}
              >
                <SceneHeader>
                  <Typography variant="h6">{selectedStructure.name} Visualization</Typography>
                  <IconButton onClick={handleCloseScene}>
                    <ArrowBackIcon />
                  </IconButton>
                </SceneHeader>
                <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {selectedStructure.name === 'vector' && <Box height="350px" width="100%"><Vector elements={[]} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'unordered_map' && <Box height="350px" width="100%"><UnorderedMap buckets={[]} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'map' && <Box height="350px" width="100%"><Map root={null} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'set' && <Box height="350px" width="100%"><Set root={null} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'multiset' && <Box height="350px" width="100%"><Multiset root={null} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'priority_queue' && <Box height="350px" width="100%"><PriorityQueue elements={[]} onElementsChange={() => {}} type="min" onTypeChange={() => {}} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'queue' && <Box height="350px" width="100%"><Queue elements={[]} onElementsChange={() => {}} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'stack' && <Box height="350px" width="100%"><Stack elements={[]} onElementsChange={() => {}} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'deque' && <Box height="350px" width="100%"><Deque elements={[]} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'list' && <Box height="350px" width="100%"><CppList elements={[]} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                  {selectedStructure.name === 'unordered_set' && <Box height="350px" width="100%"><UnorderedSet buckets={[]} showControls={false} height="100%" width="100%" canvasHeight="350px" /></Box>}
                </DialogContent>
              </SceneDialog>
            )}
          </IOSection>
        </EditorContent>
      </EditorContainer>
    </PageContainer>
  );
};

export default CppEditorPage; 