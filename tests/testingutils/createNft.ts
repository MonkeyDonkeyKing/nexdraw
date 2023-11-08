import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Metaplex, bundlrStorage, keypairIdentity, mockStorage } from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';

export default async function createNft(connection: Connection, wallet: Keypair) {
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet)).use(mockStorage());

  const uploadResponse = await metaplex.nfts().uploadMetadata({
    name: 'First NFT'
  });

  // Create an NFT
  const createOutput = await metaplex.nfts().create({
    uri: 'https://nftstorage.link/ipfs/bafkreigwrzcon5qjn4nx2pfcevh3s7d3nglg6x2mpwdklfkzxmvuoyga6a',
    // uri: "",
    name: 'My NFT',
    sellerFeeBasisPoints: 500
  });

  return createOutput;
}
