# The Collect Button SDK

Using the SDK, sites can make any asset collectable for their audiences. Cent currently supports images, videos, and audio files. Reach out to the team with feature requests at hello@cent.co or feel free to open an issue on GitHub.

## Setup
1. Register for a cent account: https://cent.co. This account will be associated with all NFTs created with your site.

2. Register your site: https://cent.co/join/tcb.

3. Add the SDK via script tag to your site (see section below for instructions).

Once these steps are complete, you will have full collectible functionality enabled on your domain.

## Adding the script tag

The SDK currently offers a set of APIs that trigger Cent UIs when invoked.

To have the SDK attach Collect Buttons automatically to your assets, add the Collect UI mode script _in lieu_ of the headless mode script:

### Collect UI mode

```
<script src="https://sdk.cent.co/dist/button.js"></script>
```

### Headless mode

```
<script src="https://sdk.cent.co/dist/index.js"></script>
```

### Collect API

Both modes export `cent` object with the following APIs

```
collectNFT({
  url: string,
  autoCollect=true: boolean,
  autoExit=false: boolean,
  onExit: function ({
    maxCollectTotal: number,
    oldCollectTotal: number,
    newCollectTotal: number,
    oldUserCollectTotal: number,
    newUserCollectTotal: number,
    userEmail: string
  })
}) => Promise<Result>

signMessage({
  message: string
}) => Promise<Result>

getUser() => Promise<Result>

loginUser() => Promise<Result>

getUserCollection({
  email: string,
  limit=20: number,
  offset=0: number
}) => Promise<Result>
```

Each collectible asset is uniquely identified by the `url` on the partner site. If a collectible with that url already exists, a new type will not be created and `title` and `description` will be ignored.

## Management interface

On Cent.co, you will see a **Manage Collectibles** button in the **Website** tab that launches a management interface _within_ your site. This interface lets you view and manage the different collectibles on your site.

You can also maually trigger the interface by adding by adding `?collectManager=1` to the url of your website.

The management interface lets you define numerous aspects when creating a new collectible type. These include:

- **Price of the NFT:** Currently Sales are using traditional currencies, powered by Stripe.
- **Supply of the NFT:** How many units of this asset are collectable in total.
- **Contract owner:** This, for instance, allows you to claim the collection on OpenSea.
- **Royalty Rate:** A percentage of any volume that happens on secondary sales, on a market such as OpenSea.
- **Royalty Receipient:** The Ethereum/Polygon address that receives any secondary sale royalties.


## PreRelease versions

The optional parameter `preRelease` (full added parameter is `?collectManager=1&preRelease=1`) can be used to fetch the latest pending version of the SDK if available.

## Web3 Details

When a user collects NFTs on your site, they interact with Cent though a series of Cent controlled flows. These flows:

1. Authenticate the user by verifying their email address.
2. Provision a web3 wallet for the user.
3. Mint the asset to the user's wallet.
4. Displs a confirmation message and sends a confirmation email.

The SDK integrator can access the email address of the collector by logging into the Cent Platform (cent.co) and viewing the asset collected.

## Feature ideas (in no apparent order)
- [ ] Style/theming for Collect flow
- [ ] Support for Video and Audio in Management interface
- [ ] Read APIs exposed via SDK for authenticated wallet and NFTs owned
- [ ] Limit collecting to greenlist of addresses/emails
- [ ] Minting directly to web3 address (not magic link)
- [ ] Authenticating with phone number instead of email
