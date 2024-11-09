import YTMusic from "ytmusic-api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

const ytmusic = new YTMusic();

app.get("/", (ctx) => ctx.json({ message: "Hello World" }));

app.use(cors());
app.use(prettyJSON());

app.get("/ping", (ctx) => {
  const start = Date.now();
  const ping = Date.now() - start;
  return ctx.json({
    message: "pong",
    ping: {
      time: ping,
      type: "ms",
      absolute: `${ping}ms`,
    },
  });
});

app.get("/home", async (ctx) => {
  const startTime = Date.now();
  const cookies = ctx.req.header("Cookie");

  console.error = () => {};

  await ytmusic.initialize({ cookies });
  const results = await ytmusic.getHomeSections();

  const ping = Date.now() - startTime;

  return ctx.json({
    message: "Fetched home sections",
    results,
    ping: {
      time: ping,
      type: "ms",
      absolute: `${ping}ms`,
    },
  });
});

type ResultType = "SONG" | "VIDEO" | "ALBUM" | "ARTIST" | "PLAYLIST";

const typePriority: Record<ResultType, number> = {
  SONG: 1,
  ALBUM: 2,
  PLAYLIST: 3,
  VIDEO: 4,
  ARTIST: 5,
};

app.get("/search", async (ctx) => {
  const startTime = Date.now();
  const cookies = ctx.req.header("Cookie");

  let query = ctx.req.query("q");

  if (!query) {
    query = "Bohemian Rhapsody";
  }

  console.error = () => {};

  await ytmusic.initialize({ cookies });

  const results = await ytmusic.search(query);

  const sortedResults = results.sort((a, b) => {
    return typePriority[a.type] - typePriority[b.type];
  });

  const ping = Date.now() - startTime;

  return ctx.json({
    message: `Searched for ${query}`,
    results: sortedResults,
    ping: {
      time: ping,
      type: "ms",
      absolute: `${ping}ms`,
    },
  });
});

app.get("/album/:id", async (ctx) => {
  const startTime = Date.now();
  const cookies = ctx.req.header("Cookie");

  const id = ctx.req.param("id");

  if (!id) {
    return ctx.json(
      {
        message: "No album ID provided",
      },
      404
    );
  }

  console.error = () => {};

  await ytmusic.initialize({ cookies });

  const results = await ytmusic.getAlbum(id);
  const ping = Date.now() - startTime;

  return ctx.json({
    message: `Fetched album ${results.name}`,
    results,
    ping: {
      time: ping,
      type: "ms",
      absolute: `${ping}ms`,
    },
  });
});

app.get("/song/:id", async (ctx) => {
  const startTime = Date.now();
  const cookies = ctx.req.header("Cookie");

  const id = ctx.req.param("id");

  if (!id) {
    return ctx.json(
      {
        message: "No song ID provided",
      },
      404
    );
  }

  console.error = () => {};

  await ytmusic.initialize({ cookies });

  const results = await ytmusic.getSong(id);
  const ping = Date.now() - startTime;

  return ctx.json({
    message: `Fetched song ${results.name}`,
    results,
    ping: {
      time: ping,
      type: "ms",
      absolute: `${ping}ms`,
    },
  });
});

export default {
  fetch: app.fetch,
  port: process.env.PORT || 3000,
};

console.info(`Server started on port ${process.env.PORT || 3000}`);
