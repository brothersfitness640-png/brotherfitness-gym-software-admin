"use client";

import React, { useState, useMemo } from "react";
import PageContainer from "@/components/PageContainer";
import {
  BookOpen,
  Search,
  Globe2,
  Building2,
  QrCode,
  Users,
  Dumbbell,
  UserPlus,
  CalendarCheck,
  Layers,
  Package,
  UserCheck,
  UserCog,
  BadgeIndianRupee,
  HelpCircle,
  Settings,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles,
  ShieldCheck,
  Clock,
  IndianRupee,
  Camera,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";

type Language = "en" | "te";

interface FieldExplanation {
  field: { en: string; te: string };
  meaning: { en: string; te: string };
  example?: { en: string; te: string };
}

interface ActionExplanation {
  name: { en: string; te: string };
  trigger: { en: string; te: string };
  description: { en: string; te: string };
}

interface PageDocItem {
  id: string;
  category: "core" | "members" | "attendance" | "management" | "staff_payroll" | "system";
  route: string;
  icon: any;
  title: { en: string; te: string };
  tagline: { en: string; te: string };
  purpose: { en: string; te: string };
  overview: { en: string[]; te: string[] };
  actions: ActionExplanation[];
  fields: FieldExplanation[];
  proTip: { en: string; te: string };
}

const CATEGORIES = [
  { id: "all", label: { en: "All Modules", te: "అన్ని విభాగాలు" } },
  { id: "core", label: { en: "Core & Outlets", te: "డ్యాష్‌బోర్డ్ & బ్రాంచ్‌లు" } },
  { id: "members", label: { en: "Members & Leads", te: "సభ్యులు & ఎంక్వైరీలు" } },
  { id: "attendance", label: { en: "Attendance & QR", te: "హాజరు & QR కోడ్స్" } },
  { id: "management", label: { en: "Plans & Store", te: "ప్లాన్లు & ప్రొడక్ట్స్" } },
  { id: "staff_payroll", label: { en: "Staff & Payroll", te: "సిబ్బంది & జీతాలు" } },
  { id: "system", label: { en: "System & App", te: "సెట్టింగ్స్ & క్లయింట్ యాప్" } },
];

const HELP_DATA: PageDocItem[] = [
  // 1. Dashboard
  {
    id: "dashboard",
    category: "core",
    route: "/",
    icon: Building2,
    title: {
      en: "Dashboard (Home)",
      te: "డ్యాష్‌బోర్డ్ (ప్రధాన హోమ్ పేజీ)",
    },
    tagline: {
      en: "Real-time command center for gym revenue, active memberships & attendance overview",
      te: "జిమ్ ఆదాయం, యాక్టివ్ సభ్యత్వాలు మరియు రోజువారీ హాజరును పర్యవేక్షించే ప్రధాన పేజీ",
    },
    purpose: {
      en: "The central monitoring hub providing owner and manager instant visibility into current gym performance, active members count, expiring plans, today's check-ins, and pending fee collections.",
      te: "జిమ్ యాజమాన్యం మరియు మేనేజర్లకు మొత్తం జిమ్ వ్యాపార పరిస్థితి, నేటి హాజరు, గడువు ముగుస్తున్న ప్లాన్లు మరియు పెండింగ్ ఫీజులను ఒకేచోట స్పష్టంగా చూపించడానికి ఈ పేజీ ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "KPI Stat Cards: Total active clients, today's present count, monthly revenue, pending installments, expiring memberships.",
        "Today's Attendance Bar: Quick overview of how many members checked in today vs absent.",
        "Expiring Plans Alert List: Members whose packages expire in the next 7 days for proactive renewal calls.",
        "Quick Action Buttons: Instant shortcuts to add a client, mark attendance, or create a plan.",
      ],
      te: [
        "ప్రధాన గణాంకాలు (KPIs): మొత్తం యాక్టివ్ సభ్యులు, నేటి హాజరైన వారి సంఖ్య, నెలవారీ ఆదాయం, వసూలు కావాల్సిన పెండింగ్ ఫీజులు.",
        "నేటి హాజరు గ్రాఫ్: ఈ రోజు జిమ్‌కి ఎంతమంది వచ్చారు మరియు ఎంతమంది రాలేదో త్వరిత వివరాలు.",
        "ఎక్స్‌పైరీ అలర్ట్స్: రాబోయే 7 రోజుల్లో కాలపరిమితి ముగిసే సభ్యుల వివరాలు (రెన్యూవల్స్ కోసం కాల్ చేయవచ్చు).",
        "క్విక్ యాక్షన్ బటన్స్: సభ్యుడిని చేర్చడానికి, హాజరు వేయడానికి వెంటనే వెళ్లే షార్ట్‌కట్‌లు.",
      ],
    },
    actions: [
      {
        name: { en: "Filter by Outlet", te: "బ్రాంచ్ వారీగా ఫిల్టర్" },
        trigger: { en: "Branch Selector Dropdown", te: "బ్రాంచ్ ఎంపిక డ్రాప్‌డౌన్" },
        description: {
          en: "Filters all metrics, graphs, and expiry alerts for a specific branch or combined all-outlet view.",
          te: "ఒక నిర్దిష్ట బ్రాంచ్ లేదా అన్ని బ్రాంచ్‌ల సమాచారాన్ని కలిపి చూడటానికి బ్రాంచ్‌ను ఎంచుకోవచ్చు.",
        },
      },
      {
        name: { en: "Quick Add Member", te: "సభ్యుడిని చేర్చు" },
        trigger: { en: "'+ Add Client' Button", te: "'+ Add Client' బటన్" },
        description: {
          en: "Instantly launches the new member registration modal without leaving the dashboard.",
          te: "డ్యాష్‌బోర్డ్ వదలకుండానే కొత్త సభ్యుడి రిజిస్ట్రేషన్ ఫారమ్‌ను నేరుగా తెరుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Active Clients", te: "యాక్టివ్ క్లయింట్స్" },
        meaning: {
          en: "Members who currently have a valid, non-expired gym membership plan assigned.",
          te: "ప్రస్తుతం కాలపరిమితి ఉన్న ప్లాన్ కలిగి జిమ్‌కి వస్తున్న సభ్యుల సంఖ్య.",
        },
        example: { en: "142 Active Members", te: "142 మంది యాక్టివ్ సభ్యులు" },
      },
      {
        field: { en: "Pending Installments", te: "పెండింగ్ ఫీజులు" },
        meaning: {
          en: "Total sum of remaining fees that clients still need to pay against their assigned packages.",
          te: "సభ్యులు తమ మెంబర్‌షిప్ ప్యాకేజీ కోసం ఇంకా చెల్లించాల్సిన మిగిలిన మొత్తం ఫీజు.",
        },
        example: { en: "₹45,000 pending", te: "₹45,000 పెండింగ్" },
      },
    ],
    proTip: {
      en: "Check the 'Expiring Plans' section every morning to WhatsApp or call members 3 days before their plan ends for seamless renewals.",
      te: "ప్రతిరోజూ ఉదయం 'గడువు ముగిసే ప్లాన్లు' చూసి, 3 రోజుల ముందే సభ్యులకు వాట్సాప్ లేదా కాల్ చేయడం ద్వారా రెన్యూవల్స్ వేగంగా చేసుకోవచ్చు.",
    },
  },

  // 2. Gym Outlets
  {
    id: "outlets",
    category: "core",
    route: "/outlets",
    icon: Building2,
    title: {
      en: "Gym Outlets & Branches",
      te: "జిమ్ అవుట్‌లెట్లు & బ్రాంచ్‌లు",
    },
    tagline: {
      en: "Configure gym physical branch locations, front desk contacts & GPS coordinates for geofencing",
      te: "జిమ్ భౌతిక బ్రాంచ్‌ల పేర్లు, అడ్రస్ మరియు హాజరు సెక్యూరిటీ కోసం GPS లొకేషన్ వివరాలు",
    },
    purpose: {
      en: "Used to create and manage multiple gym branches. Sets up the branch name, address, phone numbers, and crucially the GPS coordinates (Latitude/Longitude) required for client attendance geofencing.",
      te: "మీ జిమ్‌కు ఉన్న వేర్వేరు బ్రాంచ్‌లను నమోదు చేయడానికి ఇది ఉపయోగపడుతుంది. బ్రాంచ్ అడ్రస్ మరియు హాజరు సమయంలో విద్యార్థి/సభ్యుడు జిమ్ లోపల ఉన్నాడా లేదా అని గుర్తించడానికి GPS కోఆర్డినేట్లను ఇక్కడ సెట్ చేస్తారు.",
    },
    overview: {
      en: [
        "Branch Cards Grid: Shows branch name, phone number, physical address, and configured GPS coordinates.",
        "Add Outlet Modal: Form to register new location with an automatic 'Detect Current GPS' button.",
        "Edit / Delete controls: Update contact numbers or remove discontinued facilities.",
      ],
      te: [
        "బ్రాంచ్‌ల జాబితా: బ్రాంచ్ పేరు, ఫోన్ నంబర్, అడ్రస్ మరియు సేవ్ చేసిన GPS లొకేషన్ వివరాలు.",
        "కొత్త బ్రాంచ్ నమోదు: ప్రస్తుత లొకేషన్‌ను ఆటోమేటిక్‌గా గుర్తించే బటన్‌తో కూడిన ఫారమ్.",
        "ఎడిట్ & డిలీట్: ఫోన్ నంబర్లు, అడ్రస్‌లను మార్చడానికి లేదా అవసరం లేని బ్రాంచ్‌ను తొలగించడానికి.",
      ],
    },
    actions: [
      {
        name: { en: "Auto-Detect Current GPS", te: "ప్రస్తుత GPS గుర్తించు" },
        trigger: { en: "'Detect Location' Icon Button", te: "'Detect Location' బటన్" },
        description: {
          en: "Uses browser geolocation when standing inside the gym to automatically fill latitude and longitude accurate to 5 meters.",
          te: "మీరు జిమ్ బ్రాంచ్‌లో ఉన్నప్పుడు ఈ బటన్ నొక్కితే బ్రౌజర్ ద్వారా ప్రస్తుత అక్షాంశం, రేఖాంశాలను (Latitude & Longitude) ఆటోమేటిక్‌గా నమోదు చేస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Latitude & Longitude", te: "లాటిట్యూడ్ & లాంగిట్యూడ్" },
        meaning: {
          en: "Exact decimal GPS coordinates of the gym building. Used by the security attendance scanner to confirm members are within 30 meters of the branch.",
          te: "జిమ్ భవనం యొక్క కచ్చితమైన GPS అక్షాంశ, రేఖాంశాలు. సభ్యులు 30 మీటర్ల పరిధిలోనే ఉన్నారా లేదా అని ధృవీకరించడానికి ఇది తప్పనిసరి.",
        },
        example: { en: "17.4938, 78.3912", te: "17.4938, 78.3912" },
      },
      {
        field: { en: "Branch Name", te: "బ్రాంచ్ పేరు" },
        meaning: {
          en: "Public name of the branch, which also appears on member receipts, attendance logs, and QR code cards.",
          te: "సభ్యుల రసీదులు, హాజరు లాగ్‌లు మరియు QR కోడ్ బోర్డులపై కనిపించే బ్రాంచ్ పేరు.",
        },
        example: { en: "Kukatpally Main Branch", te: "కూకట్‌పల్లి మెయిన్ బ్రాంచ్" },
      },
    ],
    proTip: {
      en: "Always stand directly inside the gym entrance reception when clicking 'Detect Location' to ensure the most accurate GPS geofencing pin.",
      te: "జిమ్ రిసెప్షన్ వద్ద నిలబడి 'Detect Location' బటన్ నొక్కడం వల్ల GPS చాలా ఖచ్చితంగా సెట్ అవుతుంది.",
    },
  },

  // 3. Outlets QR Code
  {
    id: "outlets-qr",
    category: "core",
    route: "/outlets-qr",
    icon: QrCode,
    title: {
      en: "Outlets QR Code Generator",
      te: "బ్రాంచ్ QR కోడ్ జనరేటర్",
    },
    tagline: {
      en: "Generate, preview and download high-resolution QR codes for members to scan their attendance",
      te: "జిమ్ సభ్యులు తమ మొబైల్ ద్వారా స్కాన్ చేసి హాజరు వేసుకోవడానికి అధికారిక QR కోడ్స్",
    },
    purpose: {
      en: "Generates tamper-proof QR codes for each gym outlet. Gym owners download and print these QR codes as standees, stickers, or reception posters for members to scan using their mobile web portal.",
      te: "ప్రతి బ్రాంచ్‌కు ప్రత్యేకమైన సెక్యూర్ QR కోడ్‌లను తయారు చేయడానికి ఇది ఉపయోగపడుతుంది. వీటిని ప్రింట్ తీసి జిమ్ ఎంట్రన్స్ వద్ద లేదా వర్కౌట్ స్టేషన్ల వద్ద బోర్డులుగా అతికించవచ్చు.",
    },
    overview: {
      en: [
        "Outlet Selection Dropdown: Switch between different gym branches.",
        "Live Branded QR Preview Card: Shows gym brand logo, branch name, and gold-accented QR framing.",
        "Download High-Res PNG Button: Saves a sharp image for printing reception stickers.",
        "Print Ready Poster Button: Formatted layout for instant A4 printing with scanning instructions.",
      ],
      te: [
        "బ్రాంచ్ డ్రాప్‌డౌన్: ఏ బ్రాంచ్ QR కోడ్ కావాలో ఎంచుకోవచ్చు.",
        "లైవ్ QR ప్రివ్యూ: జిమ్ లోగో, బ్రాంచ్ పేరుతో కూడిన అందమైన గోల్డ్ ఫ్రేమ్ డిజైన్.",
        "హై-రిజల్యూషన్ డౌన్‌లోడ్: స్టిక్కర్లు ప్రింట్ చేయడానికి క్లియర్ PNG ఫోటో డౌన్‌లోడ్.",
        "డైరెక్ట్ ప్రింట్ పోస్టర్: నేరుగా A4 సైజులో ప్రింట్ తీసి జిమ్ గోడపై అతికించే వీలు.",
      ],
    },
    actions: [
      {
        name: { en: "Download PNG", te: "PNG ఫోటో డౌన్‌లోడ్" },
        trigger: { en: "'Download High-Res' Button", te: "'Download High-Res' బటన్" },
        description: {
          en: "Downloads a 1000x1000px branded PNG QR image to send to local flex printers.",
          te: "ఫ్లెక్స్ లేదా స్టిక్కర్ ప్రింటింగ్ కోసం పంపడానికి స్పష్టమైన ఫోటోను సేవ్ చేస్తుంది.",
        },
      },
      {
        name: { en: "Print QR Station Poster", te: "QR పోస్టర్ ప్రింట్ చేయి" },
        trigger: { en: "'Print Poster' Button", te: "'Print Poster' బటన్" },
        description: {
          en: "Opens browser print dialog with full step-by-step instructions for members on how to scan and mark attendance.",
          te: "సభ్యులు ఎలా స్కాన్ చేయాలో వివరించే సూచనలతో కూడిన ప్రింట్ పేజీని తెరుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Encrypted QR Payload", te: "సెక్యూర్ QR డేటా" },
        meaning: {
          en: "Encodes the official Brother's Fitness signature, Outlet ID, and Outlet Name so only official gym software can verify attendance.",
          te: "ఇందులో జిమ్ అఫీషియల్ ఐడీ మరియు బ్రాంచ్ వివరాలు ఉంటాయి. ఇతర ఏ యాప్ కూడా దీనిని నకిలీ చేయలేదు.",
        },
      },
    ],
    proTip: {
      en: "Laminate the printed QR poster to protect it from sweat, moisture, and gym cleaning sprays at the entrance.",
      te: "ప్రింట్ చేసిన QR పోస్టర్‌ను లామినేషన్ చేయించి రిసెప్షన్ డెస్క్ వద్ద ఉంచితే ఎక్కువ కాలం మన్నుతుంది.",
    },
  },

  // 4. Clients Directory
  {
    id: "clients",
    category: "members",
    route: "/clients",
    icon: Users,
    title: {
      en: "Clients Directory (Members)",
      te: "సభ్యుల జాబితా (క్లయింట్స్ డైరెక్టరీ)",
    },
    tagline: {
      en: "Complete member lifecycle management: registrations, live webcam capture, plan validity & exports",
      te: "కొత్త సభ్యుల నమోదు, వెబ్‌క్యామ్ ఫోటో క్యాప్చర్, ప్లాన్ గడువు వివరాలు మరియు ఫీజు చెల్లింపులు",
    },
    purpose: {
      en: "Primary operations page to register gym members, view active memberships, track expired packages, search by mobile or name, capture profile photos, and assign plans with initial payments.",
      te: "జిమ్‌లో కొత్త సభ్యులను చేర్చుకోవడానికి, వారి వివరాలు, ఫోటోలు, ప్లాన్ గడువులు మరియు చెల్లింపు రికార్డులను నిర్వహించడానికి ప్రధాన పేజీ.",
    },
    overview: {
      en: [
        "Filter Tabs: All Clients, Ongoing/Active Plans, Expired Plans, No Plan Assigned.",
        "Search & Outlet Filters: Instant search by member name, phone number, or client ID.",
        "Clients Table & Mobile Cards: Member photo, name, phone, branch, plan validity, and action buttons.",
        "Add / Edit Member Modal: Comprehensive form with webcam capture and initial plan fee installment entry.",
      ],
      te: [
        "ఫిల్టర్ ట్యాబ్‌లు: అందరు సభ్యులు, యాక్టివ్ ప్లాన్ ఉన్నవారు, గడువు ముగిసినవారు, ప్లాన్ లేనివారు.",
        "సెర్చ్ బార్: పేరు, ఫోన్ నంబర్ లేదా క్లయింట్ ఐడీతో వెంటనే శోధించవచ్చు.",
        "సభ్యుల పట్టిక & కార్డ్స్: ఫోటో, పేరు, ఫోన్, బ్రాంచ్, ప్లాన్ ముగిసే తేదీ మరియు ప్రొఫైల్ లింక్.",
        "కొత్త సభ్యుని ఫారమ్: లైవ్ కెమెరా ఫోటో క్యాప్చర్ మరియు ఫీజు రికార్డులతో కూడిన పూర్తి ఫారమ్.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Client", te: "+ కొత్త సభ్యుడిని చేర్చు" },
        trigger: { en: "Top Yellow '+ Add Client' Button", te: "పైన ఉన్న పసుపు '+ Add Client' బటన్" },
        description: {
          en: "Opens registration modal where you can input name, phone, MPIN, capture photo, select starting plan, and record the registration payment.",
          te: "సభ్యుని పేరు, ఫోన్, లాగిన్ MPIN, లైవ్ ఫోటో మరియు చేరే సమయంలో చెల్లించిన ఫీజును నమోదు చేయడానికి ఫారమ్ తెరుస్తుంది.",
        },
      },
      {
        name: { en: "Camera Photo Capture", te: "కెమెరా ఫోటో క్యాప్చర్" },
        trigger: { en: "'Snap Photo' / 'Back Camera' Toggle", te: "'Snap Photo' బటన్" },
        description: {
          en: "Opens device camera (defaults to back camera, instant switch to front) to capture high-definition member face photo for verification.",
          te: "మొబైల్ లేదా ల్యాప్‌టాప్ కెమెరా ద్వారా సభ్యుడి ముఖం ఫోటో తీసి వెంటనే ప్రొఫైల్‌కు సేవ్ చేస్తుంది (బ్యాక్ & ఫ్రంట్ కెమెరా స్విచ్ అందుబాటులో ఉంది).",
        },
      },
      {
        name: { en: "View Profile", te: "పూర్తి ప్రొఫైల్ చూడు" },
        trigger: { en: "'View Profile' Button / Eye Icon", te: "'View Profile' బటన్" },
        description: {
          en: "Navigates to the comprehensive 5-tab client details workspace for that specific member.",
          te: "ఆ సభ్యుని పూర్తి వివరాలు, డైట్ చార్ట్, పేమెంట్ రసీదులు మరియు హాజరు చూసే పేజీకి తీసుకెళ్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "MPIN (Member PIN)", te: "సభ్యుని MPIN" },
        meaning: {
          en: "A 4 to 6 digit security numerical PIN given to the member to log into their mobile attendance portal.",
          te: "సభ్యుడు తన ఫోన్‌లో హాజరు వేసుకోవడానికి లాగిన్ అవ్వడానికి ఉపయోగించే 4-6 అంకెల సెక్యూరిటీ పిన్.",
        },
        example: { en: "1234 or 9845", te: "1234 లేదా 9845" },
      },
      {
        field: { en: "Payment Mode (Split)", te: "చెల్లింపు పద్ధతి (స్ప్లిట్)" },
        meaning: {
          en: "Allows splitting a single fee into multiple modes: e.g. ₹5,000 Cash + ₹5,000 UPI + ₹2,000 Card.",
          te: "సభ్యుడు కొంత నగదు (Cash), కొంత ఆన్‌లైన్ (UPI), కొంత కార్డ్ ద్వారా చెల్లిస్తే వాటిని వేర్వేరుగా విభజించి లెక్క కట్టవచ్చు.",
        },
        example: { en: "Cash: ₹3000, UPI: ₹2000", te: "నగదు: ₹3000, UPI: ₹2000" },
      },
    ],
    proTip: {
      en: "Always take a clear face photo without sunglasses or cap so automated attendance face recognition achieves 95%+ match scores.",
      te: "సభ్యుల ఫోటో తీసేటప్పుడు క్యాప్ లేదా కళ్లద్దాలు లేకుండా తీస్తే హాజరు సమయంలో ఫేస్ డిటెక్షన్ కచ్చితంగా పనిచేస్తుంది.",
    },
  },

  // 5. Client Details Page
  {
    id: "client-details",
    category: "members",
    route: "/clients/[id]",
    icon: Users,
    title: {
      en: "Client 360 Workspace (/clients/[id])",
      te: "సభ్యుని పూర్తి వివరాల పేజీ (/clients/[id])",
    },
    tagline: {
      en: "5-tab profile: Personal details, membership plans, payment installments, personal trainers & diet suggestions",
      te: "సభ్యుని 5 ప్రధాన విభాగాలు: ప్రొఫైల్, మెంబర్‌షిప్ ప్లాన్లు, ఫీజు వాయిదాలు, ట్రైనర్ అసైన్‌మెంట్ మరియు డైట్ చార్ట్",
    },
    purpose: {
      en: "The single source of truth for an individual gym member. Houses their full history of packages, milestone installment receipts, diet schedules, assigned personal trainers, and attendance records.",
      te: "ఒక నిర్దిష్ట సభ్యుడికి సంబంధించిన అన్ని రకాల సమాచారాన్ని (ప్లాన్లు, ఫీజు రసీదులు, ఆహార నియమాలు, పర్సనల్ ట్రైనర్) ఒకేచోట సమగ్రంగా నిర్వహించడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Header Bar: Member avatar, active package pill, ongoing vs expired status badge, and WhatsApp/Call quick buttons.",
        "Tab 1: Profile & Contact Details - Emergency phone, address, photo change, and MPIN reset.",
        "Tab 2: Payments & Assigned Plans - Assign new plans from dropdown, record partial installments, download PDF receipts.",
        "Tab 3: Personal Trainers - Assign fitness coaches and track training periods.",
        "Tab 4: Multi-Item Diet Charts - Build customized breakfast, lunch, snack, dinner meal plans with printable chart.",
        "Tab 5: Attendance Log - Full history of all check-in scans, verified times, and outlets.",
      ],
      te: [
        "హెడర్ విభాగం: సభ్యుని ఫోటో, ప్రస్తుత ప్లాన్ పేరు, కాలపరిమితి స్టేటస్, డైరెక్ట్ కాల్ & వాట్సాప్ బటన్లు.",
        "ట్యాబ్ 1 (ప్రొఫైల్): ఫోన్ నంబర్, చిరునామా, MPIN మార్పు మరియు ఫోటో అప్‌డేట్.",
        "ట్యాబ్ 2 (ప్లాన్లు & ఫీజులు): కొత్త ప్లాన్లను డ్రాప్‌డౌన్ నుండి ఎంచుకుని అసైన్ చేయడం, ఫీజు రసీదులు ఇవ్వడం.",
        "ట్యాబ్ 3 (పర్సనల్ ట్రైనర్స్): జిమ్ ట్రైనర్‌ను కేటాయించడం మరియు శిక్షణ లక్ష్యాలు నమోదు చేయడం.",
        "ట్యాబ్ 4 (డైట్ చార్ట్): ఉదయం నుండి రాత్రి వరకు తినాల్సిన ఆహార పదార్థాల పట్టిక తయారు చేసి ప్రింట్ ఇవ్వడం.",
        "ట్యాబ్ 5 (హాజరు వివరాలు): సభ్యుడు ఏ రోజు ఎన్ని గంటలకు జిమ్‌కి వచ్చాడో చూపే క్యాలెండర్ జాబితా.",
      ],
    },
    actions: [
      {
        name: { en: "Assign / Add Plan", te: "ప్లాన్ కేటాయించు (Add Plan)" },
        trigger: { en: "'Assign Plan to Client' Button in Tab 2", te: "ట్యాబ్ 2 లో 'Assign Plan' బటన్" },
        description: {
          en: "Select any gym plan from the new dropdown list. Automatically fills base price, duration in months, and computes the end date. Also allows custom adjustments.",
          te: "డ్రాప్‌డౌన్ నుండి ప్లాన్‌ను ఎంచుకోగానే ఫీజు, కాలపరిమితి మరియు ఎండ్ డేట్ ఆటోమేటిక్‌గా వస్తాయి. డిస్కౌంట్ ఇవ్వాలనుకుంటే నమోదు చేయవచ్చు.",
        },
      },
      {
        name: { en: "+ Add Installment", te: "+ ఫీజు వాయిదా రికార్డు" },
        trigger: { en: "'+ Add Installment' Button in Tab 2", te: "ట్యాబ్ 2 లో '+ Add Installment' బటన్" },
        description: {
          en: "Records a payment made by the client with mode (Cash, UPI, Card, Split) and issues an instant branded receipt.",
          te: "సభ్యుడు చెల్లించిన ఫీజు మొత్తాన్ని నగదు, గూగుల్ పే/ఫోన్‌పే లేదా కార్డ్ రూపంలో నమోదు చేసి రసీదు జనరేట్ చేస్తుంది.",
        },
      },
      {
        name: { en: "Build Diet Plan", te: "డైట్ ప్లాన్ తయారు చేయి" },
        trigger: { en: "'Add Meal Item' in Tab 4", te: "ట్యాబ్ 4 లో 'Add Meal Item' బటన్" },
        description: {
          en: "Add foods, quantities, proteins/calories, and timings across 5 daily slots and export as a clean PDF for the member.",
          te: "సభ్యుడికి అవసరమైన ఆహార పదార్థాలు, సమయాలు నమోదు చేసి అందమైన డైట్ చార్ట్‌ను ప్రింట్ చేసి ఇవ్వవచ్చు.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Base Price vs Net Amount", te: "బేస్ ప్రైస్ vs నెట్ అమౌంట్" },
        meaning: {
          en: "Base Price is the standard package fee. Net Amount is Base Price minus Discount. Net Amount is what the client actually owes.",
          te: "బేస్ ప్రైస్ అంటే అసలు ప్లాన్ ధర. నెట్ అమౌంట్ అంటే డిస్కౌంట్ తీసివేయగా సభ్యుడు చెల్లించాల్సిన అసలు ఫీజు.",
        },
        example: { en: "Base: ₹15,000, Disc: ₹2,000 -> Net: ₹13,000", te: "బేస్: ₹15,000, డిస్క్: ₹2,000 -> నెట్: ₹13,000" },
      },
      {
        field: { en: "Duration Months", te: "వ్యవధి (నెలలలో)" },
        meaning: {
          en: "Number of months the plan lasts. Used to automatically compute the Plan End Date from Start Date.",
          te: "ప్లాన్ ఎన్ని నెలలు చెల్లుబాటు అవుతుందో తెలుపుతుంది. స్టార్ట్ డేట్ ఆధారంగా ఎండ్ డేట్‌ను ఇది లెక్కిస్తుంది.",
        },
        example: { en: "6 Months", te: "6 నెలలు" },
      },
    ],
    proTip: {
      en: "When assigning a plan renewal, the system automatically sets the Start Date to the day after their previous plan expired to prevent missed days.",
      te: "పాత ప్లాన్ ముగియగానే కొత్త ప్లాన్ వేసినప్పుడు స్టార్ట్ డేట్ మునుపటి ప్లాన్ ముగిసిన తర్వాతి రోజు నుండి సెట్ చేయడం మంచిది.",
    },
  },

  // 6. Personal Trainers
  {
    id: "personal-trainers",
    category: "management",
    route: "/personal-trainers",
    icon: Dumbbell,
    title: {
      en: "Personal Trainers Directory",
      te: "పర్సనల్ ట్రైనర్స్ డైరెక్టరీ",
    },
    tagline: {
      en: "Manage fitness instructors, specializations, contact numbers & member caseloads",
      te: "జిమ్ ట్రైనర్ల వివరాలు, వారి నైపుణ్యాలు (స్పెషలైజేషన్స్) మరియు వారికి కేటాయించిన సభ్యులు",
    },
    purpose: {
      en: "Central directory of all personal trainers and fitness instructors working across gym branches. Enables linking trainers to specific member packages.",
      te: "జిమ్‌లో పనిచేస్తున్న ఫిట్‌నెస్ ట్రైనర్ల వివరాలను నమోదు చేయడానికి మరియు ఏ సభ్యుడికి ఏ ట్రైనర్ శిక్షణ ఇస్తున్నారో పర్యవేక్షించడానికి ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Trainers List: Name, phone, email, specialization (e.g. Bodybuilding, Weight Loss, CrossFit, Rehab), and assigned clients badge.",
        "Add Trainer Modal: Form to register coach details.",
        "Edit / Delete actions: Modify coach info or deactivate profile.",
      ],
      te: [
        "ట్రైనర్స్ జాబితా: పేరు, మొబైల్, ఈమెయిల్, స్పెషలైజేషన్ (వెయిట్ లాస్, బాడీబిల్డింగ్ మొదలైనవి) మరియు వారి కింద ఉన్న సభ్యుల సంఖ్య.",
        "కొత్త ట్రైనర్ నమోదు: కొత్త కోచ్ వివరాలను నమోదు చేసే ఫారమ్.",
        "సవరణ మరియు తొలగింపు: ట్రైనర్ వివరాలను మార్చడానికి లేదా తొలగించడానికి.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Personal Trainer", te: "+ కొత్త ట్రైనర్‌ను చేర్చు" },
        trigger: { en: "'+ Add Trainer' Button", te: "'+ Add Trainer' బటన్" },
        description: {
          en: "Register an instructor's profile so they appear in client assignment dropdowns.",
          te: "కొత్త ట్రైనర్‌ను నమోదు చేస్తే వారు క్లయింట్ పేజీలో అసైన్ చేయడానికి డ్రాప్‌డౌన్‌లో కనిపిస్తారు.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Specialization", te: "స్పెషలైజేషన్ (నైపుణ్యం)" },
        meaning: {
          en: "Primary fitness domain: e.g. Strength Training, Functional Fitness, Nutrition, or Rehabilitation.",
          te: "ట్రైనర్ ఏ రంగంలో నిపుణుడో తెలుపుతుంది (ఉదా: వెయిట్ లాస్, బాడీబిల్డింగ్, ఫిట్‌నెస్).",
        },
        example: { en: "CrossFit & Fat Loss Specialist", te: "క్రాస్‌ఫిట్ & వెయిట్ లాస్ స్పెషలిస్ట్" },
      },
    ],
    proTip: {
      en: "Check the assigned clients count to evenly distribute personal training workloads across your trainers.",
      te: "ట్రైనర్ల కింద ఎంతమంది సభ్యులు ఉన్నారో చూసి అందరికీ సమానంగా క్లయింట్లను కేటాయించవచ్చు.",
    },
  },

  // 7. Visitors & Inquiries
  {
    id: "visitors",
    category: "members",
    route: "/visitors",
    icon: UserPlus,
    title: {
      en: "Visitors & Walk-in Inquiries",
      te: "విజిటర్స్ & ఎంక్వైరీలు (లీడ్స్)",
    },
    tagline: {
      en: "Front-desk CRM to capture walk-in inquiries, track trial workouts & manage conversion follow-ups",
      te: "రిసెప్షన్ వద్దకు వచ్చే కొత్త వారి ఎంక్వైరీలు, ఫాలో-అప్ కాల్స్ మరియు మెంబర్‌షిప్ కన్వర్షన్స్",
    },
    purpose: {
      en: "Serves as the gym's sales CRM. Front-desk staff record every walk-in visitor, their fitness interests, budget, and follow-up date to maximize conversion from trial visitor to paying member.",
      te: "జిమ్ ఫ్రంట్ డెస్క్ వద్ద సమాచారం కోసం వచ్చే కొత్త వారి వివరాలను నమోదు చేసి, వారికి సరైన సమయానికి కాల్ చేసి మెంబర్‌షిప్ తీసుకునేలా ఫాలో-అప్ చేయడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Inquiries Table: Visitor name, mobile, visit date, plan interested in, follow-up date, status badge, and notes.",
        "Status Filters: All, New, Followed Up, Converted (Joined), Dropped.",
        "Quick WhatsApp & Call buttons: One-tap contact initiation directly from the table.",
      ],
      te: [
        "విజిటర్ల జాబితా: పేరు, మొబైల్, వచ్చిన తేదీ, ఆసక్తి చూపిన ప్లాన్, తర్వాతి కాల్ తేదీ, స్టేటస్.",
        "స్టేటస్ ఫిల్టర్లు: కొత్తవారు (New), మాట్లాడినవారు (Followed Up), జాయిన్ అయినవారు (Converted).",
        "వాట్సాప్ & కాల్ బటన్లు: నేరుగా ఇక్కడి నుంచే కస్టమర్‌కు మెసేజ్ లేదా కాల్ చేసే సదుపాయం.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Visitor", te: "+ కొత్త విజిటర్‌ని చేర్చు" },
        trigger: { en: "'+ Add Visitor' Button", te: "'+ Add Visitor' బటన్" },
        description: {
          en: "Log a walk-in inquiry with mobile, branch, plan discussed, and set the next follow-up date.",
          te: "కొత్తగా విచారించడానికి వచ్చిన వారి వివరాలు, ఫోన్ నంబర్ మరియు వారు అడిగిన ప్లాన్ వివరాలను నమోదు చేయండి.",
        },
      },
      {
        name: { en: "Convert to Client", te: "సభ్యుడిగా మార్చు (Convert)" },
        trigger: { en: "Status Dropdown -> 'Converted'", te: "స్టేటస్‌లో 'Converted' ఎంచుకోవడం" },
        description: {
          en: "Marks the visitor as successfully converted into a paying gym member.",
          te: "విజిటర్ ఫీజు చెల్లించి జిమ్‌లో చేరినప్పుడు ఈ స్టేటస్‌ను 'Converted' గా మార్చండి.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Follow-up Date", te: "ఫాలో-అప్ తేదీ" },
        meaning: {
          en: "The target calendar date when the receptionist should call the prospective client to offer a trial workout or discount.",
          te: "కస్టమర్‌కు తిరిగి కాల్ చేసి మాట్లాడాల్సిన తేదీ.",
        },
        example: { en: "Tomorrow / 2 days later", te: "రేపు లేదా 2 రోజుల తర్వాత" },
      },
    ],
    proTip: {
      en: "Call visitors within 24 to 48 hours of their first visit — studies show inquiries followed up in 48 hours convert 3x higher.",
      te: "జిమ్‌కి వచ్చి విచారించిన 24 నుండి 48 గంటల్లోపు వారికి కాల్ చేసి మాట్లాడితే వారు జిమ్‌లో చేరే అవకాశం 3 రెట్లు ఎక్కువగా ఉంటుంది.",
    },
  },

  // 8. Client Attendance
  {
    id: "client-attendance",
    category: "attendance",
    route: "/client-attendance",
    icon: CalendarCheck,
    title: {
      en: "Client Attendance & Security Logs",
      te: "క్లయింట్ హాజరు & సెక్యూరిటీ లాగ్స్",
    },
    tagline: {
      en: "Daily check-in logs, multiple scan tracking, GPS geofencing & optional face verification",
      te: "రోజువారీ హాజరు పర్యవేక్షణ, బహుళ స్కాన్ల సమయాలు, GPS లొకేషన్ వెరిఫికేషన్ మరియు ఫేస్ రికగ్నిషన్",
    },
    purpose: {
      en: "The gym's live attendance monitoring hub. Displays real-time check-ins from member QR scans, counts how many times members scanned today with exact timestamps, allows manual admin check-ins, and enforces geofenced radius verification.",
      te: "సభ్యులు జిమ్‌కి వచ్చే రోజువారీ హాజరును లైవ్‌గా ట్రాక్ చేయడానికి ఇది ప్రధాన పేజీ. సభ్యుడు రోజులో ఎన్నిసార్లు స్కాన్ చేశాడు, ఏ సమయాల్లో స్కాన్ చేశాడు అనే పూర్తి వివరాలు ఇక్కడ కనిపిస్తాయి.",
    },
    overview: {
      en: [
        "Date Navigator: Switch between today, yesterday, or any past calendar date.",
        "Status Tabs: All Members, Present Today, Currently In Gym, Unmarked.",
        "Attendance Columns: Member, Date, In Time, Out Time, Total Scans & Timestamps, Security verification badges (GPS Distance, Face score).",
        "Multiple Scans Timeline: Shows all scan timestamps (e.g. #1: 08:30 AM, #2: 01:15 PM) with clickable 'View All' modal.",
        "Camera Viewfinder: Defaults to Back Camera with smooth, fast toggle to front camera.",
      ],
      te: [
        "తేదీ ఎంపిక: ఈ రోజు, నిన్నటి లేదా మునుపటి ఏ తేదీ హాజరునైనా చూసే క్యాలెండర్ బటన్లు.",
        "స్టేటస్ ట్యాబ్‌లు: అందరు సభ్యులు, నేడు హాజరైనవారు, ప్రస్తుతం జిమ్ లోపల ఉన్నవారు, రానివారు.",
        "హాజరు వివరాల పట్టిక: ఇన్ టైమ్, అవుట్ టైమ్, మొత్తం స్కాన్లు మరియు అన్ని సమయాలు, GPS దూరం (మీటర్లలో).",
        "మల్టిపుల్ స్కాన్స్ టైమ్‌లైన్: సభ్యుడు ఎన్నిసార్లు స్కాన్ చేస్తే ఆ సమయాలన్నీ (#1: 08:30 AM, #2: 01:15 PM) స్పష్టంగా కనిపిస్తాయి.",
        "కెమెరా వ్యూఫైండర్: డిఫాల్ట్‌గా బ్యాక్ కెమెరాతో మొదలై, సులువుగా ఫ్రంట్ కెమెరాకు మారే స్మూత్ టోగుల్ బటన్.",
      ],
    },
    actions: [
      {
        name: { en: "+ Mark IN / + OUT", te: "+ Mark IN / + OUT" },
        trigger: { en: "Action Buttons in Table / Card", te: "పట్టికలోని బటన్లు" },
        description: {
          en: "Manually triggers check-in/out verification for a member with 30m geofence validation and optional face verification.",
          te: "సభ్యుడికి మాన్యువల్‌గా హాజరు వేయడానికి లేదా అవుట్ చేయడానికి ఉపయోగిస్తారు (GPS దూరం చెక్ చేస్తుంది).",
        },
      },
      {
        name: { en: "Quick Mark OUT", te: "త్వరిత మార్క్ అవుట్" },
        trigger: { en: "'Quick Mark OUT' Button", te: "'Quick Mark OUT' బటన్" },
        description: {
          en: "One-click action to record the current clock time as check-out time and append it to the member's scan history.",
          te: "ఒక్క క్లిక్‌తో ప్రస్తుత సమయాన్ని అవుట్ టైమ్‌గా నమోదు చేసి స్కాన్ రికార్డుకు జతచేస్తుంది.",
        },
      },
      {
        name: { en: "View All Scans Modal", te: "అన్ని స్కాన్ సమయాలు చూడు" },
        trigger: { en: "'View all (X)' Link in Scans Column", te: "'View all' లింక్" },
        description: {
          en: "Opens a full chronological popup window detailing every single scan logged for that member today with station names and timestamps.",
          te: "ఈ రోజు ఆ సభ్యుడు స్కాన్ చేసిన ప్రతి సమయాన్ని, బ్రాంచ్ పేరుతో సహా పాప్-అప్ విండోలో సమగ్రంగా చూపిస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Total Scans & Timestamps", te: "మొత్తం స్కాన్లు & సమయాలు" },
        meaning: {
          en: "Shows the exact number of times the member scanned the QR code today and lists each scan time chronologically.",
          te: "సభ్యుడు నేడు ఎన్నిసార్లు QR కోడ్ స్కాన్ చేశాడో ఆ సంఖ్యను మరియు ప్రతి స్కాన్ సమయాన్ని వరుసగా చూపిస్తుంది.",
        },
        example: { en: "🎯 3 Scans (#1: 06:15 AM, #2: 05:30 PM)", te: "🎯 3 స్కాన్లు (#1: 06:15 AM, #2: 05:30 PM)" },
      },
      {
        field: { en: "GPS Distance (e.g. 12m)", te: "GPS దూరం (ఉదా: 12 మీటర్లు)" },
        meaning: {
          en: "Calculated distance between member device and the gym branch coordinates. Must be under 30 meters for valid presence.",
          te: "జిమ్ ఉన్న లొకేషన్‌కి మరియు సభ్యుడు ఉన్న చోటుకి మధ్య దూరం (30 మీటర్ల లోపల ఉంటేనే హాజరు ఆమోదించబడుతుంది).",
        },
      },
      {
        field: { en: "Face Match Score (e.g. 94%)", te: "ఫేస్ మ్యాచ్ స్కోరు (ఉదా: 94%)" },
        meaning: {
          en: "AI visual comparison percentage between live camera snap and registered profile photo (Minimum 85% required).",
          te: "రిజిస్టర్ చేసుకున్న ఫోటోతో లైవ్ కెమెరా ఫోటో ఎంత శాతం సరిపోలిందో చూపే స్కోరు (కనీసం 85% రావాలి).",
        },
      },
    ],
    proTip: {
      en: "If a member forgets their phone, the receptionist can simply click '+ Mark IN' to verify and record their presence manually.",
      te: "సభ్యుడు మొబైల్ తీసుకురావడం మరచిపోతే, రిసెప్షనిస్ట్ నేరుగా '+ Mark IN' బటన్ నొక్కి వారి హాజరును నమోదు చేయవచ్చు.",
    },
  },

  // 9. Membership Plans
  {
    id: "plans",
    category: "management",
    route: "/plans",
    icon: Layers,
    title: {
      en: "Membership Plans & Packages",
      te: "మెంబర్‌షిప్ ప్లాన్లు & ప్యాకేజీలు",
    },
    tagline: {
      en: "Configure gym subscription packages, pricing, durations & outlet-specific offerings",
      te: "జిమ్ ఫీజు ప్లాన్లు, కాలపరిమితి (1 నెల, 3 నెలలు, 6 నెలలు, 1 సంవత్సరం) మరియు ధరల నిర్వహణ",
    },
    purpose: {
      en: "Used to create and manage the gym's official membership offerings. Any plan created here immediately appears in client registration and assignment dropdowns.",
      te: "జిమ్‌లో ఆఫర్ చేసే ప్యాకేజీలు (మంత్లీ, క్వార్టర్లీ, హాఫ్-ఇయర్లీ, యాన్యువల్) మరియు వాటి ధరలను ఇక్కడ సెట్ చేస్తారు. ఇక్కడ క్రియేట్ చేసిన ప్లాన్లు క్లయింట్ పేజీలలోని డ్రాప్‌డౌన్లలో కనిపిస్తాయి.",
    },
    overview: {
      en: [
        "Plan Cards Grid: Card view showing plan name, fee (₹), duration, branch assignment, and feature list.",
        "Add / Edit Plan Modal: Define plan title, price, duration (months), and branch restriction.",
        "Outlet Specific Filter: Associate plans to all branches or specific outlets only.",
      ],
      te: [
        "ప్లాన్ల కార్డ్స్: ప్లాన్ పేరు, ఫీజు మొత్తం (₹), కాలపరిమితి, వర్తించే బ్రాంచ్‌ల వివరాలు.",
        "కొత్త ప్లాన్ తయారీ: ప్లాన్ పేరు, ధర, ఎన్ని నెలల వ్యవధి మరియు వర్తించే బ్రాంచ్ ఎంపిక.",
        "బ్రాంచ్ ఫిల్టర్: అన్ని బ్రాంచ్‌లకు లేదా ఏదైనా ఒక బ్రాంచ్‌కు మాత్రమే ఈ ప్లాన్ వర్తించేలా చేయవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add New Plan", te: "+ కొత్త ప్లాన్ తయారు చేయి" },
        trigger: { en: "'+ Add Plan' Button", te: "'+ Add Plan' బటన్" },
        description: {
          en: "Create a new subscription tier with custom price and duration in months.",
          te: "కొత్త ధర మరియు నెలల వ్యవధితో కొత్త మెంబర్‌షిప్ ప్లాన్‌ను రూపొందించండి.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Amount (₹)", te: "ప్లాన్ ధర (₹)" },
        meaning: {
          en: "Standard base price for the membership package before any individual client discounts.",
          te: "డిస్కౌంట్‌లకు ముందు ఆ ప్యాకేజీ యొక్క అధికారిక పూర్తి ఫీజు ధర.",
        },
        example: { en: "₹12,000", te: "₹12,000" },
      },
      {
        field: { en: "Duration (Months / Year)", te: "కాలపరిమితి (నెలలు / సంవత్సరం)" },
        meaning: {
          en: "Duration string (e.g. '6 Months' or '1 Year') used by the system to compute the expiration date.",
          te: "ప్లాన్ ఎన్ని నెలలు చెల్లుతుందో తెలిపే వ్యవధి (ఆటోమేటిక్ ఎండ్ డేట్ కోసం ఉపయోగపడుతుంది).",
        },
        example: { en: "6 Months", te: "6 నెలలు" },
      },
    ],
    proTip: {
      en: "Name plans clearly with duration (e.g. '6 Months Gold Transformation') so receptionists and clients immediately recognize the package.",
      te: "ప్లాన్ పేరులో వ్యవధిని స్పష్టంగా పేర్కొనడం (ఉదా: '6 Months Gold Transformation') వల్ల సభ్యులకు సులువుగా అర్థమవుతుంది.",
    },
  },

  // 10. Store Products & Inventory
  {
    id: "products",
    category: "management",
    route: "/products",
    icon: Package,
    title: {
      en: "Store Products & Inventory (POS)",
      te: "స్టోర్ ప్రొడక్ట్స్ & ఇన్వెంటరీ (POS)",
    },
    tagline: {
      en: "Track gym retail items: whey protein, supplements, gym apparel, shakers & accessories",
      te: "జిమ్‌లో అమ్మే సప్లిమెంట్లు, ప్రొటీన్ పౌడర్లు, షేకర్లు మరియు జిమ్ వస్తువుల స్టాక్ నిర్వహణ",
    },
    purpose: {
      en: "Point-of-sale inventory tracker for retail products sold at gym reception counters (whey protein, creatine, pre-workout, straps, branded T-shirts).",
      te: "జిమ్ రిసెప్షన్ కౌంటర్ వద్ద విక్రయించే ప్రొటీన్ పౌడర్లు, సప్లిమెంట్లు, టీ-షర్టులు, షేకర్ల స్టాక్ మరియు అమ్మకాలను ట్రాక్ చేయడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Product Catalog: Product image, name, category, selling price, cost price, stock quantity on hand.",
        "Stock Alerts: Visual badge when product quantity drops below minimum threshold.",
        "Add / Edit Product Modal: Set selling price, purchase cost, and track stock counts.",
      ],
      te: [
        "ఉత్పత్తుల జాబితా: ఫోటో, పేరు, కేటగిరీ, అమ్మే ధర, కొనుగోలు ధర మరియు చేతిలో ఉన్న స్టాక్ నిల్వ.",
        "తక్కువ స్టాక్ అలర్ట్: వస్తువుల నిల్వ తగ్గిపోయినప్పుడు హెచ్చరించే బ్యాడ్జ్.",
        "కొత్త ఉత్పత్తి నమోదు: ధర మరియు ప్రారంభ స్టాక్ సంఖ్యను నమోదు చేసే ఫారమ్.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Product", te: "+ కొత్త ప్రొడక్ట్ చేర్చు" },
        trigger: { en: "'+ Add Product' Button", te: "'+ Add Product' బటన్" },
        description: {
          en: "Register new retail merchandise with selling price, unit cost, and stock quantity.",
          te: "అమ్మకానికి సిద్ధంగా ఉన్న కొత్త వస్తువును ధర మరియు స్టాక్ సంఖ్యతో నమోదు చేయండి.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Selling Price vs Cost Price", te: "అమ్మే ధర vs కొనుగోలు ధర" },
        meaning: {
          en: "Selling price is what member pays; cost price is what the gym purchased it for (helps track retail profit margin).",
          te: "సెల్లింగ్ ప్రైస్ అంటే కస్టమర్ చెల్లించే ధర; కాస్ట్ ప్రైస్ అంటే జిమ్ కొనుగోలు చేసిన అసలు ఖర్చు.",
        },
      },
      {
        field: { en: "Stock Quantity", te: "స్టాక్ నిల్వ సంఖ్య" },
        meaning: {
          en: "Number of units currently available in the gym display rack.",
          te: "ప్రస్తుతం జిమ్ అల్మారాలో అమ్మకానికి మిగిలి ఉన్న డబ్బాలు లేదా వస్తువుల సంఖ్య.",
        },
      },
    ],
    proTip: {
      en: "Keep stock counts updated weekly to prevent stockouts of popular post-workout protein shakes.",
      te: "ప్రతి వారం ఒకసారి స్టాక్ నిల్వలను సరిచూసుకోవడం వల్ల ఎక్కువ అమ్ముడయ్యే సప్లిమెంట్లు అయిపోకుండా ముందే తెప్పించవచ్చు.",
    },
  },

  // 11. Employees
  {
    id: "employees",
    category: "staff_payroll",
    route: "/employees",
    icon: UserCheck,
    title: {
      en: "Employees Directory (HR)",
      te: "ఉద్యోగుల జాబితా (HR & సిబ్బంది)",
    },
    tagline: {
      en: "Workforce directory: trainers, maintenance, receptionists, base salaries & ID documents",
      te: "జిమ్ సిబ్బంది వివరాలు: ట్రైనర్లు, క్లీనర్లు, రిసెప్షనిస్టులు, బేస్ జీతాలు మరియు గుర్తింపు కార్డులు",
    },
    purpose: {
      en: "Manages all paid employees of the gym enterprise. Sets up their designation, branch, joining date, contact details, ID proof documents, and agreed monthly base salary for payroll calculation.",
      te: "జిమ్‌లో పనిచేసే ఉద్యోగులందరి (ట్రైనర్లు, రిసెప్షన్, హౌస్ కీపింగ్) వివరాలు, జాయినింగ్ తేదీ, ఫోటో మరియు నెలకు ఇచ్చే బేస్ శాలరీ వివరాలను భద్రపరచడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Employee Directory: Card/table with photo, name, role/designation, branch, phone, and base salary.",
        "Add Employee Modal: Integrated with camera photo capture (defaults to Back camera) and Aadhaar/document uploads.",
        "Employee Profile Page (/employees/[id]): View employment history, salary history, and personal details.",
      ],
      te: [
        "ఉద్యోగుల జాబితా: ఫోటో, పేరు, హోదా (Role), బ్రాంచ్, ఫోన్ నంబర్ మరియు నెల జీతం వివరాలు.",
        "ఉద్యోగి నమోదు ఫారమ్: లైవ్ కెమెరా ఫోటో క్యాప్చర్ (బ్యాక్ కెమెరా సపోర్ట్) మరియు ఆధార్ వివరాలతో కూడిన ఫారమ్.",
        "ఉద్యోగి పూర్తి ప్రొఫైల్: వ్యక్తిగత వివరాలు మరియు గతంలో చెల్లించిన జీతాల చరిత్ర.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Employee", te: "+ కొత్త ఉద్యోగిని చేర్చు" },
        trigger: { en: "'+ Add Employee' Button", te: "'+ Add Employee' బటన్" },
        description: {
          en: "Create an employee record with monthly salary amount, role, and branch assignment.",
          te: "హోదా, కేటాయించిన బ్రాంచ్ మరియు నెలవారీ ఫిక్స్‌డ్ శాలరీతో కొత్త ఉద్యోగిని నమోదు చేయండి.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Base Monthly Salary (₹)", te: "నెలవారీ మూల వేతనం (Base Salary)" },
        meaning: {
          en: "Agreed monthly compensation. The payroll module uses this value to calculate prorated pay based on working days.",
          te: "ఉద్యోగికి నెలకు ఇచ్చే నిర్ణీత మూల వేతనం. పేరోల్ మాడ్యూల్ ఈ మొత్తం ఆధారంగా హాజరు ప్రకారం జీతాన్ని లెక్కిస్తుంది.",
        },
        example: { en: "₹25,000 / month", te: "₹25,000 / నెలకు" },
      },
    ],
    proTip: {
      en: "Capture both phone and emergency contact numbers during employee onboarding for urgent communications.",
      te: "ఉద్యోగులను చేర్చుకునేటప్పుడు వారి సొంత ఫోన్ నంబర్‌తో పాటు కుటుంబ సభ్యుల అత్యవసర నంబర్‌ను కూడా నమోదు చేసుకోండి.",
    },
  },

  // 12. Staff Permissions
  {
    id: "staff",
    category: "staff_payroll",
    route: "/staff",
    icon: UserCog,
    title: {
      en: "Portal Staff & Role-Based Access (RBAC)",
      te: "పోర్టల్ సిబ్బంది & అనుమతులు (Staff Permissions)",
    },
    tagline: {
      en: "Create staff logins and assign granular view/edit permissions for each software module",
      te: "సాఫ్ట్‌వేర్ ఆపరేట్ చేసే సిబ్బందికి యూజర్‌నేమ్, పాస్‌వర్డ్ మరియు పేజీల అనుమతుల కేటాయింపు",
    },
    purpose: {
      en: "Allows gym owners to delegate software operations safely without sharing the master admin password. Create logins for receptionists or accountants and restrict access (e.g. can view clients but cannot delete or see payroll).",
      te: "జిమ్ మెయిన్ అడ్మిన్ పాస్‌వర్డ్ ఇవ్వకుండానే రిసెప్షనిస్ట్ లేదా అకౌంటెంట్‌కి ప్రత్యేక లాగిన్ ఇచ్చి, వారు ఏ పేజీలు చూడవచ్చు, ఏవి మార్చవచ్చో నియంత్రించడానికి (Permissions) ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Staff Accounts List: Name, username, assigned branch, and active permission chips.",
        "Add Staff Modal: Create username, password, select branch, and toggle permissions.",
        "Granular Permissions Matrix: Control access for Clients, Attendance, Plans, Payroll, Settings (No Access / View Only / Edit Access).",
      ],
      te: [
        "సిబ్బంది ఖాతాల జాబితా: పేరు, యూజర్‌నేమ్, బ్రాంచ్ మరియు అనుమతించబడిన పేజీల వివరాలు.",
        "కొత్త సిబ్బంది లాగిన్: యూజర్‌నేమ్, పాస్‌వర్డ్ సెట్ చేసి పర్మిషన్స్ ఎంచుకునే ఫారమ్.",
        "పర్మిషన్స్ మ్యాట్రిక్స్: ప్రతి పేజీకి సంబంధించి 'నో యాక్సెస్', 'చూసే అనుమతి (View)', 'మార్చే అనుమతి (Edit)' ఎంచుకోవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "Assign Page Permissions", te: "పేజీ అనుమతులు కేటాయించు" },
        trigger: { en: "Permission Checkboxes in Staff Modal", te: "పర్మిషన్ చెక్‌బాక్స్‌లు" },
        description: {
          en: "Tick 'View' or 'Edit' next to each page module. Unchecked pages will be completely hidden from that staff member.",
          te: "ఏ పేజీలు కనిపించాలో వాటికి 'View' లేదా 'Edit' టిక్ చేయండి. టిక్ చేయని పేజీలు వారికి కనిపించవు.",
        },
      },
    ],
    fields: [
      {
        field: { en: "View Only vs Edit Access", te: "చూసే అనుమతి vs మార్చే అనుమతి" },
        meaning: {
          en: "'View Only' allows seeing records without edit/delete buttons. 'Edit' grants full modification rights.",
          te: "'View Only' ఇస్తే డేటా చూడటానికి మాత్రమే వీలుంటుంది. 'Edit' ఇస్తే కొత్తవి జోడించడం లేదా మార్చే అధికారం ఉంటుంది.",
        },
      },
    ],
    proTip: {
      en: "Give reception staff 'Edit' access to Clients and Attendance, but restrict 'Payroll' and 'Settings' to owner accounts only.",
      te: "ఫ్రంట్ డెస్క్ సిబ్బందికి 'Clients' మరియు 'Attendance' పేజీల అనుమతి ఇచ్చి, 'Payroll' మరియు 'Settings' అడ్మిన్‌కి మాత్రమే ఉంచుకోవడం సురక్షితం.",
    },
  },

  // 13. Payroll
  {
    id: "payroll",
    category: "staff_payroll",
    route: "/payroll",
    icon: BadgeIndianRupee,
    title: {
      en: "Payroll & Salary Management",
      te: "జీతాల నిర్వహణ & పేరోల్ (Payroll)",
    },
    tagline: {
      en: "Monthly salary calculation based on working days, deductions, bonuses & payslip recording",
      te: "హాజరైన రోజులు, డిడక్షన్లు మరియు బోనస్‌ల ఆధారంగా నెలవారీ జీతాల లెక్కింపు",
    },
    purpose: {
      en: "Automates the end-of-month salary calculation for all gym staff. Computes payable salaries, factors in leaves or deductions, adds performance bonuses, and marks payout records with payment modes.",
      te: "నెలాఖరులో ఉద్యోగులందరికీ జీతాలను లెక్కించడానికి ఉపయోగపడుతుంది. వారు పనిచేసిన రోజులు, సెలవులు, అడ్వాన్సులు మరియు బోనస్‌లను పరిగణనలోకి తీసుకుని అసలు ఇవ్వాల్సిన నికర జీతాన్ని లెక్కిస్తుంది.",
    },
    overview: {
      en: [
        "Month & Year Selector: Generate or review payroll for any specific month.",
        "Payroll Summary Bar: Total payout budget, total staff paid, and pending payouts.",
        "Staff Payroll Table: Employee name, role, base salary, working days, deductions, bonuses, net pay, and payment status.",
        "Record Payment Modal: Mark salary as paid via Bank Transfer, Cash, or UPI with date stamp.",
      ],
      te: [
        "నెల మరియు సంవత్సరం ఎంపిక: ఏ నెలకు సంబంధించిన జీతాల వివరాలైనా ఎంచుకోవచ్చు.",
        "పేరోల్ సమ్మరీ: మొత్తం చెల్లించాల్సిన జీతాల బడ్జెట్, చెల్లించినవి మరియు పెండింగ్ ఉన్నవి.",
        "శాలరీ పట్టిక: ఉద్యోగి పేరు, బేస్ జీతం, పనిచేసిన రోజులు, కటింగ్‌లు, బోనస్, నికర జీతం మరియు స్టేటస్.",
        "పేమెంట్ రికార్డ్: బ్యాంక్ బదిలీ, నగదు లేదా UPI ద్వారా జీతం చెల్లించినట్లు మార్క్ చేసే ఫారమ్.",
      ],
    },
    actions: [
      {
        name: { en: "Generate Monthly Payroll", te: "నెల జీతాలను లెక్కించు" },
        trigger: { en: "'Generate Payroll' Button", te: "'Generate Payroll' బటన్" },
        description: {
          en: "Pulls all active employees and computes their prorated monthly compensation automatically.",
          te: "యాక్టివ్ ఉద్యోగులందరినీ ఒకేసారి తెచ్చి వారి నెల జీతాలను ఆటోమేటిక్‌గా లెక్కిస్తుంది.",
        },
      },
      {
        name: { en: "Mark Salary as Paid", te: "జీతం చెల్లించినట్లు మార్క్ చేయి" },
        trigger: { en: "'Pay Salary' Button in Table", te: "'Pay Salary' బటన్" },
        description: {
          en: "Records salary payment date, payment reference, and changes status from Unpaid to Paid.",
          te: "జీతం ఇచ్చిన తేదీ, పేమెంట్ విధానం నమోదు చేసి స్టేటస్‌ను 'Paid' గా మారుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Net Payable Salary", te: "నికర జీతం (Net Salary)" },
        meaning: {
          en: "Formula: Base Salary - Deductions (unpaid leaves/advances) + Bonuses/Incentives.",
          te: "లెక్కింపు విధానం: బేస్ జీతం - కటింగ్‌లు (సెలవులు/అడ్వాన్సులు) + బోనస్‌లు/ఇన్సెంటివ్‌లు.",
        },
      },
    ],
    proTip: {
      en: "Enter deductions or salary advances as soon as they are given during the month so final payout figures are 100% accurate.",
      te: "నెల మధ్యలో ఉద్యోగులు అడ్వాన్స్ తీసుకుంటే వెంటనే డిడక్షన్లలో నమోదు చేసుకుంటే నెలాఖరులో గందరగోళం ఉండదు.",
    },
  },

  // 14. Support & Contact
  {
    id: "support",
    category: "system",
    route: "/support",
    icon: HelpCircle,
    title: {
      en: "Technical Support & Helpdesk",
      te: "సాంకేతిక సహాయం & సపోర్ట్ (Helpdesk)",
    },
    tagline: {
      en: "Direct WhatsApp and phone assistance from GamaNext software engineering team",
      te: "సాఫ్ట్‌వేర్ డెవలప్‌మెంట్ బృందం నుండి నేరుగా వాట్సాప్ మరియు ఫోన్ ద్వారా సాంకేతిక సహాయం",
    },
    purpose: {
      en: "Connects gym management directly with the software engineering team for urgent bug fixes, feature requests, database backups, or hardware/camera troubleshooting.",
      te: "సాఫ్ట్‌వేర్‌లో ఏవైనా సమస్యలు వచ్చినా, కొత్త ఫీచర్లు కావాలన్నా లేదా కెమెరా/QR కోడ్ సమస్యలు ఎదురైనా ఇంజనీరింగ్ టీమ్‌ని సంప్రదించడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Support Hotline Numbers: Direct phone and WhatsApp quick buttons for developer team.",
        "System Status & License: Software version, active license validity, and database connectivity checks.",
      ],
      te: [
        "సపోర్ట్ హెల్ప్‌లైన్: డెవలపర్ టీమ్‌తో నేరుగా మాట్లాడటానికి ఫోన్ మరియు వాట్సాప్ బటన్లు.",
        "సిస్టమ్ స్టేటస్: సాఫ్ట్‌వేర్ వెర్షన్ మరియు డేటాబేస్ కనెక్టివిటీ సమాచారం.",
      ],
    },
    actions: [],
    fields: [],
    proTip: {
      en: "Save the developer WhatsApp contact on your mobile for immediate response during peak gym opening hours.",
      te: "డెవలపర్ వాట్సాప్ నంబర్‌ను మీ మొబైల్‌లో సేవ్ చేసుకుంటే అత్యవసర సమయాల్లో వేగంగా స్పందన లభిస్తుంది.",
    },
  },

  // 15. Settings
  {
    id: "settings",
    category: "system",
    route: "/settings",
    icon: Settings,
    title: {
      en: "System Settings & Gym Profile",
      te: "సిస్టమ్ సెట్టింగ్స్ & జిమ్ వివరాలు",
    },
    tagline: {
      en: "Configure gym branding, legal business name, invoice prefixes, logo & master passwords",
      te: "జిమ్ పేరు, లోగో అప్‌లోడ్, బిల్లుల ప్రిఫిక్స్ మరియు అడ్మిన్ పాస్‌వర్డ్ నిర్వహణ",
    },
    purpose: {
      en: "Master configuration hub to set the gym's trading name, address, GSTIN, receipt invoice number prefixes, logo graphic, and update owner login credentials.",
      te: "జిమ్ అధికారిక పేరు, అడ్రస్, రసీదులపై ప్రింట్ అయ్యే లోగో, బిల్లు నంబర్లు మరియు అడ్మిన్ పాస్‌వర్డ్‌ను మార్చుకోవడానికి ఈ పేజీ ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Business Profile Form: Gym brand name, tagline, official contact email, and support mobile.",
        "Logo Graphic Uploader: Upload PNG or SVG logo for member receipts and posters.",
        "Security & Password Panel: Change master admin email and login password.",
      ],
      te: [
        "వ్యాపార ప్రొఫైల్ ఫారమ్: జిమ్ బ్రాండ్ పేరు, అధికారిక ఈమెయిల్ మరియు ఫోన్ నంబర్.",
        "లోగో అప్‌లోడ్: సభ్యుల రసీదులపై మరియు QR బోర్డులపై కనిపించే జిమ్ లోగో.",
        "పాస్‌వర్డ్ సెక్యూరిటీ: అడ్మిన్ లాగిన్ పాస్‌వర్డ్‌ను భద్రంగా మార్చుకునే విభాగం.",
      ],
    },
    actions: [],
    fields: [
      {
        field: { en: "Invoice Prefix", te: "ఇన్‌వాయిస్ ప్రిఫిక్స్" },
        meaning: {
          en: "Letters prepended to receipt numbers: e.g. 'BF-' turns receipt #101 into 'BF-101'.",
          te: "బిల్లు నంబర్ ముందు వచ్చే అక్షరాలు (ఉదా: 'BF-' అని ఇస్తే రసీదు నంబర్ 'BF-101' గా వస్తుంది).",
        },
      },
    ],
    proTip: {
      en: "Use a transparent PNG logo with high contrast for the cleanest receipt and standee prints.",
      te: "స్పష్టమైన ట్రాన్స్‌పరెంట్ PNG లోగోను అప్‌లోడ్ చేస్తే రసీదులపై ప్రింటింగ్ చాలా అందంగా వస్తుంది.",
    },
  },

  // 16. Member Client Web App Guide
  {
    id: "client-app",
    category: "system",
    route: "/scan (Member Portal)",
    icon: Smartphone,
    title: {
      en: "Member Client Portal Guide (brotherfitness-gym-software-client)",
      te: "సభ్యుల మొబైల్ పోర్టల్ గైడ్ (క్లయింట్ యాప్)",
    },
    tagline: {
      en: "How members log in, scan attendance QR, view multi-scan history & check subscription days",
      te: "సభ్యులు తమ ఫోన్‌లో లాగిన్ అవ్వడం, QR స్కాన్ చేసి హాజరు వేయడం మరియు ప్లాన్ రోజులు చూసుకోవడం",
    },
    purpose: {
      en: "A guide for gym owners to train members on how to use their self-service mobile app for instant QR check-in, tracking attendance history, and checking membership renewal countdowns.",
      te: "సభ్యులు తమ మొబైల్ ద్వారా జిమ్‌లోకి రాగానే ఎలా స్కాన్ చేయాలి, వారి హాజరు చరిత్ర మరియు ప్లాన్ ఎన్ని రోజులు మిగిలి ఉందో ఎలా చూసుకోవాలో వివరించే గైడ్.",
    },
    overview: {
      en: [
        "Member Login: Quick login using 10-digit registered mobile number + assigned 4-digit MPIN.",
        "QR Scanner (/scan): Camera defaults to Back camera with smooth Front/Back toggle. Scans the outlet QR code instantly.",
        "Instant Celebration Popup: Confirms check-in and lists ALL today's scans with exact times and outlet name.",
        "Attendance Calendar (/attendance): Monthly calendar view showing green present dots, absent days, and full scan history.",
        "My Plan Screen (/plan): Active plan name, start date, expiry date, and days remaining countdown bar.",
        "Profile & MPIN Change (/profile): Update emergency contact and reset personal MPIN.",
      ],
      te: [
        "సభ్యుల లాగిన్: రిజిస్టర్ చేసుకున్న 10 అంకెల మొబైల్ నంబర్ మరియు 4 అంకెల MPIN తో వెంటనే లాగిన్ అవ్వవచ్చు.",
        "QR స్కానర్ (/scan): డిఫాల్ట్‌గా బ్యాక్ కెమెరాతో ఓపెన్ అవుతుంది. ఫ్రంట్/బ్యాక్ కెమెరా స్విచ్ అందుబాటులో ఉంటుంది. QR కోడ్‌ను స్కాన్ చేయగానే హాజరు నమోదవుతుంది.",
        "సక్సెస్ పాప్-అప్: స్కాన్ అవ్వగానే 'Attendance Recorded!' అంటూ ఈ రోజు ఎన్నిసార్లు స్కాన్ చేశారో ఆ సమయాలన్నీ చూపిస్తుంది.",
        "హాజరు క్యాలెండర్ (/attendance): నెలలో ఎన్ని రోజులు వచ్చారో ఆకుపచ్చ రంగులో మరియు ప్రతి రోజు స్కాన్ చేసిన సమయాలను చూపే క్యాలెండర్.",
        "నా ప్లాన్ వివరాలు (/plan): ప్రస్తుత ప్లాన్ పేరు, ముగిసే తేదీ మరియు ఇంకా ఎన్ని రోజులు మిగిలి ఉన్నాయో చూపే బార్.",
        "ప్రొఫైల్ & MPIN మార్పు (/profile): సభ్యుడు తన ఫోటో మరియు సెక్యూరిటీ MPIN మార్చుకోవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "Scan Gym Station QR", te: "జిమ్ QR కోడ్ స్కాన్ చేయి" },
        trigger: { en: "Open /scan on Member Mobile", te: "మొబైల్‌లో /scan పేజీ తెరవడం" },
        description: {
          en: "Points camera at the printed outlet QR. Plays chime, logs exact timestamp into Firestore, and increments today's scan counter.",
          te: "కెమెరాను జిమ్ QR కోడ్ వైపు చూపించగానే బీప్ సౌండ్‌తో హాజరు నమోదవుతుంది మరియు స్కాన్ సమయం సేవ్ అవుతుంది.",
        },
      },
      {
        name: { en: "Switch Camera (Back / Front)", te: "కెమెరా మార్చు (బ్యాక్ / ఫ్రంట్)" },
        trigger: { en: "'Back Cam' / 'Front Cam' Toggle Button", te: "కెమెరా స్విచ్ బటన్" },
        description: {
          en: "Instantly switches camera lens without stutter or lag for members whose back camera might be blurry or covered.",
          te: "సభ్యుల వెనుక కెమెరా పనిచేయకపోయినా వెంటనే ఫ్రంట్ కెమెరాకు మారి స్కాన్ చేసుకునేలా చేస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Days Remaining Countdown", te: "మిగిలిన రోజుల సంఖ్య" },
        meaning: {
          en: "Live countdown calculated from today until plan expiration date so members know when to renew.",
          te: "ప్లాన్ గడువు ముగియడానికి ఇంకా ఎన్ని రోజులు మిగిలి ఉన్నాయో సభ్యుడికి స్పష్టంగా కనిపించే కౌంట్‌డౌన్.",
        },
      },
    ],
    proTip: {
      en: "Advise members to tap 'Add to Home Screen' in Chrome or Safari so the member app acts like a native app on their phone with an app icon.",
      te: "సభ్యులు తమ మొబైల్ బ్రౌజర్‌లో 'Add to Home Screen' క్లిక్ చేసుకుంటే వారి ఫోన్‌లో నేరుగా యాప్ ఐకాన్ మాదిరిగా ఓపెన్ అవుతుంది.",
    },
  },
];

