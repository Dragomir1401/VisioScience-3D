import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Vector from '../models/computer_science/Vector';
import UnorderedMap from '../models/computer_science/UnorderedMap';
import Map from '../models/computer_science/Map';
import Set from '../models/computer_science/Set';
import Multiset from '../models/computer_science/Multiset';
import Deque from '../models/computer_science/Deque';
import Array from '../models/computer_science/Array';
import PriorityQueue from '../models/computer_science/PriorityQueue';
import Queue from '../models/computer_science/Queue';
import Stack from '../models/computer_science/Stack';
import CppList from '../models/computer_science/List';
import UnorderedSet from '../models/computer_science/UnorderedSet';

const VisualizationSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  marginTop: theme.spacing(2),
  minHeight: '300px',
}));

const VisualizationHeader = styled(Box)(({ theme }) => ({
  p: 2,
  backgroundColor: '#9B6B9E',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const VisualizationContent = styled(Box)(({ theme }) => ({
  flex: 1,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const DataStructureVisualization = ({ 
  selectedStructures, 
  onCloseVisualization, 
  executionSteps, 
  currentStepIndex 
}) => {
  if (!selectedStructures.length) return null;

  return (
    <VisualizationSection>
      <VisualizationHeader>
        <Typography variant="h6">
          Data Structure Visualizations
        </Typography>
      </VisualizationHeader>
      <VisualizationContent>
        {selectedStructures.map((structure) => (
          <Box key={structure.name} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 1, 
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '4px 4px 0 0'
            }}>
              <Typography variant="subtitle1">
                {structure.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => onCloseVisualization(structure.name)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, p: 1, border: '1px solid #f0f0f0', borderRadius: '0 0 4px 4px' }}>
              {structure.name === 'vector' && (
                <Vector 
                  elements={executionSteps[currentStepIndex]?.state?.elements || []} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'unordered_map' && (
                <UnorderedMap 
                  buckets={[]} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'map' && (
                <Map 
                  root={null} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'set' && (
                <Set 
                  root={null} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'multiset' && (
                <Multiset 
                  root={null} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'deque' && (
                <Deque 
                  elements={[]} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'array' && (
                <Array 
                  elements={[]} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'priority_queue' && (
                <PriorityQueue 
                  elements={[]} 
                  onElementsChange={() => {}} 
                  type="min" 
                  onTypeChange={() => {}} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'queue' && (
                <Queue 
                  elements={[]} 
                  onElementsChange={() => {}} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'stack' && (
                <Stack 
                  elements={[]} 
                  onElementsChange={() => {}} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'list' && (
                <CppList 
                  elements={[]} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
              {structure.name === 'unordered_set' && (
                <UnorderedSet 
                  buckets={[]} 
                  showControls={false} 
                  height="100%" 
                  width="100%" 
                  canvasHeight="100%" 
                />
              )}
            </Box>
          </Box>
        ))}
      </VisualizationContent>
    </VisualizationSection>
  );
};

export default DataStructureVisualization; 