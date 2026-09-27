import mixpanel from "mixpanel-browser";

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
  autocapture: false,
});

export default mixpanel;