# Collect Button

The Collect Button makes anything on your site collectible by anyone. Using the SDK, you can manage what is collectable. We currently support have full support for images, videos, and audio files. We are constantly updating the capabilities, so be sure to check back for updates. You can also reach out to us with feature requests.

## Setup
1. Make sure you have a Cent account. This account will be the associated creator of all NFTs created with your site. You will have the ability to view items collected as well as the contact info (email addresses) of the collectors.

2. Make sure your third party domain is configured to mint with your Cent page. This is currently a manual step that currently requires reaching out to the Cent team with the domain you intend to use.

## Modes of operation

The Collect button SDK currently offers two modes of operation, a Default mode and a Headless mode. Default mode lets you pick and choose which items to make collectible with a UI, while Headless mode allows you to programmatically make assets collectible from the code on your site.

### Default mode

To manage which assets on your site are collectible using a friendly UI, add the following script to your site:

```
<script src="https://sdk.cent.co/dist/button.js"></script>
```

Then, on Cent.co, you will see a **Manage Collectibles** button in the **Website** tab that launches a management interface _within_ your site.

### Headless mode

To manage which assets on your site are collectible using custom JS code, add the following script to your site:

```
<script src="https://sdk.cent.co/dist/index.js"></script>
```

This will attach a global method to the `window` object `collectNFT({ url, title, description })`. These arguments specify the details of the NFT to be collected. Currently it is not possible to set the maximum supply or royalty details through this method.


### Asset Details

The Cent Platform offers the ability to control numerous aspects of an NFT. These include:

- **Price of the NFT:** Currently Sales are using traditional currencies, powered by Stripe.
- **Supply of the NFT:** How many units of this asset are collectable in total.
- **Contract owner:** This, for instance, allows you to claim the collection on OpenSea.
- **Royalty Rate:** A percentage of any volume that happens on secondary sales, on a market such as OpenSea.
- **Royalty Receipient:** The Ethereum address that receives any secondary sale royalties.

Note, it is not currently possible to specify these details in Headless mode.

### Web3 Details

When a user collects NFTs on your site, they interact with Cent though a series of Cent controlled flows. These flows:

1. Authenticate the user by verifying their email address.
2. Provision a web3 wallet for the user.
3. Mint the asset to the user's wallet.
4. Displs a confirmation message and sends a confirmation email.

The SDK integrator can access the email address of the collector by logging into the Cent Platform (cent.co) and viewing the asset collected.

## Feature ideas (in no apparent order)
- [ ] Customizing asset details in Headless mode.
- [ ] Style/theming for Collect flow
- [ ] Support for Video and Audio in Default
- [ ] Read APIs exposed via SDK for authenticated wallet and NFTs owned
- [ ] Limit collecting to greenlist of addresses/emails
- [ ] Minting directly to web3 address (not magic link)
- [ ] Authenticating with phone number instead of email
