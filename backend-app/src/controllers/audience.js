import { client } from "../config/oauth.js";


// **Create Audience**
export const createAudience = async (req, res) => {
  console.log('createAudience', req.body);
  try {
    const { accountName, audienceDefinition, selectedProperties } = req.body;

    if (!accountName || !audienceDefinition) {
      return res.status(400).send('Account name and audience definition are required');
    }

    // Fetch properties based on selection
    let properties = selectedProperties ? selectedProperties : await client.listProperties({parent: `accounts/${accountName}`});

    const audiences = [];

    for (let property of properties) {
      const audienceRequest = {
        parent: `accounts/${accountName}/properties/${property.property}`,
        audience: {
          description: audienceDefinition.description,
          name: audienceDefinition.name,
          filter: audienceDefinition.filter,
          membershipLifeSpan: audienceDefinition.membershipLifeSpan,
        },
      };

      const [audience] = await client.createAudience(audienceRequest);
      audiences.push(audience);
    }

    res.status(201).json(audiences);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while creating the audience');
  }
};

// **List Audiences**
export const listAudiences = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const formattedPropertyId = propertyId.startsWith('properties/') ? 
      propertyId : `properties/${propertyId}`;

    const [audiences] = await client.listAudiences({
      parent: formattedPropertyId
    });
    
    res.json(audiences);
  } catch (err) {
    console.error('List audiences error:', err);
    res.status(500).send('An error occurred while fetching audiences');
  }
};

// **Get Audience**
export const getAudience = async (req, res) => {
  try {
    const { accountName, audienceId } = req.params;

    const [audience] = await client.getAudience({ name: `accounts/${accountName}/audiences/${audienceId}` });
    res.json(audience);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the audience');
  }
};

// **Update Audience**
export const updateAudience = async (req, res) => {
  try {
    const { accountName, audienceId } = req.params;
    const { audienceDefinition } = req.body;

    if (!audienceDefinition) {
      return res.status(400).send('Audience definition is required');
    }

    const audienceRequest = {
      audience: {
        description: audienceDefinition.description,
        name: audienceDefinition.name,
        filter: audienceDefinition.filter,
        membershipLifeSpan: audienceDefinition.membershipLifeSpan,
      },
    };

    const [audience] = await client.updateAudience({
      audience: audienceRequest.audience,
      updateMask: audienceDefinition.updateMask,
    });

    res.json(audience);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while updating the audience');
  }
};

// **Delete Audience**
export const deleteAudience = async (req, res) => {
  try {
    const { accountName, audienceId } = req.params;

    await client.deleteAudience({ name: `accounts/${accountName}/audiences/${audienceId}` });
    res.status(204).send('Audience deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while deleting the audience');
  }
};
