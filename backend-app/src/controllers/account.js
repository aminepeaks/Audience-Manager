import {client} from "../config/oauth.js";


// manage ga4 accounts

const listAccounts = async (req, res) => {
  console.log('listAccountss');
  try {
    const [accounts] = await client.listAccounts();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching accounts');
  }
}

const getAccount = async (req, res) => {
    try {
        const [account] = await client.getAccount({name: "accounts/" + req.params.accountName});
        res.json(account);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching account');
    }
    }


export {listAccounts, getAccount};