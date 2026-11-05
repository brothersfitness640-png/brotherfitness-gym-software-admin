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
  AlertCircle,
  ArrowRight,
  FileText,
  Lightbulb,
  Check,
} from "lucide-react";

type Language = "en" | "te";
type ViewTab = "guide" | "recipes" | "faq";

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

interface HowToRecipe {
  title: { en: string; te: string };
  steps: { en: string; te: string }[];
}

interface PageDocItem {
  id: string;
  category: "core" | "members" | "attendance" | "management" | "staff_payroll" | "system";
  route: string;
  icon: any;
  whoUses: { en: string; te: string };
  simpleAnalogy: { en: string; te: string };
  title: { en: string; te: string };
  tagline: { en: string; te: string };
  purpose: { en: string; te: string };
  overview: { en: string[]; te: string[] };
  howToSteps?: HowToRecipe[];
  actions: ActionExplanation[];
  fields: FieldExplanation[];
  commonMistakes?: { en: string; te: string }[];
  proTip: { en: string; te: string };
}

interface FaqItem {
  question: { en: string; te: string };
  answer: { en: string; te: string };
  category: string;
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

const QUICK_RECIPES: HowToRecipe[] = [
  {
    title: {
      en: "1. How to Register a New Member & Assign a Plan",
      te: "1. కొత్త సభ్యుడిని నమోదు చేసి ప్లాన్ కేటాయించే విధానం",
    },
    steps: [
      {
        en: "Click 'Clients' in the sidebar, then click the yellow '+ Add Client' button.",
        te: "సైడ్‌బార్‌లో 'Clients' పై క్లిక్ చేసి, పైన ఉన్న పసుపు రంగు '+ Add Client' బటన్ నొక్కండి.",
      },
      {
        en: "Enter Name, Phone Number, Gender, and 4-digit MPIN (e.g., 1234).",
        te: "సభ్యుని పేరు, మొబైల్ నంబర్, జెండర్ మరియు 4 అంకెల MPIN (ఉదా: 1234) నమోదు చేయండి.",
      },
      {
        en: "Click 'Snap Photo' using Back/Front camera for face verification and select gym branch.",
        te: "'Snap Photo' నొక్కి వెనుక లేదా ముందు కెమెరాతో సభ్యుని స్పష్టమైన ముఖం ఫోటో తీయండి.",
      },
      {
        en: "Select their starting Membership Plan from the dropdown and record the payment amount paid today.",
        te: "డ్రాప్‌డౌన్ నుండి ప్లాన్‌ను ఎంచుకుని, ఈ రోజు చెల్లించిన ఫీజు మొత్తాన్ని నమోదు చేయండి.",
      },
      {
        en: "Click 'Save Client'. The member is created immediately with an active status and receipt!",
        te: "'Save Client' పై క్లిక్ చేయండి. సభ్యుని ఖాతా యాక్టివేట్ అయి వెంటనే రసీదు తయారవుతుంది!",
      },
    ],
  },
  {
    title: {
      en: "2. How Members Scan QR for Daily Attendance",
      te: "2. సభ్యులు QR కోడ్ స్కాన్ చేసి రోజువారీ హాజరు వేసుకునే విధానం",
    },
    steps: [
      {
        en: "Member opens gym link on phone (/scan) and logs in using their registered Phone & MPIN.",
        te: "సభ్యుడు తన మొబైల్‌లో జిమ్ లింక్ (/scan) తెరిచి ఫోన్ నంబర్ & MPIN తో లాగిన్ అవ్వాలి.",
      },
      {
        en: "Click 'Scan QR Code' — Back camera starts automatically with ultra-fast viewfinder.",
        te: "'Scan QR Code' నొక్కగానే ఫోన్ వెనుక కెమెరా వెంటనే ఎలాంటి లాగ్ లేకుండా ఓపెన్ అవుతుంది.",
      },
      {
        en: "Point camera at the Brother's Fitness QR poster pasted at gym reception or entrance.",
        te: "జిమ్ ఎంట్రన్స్ వద్ద ఉన్న Brother's Fitness అధికారిక QR కోడ్ పోస్టర్ వైపు కెమెరా చూపించండి.",
      },
      {
        en: "System verifies GPS location (within 30 meters) and instantly records the scan time.",
        te: "సిస్టమ్ సభ్యుని GPS లొకేషన్‌ను తనిఖీ చేసి (30 మీటర్లలోపు) వెంటనే హాజరు సమయాన్ని సేవ్ చేస్తుంది.",
      },
      {
        en: "Success screen shows total scans today with exact timestamps (e.g. Scan #1 at 06:15 AM, Scan #2 at 06:30 PM).",
        te: "గ్రీన్ టిక్‌తో పాటు ఈ రోజు మొత్తం ఎన్నిసార్లు స్కాన్ చేశారో, ఏ సమయాల్లో చేశారో వివరాలు కనిపిస్తాయి.",
      },
    ],
  },
  {
    title: {
      en: "3. How to Record Installment / Fee Collection",
      te: "3. మిగిలిన ఫీజు వాయిదా (Installment) నమోదు చేసే విధానం",
    },
    steps: [
      {
        en: "Go to 'Clients' -> search member name or phone -> click to open their Client Details page.",
        te: "'Clients' పేజీకి వెళ్లి సభ్యుని పేరు లేదా ఫోన్ శోధించి వారి వివరాల పేజీని తెరవండి.",
      },
      {
        en: "Click on the 'Payment & Plan' tab (Tab 2).",
        te: "'Payment & Plan' ట్యాబ్ (ట్యాబ్ 2) పై క్లిక్ చేయండి.",
      },
      {
        en: "Click '+ Add Installment' next to their active plan.",
        te: "యాక్టివ్ ప్లాన్ పక్కన ఉన్న '+ Add Installment' బటన్ నొక్కండి.",
      },
      {
        en: "Enter the amount collected, select mode (Cash, UPI, Card, or Split), and click 'Save Installment'.",
        te: "వసూలు చేసిన ఫీజు మొత్తం, చెల్లింపు పద్ధతి (నగదు, UPI, కార్డ్) ఎంచుకుని సేవ్ చేయండి.",
      },
      {
        en: "Balance decreases automatically and a printable/downloadable payment receipt is generated.",
        te: "పెండింగ్ బ్యాలెన్స్ ఆటోమేటిక్‌గా తగ్గిపోతుంది మరియు తక్షణమే రసీదు సిద్ధమవుతుంది.",
      },
    ],
  },
  {
    title: {
      en: "4. How to Generate & Print Gym QR Posters",
      te: "4. జిమ్ QR కోడ్ పోస్టర్లను డౌన్‌లోడ్ & ప్రింట్ చేసే విధానం",
    },
    steps: [
      {
        en: "Go to 'Outlets QR Code' (/outlets-qr) from the sidebar.",
        te: "సైడ్‌బార్ నుండి 'Outlets QR Code' (/outlets-qr) పేజీకి వెళ్లండి.",
      },
      {
        en: "Select the desired branch outlet from the dropdown menu.",
        te: "డ్రాప్‌డౌన్ నుండి మీకు కావలసిన జిమ్ బ్రాంచ్‌ను ఎంచుకోండి.",
      },
      {
        en: "Click 'Download High-Res PNG' to save a crystal-clear image file for flex or board printing.",
        te: "ఫ్లెక్స్ బోర్డులు లేదా స్టిక్కర్ల కోసం 'Download High-Res PNG' బటన్ నొక్కి ఫోటో డౌన్‌లోడ్ చేసుకోండి.",
      },
      {
        en: "Or click 'Print QR Station Poster' for a ready-to-print A4 poster with member instructions.",
        te: "లేదా A4 సైజులో సూచనలతో కూడిన పోస్టర్ కోసం 'Print QR Station Poster' పై క్లిక్ చేయండి.",
      },
      {
        en: "Paste the poster at gym entrance, cardio area, or reception desk at eye level.",
        te: "పోస్టర్‌ను జిమ్ ఎంట్రన్స్ వద్ద లేదా రిసెప్షన్ డెస్క్ వద్ద కంటికి కనిపించే ఎత్తులో అతికించండి.",
      },
    ],
  },
  {
    title: {
      en: "5. How to Track & Convert Walk-In Visitors",
      te: "5. జిమ్‌కి వచ్చే ఎంక్వైరీలు (విజిటర్స్) నమోదు & ఫాలోఅప్ విధానం",
    },
    steps: [
      {
        en: "When a potential member visits, go to 'Visitors' (/visitors) and click '+ Add Visitor'.",
        te: "కొత్త వ్యక్తి జిమ్ ఎంక్వైరీకి వచ్చినప్పుడు 'Visitors' పేజీలో '+ Add Visitor' నొక్కండి.",
      },
      {
        en: "Enter Name, Phone, Fitness Goal, Interested Plan, and Expected Joining Date.",
        te: "పేరు, ఫోన్, ఫిట్‌నెస్ గోల్ (వెయిట్ లాస్/మజిల్ గెయిన్), మరియు వారు చేరాలనుకుంటున్న తేదీ నమోదు చేయండి.",
      },
      {
        en: "Next day, use the status filter to call back visitors who are 'Interested' or took a 'Trial'.",
        te: "మరుసటి రోజు ఫిల్టర్ ఉపయోగించి ఆసక్తి ఉన్నవారికి కాల్ చేసి ఫాలోఅప్ చేయండి.",
      },
      {
        en: "When they decide to join, click 'Convert to Client' to instantly transfer them to Members list!",
        te: "వారు జిమ్‌లో చేరినప్పుడు 'Convert to Client' నొక్కితే మళ్లీ వివరాలు టైప్ చేయకుండానే సభ్యుడిగా మారిపోతారు!",
      },
    ],
  },
  {
    title: {
      en: "6. How to Run Monthly Payroll for Staff & Trainers",
      te: "6. సిబ్బంది మరియు ట్రైనర్లకు నెలవారీ జీతాలు ప్రాసెస్ చేసే విధానం",
    },
    steps: [
      {
        en: "Open 'Payroll' (/payroll) at the beginning or end of the month.",
        te: "నెల ప్రారంభంలో లేదా నెలాఖరున 'Payroll' (/payroll) పేజీని తెరవండి.",
      },
      {
        en: "Select Month and Year (e.g. November 2026) to see all employees with their base salary.",
        te: "నెల మరియు సంవత్సరాన్ని ఎంచుకుంటే సిబ్బంది అందరి మూల వేతనం జాబితా కనిపిస్తుంది.",
      },
      {
        en: "Add any incentives (PT commissions, overtime) or enter unpaid leave deductions.",
        te: "పర్సనల్ ట్రైనింగ్ కమిషన్లు, బోనస్‌లు లేదా సెలవుల కోతలను నమోదు చేయండి.",
      },
      {
        en: "Click 'Process Payment', select payment mode (Bank Transfer / Cash / UPI), and confirm.",
        te: "'Process Payment' పై క్లిక్ చేసి పేమెంట్ మోడ్ ఎంచుకుని ధృవీకరించండి.",
      },
      {
        en: "Click 'Download Pay Slip' to give the employee their official branded salary voucher.",
        te: "ఉద్యోగికి అధికారిక శాలరీ స్లిప్ ఇవ్వడానికి 'Download Pay Slip' పై క్లిక్ చేయండి.",
      },
    ],
  },
];

const FAQS: FaqItem[] = [
  {
    category: "camera",
    question: {
      en: "Camera is not opening or showing black screen. How to fix?",
      te: "కెమెరా ఓపెన్ కావడం లేదు లేదా బ్లాక్ స్క్రీన్ వస్తోంది. ఏం చేయాలి?",
    },
    answer: {
      en: "1) Tap the padlock/settings icon in the browser address bar and make sure 'Camera' is set to 'Allow'. 2) Ensure no other app (like WhatsApp or Instagram) is using the camera in the background. 3) The software defaults to the Back Camera with a smooth switch button to front camera.",
      te: "1) బ్రౌజర్ అడ్రస్ బార్‌లో తాళం గుర్తుపై నొక్కి కెమెరా పర్మిషన్ 'Allow' లో ఉందో లేదో చూడండి. 2) వాట్సాప్ లేదా ఇతర యాప్స్ బ్యాక్‌గ్రౌండ్‌లో కెమెరా వాడుతుంటే వాటిని క్లోజ్ చేయండి. 3) సాఫ్ట్‌వేర్ ఆటోమేటిక్‌గా బ్యాక్ కెమెరాతో ఓపెన్ అవుతుంది.",
    },
  },
  {
    category: "attendance",
    question: {
      en: "Client attendance fails with 'Too Far From Branch' message. Why?",
      te: "హాజరు సమయంలో 'జిమ్ లొకేషన్‌కు దూరంగా ఉన్నారు' అని ఎర్రర్ ఎందుకు వస్తుంది?",
    },
    answer: {
      en: "Brother's Fitness attendance has anti-proxy security. Members must be within 30 meters of the gym building. Ensure the member's phone GPS/Location is turned ON. Also ensure the gym outlet GPS coordinates in '/outlets' were saved correctly using 'Detect Current GPS'.",
      te: "సభ్యులు జిమ్ వెలుపల ఉండి దొంగ హాజరు వేసుకోకుండా 30 మీటర్ల భద్రతా పరిధి ఉంది. సభ్యుని మొబైల్‌లో లొకేషన్/GPS ఆన్‌లో ఉండాలి. అలాగే అడ్మిన్ '/outlets' పేజీలో జిమ్ వద్ద నిలబడి 'Detect Current GPS' ద్వారా కచ్చితమైన లొకేషన్ సేవ్ చేశారని నిర్ధారించుకోండి.",
    },
  },
  {
    category: "attendance",
    question: {
      en: "Can a member scan attendance more than once in a single day?",
      te: "ఒక సభ్యుడు ఒకే రోజులో ఒకటి కంటే ఎక్కువసార్లు హాజరు స్కాన్ చేయవచ్చా?",
    },
    answer: {
      en: "Yes! Members who work out in the morning and evening can scan multiple times. Every single scan is tracked as Scan #1, Scan #2, Scan #3 with exact times and station locations, visible in both Admin and Client attendance logs.",
      te: "ఖచ్చితంగా చేయవచ్చు! ఉదయం మరియు సాయంత్రం రెండు పూటలా వచ్చే సభ్యులు ఎన్నిసార్లైనా స్కాన్ చేయవచ్చు. ప్రతి స్కాన్ సమయం (#1, #2, #3...) అడ్మిన్ మరియు క్లయింట్ స్క్రీన్‌లపై స్పష్టంగా నమోదు అవుతుంది.",
    },
  },
  {
    category: "members",
    question: {
      en: "A member forgot their MPIN. How do I reset it?",
      te: "సభ్యుడు తన MPIN మర్చిపోతే రీసెట్ చేయడం ఎలా?",
    },
    answer: {
      en: "Go to 'Clients' (/clients), find the member, click 'View Profile', stay on Tab 1 (Profile), click 'Edit Details', type a new 4 to 6 digit MPIN (e.g. 1234 or their birth year), and click 'Save Changes'. The member can log in immediately.",
      te: "'Clients' పేజీకి వెళ్లి సభ్యుని ప్రొఫైల్ తెరిచి, ట్యాబ్ 1 లో 'Edit Details' నొక్కండి. కొత్త 4 అంకెల MPIN (ఉదా: 1234) టైప్ చేసి సేవ్ చేయండి. సభ్యుడు వెంటనే లాగిన్ అవ్వవచ్చు.",
    },
  },
  {
    category: "plans",
    question: {
      en: "How do I offer a festival or student discount on a membership plan?",
      te: "మెంబర్‌షిప్ ప్లాన్‌పై పండుగ లేదా విద్యార్థి డిస్కౌంట్ ఎలా ఇవ్వాలి?",
    },
    answer: {
      en: "When assigning a plan in Client Details (Tab 2), pick the plan from the dropdown. The system fills the Base Price (e.g. ₹10,000). Enter the discount in the 'Discount Amount' box (e.g. ₹1,500). The Net Payable Amount automatically becomes ₹8,500.",
      te: "క్లయింట్ వివరాల పేజీలో ట్యాబ్ 2 లో 'Assign Plan' నొక్కి ప్లాన్ ఎంచుకోండి. అసలు ధర కనిపిస్తుంది. 'Discount' బాక్స్‌లో తగ్గింపు మొత్తం (ఉదా: ₹1,500) నమోదు చేస్తే, సభ్యుడు చెల్లించాల్సిన అసలు మొత్తం ఆటోమేటిక్‌గా ₹8,500 గా మారుతుంది.",
    },
  },
  {
    category: "system",
    question: {
      en: "Do members need to download an app from Google Play Store or Apple App Store?",
      te: "సభ్యులు ప్లే స్టోర్ లేదా యాప్ స్టోర్ నుండి యాప్ డౌన్‌లోడ్ చేసుకోవాలా?",
    },
    answer: {
      en: "No! Brother's Fitness uses modern Progressive Web App (PWA) technology. Members simply visit the gym link in Chrome or Safari. On iPhone, they can tap 'Share' -> 'Add to Home Screen' to have an instant app icon with zero downloads or storage consumption.",
      te: "అవసరం లేదు! ఇది నేరుగా మొబైల్ బ్రౌజర్‌లో పనిచేసే అత్యాధునిక వెబ్ యాప్. సభ్యులు లింక్ ఓపెన్ చేసి 'Add to Home Screen' నొక్కితే చాలు, ఫోన్ మెమరీ ఖర్చు లేకుండా యాప్ లాగే పనిచేస్తుంది.",
    },
  },
];

const HELP_DATA: PageDocItem[] = [
  // 1. Dashboard
  {
    id: "dashboard",
    category: "core",
    route: "/",
    icon: Building2,
    whoUses: {
      en: "Gym Owners, General Managers, Receptionists",
      te: "జిమ్ యజమానులు, మేనేజర్లు, రిసెప్షన్ సిబ్బంది",
    },
    simpleAnalogy: {
      en: "Think of the Dashboard like a car speedometer and fuel gauge — gives you the entire gym's financial and member health at a single glance.",
      te: "కారు డాష్‌బోర్డ్ లాగే — జిమ్ మొత్తం ఆదాయం, ఎంతమంది సభ్యులు వస్తున్నారు, ఎవరి ప్లాన్ అయిపోతుందో ఒకే చూపులో చూపిస్తుంది.",
    },
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
        "Today's Attendance Bar: Quick visual counter of how many members checked in today vs total registered members.",
        "Expiring Plans Alert List: Members whose packages expire in the next 7 days for proactive renewal calls.",
        "Quick Action Shortcuts: Instant one-click shortcuts to register a client, mark attendance, or create a plan.",
        "Multi-Branch Switcher: Toggle between specific gym locations or see combined revenue across all outlets.",
      ],
      te: [
        "ప్రధాన గణాంకాలు (KPIs): మొత్తం యాక్టివ్ సభ్యులు, నేటి హాజరైన వారి సంఖ్య, నెలవారీ ఆదాయం, వసూలు కావాల్సిన పెండింగ్ ఫీజులు.",
        "నేటి హాజరు గ్రాఫ్: ఈ రోజు జిమ్‌కి ఎంతమంది వచ్చారు మరియు ఎంతమంది రాలేదో త్వరిత వివరాలు.",
        "ఎక్స్‌పైరీ అలర్ట్స్: రాబోయే 7 రోజుల్లో కాలపరిమితి ముగిసే సభ్యుల వివరాలు (రెన్యూవల్స్ కోసం కాల్ చేయవచ్చు).",
        "క్విక్ యాక్షన్ బటన్స్: సభ్యుడిని చేర్చడానికి, హాజరు వేయడానికి వెంటనే వెళ్లే షార్ట్‌కట్‌లు.",
        "మల్టీ-బ్రాంచ్ ఫిల్టర్: అన్ని బ్రాంచ్‌ల సమాచారం కలిపి లేదా ఒక్కో బ్రాంచ్ వివరాలు విడిగా చూడవచ్చు.",
      ],
    },
    howToSteps: [
      {
        title: {
          en: "How to use Dashboard for morning gym opening routine",
          te: "ఉదయం జిమ్ ఓపెన్ చేసినప్పుడు డ్యాష్‌బోర్డ్ ఎలా పరిశీలించాలి",
        },
        steps: [
          {
            en: "1. Look at 'Expiring in 7 Days' card — note down member names to call or send WhatsApp reminders.",
            te: "1. 'Expiring in 7 Days' కార్డ్ చూడండి — రాబోయే వారం రోజుల్లో ప్లాన్ అయిపోయే సభ్యుల పేర్లు చూసి వాట్సాప్ రిమైండర్ పంపండి.",
          },
          {
            en: "2. Check 'Pending Installments' to identify members coming today who owe balance fees.",
            te: "2. 'Pending Installments' చూడండి — ఈ రోజు జిమ్‌కి వచ్చే వారిలో ఫీజు బ్యాలెన్స్ ఉన్నవారిని గుర్తించండి.",
          },
          {
            en: "3. Monitor 'Today's Check-ins' counter rise in real time as members scan at the reception.",
            te: "3. సభ్యులు ఎంట్రన్స్ వద్ద స్కాన్ చేస్తుంటే 'Today's Check-ins' సంఖ్య లైవ్‌గా పెరగడాన్ని గమనించండి.",
          },
        ],
      },
    ],
    actions: [
      {
        name: { en: "Filter by Outlet", te: "బ్రాంచ్ వారీగా ఫిల్టర్" },
        trigger: { en: "Top Outlet Dropdown", te: "పైన ఉన్న బ్రాంచ్ డ్రాప్‌డౌన్" },
        description: {
          en: "Filters all metrics, graphs, and expiry alerts for a specific branch or combined all-outlet view.",
          te: "ఒక నిర్దిష్ట బ్రాంచ్ లేదా అన్ని బ్రాంచ్‌ల సమాచారాన్ని కలిపి చూడటానికి బ్రాంచ్‌ను ఎంచుకోవచ్చు.",
        },
      },
      {
        name: { en: "+ Add Client Shortcut", te: "+ కొత్త సభ్యుడి షార్ట్‌కట్" },
        trigger: { en: "Yellow '+ Add Client' Button", te: "పసుపు '+ Add Client' బటన్" },
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
      {
        field: { en: "Today's Attendance", te: "నేటి హాజరు సంఖ్య" },
        meaning: {
          en: "Unique members who verified their attendance today through mobile QR scan or manual check-in.",
          te: "ఈ రోజు QR కోడ్ లేదా మాన్యువల్‌గా హాజరు వేసుకున్న ప్రత్యేక సభ్యుల సంఖ్య.",
        },
        example: { en: "68 Present Today", te: "ఈ రోజు 68 మంది వచ్చారు" },
      },
    ],
    commonMistakes: [
      {
        en: "Do not ignore the Expiring Plans list — calling members 3 days before expiry increases renewal rates by 40%!",
        te: "ఎక్స్‌పైరీ లిస్ట్‌ను నిర్లక్ష్యం చేయవద్దు — ప్లాన్ ముగియడానికి 3 రోజుల ముందే కాల్ చేస్తే రెన్యూవల్స్ గణనీయంగా పెరుగుతాయి!",
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
    whoUses: {
      en: "Gym Owner, Master Admin",
      te: "జిమ్ యజమాని, ప్రధాన అడ్మిన్",
    },
    simpleAnalogy: {
      en: "Think of Outlets like pins on Google Maps — defines where your gym branches are located and locks attendance to that physical building.",
      te: "గూగుల్ మ్యాప్స్‌లో మీ జిమ్ లొకేషన్ మార్క్ చేసినట్లు — సభ్యులు ఆ బిల్డింగ్ లోపల ఉన్నప్పుడే హాజరు పడేలా GPS లాక్ చేస్తుంది.",
    },
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
        "Active QR Stations: Tracks how many QR points are currently linked to this outlet.",
      ],
      te: [
        "బ్రాంచ్‌ల జాబితా: బ్రాంచ్ పేరు, ఫోన్ నంబర్, అడ్రస్ మరియు సేవ్ చేసిన GPS లొకేషన్ వివరాలు.",
        "కొత్త బ్రాంచ్ నమోదు: ప్రస్తుత లొకేషన్‌ను ఆటోమేటిక్‌గా గుర్తించే బటన్‌తో కూడిన ఫారమ్.",
        "ఎడిట్ & డిలీట్: ఫోన్ నంబర్లు, అడ్రస్‌లను మార్చడానికి లేదా అవసరం లేని బ్రాంచ్‌ను తొలగించడానికి.",
        "యాక్టివ్ QR స్టేషన్లు: ఈ బ్రాంచ్‌కు ఎన్ని QR పాయింట్లు లింక్ అయి ఉన్నాయో చూపిస్తుంది.",
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
      {
        name: { en: "+ Add Outlet", te: "+ కొత్త బ్రాంచ్ జోడించు" },
        trigger: { en: "'+ Add Outlet' Button", te: "'+ Add Outlet' బటన్" },
        description: {
          en: "Opens form to enter branch name, address, contact numbers, and GPS pin.",
          te: "కొత్త బ్రాంచ్ పేరు, చిరునామా, ఫోన్ నంబర్లు మరియు GPS వివరాలు నమోదు చేసే విండో తెరుస్తుంది.",
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
    whoUses: {
      en: "Gym Owner, Branch Manager, Reception Staff",
      te: "జిమ్ యజమాని, బ్రాంచ్ మేనేజర్, రిసెప్షన్ స్టాఫ్",
    },
    simpleAnalogy: {
      en: "Think of the QR Code like a high-tech biometric punch machine printed on an acrylic standee on your reception counter.",
      te: "గోడపై లేదా రిసెప్షన్ టేబుల్‌పై ఉంచే డిజిటల్ బయోమెట్రిక్ బోర్డు లాంటిది — సభ్యులు ఫోన్‌తో స్కాన్ చేయగానే హాజరు పడుతుంది.",
    },
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
        "Download High-Res PNG Button: Saves a sharp 1000x1000 image for printing reception stickers.",
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
          en: "Downloads a 1000x1000px branded PNG QR image to send to local flex printers or acrylic makers.",
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
      en: "Laminate the printed QR poster or put it in an acrylic table stand to protect it from moisture and cleaning sprays at the entrance.",
      te: "ప్రింట్ చేసిన QR పోస్టర్‌ను లామినేషన్ చేయించి లేదా యాక్రిలిక్ స్టాండ్‌లో ఉంచితే ఎక్కువ కాలం మన్నుతుంది.",
    },
  },

  // 4. Clients Directory
  {
    id: "clients",
    category: "members",
    route: "/clients",
    icon: Users,
    whoUses: {
      en: "Receptionists, Front Desk Staff, Gym Owners, Sales Team",
      te: "రిసెప్షనిస్ట్, ఫ్రంట్ డెస్క్ స్టాఫ్, జిమ్ ఓనర్, సేల్స్ టీమ్",
    },
    simpleAnalogy: {
      en: "Think of Clients like your master gym ledger book — every member's photo, phone number, plan status, and payment history is stored here safely.",
      te: "జిమ్ మెయిన్ రిజిస్టర్ బుక్ లాంటిది — సభ్యుల ఫోటోలు, ఫోన్ నంబర్లు, ఫీజుల వివరాలు కంప్యూటర్‌లో పదిలంగా ఉంటాయి.",
    },
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
    whoUses: {
      en: "Front Desk Staff, Personal Trainers, Gym Managers",
      te: "ఫ్రంట్ డెస్క్ స్టాఫ్, పర్సనల్ ట్రైనర్లు, మేనేజర్లు",
    },
    simpleAnalogy: {
      en: "Think of this page like a complete medical & fitness folder for that member — contains their membership plans, receipts, diet, and coach notes.",
      te: "సభ్యుని పూర్తి ఫైల్ లాంటిది — అతని ప్లాన్ హిస్టరీ, చెల్లించిన ఫీజు రసీదులు, డైట్ చార్ట్ మరియు ఏ ట్రైనర్ ఉన్నారో అన్నీ ఉంటాయి.",
    },
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
    whoUses: {
      en: "Head Coach, Gym Manager, Personal Trainers",
      te: "హెడ్ కోచ్, జిమ్ మేనేజర్, ఫిట్‌నెస్ ట్రైనర్లు",
    },
    simpleAnalogy: {
      en: "Think of this page like your coaching staff roster — shows every trainer's specialty and how many clients are training under them.",
      te: "ట్రైనర్ల జాబితా — ఏ కోచ్ ఏ విషయంలో స్పెషలిస్ట్ మరియు వారి కింద ఎంతమంది క్లయింట్లు ఉన్నారో చూపిస్తుంది.",
    },
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
    whoUses: {
      en: "Front Desk Receptionist, Sales Counselor",
      te: "ఫ్రంట్ డెస్క్ రిసెప్షనిస్ట్, కౌన్సిలర్",
    },
    simpleAnalogy: {
      en: "Think of Visitors like an enquiry follow-up diary — tracks people who walked in asking for gym fees so you never miss a prospective client.",
      te: "ఎంక్వైరీ రిజిస్టర్ బుక్ లాంటిది — జిమ్ ఫీజులు అడగడానికి వచ్చిన వారి నంబర్లు రాసి పెట్టి, తిరిగి కాల్ చేసి జాయిన్ చేసుకోవడానికి ఉపయోగపడుతుంది.",
    },
    title: {
      en: "Visitors & Walk-in Inquiries",
      te: "విజిటర్స్ & వాక్-ఇన్ ఎంక్వైరీలు",
    },
    tagline: {
      en: "Track prospective gym leads, trial sessions, follow-up calls & 1-click conversion to members",
      te: "జిమ్ ఎంక్వైరీలు, ట్రయల్ వర్కౌట్స్, ఫాలోఅప్ కాల్స్ మరియు ఒకే క్లిక్‌తో సభ్యునిగా మార్చే సదుపాయం",
    },
    purpose: {
      en: "Lead generation and sales funnel tracker. Records prospective clients who visit the gym for inquiries or trial workouts, tracking their conversion probability and follow-up history.",
      te: "జిమ్‌కి కొత్తగా ఎంక్వైరీ కోసం వచ్చే వారి వివరాలు రాసుకోవడానికి మరియు వారిని జిమ్ మెంబర్లుగా మార్చడానికి ఫాలోఅప్ చేయడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Inquiry Log Table: Visitor name, contact phone, branch visited, interested package, trial status, and notes.",
        "Add Visitor Modal: Quick capture form to log walk-ins in under 30 seconds.",
        "1-Click 'Convert to Client' Button: Automatically transfers visitor data to the client registration form with zero re-typing.",
      ],
      te: [
        "ఎంక్వైరీల పట్టిక: విజిటర్ పేరు, ఫోన్ నంబర్, ఆసక్తి ఉన్న ప్యాకేజీ, ట్రయల్ తీసుకున్నారా లేదా మరియు రిమార్కులు.",
        "కొత్త ఎంక్వైరీ ఫారమ్: కేవలం 30 సెకన్లలో వివరాలు రాసుకునే సులభమైన ఫారమ్.",
        "Convert to Client బటన్: విజిటర్ చేరడానికి అంగీకరించిన వెంటనే ఒకే బటన్ నొక్కి డైరెక్ట్ మెంబర్‌గా మార్చవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "Convert to Client", te: "క్లయింట్‌గా మార్చు" },
        trigger: { en: "'Convert to Client' Button", te: "'Convert to Client' బటన్" },
        description: {
          en: "Transfers the visitor's name, phone, branch, and interested plan directly into the New Client Registration form.",
          te: "విజిటర్ పేరు, ఫోన్ మరియు ఆసక్తి ఉన్న ప్లాన్ వివరాలను నేరుగా క్లయింట్ రిజిస్ట్రేషన్ ఫారమ్‌లోకి నింపుతుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Follow-up Status", te: "ఫాలో-అప్ స్థితి" },
        meaning: {
          en: "Current state of sales inquiry: e.g. New Lead, Trial Session Booked, Interested, or Converted.",
          te: "ఆ వ్యక్తి ఏ స్థాయిలో ఉన్నారో తెలుపుతుంది (ఉదా: కొత్త ఎంక్వైరీ, ట్రయల్ చేస్తున్నారా, ఫీజు మాట్లాడారా).",
        },
        example: { en: "Trial Completed - Followup Today", te: "ట్రయల్ పూర్తయింది - నేడు కాల్ చేయాలి" },
      },
    ],
    proTip: {
      en: "Call visitors within 24 hours of their gym tour while their motivation to start working out is at its highest.",
      te: "జిమ్ చూసి వెళ్లిన 24 గంటల లోపే తిరిగి కాల్ మాట్లాడితే చేరే అవకాశాలు 70% ఎక్కువగా ఉంటాయి.",
    },
  },

  // 8. Client Attendance Console
  {
    id: "client-attendance",
    category: "attendance",
    route: "/client-attendance",
    icon: CalendarCheck,
    whoUses: {
      en: "Front Desk Staff, Security, Gym Floor Managers",
      te: "ఫ్రంట్ డెస్క్ స్టాఫ్, సెక్యూరిటీ, జిమ్ ఫ్లోర్ మేనేజర్",
    },
    simpleAnalogy: {
      en: "Think of this page like an airport flight status screen — shows every member walking in, their photo, exact check-in time, and how many times they scanned today.",
      te: "ఎయిర్‌పోర్ట్ స్క్రీన్ లాంటిది — ఈ రోజు జిమ్‌లోకి ఎవరు వచ్చారు, వారి ముఖం ఫోటో, ఎన్ని గంటలకు వచ్చారు, ఎన్నిసార్లు స్కాన్ చేశారో లైవ్‌గా కనిపిస్తుంది.",
    },
    title: {
      en: "Client Attendance Console",
      te: "క్లయింట్ హాజరు కన్సోల్",
    },
    tagline: {
      en: "Live real-time check-in stream, multi-scan tracking, face verification & manual out-time stamping",
      te: "లైవ్ హాజరు స్ట్రీమ్, ఒకే రోజులో బహుళ స్కాన్లు (#1, #2...), ఫేస్ వెరిఫికేషన్ మరియు అవుట్ టైమ్ రికార్డులు",
    },
    purpose: {
      en: "The live operational attendance desk where reception monitors incoming members. Shows all daily scan timestamps (e.g. Scan #1 at 6:15 AM, Scan #2 at 6:30 PM), photo match badges, and allows manual check-in for members without smartphones.",
      te: "జిమ్‌కి వచ్చే సభ్యుల హాజరును లైవ్‌గా పర్యవేక్షించే పేజీ. సభ్యులు ఎన్నిసార్లు స్కాన్ చేశారో, ఏ సమయాల్లో చేశారో మొత్తం హిస్టరీ ఇక్కడ కనిపిస్తుంది. ఫోన్ లేనివారికి మాన్యువల్‌గా హాజరు వేసే సదుపాయం కూడా ఉంది.",
    },
    overview: {
      en: [
        "Live Attendance Cards: Real-time cards showing member photo, name, branch, and status badge.",
        "Total Scans Badge & Popover: Displays total scan count (e.g., '3 Scans Today') and lists all individual timestamps.",
        "Manual Mark Attendance Modal: Select any member by name to record entry with photo verification.",
        "Quick 'Mark Out' Action: Stamps the member's workout departure time with one click.",
        "Attendance Scans Modal: Click 'View all scans' to inspect complete chronological log with station locations.",
      ],
      te: [
        "లైవ్ హాజరు కార్డులు: సభ్యుని ఫోటో, పేరు, బ్రాంచ్ మరియు వచ్చిన సమయం స్పష్టంగా కనిపిస్తాయి.",
        "టోటల్ స్కాన్స్ బ్యాడ్జ్: ఈ రోజు ఎన్నిసార్లు స్కాన్ చేశారో చూపిస్తుంది (ఉదా: '2 Scans Today') మరియు అన్ని సమయాలను వరుసగా చూపిస్తుంది.",
        "మాన్యువల్ హాజరు బటన్: ఫోన్ వెంట తెచ్చుకోని సభ్యులకు పేరు ద్వారా వెతికి ఫోటోతో హాజరు వేయవచ్చు.",
        "Mark Out బటన్: సభ్యుడు వర్కౌట్ ముగించుకుని వెళ్లేటప్పుడు నిష్క్రమణ సమయాన్ని నమోదు చేయవచ్చు.",
        "పూర్తి స్కాన్స్ మోడల్: 'View all scans' పై క్లిక్ చేస్తే ఆ రోజు స్కాన్ చేసిన ప్రతి వివరమూ కనిపిస్తుంది.",
      ],
    },
    actions: [
      {
        name: { en: "+ Mark Attendance (Manual)", te: "+ మాన్యువల్ హాజరు నమోదు" },
        trigger: { en: "'+ Mark Attendance' Button", te: "'+ Mark Attendance' బటన్" },
        description: {
          en: "Allows receptionists to manually check in a member by selecting their name, capturing a live photo, and assigning station.",
          te: "మొబైల్ మర్చిపోయిన సభ్యుడికి పేరు ఎంచుకుని, వెబ్‌క్యామ్‌తో ఫోటో తీసి హాజరు నమోదు చేసే విండో తెరుస్తుంది.",
        },
      },
      {
        name: { en: "View Scans History", te: "అన్ని స్కాన్లు చూడు" },
        trigger: { en: "'View all' Scans Link", te: "'View all' బటన్" },
        description: {
          en: "Opens modal displaying every single scan timestamp for that member today (#1, #2, #3...) with station location.",
          te: "ఆ సభ్యుడు ఈ రోజు చేసిన అన్ని స్కాన్లు, సమయాలు, స్టేషన్ పేర్లతో కూడిన పూర్తి వివరాల పాపప్ తెరుస్తుంది.",
        },
      },
      {
        name: { en: "Mark Out (Departure)", te: "అవుట్ టైమ్ వేయి (Mark Out)" },
        trigger: { en: "'Mark Out' Button", te: "'Mark Out' బటన్" },
        description: {
          en: "Records departure timestamp for workout duration tracking while preserving all earlier scan timestamps.",
          te: "సభ్యుడు జిమ్ నుండి వెళ్లే సమయాన్ని రికార్డ్ చేస్తుంది. మునుపటి స్కాన్ వివరాలు ఏవీ పోకుండా భద్రంగా ఉంటాయి.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Total Scans & Timestamps", te: "మొత్తం స్కాన్లు & సమయాలు" },
        meaning: {
          en: "Number of times member scanned today and array of all exact scan timestamps logged.",
          te: "సభ్యుడు ఈ రోజు ఎన్నిసార్లు QR స్కాన్ చేశాడో ఆ సంఖ్య మరియు ప్రతి స్కాన్ సమయం.",
        },
        example: { en: "2 Scans: 06:15 AM, 06:45 PM", te: "2 సార్లు: 06:15 AM, 06:45 PM" },
      },
      {
        field: { en: "Photo Match Score", te: "ఫోటో మ్యాచ్ స్కోర్" },
        meaning: {
          en: "Percentage match between the attendance camera snapshot and the registered profile photo.",
          te: "రిజిస్ట్రేషన్ సమయంలో ఉన్న ఫోటోతో ప్రస్తుతం కెమెరా తీసిన ఫోటో ఎంత శాతం సరిపోలిందో చూపే స్కోర్.",
        },
        example: { en: "98% Match (Verified)", te: "98% మ్యాచ్ (ధృవీకరించబడింది)" },
      },
    ],
    proTip: {
      en: "Members who forget their phone can still check in at the reception using the '+ Mark Attendance' button with a quick camera snap.",
      te: "మొబైల్ ఫోన్ తీసుకురాని సభ్యులకు రిసెప్షన్ వద్ద '+ Mark Attendance' నొక్కి తక్షణమే ఫోటోతో హాజరు వేయవచ్చు.",
    },
  },

  // 9. Membership Plans
  {
    id: "plans",
    category: "management",
    route: "/plans",
    icon: Layers,
    whoUses: {
      en: "Gym Owner, General Manager",
      te: "జిమ్ యజమాని, జనరల్ మేనేజర్",
    },
    simpleAnalogy: {
      en: "Think of Plans like the gym menu card — defines 1 month, 3 months, or annual packages with pricing and workout features.",
      te: "రెస్టారెంట్ మెనూ కార్డ్ లాంటిది — 1 నెల, 3 నెలలు, వార్షిక ప్లాన్లు, వాటి ఫీజులు మరియు కార్డియో సౌకర్యాలు నిర్ణయించే పేజీ.",
    },
    title: {
      en: "Membership Plans & Packages",
      te: "సభ్యత్వ ప్లాన్లు & ప్యాకేజీలు",
    },
    tagline: {
      en: "Configure subscription tiers: 1-month, quarterly, annual packages, pricing & workout entitlements",
      te: "నెలవారీ, 3 నెలలు, వార్షిక ప్యాకేజీలు, ధరలు మరియు జిమ్ సౌకర్యాల వివరాలు నిర్ణయించే పేజీ",
    },
    purpose: {
      en: "Configure the gym's official packages. When assigning a plan to any client in '/clients/[id]', the plans defined here automatically appear in the dropdown with pre-filled pricing and durations.",
      te: "జిమ్‌లో అందించే అధికారిక మెంబర్‌షిప్ ప్యాకేజీలను ఇక్కడ సెట్ చేస్తారు. ఇక్కడ క్రియేట్ చేసిన ప్లాన్లే క్లయింట్ పేజీలోని డ్రాప్‌డౌన్‌లో ఆటోమేటిక్‌గా కనిపిస్తాయి.",
    },
    overview: {
      en: [
        "Plan Cards Grid: Displaying plan name, duration in months, price in ₹, and included amenities.",
        "Add / Edit Plan Modal: Form to configure package name, duration, price, and description.",
        "Automatic Duration Calculation: Plans automatically drive start/end date calculations on client profiles.",
      ],
      te: [
        "ప్లాన్ కార్డులు: ప్లాన్ పేరు, వ్యవధి (నెలల్లో), ఫీజు మొత్తం మరియు అందుబాటులో ఉండే సౌకర్యాలు.",
        "కొత్త ప్లాన్ నమోదు: ప్లాన్ పేరు, ఎన్ని నెలలో, రేటు ఎంత అనే వివరాలు నమోదు చేసే విండో.",
        "ఆటోమేటిక్ గడువు లెక్కింపు: ఇక్కడ సెట్ చేసిన నెలల ప్రకారమే క్లయింట్‌కు ఎండ్ డేట్ ఆటోమేటిక్‌గా లెక్కించబడుతుంది.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add New Plan", te: "+ కొత్త ప్లాన్ జోడించు" },
        trigger: { en: "'+ Add Plan' Button", te: "'+ Add Plan' బటన్" },
        description: {
          en: "Creates a new membership package that immediately becomes selectable for all gym clients.",
          te: "కొత్త మెంబర్‌షిప్ ప్యాకేజీని తయారు చేస్తుంది. ఇది వెంటనే క్లయింట్ల డ్రాప్‌డౌన్‌లో కనిపిస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Duration (Months)", te: "వ్యవధి (నెలలలో)" },
        meaning: {
          en: "Number of full calendar months this package lasts. Used to automatically calculate membership expiry dates.",
          te: "ఈ ప్లాన్ ఎన్ని నెలల పాటు చెల్లుబాటు అవుతుందో తెలుపుతుంది. దీని ఆధారంగానే ఎక్స్‌పైరీ డేట్ వస్తుంది.",
        },
        example: { en: "12 Months (Annual)", te: "12 నెలలు (వార్షిక ప్లాన్)" },
      },
      {
        field: { en: "Base Price", te: "బేస్ ప్రైస్ (అసలు ధర)" },
        meaning: {
          en: "Standard package cost before any individual client discounts or installment splits.",
          te: "ఎలాంటి డిస్కౌంట్ ఇవ్వకముందు ప్లాన్ యొక్క ప్రామాణిక రుసుము.",
        },
        example: { en: "₹18,000", te: "₹18,000" },
      },
    ],
    proTip: {
      en: "Create 3-month and 6-month combo packages (Gym + Cardio + Steam) to increase average revenue per member by 30%.",
      te: "3 నెలలు, 6 నెలల కాంబో ప్లాన్లు (జిమ్ + కార్డియో + స్టీమ్ బాత్) పెట్టడం వల్ల జిమ్ ఆదాయం పెరుగుతుంది.",
    },
  },

  // 10. Products & Store
  {
    id: "products",
    category: "management",
    route: "/products",
    icon: Package,
    whoUses: {
      en: "Receptionist, Store Manager, Gym Owner",
      te: "రిసెప్షనిస్ట్, స్టోర్ మేనేజర్, జిమ్ ఓనర్",
    },
    simpleAnalogy: {
      en: "Think of Products like your gym's front-desk pro shop — tracks inventory and sales for whey proteins, BCAAs, shakers, and gym t-shirts.",
      te: "జిమ్ లోపల ఉండే ప్రోటీన్ సప్లిమెంట్ దుకాణం లాంటిది — ప్రోటీన్ డబ్బాలు, షేకర్లు, టీ-షర్టుల స్టాక్ మరియు అమ్మకాలను ట్రాక్ చేస్తుంది.",
    },
    title: {
      en: "Products & Supplements Store",
      te: "ప్రొడక్ట్స్ & సప్లిమెంట్స్ స్టోర్",
    },
    tagline: {
      en: "Manage gym front-desk supplement sales, fitness gear inventory & retail revenue",
      te: "ప్రోటీన్ సప్లిమెంట్లు, జిమ్ టీ-షర్టులు, షేకర్ల అమ్మకాలు మరియు స్టాక్ ఇన్వెంటరీ నిర్వహణ",
    },
    purpose: {
      en: "Point of Sale (POS) inventory tracker for selling supplements (Whey, Creatine, Pre-workout), water bottles, gym gloves, and branded merchandise.",
      te: "జిమ్‌లో అదనపు ఆదాయం కోసం అమ్మే వే-ప్రోటీన్, ప్రీ-వర్కౌట్, షేకర్ బాటిల్స్ మరియు జిమ్ గేర్ స్టాక్‌ను లెక్కించడానికి ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Product Grid: Product image, name, category, selling price, and real-time stock quantity.",
        "Add Product Modal: Upload product photo, cost price, selling price, and initial inventory units.",
        "Low Stock Indicators: Yellow/Red warning badges when inventory dips below 5 units.",
      ],
      te: [
        "ప్రొడక్ట్స్ గ్రిడ్: ఫోటో, పేరు, కేటగిరీ, అమ్మకపు ధర మరియు మిగిలి ఉన్న స్టాక్ సంఖ్య.",
        "కొత్త ప్రొడక్ట్ నమోదు: ఫోటో, కొనుగోలు ధర, అమ్మే ధర మరియు ఎన్ని పీస్‌లు ఉన్నాయో నమోదు చేసే విండో.",
        "తక్కువ స్టాక్ హెచ్చరిక: స్టాక్ 5 కంటే తగ్గితే పసుపు/ఎరుపు రంగు వార్నింగ్ బ్యాడ్జ్ కనిపిస్తుంది.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Product", te: "+ కొత్త ప్రొడక్ట్ జోడించు" },
        trigger: { en: "'+ Add Product' Button", te: "'+ Add Product' బటన్" },
        description: {
          en: "Registers a new supplement or merchandise item into the inventory with price and barcode details.",
          te: "కొత్త ప్రోటీన్ లేదా వస్తువును ధర మరియు స్టాక్ వివరాలతో ఇన్వెంటరీలో చేర్చుతుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Stock Count", te: "మిగిలిన స్టాక్ సంఖ్య" },
        meaning: {
          en: "Number of units currently in stock on the gym shelf.",
          te: "జిమ్ రిసెప్షన్‌లో ప్రస్తుతం అమ్మకానికి సిద్ధంగా ఉన్న డబ్బాలు లేదా వస్తువుల సంఖ్య.",
        },
        example: { en: "18 Units Available", te: "18 డబ్బాలు ఉన్నాయి" },
      },
      {
        field: { en: "Selling Price", te: "అమ్మకపు ధర (MRP/Sale)" },
        meaning: {
          en: "Price charged to the member when purchasing the product.",
          te: "సభ్యుడికి అమ్మే రేటు.",
        },
        example: { en: "₹4,500", te: "₹4,500" },
      },
    ],
    proTip: {
      en: "Keep popular items like Shaker Bottles and Pre-Workout energy drinks near the front desk for quick impulse sales.",
      te: "షేకర్ బాటిల్స్, ఎనర్జీ డ్రింక్స్ రిసెప్షన్ కౌంటర్ పైన ఉంచితే సభ్యులు త్వరగా కొనుగోలు చేస్తారు.",
    },
  },

  // 11. Employees
  {
    id: "employees",
    category: "staff_payroll",
    route: "/employees",
    icon: UserCheck,
    whoUses: {
      en: "Gym Owner, HR Manager",
      te: "జిమ్ యజమాని, HR మేనేజర్",
    },
    simpleAnalogy: {
      en: "Think of Employees like your staff service book — stores full legal details, Aadhaar numbers, photos, joining dates, and monthly salary terms.",
      te: "ఉద్యోగుల పూర్తి సర్వీస్ రికార్డు — ఆధార్ కార్డు, బ్యాంక్ అకౌంట్, చేరిన తేదీ మరియు నెలవారీ జీతం వివరాలు ఉంటాయి.",
    },
    title: {
      en: "Employees & Staff Directory",
      te: "ఉద్యోగులు & సిబ్బంది వివరాలు",
    },
    tagline: {
      en: "Master directory for gym employees, trainers, cleaners, base salaries & ID documents",
      te: "జిమ్ ట్రైనర్లు, క్లీనర్లు, రిసెప్షన్ సిబ్బంది వివరాలు, నెల జీతాలు మరియు గుర్తింపు పత్రాలు",
    },
    purpose: {
      en: "HR management page where gym employees (Floor Trainers, Cleaners, Maintenance Staff, Receptionists) are registered with their official monthly base pay and branch assignment.",
      te: "జిమ్‌లో పనిచేసే ఉద్యోగులందరినీ (ట్రైనర్లు, హౌస్‌కీపింగ్, రిసెప్షన్) వారి నెలవారీ మూల వేతనంతో నమోదు చేయడానికి ఉపయోగపడుతుంది. ఇది పేరోల్‌తో అనుసంధానించబడి ఉంటుంది.",
    },
    overview: {
      en: [
        "Employees Table: Photo, full name, role designation, mobile number, branch outlet, and base monthly pay.",
        "Add Employee Modal: Upload photo, enter salary, date of joining, emergency contact, and ID proof.",
        "Edit / Deactivate: Update staff compensation or archive former staff profiles.",
      ],
      te: [
        "ఉద్యోగుల పట్టిక: ఫోటో, పూర్తి పేరు, ఉద్యోగ హోదా, ఫోన్, బ్రాంచ్ మరియు నెల జీతం వివరాలు.",
        "కొత్త ఉద్యోగి నమోదు: ఫోటో, జీతం మొత్తం, చేరిన తేదీ, అత్యవసర ఫోన్ నంబర్ నమోదు చేసే ఫారమ్.",
        "సవరణ / తొలగింపు: జీతం పెంచినప్పుడు అప్‌డేట్ చేయడానికి లేదా మానేసిన వారిని తీసివేయడానికి.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Employee", te: "+ కొత్త ఉద్యోగిని చేర్చు" },
        trigger: { en: "'+ Add Employee' Button", te: "'+ Add Employee' బటన్" },
        description: {
          en: "Opens form to input employee profile, camera photo, salary structure, and branch location.",
          te: "ఉద్యోగి పేరు, కెమెరా ఫోటో, జీతం వివరాలు నమోదు చేసే విండో తెరుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Base Monthly Salary", te: "నెలవారీ మూల వేతనం" },
        meaning: {
          en: "Contracted regular monthly salary used by the Payroll module to generate salary vouchers.",
          te: "పేరోల్ పేజీలో ప్రతి నెలా ఆటోమేటిక్‌గా లెక్కించడానికి ఉపయోగపడే ఉద్యోగి ప్రాథమిక జీతం.",
        },
        example: { en: "₹25,000 / Month", te: "నెలకి ₹25,000" },
      },
    ],
    proTip: {
      en: "Capture both Front and Back photos of employee ID proof (Aadhaar or Driving License) during registration for gym security compliance.",
      te: "ఉద్యోగిని చేర్చుకునే సమయంలో వారి ఆధార్ కార్డు లేదా డ్రైవింగ్ లైసెన్స్ నంబర్ నమోదు చేయడం చట్టపరంగా భద్రతనిస్తుంది.",
    },
  },

  // 12. Staff Access & Roles
  {
    id: "staff",
    category: "staff_payroll",
    route: "/staff",
    icon: UserCog,
    whoUses: {
      en: "Gym Owner Only (Master Admin)",
      te: "జిమ్ యజమాని మాత్రమే (మాస్టర్ అడ్మిన్)",
    },
    simpleAnalogy: {
      en: "Think of Staff Access like giving physical keys to specific rooms — you can give a receptionist access to attendance without giving them access to your gym profit settings.",
      te: "జిమ్ తాళపు చెవులు ఇచ్చినట్లు — రిసెప్షనిస్ట్‌కి కేవలం హాజరు, క్లయింట్ పేజీలు మాత్రమే కనిపించేలా, రహస్య సెట్టింగ్స్ కనిపించకుండా లాక్ చేయవచ్చు.",
    },
    title: {
      en: "Staff Access & Security Roles",
      te: "అడ్మిన్ స్టాఫ్ & సెక్యూరిటీ రోల్స్",
    },
    tagline: {
      en: "Create admin software logins, passwords & assign page-level permissions for gym personnel",
      te: "సాఫ్ట్‌వేర్ లాగిన్ ఐడీలు, పాస్‌వర్డ్‌లు మరియు ఎవరెవరు ఏ పేజీలు చూడవచ్చో అనుమతులు ఇచ్చే పేజీ",
    },
    purpose: {
      en: "Security control panel. Allows the gym owner to create software login credentials (email & password) for employees and strictly toggle which pages each staff member can view or edit.",
      te: "సెక్యూరిటీ పేజీ. జిమ్ సిబ్బందికి సాఫ్ట్‌వేర్ లాగిన్ ఐడీ, పాస్‌వర్డ్‌లు తయారు చేయడానికి మరియు వారికి ఏ పేజీలు కనిపించాలో అనుమతులను ఆన్/ఆఫ్ చేయడానికి ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Staff Accounts List: Showing user avatar, name, email, security role (Admin vs Staff), and active status.",
        "Add Staff Modal: Create credentials with live camera photo and custom access permission checkboxes.",
        "Granular Page Toggles: Grant or revoke access to Clients, Attendance, Payroll, or System Settings individually.",
      ],
      te: [
        "ఖాతాల జాబితా: యూజర్ ఫోటో, పేరు, ఈమెయిల్, రోల్ (అడ్మిన్ లేదా స్టాఫ్) మరియు స్టేటస్.",
        "కొత్త లాగిన్ నమోదు: ఈమెయిల్, పాస్‌వర్డ్ మరియు ఏ పేజీలకు అనుమతి ఇవ్వాలో టిక్ మార్క్ చేసే ఫారమ్.",
        "ప్రత్యేక అనుమతులు: పేరోల్, సెట్టింగ్స్ లేదా క్లయింట్ వివరాలను ఎవరికి కనిపించాలో ఎవరికి కనిపించకూడదో నియంత్రించవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "+ Add Staff Login", te: "+ కొత్త స్టాఫ్ లాగిన్ క్రియేట్ చేయి" },
        trigger: { en: "'+ Add Staff' Button", te: "'+ Add Staff' బటన్" },
        description: {
          en: "Create a new portal login with dedicated email and toggleable permission checkboxes.",
          te: "సిబ్బందికి ప్రత్యేక ఈమెయిల్, పాస్‌వర్డ్ మరియు పేజీ అనుమతులతో కొత్త లాగిన్ తయారు చేస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Role (Admin vs Staff)", te: "రోల్ (అడ్మిన్ vs స్టాఫ్)" },
        meaning: {
          en: "Admin has full unrestricted power over all branches. Staff access is restricted only to checked pages.",
          te: "అడ్మిన్‌కి అన్ని అధికారాలు ఉంటాయి. స్టాఫ్‌కి మీరు టిక్ పెట్టిన పేజీలు మాత్రమే కనిపిస్తాయి.",
        },
        example: { en: "Role: Staff (Attendance + Clients Only)", te: "రోల్: స్టాఫ్ (హాజరు + క్లయింట్లు మాత్రమే)" },
      },
    ],
    proTip: {
      en: "Never share your Master Admin password. Always create separate Staff logins for receptionists so all audit actions are individually tracked.",
      te: "మీ మెయిన్ పాస్‌వర్డ్ ఎవరికీ ఇవ్వకండి. రిసెప్షన్ సిబ్బందికి విడిగా స్టాఫ్ ఖాతాలు ఇస్తే ఎవరు ఏ పని చేశారో ట్రాక్ చేయవచ్చు.",
    },
  },

  // 13. Payroll
  {
    id: "payroll",
    category: "staff_payroll",
    route: "/payroll",
    icon: BadgeIndianRupee,
    whoUses: {
      en: "Gym Owner, Accountant",
      te: "జిమ్ యజమాని, అకౌంటెంట్",
    },
    simpleAnalogy: {
      en: "Think of Payroll like your gym's salary register — automatically computes each trainer's base salary plus personal training bonuses minus leave deductions.",
      te: "శాలరీ రిజిస్టర్ బుక్ లాంటిది — ట్రైనర్ బేసిక్ జీతం, అదనంగా చేసిన పర్సనల్ ట్రైనింగ్ కమిషన్లు కలిపి, సెలవుల కటింగ్స్ తీసివేసి నికర జీతం లెక్క కడుతుంది.",
    },
    title: {
      en: "Staff Payroll & Salary Slips",
      te: "పేరోల్ & జీతాల రికార్డులు",
    },
    tagline: {
      en: "Process monthly employee salaries, incentives, personal training commissions & pay slip vouchers",
      te: "నెలవారీ జీతాలు, ట్రైనర్ కమిషన్లు, ఇన్సెంటివ్‌లు ప్రాసెస్ చేయడం మరియు శాలరీ స్లిప్స్ డౌన్‌లోడ్",
    },
    purpose: {
      en: "Disburse and track monthly compensation for all gym staff. Enables adding bonus incentives (e.g. PT commissions, sales targets) and recording payment modes (Cash, Bank Transfer, UPI).",
      te: "జిమ్ సిబ్బందికి ప్రతి నెలా జీతాలు లెక్కించడానికి, కమిషన్లు కలపడానికి, సెలవుల కోతలు తీసివేసి అధికారిక రసీదులు ఇవ్వడానికి ఇది ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Month & Year Selector: Jump between current and historical payroll cycles.",
        "Payroll Summary Cards: Total payroll budget, paid amount, pending salary payout.",
        "Staff Compensation Table: Employee name, base pay, incentives, deductions, net salary, and payment status.",
        "Download Pay Slip: Printable branded salary voucher with gym logo.",
      ],
      te: [
        "నెల & సంవత్సరం ఎంపిక: ప్రస్తుత లేదా గత నెలల జీతాల వివరాలు చూడటానికి.",
        "పేరోల్ సారాంశం: మొత్తం జీతాల బడ్జెట్, చెల్లించిన మొత్తం, ఇంకా చెల్లించాల్సిన మొత్తం.",
        "జీతాల పట్టిక: ఉద్యోగి పేరు, మూల వేతనం, ఇన్సెంటివ్‌లు, కోతలు, నికర జీతం మరియు చెల్లింపు స్థితి.",
        "శాలరీ స్లిప్ డౌన్‌లోడ్: జిమ్ లోగోతో కూడిన అధికారిక పే స్లిప్ ప్రింట్ తీసుకునే వీలు.",
      ],
    },
    actions: [
      {
        name: { en: "Process Salary Payment", te: "జీతం చెల్లించు (Process Payment)" },
        trigger: { en: "'Pay Salary' / Checkmark Action", te: "'Pay Salary' బటన్" },
        description: {
          en: "Records the payout date, payment mode (Bank Transfer / Cash), and marks salary as 'Paid'.",
          te: "జీతం ఇచ్చిన తేదీ, పేమెంట్ మోడ్ నమోదు చేసి స్టేటస్‌ను 'Paid' గా మారుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Incentives / Bonuses", te: "ఇన్సెంటివ్‌లు & కమిషన్లు" },
        meaning: {
          en: "Additional earnings such as Personal Training commissions or member signup bonuses.",
          te: "పర్సనల్ ట్రైనింగ్ క్లయింట్ల ద్వారా లేదా ఎక్కువ అడ్మిషన్లు చేసినందుకు ఇచ్చే అదనపు బోనస్.",
        },
        example: { en: "+ ₹3,500 PT Commission", te: "+ ₹3,500 PT కమిషన్" },
      },
      {
        field: { en: "Net Salary", te: "నికర జీతం (Net Salary)" },
        meaning: {
          en: "Base Salary plus Incentives minus any Deductions. This is the exact amount transferred to the employee.",
          te: "బేస్ శాలరీ + బోనస్ - కోతలు తీసివేయగా ఉద్యోగి చేతికి ఇచ్చే అసలు మొత్తం.",
        },
        example: { en: "₹28,500", te: "₹28,500" },
      },
    ],
    proTip: {
      en: "Always download and store digital PDF salary slips for audit and transparent staff relationships.",
      te: "ప్రతి నెలా జీతం ఇచ్చిన వెంటనే శాలరీ స్లిప్ డౌన్‌లోడ్ చేసి ఉద్యోగి వాట్సాప్‌కు పంపితే పారదర్శకత ఉంటుంది.",
    },
  },

  // 14. Support & Contact
  {
    id: "support",
    category: "system",
    route: "/support",
    icon: HelpCircle,
    whoUses: {
      en: "All Gym Staff & Owners",
      te: "అందరు సిబ్బంది మరియు యాజమాన్యం",
    },
    simpleAnalogy: {
      en: "Think of this page like your software emergency helpline — directly connect with the software developers for training, bugs, or custom feature requests.",
      te: "సాఫ్ట్‌వేర్ హెల్ప్‌లైన్ లాంటిది — సాఫ్ట్‌వేర్ డెవలపర్లతో నేరుగా మాట్లాడి సమస్యలు పరిష్కరించుకోవడానికి ఉపయోగపడుతుంది.",
    },
    title: {
      en: "Support & Developer Contact",
      te: "టెక్నికల్ సపోర్ట్ & సహాయం",
    },
    tagline: {
      en: "Direct communication channel with GamaNext software engineering team for assistance & feature requests",
      te: "సాంకేతిక సహాయం, సందేహాలు మరియు కొత్త ఫీచర్ల కోసం డెవలపర్లతో నేరుగా మాట్లాడే పేజీ",
    },
    purpose: {
      en: "Provides dedicated developer contact numbers, WhatsApp support links, and ticketing channels to resolve software queries, camera permissions, or request new gym features.",
      te: "సాఫ్ట్‌వేర్ వాడుతున్నప్పుడు ఏమైనా సందేహాలు వచ్చినా, కెమెరా పని చేయకపోయినా డెవలపర్లతో మాట్లాడి వెంటనే పరిష్కరించుకోవడానికి ఈ పేజీ ఉపయోగపడుతుంది.",
    },
    overview: {
      en: [
        "Direct Phone & WhatsApp Support Links.",
        "System Version & Build Information.",
        "Emergency Technical Hotline for attendance hardware.",
      ],
      te: [
        "డైరెక్ట్ ఫోన్ కాల్ & వాట్సాప్ సపోర్ట్ లింకులు.",
        "సాఫ్ట్‌వేర్ వెర్షన్ మరియు సర్వర్ వివరాలు.",
        "హాజరు మరియు కెమెరా అత్యవసర సహాయ నంబర్లు.",
      ],
    },
    actions: [
      {
        name: { en: "Open WhatsApp Support", te: "వాట్సాప్ సపోర్ట్ తెరువు" },
        trigger: { en: "'Chat on WhatsApp' Button", te: "'Chat on WhatsApp' బటన్" },
        description: {
          en: "Launches instant WhatsApp conversation with the Brother's Fitness software engineering lead.",
          te: "సాఫ్ట్‌వేర్ ఇంజనీరింగ్ టీమ్‌తో తక్షణమే వాట్సాప్ చాట్ ప్రారంభించే విండో తెరుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Support Hours", te: "సహాయం లభించే సమయాలు" },
        meaning: {
          en: "Active hours during which developer team responds to urgent queries (Mon-Sat 9 AM - 8 PM IST).",
          te: "డెవలపర్ టీమ్ లైవ్‌లో అందుబాటులో ఉండే సమయాలు (సోమ-శని ఉదయం 9 నుండి రాత్రి 8 వరకు).",
        },
      },
    ],
    proTip: {
      en: "If reporting a camera issue, take a screenshot of your screen before clicking WhatsApp support to speed up resolution.",
      te: "కెమెరా లేదా స్కానర్ సమస్య వచ్చినప్పుడు స్క్రీన్‌షాట్ తీసి వాట్సాప్‌లో పంపితే డెవలపర్లు వెంటనే పరిష్కరిస్తారు.",
    },
  },

  // 15. System Settings
  {
    id: "settings",
    category: "system",
    route: "/settings",
    icon: Settings,
    whoUses: {
      en: "Gym Owner Only",
      te: "జిమ్ యజమాని మాత్రమే",
    },
    simpleAnalogy: {
      en: "Think of Settings like your gym's control room — set your official gym logo, billing terms, tax GST rates, and dark/light display mode.",
      te: "జిమ్ కంట్రోల్ రూమ్ లాంటిది — మీ జిమ్ లోగో, రసీదులపై ప్రింట్ అయ్యే నిబంధనలు మరియు స్క్రీన్ డార్క్ మోడ్ సెట్ చేసుకోవచ్చు.",
    },
    title: {
      en: "System Settings & Configuration",
      te: "సిస్టమ్ సెట్టింగ్స్ & కాన్ఫిగరేషన్",
    },
    tagline: {
      en: "Gym branding, official tax numbers, receipt disclaimers, theme preferences & security backups",
      te: "జిమ్ లోగో, రసీదులపై నిబంధనలు, థీమ్ రంగులు మరియు సిస్టమ్ భద్రతా సెట్టింగ్స్",
    },
    purpose: {
      en: "Global configuration panel. Change gym official brand name, logo, contact information, receipt footer terms & conditions, currency formats, and visual theme mode.",
      te: "మొత్తం సాఫ్ట్‌వేర్ యొక్క ప్రధాన సెట్టింగ్స్ పేజీ. జిమ్ పేరు, లోగో, రసీదులపై కనిపించే నియమ నిబంధనలు మరియు థీమ్ సెట్ చేసుకోవచ్చు.",
    },
    overview: {
      en: [
        "Gym Branding Section: Upload gym high-res logo and configure official legal business name.",
        "Receipt Terms & Conditions: Customize disclaimer printed on member receipts (e.g., 'Fees once paid are non-refundable').",
        "Display Preferences: Switch between Dark Mode (Gym aesthetic) and Light Mode.",
      ],
      te: [
        "జిమ్ బ్రాండింగ్: జిమ్ అఫీషియల్ లోగో అప్‌లోడ్ చేయడం మరియు రిజిస్టర్డ్ వ్యాపార పేరు మార్చడం.",
        "రసీదు నిబంధనలు: ఫీజు రసీదుల కింద కనిపించే సూచనలు (ఉదా: 'ఫీజు వాపసు చేయబడదు').",
        "డిస్‌ప్లే థీమ్: డార్క్ మోడ్ (బ్లాక్ & గోల్డ్) లేదా లైట్ మోడ్ ఎంచుకోవచ్చు.",
      ],
    },
    actions: [
      {
        name: { en: "Save Settings", te: "సెట్టింగ్స్ భద్రపరచు" },
        trigger: { en: "'Save All Changes' Button", te: "'Save All Changes' బటన్" },
        description: {
          en: "Commits updated branding and terms to the cloud database across all devices.",
          te: "మార్చిన వివరాలను క్లౌడ్ డేటాబేస్‌కు భద్రపరుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "Receipt Disclaimer", te: "రసీదు నిబంధనల టెక్స్ట్" },
        meaning: {
          en: "Standard legal wording automatically printed at the bottom of all generated member receipts.",
          te: "సభ్యులకు ఇచ్చే ప్రతి రసీదు కింద ప్రింట్ అయ్యే చట్టపరమైన నిబంధనలు.",
        },
        example: { en: "Fees once paid are strictly non-refundable and non-transferable.", te: "చెల్లించిన ఫీజు ఎట్టి పరిస్థితుల్లోనూ వాపసు చేయబడదు." },
      },
    ],
    proTip: {
      en: "Always include emergency gym desk contact numbers in your receipt disclaimer text for smooth member communication.",
      te: "రసీదు నిబంధనల కింద జిమ్ అత్యవసర ఫోన్ నంబర్‌ను ఉంచడం వల్ల సభ్యులకు అవసరమైనప్పుడు సంప్రదించగలుగుతారు.",
    },
  },

  // 16. Client Mobile Web Portal
  {
    id: "client-app",
    category: "system",
    route: "/scan & /attendance",
    icon: Smartphone,
    whoUses: {
      en: "All Gym Members (Clients)",
      te: "జిమ్ సభ్యులందరూ (క్లయింట్లు)",
    },
    simpleAnalogy: {
      en: "Think of the Client Portal like a digital gym identity card in the member's phone — they open it to scan the reception QR code and see their workout streaks.",
      te: "సభ్యుని మొబైల్‌లో ఉండే డిజిటల్ జిమ్ ఐడీ కార్డు లాంటిది — జిమ్‌కి వచ్చినప్పుడు QR స్కాన్ చేసి హాజరు వేసుకోవచ్చు.",
    },
    title: {
      en: "Client Mobile Web App (/scan, /attendance)",
      te: "సభ్యుల మొబైల్ వెబ్ పోర్టల్ (/scan & /attendance)",
    },
    tagline: {
      en: "Member self-service: Instant back-camera QR scanning, multi-scan timeline & attendance calendar",
      te: "సభ్యుల సెల్ఫ్-సర్వీస్: వేగవంతమైన బ్యాక్ కెమెరా QR స్కానింగ్, నేటి స్కాన్ల వివరాలు మరియు హాజరు క్యాలెండర్",
    },
    purpose: {
      en: "The dedicated mobile web portal designed for gym members. Members log in with their Phone & MPIN to scan the gym reception QR code with instantaneous back-camera detection and view their workout logs.",
      te: "సభ్యులు తమ మొబైల్‌లో ఉపయోగించే ప్రత్యేక వెబ్ పోర్టల్. ఫోన్ & MPIN తో లాగిన్ అయి, బ్యాక్ కెమెరా ద్వారా జిమ్ QR కోడ్‌ను స్కాన్ చేసి హాజరు వేసుకుంటారు.",
    },
    overview: {
      en: [
        "Ultra-Fast Back Camera Scanner: Opens back camera by default with lag-free hardware lock release and instant front flip toggle.",
        "Scan Success Confirmation: Modal displays total scans recorded today and every individual timestamp (#1, #2, #3...).",
        "Today's Activity Timeline: Shows exact check-in times and station locations throughout the day.",
        "Monthly Attendance Calendar: Visual workout streak tracker showing present vs missed gym days.",
      ],
      te: [
        "వేగవంతమైన బ్యాక్ కెమెరా స్కానర్: ఆటోమేటిక్‌గా వెనుక కెమెరాతో ఓపెన్ అవుతుంది. అవసరమైతే ఫ్రంట్ కెమెరాకు మారే వీలు.",
        "విజయవంతమైన హాజరు పాపప్: ఈ రోజు ఎన్నిసార్లు స్కాన్ చేశారో, ఏ సమయాల్లో చేశారో (#1, #2, #3...) క్లియర్‌గా చూపిస్తుంది.",
        "నేటి కార్యకలాపాల టైమ్‌లైన్: ఉదయం, సాయంత్రం వచ్చిన సమయాల పూర్తి జాబితా.",
        "నెలవారీ హాజరు క్యాలెండర్: ఈ నెలలో ఎన్ని రోజులు జిమ్‌కి వచ్చారో చూపే క్యాలెండర్.",
      ],
    },
    actions: [
      {
        name: { en: "Scan QR Code", te: "QR కోడ్ స్కాన్ చేయి" },
        trigger: { en: "'Scan QR Code' Button", te: "'Scan QR Code' బటన్" },
        description: {
          en: "Starts the high-speed camera viewfinder. Automatically focuses on the reception QR code.",
          te: "కెమెరాను తెరుస్తుంది. రిసెప్షన్ వద్ద ఉన్న QR కోడ్‌ను వెంటనే స్కాన్ చేస్తుంది.",
        },
      },
      {
        name: { en: "Switch Camera (Back/Front)", te: "కెమెరా మార్చు (బ్యాక్/ఫ్రంట్)" },
        trigger: { en: "'Switch Camera' Button", te: "'Switch Camera' బటన్" },
        description: {
          en: "Instantly flips between Back and Front camera smoothly with zero device lag or lock freeze.",
          te: "ఎలాంటి ల్యాగ్ లేకుండా వెనుక కెమెరా నుండి ముందు కెమెరాకు తక్షణమే మారుస్తుంది.",
        },
      },
    ],
    fields: [
      {
        field: { en: "All Today's Scan Timestamps", te: "నేటి అన్ని స్కాన్ల సమయాలు" },
        meaning: {
          en: "Chronological list of every scan recorded today (e.g. #1: 06:15 AM at Reception, #2: 06:45 PM at Main Gate).",
          te: "ఈ రోజు ఎన్నిసార్లు స్కాన్ చేశారో ఆ సమయాలు మరియు స్టేషన్ పేర్ల పూర్తి జాబితా.",
        },
        example: { en: "#1: 06:15 AM, #2: 06:45 PM", te: "#1: 06:15 AM, #2: 06:45 PM" },
      },
    ],
    proTip: {
      en: "On iPhone Safari, tap 'Share' -> 'Add to Home Screen' so the gym attendance icon sits right on the member's phone wallpaper just like a native app!",
      te: "ఐఫోన్ లేదా ఆండ్రాయిడ్ ఫోన్‌లో 'Add to Home Screen' నొక్కితే సాధారణ యాప్ లాగే ఫోన్ స్క్రీన్‌పై యాప్ ఐకాన్ వస్తుంది!",
    },
  },
];

