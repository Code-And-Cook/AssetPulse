require("dotenv").config();
const express = require("express");
const path = require("path");
const {
    Client,
    AccountId,
    PrivateKey,
    TopicId,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");

const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
const topicId = TopicId.fromString(process.env.HEDERA_TOPIC_ID);

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// Fixed POC ownership data
app.get("/api/asset", (req, res) => {
    res.json({
        assetId: "SOLAR-001",
        value: 100000,
        totalTokens: 100000,
        ownedTokens: 5000
    });
});

// History pulled straight from Mirror Node (public, no key needed)
app.get("/api/history", async (req, res) => {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId.toString()}/messages`;
    const r = await fetch(url);
    const data = await r.json();

    const events = (data.messages || []).map((m) => {
        const decoded = Buffer.from(m.message, "base64").toString("utf8");
        return {
            consensusTimestamp: m.consensus_timestamp,
            ...JSON.parse(decoded)
        };
    });

    res.json(events);
});

// Submits the CRITICAL event live to HCS
app.post("/api/simulate-failure", async (req, res) => {
    try {
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

        res.json({ success: true, status: receipt.status.toString(), event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ AssetPulse dashboard running at http://localhost:${PORT}`);
});
