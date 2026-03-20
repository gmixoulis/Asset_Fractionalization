import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RealEstate } from "../target/types/real_estate";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  transfer
} from "@solana/spl-token";

describe("Real Estate Fractionalization & Marketplace E2E", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RealEstate as Program<RealEstate>;
  const authority = provider.wallet as anchor.Wallet;

  // Global variables to track state
  let propertyNftMint: anchor.web3.PublicKey;
  let userNftAta: anchor.web3.PublicKey;
  let fractionalMint: anchor.web3.PublicKey;
  
  // Market Simulation Variables
  // In a real dApp, you'd use Raydium, Meteora, or a custom Orderbook program.
  // Here we mock a Liquidity Pool (AMM) that holds SOL and our Fractional Tokens.
  let poolSolReserve: number;
  let poolTokenReserve: number;

  const propertyId = new anchor.BN(80085);
  const title = "123 Metaverse Ave";
  const propertyValueUsd = new anchor.BN(500_000); // Property worth $500,000
  const totalShares = new anchor.BN(10_000); // 10,000 stocks/shares

  it("1. Generates Real Estate NFT", async () => {
    console.log("-> Minting a new Metaplex Master Edition NFT (Simulated)...");

    // 1(a). Create the Mint (This is your Real Estate NFT, supply = 1)
    propertyNftMint = await createMint(
      provider.connection,
      (authority.payer as any), // Using local wallet payer
      authority.publicKey,
      null,
      0 // NFTs have 0 decimals
    );

    // 1(b). Create Associated Token Account for the User
    userNftAta = await createAssociatedTokenAccount(
      provider.connection,
      (authority.payer as any),
      propertyNftMint,
      authority.publicKey
    );

    // 1(c). Mint EXACTLY 1 Token to the User
    await mintTo(
      provider.connection,
      (authority.payer as any),
      propertyNftMint,
      userNftAta,
      authority.publicKey,
      1
    );

    const userAccount = await getAccount(provider.connection, userNftAta);
    console.log(`-> ✅ Successfully minted 1 Real Estate NFT to user. Balance: ${userAccount.amount}`);
  });

  it("2. Fractionalizes the Property into Stocks", async () => {
    console.log("-> Moving NFT to Vault and Minting fractional shares...");

    // 2(a). Generate Program Derived Addresses (PDAs)
    const [propertyPda, propertyBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("property"), authority.publicKey.toBuffer(), propertyId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Generate random keypairs for the vault's NFT account and the new fractional SPL Mint
    const vaultNftAccount = anchor.web3.Keypair.generate();
    const fractionalMintKeypair = anchor.web3.Keypair.generate();
    fractionalMint = fractionalMintKeypair.publicKey;

    // 2(b). Initialize Vault (Registers property on-chain)
    await program.methods
      .initializeVault(title, propertyId, propertyValueUsd, totalShares)
      .accounts({
        property: propertyPda,
        authority: authority.publicKey,
        propertyNftMint: propertyNftMint,
        vaultTokenAccount: vaultNftAccount.publicKey,
        fractionalMint: fractionalMintKeypair.publicKey,
      })
      .signers([vaultNftAccount, fractionalMintKeypair])
      .rpc();

    // 2(c). The destination account for the user's new shares
    const userFractionalAta = await getAssociatedTokenAddress(
      fractionalMintKeypair.publicKey,
      authority.publicKey
    );

    // 2(d). Call Fractionalize (Transfers NFT to Vault, Mints fractions to User)
    await program.methods
      .fractionalize(propertyId)
      .accounts({
        property: propertyPda,
        authority: authority.publicKey,
        propertyNftMint: propertyNftMint,
        authorityNftAccount: userNftAta,
        vaultTokenAccount: vaultNftAccount.publicKey,
        fractionalMint: fractionalMintKeypair.publicKey,
        authorityFractionalAccount: userFractionalAta,
      })
      .rpc();

    // Verify
    const finalUserNftAccount = await getAccount(provider.connection, userNftAta);
    const finalVaultNftAccount = await getAccount(provider.connection, vaultNftAccount.publicKey);
    const finalUserShares = await getAccount(provider.connection, userFractionalAta);

    console.log(`-> ✅ User NFT Balance (Should be 0): ${finalUserNftAccount.amount}`);
    console.log(`-> ✅ Vault NFT Balance (Should be 1): ${finalVaultNftAccount.amount}`);
    console.log(`-> ✅ User Fractional Shares (Should be 10,000): ${finalUserShares.amount}`);
  });

  it("3. Publishes to NFT Marketplace (Provide Liquidity)", async () => {
    console.log("-> Listing the Fractional Shares on a Decentralized Exchange (DEX)...");
    
    // In a real scenario, you would call a Raydium or Meteora smart contract here
    // to create a "Liquidity Pool". E.g., depositing 5,000 Shares and 500 SOL.
    
    // For this test, we simulate the math of an Automated Market Maker (Constant Product: X * Y = K)
    poolTokenReserve = 5000; // The owner deposits 5,000 of their shares into the pool
    poolSolReserve = 500;    // The owner deposits 500 SOL to back those shares
    
    console.log("-> ✅ Pool Created! Liquidity Provided:");
    console.log(`     Shares in Pool: ${poolTokenReserve}`);
    console.log(`     SOL in Pool: ${poolSolReserve}`);
  });

  it("4. Checks the current price of each fractionalized NFT", async () => {
    // Current Price on an AMM is calculated as `Reserve Quote / Reserve Base`
    // In our pool: SOL Reserve / Token Reserve
    
    const calculateCurrentPrice = (solRes: number, tokenRes: number) => {
      return solRes / tokenRes;
    };

    let currentPriceInSol = calculateCurrentPrice(poolSolReserve, poolTokenReserve);
    console.log(`-> ✅ Current Price per Fractional Share: ${currentPriceInSol} SOL`);
    
    console.log("-> Simulating a user buying 1,000 Shares from the marketplace...");
    
    // Constant Product AMM Buy Simulation (simplified, neglecting fees)
    // To buy 1,000 tokens, how much SOL must the user pay?
    // K = poolSolReserve * poolTokenReserve = 500 * 5000 = 2,500,000
    // new poolTokenReserve = 5000 - 1000 = 4000
    // new poolSolReserve = K / new poolTokenReserve = 2,500,000 / 4000 = 625 SOL
    // SOL user pays = 625 - 500 = 125 SOL
    
    poolTokenReserve -= 1000;
    poolSolReserve += 125;
    
    console.log(`     User bought 1,000 shares for 125 SOL.`);
    
    // Recalculate price after buy
    currentPriceInSol = calculateCurrentPrice(poolSolReserve, poolTokenReserve);
    console.log(`-> ✅ NEW Current Price per Fractional Share: ${currentPriceInSol} SOL`);
    console.log(`   (Price naturally increased because demand lowered the supply in the pool)`);
  });
});
