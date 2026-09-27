const token: string | undefined = import.meta.env.VITE_MIXPANEL_TOKEN || undefined;

// Loaded on demand, and only when a token is configured, so analytics never
// slow down or break the page
const client = token
  ? import("mixpanel-browser").then(({ default: mixpanel }) => {
      mixpanel.init(token, {
        track_pageview: true,
        persistence: "localStorage",
        autocapture: false,
      });
      return mixpanel;
    })
  : null;

export const track = (event: string, properties?: Record<string, unknown>) => {
  client?.then((mixpanel) => mixpanel.track(event, properties)).catch(() => undefined);
};