export default function HelpPage() {
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<ViewTab>("guide");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    dashboard: true,
    clients: true,
    "client-attendance": true,
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    HELP_DATA.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setExpandedItems(allExpanded);
  };

  const collapseAll = () => {
    setExpandedItems({});
  };

  const filteredItems = useMemo(() => {
    return HELP_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle =
        item.title.en.toLowerCase().includes(q) ||
        item.title.te.toLowerCase().includes(q);
      const matchPurpose =
        item.purpose.en.toLowerCase().includes(q) ||
        item.purpose.te.toLowerCase().includes(q);
      const matchRoute = item.route.toLowerCase().includes(q);
      const matchActions = item.actions.some(
        (a) =>
          a.name.en.toLowerCase().includes(q) ||
          a.name.te.toLowerCase().includes(q) ||
          a.description.en.toLowerCase().includes(q) ||
          a.description.te.toLowerCase().includes(q)
      );
      const matchFields = item.fields.some(
        (f) =>
          f.field.en.toLowerCase().includes(q) ||
          f.field.te.toLowerCase().includes(q) ||
          f.meaning.en.toLowerCase().includes(q) ||
          f.meaning.te.toLowerCase().includes(q)
      );

      return matchTitle || matchPurpose || matchRoute || matchActions || matchFields;
    });
  }, [selectedCategory, searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(
      (faq) =>
        faq.question.en.toLowerCase().includes(q) ||
        faq.question.te.toLowerCase().includes(q) ||
        faq.answer.en.toLowerCase().includes(q) ||
        faq.answer.te.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <PageContainer
      title={lang === "en" ? "Help & Documentation" : "సహాయం మరియు శిక్షణ మార్గదర్శి"}
      subtitle={lang === "en" ? "Comprehensive gym operations and training guide" : "జిమ్ నిర్వహణ మరియు సిబ్బంది శిక్షణ మార్గదర్శి"}
    >
      {/* 1. INTERACTIVE SCREEN VIEW (HIDDEN IN PRINT) */}
      <div className="space-y-5 print:hidden">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {lang === "en"
                  ? "Brother's Fitness Master Operations Guide"
                  : "Brother's Fitness పూర్తి నిర్వహణ & వినియోగ మార్గదర్శి"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === "en" ? "Software Help & Training Center" : "సాఫ్ట్‌వేర్ హెల్ప్ & ట్రైనింగ్ సెంటర్"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {lang === "en"
                ? "Crystal-clear, beginner-friendly instructions explaining every screen, button, action, formula, and daily operational workflow in simple words."
                : "ప్రతి పేజీ, బటన్, ఫీల్డ్ మరియు రోజువారీ పనులు ఎలా చేయాలో ఎవరికైనా సులభంగా అర్థమయ్యేలా స్పష్టమైన వివరణలు."}
            </p>
          </div>

          {/* Controls: Language Switcher & Print Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Language Toggle */}
            <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  lang === "en"
                    ? "bg-amber-400 text-black shadow-md"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("te")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  lang === "te"
                    ? "bg-amber-400 text-black shadow-md"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                తెలుగు (Telugu)
              </button>
            </div>

            {/* Print Friendly Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-400/50 hover:text-white transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === "en" ? "Print Manual" : "ప్రింట్ చేయి"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs: Full Guide vs Quick Recipes vs FAQ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "guide"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{lang === "en" ? "All 16 Page Guides" : "అన్ని 16 పేజీల పూర్తి వివరణ"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "recipes"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{lang === "en" ? "Daily Step-by-Step Recipes" : "రోజువారీ శీఘ్ర మార్గదర్శకాలు (6 Steps)"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "faq"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === "en" ? "Troubleshooting & FAQ" : "సందేహాలు & పరిష్కారాలు (FAQ)"}</span>
          </button>
        </div>

        {activeTab === "guide" && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              {lang === "en" ? "Expand All" : "అన్నీ తెరువు"}
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold hover:underline"
            >
              {lang === "en" ? "Collapse All" : "అన్నీ మూసివేయి"}
            </button>
          </div>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === "en"
              ? "Search by page name, button, field name (e.g., 'QR code', 'installments', 'camera', 'MPIN')..."
              : "పేజీ పేరు, బటన్, ఫీల్డ్ లేదా సమస్య శోధించండి (ఉదా: 'QR కోడ్', 'కెమెరా', 'ఫీజు', 'MPIN')..."
          }
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* VIEW TAB 2: STEP-BY-STEP RECIPES */}
      {activeTab === "recipes" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                {lang === "en"
                  ? "Standard Operating Procedures (SOP) for Gym Staff"
                  : "జిమ్ సిబ్బంది కోసం రోజువారీ ఖచ్చితమైన విధివిధానాలు (SOP)"}
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                {lang === "en"
                  ? "Follow these step-by-step sequences for seamless daily reception operations with zero confusion."
                  : "ఈ దశలను యథాతథంగా పాటిస్తే కొత్త రిసెప్షనిస్ట్ లేదా సిబ్బంది కూడా ఏ తప్పూ లేకుండా పని చేయగలరు."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {recipe.title[lang]}
                  </h4>
                </div>

                <div className="space-y-2">
                  {recipe.steps.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <p className="leading-relaxed">{st[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 3: FAQ & TROUBLESHOOTING */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
                {lang === "en"
                  ? "Frequently Asked Questions & Problem Solving"
                  : "తరచుగా వచ్చే సందేహాలు & తక్షణ పరిష్కారాలు"}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                {lang === "en"
                  ? "Clear answers to everyday scenarios like camera permissions, distance limits, split payments, and password resets."
                  : "కెమెరా తెరచుకోకపోవడం, దూరం ఎర్రర్, ఎంపిన్ మర్చిపోవడం లాంటి సాధారణ సమస్యలకు ఇక్కడే పరిష్కారం లభిస్తుంది."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    Q
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {faq.question[lang]}
                  </h4>
                </div>
                <div className="flex items-start gap-2.5 pl-7">
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {faq.answer[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 1: FULL 16 PAGE GUIDE */}
      {activeTab === "guide" && (
        <>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-400 text-black shadow-xs font-bold"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {cat.label[lang]}
              </button>
            ))}
          </div>

          {/* Module Cards Accordion List */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center space-y-2">
                <Info className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {lang === "en" ? "No documentation found matching your search." : "మీ శోధనకు తగిన సమాచారం దొరకలేదు."}
                </p>
                <p className="text-xs text-zinc-400">
                  {lang === "en" ? "Try searching with a different term." : "వేరే పదంతో వెతకండి."}
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = !!expandedItems[item.id];
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    id={item.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all shadow-xs hover:border-amber-400/50 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="flex cursor-pointer items-start justify-between gap-4 p-4 sm:p-5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500 border border-amber-400/20">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                              #{idx + 1}
                            </span>
                            <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                              {item.title[lang]}
                            </h3>
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {item.route}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {item.tagline[lang]}
                          </p>
                          <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                            <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold">
                              <Users className="h-3 w-3" />
                              {item.whoUses[lang]}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Body */}
                    {isExpanded && (
                      <div className="border-t border-zinc-100 p-4 sm:p-6 space-y-6 bg-zinc-50/30 dark:border-zinc-800/70 dark:bg-zinc-950/20">
                        {/* Simple Analogy Box */}
                        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-2.5">
                          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                              {lang === "en" ? "Simple Everyday Analogy" : "సులభమైన ఉదాహరణ"}
                            </span>
                            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                              {item.simpleAnalogy[lang]}
                            </p>
                          </div>
                        </div>

                        {/* 1. Core Purpose */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                            <Info className="h-4 w-4 text-amber-500" />
                            <span>{lang === "en" ? "Why this page exists (Purpose)" : "ఈ పేజీ దేనికి ఉపయోగపడుతుంది?"}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-6">
                            {item.purpose[lang]}
                          </p>
                        </div>

                        {/* 2. Key Screen Elements / Overview */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>{lang === "en" ? "What you see on this screen" : "స్క్రీన్‌పై కనిపించే ప్రధాన అంశాలు"}</span>
                          </div>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                            {item.overview[lang].map((point, pIdx) => (
                              <li
                                key={pIdx}
                                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Step-by-Step How-To Sequences if any */}
                        {item.howToSteps && item.howToSteps.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                              <ArrowRight className="h-4 w-4 text-amber-500" />
                              <span>{lang === "en" ? "Step-by-Step How-To Routine" : "దశలవారీగా చేయాల్సిన విధానం"}</span>
                            </div>
                            <div className="pl-6 space-y-3">
                              {item.howToSteps.map((seq, seqIdx) => (
                                <div
                                  key={seqIdx}
                                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                                >
                                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                    {seq.title[lang]}
                                  </h4>
                                  <div className="space-y-1.5">
                                    {seq.steps.map((st, stIdx) => (
                                      <p key={stIdx} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {st[lang]}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Actions, Buttons & Modals */}
                        {item.actions.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              <span>{lang === "en" ? "Buttons, Modals & Actions" : "బటన్లు, మోడల్స్ మరియు చర్యలు"}</span>
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

                        {/* 5. Field & Value Reference Table */}
                        {item.fields.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                              <Layers className="h-4 w-4 text-amber-500" />
                              <span>
                                {lang === "en"
                                  ? "Field References: What does each number/value mean?"
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

                        {/* 6. Common Mistakes to Avoid */}
                        {item.commonMistakes && item.commonMistakes.length > 0 && (
                          <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20 flex items-start gap-2.5">
                            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                                {lang === "en" ? "Common Mistake to Avoid" : "చేయకూడని తప్పు"}
                              </span>
                              <div className="space-y-1">
                                {item.commonMistakes.map((m, mIdx) => (
                                  <p key={mIdx} className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                                    {m[lang]}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 7. Pro-Tip Alert Box */}
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
        </>
      )}

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
      </div>

      {/* 2. DEDICATED OFFICIAL OPERATIONS MANUAL (ONLY VISIBLE IN PRINT / PDF) */}
      <div className="hidden print:block print:w-full print:bg-white text-zinc-950 font-sans space-y-8">
        {/* Cover / Header */}
        <div className="border-b-2 border-black pb-5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-black">
                Brother&apos;s Fitness Gym Software
              </h1>
              <h2 className="text-base font-bold text-zinc-800">
                {lang === "en"
                  ? "Standard Operating Procedures & Official Operations Manual"
                  : "అధికారిక నిర్వహణ విధివిధానాలు & సిబ్బంది శిక్షణ మార్గదర్శి"}
              </h2>
            </div>
            <div className="text-right text-xs text-zinc-600 font-mono">
              <p className="font-bold text-black">{lang === "en" ? "Language: English" : "భాష: తెలుగు"}</p>
              <p>System Version: 2.4</p>
              <p>Issued: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed italic">
            {lang === "en"
              ? "Official operational documentation for gym owners, receptionists, floor managers, and trainers. Covers all system modules, daily workflows, security attendance rules, and financial procedures."
              : "జిమ్ యజమానులు, రిసెప్షనిస్టులు, ఫ్లోర్ మేనేజర్లు మరియు ట్రైనర్ల కోసం అధికారిక మార్గదర్శి. అన్ని సిస్టమ్ విభాగాలు, రోజువారీ పనులు, హాజరు భద్రతా నియమాలు మరియు ఫీజు విధానాలు ఇందులో వివరించబడ్డాయి."}
          </p>
        </div>

        {/* Part 1: Quick Standard Operating Procedures (SOPs) */}
        <div className="space-y-4 break-inside-avoid">
          <div className="border-b border-zinc-400 pb-1">
            <h3 className="text-base font-black uppercase tracking-wider text-black">
              {lang === "en"
                ? "Part 1: Daily Standard Operating Procedures (SOPs)"
                : "విభాగం 1: రోజువారీ పనుల నిర్వహణ విధానం (SOPs)"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_RECIPES.map((recipe, rIdx) => (
              <div key={rIdx} className="border border-zinc-400 p-3.5 rounded-lg space-y-2 break-inside-avoid bg-zinc-50/50">
                <h4 className="font-bold text-xs text-black border-b border-zinc-300 pb-1">
                  {recipe.title[lang]}
                </h4>
                <div className="space-y-1.5 text-[11px] text-zinc-800">
                  {recipe.steps.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5">
                      <span className="font-bold text-black shrink-0">{sIdx + 1}.</span>
                      <p className="leading-snug">{st[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Complete 16 System Modules & Pages Reference */}
        <div className="space-y-6">
          <div className="border-b border-zinc-400 pb-1">
            <h3 className="text-base font-black uppercase tracking-wider text-black">
              {lang === "en"
                ? "Part 2: Complete System Modules & Pages Reference"
                : "విభాగం 2: అన్ని 16 పేజీల పూర్తి వివరణలు"}
            </h3>
          </div>

          <div className="space-y-6">
            {HELP_DATA.map((item, idx) => (
              <div
                key={item.id}
                className="border border-zinc-400 p-4 rounded-lg space-y-3.5 break-inside-avoid bg-white"
              >
                {/* Module Title & Meta */}
                <div className="flex items-start justify-between border-b border-zinc-300 pb-2">
                  <div>
                    <h4 className="text-sm font-black text-black">
                      #{idx + 1}. {item.title[lang]}
                    </h4>
                    <p className="text-[11px] text-zinc-600 font-mono">
                      Route: {item.route} | Users: {item.whoUses[lang]}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase border border-zinc-400 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>

                {/* Analogy & Purpose */}
                <div className="space-y-1.5 text-xs">
                  <div className="bg-zinc-100 p-2 rounded border-l-2 border-zinc-800 text-zinc-800 text-[11px]">
                    <span className="font-bold block text-black">
                      {lang === "en" ? "Everyday Concept:" : "సులభమైన ఉదాహరణ:"}
                    </span>
                    {item.simpleAnalogy[lang]}
                  </div>
                  <p className="text-zinc-800 leading-relaxed text-[11px]">
                    <strong className="text-black">{lang === "en" ? "Purpose: " : "ఉద్దేశం: "}</strong>
                    {item.purpose[lang]}
                  </p>
                </div>

                {/* Screen Overview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">
                    {lang === "en" ? "What you see on this screen:" : "స్క్రీన్‌పై కనిపించే అంశాలు:"}
                  </span>
                  <ul className="list-disc pl-4 text-[11px] text-zinc-800 space-y-0.5">
                    {item.overview[lang].map((p, pIdx) => (
                      <li key={pIdx} className="leading-snug">{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Step-by-Step How To if any */}
                {item.howToSteps && item.howToSteps.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">
                      {lang === "en" ? "Step-by-Step Procedure:" : "చేయాల్సిన క్రమం:"}
                    </span>
                    {item.howToSteps.map((seq, seqIdx) => (
                      <div key={seqIdx} className="bg-zinc-50 border border-zinc-200 p-2 rounded text-[11px] space-y-1">
                        <p className="font-bold text-black">{seq.title[lang]}</p>
                        {seq.steps.map((st, stIdx) => (
                          <p key={stIdx} className="text-zinc-700 leading-snug">{st[lang]}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions & Buttons */}
                {item.actions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">
                      {lang === "en" ? "Buttons & Actions:" : "బటన్లు & విధులు:"}
                    </span>
                    <div className="border border-zinc-300 rounded overflow-hidden">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-zinc-100 border-b border-zinc-300 font-bold">
                          <tr>
                            <th className="p-1.5 w-1/4">{lang === "en" ? "Action Name" : "బటన్ / చర్య"}</th>
                            <th className="p-1.5 w-1/4">{lang === "en" ? "Trigger" : "ఎక్కడ ఉంటుంది"}</th>
                            <th className="p-1.5">{lang === "en" ? "Description" : "వివరణ"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {item.actions.map((act, actIdx) => (
                            <tr key={actIdx}>
                              <td className="p-1.5 font-bold">{act.name[lang]}</td>
                              <td className="p-1.5 font-mono text-zinc-600">{act.trigger[lang]}</td>
                              <td className="p-1.5 text-zinc-700">{act.description[lang]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fields Table */}
                {item.fields.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">
                      {lang === "en" ? "Field Dictionary & Values:" : "ఫీల్డ్ వివరణలు & లెక్కలు:"}
                    </span>
                    <div className="border border-zinc-300 rounded overflow-hidden">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-zinc-100 border-b border-zinc-300 font-bold">
                          <tr>
                            <th className="p-1.5 w-1/4">{lang === "en" ? "Field Name" : "ఫీల్డ్ పేరు"}</th>
                            <th className="p-1.5 w-1/2">{lang === "en" ? "Meaning & Calculation" : "వివరణ & సూత్రం"}</th>
                            <th className="p-1.5">{lang === "en" ? "Example" : "ఉదాహరణ"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {item.fields.map((fld, fldIdx) => (
                            <tr key={fldIdx}>
                              <td className="p-1.5 font-bold">{fld.field[lang]}</td>
                              <td className="p-1.5 text-zinc-700">{fld.meaning[lang]}</td>
                              <td className="p-1.5 font-mono font-medium text-zinc-800">{fld.example ? fld.example[lang] : "--"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pro Tip */}
                {item.proTip && (
                  <div className="text-[10px] bg-zinc-100 p-2 rounded border border-zinc-300 text-zinc-800">
                    <strong className="text-black">{lang === "en" ? "Pro Tip: " : "చిట్కా: "}</strong>
                    {item.proTip[lang]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Part 3: Troubleshooting & FAQ */}
        <div className="space-y-4 break-inside-avoid">
          <div className="border-b border-zinc-400 pb-1">
            <h3 className="text-base font-black uppercase tracking-wider text-black">
              {lang === "en"
                ? "Part 3: Troubleshooting & Frequently Asked Questions (FAQ)"
                : "విభాగం 3: సాధారణ సమస్యలు & తరచుగా వచ్చే సందేహాలు (FAQ)"}
            </h3>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, fIdx) => (
              <div key={fIdx} className="border border-zinc-300 p-3 rounded-lg text-xs space-y-1 break-inside-avoid bg-zinc-50/50">
                <p className="font-bold text-black">Q{fIdx + 1}: {faq.question[lang]}</p>
                <p className="text-zinc-700 text-[11px] leading-relaxed">A: {faq.answer[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Sign-Off Footer */}
        <div className="border-t-2 border-black pt-4 break-inside-avoid space-y-3 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-black">
            {lang === "en" ? "Gym Staff Operations Sign-Off" : "జిమ్ సిబ్బంది ధృవీకరణ & సంతకాలు"}
          </h4>
          <div className="grid grid-cols-3 gap-6 pt-2 text-[11px] text-zinc-700">
            <div className="border-t border-zinc-400 pt-1">
              <p className="font-bold text-black">{lang === "en" ? "Employee / Trainee Name" : "సిబ్బంది / ఉద్యోగి పేరు"}</p>
              <p className="text-zinc-500 mt-4">{lang === "en" ? "Signature: __________________" : "సంతకం: __________________"}</p>
            </div>
            <div className="border-t border-zinc-400 pt-1">
              <p className="font-bold text-black">{lang === "en" ? "Gym Branch / Outlet" : "జిమ్ బ్రాంచ్ పేరు"}</p>
              <p className="text-zinc-500 mt-4">{lang === "en" ? "Date: ________________________" : "తేదీ: ________________________"}</p>
            </div>
            <div className="border-t border-zinc-400 pt-1">
              <p className="font-bold text-black">{lang === "en" ? "Manager / Owner Approval" : "మేనేజర్ / యజమాని ఆమోదం"}</p>
              <p className="text-zinc-500 mt-4">{lang === "en" ? "Signature: __________________" : "సంతకం: __________________"}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-500 pt-3 border-t border-zinc-200">
            {lang === "en"
              ? "Brother's Fitness Management System — Internal Operations & Confidential Training Document"
              : "Brother's Fitness జిమ్ మేనేజ్‌మెంట్ సిస్టమ్ — అంతర్గత నిర్వహణ & శిక్షణ పత్రం"}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