export default function HelpPage() {
  const [lang, setLang] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    clients: true,
    "client-attendance": true,
    "client-details": true,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    HELP_DATA.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  // Filter items by category and search
  const filteredData = useMemo(() => {
    return HELP_DATA.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleEn = item.title.en.toLowerCase();
      const titleTe = item.title.te.toLowerCase();
      const route = item.route.toLowerCase();
      const purposeEn = item.purpose.en.toLowerCase();
      const purposeTe = item.purpose.te.toLowerCase();

      // Check actions or fields match
      const actionMatch = item.actions.some(
        (a) =>
          a.name.en.toLowerCase().includes(q) ||
          a.name.te.toLowerCase().includes(q) ||
          a.description.en.toLowerCase().includes(q) ||
          a.description.te.toLowerCase().includes(q)
      );

      const fieldMatch = item.fields.some(
        (f) =>
          f.field.en.toLowerCase().includes(q) ||
          f.field.te.toLowerCase().includes(q) ||
          f.meaning.en.toLowerCase().includes(q) ||
          f.meaning.te.toLowerCase().includes(q)
      );

      return (
        titleEn.includes(q) ||
        titleTe.includes(q) ||
        route.includes(q) ||
        purposeEn.includes(q) ||
        purposeTe.includes(q) ||
        actionMatch ||
        fieldMatch
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <PageContainer
      title={lang === "en" ? "Software Help & Operational Guide" : "సాఫ్ట్‌వేర్ సహాయం & యూజర్ గైడ్"}
      subtitle={
        lang === "en"
          ? "Complete documentation of all pages, features, buttons, fields & business workflows"
          : "అన్ని పేజీలు, ఫీచర్లు, బటన్లు, ఫీల్డ్ వివరణలు మరియు జిమ్ నిర్వహణ సూచనలు"
      }
    >
      {/* Top Banner Toolbar: Language Switcher, Print Button & Search */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{lang === "en" ? "Brother's Fitness Software Manual" : "బ్రదర్స్ ఫిట్‌నెస్ సాఫ్ట్‌వేర్ యూజర్ మాన్యువల్"}</span>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === "en"
                  ? "Select your preferred language below to view all system explanations"
                  : "సిస్టమ్ వివరాలను చూడటానికి మీకు కావలసిన భాషను ఎంచుకోండి"}
              </p>
            </div>
          </div>

          {/* Language Switcher Buttons & Print */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  lang === "en"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>

              <button
                type="button"
                onClick={() => setLang("te")}
                className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  lang === "te"
                    ? "bg-amber-400 text-black shadow-xs font-bold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <span>🇮🇳</span>
                <span>తెలుగు (Telugu)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="cursor-pointer flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 shadow-xs"
              title="Print Documentation"
            >
              <Printer className="h-4 w-4 text-amber-500" />
              <span className="hidden md:inline">{lang === "en" ? "Print Manual" : "ప్రింట్ చేయి"}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={
              lang === "en"
                ? "Search any page, button, action (e.g. 'Add Client', 'Attendance', 'QR', 'Split', 'Payroll')..."
                : "ఏదైనా పేజీ, బటన్ లేదా ఫీల్డ్ శోధించండి (ఉదా: 'సభ్యులు', 'హాజరు', 'ప్లాన్', 'QR కోడ్', 'జీతం')..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Category Pills & Expand/Collapse All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-400 text-black shadow-xs font-bold"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {cat.label[lang]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
            >
              {lang === "en" ? "Expand All" : "అన్నీ విస్తరించు"}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
            >
              {lang === "en" ? "Collapse All" : "అన్నీ మూసివేయి"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Documentation Sections List */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <Info className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {lang === "en" ? "No documentation found" : "ఎటువంటి సమాచారం దొరకలేదు"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {lang === "en"
                ? `No topic matched '${searchQuery}'. Try searching with different keywords.`
                : `'${searchQuery}' కి సరిపోలిన అంశం లేదు. వేరే పదాలతో ప్రయత్నించండి.`}
            </p>
          </div>
        ) : (
          filteredData.map((item, index) => {
            const isExpanded = expandedModules[item.id] ?? false;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                id={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all"
              >
                {/* Header Toggle Accordion Bar */}
                <div
                  onClick={() => toggleModule(item.id)}
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors border-b border-zinc-100 dark:border-zinc-800/60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 font-bold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title[lang]}
                        </h3>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          {item.route}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        {item.tagline[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
                    {/* 1. Purpose & Overview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                        <Info className="h-4 w-4 text-amber-500" />
                        <span>{lang === "en" ? "Page Purpose & Role" : "పేజీ ప్రయోజనం & ప్రాముఖ్యత"}</span>
                      </div>
                      <p className="rounded-xl bg-zinc-50 p-3.5 leading-relaxed dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {item.purpose[lang]}
                      </p>
                    </div>

                    {/* 2. Key Elements on this Page */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{lang === "en" ? "What is on this page?" : "ఈ పేజీలో ఏమేమి ఉంటాయి?"}</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.overview[lang].map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 rounded-lg border border-zinc-200/60 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-800/20"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 3. Actions, Buttons & Modals */}
                    {item.actions.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>{lang === "en" ? "Actions, Buttons & Modals" : "బటన్లు, మోడల్స్ మరియు చర్యలు"}</span>
                        </div>
                        <div className="divide-y divide-zinc-200/80 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800 overflow-hidden">
                          {item.actions.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="p-3.5 bg-zinc-50/50 hover:bg-zinc-50 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                    {act.name[lang]}
                                  </span>
                                  <span className="rounded bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-400/30">
                                    {act.trigger[lang]}
                                  </span>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                                  {act.description[lang]}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Field & Value Reference Table */}
                    {item.fields.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                          <Layers className="h-4 w-4 text-amber-500" />
                          <span>
                            {lang === "en"
                              ? "Field References: What does each value mean?"
                              : "ఫీల్డ్ వివరణలు: ప్రతి విలువ దేనికి వర్తిస్తుంది?"}
                          </span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                              <tr>
                                <th className="p-3 w-1/3">{lang === "en" ? "Field Name" : "ఫీల్డ్ పేరు"}</th>
                                <th className="p-3 w-1/2">{lang === "en" ? "Meaning & System Calculation" : "వివరణ & సిస్టమ్ లెక్కింపు"}</th>
                                <th className="p-3">{lang === "en" ? "Example Value" : "ఉదాహరణ"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                              {item.fields.map((fld, fldIdx) => (
                                <tr key={fldIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                                  <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100 align-top">
                                    {fld.field[lang]}
                                  </td>
                                  <td className="p-3 text-zinc-600 dark:text-zinc-400 leading-relaxed align-top">
                                    {fld.meaning[lang]}
                                  </td>
                                  <td className="p-3 font-mono font-medium text-emerald-600 dark:text-emerald-400 align-top">
                                    {fld.example ? fld.example[lang] : "--"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 5. Pro-Tip Alert Box */}
                    {item.proTip && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-300 text-xs block mb-0.5">
                            {lang === "en" ? "Gym Operations Pro-Tip:" : "జిమ్ నిర్వహణ చిట్కా (Pro-Tip):"}
                          </span>
                          <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                            {item.proTip[lang]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Support Card */}
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6 text-center space-y-2 dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {lang === "en" ? "Need further assistance with Brother's Fitness software?" : "మరిన్ని సందేహాలు లేదా సాంకేతిక సహాయం కావాలా?"}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          {lang === "en"
            ? "Visit the 'Support & Contact' page or contact GamaNext software engineering team for dedicated training and troubleshooting."
            : "'Support & Contact' పేజీకి వెళ్లి డెవలపర్ టీమ్‌తో నేరుగా మాట్లాడవచ్చు."}
        </p>
      </div>
    </PageContainer>
  );
}

