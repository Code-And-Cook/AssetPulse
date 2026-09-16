require("dotenv").config();

const {
    Client,
    AccountId,
    PrivateKey
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

    console.log("✅ Connected to Hedera Testnet");
    console.log(`Account: ${accountId}`);

    // Mirror Node REST call instead of gRPC AccountBalanceQuery
    const res = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
    );
    const data = await res.json();
    console.log(`💰 Balance: ${data.balance.balance / 100_000_000} HBAR`);
}

main().catch((error) => {
    console.error("❌ Error:", error);
});