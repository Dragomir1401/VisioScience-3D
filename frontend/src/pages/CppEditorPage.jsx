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
import ExecutionSteps from '../components/ExecutionSteps';

import Vector from '../models/computer_science/Vector';
import CppList from '../models/computer_science/List';
import DoubleLinkedList from '../models/computer_science/DoublyLinkedList';
import Map from '../models/computer_science/Map';
import Set from '../models/computer_science/Set';
import Queue from '../models/computer_science/Queue';
import Stack from '../models/computer_science/Stack';
import Deque from '../models/computer_science/Deque';
import PriorityQueue from '../models/computer_science/PriorityQueue';
import UnorderedMap from '../models/computer_science/UnorderedMap';
import UnorderedSet from '../models/computer_science/UnorderedSet';
import Multiset from '../models/computer_science/Multiset';
import ArrayScene from '../models/computer_science/Array';

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

const Resizer = styled(Box)(({ theme }) => ({
  width: '4px',
  backgroundColor: theme.palette.divider,
  cursor: 'col-resize',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  '&.dragging': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const CodeSection = styled(Box)(({ theme }) => ({
  flex: '1 1 50%',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '300px',
  maxWidth: '100%',
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: '1 1 50%',
  display: 'flex',
  minWidth: '300px',
}));

const ExecutionSection = styled(Box)(({ theme }) => ({
  flex: '0 0 30%',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '180px',
  backgroundColor: '#f8edf7',
  padding: theme.spacing(2),
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

const IOSection = styled(Box)(({ theme }) => ({
  flex: '0 0 70%',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '250px',
  padding: theme.spacing(2),
  backgroundColor: '#f8edf7',
  borderLeft: `1px solid ${theme.palette.divider}`,
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
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 150px',
  minHeight: '150px',
}));

const VisualizationSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  marginTop: theme.spacing(2),
  minHeight: '400px',
  height: '100%'
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

const NUM_BUCKETS = 10; 

const hashString = (str, numBuckets) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash) % numBuckets;
};

const hashNumber = (num, numBuckets) => {
  return Math.abs(num) % numBuckets;
};

const calculateBuckets = (elements, numBuckets) => {
  const newBuckets = Array.from({ length: numBuckets }, () => []);
  elements.forEach(entry => {
    let bucketIndex;
    if (typeof entry.key === 'string') {
      bucketIndex = hashString(entry.key, numBuckets);
    } else if (typeof entry.key === 'number') {
      bucketIndex = hashNumber(entry.key, numBuckets);
    } else {
      // Fallback for other types, or throw an error
      bucketIndex = hashString(String(entry.key), numBuckets);
    }
    newBuckets[bucketIndex].push(entry);
  });
  return newBuckets;
};

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
  const [codeWidth, setCodeWidth] = useState(50);
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
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [structureStates, setStructureStates] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  const structureComponents = {
    'vector': Vector,
    'list': DoubleLinkedList,
    'forward_list': CppList,
    'map': Map,
    'set': Set,
    'queue': Queue,
    'stack': Stack,
    'deque': Deque,
    'priority_queue': PriorityQueue,
    'unordered_map': UnorderedMap,
    'unordered_set': UnorderedSet,
    'multiset': Multiset,
    'array': ArrayScene,
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
    setExecutionSteps([]);
    setCurrentStepIndex(0);
    setStructureStates({}); 

    try {
      const response = await fetch('http://localhost:8000/cpp-compiler/compile-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compile and run code');
      }

      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.output);
        if (data.executionData) {
          console.log('Execution data received:', data.executionData);
          setExecutionSteps(data.executionData);
          const newStructureStates = {};
          data.executionData.forEach(step => {
            const structureName = step.name;
            const structureType = step.type;
            const structureValue = step.state;
            
            // Handle all supported data structures
            if (structureValue) {
              switch (structureType) {
                case 'map':
                case 'unordered_map':
                  let processedValue = structureValue;
                  if (structureType === 'unordered_map') {
                    processedValue = calculateBuckets(structureValue, NUM_BUCKETS);
                  }
                  newStructureStates[structureName] = processedValue;
                  break;
                
                case 'vector':
                case 'deque':
                case 'array':
                case 'list':
                case 'forward_list':
                  newStructureStates[structureName] = structureValue;
                  break;
                
                case 'set':
                case 'unordered_set':
                case 'multiset':
                case 'unordered_multiset':
                  newStructureStates[structureName] = structureValue;
                  break;
                
                case 'queue':
                case 'stack':
                case 'priority_queue':
                  newStructureStates[structureName] = structureValue;
                  break;
              }
            }
          });

          // Find first available structure to visualize
          const firstStructure = Object.keys(newStructureStates).find(varName => {
            const structure = dataStructures.find(ds => ds.variableName === varName);
            return structure && newStructureStates[varName];
          });
          
          if (firstStructure) {
            const foundStructure = dataStructures.find(ds => ds.variableName === firstStructure);
            if (foundStructure) {
              setSelectedStructure(foundStructure);
              setShowScene(true);
              console.log("DEBUG: Automatically selected first structure:", foundStructure);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error during execution:', err);
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
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !editorContainerRef.current) return;

    const containerRect = editorContainerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit the width between 30% and 70%
    if (newWidth >= 30 && newWidth <= 70) {
      setCodeWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

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
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?vector\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Dynamic array with contiguous storage'
      },
      'list': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?list\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Doubly-linked list'
      },
      'forward_list': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?forward_list\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Singly-linked list'
      },
      'deque': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?deque\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Double-ended queue'
      },
      'array': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?array\s*<[^,]+,\s*\d+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Fixed-size array'
      },
      
      'unordered_map': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_map\s*<[^,]+,\s*[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based map'
      },
      'unordered_set': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_set\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based set'
      },
      'unordered_multimap': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_multimap\s*<[^,]+,\s*[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based multimap'
      },
      'unordered_multiset': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?unordered_multiset\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'unordered',
        description: 'Hash table based multiset'
      },
      
      'map': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)map\s*<[^,]+,\s*[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted key-value pairs'
      },
      'set': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)set\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted unique elements'
      },
      'multimap': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)multimap\s*<[^,]+,\s*[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted key-value pairs with duplicate keys'
      },
      'multiset': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?(?<!unordered_)multiset\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'ordered',
        description: 'Sorted elements with duplicates'
      },
      
      'queue': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?queue\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'FIFO queue'
      },
      'stack': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?stack\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'LIFO stack'
      },
      'priority_queue': {
        pattern: /(?:^|\s|;|\(|\)|,|&|::)(?:std::)?priority_queue\s*<[^>]+>\s*(\w+)(?:\s*\{[^}]*\})?(?=\s|;|\)|,|$)/g,
        type: 'adaptor',
        description: 'Priority queue'
      }
    };

    for (const [structure, info] of Object.entries(patterns)) {
      let match;
      while ((match = info.pattern.exec(code)) !== null) {
        const variableName = match[1];
        // Skip if this is a parameter in a function declaration
        const line = code.substring(0, match.index).split('\n').pop();
        if (!line.includes('(') || line.includes('{')) {
          console.log(`Found ${structure}: ${variableName}`); // Debug log
          structures.push({
            name: structure,
            variableName: variableName,
            type: info.type,
            description: `${info.description} (${variableName})`
          });
        }
      }
    }

    console.log('Detected structures:', structures); // Debug log
    setDataStructures(structures);
  };

  useEffect(() => {
    analyzeCode(code);
  }, [code]);

  const handleStructureClick = (structure) => {
    if (structureComponents[structure.name]) {
      setSelectedStructure(structure);
      setShowScene(true);
      
      const lastStep = [...executionSteps].reverse().find(step => 
        step.name === structure.variableName && step.state
      );
      
      if (lastStep) {
        console.log("DEBUG (CppEditorPage.jsx handleStructureClick): Found lastStep:", lastStep);
        let structureData = lastStep.state;
        
        // Handle different structure types
        if (structure.name === 'unordered_map' && structureData && Array.isArray(structureData)) {
          structureData = calculateBuckets(structureData, NUM_BUCKETS);
        } else if (structure.name === 'vector' && structureData) {
          structureData = Array.isArray(structureData) ? structureData : [structureData];
        } else if (structure.name === 'list' && structureData) {
          // Ensure list data is properly formatted
          structureData = Array.isArray(structureData) ? structureData : [structureData];
          console.log("List data for structure click:", structureData);
        }

        setStructureStates(prev => ({
          ...prev,
          [structure.variableName]: structureData
        }));
      }
    }
  };

  const handleCloseScene = () => {
    setShowScene(false);
    setTimeout(() => {
      setSelectedStructure(null);
    }, 300);
  };

  const handleStepChange = (index) => {
    setCurrentStepIndex(index);
    if (selectedStructure) {
      const currentStep = executionSteps[index];
      if (currentStep && currentStep.name === selectedStructure.variableName) {
        let structureData = currentStep.state;
        if (selectedStructure.name === 'unordered_map' && structureData && Array.isArray(structureData)) {
          structureData = calculateBuckets(structureData, NUM_BUCKETS);
        } else if (selectedStructure.name === 'vector' && structureData) {
          // Ensure vector data is properly formatted
          structureData = Array.isArray(structureData) ? structureData : [structureData];
          console.log("Vector data for step:", structureData);
        }
        setStructureStates(prev => ({
          ...prev,
          [selectedStructure.variableName]: structureData
        }));
      }
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(playIntervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= executionSteps.length - 1) {
            clearInterval(playIntervalRef.current);
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          const currentStep = executionSteps[nextIndex];
          
          // Check if the current step has a different structure than the selected one
          if (currentStep && currentStep.name) {
            const structure = dataStructures.find(ds => ds.variableName === currentStep.name);
            if (structure && (!selectedStructure || selectedStructure.variableName !== currentStep.name)) {
              // Switch to the new structure
              setSelectedStructure(structure);
              setShowScene(true);
            }
            
            // Update structure states
            if (currentStep.state) {
              let structureData = currentStep.state;
              if (structure.name === 'unordered_map' && structureData && Array.isArray(structureData)) {
                structureData = calculateBuckets(structureData, NUM_BUCKETS);
              } else if (structure.name === 'vector' && structureData) {
                structureData = Array.isArray(structureData) ? structureData : [structureData];
              }
              setStructureStates(prev => ({
                ...prev,
                [currentStep.name]: structureData
              }));
            }
          }
          
          return nextIndex;
        });
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  return (
    <PageContainer>
      <EditorContainer elevation={3}>
        <EditorHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Editor de cod</Typography>
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
              Copiază
            </Button>
            <Button
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{ mr: 1, color: 'white' }}
              size="small"
            >
              Resetare
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

          <RightSection sx={{ flex: `${100 - codeWidth} 1 0` }}>
            <ExecutionSection>
              <ExecutionSteps
                steps={executionSteps}
                currentStepIndex={currentStepIndex}
                onStepChange={handleStepChange}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            </ExecutionSection>

            <IOSection>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
                Intrare
              </Typography>
              <StyledTextField
                multiline
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                variant="outlined"
                fullWidth
              />

              <OutputSection sx={{ height: `${outputHeight}px` }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#9B6B9E' }}>
                  Ieșire
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
                <Box sx={{ p: 2, backgroundColor: '#9B6B9E', color: 'white' }}>
                  <Typography variant="h6">Structuri de date identificate</Typography>
                </Box>
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dataStructures.map((structure, index) => (
                    <DataStructureChip
                      key={`${structure.name}-${structure.variableName}-${index}`}
                      label={`${structure.name} (${structure.variableName})`}
                      onClick={() => handleStructureClick(structure)}
                      sx={{
                        backgroundColor: structure.type === 'ordered' ? '#9B6B9E' :
                                        structure.type === 'unordered' ? '#D4A5A5' :
                                        '#C49595',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: structure.type === 'ordered' ? '#8A5A8D' :
                                          structure.type === 'unordered' ? '#C49595' :
                                          '#B38585',
                        },
                      }}
                    />
                  ))}
                </Box>
              </AnalysisSection>

              {selectedStructure && (
                <VisualizationSection>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#9B6B9E', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6">
                      {selectedStructure.name} ({selectedStructure.variableName}) Visualization
                    </Typography>
                    <IconButton onClick={handleCloseScene} sx={{ color: 'white' }}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, p: 2, height: 'calc(100% - 64px)' }}>
                    {selectedStructure.name === 'vector' && (
                      <Vector 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'list' && (
                      <DoubleLinkedList 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'forward_list' && (
                      <CppList 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'unordered_map' && (
                      <UnorderedMap 
                        buckets={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'map' && (
                      <Map 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'set' && (
                      <Set 
                        root={structureStates[selectedStructure.variableName] || null} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'multiset' && (
                      <Multiset 
                        root={structureStates[selectedStructure.variableName] || null} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'deque' && (
                      <Deque 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'array' && (
                      <ArrayScene 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'priority_queue' && (
                      <PriorityQueue 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        onElementsChange={() => {}} 
                        type="min" 
                        onTypeChange={() => {}} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'queue' && (
                      <Queue 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        onElementsChange={() => {}} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'stack' && (
                      <Stack 
                        elements={structureStates[selectedStructure.variableName] || []} 
                        onElementsChange={() => {}} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                    {selectedStructure.name === 'unordered_set' && (
                      <UnorderedSet 
                        buckets={structureStates[selectedStructure.variableName] || []} 
                        showControls={false} 
                        height="100%" 
                        width="100%" 
                        canvasHeight="100%" 
                      />
                    )}
                  </Box>
                </VisualizationSection>
              )}
            </IOSection>
          </RightSection>
        </EditorContent>
      </EditorContainer>
    </PageContainer>
  );
};

export default CppEditorPage; 