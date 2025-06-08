import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DataObject as DataObjectIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ExecutionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8edf7',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StepsList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const StepItem = styled(ListItem)(({ theme, isactive }) => ({
  backgroundColor: isactive === 'true' ? '#f0e6ef' : 'transparent',
  borderLeft: isactive === 'true' ? `4px solid #9B6B9E` : 'none',
  '&:hover': {
    backgroundColor: '#f8edf7',
  },
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
}));

const StateContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: '#f0e6ef',
  borderRadius: theme.spacing(1),
}));

const StateChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: '#9B6B9E',
  color: 'white',
}));

const ExecutionSteps = ({ steps = [], onStepChange, currentStepIndex = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const toggleStepExpansion = (stepIndex) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'insert':
        return '➕';
      case 'delete':
        return '➖';
      case 'search':
        return '🔍';
      case 'clear':
        return '🗑️';
      case 'resize':
        return '📏';
      case 'reserve':
        return '📦';
      case 'snapshot':
        return '📸';
      default:
        return '⚡';
    }
  };

  return (
    <ExecutionContainer>
      <Typography variant="h6" sx={{ color: '#9B6B9E' }}>
        Execution Steps
      </Typography>

      <ControlsContainer>
        <Tooltip title="Previous Step">
          <IconButton onClick={handlePrevious} disabled={currentStepIndex === 0}>
            <SkipPreviousIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <IconButton onClick={handleNext} disabled={currentStepIndex === steps.length - 1}>
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </ControlsContainer>

      <StepsList>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <StepItem
              isactive={(index === currentStepIndex).toString()}
              onClick={() => onStepChange(index)}
            >
              <ListItemIcon>
                <Typography variant="h6">
                  {getOperationIcon(step.operation)}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={step.operation}
                secondary={step.description}
              />
              <IconButton onClick={(e) => {
                e.stopPropagation();
                toggleStepExpansion(index);
              }}>
                {expandedSteps[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </StepItem>
            <Collapse in={expandedSteps[index]} timeout="auto" unmountOnExit>
              <StateContainer>
                <Typography variant="subtitle2" gutterBottom>
                  State Changes:
                </Typography>
                {step.state && Object.entries(step.state).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {key}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Array.isArray(value) ? (
                        value.map((item, i) => (
                          <StateChip
                            key={i}
                            label={item}
                            size="small"
                          />
                        ))
                      ) : (
                        <StateChip
                          label={value}
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </StateContainer>
            </Collapse>
            {index < steps.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </StepsList>
    </ExecutionContainer>
  );
};

export default ExecutionSteps; 