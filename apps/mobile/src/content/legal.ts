// PowerWatch Privacy Policy and Terms & Conditions.
//
// Single source for the wording: the mobile app renders this file, and
// apps/web/src/content/legal.ts must be an exact copy (the website serves the
// same documents at /privacy and /terms, which the app stores require).
// Update both copies together and change LEGAL_LAST_UPDATED.
//
// Everything here describes how the software actually works (backend in src/,
// this app, the website). If the system changes what it collects or who it
// shares data with, update these documents in the same change.

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_LAST_UPDATED = "September 27, 2026";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  summary:
    "PowerWatch is a community power-outage tracker. To show whether the power is on in your area, we need your account details, the places you follow and the location of the reports you send. We don't sell your data, and other users never see who you are or exactly where you reported from.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "This policy explains how the PowerWatch mobile app, the PowerWatch website and the PowerWatch service behind them (together, \"PowerWatch\", \"we\") collect and use information. It applies to everyone who creates an account or uses the website.",
      ],
    },
    {
      heading: "Information you give us",
      bullets: [
        "Account details: your full name, email address and password. Your password is stored only as a one-way hash; we can't read it.",
        "Email verification and password reset codes, sent to your email. Each code expires after 10 minutes and allows a limited number of attempts.",
        "Your primary neighborhood and its area details (town, city, LGA and state), plus up to 10 saved neighborhoods and any labels you give them (for example \"Office\").",
        "Your power reports: whether the power is ON or OFF, the neighborhood, and the time (set by our server, not your phone).",
        "Your notification choices: outage alerts, restoration alerts and community updates.",
      ],
    },
    {
      heading: "Your location",
      paragraphs: [
        "Location is central to PowerWatch, so we are specific about it. The app only uses your location while you are using it (\"while in use\" permission). It never tracks you in the background.",
      ],
      bullets: [
        "Your home point: when you set your monitoring area, the app asks for location permission and places a pin on your exact position. You can drag the pin or search instead. We save the exact point you confirm (latitude and longitude) with your profile, and use it to match you to the right neighborhood.",
        "Report locations: every time you report power ON or OFF, the app takes a fresh GPS reading and sends its exact coordinates and accuracy (in metres) with the report. We may use them to check that reports come from the area they describe. If you deny location permission or GPS isn't available, the report is sent without coordinates.",
        "Finding your neighborhood: to turn a point into a neighborhood name, our server sends the coordinates (not your name or email) to OpenStreetMap's Nominatim service.",
        "You can turn location access off at any time in your phone's settings. You can still search for your neighborhood by name.",
      ],
    },
    {
      heading: "Information collected automatically",
      bullets: [
        "Sign-in sessions: for each device you sign in on, we keep the IP address, the app or browser identifier (user agent), and when it was created and last used. You can see and sign out these devices in Profile > Signed-in Devices.",
        "Security and activity records: sign-ins, sign-outs, password changes, profile and location changes, report deletions and account deletion, with the IP address and user agent. We use these to protect accounts and investigate abuse.",
        "Push notification details: your device's push token, device name and type, so we can send alerts to your phone.",
        "Notification history: the alerts we sent you and whether you opened them (your in-app inbox).",
        "App analytics: anonymous usage events such as \"app opened\", \"sign up completed\", \"neighborhood selected\" and \"power reported\" (with ON/OFF and whether a location was attached). These are linked to a random device identifier, never to your name or email. The website counts page views and clicks on the download buttons the same way.",
        "Website preferences: the website remembers your light/dark theme choice in your browser.",
      ],
    },
    {
      heading: "How we use information",
      bullets: [
        "To run your account: sign-in, email verification, password resets and keeping sessions secure.",
        "To work out each neighborhood's power status. A neighborhood's status follows the majority of people who reported in the last 30 minutes, and each person counts once.",
        "To build outage history, uptime figures, the activity feed, the power map and the heatmap.",
        "To send outage and restoration alerts for your primary and saved neighborhoods, following your notification choices.",
        "To keep reports honest and the service safe: rate limits, a 5-minute gap between one person's reports for a neighborhood, and reviewing report locations when investigating misuse.",
        "To understand how the app is used and improve it (anonymous analytics).",
      ],
    },
    {
      heading: "What other users can see",
      paragraphs: [
        "Reports are anonymous to the community. Other users see neighborhood-level information only: a neighborhood's status, how many people confirmed it, when it changed, and outage history. They never see your name, email, home point, or the exact coordinates your reports were sent from. Your own reports, with their details, are visible only to you and to PowerWatch administrators.",
      ],
    },
    {
      heading: "Who we share information with",
      paragraphs: ["We do not sell your personal data. We share only what these services need to work:"],
      bullets: [
        "Email delivery: our email provider receives your email address and the code or message we send.",
        "Push notifications: Expo's push service, Apple Push Notification service and Google Firebase Cloud Messaging receive your device's push token and the alert text.",
        "Location lookup: OpenStreetMap Nominatim receives coordinates to convert them into an area name.",
        "Maps: map images come from OpenFreeMap (OpenStreetMap data), and the map library loads from the unpkg content network. Like any website, these services receive your device's IP address and the map area being viewed.",
        "Analytics: Mixpanel receives the anonymous usage events described above.",
        "Hosting: our servers and database providers store the data on our behalf.",
        "Legal reasons: we may disclose information if the law requires it, or to protect people's safety or the service against fraud or abuse.",
      ],
    },
    {
      heading: "How long we keep information",
      bullets: [
        "Account information: while your account is open.",
        "Sign-in sessions: until you sign out, or up to 30 days without use.",
        "Verification and reset codes: they expire after 10 minutes.",
        "Reports: kept to preserve each neighborhood's history. When you delete your account, your reports stay only as anonymous ON/OFF records, with their GPS coordinates removed.",
        "Security and activity records: kept as long as needed to protect accounts and investigate abuse.",
      ],
    },
    {
      heading: "Deleting your account",
      paragraphs: [
        "You can delete your account at any time in Profile > Profile Settings > Delete Account. This signs you out everywhere and permanently erases your name, email, password, home point, neighborhoods, saved places, devices, notification history and sessions. The GPS coordinates are removed from your past reports, which remain only as anonymous ON/OFF records. You can later sign up again with the same email.",
      ],
    },
    {
      heading: "Your choices",
      bullets: [
        "See and correct your name and primary location in the app at any time.",
        "Turn outage, restoration and community alerts on or off in Profile, or turn off notifications in your phone's settings.",
        "Allow or deny location access in your phone's settings.",
        "Sign out other devices in Profile > Signed-in Devices.",
        "Delete your account in Profile Settings.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Passwords are hashed. Sign-in tokens are short-lived and can be revoked, and sign-in, verification and reporting are rate-limited. Other users can't see personal details. We recommend using the app only with a PowerWatch server reached over an encrypted (HTTPS) connection. No system is perfectly secure, so please use a strong, unique password.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "PowerWatch is not intended for children under 13, and we don't knowingly collect their information. If you believe a child has created an account, contact us and we will delete it.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We will update this policy when PowerWatch changes what it collects or how it uses information, and change the date above. If a change is significant, we will tell you in the app before it applies.",
      ],
    },
  ],
};

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  summary:
    "PowerWatch shows whether the power is on in your neighborhood using reports from people who live there. By creating an account you agree to report honestly and to use the service as described below.",
  sections: [
    {
      heading: "Using PowerWatch",
      paragraphs: [
        "These terms apply to the PowerWatch mobile app, website and service. By creating an account or using PowerWatch you agree to them and to our Privacy Policy. If you don't agree, please don't use PowerWatch.",
      ],
    },
    {
      heading: "Who can use it",
      paragraphs: [
        "You must be at least 13 years old, and old enough to accept these terms where you live. You must give a real name and an email address that you control, and verify it with the code we send.",
      ],
    },
    {
      heading: "Your account",
      bullets: [
        "Keep your password private. You are responsible for activity on your account.",
        "If you think someone else has access, change your password and sign out other devices in Profile > Signed-in Devices.",
        "One person, one account. Accounts may not be shared, sold or transferred.",
      ],
    },
    {
      heading: "Reporting power status",
      paragraphs: [
        "PowerWatch only works if reports are honest. When you report:",
      ],
      bullets: [
        "Only report what you can see at your location right now.",
        "Allow the app to attach your location to reports where you can. We may check reports against the area they describe.",
        "One report per neighborhood every 5 minutes. A neighborhood's status follows the majority of people reporting, so a single report may not change it.",
        "Don't send false or misleading reports, report for places you are not in, or coordinate reports to manipulate a status.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: ["You agree not to:"],
      bullets: [
        "Use bots, scripts or automated tools to create accounts or send reports.",
        "Try to identify, track or contact other users through the service.",
        "Get around rate limits, reporting limits or security measures, or access accounts or data that aren't yours.",
        "Interfere with, overload or reverse-engineer the service, except where the law allows it.",
        "Use PowerWatch for anything unlawful, or to harass or harm anyone.",
      ],
    },
    {
      heading: "Community information, not official data",
      paragraphs: [
        "Power status, outage history, confidence figures, alerts and maps come from community reports and automatic calculations. PowerWatch is not an electricity distribution company, is not affiliated with one, and cannot confirm supply, schedules or restoration times. Information may be delayed, incomplete or wrong.",
        "Do not rely on PowerWatch for safety or emergencies. If you see a fallen line, sparks or another electrical hazard, stay away and contact your electricity distribution company or the emergency services.",
      ],
    },
    {
      heading: "Location and notifications",
      paragraphs: [
        "Some features need location permission (setting your exact monitoring area, attaching a location to reports) or notification permission (alerts). You can refuse or withdraw these permissions in your phone's settings; the related features will then work in a limited way. Alerts are sent on a best-effort basis and may arrive late or not at all.",
      ],
    },
    {
      heading: "Suspension and deletion",
      bullets: [
        "We may suspend or delete accounts that break these terms, for example by sending false reports, using automation or misusing other people's data. A suspended account can't sign in or send reports.",
        "You can delete your account at any time in Profile Settings. What deletion removes is explained in the Privacy Policy.",
      ],
    },
    {
      heading: "Our content and third-party services",
      paragraphs: [
        "PowerWatch, its design, logo and software belong to PowerWatch. While your account is open we give you a personal, non-transferable right to use the app. Your reports may be used, in aggregated and anonymous form, to show power status and history to others.",
        "Maps use OpenStreetMap data (© OpenStreetMap contributors, available under the Open Database License) through OpenFreeMap, and area names come from OpenStreetMap's Nominatim service. Push notifications are delivered through Expo, Apple and Google. Their own terms apply to their services.",
      ],
    },
    {
      heading: "Availability and changes",
      paragraphs: [
        "We work to keep PowerWatch running but don't guarantee it will always be available or error-free. We may change, add or remove features. We may update these terms. When we do, we will change the date above, and tell you in the app before significant changes apply. If you keep using PowerWatch after that, you accept the new terms.",
      ],
    },
    {
      heading: "Disclaimers and liability",
      paragraphs: [
        "PowerWatch is provided \"as is\". To the extent the law allows, we are not responsible for losses that come from relying on its information, including decisions about equipment, businesses, travel or safety, or from interruptions or errors in the service. Nothing in these terms limits rights you have under consumer law that cannot be limited.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, where PowerWatch operates.",
      ],
    },
  ],
};

/** Optional support address; shown in the Contact section when configured. */
export const contactSection = (supportEmail: string | undefined): LegalSection => ({
  heading: "Contact us",
  paragraphs: [
    supportEmail
      ? `Questions or requests about these documents, your data or your account: email ${supportEmail}.`
      : "Questions or requests about these documents, your data or your account: use Help & FAQ in the app, or the contact options on the PowerWatch website.",
  ],
});
