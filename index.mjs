import { QdrantClient } from "@qdrant/qdrant-js";

const client = new QdrantClient({ host: "localhost", port: 6333 });
await client.recreateCollection("test", {
  vectors: { size: 4, distance: "Dot" },
});
await client.createPayloadIndex("test", {
  field_name: "index",
  field_schema: {
    type: "text",
    tokenizer: "word",
    min_token_len: 2,
    max_token_len: 15,
    lowercase: true,
  },
});

await client.upsert("test", {
  wait: true,
  points: ["test", "apple banana", "banana", "grape", "haha"].map((e, i) => ({
    id: i,
    vector: [0.0, 0.0, 0.0, 0.0],
    payload: { index: e },
  })),
});

const res = await client.search("test", {
  vector: [0.0, 0.0, 0.0, 0.0],
  filter: {
    // or 条件とする "apple banana" の場合、 and 条件となり、全てのキーワードを含む必要が生じる
    should: [
      {
        key: "index",
        match: { text: "apple" },
      },
      {
        key: "index",
        match: { text: "banana" },
      },
    ],
  },
});
console.log(res);
