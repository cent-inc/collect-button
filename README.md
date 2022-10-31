# Collect Button

Documentation coming soon.

## Collect button notes and details [CURRENT]

The Collect button takes a _token type_ and makes it collectible by anyone.

A token type consists of:
- The title of the asset
- The description of the asset
- A URL pointing to the asset

The URL uniquely identifies each token type; no two tokens can use the same url.

Each asset type appears in its own collection on OpenSea.

The Collect Button currently allows you to create freely collectible NFTs.

To create creating a Collect Button, include the library as a script tag in the HEAD of your site:

```
<script src="https://unpkg.com/collect-button@latest"></script>
```

Then, you can initialize the button using the global method `createCollectButton`:

```
window.createCollectButton({ assetURL, assetTitle, assetDescription }, element);
```

The library takes care of web3 wallet creation, ownership tracking and collection management.

# Feature ideas (in no apparent order)
- [ ] APIs to support reading the current logged in user's address and the NFTs owned.
- [ ] Support for Paid NFTs
- [ ] Support for Collecting NFTs released through Pages
- [ ] Support for minting from different creator accounts on a single domain
- [ ] Ending Minting of asset from creator Dashboard
- [ ] Setting a max supply of an asset
- [ ] Limiting which assets/urls can be tokenized on your website
- [ ] Setting royalty rates, royalty owners, and contract owners
- [ ] importing React component directly into a react projects
- [ ] Limit collecting to greenlist of addresses/emails
- [ ] Mint directly to web3 address (not magic link)
- [ ] Allow phone number for Magic auth
