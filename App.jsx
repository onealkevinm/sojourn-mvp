import { useState, useRef, useEffect } from "react";

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
    { program: "Uber One", tiers: ["None", "Member"] },
    { program: "Lyft Pink", tiers: ["None", "Pink", "Pink All Access"] },
    { program: "Blacklane", tiers: ["None", "Member"] },
    { program: "Blade", tiers: ["None", "Member"] },
    { program: "Via", tiers: ["None", "Member"] },
  ],
};

const LOYALTY_BRAND_MAP = {
  "Marriott Bonvoy": ["Marriott", "Westin", "Sheraton", "W Hotels", "St. Regis", "Ritz-Carlton", "EDITION", "Autograph Collection", "Renaissance", "Le Méridien", "The Luxury Collection"],
  "Hilton Honors": ["Hilton", "Conrad", "Waldorf Astoria", "Curio Collection", "DoubleTree", "Canopy", "Tapestry Collection", "LXR Hotels"],
  "World of Hyatt": ["Park Hyatt", "Grand Hyatt", "Andaz", "Hyatt Regency", "Alila", "Thompson Hotels", "Hyatt Centric"],
  "IHG One Rewards": ["InterContinental", "Kimpton", "Six Senses", "Regent", "Hotel Indigo"],
};

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
    label: "Quality Recognition",
    sublabel: "Award and rating systems",
    brands: ["Michelin Keys", "Michelin Stars (restaurant)", "Forbes Five Star", "AAA Five Diamond", "Condé Nast Gold List"],
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
  {
    key: "airlines_pref",
    label: "Preferred Airlines",
    sublabel: "Carriers you prefer when available",
    brands: ["United", "Delta", "American", "Alaska", "JetBlue", "Southwest", "Emirates", "Lufthansa", "Singapore Airlines", "British Airways", "Air France", "Cathay Pacific"],
  },
  {
    key: "quality_budget",
    label: "Quality / Value",
    sublabel: "Best value without sacrificing quality",
    brands: ["Hyatt Place", "Courtyard by Marriott", "Hampton Inn", "AC Hotels", "Aloft", "Element Hotels", "Moxy Hotels"],
  },
  {
    key: "ground_pref",
    label: "Ground Transport Preferences",
    sublabel: "Preferred carriers and services on the ground",
    brands: ["Uber One", "Lyft Pink", "Hertz", "National", "Enterprise", "Avis", "Blacklane", "Blade", "Turo", "Zipcar", "Via", "Public Transit"],
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
  const [selectedCards, setSelectedCards] = useState(["Chase Sapphire Reserve", "Amex Platinum"]);
  const [customCard, setCustomCard] = useState("");
  const [showCustomCard, setShowCustomCard] = useState(false);
  const [cardSearch, setCardSearch] = useState("");

  const defaultLoyalty = () => {
    const obj = {};
    Object.values(LOYALTY_OPTIONS).flat().forEach(({ program, tiers }) => {
      obj[program] = { selected: false, tier: tiers[0], balance: "" };
    });
    obj["United MileagePlus"] = { selected: true, tier: "Silver", balance: "24,200" };
    obj["Marriott Bonvoy"] = { selected: true, tier: "Gold", balance: "68,400" };
    obj["Hilton Honors"] = { selected: true, tier: "Silver", balance: "32,100" };
    obj["Uber One"] = { selected: true, tier: "Member", balance: "" };
    obj["National Emerald Club"] = { selected: true, tier: "Executive", balance: "" };
    return obj;
  };
  const [loyaltyAccounts, setLoyaltyAccounts] = useState(defaultLoyalty);
  const [selectedBrands, setSelectedBrands] = useState(["Four Seasons", "Leading Hotels of the World", "Relais & Châteaux", "Michelin Keys"]);
  const [expandedBrandCat, setExpandedBrandCat] = useState(null);
  const [debugMsg, setDebugMsg] = useState("");
  const [travelProfile, setTravelProfile] = useState({
    homeAirport: "",
    frequency: "",
    travelTypes: [],
  });

  const toggleCard = (card) => setSelectedCards(prev => prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]);
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
            <div style={{ fontSize: "36px", fontFamily: "'Playfair Display',Georgia,serif", lineHeight: "1.15", marginBottom: "16px" }}>Your travel,<br />optimized.</div>
            <div style={{ color: "#666", fontSize: "15px", lineHeight: "1.7", marginBottom: "32px" }}>Sojourn optimizes every trip across your credit cards, loyalty programs, and personal preferences — all at once, in plain language.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
              {["Optimizes cards, loyalty programs, and brand preferences simultaneously", "Surfaces points redemption opportunities you would otherwise miss", "Gets smarter and more personalized with every trip"].map(t => (
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
            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "6px" }}>Your loyalty programs</div>
            <div style={{ color: "#555", fontSize: "13px", marginBottom: "20px", lineHeight: "1.6" }}>Select your programs, tier, and approximate balance. Sojourn will factor these into every recommendation.</div>

            <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", marginBottom: "8px" }}>
              {[
                { label: "Hotel Programs", key: "hotel" },
                { label: "Airline Programs", key: "airline" },
                { label: "Car Rental", key: "car" },
                { label: "Rideshare & Ground", key: "rideshare" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ color: "#C9A84C", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>{label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {LOYALTY_OPTIONS[key].map(({ program, tiers }) => {
                      const acct = loyaltyAccounts[program] || { selected: false, tier: tiers[0], balance: "" };
                      return (
                        <div key={program} style={{ background: acct.selected ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${acct.selected ? "rgba(201,168,76,0.22)" : "rgba(255,255,255,0.05)"}`, borderRadius: "10px", padding: "10px 12px", transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: acct.selected ? "10px" : "0" }}>
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
                              <input value={acct.balance} onChange={e => setBalance(program, e.target.value)} placeholder="Balance (e.g. 45,000)" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 10px", color: "#e8e4dc", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

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

const CompareView = ({ options, onBack, onSelectOption }) => (
  <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
    <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#aaa", padding: "8px 16px", borderRadius: "20px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>← Back to Cards</button>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
        <thead>
          <tr>
            {["Option", "Total Cost", "Points Value", "Net Value", "Why This Option"].map(h => (
              <th key={h} style={{ textAlign: h === "Option" || h === "Why This Option" ? "left" : "right", padding: "12px 16px", color: "#555", fontSize: "11px", fontFamily: "serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map((opt, i) => (
            <tr key={opt.id} onClick={() => onSelectOption && onSelectOption(opt.id)} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: i === 0 ? "rgba(201,168,76,0.04)" : "transparent", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = i === 0 ? "rgba(201,168,76,0.04)" : "transparent"}>
              <td style={{ padding: "16px", verticalAlign: "top" }}>
                <span style={{ background: opt.tagColor + "18", color: opt.tagColor, fontSize: "10px", padding: "3px 8px", borderRadius: "10px", fontFamily: "serif", display: "inline-block", marginBottom: "6px" }}>{opt.tag}</span>
                <div style={{ color: "#b0a898", fontSize: "13px" }}>{opt.headline}</div>
                <div style={{ color: "#444", fontSize: "10px", marginTop: "4px", letterSpacing: "0.05em" }}>View details →</div>
              </td>
              <td style={{ padding: "16px", textAlign: "right", verticalAlign: "top" }}>
                <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>{typeof opt.totalCost === "number" ? opt.totalCost.toLocaleString() : String(opt.totalCost).replace(/^\$+/,"")}</div>
                {opt.redemption && <div style={{ color: "#4CC97A", fontSize: "11px" }}>−{opt.redemption.valueRedeemed} redeemed</div>}
              </td>
              <td style={{ padding: "16px", textAlign: "right", verticalAlign: "top" }}>
                <div style={{ color: opt.tagColor, fontSize: "14px" }}>+${opt.pointsValue}</div>
                <div style={{ color: "#555", fontSize: "11px" }}>{opt.pointsEarned}</div>
              </td>
              <td style={{ padding: "16px", textAlign: "right", verticalAlign: "top" }}>
                <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>${opt.netValue.toLocaleString()}</div>
                <div style={{ color: "#555", fontSize: "10px" }}>after pts value</div>
              </td>
              <td style={{ padding: "16px", verticalAlign: "top", maxWidth: "260px" }}>
                <div style={{ color: "#b0a898", fontSize: "13px", lineHeight: "1.5" }}>{opt.whyThis}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ComponentRow = ({ label, value, detail, points, card }) => {
  const isFlight = label === "Flight" || label === "Return Flight";
  // Parse flight detail for rich display: "UA 234 · SFO→JFK · Departs 7:45am → Arrives 4:02pm · 5h 17m"
  const parts = isFlight ? detail.split(" · ") : [];
  const flightNum = parts[0] || "";
  const route = parts[1] || "";
  const times = parts[2] || "";
  const duration = parts[3] || "";

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ color: "#666", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif" }}>{label}</div>
          {isFlight && !times && duration && <div style={{ color: "#555", fontSize: "10px", background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: "6px" }}>{duration}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>{value}</div>
          <div style={{ color: "#4CC97A", fontSize: "11px" }}>{points}</div>
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
      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "3px 8px" }}>
        <span style={{ color: "#C9A84C", fontSize: "10px" }}>▪</span>
        <span style={{ color: "#7a7468", fontSize: "11px" }}>{card}</span>
      </div>
    </div>
  );
};

const TripCard = ({ option, isExpanded, onToggle, onItinerary }) => {
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
        <span style={{ color: "#e8e4dc", fontSize: "18px", fontFamily: "'Playfair Display',Georgia,serif" }}>${typeof option.totalCost === "number" ? option.totalCost.toLocaleString() : String(option.totalCost).replace(/^\$+/,"")}</span>
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
            <span style={{ color: "#4a4a4a", fontSize: "11px" }}>net ${typeof option.netValue === "number" ? option.netValue.toLocaleString() : String(option.netValue||0).replace(/^\$+/,"")} after pts</span>
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
              <div style={{ color: "#7a9e7a", fontSize: "11px" }}>{option.redemption.program} · {option.redemption.pointsUsed} → {option.redemption.valueRedeemed} value</div>
            </div>
          )}
          {/* Trip Components */}
          <div style={{ marginBottom: "6px" }}>
            <div style={{ color: "#666", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px" }}>Trip Components</div>
            {(option.components||[]).map(c => <ComponentRow key={c.label + c.value} {...c} />)}
          </div>
          <div style={{ marginTop: "12px", padding: "12px 16px", background: option.tagColor + "0e", borderRadius: "12px", border: `1px solid ${option.tagColor}22` }}>
            <div style={{ color: option.tagColor, fontSize: "12px" }}>✦ {option.loyaltyHighlight}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button onClick={() => onItinerary && onItinerary(option)} style={{ flex: 1, padding: "14px", background: "rgba(255,255,255,0.04)", color: "#b0a898", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Playfair Display',Georgia,serif" }}>
              View as Itinerary ↗
            </button>
            <button style={{ flex: 2, padding: "14px", background: option.tagColor, color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
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

  // Group components by city for multi-city trips
  const flights = option.components.filter(c => c.label === "Flight" || c.label === "Return Flight" || c.label?.includes("Flight"));
  const hotels = option.components.filter(c => c.label?.toLowerCase().includes("hotel") || c.label?.toLowerCase().includes("accommodation"));
  const ground = option.components.filter(c => !c.label?.toLowerCase().includes("flight") && !c.label?.toLowerCase().includes("hotel") && !c.label?.toLowerCase().includes("accommodation"));

  // Build day-by-day structure
  const origin = tripSummary?.origin || "Origin";
  const destination = tripSummary?.destination || "Destination";
  const dates = tripSummary?.dates || "Dates TBD";

  // Detect multi-city from hotel components
  const isMultiCity = hotels.length > 1;

  const needsBooking = [
    ...(!option.components.some(c => c.label === "Flight") ? [] : []),
    "Flights — book via airline website or travel agent",
    ...hotels.map(h => `${h.detail?.split("·")[0]?.trim() || "Hotel"} — book directly or via hotel website`),
    ...(option.components.some(c => c.detail?.toLowerCase().includes("michelin") || c.detail?.toLowerCase().includes("restaurant") || c.detail?.toLowerCase().includes("dining")) ? ["Restaurant reservations — book via OpenTable, Resy, or directly"] : []),
    ...(option.components.some(c => c.detail?.toLowerCase().includes("helicopter")) ? ["Helicopter transfer — arrange via operator in advance"] : []),
  ];

  const handlePrint = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#0e0c0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", width: "100%", maxWidth: "620px", padding: "32px", position: "relative", animation: "fadeUp 0.3s ease forwards" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Sojourn · Itinerary Preview</div>
            <div style={{ fontSize: "22px", fontFamily: "'Playfair Display',Georgia,serif", color: "#e8e4dc", lineHeight: "1.2" }}>{option.headline}</div>
            <div style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>{dates} · {origin} → {destination}</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handlePrint} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "11px", fontFamily: "serif", letterSpacing: "0.08em" }}>Export PDF ↓</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#666", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Cost summary strip */}
        <div style={{ display: "flex", gap: "16px", padding: "14px 18px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", marginBottom: "28px" }}>
          <div><div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", fontFamily: "serif" }}>TOTAL</div><div style={{ color: "#e8e4dc", fontSize: "18px", fontFamily: "serif" }}>{typeof option.totalCost === "number" ? option.totalCost.toLocaleString() : String(option.totalCost||0).replace(/^\$+/,"")}</div></div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.06)" }} />
          <div><div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", fontFamily: "serif" }}>POINTS EARNED</div><div style={{ color: "#C9A84C", fontSize: "13px", marginTop: "2px" }}>{option.pointsEarned}</div></div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.06)" }} />
          <div><div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", fontFamily: "serif" }}>NET VALUE</div><div style={{ color: "#4CC97A", fontSize: "18px", fontFamily: "serif" }}>{typeof option.netValue === "number" ? option.netValue.toLocaleString() : String(option.netValue||0).replace(/^\$+/,"")}</div></div>
        </div>

        {/* Flights section */}
        {flights.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ color: "#C9A84C", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>✈ Flights</div>
            {flights.map((f, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#b0a898", fontSize: "13px", marginBottom: "4px" }}>{f.label}</div>
                    <div style={{ color: "#e8e4dc", fontSize: "13px", fontFamily: "serif" }}>{f.detail}</div>
                    <div style={{ color: "#555", fontSize: "11px", marginTop: "3px" }}>📋 Needs booking · {f.card}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>{f.value}</div>
                    <div style={{ color: "#C9A84C", fontSize: "11px" }}>{f.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hotels section — per city if multi-city */}
        {hotels.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ color: "#C9A84C", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>🏨 Accommodation{isMultiCity ? " — by City" : ""}</div>
            {hotels.map((h, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "8px" }}>
                {isMultiCity && <div style={{ color: "#C9A84C", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>City {i + 1}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#e8e4dc", fontSize: "13px", fontFamily: "serif", marginBottom: "3px" }}>{h.detail?.split("·")[0]?.trim()}</div>
                    <div style={{ color: "#7a7468", fontSize: "12px" }}>{h.detail?.split("·").slice(1).join("·").trim()}</div>
                    <div style={{ color: "#555", fontSize: "11px", marginTop: "3px" }}>📋 Needs booking · {h.card}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#e8e4dc", fontSize: "15px", fontFamily: "serif" }}>{h.value}</div>
                    <div style={{ color: "#C9A84C", fontSize: "11px" }}>{h.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ground / other components */}
        {ground.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ color: "#C9A84C", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>🚗 Ground & Transfers</div>
            {ground.map((g, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "#b0a898", fontSize: "12px", marginBottom: "3px" }}>{g.label}</div>
                    <div style={{ color: "#7a7468", fontSize: "12px" }}>{g.detail}</div>
                    {g.detail?.toLowerCase().includes("helicopter") && <div style={{ color: "#C9A84C", fontSize: "11px", marginTop: "3px" }}>⚡ Arrange in advance</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#e8e4dc", fontSize: "14px", fontFamily: "serif" }}>{g.value}</div>
                    <div style={{ color: "#C9A84C", fontSize: "11px" }}>{g.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still needs booking */}
        <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", marginBottom: "24px" }}>
          <div style={{ color: "#888", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>📋 Still Needs Booking Outside Sojourn</div>
          {option.components.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#C9A84C", fontSize: "10px", marginTop: "2px", flexShrink: 0 }}>▪</span>
              <span style={{ color: "#6a6460", fontSize: "12px", lineHeight: "1.5" }}>
                {c.label?.toLowerCase().includes("flight") ? `${c.label} — book via ${c.card?.split("·")[0]?.trim() || "airline"} or travel agent` :
                 c.label?.toLowerCase().includes("hotel") ? `${c.detail?.split("·")[0]?.trim() || c.label} — book directly or via hotel website` :
                 c.detail?.toLowerCase().includes("helicopter") ? "Helicopter transfer — arrange via operator well in advance" :
                 c.detail?.toLowerCase().includes("eurostar") ? "Eurostar — book via eurostar.com" :
                 `${c.label} — arrange locally`}
              </span>
            </div>
          ))}
          {option.whyThis?.toLowerCase().includes("dining") || option.tags?.some(t => t.toLowerCase().includes("michelin") || t.toLowerCase().includes("dining")) ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#C9A84C", fontSize: "10px", marginTop: "2px" }}>▪</span>
              <span style={{ color: "#6a6460", fontSize: "12px" }}>Restaurant reservations — book via OpenTable, Resy, or directly with property</span>
            </div>
          ) : null}
        </div>

        {/* Loyalty highlight */}
        <div style={{ padding: "12px 16px", background: `${option.tagColor}0e`, border: `1px solid ${option.tagColor}22`, borderRadius: "10px", marginBottom: "20px" }}>
          <div style={{ color: option.tagColor, fontSize: "12px" }}>✦ {option.loyaltyHighlight}</div>
        </div>

        {/* Book button */}
        <button style={{ width: "100%", padding: "16px", background: option.tagColor, color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
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

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function SojournApp() {
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
    const loyaltyList = (p.loyaltyAccounts||[]).map(a=>a.program+" ("+a.tier+", "+a.balance+" pts)").join(", ");
    const brandList = (p.preferredBrands||[]).slice(0,15).join(", ");
    const learnedList = learnedPrefs.length > 0 ? learnedPrefs.join("; ") : null;
    return `You are Sojourn, an expert travel advisor and optimization engine. Reason carefully across this traveler's cards, loyalty programs, and preferences to surface 6 genuinely differentiated options.

TRAVELER PROFILE:
- Home airport: ${tp.homeAirport||"unknown"}
- Travel frequency: ${tp.frequency||"unknown"}
- Travel types: ${(tp.travelTypes||[]).join(", ")}
- Credit cards: ${cardList}
- Loyalty accounts: ${loyaltyList}${learnedList ? `
- LEARNED FROM PAST TRIPS: ${learnedList}` : ""}
- Preferred hotel brands: ${brandList}

Generate exactly 6 options as raw JSON. Output ONLY JSON — no markdown, no explanation, start with { end with }.

THE 6 OPTIONS (always in this order):
1. RECOMMENDED (#C9A84C) — Best overall fit for this traveler's profile and stated preferences.
2. BEST POINTS EARNED (#4C9AC9) — Maximizes loyalty accumulation. Name the card and why (e.g. "Amex Platinum 5x on direct flights").
3. BEST POINTS REDEMPTION (#4CC97A) — Best use of existing balances. redemption field must be non-null.
4. BEST VALUE (#C9C94C) — Lowest net cost after points (totalCost - pointsValue). Best experience per dollar.
5. QUALITY UPGRADE (#C94C8A) — Premium tier: business/first class, black car, luxury hotel. Worth the price delta.
6. WILD CARD (#9A4CC9) — Surprising option the traveler wouldn't find on their own. Boutique, under-radar, or unexpected combination. Must be specific and defensible. May suggest a nearby destination outside original request if genuinely compelling.

INTELLIGENCE RULES:
- Reference traveler's actual loyalty tier: "Your Marriott Gold gets confirmed late checkout and upgrade eligibility"
- Reference specific card multipliers: "Chase Sapphire Reserve 3x on hotels = 2,400 UR points worth ~$48"
- Room configs must match party size — be specific: "Two adjoining king rooms" not "hotel room"
- Flight details format: "AA 123 · SEA→MIA · Departs 7:45am → Arrives 4:02pm · 5h 17m nonstop" — duration MUST always be the last segment so it displays prominently next to flight times
- Hotel: property name · exact room config matching party size (e.g. "Two adjoining Kings" or "3BR villa sleeps 6") · nights · neighborhood. Never just "suite" — always specify beds and how the party fits.
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
- Marriott Bonvoy: Autograph Collection, Edition, Design Hotels, Tribute Portfolio, W Hotels, Westin, Le Meridien, The Luxury Collection — all earn Bonvoy and qualify for Gold/Platinum benefits
- World of Hyatt: Andaz, Thompson Hotels, Alila, Unbound Collection, Joie de Vivre, tommie, Caption — all earn Hyatt points and Discoverist/Explorist/Globalist benefits apply
- Hilton Honors: Curio Collection, Tapestry Collection, Tempo, Canopy — all earn Hilton points with full status benefits
- IHG One: Vignette Collection, Hotel Indigo, Kimpton — boutique-feeling with full IHG point earning
- When a traveler wants boutique character but also wants to earn points, ALWAYS consider these sub-brands before defaulting to independent properties or large flagship hotels

DESTINATION DIVERSITY RULE:
- When a query is open-ended or exploratory (mentions multiple destinations, says "open to ideas", or gives no single destination) — NEVER place more than 2 options in the same destination city or island
- Spread options across the geographic possibility space: e.g. for "beach vacation, Florida or Hawaii, open to ideas" use 2 Hawaii, 2 Florida, 1 Caribbean, 1 Wild Card
- Only converge on a single destination when the user has explicitly narrowed to it or refinement has confirmed it
- Each of the 6 options should feel like a genuinely different trip, not a variation of the same trip in the same place

REQUIRED JSON SCHEMA:
{"tripSummary":{"origin":"","destination":"","dates":"","preferences":[],"constraints":[]},"options":[{"id":1,"tag":"Recommended","tagColor":"#C9A84C","headline":"","subhead":"","totalCost":0,"pointsEarned":"","pointsValue":0,"netValue":0,"redemption":null,"tags":[],"tradeoff":"","loyaltyHighlight":"","whyThis":"","components":[{"label":"Flight","value":"","detail":"","points":"","card":""},{"label":"Return Flight","value":"","detail":"","points":"","card":""},{"label":"Hotel","value":"","detail":"","points":"","card":""},{"label":"Ground","value":"","detail":"","points":"","card":""}]}]}`;
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
            system: `You are Sojourn, an expert travel concierge. You help travelers clarify their trip before generating optimized options.

Traveler profile: home airport=${tp.homeAirport||"unknown"}, travel types=${(tp.travelTypes||[]).join(", ")}, cards=${(p.cards||[]).map(c=>c.name).join(", ")}.

Your job: Decide whether you have enough information to generate great options, or whether one focused question would meaningfully improve the results.

CRITICAL MISSING INFO (always ask if absent): number of travelers, travel dates or timeframe.
USEFUL BUT INFERABLE: budget (can be inferred from profile), hotel preference (from brands), airline (from loyalty).
NEVER ASK: things already in their profile, multiple questions at once, obvious details.

If you have enough to generate excellent options — destination, rough dates, party size — respond with EXACTLY:
READY: [one sentence reflecting back what you heard, e.g. "Got it — Seattle to Miami, 5 nights in mid-April, family of 4, beach focus."] Ready for me to generate your options?

If one critical piece is missing, ask ONE focused question. Be warm and brief. No bullet points.

Conversation so far: ${JSON.stringify(conversationRef.current)}`,
            messages: [{ role: "user", content: userMessage }],
          })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text?.trim() || "";

        if (reply.startsWith("READY:")) {
          // Enough info — show confirmation and offer to generate
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
      "Calculating net value across all options...",
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
      const timeout = setTimeout(() => controller.abort(), 90000);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
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
      setTripOptions(parsed.options);
      setTripSummary(parsed.tripSummary);
      setPhase("results");
    } catch(e) {
      try {
        const parsed = await tryGenerate();
        setTripOptions(parsed.options);
        setTripSummary(parsed.tripSummary);
        setPhase("results");
      } catch(e2) {
        setMessages(prev => [...prev, { role: "assistant", text: "Having trouble generating your options — please try again." }]);
      }
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

    const handleSend = () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    callClaude(msg);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleRefine = async () => {
    if (!refineInput.trim() || refineLoading) return;
    const msg = refineInput.trim();
    setRefineInput("");
    setRefineMessages(prev => [...prev, { role: "user", text: msg }]);
    setRefineLoading(true);

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
- Loyalty: ${userProfile.loyaltyAccounts.map(a=>`${a.program} (${a.tier}, ${a.balance} pts)`).join(", ")}
- Preferred brands: ${(userProfile.preferredBrands||[]).slice(0,15).join(", ")}

ORIGINAL TRIP REQUEST: ${(conversationRef.current&&conversationRef.current[0]&&conversationRef.current[0].content) || "unknown"}

CURRENT OPTIONS SHOWING:
${(tripOptions||[]).map(o => "[" + (o.tag||"") + "] " + (o.headline||"") + " ($" + (o.totalCost||0) + ") - " + (o.components||[]).filter(c=>c.label&&c.label.toLowerCase().includes("hotel")).map(c=>c.detail ? c.detail.split(" ")[0] : "").join(", ")).join("\n")}


WHEN TO GENERATE NEW CARDS:
- User wants changes: swap, replace, remove, add, update, "yes", "yes please", any budget or preference change
- Always output preamble (1-2 sentences summarizing what changed) THEN immediately the complete JSON
- NEVER claim you swapped something without outputting new JSON

WHEN TO RESPOND CONVERSATIONALLY:
- Factual questions, comparisons, requests for more information
- Be specific: name properties, quote prices, give times
- Reference the traveler's loyalty tier and card benefits by name
- End with an offer to update cards if relevant

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
- The Wild Card may go outside geography but MUST still honor weather and family constraints
- If user said 80+ degrees, Massachusetts/Big Sur/San Francisco/Pacific NW are never valid options in April
- Warm April destinations (80+F): Hawaii, South Florida, Caribbean, Mexico, Turks & Caicos, Bahamas — these always work
- Borderline April destinations (75-80F): Southern California, Naples FL — only include if user has not set a hard weather minimum

JSON SCHEMA — you MUST use exactly these field names or cards will not display:
{"tripSummary":{"origin":"","destination":"","dates":"","preferences":[],"constraints":[]},"options":[{"id":1,"tag":"","tagColor":"","headline":"","subhead":"","totalCost":0,"pointsEarned":"","pointsValue":0,"netValue":0,"redemption":null,"tags":[],"tradeoff":"","loyaltyHighlight":"","whyThis":"","components":[{"label":"Flight","value":"","detail":"","points":"","card":""},{"label":"Return Flight","value":"","detail":"","points":"","card":""},{"label":"Hotel","value":"","detail":"","points":"","card":""},{"label":"Ground","value":"","detail":"","points":"","card":""}]}]}
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
            ...(refineMessages||[]).filter(m=>m&&m.text).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text || "" })),
            { role: "user", content: msg }
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
          pointsValue: typeof o.pointsValue === "number" ? o.pointsValue : parseInt(String(o.pointsValue||"0").replace(/[^0-9]/g,"")) || 0,
          netValue: typeof o.netValue === "number" ? o.netValue : parseInt(String(o.netValue||"0").replace(/[^0-9]/g,"")) || 0,
          redemption: o.redemption || null,
          tags: o.tags || [],
          tradeoff: o.tradeoff || "",
          loyaltyHighlight: o.loyaltyHighlight || o.loyaltyBenefit || "",
          whyThis: o.whyThis || o.why || o.reason || "",
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
        try {
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          if (start !== -1 && end !== -1) {
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
        setTripOptions(parsed.options);
        if (parsed.summary) setTripSummary(parsed.summary);
        setExpandedId(null);
        setShowCompare(false);
        const summary = parsed.preamble || "";
        const confirmation = summary.length > 10 ? summary : "Updated your options — cards now reflect your latest preferences.";
        setRefineMessages(prev => [...prev, { role: "assistant", text: confirmation }]);
        setRefineLoading(false);
        return;
      }

      // Conversational response — strip any JSON that leaked into the text
      // Strip any markdown fences from conversational response
      replyText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
      const idxArray = replyText.indexOf("[{");
      const idxObj = replyText.indexOf('{"id"');
      const jsonStart = Math.min(
        idxArray > -1 ? idxArray : Infinity,
        idxObj > -1 ? idxObj : Infinity,
      );
      const cleanReply = jsonStart < Infinity ? replyText.slice(0, jsonStart).trim() : replyText;
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
    setInput(""); setTripOptions([]); setTripSummary(null);
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
          <button onClick={resetApp} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>New Trip</button>
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

        <div style={{ padding: "20px 28px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: "22px", fontFamily: "'Playfair Display',Georgia,serif", marginBottom: "3px" }}>6 options, optimized for you</div>
            <div style={{ color: "#555", fontSize: "12px" }}>Tap a card to explore · Scroll to see all</div>
          </div>
          {!showCompare && !expandedId && (
            <button onClick={() => setShowCompare(true)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#888", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>Compare All →</button>
          )}
        </div>

        <div style={{ padding: "0 28px 48px" }}>
          {showCompare ? (
            <CompareView options={tripOptions} onBack={() => setShowCompare(false)} onSelectOption={(id) => { setShowCompare(false); setExpandedId(id); }} />
          ) : expandedId ? (
            <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
              <button onClick={() => setExpandedId(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#888", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", marginBottom: "16px" }}>← All Options</button>
              <TripCard option={tripOptions.find(o => o.id === expandedId)} isExpanded={true} onToggle={() => setExpandedId(null)} onItinerary={(opt) => setItineraryOption(opt)} />
              <div style={{ marginTop: "14px" }}>
                <div style={{ color: "#555", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>Other Options</div>
                <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }} className="card-scroll">
                  {tripOptions.filter(o => o.id !== expandedId).map(opt => (
                    <div key={opt.id} onClick={() => setExpandedId(opt.id)} style={{ flexShrink: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px 14px", cursor: "pointer", minWidth: "155px" }}>
                      <div style={{ color: opt.tagColor, fontSize: "10px", marginBottom: "4px" }}>{opt.tag}</div>
                      <div style={{ color: "#b0a898", fontSize: "13px", fontFamily: "serif" }}>{typeof opt.totalCost === "number" ? opt.totalCost.toLocaleString() : String(opt.totalCost).replace(/^\$+/,"")}</div>
                      <div style={{ color: "#555", fontSize: "11px" }}>net {typeof opt.netValue === "number" ? opt.netValue.toLocaleString() : String(opt.netValue).replace(/^\$+/,"")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-scroll" style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "16px", paddingRight: "56px", scrollSnapType: "x mandatory" }}>
              {tripOptions.map((opt, i) => (
                <div key={opt.id} style={{ scrollSnapAlign: "start", animation: `fadeUp 0.5s ease ${i * 0.07}s forwards`, opacity: 0 }}>
                  <TripCard option={opt} isExpanded={false} onToggle={() => setExpandedId(expandedId === opt.id ? null : opt.id)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refine bar — persistent on results screen */}
        <div style={{ padding: "0 28px 12px" }}>
          {refineMessages.length > 0 && (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto" }}>
              {refineMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
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
                </div>
              ))}
            </div>
          )}
          {refineLoading && refineLoadingMessage && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", marginBottom: "8px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px" }}>
              <TypingIndicator />
              <span style={{ color: "#C9A84C", fontSize: "12px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic" }}>{refineLoadingMessage}</span>
            </div>
          )}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px", padding: "4px 4px 4px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              value={refineInput}
              onChange={e => setRefineInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRefine(); }}
              placeholder="Refine your trip — e.g. &quot;any other Marriott options?&quot; or &quot;swap the hotel for something quieter&quot;"
              style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "13px", padding: "10px 0", fontFamily: "'DM Sans',system-ui,sans-serif", outline: "none" }}
            />
            {refineLoading ? (
              <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TypingIndicator />
              </div>
            ) : (
              <button onClick={handleRefine} disabled={!refineInput.trim()} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: refineInput.trim() ? "pointer" : "default", background: refineInput.trim() ? "#C9A84C" : "rgba(201,168,76,0.1)", color: refineInput.trim() ? "#0a0908" : "#555", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>↑</button>
            )}
          </div>
          <div style={{ color: "#2a2a2a", fontSize: "10px", textAlign: "center", marginTop: "6px", letterSpacing: "0.05em" }}>Ask Sojourn to refine, swap a component, or explore alternatives</div>
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
      {isFirst && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px 12px", animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "32px", fontFamily: "'Playfair Display',Georgia,serif", color: "#e8e4dc", lineHeight: "1.2", marginBottom: "12px" }}>Where are you going?</div>
            <div style={{ color: "#555", fontSize: "14px", lineHeight: "1.6", maxWidth: "420px" }}>Tell me your trip in plain language — destination, dates, preferences, budget, and any constraints. Include who you're traveling with if relevant. I'll optimize across all your cards and loyalty programs.</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", padding: "4px 4px 4px 18px", display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "16px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={`e.g. "New York next week, direct flights, back by Thursday. I'm thinking around $2,000 but open if the value is there. Maximize my points."`}
              rows={3} style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "15px", lineHeight: "1.6", padding: "12px 0", fontFamily: "'DM Sans',system-ui,sans-serif" }} />
            <div style={{ display: "flex", gap: "6px", paddingBottom: "8px", flexShrink: 0 }}>
              <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening} style={{ width: "38px", height: "38px", borderRadius: "10px", border: "none", cursor: "pointer", background: listening ? "rgba(201,76,76,0.2)" : "rgba(255,255,255,0.06)", color: listening ? "#C94C4C" : "#666", fontSize: "16px", animation: listening ? "pulse 1.2s infinite" : "none" }}>🎤</button>
              <button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: "38px", height: "38px", borderRadius: "10px", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: input.trim() && !loading ? "#C9A84C" : "rgba(201,168,76,0.15)", color: input.trim() && !loading ? "#0a0908" : "#555", fontSize: "18px", fontWeight: "bold" }}>↑</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["NYC next week, direct flights, back by Thursday", "Chicago conference, maximize Marriott points", "LA on a budget, use my United miles"].map(ex => (
              <button key={ex} onClick={() => setInput(ex)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6a6460", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontSize: "12px" }}>{ex}</button>
            ))}
          </div>
        </div>
      )}

      {/* Message thread — after first exchange */}
      {!isFirst && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.slice(1).map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease forwards" }}>
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: msg.role === "user" ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(255,255,255,0.07)", color: msg.role === "user" ? "#e8e4dc" : "#b0a898", fontSize: "14px", lineHeight: "1.6", fontFamily: msg.role === "assistant" ? "'Playfair Display',Georgia,serif" : "inherit", fontStyle: msg.role === "assistant" ? "italic" : "normal" }}>{msg.text}</div>
              {msg.isReadyPrompt && (
                <button onClick={() => { setConciergeMode(false); callClaude("Generate my options now based on everything discussed."); }} style={{ marginTop: "10px", padding: "11px 22px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Generate My Options →
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
              <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", background: listening ? "rgba(201,76,76,0.2)" : "rgba(255,255,255,0.06)", color: listening ? "#C94C4C" : "#666", fontSize: "16px", animation: listening ? "pulse 1.2s infinite" : "none" }}>🎤</button>
              <button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: input.trim() && !loading ? "#C9A84C" : "rgba(201,168,76,0.15)", color: input.trim() && !loading ? "#0a0908" : "#555", fontSize: "16px", fontWeight: "bold" }}>↑</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom drawers */}
      <div style={{ padding: "0 24px 24px", flexShrink: 0, display: "flex", gap: "10px" }}>
        <PointsDashboardDrawer profile={userProfile} />
        <BottomDrawer
          label="Preferred Brands"
          count={(userProfile.preferredBrands||[]).length}
          items={[
            { section: "Your Selections", entries: (userProfile.preferredBrands||[]).slice(0,20) },
          ]}
        />
      </div>
    </div>
  );
}
