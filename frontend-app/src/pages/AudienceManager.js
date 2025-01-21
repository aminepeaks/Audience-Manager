import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Button,
    Paper,
    Chip,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchAllAccountsAndProperties, getCachedData } from '../Services/dataService';
import AudienceList from '../components/audiences/AudienceList';
import AudienceForm from '../components/audiences/AudienceForm';
import { AudienceFilterBuilder } from '../utils/AudienceFilterBuilder';
import conditions from '../utils/conditions.json';

const AudienceManager = () => {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [propertiesMap, setPropertiesMap] = useState({});
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedAudience, setSelectedAudience] = useState(null);
    const audienceListRef = useRef(null);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const cachedData = getCachedData();
                if (cachedData.accounts && cachedData.properties) {
                    setAccounts(cachedData.accounts);
                    setPropertiesMap(cachedData.properties);
                    setLoading(false);
                    fetchAllAccountsAndProperties();
                    return;
                }
                const data = await fetchAllAccountsAndProperties();
                setAccounts(data.accounts);
                setPropertiesMap(data.properties);
            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const handleAccountChange = (event) => {
        const selectedAccountIds = event.target.value;
        setSelectedAccounts(selectedAccountIds);
        setSelectedProperties([]);
    };

    const handleClearAllAccounts = () => {
        setSelectedAccounts([]);
        setSelectedProperties([]);
    };

    const handleRemoveAccount = (accountToRemove) => {
        setSelectedAccounts(prev => 
            prev.filter(account => account !== accountToRemove)
        );
        setSelectedProperties([]);
    };

    const getFilteredProperties = () => {
        return Object.entries(propertiesMap)
            .filter(([accountId]) => selectedAccounts.includes(accountId))
            .reduce((acc, [accountId, properties]) => {
                acc[accountId] = Array.isArray(properties) ? properties : [];
                return acc;
            }, {});
    };

    const handlePropertyChange = (event) => {
        setSelectedProperties(event.target.value);
    };

    const handleSelectAllProperties = () => {
        const filteredProperties = Object.entries(propertiesMap)
            .filter(([accountId]) => selectedAccounts.includes(accountId))
            .flatMap(([_, properties]) => properties.map(property => property.name));
        setSelectedProperties(filteredProperties);
    };

    const handleClearAllProperties = () => {
        setSelectedProperties([]);
    };

    const handleRemoveProperty = (propertyToRemove) => {
        setSelectedProperties(prev => 
            prev.filter(property => property !== propertyToRemove)
        );
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSelectedAudience(null);
    };

    const handleRefreshAudiences = () => {
        setSelectedAudience(null);
        if (currentTab === 0) {
            audienceListRef.current?.fetchAudiences();
        }
    };

    const createAudience = async (formData) => {
        try {
            const builder = new AudienceFilterBuilder();
            builder.addUrlPattern(formData.urlPatterns);

            const conditionTemplate = conditions[formData.condition];
            const audience = builder.build(
                'unique-id',
                formData.name,
                formData.membershipLifeSpan,
                formData.condition
            );
        } catch (error) {
            console.error('Error creating audience:', error);
        }
    };

    const renderContent = () => {
        if (selectedProperties.length === 0) {
            return (
                <Typography sx={{ p: 2 }}>
                    Please select properties to manage audiences
                </Typography>
            );
        }

        switch (currentTab) {
            case 0: // List
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                startIcon={<RefreshIcon />}
                                onClick={handleRefreshAudiences}
                                variant="outlined"
                            >
                                Refresh Audiences
                            </Button>
                        </Box>
                        <AudienceList
                            ref={audienceListRef}
                            properties={selectedProperties}
                            onEdit={setSelectedAudience}
                            onDelete={(audience) => {/* implement delete */}}
                            key={loading ? 'loading' : 'loaded'}
                        />
                    </Box>
                );
            case 1: // Create
                return (
                    <AudienceForm
                        properties={selectedProperties}
                        onSubmit={createAudience}
                    />
                );
            case 2: // Edit
                return selectedAudience ? (
                    <AudienceForm
                        audience={selectedAudience}
                        properties={selectedProperties}
                        onSubmit={(data) => {/* implement update */}}
                    />
                ) : (
                    <Typography>Select an audience from the list to edit</Typography>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Audience Manager
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Accounts</InputLabel>
                        <Select
                            multiple
                            value={selectedAccounts}
                            onChange={handleAccountChange}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const account = accounts.find(acc => acc.name === value);
                                        return (
                                            <Chip
                                                key={value}
                                                label={account ? account.displayName : value}
                                                onDelete={() => handleRemoveAccount(value)}
                                                deleteIcon={
                                                    <CloseIcon 
                                                        onMouseDown={(event) => {
                                                            event.stopPropagation();
                                                        }}
                                                    />
                                                }
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        >
                            {accounts.map((account) => (
                                <MenuItem key={account.name} value={account.name}>
                                    <Checkbox checked={selectedAccounts.indexOf(account.name) > -1} />
                                    <ListItemText primary={account.displayName} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedAccounts.length > 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Select Properties</Typography>
                                <Box>
                                    <Button 
                                        onClick={handleSelectAllProperties}
                                        sx={{ mr: 1 }}
                                    >
                                        Select All Properties
                                    </Button>
                                    <Button 
                                        onClick={handleClearAllAccounts}
                                        startIcon={<ClearAllIcon />}
                                        color="secondary"
                                    >
                                        Clear All
                                    </Button>
                                </Box>
                            </Box>

                            <FormControl fullWidth>
                                <Select
                                    multiple
                                    value={selectedProperties}
                                    onChange={handlePropertyChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const property = Object.values(propertiesMap)
                                                    .flat()
                                                    .find(prop => prop.name === value);
                                                return (
                                                    <Chip
                                                        key={`chip-${value}`}
                                                        label={property ? property.displayName : value}
                                                        onDelete={() => handleRemoveProperty(value)}
                                                        deleteIcon={
                                                            <CloseIcon 
                                                                onMouseDown={(event) => {
                                                                    event.stopPropagation();
                                                                }}
                                                            />
                                                        }
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {Object.entries(getFilteredProperties()).map(([accountId, properties]) => [
                                        <MenuItem
                                            key={`account-header-${accountId}`}
                                            disabled
                                            sx={{ bgcolor: 'grey.100' }}
                                        >
                                            <Typography variant="subtitle2">
                                                {accounts.find(acc => acc.name === accountId)?.displayName}
                                            </Typography>
                                        </MenuItem>,
                                        ...(Array.isArray(properties) ? properties.map((property) => (
                                            <MenuItem
                                                key={`property-${accountId}-${property.name}`}
                                                value={property.name}
                                            >
                                                <Checkbox checked={selectedProperties.includes(property.name)} />
                                                <ListItemText primary={property.displayName} />
                                            </MenuItem>
                                        )) : [])
                                    ])}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Box>
            </Paper>

            {selectedProperties.length > 0 && (
                <Paper sx={{ mt: 3 }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label="List Audiences" />
                        <Tab label="Create Audience" />
                        <Tab label="Edit Audience" />
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                        {renderContent()}
                    </Box>
                </Paper>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default AudienceManager;