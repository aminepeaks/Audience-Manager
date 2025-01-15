// managing all properties

import {client} from "../config/oauth.js";


export const listProperties = async (req, res) => {
  console.log('listProperties', req.params.accountName);

  // return res.json({message: 'listProperties'});
  try {
    const [properties] = await client.listProperties({filter: "parent:" + `accounts/${req.params.accountName}`});
    res.json(properties);
    // console.log(properties);
  } catch (err) {
    // console.error(err["details"],
    // "parent:" + `accounts/${req.params.accountNAme}`);
    res.status(500).send('An error occurred while fetching properties');
  }
}

