import React, { useState, useEffect } from 'react';
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
    Tab,
    TextField
} from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import custom hooks instead of direct services
import { useAccounts } from '../hooks/useAccounts';
import { useProperties } from '../hooks/useProperties';
import { useAudiences } from '../hooks/useAudiences';

import AudienceList from '../components/audiences/AudienceList';
import AudienceForm from '../components/audiences/AudienceForm';

const LOCAL_STORAGE_KEY = 'audienceManagerState';

const AudienceManager = () => {
    // State from UML
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedAudience, setSelectedAudience] = useState(null);
    const [accountSearch, setAccountSearch] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    
    // Use custom hooks instead of direct state management
    const {
        accounts,
        loading: accountsLoading,
        error: accountsError,
        fetchAccounts
    } = useAccounts();
    // console.log(accounts);

    // Update the useProperties hook call to include selectedAccounts
    const {
        properties: propertiesMap,
        loading: propertiesLoading,
        error: propertiesError,
        fetchProperties
    } = useProperties(selectedAccounts);
    // console.log(propertiesMap);

    const {
        audiences,
        loading: audienceLoading,
        error: audienceError,
        fetchAudiences,
        createAudience,
        deleteAudience
    } = useAudiences(selectedProperties);

    // Fetch accounts on component mount
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        // Load saved state from localStorage on component mount
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const { accounts, properties, tab } = JSON.parse(savedState);
            setSelectedAccounts(accounts || []);
            setSelectedProperties(properties || []);
            setCurrentTab(tab || 0);
        }
    }, []);

    useEffect(() => {
        // Save current state to localStorage whenever it changes
        const stateToSave = {
            accounts: selectedAccounts,
            properties: selectedProperties,
            tab: currentTab
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }, [selectedAccounts, selectedProperties, currentTab]);

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

    const handleEdit = (audience) => {
        setSelectedAudience(audience);
        setCurrentTab(2); // Switch to edit tab
    };

    const handleRefreshAudiences = () => {
        setSelectedAudience(null);
        if (currentTab === 0) {
            fetchAudiences();
        }
    };

    const handleDeleteAudience = async (propertyId, audienceName) => {
        try {
            await deleteAudience(propertyId, audienceName);
        } catch (error) {
            console.error('Error deleting audience:', error);
        }
    };

    const handleSubmitAudience = async (formData) => {
        try {
            await createAudience(formData);
        } catch (error) {
            console.error('Error creating/updating audience:', error);
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
                                disabled={audienceLoading}
                            >
                                {audienceLoading ? 'Refreshing...' : 'Refresh Audiences'}
                            </Button>
                        </Box>
                        <AudienceList
                            audiences={audiences}
                            loading={audienceLoading}
                            error={audienceError}
                            properties={selectedProperties}
                            onEdit={handleEdit}
                            onDelete={handleDeleteAudience}
                            onRefresh={fetchAudiences}
                        />
                    </Box>
                );
            case 1: // Create
                return (
                    <AudienceForm
                        properties={selectedProperties}
                        onSubmit={handleSubmitAudience}
                    />
                );
            case 2: // Edit
                return selectedAudience ? (
                    <AudienceForm
                        audience={selectedAudience}
                        properties={selectedProperties}
                        onSubmit={handleSubmitAudience}
                    />
                ) : (
                    <Typography>Select an audience from the list to edit</Typography>
                );
            default:
                return null;
        }
    };

    const isLoading = accountsLoading || propertiesLoading;

    const filteredAccounts = accounts.filter(account =>
        account.displayName.toLowerCase().includes(accountSearch.toLowerCase())
    );

    const filteredProperties = Object.entries(propertiesMap)
        .filter(([accountId]) => selectedAccounts.includes(accountId))
        .reduce((acc, [accountId, properties]) => {
            acc[accountId] = properties.filter(property =>
                property.displayName.toLowerCase().includes(propertySearch.toLowerCase())
            );
            return acc;
        }, {});

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
                            <MenuItem disableRipple>
                                <TextField
                                    placeholder="Search Accounts"
                                    value={accountSearch}
                                    onChange={(e) => setAccountSearch(e.target.value)}
                                    fullWidth
                                    size="small"
                                    onKeyDown={(e) => e.stopPropagation()} // Prevent dropdown from intercepting key events
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from closing when clicking inside the search field
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            bgcolor: 'background.paper',
                                        },
                                    }}
                                />
                            </MenuItem>
                            {filteredAccounts.map((account) => (
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
                                <InputLabel>Select Properties</InputLabel>
                                <Select
                                    multiple
                                    value={selectedProperties}
                                    onChange={handlePropertyChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const property = Object.values(filteredProperties)
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
                                    <MenuItem disableRipple> 
                                        <TextField
                                            placeholder="Search Properties"
                                            value={propertySearch}
                                            onChange={(e) => setPropertySearch(e.target.value)}
                                            fullWidth
                                            onKeyDown={(e) => e.stopPropagation()} // Prevent dropdown from intercepting key events
                                            size="small"
                                        />
                                    </MenuItem>
                                    {Object.entries(filteredProperties).map(([accountId, properties]) => [
                                        <MenuItem
                                            key={`account-header-${accountId}`}
                                            disabled
                                            sx={{ bgcolor: 'grey.100' }}
                                        >
                                            <Typography variant="subtitle2">
                                                {accounts.find(acc => acc.name === accountId)?.displayName}
                                            </Typography>
                                        </MenuItem>,
                                        ...properties.map((property) => (
                                            <MenuItem
                                                key={`property-${accountId}-${property.name}`}
                                                value={property.name}
                                            >
                                                <Checkbox checked={selectedProperties.includes(property.name)} />
                                                <ListItemText primary={property.displayName} />
                                            </MenuItem>
                                        ))
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

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default AudienceManager;