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
/** Same date, as recorded with each account when the person agrees at sign-up */
export const LEGAL_VERSION = "2026-09-27";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  summary:
    "PowerWatch is a community power-outage tracker. To show whether the power is on in your area, we need your account details, the places you follow and the location of the reports you send. We don't sell your data, and other users never see who you are or exactly where you reported from.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "This policy explains how the PowerWatch mobile app, the PowerWatch website and the PowerWatch service behind them (together, \"PowerWatch\", \"we\") collect and use information. It applies to everyone who creates an account or uses the website.",
        "PowerWatch is the data controller: we decide why and how your personal data is used, and we handle it under the Nigeria Data Protection Act 2023. Our name, address and data protection contact are in \"Contact us\" at the end of this policy.",
      ],
    },
    {
      heading: "Information you give us",
      bullets: [
        "Account details: your full name, email address and password. Your password is stored only as a one-way hash; we can't read it.",
        "Your agreement: the date and time you agreed to the Terms & Conditions and this policy when you signed up, and which version you agreed to.",
        "Email verification and password reset codes, sent to your email. Each code expires after 10 minutes and allows a limited number of attempts. We store codes only in a protected (hashed) form.",
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
        "Finding your neighborhood: to turn a point into a neighborhood name, our server sends the coordinates (not your name or email) to OpenStreetMap's Nominatim service. If the neighborhood is new to PowerWatch, we place it on the map at an approximate position (rounded to about 1 km), never at your exact point.",
        "You can turn location access off at any time in your phone's settings. You can still search for your neighborhood by name.",
      ],
    },
    {
      heading: "Information collected automatically",
      bullets: [
        "Sign-in sessions: for each device you sign in on, we keep the IP address, the app or browser identifier (user agent), and when it was created and last used. You can see and sign out these devices in Profile > Signed-in Devices.",
        "Security and activity records: sign-ups, sign-ins, sign-outs, email verification, password changes, profile and location changes, device changes, report deletions and account deletion, with the IP address and user agent. We use these to protect accounts and investigate abuse.",
        "Server logs: like most online services, our servers record the IP address, time and address of each request, for security and troubleshooting.",
        "Push notification details: your device's push token, device name and type, so we can send alerts to your phone.",
        "Notification history: the alerts we sent you and whether you opened them (your in-app inbox).",
        "App usage statistics: once you have an account, the app sends events such as \"app opened\", \"sign up completed\", \"neighborhood selected\" and \"power reported\" (with ON/OFF and whether a location was attached) to our analytics provider. They are linked to a random identifier for your device and include basic device details (phone model, operating system and app version). They never include your name, email, neighborhood or coordinates, and we have switched off location lookup from your IP address. You can turn this off at any time in Profile > Profile Settings > Usage Statistics.",
        "Website statistics: the website counts page views and clicks on the download buttons. It does not store an identifier in your browser for this.",
        "Website preferences: the website remembers your light/dark theme choice in your browser.",
      ],
    },
    {
      heading: "How we use information, and our legal basis",
      paragraphs: [
        "The law requires us to have a reason (a \"lawful basis\") for each use of your personal data. Ours are:",
      ],
      bullets: [
        "To provide the service you signed up for (performance of a contract): running your account, sign-in, email verification and password resets; working out each neighborhood's power status; building outage history, uptime figures, the activity feed, the power map and the heatmap.",
        "With your consent: using your precise location, sending push notifications, and collecting app usage statistics. You can withdraw consent at any time, in your phone's settings or in Profile. Withdrawing it does not affect what was done before.",
        "For our legitimate interests in keeping PowerWatch honest and secure: rate limits, a 5-minute gap between one person's reports for a neighborhood, security records, server logs, and reviewing report locations when investigating misuse.",
        "To comply with the law, when a legal obligation requires us to keep or disclose information.",
      ],
    },
    {
      heading: "Automated processing",
      paragraphs: [
        "A neighborhood's status is worked out automatically: it follows the majority of people who reported in the last 30 minutes, and each person counts once. This describes a place, not you, and has no legal or similar effect on you. We do not use your data for advertising or to build a profile of you.",
      ],
    },
    {
      heading: "What other users can see",
      paragraphs: [
        "Reports are anonymous to the community. Other users see neighborhood-level information only: a neighborhood's status, how many people confirmed it, when reports were made, and outage history. They never see your name, email, home point, or the exact coordinates your reports were sent from. Your own reports, with their details, are visible only to you and to PowerWatch administrators, who need them to investigate misuse.",
      ],
    },
    {
      heading: "Who we share information with",
      paragraphs: [
        "We do not sell your personal data. We share only what these services need to work:",
      ],
      bullets: [
        "Email delivery: our email provider receives your email address and the code or message we send.",
        "Push notifications: Expo's push service, Apple Push Notification service and Google Firebase Cloud Messaging receive your device's push token and the alert text.",
        "Location lookup: OpenStreetMap Nominatim receives coordinates to convert them into an area name.",
        "Maps: map images come from OpenFreeMap (OpenStreetMap data), and the map library loads from the unpkg content network. Like any website, these services receive your device's IP address and the map area being viewed.",
        "Analytics: Mixpanel receives the usage statistics described above.",
        "Hosting: our servers and database providers store the data on our behalf.",
        "Legal reasons: we may disclose information if the law requires it, or to protect people's safety or the service against fraud or abuse.",
      ],
    },
    {
      heading: "Transfers outside Nigeria",
      paragraphs: [
        "Some of the providers above process data outside Nigeria, including in the United States and Europe. We send them only what they need, and they handle it under their own data protection terms. Where the law requires it, these transfers rely on your consent or on being necessary to provide the service you asked for. Contact us if you would like more detail about a particular provider.",
      ],
    },
    {
      heading: "How long we keep information",
      bullets: [
        "Account information: while your account is open.",
        "Sign-in sessions: until you sign out, or 30 days without use. Ended sessions are deleted within 24 hours.",
        "Verification and reset codes: they expire after 10 minutes and are deleted within 24 hours.",
        "Security and activity records: 12 months.",
        "Notification history: while your account is open, or until you delete a notification.",
        "Reports: kept to preserve each neighborhood's history. When you delete your account they stay without their GPS coordinates and are no longer linked to your name or email.",
        "Server logs: only as long as needed for security and troubleshooting.",
      ],
    },
    {
      heading: "Deleting your account",
      paragraphs: [
        "You can delete your account at any time in Profile > Profile Settings > Delete Account. This signs you out everywhere and permanently erases your name, email, password, home point, neighborhoods, saved places, devices, notification history, sessions and codes. The GPS coordinates are removed from your past reports, which remain only as ON/OFF records that are no longer linked to your name or email. Security records about your account lose their IP address and device details. You can later sign up again with the same email.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Under the Nigeria Data Protection Act you have the right to:",
      ],
      bullets: [
        "Know what personal data we hold about you and get a copy of it.",
        "Have inaccurate or incomplete data corrected. You can change your name and primary location in the app.",
        "Have your data deleted. You can delete your account in Profile Settings.",
        "Restrict or object to how we use your data, including uses based on our legitimate interests.",
        "Receive the data you gave us in a commonly used format, so you can move it elsewhere.",
        "Withdraw consent at any time: location and notifications in your phone's settings, alerts in Profile, usage statistics in Profile Settings.",
        "Not be subject to a decision based only on automated processing that has a legal or similar effect on you.",
        "Complain to the Nigeria Data Protection Commission (ndpc.gov.ng) if you believe we have mishandled your data. We would appreciate the chance to put things right first.",
      ],
    },
    {
      heading: "Using your rights",
      paragraphs: [
        "For anything you cannot do in the app, contact us using the details in \"Contact us\". We may need to confirm it is really you. We answer within 30 days and do not charge for reasonable requests.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Passwords and codes are hashed. The app talks to our servers over encrypted (HTTPS) connections. Sign-in tokens are short-lived and can be revoked, and sign-in, verification and reporting are rate-limited. Other users can't see personal details. No system is perfectly secure, so please use a strong, unique password.",
        "If a security breach is likely to put your rights or freedoms at risk, we will tell you without delay and notify the Nigeria Data Protection Commission within 72 hours of becoming aware of it, as the law requires.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "PowerWatch is for people aged 18 and over. We don't knowingly collect information from anyone under 18. If you believe a child has created an account, contact us and we will delete it.",
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
        "These terms apply to the PowerWatch mobile app, website and service. By creating an account or using PowerWatch you agree to them. Our Privacy Policy explains how we handle your personal data. If you don't agree, please don't use PowerWatch.",
      ],
    },
    {
      heading: "Who can use it",
      paragraphs: [
        "You must be at least 18 years old. You must give a real name and an email address that you control, and verify it with the code we send.",
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
      paragraphs: [
        "You agree not to:",
      ],
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
        "We may suspend or delete accounts that break these terms, for example by sending false reports, using automation or misusing other people's data. A suspended account can't sign in or send reports. If you think we made a mistake, contact us and we will review it.",
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
        "PowerWatch is provided \"as is\". To the extent the law allows, we are not responsible for losses that come from relying on its information, including decisions about equipment, businesses, travel or safety, or from interruptions or errors in the service.",
        "Nothing in these terms limits rights you have under Nigerian consumer law, including the Federal Competition and Consumer Protection Act 2018, or our responsibility for anything the law does not allow us to exclude.",
      ],
    },
    {
      heading: "Governing law and disputes",
      paragraphs: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, where PowerWatch operates. If you have a complaint, please contact us first so we can try to resolve it. If we cannot, the courts of Nigeria have jurisdiction.",
      ],
    },
  ],
};

/**
 * Who operates PowerWatch. The law requires these to be published, so set them
 * before release: EXPO_PUBLIC_LEGAL_* in the app and VITE_LEGAL_* on the website.
 */
export interface LegalContact {
  /** Registered name of the business or person operating PowerWatch */
  name?: string | undefined;
  /** Business address */
  address?: string | undefined;
  /** Address for questions and data requests */
  email?: string | undefined;
  /** Data protection contact, when it differs from `email` */
  dataProtectionEmail?: string | undefined;
}

/** Last section of both documents, built from the configured contact details. */
export const contactSection = (contact: LegalContact): LegalSection => {
  const bullets = [
    contact.name && `Operated by: ${contact.name}`,
    contact.address && `Address: ${contact.address}`,
    contact.email && `Email: ${contact.email}`,
    contact.dataProtectionEmail && `Data protection contact: ${contact.dataProtectionEmail}`,
  ].filter((line): line is string => Boolean(line));

  return {
    heading: "Contact us",
    paragraphs: [
      bullets.length
        ? "Questions or requests about these documents, your data or your account:"
        : "Contact details will be published here before PowerWatch is released.",
    ],
    ...(bullets.length ? { bullets } : {}),
  };
};
