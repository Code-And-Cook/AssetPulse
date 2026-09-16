require("dotenv").config();

const {
    Client,
    AccountId,
    PrivateKey,
    TopicCreateTransaction
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

    const tx = await new TopicCreateTransaction()
        .setTopicMemo("SOLAR-001 condition events")
        .setAdminKey(privateKey.publicKey)
        .setSubmitKey(privateKey.publicKey)
        .freezeWith(client)
        .sign(privateKey);

    const submit = await tx.execute(client);
    const receipt = await submit.getReceipt(client);

    console.log("✅ Topic created");
    console.log(`Topic ID: ${receipt.topicId.toString()}`);
}

main().catch((error) => {
    console.error("❌ Error:", error);
});