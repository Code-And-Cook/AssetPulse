require("dotenv").config();

const {
    Client,
    AccountId,
    PrivateKey,
    TopicId,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");

async function main() {
    const accountId = AccountId.fromString(
        process.env.HEDERA_ACCOUNT_ID
    );

    const privateKey = PrivateKey.fromStringECDSA(
        process.env.HEDERA_PRIVATE_KEY
    );

    const topicId = TopicId.fromString(
        process.env.HEDERA_TOPIC_ID
    );

    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);

    const event = {
        assetId: "SOLAR-001",
        status: "CRITICAL",
        temperature: 91,
        efficiency: 61,
        maintenance: "REQUIRED",
        event: "EQUIPMENT_FAILURE"
    };

    const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(JSON.stringify(event))
        .freezeWith(client)
        .sign(privateKey);

    const submit = await tx.execute(client);
    const receipt = await submit.getReceipt(client);

    console.log("✅ Event submitted");
    console.log(`Status: ${receipt.status.toString()}`);
    console.log(event);
}

main().catch((error) => {
    console.error("❌ Error:", error);
});
