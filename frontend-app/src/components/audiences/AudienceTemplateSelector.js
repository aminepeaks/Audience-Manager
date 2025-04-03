import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Divider,
  Icon,
  Chip
} from '@mui/material';
import { getAllTemplates } from '../../Services/audienceTemplateService';

const AudienceTemplateSelector = ({ onSelectTemplate }) => {
  const templates = getAllTemplates();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Start with a template (optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a template to automatically fill in common audience configuration or skip to create from scratch.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                bgcolor: 'background.paper',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardActionArea 
                sx={{ height: '100%' }}
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {template.displayName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {template.config.conditions.map((condition, index) => (
                      <Chip key={index} label={condition} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        
        {/* Option to create from scratch */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px dashed grey.400',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <CardActionArea 
              sx={{ height: '100%' }}
              onClick={() => onSelectTemplate(null)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Icon sx={{ mr: 1 }}>add_circle_outline</Icon>
                  <Typography variant="subtitle1" component="div">
                    Create from Scratch
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Start with a blank audience definition
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AudienceTemplateSelector;