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

The library takes care of web3 wallet creation, ownership tracking and collection management.

## Setup

1. Make sure you have a Cent Pages Creator account. This account will be the associated creator of all NFTs, and will have the ability to view email addresses of collectors.

2. Make sure your third party domain is configured to mint with your Cent page. This is a manual step that currently requires pinging the Cent Team with the domain(s) you intend to use.

3. Add the script tag to your site:

To add automatic collecting to all images on your site, include this library as a script tag in the HEAD of your site:

```
<script src="https://unpkg.com/collect-button@latest/dist/button.js"></script>
```

To add custom Collect Button to specific assets on your site, include the library as a script tag in the HEAD of your site:

```
<script src="https://unpkg.com/collect-button@latest/dist/index.js"></script>
```

Then, use custom scripting to initialize the button using the global method `createCollectButton`:

```
window.createCollectButton({
	assetURL: "<url>",
	assetTitle: "<title>",
	assetDescription: "<description>",
	buttonText: "Collect"
}, element);
```
- assetURL: Unique URL pointing to the asset which can be an image, audio, or video file 
- assetTitle: Title for the NFT. Maximum length of 200 characters
- assetDescription: Description for the NFT.
- buttonText: Label to use for the button.
- element: the container the Collect button should render inside of. 


## Feature ideas (in no apparent order)
- [ ] Self-service domain management for API access
- [ ] Non-componentized read APIs for the current user wallet and NFTs owned.
- [ ] Support for Paid NFTs
- [ ] Support for api-based Collecting of NFTs released through a Cent Page (non-API)
- [ ] Support for minting from different creator accounts on a single domain
- [ ] Ability to end Minting of asset from the creator Dashboard
- [ ] Limiting which assets/urls can be tokenized on your website from the creator Dashboard
- [ ] Setting a max supply of an asset
- [ ] Setting royalty rates, royalty owners, and contract owners
- [ ] Importing components and methods directly into a react project (not attaching to global events)
- [ ] Limit collecting to greenlist of addresses/emails
- [ ] Minting directly to web3 address (not magic link)
- [ ] Allowing phone number for Magic auth
