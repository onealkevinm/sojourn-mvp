import React, { useState, useRef, useEffect } from "react";

// ── Analytics ──────────────────────────────────────────────────────────────────
const MIXPANEL_TOKEN = "d7e668765a8c3efcb1ab3a077468a069";

// Use Mixpanel's official snippet — handles its own init queue
(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=0;e<j.length;e++)b(j[e]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
window.mixpanel.init(MIXPANEL_TOKEN, { persistence: "cookie", debug: false });

const mp = {
  track(event, props = {}) {
    try {
      if (typeof window !== "undefined" && window.mixpanel) {
        window.mixpanel.track(event, props);
      }
    } catch(e) {}
  }
};

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";

// ─── Simulated user profile (will eventually come from OAuth integrations) ───
const USER_PROFILE = {
  cards: [
    { name: "Chase Sapphire Reserve", network: "Visa", multipliers: "3x travel & dining, 1x all else", perksNote: "Priority Pass lounge access, $300 travel credit" },
    { name: "Amex Platinum", network: "Amex", multipliers: "5x flights booked direct, 5x hotels via Amex Travel, 1x all else", perksNote: "Fine Hotels & Resorts, Centurion Lounges, $200 airline credit" },
    { name: "Citi AAdvantage Executive", network: "Mastercard", multipliers: "4x AA purchases, 1x all else", perksNote: "Admirals Club access, priority boarding" },
    { name: "BofA Alaska Airlines Visa", network: "Visa", multipliers: "3x Alaska purchases, 1x all else", perksNote: "Companion Fare annually, free checked bag" },
    { name: "Chase Freedom Unlimited", network: "Visa", multipliers: "1.5x all purchases", perksNote: "No annual fee, flexible redemption" },
  ],
  loyaltyAccounts: [
    { program: "United MileagePlus", balance: "24,200 miles", tier: "Silver", estValue: "$484" },
    { program: "Delta SkyMiles", balance: "11,400 miles", tier: "None", estValue: "$171" },
    { program: "American AAdvantage", balance: "8,900 miles", tier: "None", estValue: "$142" },
    { program: "Alaska Mileage Plan", balance: "6,200 miles", tier: "None", estValue: "$99" },
    { program: "Marriott Bonvoy", balance: "68,400 points", tier: "Gold", estValue: "$684" },
    { program: "Hilton Honors", balance: "32,100 points", tier: "Silver", estValue: "$193" },
    { program: "World of Hyatt", balance: "9,800 points", tier: "Globalist", estValue: "$196" },
    { program: "United Club (credit)", balance: "$120 credit", tier: "N/A", estValue: "$120" },
  ]
};


const CARD_OPTIONS = [
  { name: "Chase Sapphire Reserve", issuer: "Chase" },
  { name: "Chase Sapphire Preferred", issuer: "Chase" },
  { name: "Chase Freedom Unlimited", issuer: "Chase" },
  { name: "Chase Ink Business Preferred", issuer: "Chase" },
  { name: "Amex Platinum", issuer: "Amex" },
  { name: "Amex Gold", issuer: "Amex" },
  { name: "Amex Green", issuer: "Amex" },
  { name: "Amex Business Platinum", issuer: "Amex" },
  { name: "Citi AAdvantage Executive", issuer: "Citi" },
  { name: "Citi AAdvantage Platinum", issuer: "Citi" },
  { name: "Capital One Venture X", issuer: "Capital One" },
  { name: "Capital One Venture", issuer: "Capital One" },
  { name: "BofA Alaska Airlines Visa", issuer: "BofA" },
  { name: "BofA Premium Rewards", issuer: "BofA" },
  { name: "Hilton Honors Amex Surpass", issuer: "Amex" },
  { name: "Marriott Bonvoy Boundless", issuer: "Chase" },
  { name: "World of Hyatt Card", issuer: "Chase" },
  { name: "United Explorer Card", issuer: "Chase" },
  { name: "Delta SkyMiles Reserve", issuer: "Amex" },
  { name: "Delta SkyMiles Platinum", issuer: "Amex" },
  { name: "Southwest Rapid Rewards Priority", issuer: "Chase" },
  { name: "Barclays AAdvantage Aviator", issuer: "Barclays" },
  { name: "Wells Fargo Autograph", issuer: "Wells Fargo" },
];

const LOYALTY_OPTIONS = {
  hotel: [
    { program: "Marriott Bonvoy", tiers: ["None", "Silver", "Gold", "Platinum", "Titanium", "Ambassador"], brands: ["Marriott", "Westin", "Sheraton", "W Hotels", "St. Regis", "Ritz-Carlton", "EDITION", "Autograph Collection", "Renaissance", "Le Méridien", "The Luxury Collection", "Delta Hotels", "Courtyard", "Four Points"] },
    { program: "Hilton Honors", tiers: ["None", "Silver", "Gold", "Diamond"], brands: ["Hilton", "Conrad", "Waldorf Astoria", "Curio Collection", "DoubleTree", "Embassy Suites", "Hampton Inn", "Canopy", "Tapestry Collection", "LXR Hotels"] },
    { program: "World of Hyatt", tiers: ["None", "Discoverist", "Explorist", "Globalist"], brands: ["Park Hyatt", "Grand Hyatt", "Andaz", "Hyatt Regency", "Alila", "Thompson Hotels", "Hyatt Centric", "JdV by Hyatt", "Caption by Hyatt"] },
    { program: "IHG One Rewards", tiers: ["None", "Silver", "Gold", "Platinum", "Diamond"], brands: ["InterContinental", "Kimpton", "Six Senses", "Regent", "voco", "Holiday Inn", "Crowne Plaza", "Hotel Indigo"] },
    { program: "Wyndham Rewards", tiers: ["None", "Blue", "Gold", "Platinum", "Diamond"], brands: ["Wyndham Grand", "Registry Collection", "La Quinta", "Trademark Collection", "Dolce Hotels"] },
    { program: "Choice Privileges", tiers: ["None", "Gold", "Platinum", "Diamond"], brands: ["Cambria Hotels", "Ascend Collection", "Comfort Inn", "Quality Inn"] },
  ],
  airline: [
    { program: "United MileagePlus", tiers: ["None", "Silver", "Gold", "Platinum", "1K"] },
    { program: "Delta SkyMiles", tiers: ["None", "Silver Medallion", "Gold Medallion", "Platinum Medallion", "Diamond Medallion"] },
    { program: "American AAdvantage", tiers: ["None", "Gold", "Platinum", "Platinum Pro", "Executive Platinum"] },
    { program: "Alaska Mileage Plan", tiers: ["None", "MVP", "MVP Gold", "MVP Gold 75K"] },
    { program: "Southwest Rapid Rewards", tiers: ["None", "A-List", "A-List Preferred", "Companion Pass"] },
    { program: "JetBlue TrueBlue", tiers: ["None", "Mosaic 1", "Mosaic 2", "Mosaic 3", "Mosaic 4"] },
    { program: "Emirates Skywards", tiers: ["None", "Blue", "Silver", "Gold", "Platinum"] },
    { program: "British Airways Avios", tiers: ["None", "Blue", "Bronze", "Silver", "Gold"] },
    { program: "Air France Flying Blue", tiers: ["None", "Explorer", "Silver", "Gold", "Platinum"] },
    { program: "Singapore KrisFlyer", tiers: ["None", "KrisFlyer", "KrisFlyer Elite Silver", "KrisFlyer Elite Gold"] },
  ],
  car: [
    { program: "Hertz Gold Plus Rewards", tiers: ["None", "Gold", "Five Star", "Presidents Circle"] },
    { program: "Avis Preferred", tiers: ["None", "Preferred", "Select", "Chairman"] },
    { program: "Enterprise Plus", tiers: ["None", "Silver", "Gold", "Platinum"] },
    { program: "National Emerald Club", tiers: ["None", "Emerald Club", "Executive", "Executive Elite"] },
    { program: "Budget Fastbreak", tiers: ["None", "Fastbreak"] },
    { program: "Alamo Insiders", tiers: ["None", "Member"] },
    { program: "Turo", tiers: ["None", "Member"] },
    { program: "Zipcar", tiers: ["None", "Member"] },
  ],
  rideshare: [
    { program: "Uber", tiers: ["Regular User"] },
    { program: "Uber One", tiers: ["None", "Member"] },
    { program: "Lyft Pink", tiers: ["None", "Pink", "Pink All Access"] },
    { program: "Blacklane", tiers: ["None", "Member"] },
    { program: "Blade", tiers: ["None", "Member"] },
    { program: "Via", tiers: ["None", "Member"] },
  ],
};

const LOYALTY_BRAND_MAP = {
  "Marriott Bonvoy": ["Marriott", "Westin", "Sheraton", "W Hotels", "St. Regis", "Ritz-Carlton", "EDITION", "Autograph Collection", "Renaissance", "Le Meridien", "The Luxury Collection", "Design Hotels", "Tribute Portfolio", "Delta Hotels", "Courtyard", "Residence Inn", "Springhill Suites", "Fairfield", "AC Hotels", "Aloft", "Element", "Moxy", "Four Points"],
  "Hilton Honors": ["Hilton", "Conrad", "Waldorf Astoria", "Curio Collection", "DoubleTree", "Canopy", "Tapestry Collection", "LXR Hotels", "Embassy Suites", "Hampton Inn", "Homewood Suites", "Home2 Suites", "Tempo", "Motto", "Tru"],
  "World of Hyatt": ["Park Hyatt", "Grand Hyatt", "Andaz", "Hyatt Regency", "Alila", "Thompson Hotels", "Hyatt Centric", "JdV by Hyatt", "Caption by Hyatt", "tommie", "Unbound Collection", "Joie de Vivre", "Hyatt Place", "Hyatt House", "Small Luxury Hotels", "SLH"],
  "IHG One Rewards": ["InterContinental", "Kimpton", "Six Senses", "Regent", "Hotel Indigo", "Vignette Collection", "voco", "Crowne Plaza", "Holiday Inn", "Even Hotels", "Staybridge Suites"],
  "Wyndham Rewards": ["Wyndham Grand", "Registry Collection", "La Quinta", "Trademark Collection", "Dolce Hotels", "Wingate", "Hawthorn Suites", "Microtel", "Days Inn", "Super 8"],
  "Choice Privileges": ["Cambria Hotels", "Ascend Collection", "Comfort Inn", "Quality Inn", "Clarion", "Sleep Inn", "Econo Lodge"],
};

// Independent hotels — explicitly NOT in any major loyalty program
const INDEPENDENT_HOTELS = [
  "Peninsula", "Four Seasons", "Rosewood", "Mandarin Oriental", "Aman", "Amanyara", "Amanjiwo",
  "Belmond", "Montage", "Auberge", "Relais & Chateaux",
  "1 Hotels", "Ace Hotels", "Surf Hotel", "Blackberry Farm", "Brush Creek Ranch",
  "Sandy Lane", "Eden Rock", "Round Hill", "Jade Mountain",
  "Fairmont", "Raffles", "Swissotel"
];

const BRAND_CATEGORIES = [
  {
    key: "loyalty_brands",
    label: "Loyalty Program Brands",
    sublabel: "Auto-populated from your loyalty programs",
    dynamic: true,
    brands: [],
  },
  {
    key: "luxury_independent",
    label: "Luxury Independent",
    sublabel: "Premium properties outside loyalty ecosystems",
    brands: ["Four Seasons", "One & Only", "Aman", "Rosewood", "Belmond", "Montage Hotels", "Proper Hotels", "Auberge Resorts", "Virgin Hotels", "SH Hotels"],
  },
  {
    key: "curated_collections",
    label: "Curated Collections",
    sublabel: "Handpicked independent properties",
    brands: ["Leading Hotels of the World", "Relais & Châteaux", "Small Luxury Hotels", "Design Hotels", "Tablet Hotels", "Mr & Mrs Smith"],
  },
  {
    key: "recognition",
    label: "Quality & Discovery",
    sublabel: "Award and rating systems you trust",
    brands: [
      "Michelin Keys (hotel)",
      "Michelin Stars (restaurant)",
      "Michelin Bib Gourmand",
      "Forbes Five Star",
      "AAA Five Diamond",
      "Condé Nast Gold List",
      "T+L Hot List",
      "Eater 38 / City Lists",
      "James Beard Nominated",
      "James Beard Award Winner",
      "Bon Appétit Hot 10",
      "Diners, Drive-Ins and Dives",
    ],
  },
  {
    key: "style_business",
    label: "Business Focused",
    sublabel: "Optimized for work travel",
    brands: ["Marriott", "Hilton", "Hyatt Regency", "Westin", "Courtyard", "Residence Inn", "Homewood Suites", "AC Hotels"],
  },
  {
    key: "style_resort",
    label: "Resort & Leisure",
    sublabel: "Destination and leisure properties",
    brands: ["Four Seasons Resort", "One & Only Resorts", "Sandals", "Club Med", "Beaches Resorts", "Excellence Resorts"],
  },
  {
    key: "style_allinclusive",
    label: "All-Inclusive",
    sublabel: "Bundled experience properties",
    brands: ["Sandals", "Beaches", "Club Med", "Excellence Playa Mujeres", "Secrets Resorts", "Dreams Resorts", "Iberostar"],
  },
  {
    key: "style_boutique",
    label: "Boutique & Lifestyle",
    sublabel: "Independently spirited properties",
    brands: ["Ace Hotel", "Soho House", "Graduate Hotels", "21c Museum Hotels", "Bunkhouse Group", "Standard Hotels", "Freehand Hotels"],
  },



];

const Chip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
    color: active ? "#C9A84C" : "#6a6460",
    borderRadius: "20px", padding: "7px 13px", cursor: "pointer",
    fontSize: "12px", transition: "all 0.15s", whiteSpace: "nowrap",
  }}>{active ? "✓ " : ""}{label}</button>
);

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [customCard, setCustomCard] = useState("");
  const [showCustomCard, setShowCustomCard] = useState(false);
  const [cardSearch, setCardSearch] = useState("");

  const defaultLoyalty = () => {
    const obj = {};
    Object.values(LOYALTY_OPTIONS).flat().forEach(({ program, tiers }) => {
      obj[program] = { selected: false, tier: tiers[0], balance: "" };
    });

    return obj;
  };
  const [loyaltyAccounts, setLoyaltyAccounts] = useState(defaultLoyalty);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [expandedBrandCat, setExpandedBrandCat] = useState(null);
  const [expandedLoyaltyCat, setExpandedLoyaltyCat] = useState("hotel"); // Open hotel by default
  const [debugMsg, setDebugMsg] = useState("");
  const [travelProfile, setTravelProfile] = useState({
    homeAirport: "",
    frequency: "",
    travelTypes: [],
  });

  // Card → loyalty auto-populate mapping
  const CARD_TO_LOYALTY = {
    "Delta SkyMiles Reserve": "Delta SkyMiles",
    "Delta SkyMiles Platinum": "Delta SkyMiles",
    "BofA Alaska Airlines Visa": "Alaska Mileage Plan",
    "United Explorer Card": "United MileagePlus",
    "Citi AAdvantage Executive": "American AAdvantage",
    "Southwest Rapid Rewards Priority": "Southwest Rapid Rewards",
    "Marriott Bonvoy Boundless": "Marriott Bonvoy",
    "World of Hyatt Card": "World of Hyatt",
    "Hilton Honors Amex Surpass": "Hilton Honors",
  };

  const toggleCard = (card) => {
    setSelectedCards(prev => {
      const adding = !prev.includes(card);
      const next = adding ? [...prev, card] : prev.filter(c => c !== card);
      // Auto-populate loyalty when adding a co-branded card
      const linked = CARD_TO_LOYALTY[card];
      if (linked) {
        setLoyaltyAccounts(la => ({
          ...la,
          [linked]: { ...la[linked], selected: adding || la[linked]?.selected }
        }));
      }
      return next;
    });
  };
  const toggleBrand = (brand) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  const toggleLoyalty = (prog) => setLoyaltyAccounts(prev => ({ ...prev, [prog]: { ...prev[prog], selected: !prev[prog].selected } }));
  const setTier = (prog, tier) => setLoyaltyAccounts(prev => ({ ...prev, [prog]: { ...prev[prog], tier } }));
  const setBalance = (prog, bal) => setLoyaltyAccounts(prev => ({ ...prev, [prog]: { ...prev[prog], balance: bal } }));

  const addCustomCard = () => {
    if (customCard.trim()) {
      setSelectedCards(prev => [...prev, customCard.trim()]);
      setCustomCard("");
      setShowCustomCard(false);
    }
  };

  // Auto-derive loyalty brands for Step 3
  const getLoyaltyBrands = () => {
    const brands = [];
    Object.entries(loyaltyAccounts).forEach(([prog, acct]) => {
      if (acct.selected && LOYALTY_BRAND_MAP[prog]) {
        LOYALTY_BRAND_MAP[prog].forEach(b => { if (!brands.includes(b)) brands.push(b); });
      }
    });
    return brands;
  };

  const handleComplete = () => {
    const loyaltyList = [];
    try {
      Object.entries(loyaltyAccounts || {}).forEach(([program, v]) => {
        if (v && v.selected) loyaltyList.push({ program, balance: v.balance || "Unknown", tier: v.tier || "None", estValue: "TBD" });
      });
    } catch(e) {}

    const loyaltyBrands = [];
    try {
      Object.entries(loyaltyAccounts || {}).forEach(([prog, acct]) => {
        if (acct && acct.selected && LOYALTY_BRAND_MAP[prog]) {
          LOYALTY_BRAND_MAP[prog].forEach(b => { if (!loyaltyBrands.includes(b)) loyaltyBrands.push(b); });
        }
      });
    } catch(e) {}

    const profile = {
      travelProfile: travelProfile || {},
      cards: (selectedCards || []).map(name => ({ name, network: "Visa", multipliers: "varies", perksNote: "" })),
      loyaltyAccounts: loyaltyList,
      preferredBrands: [...(selectedBrands || []), ...loyaltyBrands],
    };
    onComplete(profile);
  };

  const filteredCards = CARD_OPTIONS.filter(c => c.name.toLowerCase().includes(cardSearch.toLowerCase()));
  const steps = ["Welcome", "Profile", "Cards", "Loyalty", "Brands"];

  const NavButtons = ({ onBack, onNext, nextLabel = "Next →", nextDisabled = false }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
      <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "12px" }}>← Back</button>
      <button onClick={onNext} disabled={nextDisabled} style={{ padding: "12px 28px", background: nextDisabled ? "rgba(201,168,76,0.2)" : "#C9A84C", color: nextDisabled ? "#555" : "#0a0908", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: nextDisabled ? "default" : "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>{nextLabel}</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080706", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#e8e4dc", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        input:focus,select:focus,textarea:focus{outline:none}
        ::-webkit-scrollbar{width:3px;height:3px;background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.2);border-radius:2px}
      `}</style>

      {/* Header + Progress */}
      <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", fontFamily: "serif" }}>Sojourn · AI</div>
        {step > 0 && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {steps.slice(1).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", background: i + 1 < step ? "#C9A84C" : i + 1 === step ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)", color: i + 1 < step ? "#0a0908" : i + 1 === step ? "#C9A84C" : "#333", border: i + 1 === step ? "1px solid rgba(201,168,76,0.35)" : "none" }}>
                  {i + 1 < step ? "✓" : i + 2}
                </div>
                <span style={{ color: i + 1 === step ? "#b0a898" : "#333", fontSize: "11px" }}>{s}</span>
                {i < 3 && <span style={{ color: "#222", fontSize: "10px", margin: "0 2px" }}>—</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 28px 28px", maxWidth: "640px", width: "100%", margin: "0 auto", animation: "fadeUp 0.4s ease forwards", boxSizing: "border-box" }}>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: "36px", fontFamily: "'Playfair Display',Georgia,serif", lineHeight: "1.15", marginBottom: "16px", textAlign: "center" }}>Travel the way<br />you were meant to.</div>
            <div style={{ color: "#666", fontSize: "15px", lineHeight: "1.7", marginBottom: "32px", textAlign: "center" }}>Tell us where you want to go — or let us surprise you. Sojourn builds personalized trips around your loyalty programs, credit cards, and travel style, then helps you book them.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
              {["Discovers options you'd never find on your own", "Puts your points and cards to work on every trip", "Learns your preferences and remembers what you love"].map(t => (
                <div key={t} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: "#C9A84C", fontSize: "12px", marginTop: "3px", flexShrink: 0 }}>▪</span>
                  <span style={{ color: "#7a7468", fontSize: "14px", lineHeight: "1.5" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ color: "#444", fontSize: "12px", marginBottom: "20px", textAlign: "center" }}>Takes about 2 minutes · You can update preferences anytime</div>
            <button onClick={() => setStep(1)} style={{ width: "100%", padding: "16px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>Get Started →</button>
          </div>
        )}


        {/* Step 1 — Travel Profile */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: "6px", color: "#C9A84C", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif" }}>Step 1 of 4</div>
            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "6px" }}>Tell us about how you travel</div>
            <div style={{ color: "#555", fontSize: "13px", marginBottom: "24px", lineHeight: "1.6" }}>This helps Sojourn prioritize the right routes, carriers, and properties from the start.</div>

            {/* Home Airport */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Home Airport</div>
              <input
                value={travelProfile.homeAirport}
                onChange={e => setTravelProfile(p => ({ ...p, homeAirport: e.target.value }))}
                placeholder="e.g. SFO, JFK, LAX, ORD..."
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#e8e4dc", fontSize: "14px", fontFamily: "'DM Sans',system-ui,sans-serif", boxSizing: "border-box" }}
              />
              <div style={{ color: "#333", fontSize: "11px", marginTop: "6px" }}>You can add a secondary airport too — e.g. "SFO, OAK"</div>
            </div>

            {/* Travel Frequency */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Travel Frequency</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["1–2 trips/year", "3–5 trips/year", "6–10 trips/year", "10–20 trips/year", "20+ trips/year"].map(f => (
                  <button key={f} onClick={() => setTravelProfile(p => ({ ...p, frequency: f }))}
                    style={{ background: travelProfile.frequency === f ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${travelProfile.frequency === f ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`, color: travelProfile.frequency === f ? "#C9A84C" : "#6a6460", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "12px", transition: "all 0.15s" }}>
                    {travelProfile.frequency === f ? "✓ " : ""}{f}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Type & Purpose */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Travel Type & Purpose</div>
              <div style={{ color: "#444", fontSize: "11px", marginBottom: "10px" }}>Select all that apply</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  { label: "Domestic", icon: "🗺" },
                  { label: "International", icon: "✈️" },
                  { label: "Business", icon: "💼" },
                  { label: "Urban / City", icon: "🏙" },
                  { label: "Vacation — Beach", icon: "🏖" },
                  { label: "Vacation — Ski", icon: "⛷" },
                  { label: "Vacation — Other", icon: "🌿" },
                  { label: "Family / Relatives", icon: "👨‍👩‍👧" },
                  { label: "Youth Athletics", icon: "🏆" },
                ].map(({ label, icon }) => {
                  const active = travelProfile.travelTypes.includes(label);
                  return (
                    <button key={label} onClick={() => setTravelProfile(p => ({ ...p, travelTypes: active ? p.travelTypes.filter(t => t !== label) : [...p.travelTypes, label] }))}
                      style={{ background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`, color: active ? "#C9A84C" : "#6a6460", borderRadius: "20px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{icon}</span>{active ? "✓ " : ""}{label}
                    </button>
                  );
                })}
              </div>
            </div>

            <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Next: Cards →" nextDisabled={!travelProfile.homeAirport.trim()} />
          </div>
        )}

        {/* Step 2 — Cards */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ marginBottom: "6px", color: "#C9A84C", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif" }}>Step 2 of 4</div>
            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "6px" }}>Which cards do you carry?</div>
            <div style={{ color: "#555", fontSize: "13px", marginBottom: "18px", lineHeight: "1.6" }}>Select all that apply. Sojourn routes each component to the card that earns the most rewards.</div>
            <input value={cardSearch} onChange={e => setCardSearch(e.target.value)} placeholder="Search cards..." style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "9px 14px", color: "#e8e4dc", fontSize: "13px", marginBottom: "14px", boxSizing: "border-box", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "14px", maxHeight: "340px", overflowY: "auto" }}>
              {filteredCards.map(({ name }) => <Chip key={name} label={name} active={selectedCards.includes(name)} onClick={() => toggleCard(name)} />)}
            </div>

            {/* Custom card add */}
            {showCustomCard ? (
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input value={customCard} onChange={e => setCustomCard(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomCard()} placeholder="Card name (e.g. Chase Ink Business Unlimited)" autoFocus
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "10px", padding: "9px 14px", color: "#e8e4dc", fontSize: "13px", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
                <button onClick={addCustomCard} style={{ background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "10px", padding: "9px 16px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>Add</button>
                <button onClick={() => setShowCustomCard(false)} style={{ background: "rgba(255,255,255,0.04)", color: "#666", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "9px 14px", cursor: "pointer", fontSize: "12px" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowCustomCard(true)} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.12)", color: "#555", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontSize: "12px", marginBottom: "12px", alignSelf: "flex-start", transition: "all 0.2s" }}>+ Add another card</button>
            )}

            {selectedCards.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "8px" }}>Selected ({selectedCards.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedCards.map(c => <span key={c} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: "11px", padding: "4px 10px", borderRadius: "8px" }}>✓ {c}</span>)}
                </div>
              </div>
            )}

            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Next: Loyalty →" nextDisabled={selectedCards.length === 0} />
          </div>
        )}

        {/* Step 3 — Loyalty Programs */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: "6px", color: "#C9A84C", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif" }}>Step 3 of 4</div>
            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "6px" }}>Services & loyalty programs</div>
            <div style={{ color: "#555", fontSize: "13px", marginBottom: "20px", lineHeight: "1.6" }}>Select your programs, tier, and approximate balance. Sojourn will factor these into every recommendation.</div>

            {/* Loyalty categories as expandable accordions — no hidden scroll */}
            {[
              { label: "Hotel Programs", key: "hotel", hint: "Marriott, Hyatt, Hilton..." },
              { label: "Airline Programs", key: "airline", hint: "United, Delta, Alaska..." },
              { label: "Car Rental", key: "car", hint: "Hertz, Avis, Enterprise..." },
              { label: "Rideshare & Ground", key: "rideshare", hint: "Uber, Lyft..." },
            ].map(({ label, key, hint }) => {
              const selectedCount = LOYALTY_OPTIONS[key].filter(({ program }) => loyaltyAccounts[program]?.selected).length;
              const isOpen = expandedLoyaltyCat === key;
              return (
                <div key={key} style={{ border: `1px solid ${selectedCount > 0 ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", marginBottom: "8px", background: selectedCount > 0 ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                  {/* Header — always visible, click to expand */}
                  <div onClick={() => setExpandedLoyaltyCat(isOpen ? null : key)} style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                    <div>
                      <span style={{ color: selectedCount > 0 ? "#c0b8ae" : "#6a6460", fontSize: "13px", fontWeight: "500" }}>{label}</span>
                      {!isOpen && <span style={{ color: "#333", fontSize: "11px", marginLeft: "8px" }}>{hint}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {selectedCount > 0 && <span style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", fontSize: "10px", padding: "2px 8px", borderRadius: "8px", fontFamily: "serif" }}>{selectedCount} selected</span>}
                      <span style={{ color: "#555", fontSize: "11px" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {/* Expanded programs list */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: "7px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {LOYALTY_OPTIONS[key].map(({ program, tiers }) => {
                        const acct = loyaltyAccounts[program] || { selected: false, tier: tiers[0], balance: "" };
                        return (
                          <div key={program} style={{ background: acct.selected ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${acct.selected ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: "9px", padding: "9px 11px", transition: "all 0.15s", marginTop: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: acct.selected ? "9px" : "0" }}>
                              <div onClick={() => toggleLoyalty(program)} style={{ width: "17px", height: "17px", borderRadius: "4px", border: `1px solid ${acct.selected ? "#C9A84C" : "rgba(255,255,255,0.15)"}`, background: acct.selected ? "#C9A84C" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                                {acct.selected && <span style={{ color: "#0a0908", fontSize: "10px", fontWeight: "bold" }}>✓</span>}
                              </div>
                              <span onClick={() => toggleLoyalty(program)} style={{ color: acct.selected ? "#e8e4dc" : "#6a6460", fontSize: "13px", cursor: "pointer", flex: 1 }}>{program}</span>
                            </div>
                            {acct.selected && (
                              <div style={{ display: "flex", gap: "8px", paddingLeft: "27px" }}>
                                <select value={acct.tier} onChange={e => setTier(program, e.target.value)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 10px", color: "#b0a898", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
                                  {tiers.map(t => <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>)}
                                </select>
                                <input value={acct.balance} onChange={e => setBalance(program, e.target.value)} placeholder="Miles/points (e.g. 45,000)" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 10px", color: "#e8e4dc", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Next: Brands →" />
          </div>
        )}

        {/* Step 4 — Brand Preferences */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "6px", color: "#C9A84C", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif" }}>Step 4 of 4</div>
            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "6px" }}>Brand & style preferences</div>
            <div style={{ color: "#555", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>Sojourn weights these in every recommendation. Tap any category to expand and select. You can skip this and add preferences later.</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
              {BRAND_CATEGORIES.map((cat) => {
                const brands = cat.dynamic ? getLoyaltyBrands() : cat.brands;
                const activeCount = brands.filter(b => selectedBrands.includes(b)).length;
                const isOpen = expandedBrandCat === cat.key;
                return (
                  <div key={cat.key} style={{ border: `1px solid ${activeCount > 0 ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", background: activeCount > 0 ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)" }}>
                    <div
                      onClick={() => setExpandedBrandCat(isOpen ? null : cat.key)}
                      style={{ padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                    >
                      <div>
                        <span style={{ color: activeCount > 0 ? "#c0b8ae" : "#6a6460", fontSize: "13px" }}>{cat.label}</span>
                        <span style={{ color: "#333", fontSize: "11px", marginLeft: "8px" }}>{cat.sublabel}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        {activeCount > 0 && <span style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontSize: "10px", padding: "2px 8px", borderRadius: "8px" }}>{activeCount}</span>}
                        <span style={{ color: "#555", fontSize: "11px" }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "8px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        {cat.dynamic && brands.length === 0 ? (
                          <div style={{ color: "#444", fontSize: "12px", paddingTop: "6px", fontStyle: "italic" }}>Select loyalty programs in Step 3 to auto-populate this section.</div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "8px" }}>
                            {brands.map(brand => (
                              <div
                                key={brand}
                                onClick={(e) => { e.stopPropagation(); toggleBrand(brand); }}
                                style={{ background: selectedBrands.includes(brand) ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedBrands.includes(brand) ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.1)"}`, color: selectedBrands.includes(brand) ? "#C9A84C" : "#6a6460", borderRadius: "20px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", transition: "all 0.15s", userSelect: "none" }}
                              >
                                {selectedBrands.includes(brand) ? "✓ " : ""}{brand}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {debugMsg ? <div style={{ background: "rgba(201,76,76,0.15)", border: "1px solid rgba(201,76,76,0.3)", borderRadius: "8px", padding: "8px 12px", color: "#e88", fontSize: "12px", marginBottom: "10px" }}>{debugMsg}</div> : null}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(3)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "12px" }}>← Back</button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => {
                  setDebugMsg("Clicked...");
                  try {
                    setDebugMsg("Building profile...");
                    const profile = {
                      travelProfile: travelProfile || {},
                      cards: (selectedCards || []).map(name => ({ name })),
                      loyaltyAccounts: Object.entries(loyaltyAccounts || {}).filter(([,v]) => v && v.selected).map(([program, v]) => ({ program, balance: v.balance || "", tier: v.tier || "None" })),
                      preferredBrands: selectedBrands || [],
                    };
                    setDebugMsg("Calling onComplete...");
                    onComplete(profile);
                    setDebugMsg("Done!");
                  } catch(e) {
                    setDebugMsg("ERROR: " + e.message);
                  }
                }} style={{ padding: "12px 28px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>Start Optimizing →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Components ──────────────────────────────────────────────────────────────

const GridView = ({ options, onSelectOption, onDismiss, dismissedIds, focusedOptionId, showDismissed, setShowDismissed, hiddenOptions }) => {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ textAlign: "left", padding: "10px 16px", color: "#444", fontSize: "10px", fontFamily: "serif", letterSpacing: "0.12em", textTransform: "uppercase", width: "32%" }}>Option</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "#444", fontSize: "10px", fontFamily: "serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cash Out of Pocket</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "#444", fontSize: "10px", fontFamily: "serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Points</th>
              <th style={{ textAlign: "right", padding: "10px 12px", color: "#444", fontSize: "10px", fontFamily: "serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Net Value</th>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "#444", fontSize: "10px", fontFamily: "serif", letterSpacing: "0.12em", textTransform: "uppercase", width: "26%" }}>Why This</th>
              <th style={{ width: "32px" }}></th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt, i) => {
              const isRec = opt.id === 1;
              const isFocused = focusedOptionId === opt.id;
              const isOnHold = focusedOptionId && !isFocused;
              const isHov = hovered === opt.id;
              const hotel = (opt.components||[]).find(c => c.label?.toLowerCase().includes("hotel") || c.label?.toLowerCase().includes("accommodation"));
              const flight = (opt.components||[]).find(c => c.label === "Flight");
              return (
                <tr
                  key={opt.id}
                  onClick={() => !isOnHold && onSelectOption && onSelectOption(opt.id)}
                  onMouseEnter={() => setHovered(opt.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: isFocused ? "rgba(201,168,76,0.07)" : isRec && !isOnHold ? "rgba(201,168,76,0.03)" : isHov && !isOnHold ? "rgba(255,255,255,0.03)" : "transparent",
                    cursor: isOnHold ? "default" : "pointer",
                    opacity: isOnHold ? 0.25 : 1,
                    transition: "all 0.2s",
                    animation: `fadeUp 0.45s ease ${i * 0.06}s both`,
                  }}
                >
                  {/* Option name + tag */}
                  <td style={{ padding: "16px 16px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ background: opt.tagColor + "18", color: opt.tagColor, fontSize: "10px", padding: "3px 9px", borderRadius: "10px", fontFamily: "serif", border: `1px solid ${opt.tagColor}22`, whiteSpace: "nowrap" }}>{opt.tag}</span>
                      {isRec && !isOnHold && <span style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif" }}>★ Top Pick</span>}
                      {isFocused && <span style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif" }}>● Selected</span>}
                    </div>
                    <div style={{ color: "#d8d4cc", fontSize: "13px", fontFamily: "'Playfair Display',Georgia,serif", lineHeight: "1.3", marginBottom: "4px" }}>{opt.headline}</div>
                    <div style={{ color: "#555", fontSize: "11px" }}>{opt.subhead}</div>
                    {hotel && <div style={{ color: "#3a3a3a", fontSize: "10px", marginTop: "4px" }}>{hotel.detail?.split("·")[0]?.trim()}</div>}
                    {!isOnHold && <div style={{ color: isHov ? "#C9A84C" : "#333", fontSize: "10px", marginTop: "5px", letterSpacing: "0.05em", transition: "color 0.15s" }}>View details →</div>}
                  </td>

                  {/* Total cost */}
                  <td style={{ padding: "16px 12px", textAlign: "right", verticalAlign: "middle" }}>
                    <div style={{ color: "#e8e4dc", fontSize: "16px", fontFamily: "'Playfair Display',Georgia,serif" }}>
                      ${typeof opt.totalCost === "number" ? opt.totalCost.toLocaleString() : String(opt.totalCost||0).replace(/^\$+/,"")}
                    </div>
                    {(opt.redemptions?.length > 1 || (opt.redemptions?.length === 1 && opt.redemption))
                      ? <div style={{ color: "#4CC97A", fontSize: "10px", marginTop: "2px" }}>Redemptions applied</div>
                      : opt.redemption || opt.redemptions?.length === 1
                      ? <div style={{ color: "#4CC97A", fontSize: "10px", marginTop: "2px" }}>Redemption applied</div>
                      : null}
                  </td>

                  {/* Points earned / redeemed */}
                  <td style={{ padding: "16px 12px", textAlign: "right", verticalAlign: "middle" }}>
                    {(() => {
                      const hasRedemptions = opt.redemptions?.length > 0;
                      const hasEarning = opt.pointsValue > 0;
                      if (hasRedemptions) {
                        // Show redemption value summary
                        const totalRedemptionValue = opt.redemptions.reduce((s, r) => s + (r.dollarsValue || 0), 0);
                        return (
                          <div>
                            {totalRedemptionValue > 0 && <div style={{ color: "#4CC97A", fontSize: "13px" }}>~${totalRedemptionValue.toLocaleString()} redeemed</div>}
                            {opt.redemptions.map((r, i) => (
                              <div key={i} style={{ color: "#3a6e4a", fontSize: "10px", marginTop: "2px" }}>
                                {(r.pointsUsed||0).toLocaleString()} {r.program?.replace(" SkyMiles","").replace(" Honors","").replace(" Bonvoy","")} · {r.centsPerPoint?.toFixed(1)}¢/pt
                              </div>
                            ))}
                            {hasEarning && <div style={{ color: "#4a4540", fontSize: "10px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "4px" }}>+${opt.pointsValue.toLocaleString()} earned</div>}
                          </div>
                        );
                      }
                      return (
                        <div>
                          {hasEarning
                            ? <div style={{ color: opt.tagColor, fontSize: "13px" }}>+${opt.pointsValue?.toLocaleString()}</div>
                            : <div style={{ color: "#333", fontSize: "12px" }}>—</div>}
                          <div style={{ color: "#444", fontSize: "10px", marginTop: "2px", maxWidth: "120px", marginLeft: "auto" }}>{opt.pointsEarned}</div>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Net cost */}
                  <td style={{ padding: "16px 12px", textAlign: "right", verticalAlign: "middle" }}>
                    <div style={{ color: "#e8e4dc", fontSize: "16px", fontFamily: "'Playfair Display',Georgia,serif" }}>
                      ${typeof opt.netValue === "number" ? opt.netValue.toLocaleString() : String(opt.netValue||0).replace(/^\$+/,"")}
                    </div>
                    <div style={{ color: "#444", fontSize: "10px", marginTop: "2px" }}>est. value</div>
                  </td>

                  {/* Why this */}
                  <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                    <div style={{ color: "#7a7468", fontSize: "12px", lineHeight: "1.55" }}>{opt.whyThis}</div>
                    {opt.tradeoff && <div style={{ color: "#3a3a3a", fontSize: "10px", marginTop: "5px", fontStyle: "italic" }}>{opt.tradeoff}</div>}
                  </td>

                  {/* Dismiss X */}
                  <td style={{ padding: "0 10px", textAlign: "center", verticalAlign: "middle" }}>
                    {!isOnHold && onDismiss && (
                      <button
                        onClick={e => { e.stopPropagation(); onDismiss(opt.id); }}
                        title="Not for me"
                        style={{ background: "none", border: "none", color: "#2a2a2a", fontSize: "13px", cursor: "pointer", padding: "4px 6px", borderRadius: "6px", lineHeight: 1 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#666"}
                        onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}
                      >✕</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dismissed / hidden options footer */}
      {hiddenOptions && hiddenOptions.length > 0 && (
        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", paddingLeft: "16px" }}>
          <button onClick={() => setShowDismissed(!showDismissed)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "5px 12px", color: "#444", fontSize: "11px", cursor: "pointer" }}>
            {hiddenOptions.length} hidden · {showDismissed ? "hide" : "show"}
          </button>
        </div>
      )}
      {showDismissed && hiddenOptions && hiddenOptions.map(opt => (
        <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", opacity: 0.35, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ color: opt.tagColor, fontSize: "10px" }}>{opt.tag}</span>
          <span style={{ color: "#555", fontSize: "12px", flex: 1 }}>{opt.headline}</span>
          <button onClick={() => { /* restore handled outside */ onDismiss && onDismiss(opt.id, true); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#555", fontSize: "10px", padding: "3px 10px", cursor: "pointer" }}>Restore</button>
        </div>
      ))}
    </div>
  );
};

// Keep CompareView as alias (used nowhere now but safe to keep)
const CompareView = ({ options, onBack, onSelectOption }) => (
  <GridView options={options} onSelectOption={onSelectOption} />
);

const ComponentRow = ({ label, value, detail, points, card }) => {
  const isFlight = label === "Flight" || label === "Return Flight";
  const parts = isFlight ? detail.split(" · ") : [];
  const flightNum = parts[0] || "";
  const route = parts[1] || "";
  const times = parts[2] || "";
  const duration = parts[3] || "";

  // Determine if points field is a redemption or an earning
  const pointsStr = String(points || "");
  const isRedemption = /redeem|redeemed|redemption/i.test(pointsStr);
  const isEarning = /earn|earning|est\./i.test(pointsStr) && !isRedemption;

  // Cash value display
  const cashNum = typeof value === "number" ? value : parseInt(String(value || "0").replace(/[^0-9]/g,"")) || 0;
  const cashDisplay = cashNum > 0
    ? `$${cashNum.toLocaleString()}`
    : isRedemption ? "$0" : "$0";

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ color: "#666", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif" }}>{label}</div>
          {isFlight && !times && duration && <div style={{ color: "#555", fontSize: "10px", background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: "6px" }}>{duration}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>{cashDisplay}</div>
          {isRedemption && pointsStr && (
            <div style={{ color: "#4CC97A", fontSize: "11px", marginTop: "2px" }}>{pointsStr}</div>
          )}
          {isEarning && pointsStr && (
            <div style={{ color: "#7a9e9a", fontSize: "11px", marginTop: "2px" }}>{pointsStr}</div>
          )}
          {!isRedemption && !isEarning && pointsStr && (
            <div style={{ color: "#4CC97A", fontSize: "11px", marginTop: "2px" }}>{pointsStr}</div>
          )}
        </div>
      </div>
      {isFlight && route ? (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
            <span style={{ color: "#b0a898", fontSize: "14px", fontFamily: "serif", fontWeight: "600" }}>{flightNum}</span>
            <span style={{ color: "#C9A84C", fontSize: "13px", letterSpacing: "0.05em" }}>{route}</span>
          </div>
          {times && (
            <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "#C9A84C", fontSize: "11px" }}>✈</span>
              <span style={{ color: "#c0b8ae", fontSize: "13px" }}>{times}</span>
              {duration && <span style={{ color: "#888", fontSize: "12px", marginLeft: "4px" }}>({duration})</span>}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: "#c0b8ae", fontSize: "13px", marginBottom: "6px" }}>{detail}</div>
      )}
      {card && (() => {
        // Extract multiplier from card string if present — e.g. "Chase Sapphire Reserve · 3x travel"
        const cardParts = card.split(/·|—|-(?=\s*\d)/);
        const cardName = cardParts[0]?.trim() || card;
        const cardReason = cardParts[1]?.trim() || null;
        return (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "3px 8px" }}>
            <span style={{ color: "#C9A84C", fontSize: "10px" }}>▪</span>
            <span style={{ color: "#7a7468", fontSize: "11px" }}>{cardName}</span>
            {cardReason && <span style={{ color: "#4a4540", fontSize: "10px" }}>· {cardReason}</span>}
          </div>
        );
      })()}
    </div>
  );
};

const TripCard = ({ option, isExpanded, onToggle, onItinerary, onDismiss }) => {
  const isRec = option.id === 1;
  return (
    <div onClick={onToggle} style={{
      width: isExpanded ? "100%" : "300px", minWidth: isExpanded ? "unset" : "300px",
      background: isRec ? "linear-gradient(145deg,#1a1712,#13110e)" : "linear-gradient(145deg,#131211,#0e0d0c)",
      border: isRec ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px", padding: "18px", cursor: "pointer",
      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: isRec ? "0 8px 40px rgba(201,168,76,0.12),0 2px 8px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {isRec && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#C9A84C,transparent)" }} />}
      {/* Collapsed header — tag + price on same row, headline below */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ background: option.tagColor + "18", color: option.tagColor, fontSize: "11px", padding: "5px 12px", borderRadius: "12px", fontFamily: "'Playfair Display',Georgia,serif", border: `1px solid ${option.tagColor}33` }}>{option.tag}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#e8e4dc", fontSize: "18px", fontFamily: "'Playfair Display',Georgia,serif" }}>${typeof option.totalCost === "number" ? option.totalCost.toLocaleString() : String(option.totalCost).replace(/^\$+/,"")}</span>
          {onDismiss && !isExpanded && <button onClick={e => { e.stopPropagation(); onDismiss(option.id); }} title="Not for me" style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#444", fontSize: "11px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>✕</button>}
        </div>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <div style={{ color: "#e8e4dc", fontSize: "15px", fontWeight: "600", lineHeight: "1.3", marginBottom: "3px", fontFamily: "'Playfair Display',Georgia,serif" }}>{option.headline}</div>
        <div style={{ color: "#7a7468", fontSize: "12px", lineHeight: "1.4" }}>{option.subhead}</div>
      </div>
      {/* Points earned — compact single line */}
      {(() => {
        const pv = option.pointsValue || 0;
        const estimated = pv === 0 ? Math.round((parseInt((option.pointsEarned||"").replace(/[^0-9]/g,""))||0) * 0.015) : pv;
        return estimated > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: option.tagColor, fontSize: "11px" }}>earns ${estimated.toLocaleString()} via {option.pointsEarned}</span>
            <span style={{ color: "#4a4a4a", fontSize: "11px" }}>net value ${typeof option.netValue === "number" ? option.netValue.toLocaleString() : String(option.netValue||0).replace(/^\$+/,"")} after earning</span>
          </div>
        ) : null;
      })()}
      {isExpanded && (
        <div style={{ marginTop: "26px", animation: "fadeUp 0.3s ease forwards" }} onClick={e => e.stopPropagation()}>
          {/* Why This — no repeated headline */}
          {option.whyThis && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "16px" }}>
              <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "8px" }}>Why This Option</div>
              <div style={{ color: "#b0a898", fontSize: "13px", lineHeight: "1.7" }}>{option.whyThis}</div>
            </div>
          )}
          {/* Experiences — dining, activities surfaced in conversation */}
          {option.experiences && option.experiences.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Dining & Experiences</div>
              {option.experiences.map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 12px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "10px", marginBottom: "6px" }}>
                  <div>
                    <div style={{ color: "#b0a898", fontSize: "12px", marginBottom: "2px" }}>{e.icon} {e.title} <span style={{ color: "#444", fontSize: "10px" }}>· Day {e.day}</span></div>
                    <div style={{ color: "#6a6460", fontSize: "11px", lineHeight: "1.5" }}>{e.detail}</div>
                  </div>
                  {e.bookUrl && <a href={e.bookUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A84C", fontSize: "10px", textDecoration: "none", flexShrink: 0, borderBottom: "1px solid rgba(201,168,76,0.3)", marginLeft: "12px", marginTop: "2px" }}>Book →</a>}
                </div>
              ))}
            </div>
          )}
          {/* Tradeoff */}
          {option.tradeoff && (
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "16px" }}>
              <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "5px" }}>Tradeoff</div>
              <div style={{ color: "#8a8278", fontSize: "13px", lineHeight: "1.5", fontStyle: "italic" }}>{option.tradeoff}</div>
            </div>
          )}
          {/* Points Redemption */}
          {option.redemption && (
            <div style={{ background: "rgba(76,201,122,0.08)", border: "1px solid rgba(76,201,122,0.25)", borderRadius: "10px", padding: "10px 12px", marginBottom: "14px" }}>
              <div style={{ color: "#4CC97A", fontSize: "11px", marginBottom: "2px" }}>✦ Points Redemption Applied</div>
              <div style={{ color: "#7a9e7a", fontSize: "11px" }}>Includes redemption · {option.redemption.program} · {option.redemption.pointsUsed} → {option.redemption.valueRedeemed} value</div>
            </div>
          )}
          {/* Trip Components */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "4px", paddingTop: "14px", marginBottom: "6px" }}>
            <div style={{ color: "#666", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Trip Components</div>
            {(option.components||[]).map(c => <ComponentRow key={c.label + c.value} {...c} />)}
          </div>
          {option.loyaltyHighlight && (
            <div style={{ marginTop: "12px", padding: "12px 16px", background: option.tagColor + "0e", borderRadius: "12px", border: `1px solid ${option.tagColor}22` }}>
              <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Loyalty Highlights</div>
              <div style={{ color: option.tagColor, fontSize: "12px", lineHeight: "1.6" }}>✦ {option.loyaltyHighlight}</div>
            </div>
          )}
          {option.cardStrategy && (
            <div style={{ marginTop: "8px", padding: "10px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "5px" }}>Card Strategy</div>
              <div style={{ color: "#7a7468", fontSize: "12px", lineHeight: "1.6" }}>▪ {option.cardStrategy}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button onClick={() => onItinerary && onItinerary(option)} style={{ flex: 1, padding: "14px", background: "rgba(255,255,255,0.04)", color: "#b0a898", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Playfair Display',Georgia,serif" }}>
              View as Itinerary ↗
            </button>
            <button onClick={(e) => { e.stopPropagation(); mp.track("book_intent", { tag: option.tag, headline: option.headline, total_cost: option.totalCost, net_value: option.netValue, destination: option.subhead }); alert("Booking coming soon! We logged your interest in: " + option.headline); }} style={{ flex: 2, padding: "14px", background: option.tagColor, color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
              Book This Trip →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const ItineraryOverlay = ({ option, tripSummary, onClose }) => {
  if (!option) return null;

  const origin = tripSummary?.origin || "Origin";
  const destination = tripSummary?.destination || "Destination";
  const rawDates = tripSummary?.dates || "";

  // Parse start date from trip summary
  const parseStartDate = (dateStr) => {
    try {
      const match = dateStr.match(/(\w+ \d+|\d+\/\d+)/);
      if (match) return new Date(match[0] + ", 2025");
    } catch(e) {}
    return new Date();
  };
  const startDate = parseStartDate(rawDates);

  const formatDay = (offset) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  // Build day-by-day schedule using component.day field (with fallback for legacy cards)
  const components = option.components || [];
  
  // Determine total days from components
  const maxDay = components.reduce((m, c) => Math.max(m, c.day || 1), 1);
  const returnComp = components.find(c => c.label?.toLowerCase().includes("return") || c.label?.toLowerCase().includes("departure"));
  const totalDays = returnComp?.day || maxDay + 1;
  const totalNights = totalDays - 1 || 3;

  // Icon mapper by component type
  const getIcon = (label) => {
    const l = (label || "").toLowerCase();
    if (l.includes("flight") || l.includes("air")) return "✈";
    if (l.includes("train") || l.includes("amtrak") || l.includes("rail")) return "🚆";
    if (l.includes("ferry") || l.includes("boat")) return "⛴";
    if (l.includes("hotel") || l.includes("resort") || l.includes("inn") || l.includes("lodge")) return "🏨";
    if (l.includes("rental home") || l.includes("airbnb") || l.includes("villa") || l.includes("cottage")) return "🏡";
    if (l.includes("car") || l.includes("ground") || l.includes("transfer") || l.includes("rental")) return "🚗";
    if (l.includes("bike") || l.includes("cycle")) return "🚲";
    return "📍";
  };

  const getTime = (c, dayComponents) => {
    const l = (c.label || "").toLowerCase();
    if (l.includes("return") || l.includes("departure")) return "Afternoon";
    if (l.includes("flight") || l.includes("train") || l.includes("ferry")) {
      // Outbound transport on day 1 = morning
      if ((c.day || 1) === 1) return "Morning";
      return "Afternoon";
    }
    if (l.includes("hotel") || l.includes("inn") || l.includes("resort") || l.includes("lodge") || l.includes("villa") || l.includes("cottage")) return "Afternoon";
    if (l.includes("ground") || l.includes("car") || l.includes("transfer")) return "On Arrival";
    return "Morning";
  };

  // Group components by day
  const componentsByDay = {};
  components.forEach(c => {
    const d = c.day || 1;
    if (!componentsByDay[d]) componentsByDay[d] = [];
    componentsByDay[d].push(c);
  });

  // Build days array
  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const dayComps = componentsByDay[d] || [];
    const isFirst = d === 1;
    const isLast = d === totalDays;
    const isTransit = dayComps.some(c => {
      const l = (c.label||"").toLowerCase();
      return (l.includes("hotel") || l.includes("inn") || l.includes("resort")) && d > 1 && d < totalDays;
    });

    const badge = isFirst ? "Departure" : isLast ? "Return" : isTransit ? "Transit Day" : "Full Day";

    const items = [];

    // Structured booked components for this day
    dayComps.forEach(c => {
      items.push({
        time: getTime(c, dayComps),
        icon: getIcon(c.label),
        title: c.label,
        detail: c.detail,
        value: c.value,
        points: c.points,
        card: c.card,
        bookUrl: null
      });
    });

    // Inject experiences for this day (restaurants, activities, breweries, etc.)
    const dayExperiences = (option.experiences || []).filter(e => e.day === d);
    dayExperiences.forEach(e => {
      const expType = (e.type || "").toLowerCase();
      const expIcon = e.icon || (expType.includes("brew") ? "🍺" : expType.includes("activity") || expType.includes("hike") || expType.includes("excursion") ? "🥾" : "🍽");
      items.push({
        time: e.time || (expType.includes("brunch") ? "Morning" : expType.includes("activity") || expType.includes("hike") ? "Morning" : "Evening"),
        icon: expIcon,
        title: e.name || e.title || "",
        detail: e.detail || "",
        value: null, points: null, card: null,
        bookUrl: e.bookUrl || null,
        isExperience: true
      });
    });

    // Filler items only if no experiences cover this day
    const isDinnerExp = (e) => {
      const t = (e.time || "").toLowerCase();
      const type = (e.type || "").toLowerCase();
      const name = (e.name || e.title || "").toLowerCase();
      return t === "evening" || t.includes("pm") || t.includes("dinner") || t.includes("lunch") ||
             type === "dining" || type === "restaurant" || type === "brewery" ||
             name.includes("dinner") || name.includes("restaurant") || name.includes("brewery") || name.includes("lunch");
    };
    const hasExperienceDinner = dayExperiences.some(isDinnerExp);
    const hasExperienceMorning = dayExperiences.some(e => (e.time||"").toLowerCase() === "morning" || (e.time||"").toLowerCase().includes("am"));

    if (!isFirst && !isLast && dayComps.length === 0 && dayExperiences.length === 0) {
      items.push({ time: "Morning", icon: "☀", title: "Explore", detail: `Full day in ${destination} — activities, dining, local experiences`, value: null, points: null, card: null, bookUrl: null });
    }
    if (!isFirst && !isLast && !hasExperienceDinner) {
      items.push({ time: "Evening", icon: "🍽", title: d === totalDays - 1 ? "Farewell Dinner (placeholder)" : "Dinner (placeholder)", detail: "Add a restaurant via the chat to fill this in", value: null, points: null, card: null, bookUrl: null });
    }

    // Day 1 dinner placeholder only if no experience covers it
    if (isFirst && !items.some(i => i.icon === "🍽") && !hasExperienceDinner) {
      items.push({ time: "Evening", icon: "🍽", title: "Dinner (placeholder)", detail: "Add a restaurant via the chat to fill this in", value: null, points: null, card: null, bookUrl: null });
    }

    // Last day checkout note
    if (isLast) {
      items.unshift({ time: "Morning", icon: "🧳", title: "Check Out", detail: "Settle bill, store luggage if departing later", value: null, points: null, card: null, bookUrl: null });
    }

    // Sort items by time — parse specific times like "10:00 AM" / "7:00 PM" into minutes
    const parseTimeToMinutes = (t) => {
      if (!t) return 750; // default ~12:30pm
      const lower = t.toLowerCase().trim();
      // Specific time e.g. "10:00 AM", "7:00 PM", "9:30am"
      const match = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2] || "0");
        if (match[3] === "pm" && h !== 12) h += 12;
        if (match[3] === "am" && h === 12) h = 0;
        return h * 60 + m;
      }
      // Named buckets
      const buckets = { "morning": 480, "on arrival": 540, "afternoon": 780, "evening": 1080 };
      return buckets[lower] ?? 750;
    };
    items.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    days.push({ dayNum: d, label: formatDay(d - 1), badge, items });
  }

  const handlePrint = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#0e0c0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", width: "100%", maxWidth: "680px", padding: "36px", position: "relative", animation: "fadeUp 0.3s ease forwards" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", fontFamily: "serif", marginBottom: "8px" }}>Sojourn · Trip Itinerary</div>
            <div style={{ fontSize: "24px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#e8e4dc", lineHeight: "1.2" }}>{option.headline}</div>
            <div style={{ color: "#555", fontSize: "12px", marginTop: "6px" }}>{rawDates} · {origin} → {destination}</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <button onClick={handlePrint} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "11px", fontFamily: "serif", letterSpacing: "0.08em" }}>Export PDF ↓</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#666", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Option tag */}
        <div style={{ margin: "16px 0 28px" }}>
          <span style={{ padding: "5px 12px", background: `${option.tagColor}15`, border: `1px solid ${option.tagColor}30`, borderRadius: "8px", color: option.tagColor, fontSize: "11px", fontFamily: "serif", letterSpacing: "0.08em" }}>{option.tag}</span>
        </div>

        {/* Day-by-day schedule */}
        <div style={{ marginBottom: "28px" }}>
          {days.map((day, di) => (
            <div key={di} style={{ marginBottom: "24px" }}>
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px", padding: "4px 10px", flexShrink: 0 }}>
                  <div style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.14em", fontFamily: "serif", textTransform: "uppercase" }}>Day {day.dayNum}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e8e4dc", fontSize: "13px", fontFamily: "'Playfair Display',Georgia,serif" }}>{day.label}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "2px 8px" }}>
                  <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em" }}>{day.badge}</div>
                </div>
              </div>

              {/* Timeline items */}
              <div style={{ marginLeft: "12px", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "1px" }}>
                {day.items.map((item, ii) => (
                  <div key={ii} style={{ display: "flex", gap: "14px", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", marginBottom: "6px", position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: "-26px", top: "18px", width: "8px", height: "8px", borderRadius: "50%", background: item.value ? "#C9A84C" : "rgba(255,255,255,0.1)", border: "1px solid rgba(201,168,76,0.3)", flexShrink: 0 }} />
                    {/* Time badge */}
                    <div style={{ flexShrink: 0, width: "70px" }}>
                      <div style={{ color: "#444", fontSize: "10px", letterSpacing: "0.08em", fontFamily: "serif", textTransform: "uppercase", paddingTop: "2px" }}>{item.time}</div>
                    </div>
                    {/* Icon + content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div>
                          <div style={{ color: "#b0a898", fontSize: "13px", marginBottom: "3px" }}>{item.icon} {item.title}</div>
                          <div style={{ color: "#6a6460", fontSize: "12px", lineHeight: "1.5" }}>{item.detail}</div>
                          {item.card && <div style={{ color: "#3a3a3a", fontSize: "10px", marginTop: "4px" }}>Use: {item.card}</div>}
                          {item.bookUrl && (
                            <a href={item.bookUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A84C", fontSize: "10px", textDecoration: "none", marginTop: "4px", display: "inline-block", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                              Book → {item.bookUrl.replace("https://","").replace("www.","")}
                            </a>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loyalty highlight */}
        <div style={{ padding: "12px 16px", background: `${option.tagColor}0e`, border: `1px solid ${option.tagColor}22`, borderRadius: "10px", marginBottom: "20px" }}>
          <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Loyalty Highlights</div>
          <div style={{ color: option.tagColor, fontSize: "12px", lineHeight: "1.6" }}>✦ {option.loyaltyHighlight}</div>
        </div>

        {/* Book CTA */}
        <button onClick={() => { mp.track("book_intent", { tag: option.tag, headline: option.headline, total_cost: option.totalCost, destination: option.subhead }); alert("Booking coming soon! We logged your interest in: " + option.headline); }} style={{ width: "100%", padding: "16px", background: option.tagColor, color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
          Book This Trip →
        </button>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "14px 16px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C", animation: `bounce 1.2s ease ${i * 0.2}s infinite` }} />
    ))}
  </div>
);

const PointsDashboardDrawer = ({ profile }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("points");

  const cards = profile?.cards || [];
  const loyalty = profile?.loyaltyAccounts || [];

  // Estimate cpp (cents per point) by program
  const cpp = {
    "Chase Ultimate Rewards": 1.5, "Amex Membership Rewards": 1.4,
    "Citi ThankYou": 1.3, "Capital One Miles": 1.2,
    "United MileagePlus": 1.4, "Delta SkyMiles": 1.2,
    "American AAdvantage": 1.3, "Alaska Mileage Plan": 1.5,
    "JetBlue TrueBlue": 1.3, "Southwest Rapid Rewards": 1.5,
    "Marriott Bonvoy": 0.8, "Hilton Honors": 0.5,
    "World of Hyatt": 1.7, "IHG One Rewards": 0.6,
    "Wyndham Rewards": 0.9,
  };

  const totalPointsValue = loyalty.reduce((sum, a) => {
    const bal = parseInt((a.balance||"0").replace(/,/g,"")) || 0;
    const rate = cpp[a.program] || 1.0;
    return sum + Math.round(bal * rate / 100);
  }, 0);

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: open ? "12px 12px 0 0" : "12px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ color: "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif" }}>Points & Cards</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", fontSize: "10px", padding: "2px 7px", borderRadius: "8px", border: "1px solid rgba(201,168,76,0.2)" }}>~${totalPointsValue.toLocaleString()} value</span>
          <span style={{ color: "#444", fontSize: "10px", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
        </div>
      </button>
      {open && (
        <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, background: "#0e0d0c", border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none", borderRadius: "12px 12px 0 0", zIndex: 10, maxHeight: "320px", overflowY: "auto" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 14px" }}>
            {["points", "cards"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 14px", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent", color: activeTab === tab ? "#C9A84C" : "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", cursor: "pointer" }}>
                {tab === "points" ? "Loyalty Points" : "Credit Cards"}
              </button>
            ))}
          </div>
          <div style={{ padding: "14px" }}>
            {activeTab === "points" && (
              <div>
                <div style={{ color: "#555", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Estimated Portfolio Value: <span style={{ color: "#C9A84C" }}>${totalPointsValue.toLocaleString()}</span></div>
                {loyalty.length === 0 && <div style={{ color: "#444", fontSize: "12px" }}>No loyalty accounts added yet</div>}
                {loyalty.map((a, i) => {
                  const bal = parseInt((a.balance||"0").replace(/,/g,"")) || 0;
                  const rate = cpp[a.program] || 1.0;
                  const val = Math.round(bal * rate / 100);
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <div style={{ color: "#b0a898", fontSize: "12px" }}>{a.program}</div>
                        <div style={{ color: "#555", fontSize: "11px" }}>{a.tier} · {a.balance} pts</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#C9A84C", fontSize: "13px", fontFamily: "serif" }}>${val.toLocaleString()}</div>
                        <div style={{ color: "#444", fontSize: "10px" }}>~{rate}¢/pt</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === "cards" && (
              <div>
                {cards.length === 0 && <div style={{ color: "#444", fontSize: "12px" }}>No cards added yet</div>}
                {cards.map((c, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ color: "#b0a898", fontSize: "12px", marginBottom: "2px" }}>{c.name}</div>
                    <div style={{ color: "#555", fontSize: "11px" }}>{c.multipliers || "Rewards card"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BottomDrawer = ({ label, count, items }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: open ? "12px 12px 0 0" : "12px", padding: "10px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        <span style={{ color: "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "rgba(201,168,76,0.08)", color: "#5a4a2a", fontSize: "10px", padding: "2px 7px", borderRadius: "8px", border: "1px solid rgba(201,168,76,0.12)" }}>{count}</span>
          <span style={{ color: "#444", fontSize: "10px", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
        </div>
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "100%", left: 0, right: 0,
          background: "#0e0d0c", border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none", borderRadius: "12px 12px 0 0",
          padding: "14px 14px 6px", zIndex: 10,
          maxHeight: "260px", overflowY: "auto",
        }}>
          {items.map(({ section, entries }) => (
            <div key={section} style={{ marginBottom: "12px" }}>
              <div style={{ color: "#444", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "7px" }}>{section}</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {entries.map(e => (
                  <span key={e} style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.1)", color: "#6a5a3a", fontSize: "10px", padding: "3px 8px", borderRadius: "8px" }}>✓ {e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Unified Optimizing For Bar ───────────────────────────────────────────────
const CARD_OPTIONS_LIST = ["Chase Sapphire Reserve","Chase Sapphire Preferred","Chase Freedom Unlimited","Chase Ink Business Preferred","Amex Platinum","Amex Gold","Amex Green","Amex Business Platinum","Capital One Venture X","Capital One Venture","Citi AAdvantage Executive","BofA Alaska Airlines Visa","United Explorer Card","Delta SkyMiles Reserve","Delta SkyMiles Platinum","Marriott Bonvoy Boundless","World of Hyatt Card","Southwest Rapid Rewards Priority","Hilton Honors Amex Surpass","Wells Fargo Autograph"];

const OptimizingForBar = ({ profile, setProfile }) => {
  const [activePanel, setActivePanel] = useState(null); // "loyalty" | "cards" | "brands"
  const [addCardInput, setAddCardInput] = useState("");
  const loyalty = profile?.loyaltyAccounts || [];
  const cards = profile?.cards || [];
  const brands = profile?.selectedBrands || profile?.preferredBrands || [];

  const activeLoyalty = loyalty.filter(a => a.tier && a.tier !== "None");
  const cpp = { "World of Hyatt": 1.7, "Chase Ultimate Rewards": 1.5, "Alaska Mileage Plan": 1.5, "Southwest Rapid Rewards": 1.5, "United MileagePlus": 1.4, "Amex Membership Rewards": 1.4, "American AAdvantage": 1.3, "JetBlue TrueBlue": 1.3, "Citi ThankYou": 1.3, "Capital One Miles": 1.2, "Delta SkyMiles": 1.2, "Marriott Bonvoy": 0.8, "Wyndham Rewards": 0.9, "IHG One Rewards": 0.6, "Hilton Honors": 0.5 };
  const totalValue = loyalty.reduce((sum, a) => {
    const bal = parseInt((a.balance||"0").replace(/,/g,"")) || 0;
    return sum + Math.round(bal * (cpp[a.program] || 1.0) / 100);
  }, 0);

  const toggle = (panel) => setActivePanel(activePanel === panel ? null : panel);

  const pillStyle = (active) => ({
    background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)"}`,
    color: active ? "#C9A84C" : "#6a6460", borderRadius: "20px",
    padding: "5px 14px", cursor: "pointer", fontSize: "11px",
    fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all 0.15s"
  });

  return (
    <div style={{ padding: "0 24px 20px", flexShrink: 0 }}>
      {/* Panel */}
      {activePanel && (
        <div style={{ background: "#0e0d0c", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "14px 14px 0 0", padding: "16px 18px", marginBottom: "0", maxHeight: "360px", overflowY: "auto" }}>
          {activePanel === "loyalty" && (
            <div>
              <div style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px" }}>Loyalty Programs · Est. Portfolio Value: <span style={{ color: "#e8e4dc" }}>est. ${totalValue.toLocaleString()}</span></div>
              {loyalty.map((a, i) => {
                const bal = parseInt((a.balance||"0").replace(/,/g,"")) || 0;
                const val = Math.round(bal * (cpp[a.program] || 1.0) / 100);
                const isActive = a.tier && a.tier !== "None";
                return (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: isActive ? 1 : 0.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ color: "#b0a898", fontSize: "12px" }}>{a.program}</div>
                        <div style={{ color: "#555", fontSize: "11px" }}>{a.tier}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isActive && <div style={{ color: "#C9A84C", fontSize: "12px", fontFamily: "serif" }}>est. ${val.toLocaleString()}</div>}
                        {isActive && <button onClick={() => {
                          const LOYALTY_TO_BRANDS = {
                            "Delta SkyMiles": ["Delta"], "Alaska Mileage Plan": ["Alaska"],
                            "United MileagePlus": ["United"], "American AAdvantage": ["American"],
                            "Southwest Rapid Rewards": ["Southwest"],
                          };
                          const linkedBrands = LOYALTY_TO_BRANDS[a.program] || [];
                          const updatedBrands = (profile.selectedBrands || profile.preferredBrands || []).filter(b => !linkedBrands.includes(b));
                          setProfile({ ...profile,
                            loyaltyAccounts: profile.loyaltyAccounts.map(x => x.program === a.program ? { ...x, tier: "None", balance: "" } : x),
                            selectedBrands: updatedBrands, preferredBrands: updatedBrands
                          });
                        }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#555", fontSize: "10px", padding: "2px 7px", cursor: "pointer" }}>✕</button>}
                        {!isActive && <button onClick={() => setProfile({ ...profile, loyaltyAccounts: profile.loyaltyAccounts.map(x => x.program === a.program ? { ...x, tier: "Member", balance: "" } : x) })} style={{ background: "none", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "6px", color: "#C9A84C", fontSize: "10px", padding: "2px 7px", cursor: "pointer" }}>+ add</button>}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          value={a.balance || ""}
                          onChange={e => setProfile({ ...profile, loyaltyAccounts: profile.loyaltyAccounts.map(x => x.program === a.program ? { ...x, balance: e.target.value } : x) })}
                          placeholder="Miles/points (e.g. 45,000)"
                          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", padding: "5px 9px", color: "#e8e4dc", fontSize: "11px", fontFamily: "'DM Sans',system-ui,sans-serif" }}
                        />
                        <select
                          value={a.tier}
                          onChange={e => setProfile({ ...profile, loyaltyAccounts: profile.loyaltyAccounts.map(x => x.program === a.program ? { ...x, tier: e.target.value } : x) })}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", padding: "5px 8px", color: "#b0a898", fontSize: "11px", fontFamily: "'DM Sans',system-ui,sans-serif" }}
                        >
                          {(Object.values(LOYALTY_OPTIONS).flat().find(o => o.program === a.program)?.tiers || ["None","Member","Silver","Gold","Platinum"]).map(t => (
                            <option key={t} value={t} style={{ background: "#1a1a1a" }}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Add new loyalty program not already in list */}
              <div style={{ marginTop: "12px" }}>
                <div style={{ color: "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Add a program</div>
                <div style={{ maxHeight: "120px", overflowY: "scroll", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  {["Marriott Bonvoy","World of Hyatt","Hilton Honors","IHG One Rewards","Wyndham Rewards","Choice Privileges","United MileagePlus","Delta SkyMiles","American AAdvantage","Alaska Mileage Plan","Southwest Rapid Rewards","JetBlue TrueBlue","Emirates Skywards","British Airways Avios","Air France Flying Blue","Singapore KrisFlyer","Cathay Pacific Asia Miles","Hertz Gold Plus Rewards","National Emerald Club","Avis Preferred","Enterprise Plus","Uber One"]
                    .filter(p => !loyalty.find(a => a.program === p))
                    .map(p => (
                      <div key={p} onClick={() => {
                        const updatedLoyalty = [...(profile.loyaltyAccounts||[]), { program: p, tier: "Member", balance: "" }];
                        const LOYALTY_TO_BRANDS = {
                          "Delta SkyMiles": ["Delta"], "Alaska Mileage Plan": ["Alaska"],
                          "United MileagePlus": ["United"], "American AAdvantage": ["American"],
                          "Southwest Rapid Rewards": ["Southwest"],
                        };
                        let updatedBrands = [...(profile.selectedBrands || profile.preferredBrands || [])];
                        if (LOYALTY_TO_BRANDS[p]) {
                          LOYALTY_TO_BRANDS[p].forEach(b => { if (!updatedBrands.includes(b)) updatedBrands.push(b); });
                        }
                        setProfile({ ...profile, loyaltyAccounts: updatedLoyalty, selectedBrands: updatedBrands, preferredBrands: updatedBrands });
                      }} style={{ padding: "7px 12px", color: "#8a8078", fontSize: "12px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {p}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
          {activePanel === "cards" && (
            <div>
              <div style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px" }}>Credit Cards</div>
              {cards.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ color: "#b0a898", fontSize: "12px" }}>{c.name}</div>
                    <div style={{ color: "#555", fontSize: "11px" }}>{c.multipliers || ""}</div>
                  </div>
                  <button onClick={() => {
                    const PILL_CARD_TO_LOYALTY = {
                      "Delta SkyMiles Reserve": "Delta SkyMiles", "Delta SkyMiles Platinum": "Delta SkyMiles",
                      "BofA Alaska Airlines Visa": "Alaska Mileage Plan", "United Explorer Card": "United MileagePlus",
                      "Citi AAdvantage Executive": "American AAdvantage", "Southwest Rapid Rewards Priority": "Southwest Rapid Rewards",
                      "Marriott Bonvoy Boundless": "Marriott Bonvoy", "World of Hyatt Card": "World of Hyatt",
                      "Hilton Honors Amex Surpass": "Hilton Honors",
                    };
                    const LOYALTY_TO_BRANDS = {
                      "Delta SkyMiles": ["Delta"], "Alaska Mileage Plan": ["Alaska"],
                      "United MileagePlus": ["United"], "American AAdvantage": ["American"],
                      "Southwest Rapid Rewards": ["Southwest"],
                    };
                    const linked = PILL_CARD_TO_LOYALTY[c.name];
                    const linkedBrands = linked ? (LOYALTY_TO_BRANDS[linked] || []) : [];
                    const updatedBrands = (profile.selectedBrands || profile.preferredBrands || []).filter(b => !linkedBrands.includes(b));
                    let updatedLoyalty = profile.loyaltyAccounts || [];
                    if (linked) updatedLoyalty = updatedLoyalty.filter(x => x.program !== linked);
                    setProfile({ ...profile,
                      cards: profile.cards.filter(x => x.name !== c.name),
                      loyaltyAccounts: updatedLoyalty,
                      selectedBrands: updatedBrands, preferredBrands: updatedBrands
                    });
                  }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#555", fontSize: "10px", padding: "2px 7px", cursor: "pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <input value={addCardInput} onChange={e => setAddCardInput(e.target.value)} placeholder="Add a card..." style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 10px", color: "#e8e4dc", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }} list="card-suggestions" />
                <datalist id="card-suggestions">{CARD_OPTIONS_LIST.map(c => <option key={c} value={c} />)}</datalist>
                <button onClick={() => {
                  if (addCardInput.trim()) {
                    const newCard = { name: addCardInput.trim(), multipliers: "" };
                    const updatedCards = [...(profile.cards||[]), newCard];
                    // Auto-add linked loyalty program
                    const PILL_CARD_TO_LOYALTY = {
                      "Delta SkyMiles Reserve": "Delta SkyMiles", "Delta SkyMiles Platinum": "Delta SkyMiles",
                      "BofA Alaska Airlines Visa": "Alaska Mileage Plan", "United Explorer Card": "United MileagePlus",
                      "Citi AAdvantage Executive": "American AAdvantage", "Southwest Rapid Rewards Priority": "Southwest Rapid Rewards",
                      "Marriott Bonvoy Boundless": "Marriott Bonvoy", "World of Hyatt Card": "World of Hyatt",
                      "Hilton Honors Amex Surpass": "Hilton Honors",
                    };
                    const linked = PILL_CARD_TO_LOYALTY[addCardInput.trim()];
                    let updatedLoyalty = profile.loyaltyAccounts || [];
                    if (linked && !updatedLoyalty.find(a => a.program === linked)) {
                      updatedLoyalty = [...updatedLoyalty, { program: linked, tier: "Member", balance: "" }];
                    }
                    // Auto-add linked brands from loyalty
                    const LOYALTY_TO_BRANDS = {
                      "Delta SkyMiles": ["Delta"], "Alaska Mileage Plan": ["Alaska"],
                      "United MileagePlus": ["United"], "American AAdvantage": ["American"],
                      "Southwest Rapid Rewards": ["Southwest"],
                    };
                    let updatedBrands = [...(profile.selectedBrands || profile.preferredBrands || [])];
                    if (linked && LOYALTY_TO_BRANDS[linked]) {
                      LOYALTY_TO_BRANDS[linked].forEach(b => { if (!updatedBrands.includes(b)) updatedBrands.push(b); });
                    }
                    setProfile({ ...profile, cards: updatedCards, loyaltyAccounts: updatedLoyalty, selectedBrands: updatedBrands, preferredBrands: updatedBrands });
                    setAddCardInput("");
                  }
                }} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "8px", color: "#C9A84C", fontSize: "11px", padding: "6px 12px", cursor: "pointer" }}>Add</button>
              </div>
            </div>
          )}
          {activePanel === "brands" && (
            <div>
              <div style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px" }}>Preferred Brands · {brands.length} selected</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {brands.map((b, i) => (
                  <span key={i} style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#8a7a5a", fontSize: "11px", padding: "4px 10px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {b}
                    <span onClick={() => setProfile({ ...profile, selectedBrands: brands.filter(x => x !== b), preferredBrands: brands.filter(x => x !== b) })} style={{ cursor: "pointer", color: "#555", fontSize: "10px" }}>✕</span>
                  </span>
                ))}
                {brands.length === 0 && <div style={{ color: "#555", fontSize: "12px", marginBottom: "10px" }}>No brand preferences set yet.</div>}
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <input id="brand-add-input" placeholder="Add a brand (e.g. Andaz, Kimpton)..." style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 10px", color: "#e8e4dc", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }} list="brand-suggestions" />
                <datalist id="brand-suggestions">{["Andaz","Thompson Hotels","Alila","Park Hyatt","Grand Hyatt","Autograph Collection","Edition","W Hotels","Kimpton","Hotel Indigo","Six Senses","Curio Collection","Tapestry Collection","Conrad","Waldorf Astoria","The Luxury Collection","Ritz-Carlton","St. Regis","Westin","Le Meridien"].map(b => <option key={b} value={b} />)}</datalist>
                <button onClick={() => { const inp = document.getElementById("brand-add-input"); const val = inp?.value?.trim(); if (val && !brands.includes(val)) { setProfile({ ...profile, selectedBrands: [...brands, val], preferredBrands: [...brands, val] }); if (inp) inp.value = ""; } }} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "8px", color: "#C9A84C", fontSize: "11px", padding: "6px 12px", cursor: "pointer" }}>Add</button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Bar */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: activePanel ? "none" : "1px solid rgba(255,255,255,0.06)", borderRadius: activePanel ? "0 0 12px 12px" : "12px", padding: "9px 16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ color: "#444", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "serif", flexShrink: 0 }}>Optimizing for</span>
        <button onClick={() => toggle("loyalty")} style={pillStyle(activePanel === "loyalty")}>
          Loyalty {activeLoyalty.length > 0 ? `· ${activeLoyalty.length}` : ""}
          {totalValue > 0 ? <span style={{ color: "#C9A84C", marginLeft: "4px" }}>est. ${totalValue.toLocaleString()}</span> : ""}
          <span style={{ marginLeft: "5px", fontSize: "9px", opacity: 0.5 }}>{activePanel === "loyalty" ? "▴" : "▾"}</span>
        </button>
        <button onClick={() => toggle("cards")} style={pillStyle(activePanel === "cards")}>
          Cards {cards.length > 0 ? `· ${cards.length}` : ""}
          <span style={{ marginLeft: "5px", fontSize: "9px", opacity: 0.5 }}>{activePanel === "cards" ? "▴" : "▾"}</span>
        </button>
        <button onClick={() => toggle("brands")} style={pillStyle(activePanel === "brands")}>
          Brands {brands.length > 0 ? `· ${brands.length}` : ""}
          <span style={{ marginLeft: "5px", fontSize: "9px", opacity: 0.5 }}>{activePanel === "brands" ? "▴" : "▾"}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function SojournApp() {
  useEffect(() => { mp.track("session_start"); }, []);
  const [phase, setPhase] = useState(() => { try { return localStorage.getItem("sojourn_profile") ? "chat" : "onboarding"; } catch(e) { return "onboarding"; } }); // onboarding | chat | results
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Where to next? Tell me about your trip — destination, rough dates, who's traveling, any preferences or must-haves. The more context you share, the sharper the options." }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripOptions, setTripOptions] = useState([]);
  const [tripSummary, setTripSummary] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const [focusedOptionId, setFocusedOptionId] = useState(null); // 6b — single option deep dive mode
  const [deepDiveConfirmed, setDeepDiveConfirmed] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineMessages, setRefineMessages] = useState([]);
  const [refineLoadingMessage, setRefineLoadingMessage] = useState("");
  const [itineraryOption, setItineraryOption] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const getSavedProfile = () => {
    try { const s = localStorage.getItem("sojourn_profile"); return s ? JSON.parse(s) : null; } catch(e) { return null; }
  };
  const [userProfile, setUserProfile] = useState(() => getSavedProfile() || USER_PROFILE);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const conversationRef = useRef([]);
  const [conciergeMode, setConciergeMode] = useState(true); // true = conversational, false = generating cards

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input requires Chrome or Edge."); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = e => setInput(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const buildSystemPrompt = () => {
    const p = userProfile;
    const tp = p.travelProfile || {};
    const cardList = (p.cards||[]).map(c=>c.name).join(", ");
    const airlinePrograms = ["United MileagePlus","Delta SkyMiles","American AAdvantage","Alaska Mileage Plan","Southwest Rapid Rewards","JetBlue TrueBlue","Emirates Skywards","British Airways Avios","Air France Flying Blue","Singapore KrisFlyer"];
    const hotelLoyalty = (p.loyaltyAccounts||[]).filter(a=>!airlinePrograms.includes(a.program)).map(a=>a.program+" ("+a.tier+", "+a.balance+")").join(", ");
    const airlineLoyalty = (p.loyaltyAccounts||[]).filter(a=>airlinePrograms.includes(a.program)).map(a=>a.program+" ("+a.tier+", "+a.balance+")").join(", ");
    const loyaltyList = (p.loyaltyAccounts||[]).map(a=>a.program+" ("+a.tier+", "+a.balance+")").join(", ");
    const brandList = (p.preferredBrands||[]).slice(0,15).join(", ");
    const learnedList = learnedPrefs.length > 0 ? learnedPrefs.join("; ") : null;
    return `You are Sojourn, an expert travel advisor and optimization engine. Reason carefully across this traveler's cards, loyalty programs, and preferences to surface 6 genuinely differentiated options.

TRAVELER PROFILE:
- Home airport: ${tp.homeAirport||"unknown"}
- Travel frequency: ${tp.frequency||"unknown"}
- Travel types: ${(tp.travelTypes||[]).join(", ")}
- Credit cards: ${cardList}
- Hotel loyalty: ${hotelLoyalty||"none"}
- Brand-to-program mapping: Marriott Bonvoy covers ${(LOYALTY_BRAND_MAP["Marriott Bonvoy"]||[]).join(", ")}. World of Hyatt covers ${(LOYALTY_BRAND_MAP["World of Hyatt"]||[]).join(", ")} — including Small Luxury Hotels (SLH) since 2023. Hilton Honors covers ${(LOYALTY_BRAND_MAP["Hilton Honors"]||[]).join(", ")}. IHG One Rewards covers ${(LOYALTY_BRAND_MAP["IHG One Rewards"]||[]).join(", ")}. Fairmont, Raffles, Rosewood, Four Seasons, Peninsula, Mandarin Oriental, Aman, Belmond, Montage are independent — no major loyalty program points.
- Airline miles: ${airlineLoyalty||"none"}${learnedList ? `
- LEARNED FROM PAST TRIPS: ${learnedList}` : ""}
- Preferred hotel brands: ${brandList}

Generate exactly 6 options as raw JSON. Output ONLY JSON — no markdown, no explanation, start with { end with }.

THE 6 OPTIONS (always in this order):
CRITICAL RULE BEFORE GENERATING ANY OPTION: If the user named a specific destination, ALL 6 options must be AT that destination. Never substitute a different destination to optimize a bucket — find the best hotel/flight FOR THAT DESTINATION that fits the bucket criteria.

EARNING-INTENT QUERY DETECTION: Activate this mode when the user's primary goal is accumulating points/miles/status — not spending them. Triggers include: "business trip", "work trip", "maximize points", "build my miles", "earn status", "working trip", "maximize earning", "best cards to use", "rack up points". When earning intent is detected, reorder the 6 buckets so redemption is last — a useful "by the way" not a primary recommendation. CRITICAL: in earning-intent mode, NEVER generate a "Future Value" card and NEVER use the phrase "Strategic Hold" or "preserve your miles" — the user already said they want to earn, not hold. The 6 slots are fixed as below and no other tag labels are permitted. Earning-intent bucket order:
1. RECOMMENDED (#C9A84C) — Best overall option for the trip that also maximizes earning. Lead with the earning story: which card earns what on which component, which hotel program earns best here.
2. BEST POINTS EARNED (#4C9AC9) — Highest total points/miles accumulation across all programs. Name every multiplier. Show the math: "3x flights via Delta Reserve + 5x hotel via Amex Platinum + base Bonvoy points = est. X total points worth $Y."
3. BEST VALUE (#C9C94C) — Lowest cash cost while still earning meaningfully. Not a redemption option — cash only, but smart card routing maximizes the earning on that cash spend.
4. QUALITY UPGRADE (#C94C8A) — Premium tier that also earns elite-qualifying miles/nights toward status. Frame around the status progress angle.
5. WILD CARD (#9A4CC9) — Surprising property or routing that earns disproportionately well — e.g. a hotel with a current bonus points promotion, or a route with a card spending offer.
6. REDEMPTION OPPORTUNITY (#4CC97A) — Tag label should be "Redemption Opportunity". This is a standard points redemption option for THIS SAME TRIP at THIS SAME DESTINATION — not a different destination. Only include this card if the redemption offers genuinely strong value (1.5+ cpp or meaningful cash savings). whyThis must open with a brief acknowledgment of the earning intent before making the case: "You mentioned building points — but this redemption offers strong enough value that it's worth a look." Then show the redemption math as normal: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile." If no strong redemption exists for this destination, generate a Best Points Earned option instead and skip this card. Never show a weak redemption just to fill the slot.

POINTS-LED QUERY DETECTION: Activate this mode when the user's intent is to redeem or use points/miles — even if vaguely stated. Triggers include: explicit balance mention ("I have 64k Delta miles"), redemption intent ("use my miles", "redeem points", "burn my Hyatt points"), or program-specific context established earlier in the conversation. When a single program is clear, anchor all 6 options around it. When multiple programs are mentioned or the user said "open to any", generate options that draw on whichever program offers the best value for each bucket and note why. Do NOT generate options that ignore stated redemption intent.

When a points-led query is detected, map the 6 buckets as follows — destination rules still apply, these redefine how each bucket is expressed:
1. RECOMMENDED (#C9A84C) — Best overall redemption of the stated program. Must achieve at least 1.5 cents per point to qualify — if no destination clears that threshold, pick the highest available and note it. Lead with the redemption story in whyThis, not the experience story. Format: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile — [rating]." Do not lead with hotel amenities or status perks — the miles value is the headline.
2. BEST POINTS REDEMPTION (#4CC97A) — Highest cents-per-point efficiency from the stated program on its NATURAL component (airline miles → flights, hotel points → hotel). Never redirect airline miles to a hotel or hotel points to flights. HEADLINE: frame around the destination and cpp angle — never use the words "maximum value" or "best value" (those belong to the Value bucket). Good headline framing: "destination · property · [X.X]¢ Per Mile" or "destination · property · High-Efficiency Redemption". In whyThis, spell out the redemption clearly: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile — [excellent/strong/solid] value." For context: 2.0+ cents per mile = excellent, 1.4-2.0 = strong, below 1.4 = marginal. redemption field must be non-null. redemptions array must include one entry with pointsUsed, dollarsValue, centsPerPoint, component.
3. BEST VALUE (#C9C94C) — Stack the stated program on its natural component PLUS secondary programs the traveler holds. RULE: if the stated program is an airline program, it MUST cover the flights (not pay cash for flights while using hotel points). Then layer hotel points on top to cover the accommodation. HEADLINE: frame around the stacking concept — e.g. "destination · property · Miles + Hotel Points Stack" or "destination · property · Combined Redemption". whyThis MUST open with the stacking framing in the first sentence — e.g. "This option combines your [airline] miles for flights and your [hotel] points for the hotel, covering both with redemptions." Then spell out the stack: "[X] miles on flights · estimated value $[Y] · [Z.Z] cents per mile. [A] hotel points · estimated value $[B]. Total cash out of pocket: $[C]." The opening line must immediately distinguish this from the Redemption option above it.
4. QUALITY UPGRADE (#C94C8A) — Use stated miles for premium cabin (business/first) AND layer hotel loyalty points for a luxury property. Stack both programs. Show what each covers and the combined cpp across both.
5. WILD CARD (#9A4CC9) — Either: (a) a surprisingly high-value redemption destination with the stated program the traveler wouldn't think of, OR (b) if a different program offers dramatically better value for this exact trip, name it explicitly with the math (e.g. "Alaska miles get you here for 15k vs Delta's 30k — worth the transfer"). Never substitute without showing the comparison.
6. FUTURE VALUE (#4C9AC9) — Strategic alternative: don't spend your miles on this trip at all. Pay cash, earn aggressively, and position for a bigger future redemption. Tag label should be "Future Value" not "Best Points Earned". In whyThis, make the case honestly but WITHOUT assuming specific future destinations the traveler hasn't mentioned — do not reference Tokyo, Europe, Maldives, or any specific aspirational destination unless the traveler has explicitly mentioned it earlier in conversation. Instead frame strategically: "Cash flights earn [X] miles via [card] + hotel earns [Y] points = [Z] total miles earned back. At your current balance of [N] miles, holding them positions you for a premium redemption when the right trip comes up — where you could get significantly more value per mile than this route offers." Let the math speak — the point is that their balance grows and they retain optionality, not that they should go somewhere specific. This option acknowledges the traveler's intent while offering a thoughtful strategic counterpoint.

FOR NON-POINTS QUERIES, use the standard bucket definitions:
1. RECOMMENDED (#C9A84C) — Best overall fit for this traveler's profile and stated preferences. Must be at stated destination.
2. BEST POINTS EARNED (#4C9AC9) — Maximizes loyalty accumulation at the STATED DESTINATION. Name the card and why. Never substitute a different destination for better points.
3. BEST POINTS REDEMPTION (#4CC97A) — Best use of existing balances at the STATED DESTINATION. redemption field must be non-null.
4. BEST VALUE (#C9C94C) — Lowest net cost after points at the STATED DESTINATION. Best experience per dollar.
5. QUALITY UPGRADE (#C94C8A) — Premium tier at the STATED DESTINATION: business/first class, black car, luxury hotel. Worth the price delta.
6. WILD CARD (#9A4CC9) — Surprising option the traveler wouldn't find on their own. Boutique, under-radar, or unexpected combination. Must be specific and defensible.
- When user names a specific destination, Wild Card MUST stay in that destination or same-airport area. For Park City: Deer Valley, Canyons Village, Snowbird (same SLC airport, 45 min, genuinely different mountain) = all valid. NEVER Beaver Creek, Vail, Breckenridge, Jackson Hole, Steamboat — different states, add hours of travel. Snowbird is the model Wild Card: same airport, different character, no travel penalty.
- Wild Card can only leave the named destination if: (1) the user said they were open to ideas, OR (2) an alternative destination has genuinely comparable or better direct flights AND is a meaningfully different experience AND you explain exactly why it beats the stated destination
- Wild Card is about surprising WITHIN the destination (boutique lodge, ski-in/ski-out chalet, lesser-known property) not substituting a different destination

TRIP LENGTH / FLIGHT DURATION MATCHING — HARD RULE:
- 2-3 night trips (long weekends): domestic or short-haul ONLY. Max ~5 hours flight time. Do NOT suggest international destinations requiring transatlantic or transpacific flights regardless of cpp value. Canada and Mexico qualify as short-haul.
- 4-5 night trips: North America, Caribbean, or Mexico only. Max ~8 hours.
- 6+ nights: international permitted.
- cpp optimization must NEVER override trip length logic. A 3-night trip to Amsterdam is wrong even if the redemption value is exceptional.

AIRLINE REDEMPTION PARTNERSHIPS — CRITICAL ACCURACY RULES:
- Delta SkyMiles redeem on: Delta flights, and SkyTeam partners only (Air France, KLM, Virgin Atlantic, Korean Air, Aeromexico, WestJet via codeshare). NEVER suggest redeeming Delta miles on JetBlue, Alaska, United, American, Southwest, or any non-SkyTeam carrier — these partnerships do not exist.
- Alaska Mileage Plan redeems on: Alaska flights and oneworld partners (American, British Airways, Cathay, Finnair, Qantas, Japan Airlines). NOT Delta, United, or Southwest.
- United MileagePlus redeems on: United flights and Star Alliance partners (Lufthansa, ANA, Singapore, Swiss, Air Canada). NOT Delta or American.
- American AAdvantage redeems on: American flights and oneworld partners. NOT Delta or United.
- Southwest Rapid Rewards: Southwest metal only, no partners.
- JetBlue TrueBlue: JetBlue metal only, limited partners. NOT redeemable with Delta miles.
- NEVER invent a partnership. If a route has no good redemption option on the stated program, say so and suggest the next best option or a cash alternative.
- NEVER invent earning bonuses, spending promotions, or route-specific multipliers that aren't real. The only legitimate earning differentiation between routes is (a) higher base fare = more miles on the same multiplier, and (b) confirmed card category bonuses (3x flights, 2x hotels, etc.). Do not claim a specific airport, airline, or route has a "bonus" or "promotion" unless the traveler's profile explicitly includes one.
- MULTI-LEG CLARITY: when miles cover a connecting itinerary, whyThis must specify "X miles cover both legs roundtrip for 2 travelers" not just total miles used. Never leave ambiguity about whether miles cover one leg or the full trip.

INTELLIGENCE RULES:
- Reference traveler's actual loyalty tier: "Your Marriott Gold gets confirmed late checkout and upgrade eligibility"
- Reference specific card multipliers: "Chase Sapphire Reserve 3x on hotels = 2,400 UR points worth ~$48"
- Room configs must match party size — be specific: "Two adjoining king rooms" not "hotel room"
- Flight details format: "AA 123 · SEA→MIA · Departs 7:45am → Arrives 4:02pm · 5h 17m nonstop" — duration MUST always be the last segment so it displays prominently next to flight times
- Hotel: ALWAYS use a real, specific named property (e.g. "Mokara Hotel & Spa" not "boutique hotel" or "historic inn"). Never invent placeholder names. If you cannot name a real property in the destination, use a nearby city with real inventory.
- Hotel detail: property name · exact room config matching party size (e.g. "Two adjoining Kings" or "3BR villa sleeps 6") · nights · neighborhood. Never just "suite" — always specify beds and how the party fits.
- Small/rural destinations: if the destination has fewer than 6 real bookable hotel options at the requested quality level, expand to the nearest metro area (e.g. Boerne TX → include San Antonio options 30 min away, label them clearly as "San Antonio · 30 min from Boerne"). Never fabricate hotel names.
- headline: ALWAYS follow this format: "[Location] · [Brand] · [Distinctive Element]" — e.g. "Maui · Andaz · Overwater Suite" or "Key Biscayne · Ritz-Carlton · Family Suites" or "Turks & Caicos · Amanyara · Direct JetBlue". Location first, brand second, what makes this option unique third. Never lead with the brand alone.
- subhead: one sentence describing the experience character — e.g. "Boutique adults-contemporary resort steps from Wailea Beach"
- tradeoff: one crisp specific sentence naming the actual tradeoff
- whyThis: 2-3 sentences specific to THIS traveler's profile and THIS trip's preferences
- Honor all stated constraints: weather minimums, family-friendly, geography, budget
- ASCII only — no accented characters, smart quotes, or apostrophes in string values
- totalCost, pointsValue, netValue: plain integers only (11850 not "$11,850")
- pointsValue: the DOLLAR VALUE of points earned (e.g. if earning 4,480 UR points at 1.5cpp, pointsValue = 67). Never leave as 0 if points are being earned.
- netValue = totalCost - pointsValue

LOYALTY BRAND PORTFOLIOS — boutique sub-brands that still earn full loyalty points:
- Marriott Bonvoy: Autograph Collection, Edition, Design Hotels, Tribute Portfolio, W Hotels, Westin, Le Meridien, The Luxury Collection, Ritz-Carlton, St. Regis, EDITION — all earn Bonvoy and qualify for Gold/Platinum benefits
- World of Hyatt: Andaz, Thompson Hotels, Alila, Unbound Collection, Joie de Vivre, tommie, Caption, Park Hyatt, Grand Hyatt, Hyatt Regency, Hyatt Centric — all earn Hyatt points
- Hilton Honors: Curio Collection, Tapestry Collection, Tempo, Canopy, Conrad, Waldorf Astoria, LXR — all earn Hilton points
- IHG One: Vignette Collection, Hotel Indigo, Kimpton, InterContinental, Six Senses — full IHG point earning
- When a traveler wants boutique character but also wants to earn points, ALWAYS consider these sub-brands before defaulting to independent properties

INDEPENDENT HOTELS — these do NOT earn major loyalty points (no Bonvoy, Hyatt, Hilton, IHG):
- Peninsula Hotels (PenClub only — not Marriott, not Hyatt)
- Four Seasons (own program only — not affiliated with any major chain)
- Rosewood Hotels (own program — not Marriott or Hyatt)
- Mandarin Oriental (own program — not affiliated)
- Aman Resorts (no meaningful loyalty program)
- Belmond (own program — not affiliated)
- Montage Hotels (own program — not affiliated)
- Auberge Resorts (own program — not affiliated)
- Relais & Chateaux (designation only — individual properties may or may not be in a loyalty program)
- Small Luxury Hotels of the World (designation only — not a loyalty program)
CRITICAL: NEVER assign Marriott, Hyatt, or Hilton points to independent hotels. If suggesting an independent hotel, pointsEarned should reflect credit card earning only (e.g. "2x via Amex Platinum on hotels") not loyalty program points.
CRITICAL: NEVER reference a hotel loyalty program the traveler does not hold. If the traveler has no IHG account, do not suggest Kimpton, InterContinental, or any IHG property as a points-earning option. Only suggest hotels whose loyalty program appears in the traveler's profile. If no matching hotel program exists for a given property, reference card earning only.

MULTI-CITY TRIPS: If the query involves multiple destinations (e.g. Chicago + Park City, Paris + London), structure each option to cover ALL legs. Use additional components beyond the standard 4 — e.g. "Flight to Chicago", "Chicago Hotel", "Flight to SLC", "Park City Hotel", "Rental Car", etc. Keep each component detail concise to stay within token limits. The headline should reflect the full trip: "Chicago + Park City · Marriott + Deer Valley"

DESTINATION DIVERSITY RULE:
- When a query is open-ended or exploratory (mentions multiple destinations, says "open to ideas", or gives no single destination) — NEVER place more than 2 options in the same destination city or island
- Spread options across the geographic possibility space: e.g. for "beach vacation, Florida or Hawaii, open to ideas" use 2 Hawaii, 2 Florida, 1 Caribbean, 1 Wild Card
- Only converge on a single destination when the user has explicitly narrowed to it or refinement has confirmed it
- Each of the 6 options should feel like a genuinely different trip, not a variation of the same trip in the same place

SINGLE-DESTINATION TRIPS — when user specifies a destination (e.g. "Carmel, CA"), ALL 6 options must stay within that destination area. NEVER split a single-destination trip across multiple locations within an option (e.g. "3 nights Carmel + 2 nights Napa" when user asked for Carmel). The Quality Upgrade bucket does NOT grant permission to suggest a different or additional destination — it means a premium property or cabin class at the SAME destination. Geographic proximity is not an excuse: Napa is NOT Carmel, Big Sur is adjacent and acceptable, but wine country is a different trip entirely. If the user asked for Carmel, every option stays in Carmel/Big Sur/Monterey Peninsula.

CARMEL / MONTEREY PENINSULA HOTEL INVENTORY — use these real properties, never reach toward Napa or Wine Country:
INDEPENDENT / RELAIS & CHÂTEAUX (no chain loyalty):
- L'Auberge Carmel — boutique luxury in the heart of Carmel village, Relais & Châteaux, Michelin-starred restaurant (Aubergine), no AC (ocean-cooled)
- Bernardus Lodge & Spa — Carmel Valley, Relais & Châteaux, wine country feel but IS in Carmel Valley (not Napa), excellent restaurant
- Post Ranch Inn — Big Sur, ultra-luxury, adults only, dramatic cliffside setting, 3 Michelin Keys, independent
- Ventana Big Sur — Big Sur, Alila brand (World of Hyatt), 3 Michelin Keys, adults only, stunning coastal setting — EARNS HYATT POINTS
- Tickle Pink Inn — Carmel Highlands, boutique, ocean views, independent

WORLD OF HYATT:
- Ventana Big Sur (Alila) — 3 Michelin Keys, top-tier Hyatt redemption
- Hyatt Carmel Highlands — dramatic ocean views, Point Lobos area, solid Hyatt property
- Carmel Valley Ranch — Hyatt, sprawling ranch resort, golf, spa, family-friendly

MARRIOTT BONVOY:
- Monterey Plaza Hotel & Spa — on Cannery Row, full-service, good Bonvoy earn/redeem
- Portola Hotel & Spa — downtown Monterey, Autograph Collection, Bonvoy
- InterContinental The Clement Monterey — IHG, waterfront Cannery Row

HILTON:
- Carmel Mission Inn — modest but well-located, Hilton, good value
- Hyatt Place Monterey — reliable points earn, walking distance to downtown Monterey

AIRPORT: Fly into MRY (Monterey Regional) — short hop, 10 min to Carmel. Alternative: SFO/SJC then 2hr scenic drive down Hwy 1 or 101.
NEVER suggest Auberge du Soleil (that is Napa Valley). Bernardus Lodge is Carmel Valley — acceptable. Post Ranch and Ventana are Big Sur — acceptable and adjacent.

COMPONENT VALUE RULE — CRITICAL:
- component "value" field = cash out of pocket for that component ONLY. Never the points dollar equivalent.
- If fully covered by points: value = 0
- If cash paid: value = cash amount (integer)
- If partially covered: value = cash portion only
- totalCost = sum of all component cash values (what the traveler actually pays in cash)
- component "points" field = describe redemption OR earning with explicit language:
  - If redeeming: "25,000 Delta miles redeemed" or "30,000 Hyatt points redeemed" — always include the word "redeemed"
  - If earning: "est. 2,400 Delta miles earned" or "est. 4,200 Bonvoy points earned" — always include "est." and "earned"
  - Never mix redemption and earning in the same points field
- loyaltyHighlight = a friendly, plain-English reminder of all the status perks and program benefits this specific traveler unlocks on this specific trip — across ALL their programs, not just hotels. Think of it as: "here's what you've earned, don't leave it on the table." Include: airline lounge access if they have status + departure airport has that lounge (e.g. "Delta Sky Club access at SEA"), hotel status perks unlocked at this property (e.g. "Hyatt Discoverist: late checkout + room upgrade eligibility"), any card travel perks relevant to this trip (e.g. "Amex Platinum: $200 hotel credit eligible"), elite lane / priority boarding if applicable. Keep it to 2-4 genuinely relevant perks — don't list every possible benefit, only the ones that meaningfully apply to this option. Do NOT repeat the points math here (that's covered in components and redemptions). Tone: warm, like a knowledgeable friend reminding you of things you might forget to use.
- cardStrategy = which card to use for each cash-paid component and why, based on the highest earning multiplier for that spend category. Format: "Flights: [card] ([Nx] miles) · Hotel: [card] ([Nx] points) · Dining: [card] ([Nx] points)". Only include components where cash is paid — skip components covered by points redemption. This must reflect the traveler's actual cards and their actual category multipliers. Never invent a multiplier. If two cards tie, pick the one that earns the program with the higher cpp value.
- whyThis = frame cash figures consistently with what the card shows — if flights are $0 out of pocket, say "flights covered by your miles" not "flights cost $X"
- pointsEarned (top-level) = earning side ONLY — points this trip generates on cash-paid components. CRITICAL: if a component is covered by a redemption, it earns NO points — do NOT include that program in pointsEarned. Example: if Delta miles cover flights, do NOT include "Delta miles earned" in pointsEarned. Only include programs earned on cash-paid components (e.g. hotel cash spend earns Bonvoy, ground spend earns card points).
- pointsValue (top-level) = estimated dollar value of points EARNED only (not redeemed). If no cash components earn meaningful points, pointsValue = 0 and pointsEarned = "".
- netValue = totalCost - pointsValue
- redemptions (top-level array) = list each redemption applied: [{"program": "Delta SkyMiles", "pointsUsed": 50000, "dollarsValue": 700, "centsPerPoint": 1.4, "component": "Flights"}]. One entry per redeemed program. Leave as [] if no redemptions.

REQUIRED JSON SCHEMA:
{"tripSummary":{"origin":"","destination":"","dates":"","preferences":[],"constraints":[]},"options":[{"id":1,"tag":"Recommended","tagColor":"#C9A84C","headline":"","subhead":"","totalCost":0,"pointsEarned":"","pointsValue":0,"netValue":0,"redemption":null,"redemptions":[],"tags":[],"tradeoff":"","loyaltyHighlight":"","cardStrategy":"","whyThis":"","components":[{"label":"Flight","day":1,"value":"","detail":"","points":"","card":""},{"label":"Return Flight","day":5,"value":"","detail":"","points":"","card":""},{"label":"Hotel","day":1,"nights":3,"value":"","detail":"","points":"","card":""},{"label":"Ground","day":1,"value":"","detail":"","points":"","card":""}],"experiences":[]}]}. CRITICAL: (1) every component MUST include a day integer (1-based). Multi-property stays get separate components each with their own day. Return transport day = total nights + 1. (2) experiences[] must be an EMPTY ARRAY by default. ONLY populate it if the user has explicitly requested specific dining, activities, breweries, distilleries, or excursions in this conversation and asked for them to be included. Never speculatively generate experiences.`;
  };


  const callClaude = async (userMessage) => {
    conversationRef.current = [...conversationRef.current, { role: "user", content: userMessage }];
    setLoading(true);

    if (!ANTHROPIC_KEY) {
      setMessages(prev => [...prev, { role: "assistant", text: "Configuration error: API key not found." }]);
      setLoading(false);
      return;
    }

    // ── CONCIERGE MODE: clarify before generating ──────────────────────────
    if (conciergeMode) {
      try {
        const p = userProfile;
        const tp = p.travelProfile || {};
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            system: `You are Sojourn, an expert travel concierge.

Traveler profile: home airport=${tp.homeAirport||"unknown"}, travel types=${(tp.travelTypes||[]).join(", ")}, cards=${(p.cards||[]).map(c=>c.name).join(", ")}.

Default to READY. Generate options unless a truly critical piece is missing.

Go READY immediately if you have: any destination or travel theme, any timeframe (even vague like "spring" or "summer"), any party size OR if traveling solo is a reasonable assumption.
Party size can be assumed as 2 if not stated. Timeframe like "mid-May" or "this summer" is sufficient. Vague destinations like "somewhere warm" or "best long weekend I haven't thought of" are sufficient.

POINTS CLARIFICATION: Only ask a clarifying question if the user's intent is clearly to REDEEM points (e.g. "use my miles", "redeem points", "burn my points", "use airline miles for this") AND no specific program is named. Do NOT ask this question if the user says "build points", "earn points", "maximize points", "rack up miles", "want points" — these are earning intent, not redemption intent, and should go straight to READY. When clarification is needed, ask: "Which program are you thinking of — [list only their actual LOYALTY PROGRAMS from profile, never credit card issuers] — or are you open to whichever offers the best value?" Only list programs like Delta SkyMiles, Marriott Bonvoy, World of Hyatt — never card names like Chase, Amex, USAA, BofA.

Only ask ONE question total per conversation turn.
NEVER ask about budget, hotel preference, or anything already in the profile.
NEVER ask a follow-up if you already asked one question this conversation.

When ready, respond with EXACTLY:
READY: [one sentence reflecting back what you heard, e.g. "Got it — Seattle to Miami, 5 nights in mid-April, party of 2, beach focus."] Ready for me to generate your options?

Conversation so far: ${JSON.stringify(conversationRef.current)}`,
            messages: [{ role: "user", content: userMessage }],
          })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text?.trim() || "";

        if (reply.startsWith("READY:")) {
          const confirmation = reply.replace("READY:", "").trim();
          setMessages(prev => [...prev, { role: "assistant", text: confirmation, isReadyPrompt: true }]);
          setConciergeMode(false);
        } else {
          // Need more info — show question
          setMessages(prev => [...prev, { role: "assistant", text: reply }]);
        }
      } catch(e) {
        // If concierge fails, just generate directly
        setConciergeMode(false);
        setLoading(false);
        callClaude(userMessage);
        return;
      }
      setLoading(false);
      return;
    }

    // ── GENERATION MODE: produce cards ────────────────────────────────────
    const loadingSteps = [
      "Reviewing your loyalty accounts...",
      "Checking points balances and tier status...",
      "Sourcing flight options from your home airport...",
      "Matching hotels to your preferred brands...",
      "Optimizing card routing for maximum rewards...",
      "Calculating net cost across all options...",
      "Ranking and finalizing your 6 options...",
    ];
    let stepIndex = 0;
    setLoadingMessage(loadingSteps[0]);
    const messageInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setLoadingMessage(loadingSteps[stepIndex]);
    }, 2400);
    const clearMessages = () => { clearInterval(messageInterval); setLoadingMessage(""); };

    const fullContext = conversationRef.current.map(m => m.content).join(" ");

    const tryGenerate = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 6000,
            temperature: 0.5,
            system: buildSystemPrompt(),
            messages: [{ role: "user", content: fullContext }],
          })
        });
        clearTimeout(timeout);
        const data = await res.json();
        if (data.error) throw new Error(`API error: ${data.error.type} - ${data.error.message}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = data.content?.[0]?.text?.trim() || "";
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const s = cleanText.indexOf("{");
        const e = cleanText.lastIndexOf("}");
        if (s === -1 || e === -1) throw new Error("No JSON in response");
        let jsonStr = cleanText.slice(s, e + 1);
        jsonStr = jsonStr.replace(/['']/g, "'").replace(/[""]/g, '"');
        const parsed = JSON.parse(jsonStr);
        if (!parsed.options?.length) throw new Error("No options array");
        return parsed;
      } catch(e) {
        clearTimeout(timeout);
        throw e;
      }
    };

    try {
      const parsed = await tryGenerate();
      const isEarningQuery = /business.?trip|work.?trip|maximize.?point|build.?mile|build.?point|earn.?status|rack.?up|maximize.?earn/i.test(input);
      const filteredOptions = isEarningQuery
        ? parsed.options.map(o => o.tag === "Future Value" ? { ...o, tag: "Redemption Opportunity", tagColor: "#4CC97A" } : o)
        : parsed.options;
      setTripOptions(filteredOptions);
      setTripSummary(parsed.tripSummary);
      setPhase("results");
    } catch(e) {
      try {
        const parsed = await tryGenerate();
        const isEarningQuery2 = /business.?trip|work.?trip|maximize.?point|build.?mile|build.?point|earn.?status|rack.?up|maximize.?earn/i.test(input);
        const filteredOptions2 = isEarningQuery2
          ? parsed.options.map(o => o.tag === "Future Value" ? { ...o, tag: "Redemption Opportunity", tagColor: "#4CC97A" } : o)
          : parsed.options;
        setTripOptions(filteredOptions2);
        setTripSummary(parsed.tripSummary);
        setPhase("results");
        mp.track("cards_generated", { destination: parsed.tripSummary?.destination || "unknown", option_count: parsed.options?.length || 0 });
      } catch(e2) {
        setMessages(prev => [...prev, { role: "assistant", text: "Having trouble generating your options — please try again." }]);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

    const handleSend = () => {
      mp.track("query_submitted", { query_length: input.length });
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    callClaude(msg);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // Detect if user is expressing preference for a specific option
  const detectFocusIntent = (msg, options) => {
    const lower = msg.toLowerCase();
    const preferenceSignals = ["let's go with", "let's do this", "going with", "i'll take", "lock in", "i'm sold", "sold on", "book this", "let's book", "i've decided", "decided on", "this is the one", "that's the one", "let's lock", "i want to book", "ready to book", "i would like to go with", "i'd like to go with", "i want to go with", "i'm going with", "i'll go with", "let's do the", "i want the", "i'll take the", "i'm ready to book"];
    const hasSignal = preferenceSignals.some(s => lower.includes(s));
    if (!hasSignal) return null;
    // Try to match to a specific option by tag or keyword
    for (const opt of options) {
      const tag = (opt.tag || "").toLowerCase();
      const headline = (opt.headline || "").toLowerCase();
      const keywords = [...tag.split(" "), ...headline.split(" ").slice(0, 4)];
      if (keywords.some(k => k.length > 3 && lower.includes(k))) return opt.id;
    }
    return null;
  };

  const handleRefine = async (directMsg) => {
    const msg = directMsg || refineInput.trim();
    if (!msg || refineLoading) return;
    const isDeepDiveTrigger = msg.startsWith("__deepdive__");
    const optIdFromTrigger = isDeepDiveTrigger ? parseInt(msg.replace("__deepdive__","")) : null;
    mp.track("refinement_submitted", { message_count: refineMessages.length, message: isDeepDiveTrigger ? "deep_dive_trigger" : msg.slice(0, 100) });
    if (!directMsg) setRefineInput("");
    // For deep dive trigger — don't show user message, inject as silent system nudge
    if (!isDeepDiveTrigger) {
      setRefineMessages(prev => [...prev, { role: "user", text: msg }]);
    }
    setRefineLoading(true);

    // 6b trigger — check for explicit preference signal
    const activeOptions = tripOptions.filter(o => !dismissedIds.includes(o.id));
    if (!deepDiveConfirmed && !focusedOptionId) {
      const detectedId = detectFocusIntent(msg, activeOptions);
      if (detectedId) {
        const opt = tripOptions.find(o => o.id === detectedId);
        setRefineLoading(false);
        setRefineMessages(prev => [...prev, {
          role: "assistant",
          text: `Great choice — the ${opt.tag} option is a strong fit for this trip. Want me to focus in and walk you through all the details so you feel completely confident before booking?`,
          isDeepDivePrompt: true,
          optionId: detectedId
        }]);
        return;
      }
    }

    const refineSteps = [
      "Thinking through your request...",
      "Reviewing current options...",
      "Checking your loyalty accounts...",
      "Finding the best alternatives...",
      "Refining your options...",
    ];
    let refineStepIdx = 0;
    setRefineLoadingMessage(refineSteps[0]);
    const refineInterval = setInterval(() => {
      refineStepIdx = (refineStepIdx + 1) % refineSteps.length;
      setRefineLoadingMessage(refineSteps[refineStepIdx]);
    }, 2000);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: `You are Sojourn, an expert travel advisor. The traveler has seen their options and wants to refine or explore further.

TRAVELER PROFILE:
- Home airport: ${userProfile.travelProfile?.homeAirport || "unknown"}
- Cards: ${userProfile.cards.map(c=>c.name).join(", ")}
- Hotel loyalty: ${(userProfile.loyaltyAccounts||[]).filter(a=>!["United MileagePlus","Delta SkyMiles","American AAdvantage","Alaska Mileage Plan","Southwest Rapid Rewards","JetBlue TrueBlue"].includes(a.program)).map(a=>`${a.program} (${a.tier}, ${a.balance})`).join(", ")}
- Airline miles: ${(userProfile.loyaltyAccounts||[]).filter(a=>["United MileagePlus","Delta SkyMiles","American AAdvantage","Alaska Mileage Plan","Southwest Rapid Rewards","JetBlue TrueBlue"].includes(a.program)).map(a=>`${a.program} (${a.tier}, ${a.balance})`).join(", ")}
- Preferred brands: ${(userProfile.preferredBrands||[]).slice(0,15).join(", ")}

ORIGINAL TRIP REQUEST: ${(conversationRef.current&&conversationRef.current[0]&&conversationRef.current[0].content) || "unknown"}

PERSISTENT CONSTRAINTS — these carry through ALL refinements and cannot be overridden by a refinement message unless the user explicitly cancels them:
- If the original request mentioned a points/miles balance or redemption intent, that remains the PRIMARY organizing lens for all 6 options. Refinements narrow the destination or add preferences — they do not reset the points intent.
- If the original request specified a trip length (e.g. "3 nights", "long weekend"), maintain that constraint and apply the flight duration matching rule (3 nights = domestic/short-haul only).
- If a refinement adds a new constraint (e.g. "domestic only", "5 hours max"), ADD it to existing constraints — do not replace the original ones.
- Always regenerate options that honor ALL accumulated constraints from original query + all refinements combined.
- When the user asks to swap or replace a specific option (e.g. "swap the wild card"), replace ONLY that option. All other options remain unchanged. The replacement option must still honor the bucket's role AND the original points-led intent — a swapped Wild Card in a points-led query must still show a redemption with cpp math, not revert to a cash trip.
- NEVER regenerate a replacement option that ignores the original points/miles intent just because the refinement message didn't re-state it.

CURRENT OPTIONS SHOWING — use these exact values when answering any comparison or earning question, do not reason independently:
${(tripOptions||[]).filter(o => !dismissedIds.includes(o.id)).map(o => {
  const compSummary = (o.components||[]).map(c => c.label + ": $" + (c.value||0) + (c.card ? " via " + c.card : "") + (c.points ? " (" + c.points + ")" : "")).join(" · ");
  return "[" + (o.tag||"") + "] " + (o.headline||"") + " ($" + (o.totalCost||0) + ")" +
    (o.cardStrategy ? "\n  Card Strategy: " + o.cardStrategy : "") +
    (o.loyaltyHighlight ? "\n  Loyalty: " + o.loyaltyHighlight : "") +
    (compSummary ? "\n  Components: " + compSummary : "");
}).join("\n\n")}${dismissedIds.length > 0 ? "\n\nDismissed by user (do not regenerate): " + tripOptions.filter(o => dismissedIds.includes(o.id)).map(o => o.headline).join(", ") : ""}


WHEN TO GENERATE NEW CARDS — do this immediately, no confirmation needed:
- User wants changes: swap, replace, remove, add, update, "yes", "yes please", any budget or preference change
- TRIP LENGTH / FLIGHT DURATION RULE: apply same as options generation — 3-night trips = domestic/short-haul only (max ~5h flight). Points-led intent from original query persists even after destination refinement.
- User asks to add restaurants, activities, breweries, or any experiences to an option — add them to experiences[] and regenerate immediately
- User says "add X to the itinerary", "include X", "put X in", "pencil in", "update the itinerary", "can you update the cards" — regenerate immediately
- Always output preamble (1-2 sentences summarizing what changed) THEN immediately the complete JSON — preamble FIRST, JSON SECOND, nothing after the JSON
- NEVER claim you updated or added something without outputting new JSON — if you say you added it, the JSON must be in your response
- NEVER split the response with text before AND after the JSON — all natural language goes before the opening brace
- The JSON is machine-readable and will be silently consumed by the app — it will NEVER be shown to the user as text. Do not explain it, annotate it, or add any text after it. The user will only ever see the preamble sentence and the updated cards.
- NEVER ask "shall I update the cards?" or "just say yes to update" — if the intent is clear, just do it

EXPERIENCES ARRAY — critical rules:
- When user asks to add specific dining/activities, populate experiences[] on the relevant option with objects: { name, type (dining|activity|brewery|excursion), day, time, detail, bookUrl (opentable/resy if dining) }
- Assign days intelligently — brunch on Day 2 morning, dinner on Day 2 or 3 evening, hike on Day 1 or 2, brewery on Day 2 afternoon
- ALL other options that were not mentioned keep their existing experiences[] unchanged
- The experiences MUST appear in the JSON — do not describe them only in the preamble text

WHEN TO RESPOND CONVERSATIONALLY:
- Factual questions, comparisons, requests for more information about a specific option
- Recommending restaurants/activities is conversational — but as soon as the user says "add those" or "include those", switch to card generation immediately
- Be specific: name properties, quote prices, give times
- Reference the traveler's loyalty tier and card benefits by name

EARNING COMPARISON QUESTIONS — when asked to compare earning rates across options:
- Base your answer ONLY on the card and multiplier already assigned to each component in the current options (the "card" field per component) — do not reason independently from the traveler's full card profile
- Lead with the programs and cards that are actually reflected in the shown options — if all options show Delta flights, anchor the earning story on Delta, not Alaska or other cards
- Only mention a card or program if it explicitly appears in the current option's Card Strategy or component card fields
- Do not surface Alaska miles earning on hotel spend if Alaska is not the card assigned to any component in the shown options
- ANSWER FORMAT: lead with the single most useful insight first (e.g. "Your Delta Reserve is doing the heavy lifting on flights across all options — the real differentiation is the hotel program"), then support with per-option detail. Keep total response to 3-5 sentences or a short structured list — do not write a paragraph per option

DEEP DIVE MODE${focusedOptionId ? " — ACTIVE" : ""}:
${focusedOptionId ? `The traveler has chosen the ${tripOptions.find(o=>o.id===focusedOptionId)?.tag} option: "${tripOptions.find(o=>o.id===focusedOptionId)?.headline}". You are now in guided confirmation mode.
- Frame it as: "Let's go through each part of this trip together"
- Cover ALL components in ONE opening message — transportation, lodging, other — with one key detail each
- End that message with a single question: "Does everything look good, or is there anything you'd like to adjust?"
- If they flag something specific, drill into just that component
- If there's a next-best alternative (different departure time, different room type), mention it once briefly inline
- When everything is confirmed, close with exactly one sentence: "Your trip is set — click 'Book This Trip' whenever you're ready." Stop there.
- Tone: warm, confident, forward-moving — concierge finalizing, not salesperson closing` : "Standard refinement mode — present options and answer questions."}

BOOKING INTENT DETECTION — critical:
- If the traveler says anything like "I would like to go with", "I want the X option", "let's do the X", "I'm going with X", "ready to book" — treat this as a booking intent signal
- Respond with the soft deep-dive prompt: "Great choice — want me to walk you through the details before you book?" with Yes/Keep options
- NEVER respond to booking intent with a generic checklist of external booking links — that breaks the experience entirely
- NEVER say "book on amtrak.com" or "search for hotels" — you are the concierge, not a search engine

CONCIERGE TONE RULES — critical:
- Never say "I don't have access to real-time data" or "I can't verify" or "you should check" — this breaks trust
- If uncertain about a specific fact, hedge confidently: "Alaska typically runs seasonal directs SEA-MIA in spring — worth confirming on their site before booking" not "I'm not sure, please verify yourself"
- Never expose internal limitations or backpedal awkwardly — a good concierge says "let me check on that" and comes back with a useful answer
- If you stated something wrong, correct it cleanly in one sentence and move forward — don't over-explain or apologize
- Always maintain the posture of a knowledgeable advisor who is being appropriately careful, not an AI exposing its constraints

FLIGHT ROUTE KNOWLEDGE — Seattle (SEA) to common beach destinations:
- SEA-HNL (Honolulu): Alaska and Hawaiian direct, ~5h45m
- SEA-OGG (Maui): Alaska direct seasonal, ~6h15m  
- SEA-KOA (Kona): Alaska direct seasonal, ~6h
- SEA-MIA (Miami): Alaska seasonal direct (spring/summer), otherwise 1 stop via LAX/PHX
- SEA-FLL (Fort Lauderdale): Alaska seasonal, typically 1 stop
- SEA-TPA (Tampa): Usually 1 stop via Denver or Phoenix
- SEA-MCO (Orlando): Delta seasonal, typically 1 stop
- SEA-SAN (San Diego): Alaska and Southwest direct, ~2h30m
- SEA-CUN (Cancun): Alaska seasonal direct
- SEA-NAS (Nassau): 1 stop via Miami or Atlanta
- Caribbean/BVI/Turks: always 1-2 stops via Miami or Atlanta
- Delta Platinum status: upgrades and priority most valuable on longer nonstop legs

DESTINATION GATEWAY RULES — always use the correct arrival airport:
- Florida Keys (Key Largo, Islamorada, Marathon, Key West): fly into MIA or FLL, never ATL — ATL adds 2+ hours
- Key West specifically: MIA then drive 3.5h, or FLL then drive 4h, or direct to EYW (Key West airport, limited service)
- Naples FL / Marco Island: fly into RSW (Fort Myers) or MIA
- Sanibel/Captiva: fly into RSW (Fort Myers)
- 30A / Destin / Panama City: fly into VPS or PNS
- Savannah / Hilton Head: fly into SAV
- Charleston SC: fly into CHS — Alaska has direct SEA-CHS seasonally
- Sea Island / Golden Isles GA: fly into BQK (Brunswick) or SAV
- Turks & Caicos: fly into PLS via MIA or JFK
- St. Barts: fly into SXM (St. Maarten) then ferry or puddle-jump
- BVI (Virgin Gorda, Tortola): fly into EIS via SJU (San Juan) or STT (St. Thomas)
- Nevis: fly into NEV via SJU or ATL

HARD CONSTRAINTS — these override everything else:
- Honor ALL stated constraints across every option: weather minimums (80+ degrees means every option must hit 80+), family-friendly (no adults-only), geographic limits, budget
- If user says "Park City" every non-Wild-Card option MUST be in Park City or immediately adjacent resorts (Deer Valley, Canyons). Beaver Creek, Vail, Steamboat are different states — never substitute these for a named destination.
- The Wild Card may go outside geography but MUST still honor weather and family constraints, and must never require driving past or significantly away from the stated destination
- If user said 80+ degrees, Massachusetts/Big Sur/San Francisco/Pacific NW are never valid options in April
- Warm April destinations (80+F): Hawaii, South Florida, Caribbean, Mexico, Turks & Caicos, Bahamas — these always work
- Borderline April destinations (75-80F): Southern California, Naples FL — only include if user has not set a hard weather minimum

COMPONENT VALUE RULE: component value = cash out of pocket only (0 if covered by points). points field: use "X miles/points redeemed" for redemptions, "est. X points earned" for earning. loyaltyHighlight = status perks and program benefits across ALL programs relevant to this trip — lounge access, hotel status perks, card travel credits. Not points math (that's in components). cardStrategy = highest-earning card per cash-paid component with multiplier.
CARD FIELD RULE: component card field must name the specific card AND the earning reason in this format: "[Card Name] · [Nx] [category]" — e.g. "Chase Sapphire Reserve · 3x travel" or "Amex Platinum · 5x hotels". Never just list the card name alone. Pick the card with the highest multiplier for that spend category from the traveler's actual cards.

JSON SCHEMA — you MUST use exactly these field names or cards will not display:
{"tripSummary":{"origin":"","destination":"","dates":"","preferences":[],"constraints":[]},"options":[{"id":1,"tag":"","tagColor":"","headline":"","subhead":"","totalCost":0,"pointsEarned":"","pointsValue":0,"netValue":0,"redemption":null,"redemptions":[],"tags":[],"tradeoff":"","loyaltyHighlight":"","cardStrategy":"","whyThis":"","components":[{"label":"Flight","day":1,"value":"","detail":"","points":"","card":""},{"label":"Return Flight","day":5,"value":"","detail":"","points":"","card":""},{"label":"Hotel","day":1,"nights":3,"value":"","detail":"","points":"","card":""},{"label":"Ground","day":1,"value":"","detail":"","points":"","card":""}],"experiences":[]}]}. CRITICAL: (1) every component MUST include a day integer. (2) experiences[] is EMPTY by default. Only populate it when the user has explicitly requested specific dining or activities and asked for them to be included in their trip. Never generate experiences speculatively.
NEVER use: results, cards, tripOptions, color, title, property, priceStructure — these will break the display.

CARD QUALITY RULES (when generating new cards):
- Each option must be genuinely distinct with a clear optimization angle
- whyThis: 2-3 sentences, specific to THIS traveler's loyalty status and THIS trip
- tradeoff: one crisp specific sentence — never generic
- Room configs must match party size
- Reference actual card multipliers and loyalty tier benefits
- Tags: Recommended/#C9A84C, Best Points Earned/#4C9AC9, Best Points Redemption/#4CC97A, Best Value/#C9C94C, Quality Upgrade/#C94C8A, Wild Card/#9A4CC9
- totalCost/pointsValue/netValue: plain integers only
- ASCII only — no accented chars or smart quotes

Please respond now.`,
          messages: [
            ...(refineMessages||[]).filter(m=>m&&m.text).map(m => ({
              role: m.role === "assistant" ? "assistant" : "user",
              // Strip any JSON from assistant messages in history to keep context clean
              content: m.role === "assistant"
                ? (m.text || "").replace(/\s*[\[{][\s\S]*$/, "").trim() || "Updated your options."
                : (m.text || "")
            })),
            { role: "user", content: isDeepDiveTrigger
                ? `Please walk me through this trip now. Cover all components — transportation, lodging, and anything else — in one message with the key details for each. Then ask one single question: does everything look good, or is there anything to adjust? Keep it concise.`
                : msg }
          ],
        })
      });
      const data = await res.json();
      let replyText = data.content?.[0]?.text?.trim() || "";

      // Try to parse as new options set — handle multiple JSON formats
      const normalizeOptions = (raw) => {
        // Normalize alternate field names the AI sometimes uses
        return raw.map((o, i) => ({
          id: o.id || i + 1,
          tag: o.tag || o.type || "Option",
          tagColor: o.tagColor || o.color || "#C9A84C",
          headline: o.headline || o.title || o.name || "",
          subhead: o.subhead || o.subtitle || o.description || "",
          totalCost: typeof o.totalCost === "number" ? o.totalCost : parseInt(String(o.totalCost||o.price||"0").replace(/[^0-9]/g,"")) || 0,
          pointsEarned: o.pointsEarned || o.points_earned || "",
          pointsValue: (() => {
            const raw = typeof o.pointsValue === "number" ? o.pointsValue : parseInt(String(o.pointsValue||"0").replace(/[^0-9]/g,"")) || 0;
            const tc = typeof o.totalCost === "number" ? o.totalCost : parseInt(String(o.totalCost||"0").replace(/[^0-9]/g,"")) || 0;
            if (raw === tc && tc > 0) {
              const pts = parseInt(String(o.pointsEarned||"").replace(/[^0-9]/g,"")) || 0;
              return pts > 0 ? Math.round(pts * 0.015) : 0;
            }
            return raw;
          })(),
          netValue: (() => {
            const tc = typeof o.totalCost === "number" ? o.totalCost : parseInt(String(o.totalCost||"0").replace(/[^0-9]/g,"")) || 0;
            const rawPV = typeof o.pointsValue === "number" ? o.pointsValue : parseInt(String(o.pointsValue||"0").replace(/[^0-9]/g,"")) || 0;
            const pv = rawPV === tc && tc > 0 ? Math.round((parseInt(String(o.pointsEarned||"").replace(/[^0-9]/g,""))||0) * 0.015) : rawPV;
            const rawNV = typeof o.netValue === "number" ? o.netValue : parseInt(String(o.netValue||"0").replace(/[^0-9]/g,"")) || 0;
            // If netValue is 0 or equals totalCost, recalculate
            if (rawNV === 0 || rawNV === tc) return Math.max(0, tc - pv);
            return rawNV;
          })(),
          redemption: o.redemption || null,
          redemptions: Array.isArray(o.redemptions) ? o.redemptions : [],
          tags: o.tags || [],
          tradeoff: o.tradeoff || "",
          loyaltyHighlight: o.loyaltyHighlight || o.loyaltyBenefit || "",
          cardStrategy: o.cardStrategy || "",
          whyThis: o.whyThis || o.why || o.reason || "",
          experiences: Array.isArray(o.experiences) ? o.experiences : [],
          components: o.components || [
            { label: "Flight", value: o.flight || "", detail: o.flight || "", points: "", card: "" },
            { label: "Hotel", value: o.price || "", detail: (o.property || o.brand || "") + (o.location ? " · " + o.location : "") + (o.nights ? " · " + o.nights + " nights" : "") + (o.rooms ? " · " + o.rooms : ""), points: "", card: "" },
            { label: "Ground", value: o.rental || "", detail: o.rental || "", points: "", card: "" },
          ],
        }));
      };

      const tryParseRefine = (text) => {
        // Strip markdown fences first
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        // Format 1: full {tripSummary, options:[]} wrapper
        // Look for the LAST valid JSON object to handle preamble text before JSON
        try {
          // Find the options array marker specifically to avoid preamble JSON snippets
          const optionsIdx = text.indexOf('"options"');
          const start = optionsIdx > -1 ? text.lastIndexOf("{", optionsIdx) : text.indexOf("{");
          const end = text.lastIndexOf("}");
          if (start !== -1 && end !== -1 && end > start) {
            const parsed = JSON.parse(text.slice(start, end + 1));
            const arr = parsed.options || parsed.cards || parsed.tripOptions || parsed.results;
            if (arr?.length > 0) return { options: normalizeOptions(arr), summary: parsed.tripSummary, preamble: text.slice(0, start).trim() };
          }
        } catch(e) {}
        // Format 2: raw array [{id:1...}] or [{tag:...}]
        try {
          const start = text.indexOf("[{");
          const end = text.lastIndexOf("}]");
          if (start !== -1 && end !== -1) {
            const parsed = JSON.parse(text.slice(start, end + 2));
            if (Array.isArray(parsed) && parsed.length > 0) return { options: normalizeOptions(parsed), summary: null, preamble: text.slice(0, start).trim() };
          }
        } catch(e) {}
        return null;
      };

      const parsed = tryParseRefine(replyText);
      if (parsed) {
        const originalQueryText = (conversationRef.current&&conversationRef.current[0]&&conversationRef.current[0].content||"").toLowerCase();
        const isEarningRefine = /business.?trip|work.?trip|maximize.?point|build.?mile|build.?point|earn.?status|rack.?up|maximize.?earn/i.test(originalQueryText);
        const refinedOptions = isEarningRefine
          ? parsed.options.map(o => o.tag === "Future Value" ? { ...o, tag: "Redemption Opportunity", tagColor: "#4CC97A" } : o)
          : parsed.options;
        setTripOptions(refinedOptions);
        if (parsed.summary) setTripSummary(parsed.summary);
        // Stay on the currently expanded card if it still exists in the new options
        setExpandedId(prev => {
          if (prev && parsed.options.find(o => o.id === prev)) return prev;
          return null;
        });
        setShowCompare(false);
        const rawPreamble = parsed.preamble || "";
        // Strip any JSON that leaked into the preamble
        const preambleJsonMatch = rawPreamble.search(/(\[\{|\{"[a-zA-Z])/);
        const cleanPreamble = preambleJsonMatch > -1 ? rawPreamble.slice(0, preambleJsonMatch).trim() : rawPreamble;
        const confirmation = cleanPreamble.length > 10 ? cleanPreamble : "Updated your options — cards now reflect your latest preferences.";
        setRefineMessages(prev => [...prev, { role: "assistant", text: confirmation }]);
        setRefineLoading(false);
        return;
      }

      // Conversational response — strip any JSON that leaked into the text
      replyText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
      // Strip everything from first JSON-like structure onward
      // Matches: [{ or any { followed shortly by a quoted key
      const jsonMatch = replyText.search(/(\[\{|\{"[a-zA-Z])/);
      const cleanReply = jsonMatch > -1 ? replyText.slice(0, jsonMatch).trim() : replyText;
      setRefineMessages(prev => [...prev, { role: "assistant", text: cleanReply || replyText }]);
    } catch (e) {
      console.error("Refine error:", e);
      try { setRefineMessages(prev => [...prev, { role: "assistant", text: "Something went wrong — please try again." }]); } catch(e2) {}
    } finally {
      setRefineLoading(false);
      clearInterval(refineInterval);
      setRefineLoadingMessage("");
    }
  };

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile);
    try { localStorage.setItem("sojourn_profile", JSON.stringify(profile)); } catch(e) {}
    setPhase("chat");
  };

  const resetApp = () => {
    // Extract preferences from completed session before resetting
    if (refineMessages.length > 0 || conversationRef.current.length > 0) {
      extractAndSavePreferences(refineMessages, conversationRef.current.map(m => ({ role: m.role, text: m.content })));
    }
    setPhase("chat");
    setMessages([{ role: "assistant", text: "Where to next? Tell me about your trip — destination, rough dates, who's traveling, any preferences. The more you share, the sharper the options." }]);
    setInput(""); setTripOptions([]); setTripSummary(null); setDismissedIds([]); setShowDismissed(false); setFocusedOptionId(null); setDeepDiveConfirmed(false);
    setExpandedId(null); setShowCompare(false);
    setConciergeMode(true);
    conversationRef.current = [];
    setRefineMessages([]);
  };

  const clearProfile = () => {
    try { localStorage.removeItem("sojourn_profile"); } catch(e) {}
    setUserProfile({});
    setPhase("onboarding");
  };

  // Learned preferences — persists across sessions
  const loadLearnedPrefs = () => {
    try { const s = localStorage.getItem("sojourn_learned"); return s ? JSON.parse(s) : []; } catch(e) { return []; }
  };
  const [learnedPrefs, setLearnedPrefs] = useState(() => loadLearnedPrefs());

  const saveLearnedPrefs = (prefs) => {
    try { localStorage.setItem("sojourn_learned", JSON.stringify(prefs)); } catch(e) {}
    setLearnedPrefs(prefs);
  };

  // Extract preference signals from a completed session and store them
  const extractAndSavePreferences = async (refineConvo, tripConvo) => {
    if (refineConvo.length < 2 && tripConvo.length < 2) return;
    const convoText = [...tripConvo, ...refineConvo]
      .filter(m => m.text || m.content)
      .map(m => (m.role === "user" ? "User: " : "Sojourn: ") + (m.text || m.content))
      .join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: "Extract 3-6 DURABLE traveler preference signals from this conversation — things true on their NEXT trip too, not specifics of this one. INCLUDE: style preferences, logistical preferences, quality standards, recurring family needs, weather minimums, destination affinities. EXCLUDE: anything trip-specific like dates, this hotel name, current points balance. Return ONLY a JSON array of short strings, no markdown, no preamble.",
          messages: [{ role: "user", content: convoText.slice(0, 3000) }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text?.trim() || "[]";
      const cleaned = raw.replace(/```json/g,"").replace(/```/g,"").trim();
      const newSignals = JSON.parse(cleaned);
      if (Array.isArray(newSignals) && newSignals.length > 0) {
        const existing = loadLearnedPrefs();
        // Merge, dedupe loosely, cap at 20 signals
        const merged = [...existing, ...newSignals].filter((v,i,a) => a.findIndex(x => x.toLowerCase().includes(v.toLowerCase().split(" ")[0])) === i).slice(-20);
        saveLearnedPrefs(merged);
      }
    } catch(e) { console.log("Pref extraction failed silently", e); }
  };

  // ── Results screen ──
  if (phase === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (phase === "results") {
    return (<>
      {itineraryOption && <ItineraryOverlay option={itineraryOption} tripSummary={tripSummary} onClose={() => setItineraryOption(null)} />}
      <div style={{ minHeight: "100vh", background: "#080706", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#e8e4dc" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          ::-webkit-scrollbar{height:4px;background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.3);border-radius:2px}
          .card-scroll{scrollbar-width:thin;scrollbar-color:rgba(201,168,76,0.3) transparent}
        `}</style>

        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: "#C9A84C", textTransform: "uppercase", marginBottom: "3px", fontFamily: "serif" }}>Sojourn · AI</div>
            <div style={{ fontSize: "12px", color: "#555" }}>Your travel, optimized.</div>
          </div>
          <button onClick={() => { mp.track("new_trip_started"); resetApp(); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>New Trip</button>
        </div>

        {tripSummary && (
          <div style={{ padding: "16px 28px 0" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px 18px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[
                { label: "Trip", value: `${tripSummary.origin} → ${tripSummary.destination}` },
                { label: "Dates", value: tripSummary.dates },
                ...(tripSummary.preferences || []).slice(0, 2).map((p, i) => ({ label: i === 0 ? "Preference" : "Also", value: p })),
                ...(tripSummary.constraints || []).slice(0, 1).map(c => ({ label: "Constraint", value: c })),
              ].map(item => (
                <div key={item.label + item.value}>
                  <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "3px" }}>{item.label}</div>
                  <div style={{ color: "#b0a898", fontSize: "13px" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "20px 28px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: "22px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "3px" }}>
              {tripOptions.filter(o => !dismissedIds.includes(o.id)).length} option{tripOptions.filter(o => !dismissedIds.includes(o.id)).length !== 1 ? "s" : ""}, optimized for you
            </div>
            <div style={{ color: "#555", fontSize: "12px" }}>{expandedId ? "Viewing details · click back to compare all" : "Click any option to explore · dismiss to narrow"}</div>
          </div>
        </div>

        <div style={{ padding: "0 28px 48px" }}>
          {expandedId ? (
            <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
              <button onClick={() => setExpandedId(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#888", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", marginBottom: "16px" }}>← Back to Grid</button>
              <TripCard option={tripOptions.find(o => o.id === expandedId)} isExpanded={true} onToggle={() => setExpandedId(null)} onItinerary={(opt) => { mp.track("itinerary_viewed", { tag: opt.tag, headline: opt.headline }); setItineraryOption(opt); }} />
              {/* Other options mini-strip */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ color: "#333", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Other Options</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {tripOptions.filter(o => o.id !== expandedId && !dismissedIds.includes(o.id)).map(opt => (
                    <button key={opt.id} onClick={() => setExpandedId(opt.id)} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${focusedOptionId === opt.id ? opt.tagColor + "44" : "rgba(255,255,255,0.07)"}`, borderRadius: "10px", padding: "8px 12px", cursor: "pointer", textAlign: "left", opacity: focusedOptionId && focusedOptionId !== opt.id ? 0.35 : 1 }}>
                      <div style={{ color: opt.tagColor, fontSize: "9px", marginBottom: "2px" }}>{opt.tag}</div>
                      <div style={{ color: "#b0a898", fontSize: "12px", fontFamily: "serif" }}>${typeof opt.totalCost === "number" ? opt.totalCost.toLocaleString() : String(opt.totalCost).replace(/^\$+/,"")}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <GridView
              options={tripOptions.filter(o => !dismissedIds.includes(o.id))}
              onSelectOption={(id) => { mp.track("card_expanded", { tag: tripOptions.find(o=>o.id===id)?.tag, headline: tripOptions.find(o=>o.id===id)?.headline }); setExpandedId(id); }}
              onDismiss={(id, restore) => {
                if (restore) {
                  setDismissedIds(prev => prev.filter(x => x !== id));
                  return;
                }
                const opt = tripOptions.find(o => o.id === id);
                mp.track("card_dismissed", { tag: opt?.tag, headline: opt?.headline });
                const newDismissed = [...dismissedIds, id];
                setDismissedIds(newDismissed);
                const remaining = tripOptions.filter(o => !newDismissed.includes(o.id));
                if (remaining.length === 1 && !deepDiveConfirmed && !focusedOptionId) {
                  const last = remaining[0];
                  setRefineMessages(prev => [...prev, {
                    role: "assistant",
                    text: `Looks like the ${last.tag} — ${last.headline} — is your only remaining option. Want me to focus in and walk you through every detail before you book? Or if you'd like to restore any dismissed options, tap "show" below.`,
                    isDeepDivePrompt: true,
                    optionId: last.id
                  }]);
                }
              }}
              dismissedIds={dismissedIds}
              focusedOptionId={focusedOptionId}
              showDismissed={showDismissed}
              setShowDismissed={setShowDismissed}
              hiddenOptions={tripOptions.filter(o => dismissedIds.includes(o.id))}
            />
          )}
        </div>

        {/* Refine bar — persistent on results screen */}
        <div style={{ padding: "0 28px 12px" }}>
          {refineMessages.length > 0 && (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto" }}>
              {refineMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
                    border: msg.role === "user" ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    color: msg.role === "user" ? "#e8e4dc" : "#b0a898",
                    fontSize: "13px", lineHeight: "1.5",
                    fontFamily: msg.role === "assistant" ? "'Playfair Display',Georgia,serif" : "inherit",
                    fontStyle: msg.role === "assistant" ? "italic" : "normal",
                  }}>{msg.text}</div>
                  {msg.text?.includes("Your trip is set") && focusedOptionId && (() => {
                    const opt = tripOptions.find(o => o.id === focusedOptionId);
                    return (
                      <button onClick={() => { mp.track("book_intent", { tag: opt?.tag, headline: opt?.headline, total_cost: opt?.totalCost, source: "deep_dive_close" }); alert("Booking coming soon! We logged your interest in: " + opt?.headline); }} style={{ marginTop: "10px", padding: "12px 24px", background: opt?.tagColor || "#C9A84C", color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
                        Book This Trip →
                      </button>
                    );
                  })()}
                  {msg.isDeepDivePrompt && !deepDiveConfirmed && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button onClick={() => {
                        const opt = tripOptions.find(o => o.id === msg.optionId);
                        setFocusedOptionId(msg.optionId);
                        setDeepDiveConfirmed(true);
                        mp.track("deep_dive_started", { optionId: msg.optionId, tag: opt?.tag });
                        // Directly trigger guided tour — no seeded visible message, no setTimeout
                        handleRefine(`__deepdive__${msg.optionId}`);
                      }} style={{ padding: "8px 18px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Playfair Display',Georgia,serif" }}>
                        Yes, let's do it →
                      </button>
                      <button onClick={() => setRefineMessages(prev => prev.filter((_, idx) => idx !== i))} style={{ padding: "8px 14px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#555", fontSize: "12px", cursor: "pointer" }}>
                        Keep all options
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {refineLoading && (
            <div style={{ display: "flex", alignItems: "center", padding: "8px 4px", marginBottom: "4px" }}>
              <TypingIndicator />
            </div>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "4px", paddingTop: "16px" }}>
            <div style={{ background: "rgba(12,11,10,0.95)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: "16px", padding: "14px 16px 12px" }}>
              {/* Header */}
              <div style={{ marginBottom: "12px" }}>
                <span style={{ color: "#b0a898", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: "600" }}>Make it yours</span>
                <span style={{ color: "#3a3530", fontSize: "12px", margin: "0 6px" }}>—</span>
                <span style={{ color: "#4a4540", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }}>explore dining, drinks, and activities; clarify details or adjust the plan. Your options update as you go.</span>
              </div>
              {/* Context-aware suggestion pills */}
              {(() => {
                const opts = (tripOptions || []).filter(o => !dismissedIds.includes(o.id));
                const rec = opts.find(o => o.id === 1);
                const wildCard = opts.find(o => o.tag === "Wild Card");
                const upgrade = opts.find(o => o.tag === "Quality Upgrade");
                const redemptionOpt = opts.find(o => o.tag === "Best Points Redemption" || o.tag === "Redemption Opportunity");
                const futureValue = opts.find(o => o.tag === "Future Value");

                // Detect query intent from original message
                const originalQuery = (conversationRef.current && conversationRef.current[0] && conversationRef.current[0].content || "").toLowerCase();
                const isEarningIntent = /business.?trip|work.?trip|maximize.?point|build.?mile|build.?point|earn.?status|rack.?up|maximize.?earn/i.test(originalQuery);
                const isRedemptionIntent = /i have \d|use my miles|redeem|burn my|best use of my/i.test(originalQuery);
                const isDestinationUncertain = /surprise me|open to|anywhere|somewhere warm|somewhere|don.t know|not sure|ideas/i.test(originalQuery);
                const isSpecificDestination = !isDestinationUncertain && originalQuery.length > 10;
                const isOccasion = /anniversary|birthday|honeymoon|proposal|celebration|bachelor|bachelorette/i.test(originalQuery);

                const pills = [];

                // ── Pill 1: Query-intent pill ──
                if (isEarningIntent) {
                  pills.push("How do the earning rates compare across these options?");
                } else if (isRedemptionIntent) {
                  pills.push("Which option gives me the best value per mile?");
                } else if (isOccasion) {
                  pills.push("Which of these feels most special for the occasion?");
                } else if (isDestinationUncertain) {
                  pills.push("What else fits this vibe?");
                } else if (wildCard) {
                  pills.push("What else fits the spirit of the Wild Card option?");
                } else {
                  pills.push("What makes each of these options different from each other?");
                }

                // ── Pill 2: Logistics ──
                if (isEarningIntent) {
                  pills.push("Which option has the best business amenities?");
                } else if (opts.length > 2) {
                  pills.push("How do the flight times compare across these?");
                } else if (upgrade) {
                  pills.push("What does the upgrade option actually add over the Recommended?");
                } else {
                  pills.push("How do the flight times compare across these?");
                }

                // ── Pill 3: Experience ──
                if (isEarningIntent) {
                  pills.push("Any good dinner spots near the Recommended option?");
                } else if (isOccasion) {
                  pills.push("What would make the Recommended option more memorable?");
                } else if (rec) {
                  pills.push("Any standout restaurants near the Recommended option?");
                } else {
                  pills.push("What would make any of these feel more special?");
                }

                return (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    {pills.map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => setRefineInput(pill)}
                        style={{
                          background: "rgba(201,168,76,0.07)",
                          border: "1px solid rgba(201,168,76,0.2)",
                          borderRadius: "20px",
                          padding: "5px 12px",
                          color: "#9a8e7a",
                          fontSize: "11px",
                          fontFamily: "'DM Sans',system-ui,sans-serif",
                          cursor: "pointer",
                          lineHeight: "1.4",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.14)"; e.currentTarget.style.color = "#c9a84c"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.07)"; e.currentTarget.style.color = "#9a8e7a"; }}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                );
              })()}
              {/* Input */}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px", padding: "4px 4px 4px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  value={refineInput}
                  onChange={e => setRefineInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleRefine(); }}
                  placeholder="Ask anything about these options..."
                  style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "12px", padding: "9px 0", fontFamily: "'DM Sans',system-ui,sans-serif", outline: "none" }}
                />
                {refineLoading ? (
                  <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TypingIndicator />
                  </div>
                ) : (
                  <button onClick={handleRefine} disabled={!refineInput.trim()} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: refineInput.trim() ? "pointer" : "default", background: refineInput.trim() ? "#C9A84C" : "rgba(201,168,76,0.1)", color: refineInput.trim() ? "#0a0908" : "#555", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>&#8593;</button>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
    );
  }

  // ── Chat / Input screen ──
  const isFirst = messages.length === 1;

  return (
    <div style={{ minHeight: "100vh", background: "#080706", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#e8e4dc", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.15)}}
        textarea:focus{outline:none} textarea{resize:none}
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 24px 0", textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", marginBottom: "4px", fontFamily: "serif" }}>Sojourn · AI</div>
        <div style={{ fontSize: "12px", color: "#555" }}>Your travel, optimized.</div>
      </div>

      {/* Hero — centerpoint on first load */}
      {isFirst && (() => {
        const tp = userProfile?.travelProfile || {};
        const loyalty = userProfile?.loyaltyAccounts || [];
        const cards = userProfile?.cards || [];
        const airport = tp.homeAirport || "SEA";
        const airportCity = { SEA: "Seattle", SFO: "San Francisco", LAX: "Los Angeles", JFK: "New York", ORD: "Chicago", BOS: "Boston", MIA: "Miami", DEN: "Denver", ATL: "Atlanta", DFW: "Dallas", PDX: "Portland", SLC: "Salt Lake City" }[airport] || airport;

        // Build loyalty pills from actual profile — rotate which shows first each session
        const hotelPrograms = ["Marriott Bonvoy","World of Hyatt","Hilton Honors","IHG One Rewards"];
        const airlinePrograms = ["Alaska Mileage Plan","Delta SkyMiles","United MileagePlus","American AAdvantage","Southwest Rapid Rewards"];

        const formatBalance = (bal) => {
          if (!bal) return null;
          const num = bal.replace(/[^0-9,]/g, "").replace(/^0+/, "");
          return num && parseInt(num.replace(/,/g,"")) > 0 ? num : null;
        };

        const loyaltyPills = [];
        loyalty.forEach(a => {
          const bal = formatBalance(a.balance);
          if (!bal) return;
          if (hotelPrograms.includes(a.program) && a.tier && a.tier !== "None") {
            loyaltyPills.push({ type: "hotel", text: `I have ${bal} ${a.program} points — where should I go?` });
          } else if (airlinePrograms.includes(a.program) && parseInt(bal.replace(/,/g,"")) > 5000) {
            loyaltyPills.push({ type: "airline", text: `I have ${bal} ${a.program} miles — what trip should I take?` });
          }
        });

        // Rotate starting program each session (hotel-first vs airline-first)
        const sessionSeed = Math.floor(Date.now() / 3600000) % 2; // changes each hour
        if (sessionSeed === 1) loyaltyPills.reverse();

        // Build final 5 prompts: up to 2 loyalty pills, then static inspirational
        const allPrompts = [];
        loyaltyPills.slice(0, 2).forEach(p => allPrompts.push(p.text));

        // Fill remaining slots with inspirational prompts
        const inspirational = [
          `Best long weekend from ${airportCity} I haven't thought of yet`,
          `I need a reset. Somewhere warm, late April — surprise me.`,
          "Anniversary trip — somewhere unforgettable, open budget",
          "First time in Japan — 10 days, two adults, where to start?",
          "Plan a trip that makes the most of my points and credit cards",
        ];
        inspirational.forEach(p => { if (allPrompts.length < 5) allPrompts.push(p); });

        // Trim to 5
        const finalPrompts = allPrompts.slice(0, 5);

        // 2-2-1 prompt layout
        const row1 = finalPrompts.slice(0, 2);
        const row2 = finalPrompts.slice(2, 4);
        const row3 = finalPrompts.slice(4, 5);

        return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px 12px", animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ marginBottom: "24px", textAlign: "center", width: "100%", maxWidth: "860px" }}>
            <div style={{ fontSize: "38px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#e8e4dc", lineHeight: "1.1", marginBottom: "16px", whiteSpace: "nowrap" }}>Every great trip begins with a conversation.</div>
            <div style={{ color: "#6a6460", fontSize: "15px", lineHeight: "1.7", maxWidth: "580px", margin: "0 auto" }}>Tell me about your trip — or start with an idea. Explore destinations, discover events and dining, build an itinerary, and book your trip — all in one conversation. Every recommendation shaped by your loyalty programs, credit cards, and travel style — working together.</div>
          </div>
          <div style={{ width: "100%", maxWidth: "860px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.14)", outline: "1px solid rgba(255,255,255,0.05)", outlineOffset: "3px", borderRadius: "20px", padding: "6px 6px 6px 22px", display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "18px" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Where to? e.g. "4 days in Japan in October, two adults" · "surprise me with a long weekend under $1,500" · "best use of my Hyatt points this winter"`}
                rows={4} style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "15px", lineHeight: "1.7", padding: "14px 0", fontFamily: "'DM Sans',system-ui,sans-serif", resize: "none" }} />
              <div style={{ display: "flex", gap: "6px", paddingBottom: "10px", flexShrink: 0 }}>
                <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", cursor: "pointer", background: listening ? "rgba(201,76,76,0.2)" : "rgba(255,255,255,0.06)", color: listening ? "#C94C4C" : "#666", fontSize: "16px", animation: listening ? "pulse 1.2s infinite" : "none" }}>&#127908;</button>
                <button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: input.trim() && !loading ? "#C9A84C" : "rgba(201,168,76,0.15)", color: input.trim() && !loading ? "#0a0908" : "#555", fontSize: "18px", fontWeight: "bold" }}>&#8593;</button>
              </div>
            </div>
            {/* 2-2-1 prompt rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", width: "100%" }}>
                {row1.map(ex => <button key={ex} onClick={() => setInput(ex)} style={{ flex: 1, maxWidth: "420px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a6460", borderRadius: "20px", padding: "9px 18px", cursor: "pointer", fontSize: "12px", textAlign: "center" }}>{ex}</button>)}
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", width: "100%" }}>
                {row2.map(ex => <button key={ex} onClick={() => setInput(ex)} style={{ flex: 1, maxWidth: "420px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a6460", borderRadius: "20px", padding: "9px 18px", cursor: "pointer", fontSize: "12px", textAlign: "center" }}>{ex}</button>)}
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                {row3.map(ex => <button key={ex} onClick={() => setInput(ex)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a6460", borderRadius: "20px", padding: "9px 24px", cursor: "pointer", fontSize: "12px" }}>{ex}</button>)}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Message thread — after first exchange */}
      {!isFirst && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.slice(1).map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease forwards" }}>
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: msg.role === "user" ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(255,255,255,0.07)", color: msg.role === "user" ? "#e8e4dc" : "#b0a898", fontSize: "14px", lineHeight: "1.6", fontFamily: msg.role === "assistant" ? "'Playfair Display',Georgia,serif" : "inherit", fontStyle: msg.role === "assistant" ? "italic" : "normal" }}>{msg.text}</div>
              {msg.isReadyPrompt && (
                <button onClick={() => { setConciergeMode(false); callClaude("Generate my options now based on everything discussed."); }} style={{ marginTop: "10px", padding: "11px 22px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Show Me What's Possible →
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px" }}><TypingIndicator /></div>
              {loadingMessage && (
                <div style={{ color: "#C9A84C", fontSize: "12px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", paddingLeft: "4px", animation: "fadeUp 0.4s ease forwards" }}>{loadingMessage}</div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Compact input — after first exchange */}
      {!isFirst && (
        <div style={{ padding: "12px 24px 16px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "4px 4px 4px 16px", display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Reply..." rows={2}
              style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "14px", lineHeight: "1.5", padding: "10px 0", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
            <div style={{ display: "flex", gap: "6px", paddingBottom: "6px", flexShrink: 0 }}>
              <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", background: listening ? "rgba(201,76,76,0.2)" : "rgba(255,255,255,0.06)", color: listening ? "#C94C4C" : "#666", fontSize: "16px", animation: listening ? "pulse 1.2s infinite" : "none" }}>&#127908;</button>
              <button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: input.trim() && !loading ? "#C9A84C" : "rgba(201,168,76,0.15)", color: input.trim() && !loading ? "#0a0908" : "#555", fontSize: "16px", fontWeight: "bold" }}>&#8593;</button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Optimizing For Bar */}
      <OptimizingForBar profile={userProfile} setProfile={(updated) => {
        setUserProfile(updated);
        try { localStorage.setItem("sojourn_profile", JSON.stringify(updated)); } catch(e) {}
      }} />
    </div>
  );
}
