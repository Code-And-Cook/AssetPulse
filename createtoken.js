require("dotenv").config();

const {
    Client,
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType
} = require("@hashgraph/sdk");

async function main() {
    const accountId = AccountId.fromString(
        process.env.HEDERA_ACCOUNT_ID
    );

    const privateKey = PrivateKey.fromStringECDSA(
        process.env.HEDERA_PRIVATE_KEY
    );

    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);

    const tx = await new TokenCreateTransaction()
        .setTokenName("Solar Farm 001 Ownership")
        .setTokenSymbol("SOLAR-001")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(100000)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(100000)
        .setTreasuryAccountId(accountId)
        .setAdminKey(privateKey.publicKey)
        .setSupplyKey(privateKey.publicKey)
        .freezeWith(client)
        .sign(privateKey);

    const submit = await tx.execute(client);
    const receipt = await submit.getReceipt(client);

    console.log("✅ Token created");
    console.log(`Token ID: ${receipt.tokenId.toString()}`);
}

main().catch((error) => {
    console.error("❌ Error:", error);
});