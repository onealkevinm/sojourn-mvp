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
    { program: "Hawaiian Miles", tiers: ["None", "Pualani Silver", "Pualani Gold"] },
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


// ─── STRUCTURED TRAVEL BENEFITS DATABASE ────────────────────────────────────
// Three buckets per benefit:
//   decisionLogic: marginal benefits that apply to THIS trip — no annual meter,
//                  no residual balance required. Affects recommendation reasoning.
//   loyaltyHighlight: same as decisionLogic but surfaces on the option card as
//                     a friendly reminder of what the traveler unlocks this trip.
//   itineraryReminder: annual/metered benefits worth checking before travel.
//                      Surfaced as soft reminders ("worth checking on...") NOT
//                      as guaranteed amounts — we don't have visibility into
//                      residual balances until API integration.
// Update cadence: 2-4x per year. Last updated: March 2026.
// ─────────────────────────────────────────────────────────────────────────────

const CARD_BENEFITS_DB = {
  "Chase Sapphire Reserve": {
    network: "Visa",
    annualFee: 550,
    transferPartners: ["United MileagePlus", "Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "Southwest Rapid Rewards", "World of Hyatt", "Marriott Bonvoy"],
    multipliers: { flights: 3, hotels: 3, dining: 3, default: 1 },
    decisionLogic: {
      loungeAccess: ["Priority Pass Select"],
      primaryCarRentalInsurance: true,
      noForeignTransactionFee: true,
      tripCancellationInsurance: true,
    },
    itineraryReminder: [
      "Worth checking on your $300 annual travel credit — applies broadly to travel purchases",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "Chase Sapphire Preferred": {
    network: "Visa",
    annualFee: 95,
    transferPartners: ["United MileagePlus", "Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "Southwest Rapid Rewards", "World of Hyatt", "Marriott Bonvoy"],
    multipliers: { flights: 2, hotels: 2, dining: 3, default: 1 },
    decisionLogic: {
      primaryCarRentalInsurance: true,
      noForeignTransactionFee: true,
      tripCancellationInsurance: true,
    },
    itineraryReminder: [
      "Worth checking on your $50 annual hotel credit via Chase Travel",
    ]
  },
  "Amex Platinum": {
    network: "Amex",
    annualFee: 695,
    transferPartners: ["Delta SkyMiles", "Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "ANA Mileage Club", "Emirates Skywards", "Aeroplan"],
    multipliers: { flights_direct: 5, hotels_amex_travel: 5, default: 1 },
    decisionLogic: {
      loungeAccess: ["Centurion Lounge", "Escape Lounges", "Lufthansa Lounges"],
      fineHotelsResorts: { benefit: "Room upgrade, early checkin 12pm, late checkout 4pm, daily breakfast for 2, $100 property credit", notes: "Must book via Amex Travel — applies to this stay" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your $200 annual airline fee credit — select your airline in Amex account if not done",
      "Worth checking on your $200 annual hotel credit via Fine Hotels & Resorts or Hotel Collection",
      "Delta Sky Club access when flying Delta — check current visit allowance in your Amex account",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "Amex Gold": {
    network: "Amex",
    annualFee: 250,
    transferPartners: ["Delta SkyMiles", "Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "ANA Mileage Club", "Emirates Skywards"],
    multipliers: { flights_direct: 3, restaurants: 4, us_supermarkets: 4, default: 1 },
    decisionLogic: {
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your $120 annual dining credit at select partners",
      "Worth checking on your $120 annual Uber Cash credit",
    ]
  },
  "Amex Business Platinum": {
    network: "Amex",
    annualFee: 695,
    transferPartners: ["Delta SkyMiles", "Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "ANA Mileage Club", "Emirates Skywards"],
    multipliers: { flights_direct: 5, hotels_amex_travel: 5, default: 1 },
    decisionLogic: {
      loungeAccess: ["Centurion Lounge", "Escape Lounges", "Lufthansa Lounges"],
      fineHotelsResorts: true,
      noForeignTransactionFee: true,
      pointsRebate35pct: { notes: "35% points back when using Pay with Points for first/business class on selected airline" },
    },
    itineraryReminder: [
      "Worth checking on your $200 annual airline fee credit",
      "Delta Sky Club access when flying Delta — check current visit allowance",
    ]
  },
  "Capital One Venture X": {
    network: "Visa",
    annualFee: 395,
    transferPartners: ["Air France Flying Blue", "British Airways Avios", "Singapore KrisFlyer", "Turkish Miles&Smiles", "Avianca LifeMiles", "Wyndham Rewards"],
    multipliers: { flights_via_capital_one_travel: 5, hotels_via_capital_one_travel: 10, default: 2 },
    decisionLogic: {
      loungeAccess: ["Capital One Lounges", "Priority Pass Select"],
      primaryCarRentalInsurance: true,
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your $300 annual travel credit via Capital One Travel portal",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "Delta SkyMiles Reserve": {
    network: "Amex",
    annualFee: 650,
    transferPartners: ["Delta SkyMiles"],
    multipliers: { delta_purchases: 3, default: 1 },
    decisionLogic: {
      loungeAccess: ["Delta Sky Club (when flying Delta same day)"],
      firstCheckedBagFree: true,
      upgradePriority: { notes: "Complimentary upgrade priority boost on Delta flights" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Delta Sky Club access at your departure airport when flying Delta — worth a visit before your flight",
      "Worth checking on your annual companion certificate for domestic first class or Comfort+",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "Delta SkyMiles Platinum": {
    network: "Amex",
    annualFee: 350,
    transferPartners: ["Delta SkyMiles"],
    multipliers: { delta_purchases: 3, default: 1 },
    decisionLogic: {
      firstCheckedBagFree: true,
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your annual companion certificate for domestic main cabin",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "BofA Alaska Airlines Visa": {
    network: "Visa",
    annualFee: 75,
    transferPartners: ["Alaska Mileage Plan"],
    multipliers: { alaska_purchases: 3, default: 1 },
    decisionLogic: {
      firstCheckedBagFree: { travelers: 6, notes: "Cardholder and up to 5 companions on same reservation" },
    },
    itineraryReminder: [
      "Worth checking on your annual companion fare from $122 ($99 + taxes/fees)",
    ]
  },
  "United Explorer Card": {
    network: "Visa",
    annualFee: 95,
    transferPartners: ["United MileagePlus"],
    multipliers: { united_purchases: 2, hotels: 2, dining: 2, default: 1 },
    decisionLogic: {
      firstCheckedBagFree: { travelers: 2, notes: "Cardholder and one companion" },
      primaryCarRentalInsurance: true,
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your 2 annual United Club one-time passes",
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "Citi AAdvantage Executive": {
    network: "Mastercard",
    annualFee: 595,
    transferPartners: ["American AAdvantage"],
    multipliers: { aa_purchases: 4, default: 1 },
    decisionLogic: {
      loungeAccess: ["Admirals Club (full membership — cardholder + guests)"],
      firstCheckedBagFree: { travelers: 8, notes: "Cardholder and up to 8 companions" },
      upgradePriority: true,
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Global Entry/TSA PreCheck credit available if not yet used",
    ]
  },
  "World of Hyatt Card": {
    network: "Visa",
    annualFee: 95,
    transferPartners: ["World of Hyatt"],
    multipliers: { hyatt_hotels: 4, dining: 2, airline_tickets: 2, default: 1 },
    decisionLogic: {
      discoveristStatus: { notes: "Automatic Discoverist status" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your annual free night certificate (Category 1-4 property)",
    ]
  },
  "Marriott Bonvoy Boundless": {
    network: "Visa",
    annualFee: 95,
    transferPartners: ["Marriott Bonvoy"],
    multipliers: { marriott_hotels: 6, default: 2 },
    decisionLogic: {
      silverStatus: { notes: "Automatic Silver Elite status" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your annual free night certificate (up to 35,000 points)",
    ]
  },
  "Hilton Honors Amex Surpass": {
    network: "Amex",
    annualFee: 150,
    transferPartners: ["Hilton Honors"],
    multipliers: { hilton_hotels: 12, us_restaurants: 6, us_supermarkets: 6, us_gas: 3, default: 3 },
    decisionLogic: {
      goldStatus: { notes: "Automatic Hilton Gold — free breakfast at most full-service properties" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on free weekend night reward if you have reached $15k spend",
    ]
  },
  "Southwest Rapid Rewards Priority": {
    network: "Visa",
    annualFee: 149,
    transferPartners: ["Southwest Rapid Rewards"],
    multipliers: { southwest_purchases: 3, hotel_and_car: 2, default: 1 },
    decisionLogic: {
      noForeignTransactionFee: true,
    },
    itineraryReminder: [
      "Worth checking on your $75 annual Southwest travel credit",
      "4 upgraded boardings per year when available — request at gate",
    ]
  },
  "Chase Freedom Unlimited": {
    network: "Visa",
    annualFee: 0,
    transferPartners: ["Chase Ultimate Rewards (when paired with Sapphire)"],
    multipliers: { travel_via_chase: 5, dining: 3, drugstores: 3, default: 1.5 },
    decisionLogic: {
      tripCancellationInsurance: true,
    },
    itineraryReminder: []
  },
  "USAA Preferred Cash Rewards Visa": {
    network: "Visa",
    annualFee: 0,
    transferPartners: [],
    multipliers: { default: 1.5 },
    decisionLogic: {
      cashback: { rate: 1.5, notes: "Flat 1.5% cash back on all purchases, no bonus categories" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: []
  },
  "USAA Rewards Visa": {
    network: "Visa",
    annualFee: 0,
    transferPartners: [],
    multipliers: { default: 1 },
    decisionLogic: {
      cashback: { rate: 1, notes: "Flat 1% cash back on all purchases" },
      noForeignTransactionFee: true,
    },
    itineraryReminder: []
  },
  "Wells Fargo Autograph": {
    network: "Visa",
    annualFee: 0,
    transferPartners: [],
    multipliers: { travel: 3, dining: 3, gas: 3, transit: 3, streaming: 3, phone_plans: 3, default: 1 },
    decisionLogic: {
      noForeignTransactionFee: true,
      cellPhoneProtection: { amount: 600 },
    },
    itineraryReminder: []
  },
};

// ─── HOTEL LOYALTY BENEFITS DATABASE ────────────────────────────────────────

const HOTEL_BENEFITS_DB = {
  "Marriott Bonvoy": {
    cpp_estimate: 0.8,
    tiers: {
      "None": {
        decisionLogic: { pointsEarnRate: 10 },
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Silver": {
        decisionLogic: { pointsEarnRate: 11, bonusPoints: "10%" },
        loyaltyHighlight: ["10% bonus points on stays"],
        itineraryReminder: ["Worth asking about late checkout at checkin (2pm, based on availability)"]
      },
      "Gold": {
        decisionLogic: { pointsEarnRate: 12.5, bonusPoints: "25%", enhancedRoomUpgrade: true, lateCheckout: "2pm guaranteed most properties" },
        loyaltyHighlight: ["Enhanced room upgrade at checkin", "2pm late checkout at most properties"],
        itineraryReminder: ["Worth asking about welcome gift at checkin"]
      },
      "Platinum": {
        decisionLogic: { pointsEarnRate: 15, bonusPoints: "50%", suiteUpgrade: true, lateCheckout: "4pm guaranteed", loungeAccess: "where available" },
        loyaltyHighlight: ["Suite upgrade based on availability", "4pm late checkout guaranteed", "Club lounge access where available"],
        itineraryReminder: ["Worth asking about welcome amenity choice at checkin"]
      },
      "Titanium": {
        decisionLogic: { pointsEarnRate: 17.5, bonusPoints: "75%", suiteUpgrade: "48hr advance", lateCheckout: "4pm guaranteed", loungeAccess: "guaranteed" },
        loyaltyHighlight: ["Suite upgrade 48hr in advance", "Club lounge guaranteed", "4pm checkout guaranteed"],
        itineraryReminder: []
      },
      "Ambassador": {
        decisionLogic: { pointsEarnRate: 20, bonusPoints: "100%", suiteUpgrade: "guaranteed", lateCheckout: "4pm guaranteed", loungeAccess: "guaranteed" },
        loyaltyHighlight: ["Guaranteed suite upgrade", "Club lounge guaranteed", "4pm checkout guaranteed", "Personal Ambassador service"],
        itineraryReminder: ["Worth checking on your annual Your24 benefit for flexible checkin/checkout"]
      }
    }
  },
  "World of Hyatt": {
    cpp_estimate: 1.7,
    tiers: {
      "None": {
        decisionLogic: { pointsEarnRate: 5 },
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Discoverist": {
        decisionLogic: { pointsEarnRate: 6.5, bonusPoints: "10%", roomUpgrade: "standard room at checkin", lateCheckout: "2pm request" },
        loyaltyHighlight: ["Standard room upgrade at checkin", "2pm late checkout (request at checkin)"],
        itineraryReminder: []
      },
      "Explorist": {
        decisionLogic: { pointsEarnRate: 6.5, bonusPoints: "20%", roomUpgrade: "best available at checkin", lateCheckout: "2pm guaranteed", clubLounge: "where available" },
        loyaltyHighlight: ["Best available room upgrade at checkin", "2pm late checkout guaranteed", "Club lounge access where available"],
        itineraryReminder: []
      },
      "Globalist": {
        decisionLogic: {
          pointsEarnRate: 6.5,
          bonusPoints: "30%",
          freeBreakfast: true,
          freeBreakfastGuests: 2,
          lateCheckout: "4pm guaranteed",
          suiteUpgrade: "at checkin based on availability",
          clubLounge: "guaranteed",
          resortFeeWaiver: true,
          parkingWaiver: "complimentary at many properties",
        },
        loyaltyHighlight: ["Free breakfast for 2 daily", "4pm late checkout guaranteed", "Club lounge access guaranteed", "Resort/destination fee waiver at many properties", "Suite upgrade at checkin based on availability"],
        itineraryReminder: ["Worth checking on complimentary parking eligibility at this property", "4 Suite Upgrade Awards annually for confirmed advance upgrades — worth checking your balance"]
      }
    }
  },
  "Hilton Honors": {
    cpp_estimate: 0.5,
    tiers: {
      "None": {
        decisionLogic: { pointsEarnRate: 10 },
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Silver": {
        decisionLogic: { pointsEarnRate: 12, bonusPoints: "20%" },
        loyaltyHighlight: ["20% bonus points on stays"],
        itineraryReminder: []
      },
      "Gold": {
        decisionLogic: { pointsEarnRate: 18, bonusPoints: "80%", freeBreakfast: true, freeBreakfastGuests: 2, roomUpgrade: "standard at checkin", lateCheckout: "2pm request" },
        loyaltyHighlight: ["Free breakfast for 2 at most full-service properties", "Standard room upgrade at checkin"],
        itineraryReminder: ["Worth asking about late checkout at checkin (2pm, space available)"]
      },
      "Diamond": {
        decisionLogic: { pointsEarnRate: 20, bonusPoints: "100%", freeBreakfast: true, freeBreakfastGuests: 2, executiveLounge: "where available", lateCheckout: "2pm guaranteed", suiteUpgrade: "space available" },
        loyaltyHighlight: ["Free breakfast for 2 guaranteed", "Executive lounge access where available", "2pm late checkout guaranteed", "Suite upgrade space available"],
        itineraryReminder: []
      }
    }
  },
  "IHG One Rewards": {
    cpp_estimate: 0.6,
    tiers: {
      "None": {
        decisionLogic: { pointsEarnRate: 10 },
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Silver": {
        decisionLogic: { pointsEarnRate: 12, bonusPoints: "20%" },
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Gold": {
        decisionLogic: { pointsEarnRate: 15, bonusPoints: "40%", roomUpgrade: "standard at checkin", lateCheckout: "2pm request" },
        loyaltyHighlight: ["Standard room upgrade at checkin"],
        itineraryReminder: ["Worth asking about late checkout at checkin (2pm, space available)"]
      },
      "Platinum": {
        decisionLogic: { pointsEarnRate: 17, bonusPoints: "60%", roomUpgrade: "best available", lateCheckout: "2pm guaranteed", loungeAccess: "where available" },
        loyaltyHighlight: ["Best available room upgrade", "2pm late checkout guaranteed", "Lounge access where available"],
        itineraryReminder: []
      },
      "Diamond": {
        decisionLogic: { pointsEarnRate: 20, bonusPoints: "100%", suiteUpgrade: "space available", lateCheckout: "4pm request", loungeAccess: "where available" },
        loyaltyHighlight: ["Suite upgrade space available", "Lounge access where available"],
        itineraryReminder: ["Worth asking about 4pm late checkout at checkin (space available)"]
      }
    }
  },
};

// ─── AIRLINE LOYALTY BENEFITS DATABASE ──────────────────────────────────────

const AIRLINE_BENEFITS_DB = {
  "Delta SkyMiles": {
    cpp_estimate: 1.2,
    alliance: "SkyTeam",
    partners: ["Air France", "KLM", "Virgin Atlantic", "Korean Air", "Aeromexico", "WestJet"],
    tiers: {
      "None": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Silver Medallion": {
        decisionLogic: { bonusMiles: "40%", firstCheckedBagFree: true, upgradeWaitlist: true },
        loyaltyHighlight: ["Free first checked bag", "Complimentary Comfort+ upgrade waitlist"],
        itineraryReminder: []
      },
      "Gold Medallion": {
        decisionLogic: { bonusMiles: "80%", firstCheckedBagFree: true, comfort_plus_confirmed: true },
        loyaltyHighlight: ["Free first checked bag", "Comfort+ confirmed at booking"],
        itineraryReminder: []
      },
      "Platinum Medallion": {
        decisionLogic: { bonusMiles: "120%", firstCheckedBagFree: true, loungeAccess: "Delta Sky Club on day of Delta flight", upgradeWaitlist: "high priority first class" },
        loyaltyHighlight: ["Delta Sky Club access", "High priority first class upgrade waitlist", "Free first checked bag"],
        itineraryReminder: ["Worth checking on your 4 Global Upgrade Certificates balance"]
      },
      "Diamond Medallion": {
        decisionLogic: { bonusMiles: "150%", firstCheckedBagFree: true, loungeAccess: "Delta Sky Club unlimited", upgradeWaitlist: "top priority all routes" },
        loyaltyHighlight: ["Unlimited Delta Sky Club access", "Top priority upgrades on all routes", "Free first checked bag"],
        itineraryReminder: ["Worth checking on your 8 Global Upgrade Certificate balance", "Choice Status Rewards selection if applicable"]
      }
    }
  },
  "United MileagePlus": {
    cpp_estimate: 1.4,
    alliance: "Star Alliance",
    partners: ["Lufthansa", "ANA", "Singapore Airlines", "Swiss", "Air Canada", "Austrian"],
    tiers: {
      "None": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Silver": {
        decisionLogic: { bonusMiles: "25%", firstCheckedBagFree: true, upgradeWaitlist: true },
        loyaltyHighlight: ["Free first checked bag", "Upgrade waitlist priority"],
        itineraryReminder: []
      },
      "Gold": {
        decisionLogic: { bonusMiles: "50%", firstCheckedBagFree: true, economyPlusConfirmed: true },
        loyaltyHighlight: ["Free first checked bag", "Economy Plus at booking"],
        itineraryReminder: []
      },
      "Platinum": {
        decisionLogic: { bonusMiles: "75%", firstCheckedBagFree: true, upgradeWaitlist: "high priority domestic and international" },
        loyaltyHighlight: ["Free first checked bag", "High priority upgrades domestic and international"],
        itineraryReminder: ["Worth checking on your 2 annual United Club passes"]
      },
      "1K": {
        decisionLogic: { bonusMiles: "100%", firstCheckedBagFree: true, loungeAccess: "United Club unlimited + Star Alliance lounges", upgradeWaitlist: "top priority all routes" },
        loyaltyHighlight: ["Unlimited United Club + Star Alliance lounge access", "Top priority upgrades all routes", "Free first checked bag"],
        itineraryReminder: ["Worth checking on your Global Premier Upgrade certificate balance"]
      }
    }
  },
  "Alaska Mileage Plan": {
    cpp_estimate: 1.5,
    alliance: "oneworld",
    partners: ["American", "British Airways", "Cathay Pacific", "Finnair", "Qantas", "Japan Airlines", "Emirates", "Condor"],
    tiers: {
      "None": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "MVP": {
        decisionLogic: { bonusMiles: "50%", firstCheckedBagFree: true, upgradeWaitlist: true },
        loyaltyHighlight: ["Free first checked bag", "Upgrade waitlist priority"],
        itineraryReminder: []
      },
      "MVP Gold": {
        decisionLogic: { bonusMiles: "100%", firstCheckedBagFree: true, upgradeWaitlist: "priority" },
        loyaltyHighlight: ["Free first checked bag", "Priority upgrade waitlist"],
        itineraryReminder: ["Worth checking on your annual companion upgrade certificate"]
      },
      "MVP Gold 75K": {
        decisionLogic: { bonusMiles: "125%", firstCheckedBagFree: true, loungeAccess: "Alaska Lounge access on day of travel", upgradeWaitlist: "top priority" },
        loyaltyHighlight: ["Alaska Lounge access", "Top priority upgrades", "Free first checked bag"],
        itineraryReminder: ["Worth checking on your Global Upgrade Certificate balance"]
      }
    }
  },
  "American AAdvantage": {
    cpp_estimate: 1.3,
    alliance: "oneworld",
    partners: ["British Airways", "Cathay Pacific", "Finnair", "Iberia", "Japan Airlines", "Qantas", "Qatar Airways", "Alaska"],
    tiers: {
      "None": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Gold": {
        decisionLogic: { bonusMiles: "40%", firstCheckedBagFree: true, upgradeWaitlist: true },
        loyaltyHighlight: ["Free first checked bag", "Domestic upgrade waitlist"],
        itineraryReminder: []
      },
      "Platinum": {
        decisionLogic: { bonusMiles: "60%", firstCheckedBagFree: true, upgradeWaitlist: "domestic priority + international waitlist" },
        loyaltyHighlight: ["Free first checked bag", "Domestic upgrade priority"],
        itineraryReminder: ["Worth checking on your 500-mile upgrade certificate balance"]
      },
      "Platinum Pro": {
        decisionLogic: { bonusMiles: "80%", firstCheckedBagFree: true, loungeAccess: "Admirals Club day of travel", upgradeWaitlist: "high priority" },
        loyaltyHighlight: ["Admirals Club access day of travel", "High priority upgrades", "Free first checked bag"],
        itineraryReminder: []
      },
      "Executive Platinum": {
        decisionLogic: { bonusMiles: "120%", firstCheckedBagFree: true, loungeAccess: "Admirals Club unlimited + oneworld lounges", upgradeWaitlist: "top priority domestic guaranteed" },
        loyaltyHighlight: ["Unlimited Admirals Club + oneworld lounge access", "Guaranteed domestic upgrades", "Free first checked bag"],
        itineraryReminder: ["Worth checking on your Systemwide Upgrade certificate balance"]
      }
    }
  },
  "Hawaiian Miles": {
    cpp_estimate: 1.1,
    alliance: null,
    partners: ["Alaska Mileage Plan"],
    notes: "Hawaiian acquired by Alaska Airlines 2024. HawaiianMiles merging into Alaska Mileage Plan. Existing HawaiianMiles still redeemable on Hawaiian metal and select partners.",
    tiers: {
      "None": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Pualani Silver": {
        decisionLogic: { bonusMiles: "25%", firstCheckedBagFree: true },
        loyaltyHighlight: ["Free first checked bag", "Priority check-in"],
        itineraryReminder: []
      },
      "Pualani Gold": {
        decisionLogic: { bonusMiles: "50%", firstCheckedBagFree: true, loungeAccess: "Premier Club lounge access" },
        loyaltyHighlight: ["Premier Club lounge access", "Free first checked bag", "Priority boarding"],
        itineraryReminder: ["Note: HawaiianMiles is merging into Alaska Mileage Plan — worth checking current program status"]
      }
    }
  },
  "Southwest Rapid Rewards": {
    cpp_estimate: 1.5,
    alliance: null,
    partners: [],
    tiers: {
      "None": {
        decisionLogic: { bagsFree: 2 },
        loyaltyHighlight: ["2 free checked bags for all Southwest passengers"],
        itineraryReminder: []
      },
      "A-List": {
        decisionLogic: { bonusPoints: "25%", bagsFree: 2, boardingPriority: true },
        loyaltyHighlight: ["Priority boarding", "2 free checked bags"],
        itineraryReminder: []
      },
      "A-List Preferred": {
        decisionLogic: { bonusPoints: "100%", bagsFree: 2, boardingPriority: true, freeWifi: true },
        loyaltyHighlight: ["Priority boarding", "Free inflight wifi", "2 free checked bags"],
        itineraryReminder: []
      },
      "Companion Pass": {
        decisionLogic: { companionFliesFree: true },
        loyaltyHighlight: ["Companion flies free on this flight"],
        itineraryReminder: []
      }
    }
  },
};

// ─── RENTAL CAR BENEFITS DATABASE ───────────────────────────────────────────

const CAR_BENEFITS_DB = {
  "National Emerald Club": {
    tiers: {
      "Emerald Club": {
        decisionLogic: { skipCounter: true, chooseOwnCar: true },
        loyaltyHighlight: ["Skip counter — go straight to Emerald Aisle", "Choose your own car"],
        itineraryReminder: []
      },
      "Executive": {
        decisionLogic: { skipCounter: true, guaranteedUpgrade: "one class above reserved", eliteLane: true },
        loyaltyHighlight: ["Guaranteed one-class upgrade", "Executive Area selection", "Skip counter"],
        itineraryReminder: []
      },
      "Executive Elite": {
        decisionLogic: { skipCounter: true, guaranteedUpgrade: "two classes above reserved", eliteLane: true },
        loyaltyHighlight: ["Guaranteed two-class upgrade", "Executive Elite counter", "Skip counter"],
        itineraryReminder: []
      }
    }
  },
  "Hertz Gold Plus Rewards": {
    tiers: {
      "Gold": {
        decisionLogic: { skipCounter: true },
        loyaltyHighlight: ["Skip counter at most locations"],
        itineraryReminder: []
      },
      "Five Star": {
        decisionLogic: { skipCounter: true, eliteLane: true },
        loyaltyHighlight: ["Skip counter", "Five Star lane at major locations"],
        itineraryReminder: []
      },
      "Presidents Circle": {
        decisionLogic: { skipCounter: true, guaranteedUpgrade: "one class", vehicleReadyGuarantee: true },
        loyaltyHighlight: ["Guaranteed one-class upgrade", "Vehicle ready guarantee", "Top Tier lane"],
        itineraryReminder: []
      }
    }
  },
  "Avis Preferred": {
    tiers: {
      "Preferred": {
        decisionLogic: { skipCounter: true },
        loyaltyHighlight: ["Skip counter at most locations"],
        itineraryReminder: []
      },
      "Select": {
        decisionLogic: { skipCounter: true, eliteLane: true },
        loyaltyHighlight: ["Skip counter", "Select lane access"],
        itineraryReminder: []
      },
      "Chairman": {
        decisionLogic: { skipCounter: true, guaranteedUpgrade: "one class" },
        loyaltyHighlight: ["Guaranteed upgrade", "Chairman lane"],
        itineraryReminder: []
      }
    }
  },
  "Enterprise Plus": {
    tiers: {
      "Silver": {
        decisionLogic: {},
        loyaltyHighlight: [],
        itineraryReminder: []
      },
      "Gold": {
        decisionLogic: { skipCounter: "select locations" },
        loyaltyHighlight: ["Skip counter at select locations"],
        itineraryReminder: []
      },
      "Platinum": {
        decisionLogic: { skipCounter: true, guaranteedUpgrade: "one class" },
        loyaltyHighlight: ["Guaranteed one-class upgrade", "Skip counter"],
        itineraryReminder: []
      }
    }
  },
};

// ─── BENEFITS LOOKUP UTILITIES ───────────────────────────────────────────────
// Helper functions to extract decision-relevant benefits for a given traveler
// ─────────────────────────────────────────────────────────────────────────────

const getTierBenefits = (program, tier, db) => {
  if (!db[program] || !db[program].tiers) return null;
  // "Member" is a default placeholder — treat as "None" for benefits lookup
  const lookupTier = (tier === "Member" || !tier) ? "None" : tier;
  return db[program].tiers[lookupTier] || db[program].tiers["None"] || null;
};

const getHotelTierBenefits = (program, tier) => getTierBenefits(program, tier, HOTEL_BENEFITS_DB);
const getAirlineTierBenefits = (program, tier) => getTierBenefits(program, tier, AIRLINE_BENEFITS_DB);
const getCarTierBenefits = (program, tier) => getTierBenefits(program, tier, CAR_BENEFITS_DB);
const getCardBenefits = (cardName) => CARD_BENEFITS_DB[cardName] || null;

// Build decision-logic benefits summary for AI prompt injection
// Only includes marginal, trip-applicable benefits — no annual/metered items
const buildTravelerBenefitsSummary = (profile) => {
  try {
  if (!profile) return "";
  const lines = [];

  // Card decision-logic benefits (multipliers, lounge access, free bags, transfer partners)
  (profile.cards || []).forEach(card => {
    const b = getCardBenefits(card.name);
    if (!b) return;
    const dl = b.decisionLogic || {};
    const parts = [];
    if (b.multipliers) {
      const mults = Object.entries(b.multipliers).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ');
      parts.push(`Earns: ${mults}`);
    }
    if (dl.loungeAccess) parts.push(`Lounge: ${Array.isArray(dl.loungeAccess) ? dl.loungeAccess.join(', ') : dl.loungeAccess}`);
    if (dl.firstCheckedBagFree) parts.push('Free checked bag on this carrier');
    if (dl.fineHotelsResorts) parts.push('Fine Hotels & Resorts benefits when booked via Amex Travel');
    if (dl.noForeignTransactionFee) parts.push('No foreign transaction fee');
    if (dl.primaryCarRentalInsurance) parts.push('Primary car rental insurance');
    if (b.transferPartners?.length) parts.push(`Transfer partners: ${b.transferPartners.slice(0,5).join(', ')}${b.transferPartners.length > 5 ? ' +more' : ''}`);
    if (parts.length) lines.push(`CARD ${card.name}: ${parts.join(' | ')}`);
  });

  // Hotel tier decision-logic benefits (free breakfast, upgrades, late checkout, fee waivers)
  (profile.loyaltyAccounts || []).filter(a => HOTEL_BENEFITS_DB[a.program]).forEach(acct => {
    const b = getHotelTierBenefits(acct.program, acct.tier);
    if (!b) return;
    const dl = b.decisionLogic || {};
    const parts = [];
    if (dl.freeBreakfast) parts.push(`Free breakfast for ${dl.freeBreakfastGuests || 2} daily (guaranteed this stay)`);
    if (dl.suiteUpgrade) parts.push(`Suite upgrade: ${typeof dl.suiteUpgrade === 'string' ? dl.suiteUpgrade : 'based on availability'}`);
    if (dl.roomUpgrade) parts.push(`Room upgrade: ${typeof dl.roomUpgrade === 'string' ? dl.roomUpgrade : 'at checkin'}`);
    if (dl.lateCheckout) parts.push(`Late checkout: ${dl.lateCheckout}`);
    if (dl.loungeAccess || dl.clubLounge || dl.executiveLounge) parts.push('Club/executive lounge access');
    if (dl.resortFeeWaiver) parts.push('Resort/destination fee waiver at many properties');
    if (dl.parkingWaiver) parts.push('Complimentary parking at many properties');
    if (parts.length) lines.push(`HOTEL ${acct.program} ${acct.tier}: ${parts.join(' | ')}`);
  });

  // Airline tier decision-logic benefits (lounge, bag, upgrade eligibility, bonus miles)
  (profile.loyaltyAccounts || []).filter(a => AIRLINE_BENEFITS_DB[a.program]).forEach(acct => {
    const b = getAirlineTierBenefits(acct.program, acct.tier);
    if (!b) return;
    const dl = b.decisionLogic || {};
    const parts = [];
    if (dl.loungeAccess) parts.push(`Lounge: ${typeof dl.loungeAccess === 'string' ? dl.loungeAccess : 'access on day of travel'}`);
    if (dl.upgradeWaitlist) parts.push(`Upgrades: ${typeof dl.upgradeWaitlist === 'string' ? dl.upgradeWaitlist : 'complimentary waitlist'}`);
    if (dl.firstCheckedBagFree) parts.push('Free first checked bag');
    if (dl.bonusMiles) parts.push(`${dl.bonusMiles} bonus miles earned on flights`);
    if (dl.companionFliesFree) parts.push('Companion flies free on this trip');
    if (parts.length) lines.push(`AIRLINE ${acct.program} ${acct.tier}: ${parts.join(' | ')}`);
  });

  // Car rental tier decision-logic benefits
  (profile.loyaltyAccounts || []).filter(a => CAR_BENEFITS_DB[a.program]).forEach(acct => {
    const b = getCarTierBenefits(acct.program, acct.tier);
    if (!b) return;
    const dl = b.decisionLogic || {};
    const parts = [];
    if (dl.skipCounter) parts.push('Skip counter');
    if (dl.guaranteedUpgrade) parts.push(`Guaranteed upgrade: ${dl.guaranteedUpgrade}`);
    if (dl.chooseOwnCar) parts.push('Choose own car from aisle');
    if (parts.length) lines.push(`CAR ${acct.program} ${acct.tier}: ${parts.join(' | ')}`);
  });

  return lines.join('\n');
  } catch(e) { return ""; }
};

// Build itinerary reminders for a given traveler — annual/metered benefits
// Surfaced as soft suggestions ("worth checking on...") not guarantees
const buildItineraryReminders = (profile, option) => {
  try {
    if (!profile || !option) return [];
    const reminders = [];

    // Detect what's actually in this option
    const components = option.components || [];
    const cardFields = components.map(c => (c.card || "").toLowerCase()).join(" ");
    const componentDetails = components.map(c => (c.detail || "").toLowerCase()).join(" ");
    const isInternational = /international|transpacific|transatlantic|overseas|europe|asia|africa|latin america|middle east/i.test(
      (option.headline || "") + (option.whyThis || "") + componentDetails
    );
    const isDomestic = !isInternational;

    // Detect which airline is actually being used in this option
    // Check components, cardStrategy, whyThis, and headline for airline mentions
    const fullOptionText = [
      ...components.map(c => (c.card || "") + " " + (c.detail || "")),
      option.cardStrategy || "",
      option.whyThis || "",
      option.headline || "",
      option.loyaltyHighlight || "",
    ].join(" ").toLowerCase();

    const activeAirlinePrograms = new Set();
    if (fullOptionText.includes("delta")) activeAirlinePrograms.add("Delta SkyMiles");
    if (fullOptionText.includes("alaska") || fullOptionText.includes("sea-anc") || fullOptionText.includes("sea-pdx")) activeAirlinePrograms.add("Alaska Mileage Plan");
    if (fullOptionText.includes("united")) activeAirlinePrograms.add("United MileagePlus");
    if (fullOptionText.includes("american airlines") || fullOptionText.includes("aa flight")) activeAirlinePrograms.add("American AAdvantage");
    if (fullOptionText.includes("southwest")) activeAirlinePrograms.add("Southwest Rapid Rewards");

    // Detect which hotel program is in this option
    const activeHotelPrograms = new Set();
    components.forEach(c => {
      const detail = (c.detail || "").toLowerCase();
      const card = (c.card || "").toLowerCase();
      if (detail.includes("hyatt") || detail.includes("park hyatt") || detail.includes("grand hyatt") || detail.includes("andaz") || detail.includes("thompson") || detail.includes("alila")) activeHotelPrograms.add("World of Hyatt");
      if (detail.includes("marriott") || detail.includes("westin") || detail.includes("sheraton") || detail.includes("st. regis") || detail.includes("ritz") || detail.includes("courtyard") || detail.includes("bonvoy")) activeHotelPrograms.add("Marriott Bonvoy");
      if (detail.includes("hilton") || detail.includes("doubletree") || detail.includes("hampton") || detail.includes("waldorf") || detail.includes("conrad")) activeHotelPrograms.add("Hilton Honors");
      if (detail.includes("ihg") || detail.includes("intercontinental") || detail.includes("kimpton") || detail.includes("holiday inn")) activeHotelPrograms.add("IHG One Rewards");
    });

    // Detect which cards are actually used in this option
    const activeCards = new Set();
    components.forEach(c => {
      if (c.card) {
        (profile.cards || []).forEach(card => {
          if ((c.card || "").toLowerCase().includes(card.name.toLowerCase().split(" ").slice(0,2).join(" ").toLowerCase())) {
            activeCards.add(card.name);
          }
        });
      }
    });

    // Card reminders — only for cards actually used in this option, skip domestic-irrelevant ones
    (profile.cards || []).forEach(card => {
      try {
        const b = getCardBenefits(card.name);
        if (!b?.itineraryReminder?.length) return;
        b.itineraryReminder.forEach(r => {
          const rl = r.toLowerCase();
          // Skip Global Entry reminder for domestic trips
          if (isDomestic && (rl.includes("global entry") || rl.includes("tsa precheck"))) return;
          // Skip companion fare/certificate if this airline isn't in the option
          if (rl.includes("companion") && card.name.includes("Alaska") && !activeAirlinePrograms.has("Alaska Mileage Plan")) return;
          if (rl.includes("companion") && card.name.includes("Delta") && !activeAirlinePrograms.has("Delta SkyMiles")) return;
          if (rl.includes("companion") && card.name.includes("Southwest") && !activeAirlinePrograms.has("Southwest Rapid Rewards")) return;
          // Skip airline-specific credits if that airline isn't in the option
          if (rl.includes("airline") && card.name.includes("Alaska") && !activeAirlinePrograms.has("Alaska Mileage Plan")) return;
          // Only include card if it's used in this option OR has a broadly relevant benefit
          const isCardUsed = activeCards.has(card.name);
          const isBroadBenefit = rl.includes("travel credit") || rl.includes("hotel credit");
          if (!isCardUsed && !isBroadBenefit) return;
          reminders.push(`${card.name}: ${r}`);
        });
      } catch(e) {}
    });

    // Hotel reminders — only for the hotel program in this option
    (profile.loyaltyAccounts || []).filter(a => a && HOTEL_BENEFITS_DB[a.program] && activeHotelPrograms.has(a.program)).forEach(acct => {
      try {
        const b = getHotelTierBenefits(acct.program, acct.tier);
        if (b?.itineraryReminder?.length) {
          b.itineraryReminder.forEach(r => reminders.push(`${acct.program}: ${r}`));
        }
      } catch(e) {}
    });

    // Airline reminders — only for the airline actually in this option
    (profile.loyaltyAccounts || []).filter(a => a && AIRLINE_BENEFITS_DB[a.program] && activeAirlinePrograms.has(a.program)).forEach(acct => {
      try {
        const b = getAirlineTierBenefits(acct.program, acct.tier);
        if (b?.itineraryReminder?.length) {
          b.itineraryReminder.forEach(r => {
            const rl = r.toLowerCase();
            // Skip Global Entry for domestic
            if (isDomestic && (rl.includes("global entry") || rl.includes("tsa"))) return;
            reminders.push(`${acct.program}: ${r}`);
          });
        }
      } catch(e) {}
    });

    return reminders.slice(0, 4); // Max 4 reminders
  } catch(e) {
    return [];
  }
};


// ─── SIGNUP / LEARN MORE LINKS ───────────────────────────────────────────────
// Affiliate or direct links for Consider Adding recommendations
// Update with actual affiliate links when programs are set up
const SIGNUP_LINKS = {
  // Credit cards
  "World of Hyatt Credit Card": "https://creditcards.chase.com/travel-credit-cards/hyatt",
  "Hyatt Credit Card": "https://creditcards.chase.com/travel-credit-cards/hyatt",
  "Marriott Bonvoy Boundless": "https://creditcards.chase.com/travel-credit-cards/marriott-bonvoy/boundless",
  "Delta SkyMiles Reserve": "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-reserve-american-express-card/",
  "Delta SkyMiles Platinum": "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-platinum-american-express-card/",
  "Amex Platinum": "https://www.americanexpress.com/us/credit-cards/card/platinum/",
  "Amex Gold": "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
  "Chase Sapphire Reserve": "https://creditcards.chase.com/travel-credit-cards/sapphire/reserve",
  "Chase Sapphire Preferred": "https://creditcards.chase.com/travel-credit-cards/sapphire/preferred",
  "Capital One Venture X": "https://capital.one/venture-x",
  "BofA Alaska Airlines Visa": "https://www.bankofamerica.com/credit-cards/products/alaska-airlines-visa-credit-card/",
  "United Explorer Card": "https://creditcards.chase.com/travel-credit-cards/united/explorer",
  "Hilton Honors Amex Surpass": "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-american-express-surpass-card/",
  // Loyalty programs (free to join)
  "World of Hyatt": "https://www.hyatt.com/world-of-hyatt/enroll",
  "Marriott Bonvoy": "https://www.marriott.com/loyalty/createAccount/createAccountPage1.mi",
  "Hilton Honors": "https://www.hilton.com/en/hilton-honors/join/",
  "Delta SkyMiles": "https://www.delta.com/us/en/skymiles/overview",
  "Alaska Mileage Plan": "https://www.alaskaair.com/account/create-account",
  "IHG One Rewards": "https://www.ihg.com/rewardsclub/us/en/enrollment/main",
  // Car rental (free to join)
  "National Emerald Club": "https://www.nationalcar.com/en/emerald-club/join.html",
  "Hertz Gold Plus Rewards": "https://www.hertz.com/rentacar/member/index.jsp",
  "Avis Preferred": "https://www.avis.com/en/avispreferred",
};

const getSignupLink = (title) => {
  if (!title) return null;
  // Try exact match first
  if (SIGNUP_LINKS[title]) return SIGNUP_LINKS[title];
  // Try partial match
  const key = Object.keys(SIGNUP_LINKS).find(k =>
    title.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(title.toLowerCase().split(" ").slice(0,2).join(" "))
  );
  return key ? SIGNUP_LINKS[key] : null;
};


// ─── QUALITY SIGNALS DATABASE ─────────────────────────────────────────────────
// Structured quality tier data for properties frequently surfaced in Sojourn queries
// Branches: tier (ultra_luxury/luxury/premium/upper_midscale/select)
//           quality markers: michelin_keys, michelin_stars (restaurant), forbes_stars,
//                            relais_chateaux, tl_gold, cn_hot_list, design_hotels
// Update cadence: annually, aligned with T&L Gold List and Condé Nast Hot List publications
// Last updated: March 2026
// ─────────────────────────────────────────────────────────────────────────────

const QUALITY_SIGNALS_DB = {

  // ── ULTRA LUXURY ─────────────────────────────────────────────────────────────
  "Post Ranch Inn": { tier: "ultra_luxury", michelin_keys: 3, tl_gold: true, cn_hot_list: true, notes: "Big Sur cliffside, adults only, independent" },
  "Ventana Big Sur": { tier: "ultra_luxury", michelin_keys: 3, alila: true, tl_gold: true, notes: "Alila/Hyatt, adults only, Big Sur" },
  "Amanyara": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Turks & Caicos, independent" },
  "Amanjiwo": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Borobudur Indonesia, independent" },
  "Amangiri": { tier: "ultra_luxury", aman: true, tl_gold: true, cn_hot_list: true, notes: "Utah desert, independent" },
  "Aman Tokyo": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Tokyo, independent" },
  "Four Seasons Hualalai": { tier: "ultra_luxury", tl_gold: true, notes: "Big Island Hawaii, independent" },
  "Four Seasons Bora Bora": { tier: "ultra_luxury", tl_gold: true, notes: "French Polynesia, independent" },
  "Four Seasons George V": { tier: "ultra_luxury", forbes_stars: 5, michelin_stars: 2, tl_gold: true, notes: "Paris, independent" },
  "Rosewood Mayakoba": { tier: "ultra_luxury", forbes_stars: 5, tl_gold: true, notes: "Riviera Maya, independent" },
  "Rosewood Turtle Creek": { tier: "ultra_luxury", notes: "Dallas, independent" },
  "Belmond Hotel Cipriani": { tier: "ultra_luxury", tl_gold: true, notes: "Venice, Belmond" },
  "Belmond La Residencia": { tier: "ultra_luxury", tl_gold: true, notes: "Mallorca, Belmond" },
  "Sandy Lane": { tier: "ultra_luxury", tl_gold: true, notes: "Barbados, independent" },
  "Eden Rock St Barths": { tier: "ultra_luxury", tl_gold: true, notes: "St. Barths, independent" },
  "Jade Mountain": { tier: "ultra_luxury", tl_gold: true, notes: "St. Lucia, independent" },
  "Blackberry Farm": { tier: "ultra_luxury", relais_chateaux: true, forbes_stars: 5, tl_gold: true, notes: "Tennessee, independent" },
  "Brush Creek Ranch": { tier: "ultra_luxury", relais_chateaux: true, notes: "Wyoming, independent" },

  // ── LUXURY ───────────────────────────────────────────────────────────────────
  "L'Auberge Carmel": { tier: "luxury", relais_chateaux: true, michelin_stars: 1, notes: "Carmel village, no AC, Aubergine restaurant" },
  "Bernardus Lodge": { tier: "luxury", relais_chateaux: true, notes: "Carmel Valley, wine country feel" },
  "Inn at Little Washington": { tier: "luxury", relais_chateaux: true, michelin_keys: 3, michelin_stars: 3, notes: "Washington VA, Patrick O'Connell" },
  "Blackberry Mountain": { tier: "luxury", relais_chateaux: true, tl_gold: true, notes: "Tennessee, adults only, sister to Blackberry Farm" },
  "Idaho Rocky Mountain Ranch": { tier: "luxury", relais_chateaux: true, notes: "Sawtooth Valley Idaho, historic guest ranch" },
  "Dunton Hot Springs": { tier: "luxury", relais_chateaux: true, notes: "Colorado ghost town resort" },
  "Brush Creek Ranch": { tier: "luxury", relais_chateaux: true, notes: "Saratoga Wyoming" },
  "Auberge du Soleil": { tier: "luxury", forbes_stars: 5, cn_hot_list: true, tl_gold: true, notes: "Napa Valley — NOT Carmel, Auberge Resorts" },
  "Calistoga Ranch": { tier: "luxury", auberge: true, notes: "Napa Valley, Auberge Resorts/Hyatt" },
  "Chileno Bay Resort": { tier: "luxury", auberge: true, notes: "Los Cabos, Auberge Resorts" },
  "Hotel Jerome": { tier: "luxury", auberge: true, tl_gold: true, notes: "Aspen, Auberge Resorts" },
  "Esperanza": { tier: "luxury", auberge: true, notes: "Los Cabos, Auberge Resorts" },
  "Meadowood Napa": { tier: "luxury", relais_chateaux: true, notes: "Napa Valley, Relais & Châteaux" },
  "Trout Point Lodge": { tier: "luxury", relais_chateaux: true, notes: "Nova Scotia, wilderness luxury" },
  "Cheval Blanc St-Barth": { tier: "luxury", tl_gold: true, notes: "St. Barths, LVMH" },
  "Montage Deer Valley": { tier: "luxury", forbes_stars: 5, notes: "Park City Utah, Montage Hotels" },
  "Montage Laguna Beach": { tier: "luxury", forbes_stars: 5, tl_gold: true, notes: "Laguna Beach CA, Montage Hotels" },
  "Montage Healdsburg": { tier: "luxury", forbes_stars: 5, tl_gold: true, cn_hot_list: true, notes: "Sonoma wine country, Montage Hotels" },
  "Carmel Valley Ranch": { tier: "luxury", notes: "Hyatt, Carmel Valley CA" },
  "Travaasa Hana": { tier: "luxury", tl_gold: true, notes: "Maui Road to Hana, independent" },
  "Mauna Kea Beach Hotel": { tier: "luxury", tl_gold: true, notes: "Big Island Hawaii, classic 1965, independent" },
  "Four Seasons Maui at Wailea": { tier: "luxury", tl_gold: true, notes: "Maui Wailea, independent" },
  "Grand Hyatt Kauai": { tier: "luxury", notes: "Poipu Kauai, World of Hyatt" },
  "Park Hyatt Maldives": { tier: "luxury", tl_gold: true, notes: "Maldives, World of Hyatt" },
  "Park Hyatt Sydney": { tier: "luxury", notes: "Sydney Harbour, World of Hyatt" },
  "Park Hyatt Tokyo": { tier: "luxury", tl_gold: true, notes: "Shinjuku Tokyo, World of Hyatt" },
  "Park Hyatt Paris Vendome": { tier: "luxury", notes: "Paris 1st, World of Hyatt" },
  "Andaz Maui at Wailea": { tier: "luxury", cn_hot_list: true, notes: "Maui Wailea, World of Hyatt" },
  "Andaz Mayakoba": { tier: "luxury", notes: "Riviera Maya, World of Hyatt" },
  "Thompson Nashville": { tier: "luxury", cn_hot_list: true, notes: "Nashville, World of Hyatt" },
  "Thompson Washington DC": { tier: "luxury", notes: "Navy Yard DC, World of Hyatt" },
  "Alila Ventana Big Sur": { tier: "ultra_luxury", michelin_keys: 3, notes: "See Ventana Big Sur" },
  "Alila Marea Beach": { tier: "luxury", cn_hot_list: true, notes: "Encinitas CA, World of Hyatt" },
  "Hotel Jackson": { tier: "luxury", notes: "Jackson WY, Autograph Collection/Marriott" },
  "Hotel 43": { tier: "luxury", notes: "Boise ID, Autograph Collection/Marriott" },
  "Shore Lodge": { tier: "luxury", tl_gold: true, notes: "McCall ID, independent, Payette Lake" },
  "Coeur d'Alene Resort": { tier: "luxury", notes: "Lake CDA Idaho, independent, floating golf green" },
  "Kahala Hotel": { tier: "luxury", tl_gold: true, notes: "Honolulu southeast shore, independent, dolphin lagoon" },
  "Turtle Bay Resort": { tier: "premium", notes: "North Shore Oahu, independent surf culture" },
  "Lodge at Whitefish Lake": { tier: "luxury", notes: "Whitefish MT, independent, lakefront" },
  "St. Regis Aspen": { tier: "luxury", notes: "Aspen CO, Marriott Bonvoy" },
  "St. Regis San Francisco": { tier: "luxury", notes: "SF Union Square, Marriott Bonvoy" },
  "St. Regis Washington DC": { tier: "luxury", notes: "K Street DC, Marriott Bonvoy" },
  "St. Regis New York": { tier: "luxury", notes: "Midtown NYC, Marriott Bonvoy" },
  "Ritz-Carlton Georgetown": { tier: "luxury", notes: "Washington DC, Marriott Bonvoy" },
  "Ritz-Carlton Half Moon Bay": { tier: "luxury", notes: "CA coast, Marriott Bonvoy" },
  "Ritz-Carlton Kapalua": { tier: "luxury", notes: "Maui, Marriott Bonvoy" },
  "Waldorf Astoria Beverly Hills": { tier: "luxury", forbes_stars: 5, notes: "Beverly Hills, Hilton Honors" },
  "Waldorf Astoria Chicago": { tier: "luxury", notes: "Gold Coast Chicago, Hilton Honors" },
  "Conrad New York Downtown": { tier: "luxury", notes: "Battery Park NYC, Hilton Honors" },
  "Intercontinental Mark Hopkins": { tier: "luxury", notes: "Nob Hill SF, IHG" },
  "Intercontinental Chicago": { tier: "luxury", notes: "Magnificent Mile, IHG" },
  "Kimpton Cottonwood": { tier: "premium", cn_hot_list: true, notes: "Boise ID, IHG/Kimpton" },

  // ── PREMIUM BRANDED ───────────────────────────────────────────────────────────
  "Grand Hyatt Washington": { tier: "premium", notes: "Downtown DC, World of Hyatt" },
  "Hyatt Regency Maui": { tier: "premium", notes: "Ka'anapali Maui, World of Hyatt" },
  "Hyatt Regency Kauai": { tier: "premium", notes: "Poipu Kauai, World of Hyatt" },
  "Hyatt Regency Jeju": { tier: "premium", notes: "Jeju Island Korea, World of Hyatt" },
  "Park Hyatt Washington": { tier: "luxury", notes: "West End DC, Blue Duck Tavern, World of Hyatt" },
  "Marriott Marquis San Francisco": { tier: "premium", notes: "Union Square SF, Marriott Bonvoy" },
  "Marriott Waterfront Seattle": { tier: "premium", notes: "Pike Place area, Marriott Bonvoy" },
  "JW Marriott Austin": { tier: "premium", notes: "Downtown Austin, Marriott Bonvoy" },
  "Omni Barton Creek": { tier: "premium", notes: "Austin TX, independent, Hill Country" },
  "Omni Amelia Island": { tier: "premium", notes: "Amelia Island FL, independent" },

  // ── MICHELIN KEYS — US PROPERTIES (2024 Guide) ────────────────────────────
  "Twin Farms": { tier: "ultra_luxury", forbes_stars: 5, michelin_keys: 3, relais_chateaux: true, notes: "Barnard VT, all-inclusive, one of New England's finest" },
  "The Barn at Blackberry Farm": { tier: "ultra_luxury", michelin_keys: 3, notes: "Walland TN, modern sibling to Blackberry Farm" },
  "The Lodge at Blue Sky": { tier: "ultra_luxury", forbes_stars: 5, michelin_keys: 3, notes: "Wanship UT, Auberge Resorts, near Park City" },
  "San Ysidro Ranch": { tier: "ultra_luxury", michelin_keys: 2, relais_chateaux: true, notes: "Montecito CA, Kennedys honeymooned here, independent" },
  "Rosewood Miramar Beach": { tier: "ultra_luxury", michelin_keys: 2, notes: "Montecito CA, Rosewood Hotels" },
  "The Broadmoor": { tier: "luxury", michelin_keys: 2, forbes_stars: 5, notes: "Colorado Springs CO, historic resort, independent" },
  "Auberge du Soleil": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, tl_gold: true, notes: "Rutherford CA, Napa Valley, Auberge Resorts" },
  "Meadowood Napa Valley": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, relais_chateaux: true, notes: "St. Helena CA, independent, rebuilt after fire" },
  "The Carlyle": { tier: "luxury", michelin_keys: 2, notes: "Upper East Side NYC, Rosewood Hotels" },
  "The Mark": { tier: "luxury", michelin_keys: 2, notes: "Upper East Side NYC, independent" },
  "Four Seasons Hotel New York Downtown": { tier: "luxury", michelin_keys: 2, notes: "Tribeca NYC" },
  "Rosewood Washington DC": { tier: "luxury", michelin_keys: 2, notes: "Georgetown DC, Rosewood Hotels" },
  "The Hay-Adams": { tier: "luxury", michelin_keys: 2, notes: "Lafayette Square DC, White House views, independent" },
  "Salamander DC": { tier: "luxury", michelin_keys: 2, notes: "Capitol Hill DC, independent" },
  "The Langham Chicago": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, notes: "River North Chicago, Langham Hotels" },
  "Hotel Bel-Air": { tier: "ultra_luxury", michelin_keys: 2, notes: "Bel Air CA, Dorchester Collection" },
  "Shutters on the Beach": { tier: "luxury", michelin_keys: 2, notes: "Santa Monica CA, independent" },
  "The Beverly Hills Hotel": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, notes: "Beverly Hills CA, Dorchester Collection, Polo Lounge" },
  "Ojai Valley Inn": { tier: "luxury", michelin_keys: 2, notes: "Ojai CA, independent" },
  "Four Seasons Resort The Biltmore Santa Barbara": { tier: "luxury", michelin_keys: 2, notes: "Santa Barbara CA" },
  "Montage Healdsburg": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, cn_hot_list: true, notes: "Healdsburg CA, Montage Hotels" },
  "Solage Calistoga": { tier: "luxury", michelin_keys: 2, notes: "Calistoga CA, Auberge Resorts" },
  "Bardessono": { tier: "luxury", michelin_keys: 2, notes: "Yountville CA, independent, LEED Platinum" },
  "The Inn at Dos Brisas": { tier: "ultra_luxury", michelin_keys: 2, relais_chateaux: true, notes: "Washington TX, independent" },
  "The Lodge at Pebble Beach": { tier: "ultra_luxury", michelin_keys: 1, tl_gold: true, notes: "Pebble Beach CA, 18th hole views, independent" },
  "Inn Above Tide": { tier: "luxury", michelin_keys: 1, notes: "Sausalito CA, over the water, independent" },
  "Cavallo Point": { tier: "luxury", michelin_keys: 1, notes: "Sausalito CA, Golden Gate views, Aramark" },
  "The Allison Inn & Spa": { tier: "luxury", michelin_keys: 1, relais_chateaux: true, notes: "Newberg OR, Willamette Valley wine country" },
  "The Wauwinet": { tier: "luxury", michelin_keys: 1, relais_chateaux: true, notes: "Nantucket MA, independent" },
  "Ocean House": { tier: "ultra_luxury", michelin_keys: 1, relais_chateaux: true, forbes_stars: 5, notes: "Watch Hill RI, independent" },
  "Chatham Bars Inn": { tier: "luxury", forbes_stars: 5, michelin_keys: 1, notes: "Chatham MA, Cape Cod, independent" },
  "The Greenbrier": { tier: "luxury", michelin_keys: 1, notes: "White Sulphur Springs WV, historic resort" },
  "The Breakers Palm Beach": { tier: "ultra_luxury", michelin_keys: 1, forbes_stars: 5, notes: "Palm Beach FL, independent, historic 1896" },
  "Acqualina Resort": { tier: "ultra_luxury", michelin_keys: 1, forbes_stars: 5, notes: "Sunny Isles Beach FL, independent" },
  "The Setai Miami Beach": { tier: "ultra_luxury", forbes_stars: 5, michelin_keys: 1, notes: "South Beach FL, independent" },
  "The Biltmore Coral Gables": { tier: "luxury", michelin_keys: 1, notes: "Coral Gables FL, independent, historic 1926" },
  "Four Seasons Resort Orlando": { tier: "luxury", michelin_keys: 1, notes: "Walt Disney World Orlando FL" },
  "Carneros Resort and Spa": { tier: "luxury", michelin_keys: 1, notes: "Napa CA, independent" },
  "Hotel Drisco": { tier: "luxury", michelin_keys: 1, notes: "Pacific Heights SF, independent" },
  "Proper Hotel San Francisco": { tier: "luxury", michelin_keys: 1, notes: "Civic Center SF, independent" },
  "Nines Hotel Portland": { tier: "luxury", michelin_keys: 1, notes: "Downtown Portland OR, independent" },
  "Blackberry Mountain": { tier: "luxury", michelin_keys: 1, relais_chateaux: true, notes: "Maryville TN, adults only, sister to Blackberry Farm" },
  "The Henderson Beach Resort": { tier: "luxury", michelin_keys: 1, notes: "Destin FL, independent" },

  // ── PARK HYATT GLOBAL FLAGSHIPS ───────────────────────────────────────────
  "Park Hyatt New York": { tier: "ultra_luxury", forbes_stars: 5, notes: "57th Street NYC, World of Hyatt" },
  "Park Hyatt Chicago": { tier: "luxury", notes: "Water Tower Place Chicago, World of Hyatt" },
  "Park Hyatt Los Angeles": { tier: "luxury", notes: "Century City LA, World of Hyatt" },
  "Park Hyatt Aviara": { tier: "luxury", notes: "Carlsbad CA, World of Hyatt" },
  "Park Hyatt Beaver Creek": { tier: "luxury", notes: "Beaver Creek CO ski resort, ski-in/ski-out, World of Hyatt" },
  "Park Hyatt Maui": { tier: "luxury", notes: "Wailea Maui, World of Hyatt" },
  "Park Hyatt Milan": { tier: "ultra_luxury", notes: "Via Tommaso Grossi Milan, World of Hyatt" },
  "Park Hyatt Kyoto": { tier: "ultra_luxury", notes: "Higashiyama Kyoto, World of Hyatt" },
  "Park Hyatt Niseko Hanazono": { tier: "luxury", notes: "Niseko Japan ski, World of Hyatt" },
  "Park Hyatt Vienna": { tier: "luxury", notes: "Am Hof Vienna, World of Hyatt" },
  "Park Hyatt Zurich": { tier: "luxury", notes: "Zurich, World of Hyatt" },
  "Park Hyatt Auckland": { tier: "luxury", notes: "Viaduct Harbour Auckland, World of Hyatt" },
  "Park Hyatt Buenos Aires": { tier: "luxury", notes: "Palermo Buenos Aires, World of Hyatt" },
  "Park Hyatt Mendoza": { tier: "luxury", notes: "Mendoza wine country Argentina, World of Hyatt" },
  "Park Hyatt Dubai": { tier: "luxury", notes: "Dubai Creek, World of Hyatt" },
  "Park Hyatt Abu Dhabi": { tier: "luxury", notes: "Saadiyat Island Abu Dhabi, World of Hyatt" },
  "Park Hyatt Zanzibar": { tier: "luxury", notes: "Stone Town Zanzibar, World of Hyatt" },
  "Park Hyatt Siem Reap": { tier: "luxury", notes: "Siem Reap Cambodia, Angkor Wat base, World of Hyatt" },
  "Park Hyatt Maldives Hadahaa": { tier: "ultra_luxury", notes: "Maldives, World of Hyatt" },

  // ── RITZ-CARLTON US FLAGSHIPS ──────────────────────────────────────────────
  "The Ritz-Carlton New York Central Park": { tier: "ultra_luxury", forbes_stars: 5, notes: "Central Park South NYC, Marriott Bonvoy" },
  "The Ritz-Carlton New York NoMad": { tier: "luxury", notes: "NoMad NYC, Marriott Bonvoy" },
  "The Ritz-Carlton Georgetown": { tier: "luxury", notes: "Georgetown DC, Marriott Bonvoy" },
  "The Ritz-Carlton Chicago": { tier: "luxury", notes: "Michigan Ave Chicago, Marriott Bonvoy" },
  "The Ritz-Carlton Los Angeles": { tier: "luxury", notes: "Downtown LA, Marriott Bonvoy" },
  "The Ritz-Carlton Laguna Niguel": { tier: "luxury", notes: "Dana Point CA, clifftop ocean views, Marriott Bonvoy" },
  "The Ritz-Carlton Bachelor Gulch": { tier: "luxury", notes: "Beaver Creek CO, ski-in/ski-out, Marriott Bonvoy" },
  "The Ritz-Carlton Denver": { tier: "luxury", notes: "Downtown Denver, Marriott Bonvoy" },
  "The Ritz-Carlton Dallas": { tier: "luxury", notes: "Uptown Dallas, Marriott Bonvoy" },
  "The Ritz-Carlton Houston": { tier: "luxury", notes: "River Oaks Houston, Marriott Bonvoy" },
  "The Ritz-Carlton Atlanta": { tier: "luxury", notes: "Buckhead Atlanta, Marriott Bonvoy" },
  "The Ritz-Carlton Charlotte": { tier: "luxury", notes: "Uptown Charlotte, Marriott Bonvoy" },
  "The Ritz-Carlton Philadelphia": { tier: "luxury", notes: "Avenue of the Arts Philadelphia, Marriott Bonvoy" },
  "The Ritz-Carlton Boston": { tier: "luxury", notes: "Avery Street Boston, Marriott Bonvoy" },
  "The Ritz-Carlton Naples": { tier: "luxury", forbes_stars: 5, notes: "Naples FL, Marriott Bonvoy" },
  "The Ritz-Carlton Amelia Island": { tier: "luxury", notes: "Amelia Island FL, Marriott Bonvoy" },
  "The Ritz-Carlton South Beach": { tier: "luxury", notes: "South Beach FL, Marriott Bonvoy" },
  "The Ritz-Carlton Sarasota": { tier: "luxury", notes: "Downtown Sarasota FL, Marriott Bonvoy" },
  "The Ritz-Carlton Kapalua": { tier: "luxury", notes: "Kapalua Maui, Marriott Bonvoy" },
  "The Ritz-Carlton Key Biscayne": { tier: "luxury", notes: "Key Biscayne FL, Marriott Bonvoy" },
  "The Ritz-Carlton Cancun": { tier: "luxury", notes: "Hotel Zone Cancun, Marriott Bonvoy" },

  // ── ST. REGIS GLOBAL FLAGSHIPS ────────────────────────────────────────────
  "The St. Regis New York": { tier: "ultra_luxury", forbes_stars: 5, notes: "55th and Fifth NYC, Marriott Bonvoy, birthplace of the Bloody Mary" },
  "The St. Regis Chicago": { tier: "ultra_luxury", notes: "Lakeshore Drive Chicago, Marriott Bonvoy" },
  "The St. Regis Aspen Resort": { tier: "luxury", forbes_stars: 5, notes: "Aspen CO, Marriott Bonvoy" },
  "The St. Regis Deer Valley": { tier: "luxury", notes: "Park City UT, Deer Valley ski-in/ski-out, Marriott Bonvoy" },
  "The St. Regis Atlanta": { tier: "luxury", forbes_stars: 5, notes: "Buckhead Atlanta, Marriott Bonvoy" },
  "The St. Regis Houston": { tier: "luxury", notes: "River Oaks Houston, Marriott Bonvoy" },
  "The St. Regis Bal Harbour Resort": { tier: "ultra_luxury", forbes_stars: 5, notes: "Bal Harbour FL, Marriott Bonvoy" },
  "The St. Regis Punta Mita Resort": { tier: "ultra_luxury", notes: "Nayarit Mexico, Marriott Bonvoy" },
  "The St. Regis Los Cabos at Quivira": { tier: "luxury", notes: "Los Cabos Mexico, Marriott Bonvoy" },
  "The St. Regis Kanai Resort": { tier: "ultra_luxury", notes: "Riviera Maya Mexico, Marriott Bonvoy" },
  "The St. Regis Maldives Vommuli Resort": { tier: "ultra_luxury", notes: "Maldives, Marriott Bonvoy" },
  "The St. Regis Florence": { tier: "ultra_luxury", notes: "Florence Italy, Marriott Bonvoy" },
  "The St. Regis Rome": { tier: "ultra_luxury", notes: "Via Vittorio Veneto Rome, Marriott Bonvoy" },
  "The St. Regis Venice": { tier: "ultra_luxury", notes: "Grand Canal Venice, Marriott Bonvoy" },
  "The St. Regis Paris": { tier: "ultra_luxury", notes: "Place Vendome Paris, Marriott Bonvoy" },
  "The St. Regis London": { tier: "luxury", notes: "Mayfair London, Marriott Bonvoy" },
  "The St. Regis Singapore": { tier: "luxury", notes: "Tanglin Singapore, Marriott Bonvoy" },
  "The St. Regis Bangkok": { tier: "luxury", notes: "Rajadamri Bangkok, Marriott Bonvoy" },
  "The St. Regis Bora Bora Resort": { tier: "ultra_luxury", notes: "Bora Bora French Polynesia, Marriott Bonvoy" },
  "The St. Regis Dubai The Palm": { tier: "ultra_luxury", notes: "Palm Jumeirah Dubai, Marriott Bonvoy" },

  // ── EDITION HOTELS ─────────────────────────────────────────────────────────
  "The Times Square EDITION": { tier: "luxury", notes: "Midtown NYC, Ian Schrager/Marriott Bonvoy" },
  "The West Hollywood EDITION": { tier: "luxury", notes: "West Hollywood CA, Ian Schrager/Marriott Bonvoy" },
  "The Los Angeles EDITION": { tier: "luxury", notes: "Downtown LA, Ian Schrager/Marriott Bonvoy" },
  "The Chicago EDITION": { tier: "luxury", notes: "Dearborn Street Chicago, Ian Schrager/Marriott Bonvoy" },
  "The Miami Beach EDITION": { tier: "luxury", notes: "Miami Beach FL, Ian Schrager/Marriott Bonvoy" },
  "The Nashville EDITION": { tier: "luxury", notes: "SoBro Nashville, Marriott Bonvoy" },
  "The Barcelona EDITION": { tier: "luxury", notes: "Passeig de Gracia Barcelona, Marriott Bonvoy" },
  "The London EDITION": { tier: "luxury", notes: "Fitzrovia London, Marriott Bonvoy" },
  "The Tokyo EDITION Toranomon": { tier: "luxury", notes: "Toranomon Tokyo, Marriott Bonvoy" },
  "The Reykjavik EDITION": { tier: "luxury", notes: "Harbour Reykjavik Iceland, Marriott Bonvoy" },
  "The Bali EDITION": { tier: "luxury", notes: "Seminyak Bali, Marriott Bonvoy" },
  "The Singapore EDITION": { tier: "luxury", notes: "Marina Bay Singapore, Marriott Bonvoy" },

  // ── WALDORF ASTORIA ────────────────────────────────────────────────────────
  "Waldorf Astoria New York": { tier: "ultra_luxury", notes: "Park Avenue NYC, historic 1931, under renovation — verify reopening date, Hilton Honors" },
  "Waldorf Astoria Beverly Hills": { tier: "ultra_luxury", forbes_stars: 5, notes: "Beverly Hills CA, Hilton Honors" },
  "Waldorf Astoria Washington DC": { tier: "luxury", notes: "Pennsylvania Avenue DC, historic Old Post Office building, Hilton Honors" },
  "Waldorf Astoria Atlanta Buckhead": { tier: "luxury", notes: "Buckhead Atlanta, Hilton Honors" },
  "Waldorf Astoria Las Vegas": { tier: "luxury", notes: "CityCenter Las Vegas, Hilton Honors" },
  "Waldorf Astoria Monarch Beach Resort": { tier: "luxury", notes: "Dana Point CA, Hilton Honors" },
  "Waldorf Astoria Park City": { tier: "luxury", notes: "Park City UT, Hilton Honors" },
  "Waldorf Astoria Los Cabos Pedregal": { tier: "ultra_luxury", notes: "Cabo San Lucas Mexico, Hilton Honors" },
  "Waldorf Astoria Maldives Ithaafushi": { tier: "ultra_luxury", notes: "Maldives, Hilton Honors" },
  "Waldorf Astoria Dubai Palm Jumeirah": { tier: "ultra_luxury", notes: "Palm Jumeirah Dubai, Hilton Honors" },
  "Waldorf Astoria Edinburgh": { tier: "ultra_luxury", notes: "The Caledonian Edinburgh, Hilton Honors" },
  "Waldorf Astoria Amsterdam": { tier: "ultra_luxury", notes: "Herengracht Amsterdam, Hilton Honors" },
  "Waldorf Astoria Rome Cavalieri": { tier: "ultra_luxury", notes: "Monte Mario Rome, panoramic views, Hilton Honors" },
  "Waldorf Astoria Versailles Trianon Palace": { tier: "ultra_luxury", notes: "Versailles France, palace gardens, Hilton Honors" },
  "Waldorf Astoria Bangkok": { tier: "luxury", notes: "Ratchadamri Bangkok, Hilton Honors" },
  "Waldorf Astoria Jerusalem": { tier: "luxury", notes: "King David Street Jerusalem, Hilton Honors" },

  // ── CONRAD HOTELS ──────────────────────────────────────────────────────────
  "Conrad New York Downtown": { tier: "luxury", notes: "Battery Park NYC, Hilton Honors" },
  "Conrad New York Midtown": { tier: "luxury", notes: "Midtown NYC, Hilton Honors" },
  "Conrad Washington DC": { tier: "luxury", notes: "City Center DC, Hilton Honors" },
  "Conrad Chicago": { tier: "luxury", notes: "Magnificent Mile Chicago, Hilton Honors" },
  "Conrad Los Angeles": { tier: "luxury", notes: "The Grand LA, Frank Gehry building, Hilton Honors" },
  "Conrad Miami": { tier: "luxury", notes: "Brickell Miami, Hilton Honors" },
  "Conrad Fort Lauderdale Beach": { tier: "luxury", notes: "Fort Lauderdale FL, Hilton Honors" },
  "Conrad Dublin": { tier: "luxury", notes: "Earlsfort Terrace Dublin, Hilton Honors" },
  "Conrad London St. James": { tier: "luxury", notes: "St. James London, Hilton Honors" },
  "Conrad Singapore Orchard": { tier: "luxury", notes: "Orchard Road Singapore, Hilton Honors" },
  "Conrad Tokyo": { tier: "luxury", notes: "Shiodome Tokyo, Hilton Honors" },
  "Conrad Seoul": { tier: "luxury", notes: "Yeouido Seoul, Hilton Honors" },
  "Conrad Maldives Rangali Island": { tier: "ultra_luxury", notes: "South Ari Atoll Maldives, underwater restaurant, Hilton Honors" },
  "Conrad Bora Bora Nui": { tier: "ultra_luxury", notes: "Bora Bora French Polynesia, Hilton Honors" },
  "Conrad Tulum Riviera Maya": { tier: "luxury", notes: "Tulum Mexico, Hilton Honors" },
  "Conrad Punta de Mita": { tier: "luxury", notes: "Nayarit Mexico, Hilton Honors" },
  "Conrad Abu Dhabi Etihad Towers": { tier: "luxury", notes: "Abu Dhabi UAE, Hilton Honors" },

  // ── FOUR SEASONS GLOBAL FLAGSHIPS ─────────────────────────────────────────
  "Four Seasons Hotel New York": { tier: "ultra_luxury", forbes_stars: 5, notes: "57th Street NYC, independent" },
  "Four Seasons Hotel Boston": { tier: "luxury", notes: "Back Bay Boston, independent" },
  "Four Seasons Hotel Washington DC": { tier: "luxury", forbes_stars: 5, notes: "Georgetown DC, independent" },
  "Four Seasons Hotel Chicago": { tier: "luxury", michelin_keys: 2, notes: "Magnificent Mile Chicago, independent" },
  "Four Seasons Hotel Los Angeles": { tier: "luxury", notes: "Beverly Hills CA, independent" },
  "Four Seasons Resort Scottsdale at Troon North": { tier: "luxury", notes: "Scottsdale AZ, independent" },
  "Four Seasons Hotel Austin": { tier: "luxury", notes: "Lady Bird Lake Austin TX, independent" },
  "Four Seasons Hotel Houston": { tier: "luxury", notes: "Downtown Houston TX, independent" },
  "Four Seasons Hotel Atlanta": { tier: "luxury", notes: "Midtown Atlanta, independent" },
  "Four Seasons Hotel Miami": { tier: "luxury", michelin_keys: 1, notes: "Brickell Miami, independent" },
  "Four Seasons Hotel Las Vegas": { tier: "luxury", notes: "Mandalay Bay Las Vegas, independent" },
  "Four Seasons Hotel Seattle": { tier: "luxury", notes: "First Hill Seattle, independent" },
  "Four Seasons Hotel Napa Valley": { tier: "ultra_luxury", notes: "Calistoga CA, independent" },
  "Four Seasons Resort Jackson Hole": { tier: "ultra_luxury", notes: "Teton Village WY, ski-in/ski-out, Teton views, independent" },
  "Four Seasons Resort Vail": { tier: "ultra_luxury", notes: "Vail CO, ski-in/ski-out, independent" },
  "Four Seasons Resort and Residences Aspen": { tier: "ultra_luxury", notes: "Aspen CO, ski-in/ski-out, independent" },
  "Four Seasons Resort Whistler": { tier: "luxury", notes: "Whistler Village BC, independent" },
  "Four Seasons Resort Lanai": { tier: "ultra_luxury", notes: "Lanai Hawaii, independent" },
  "Four Seasons Resort Oahu at Ko Olina": { tier: "luxury", notes: "Ko Olina Oahu, independent" },
  "Four Seasons Resort Maui at Wailea": { tier: "ultra_luxury", forbes_stars: 5, notes: "Wailea Maui, independent" },
  "Four Seasons Resort Hualalai": { tier: "ultra_luxury", forbes_stars: 5, notes: "Kohala Coast Big Island, independent" },
  "Four Seasons Resort Bora Bora": { tier: "ultra_luxury", forbes_stars: 5, notes: "Bora Bora French Polynesia, independent" },
  "Four Seasons Hotel Tokyo at Marunouchi": { tier: "ultra_luxury", notes: "Marunouchi Tokyo, independent" },
  "Four Seasons Hotel Tokyo at Otemachi": { tier: "ultra_luxury", notes: "Otemachi Tokyo, independent" },
  "Four Seasons Hotel Kyoto": { tier: "ultra_luxury", notes: "Higashiyama Kyoto, independent" },
  "Four Seasons Hotel Seoul": { tier: "luxury", notes: "Gwanghwamun Seoul, independent" },
  "Four Seasons Hotel Singapore": { tier: "luxury", notes: "Orchard Road Singapore, independent" },
  "Four Seasons Hotel Bangkok": { tier: "ultra_luxury", notes: "Chao Phraya River Bangkok, independent" },
  "Four Seasons Resort Chiang Mai": { tier: "ultra_luxury", tl_gold: true, notes: "Mae Rim Valley Chiang Mai, independent" },
  "Four Seasons Hotel Hong Kong": { tier: "ultra_luxury", notes: "Central Hong Kong, independent" },
  "Four Seasons Hotel Sydney": { tier: "luxury", notes: "The Rocks Sydney, independent" },
  "Four Seasons Hotel London": { tier: "ultra_luxury", notes: "Park Lane London, independent" },
  "Four Seasons Hotel Paris": { tier: "ultra_luxury", michelin_stars: 2, notes: "George V Paris, Michelin 2-star restaurant, independent" },
  "Four Seasons Hotel Madrid": { tier: "ultra_luxury", notes: "Canalejas Madrid, independent" },
  "Four Seasons Hotel Milano": { tier: "ultra_luxury", notes: "Via Gesu Milan, independent" },
  "Four Seasons Hotel Florence": { tier: "ultra_luxury", notes: "Borgo Pinti Florence, garden palazzo, independent" },
  "Four Seasons Hotel Ritz Lisbon": { tier: "ultra_luxury", notes: "Rua Rodrigo da Fonseca Lisbon, independent" },
  "Four Seasons Hotel Gresham Palace Budapest": { tier: "ultra_luxury", notes: "Chain Bridge Budapest, Art Nouveau, independent" },
  "Four Seasons Safari Lodge Serengeti": { tier: "ultra_luxury", notes: "Serengeti Tanzania, independent" },
  "Four Seasons Resort Seychelles": { tier: "ultra_luxury", notes: "Mahe Seychelles, independent" },
  "Four Seasons Resort Maldives at Landaa Giraavaru": { tier: "ultra_luxury", tl_gold: true, notes: "Baa Atoll Maldives, independent" },
  "Four Seasons Resort Costa Rica at Peninsula Papagayo": { tier: "ultra_luxury", notes: "Guanacaste Costa Rica, independent" },
  "Four Seasons Resort Punta Mita": { tier: "ultra_luxury", notes: "Nayarit Mexico, independent" },
  "Four Seasons Hotel Mexico City": { tier: "luxury", notes: "Paseo de la Reforma Mexico City, independent" },
  "Four Seasons Resort Los Cabos at Costa Palmas": { tier: "ultra_luxury", notes: "East Cape Baja, independent" },
  "Four Seasons Hotel Buenos Aires": { tier: "luxury", notes: "Recoleta Buenos Aires, independent" },
  "Four Seasons Hotel Toronto": { tier: "luxury", notes: "Yorkville Toronto, independent" },
  "Four Seasons Hotel Vancouver": { tier: "luxury", notes: "Downtown Vancouver BC, independent" },

  // ── PENINSULA HOTELS ──────────────────────────────────────────────────────
  "The Peninsula New York": { tier: "ultra_luxury", forbes_stars: 5, notes: "Fifth Avenue NYC, Peninsula Hotels" },
  "The Peninsula Chicago": { tier: "ultra_luxury", forbes_stars: 5, notes: "Michigan Avenue Chicago, Peninsula Hotels" },
  "The Peninsula Beverly Hills": { tier: "ultra_luxury", forbes_stars: 5, notes: "Beverly Hills CA, Peninsula Hotels" },
  "The Peninsula Hong Kong": { tier: "ultra_luxury", tl_gold: true, notes: "Tsim Sha Tsui Hong Kong, Peninsula Hotels" },
  "The Peninsula Tokyo": { tier: "ultra_luxury", notes: "Marunouchi Tokyo, Peninsula Hotels" },
  "The Peninsula Paris": { tier: "ultra_luxury", notes: "Avenue Kleber Paris, Peninsula Hotels" },
  "The Peninsula London": { tier: "ultra_luxury", notes: "Belgravia London, Peninsula Hotels" },
  "The Peninsula Shanghai": { tier: "ultra_luxury", notes: "The Bund Shanghai, Peninsula Hotels" },
  "The Peninsula Beijing": { tier: "ultra_luxury", notes: "Wangfujing Beijing, Peninsula Hotels" },
  "The Peninsula Bangkok": { tier: "ultra_luxury", notes: "Charoennakorn Bangkok, Peninsula Hotels" },

  // ── MANDARIN ORIENTAL ─────────────────────────────────────────────────────
  "Mandarin Oriental New York": { tier: "ultra_luxury", forbes_stars: 5, notes: "Columbus Circle NYC, Mandarin Oriental" },
  "Mandarin Oriental Boston": { tier: "ultra_luxury", forbes_stars: 5, notes: "Back Bay Boston, Mandarin Oriental" },
  "Mandarin Oriental Washington DC": { tier: "luxury", notes: "Southwest Waterfront DC, Mandarin Oriental" },
  "Mandarin Oriental Chicago": { tier: "luxury", notes: "Michigan Avenue Chicago, Mandarin Oriental" },
  "Mandarin Oriental Las Vegas": { tier: "luxury", notes: "CityCenter Las Vegas, Mandarin Oriental" },
  "Mandarin Oriental Miami": { tier: "luxury", notes: "Brickell Key Miami, Mandarin Oriental" },
  "Mandarin Oriental San Francisco": { tier: "luxury", notes: "Nob Hill SF, Mandarin Oriental" },
  "Mandarin Oriental Hong Kong": { tier: "ultra_luxury", tl_gold: true, notes: "Connaught Road Hong Kong, Mandarin Oriental" },
  "Mandarin Oriental Tokyo": { tier: "ultra_luxury", notes: "Nihonbashi Tokyo, Mandarin Oriental" },
  "Mandarin Oriental Bangkok": { tier: "ultra_luxury", tl_gold: true, notes: "Charoenkrung Bangkok, historic 1876, Mandarin Oriental" },
  "Mandarin Oriental Paris": { tier: "ultra_luxury", notes: "Rue Saint-Honore Paris, Mandarin Oriental" },
  "Mandarin Oriental London": { tier: "ultra_luxury", notes: "Hyde Park Corner London, Mandarin Oriental" },
  "Mandarin Oriental Singapore": { tier: "ultra_luxury", notes: "Marina Bay Singapore, Mandarin Oriental" },

  // ── ROSEWOOD HOTELS ───────────────────────────────────────────────────────
  "Rosewood Turtle Creek": { tier: "ultra_luxury", notes: "Dallas TX, Rosewood Hotels" },
  "Rosewood Sand Hill": { tier: "luxury", forbes_stars: 5, notes: "Menlo Park CA, Rosewood Hotels" },
  "Rosewood Hong Kong": { tier: "ultra_luxury", notes: "Victoria Dockside Hong Kong, Rosewood" },
  "Rosewood Bangkok": { tier: "ultra_luxury", notes: "Ploenchit Bangkok, Rosewood" },
  "Rosewood Phuket": { tier: "luxury", notes: "Phuket Thailand, Rosewood" },
  "Rosewood Phnom Penh": { tier: "luxury", notes: "Phnom Penh Cambodia, Rosewood" },
  "Rosewood Luang Prabang": { tier: "ultra_luxury", notes: "Luang Prabang Laos, Rosewood" },
  "Rosewood London": { tier: "ultra_luxury", notes: "Holborn London, Rosewood" },
  "Rosewood Vienna": { tier: "ultra_luxury", notes: "Palais Henckel Vienna, Rosewood" },
  "Rosewood Castiglion del Bosco": { tier: "ultra_luxury", relais_chateaux: true, notes: "Montalcino Tuscany, Rosewood" },
  "Rosewood Puebla": { tier: "ultra_luxury", notes: "Historic center Puebla Mexico, Rosewood" },
  "Rosewood San Miguel de Allende": { tier: "ultra_luxury", notes: "San Miguel Mexico, Rosewood" },
  "Rosewood Mayakoba": { tier: "ultra_luxury", forbes_stars: 5, notes: "Riviera Maya Mexico, Rosewood" },
  "Rosewood Baha Mar": { tier: "ultra_luxury", notes: "Nassau Bahamas, Rosewood" },

  // ── SIX SENSES ────────────────────────────────────────────────────────────
  "Six Senses Ibiza": { tier: "ultra_luxury", notes: "Ibiza Spain, Six Senses/IHG" },
  "Six Senses Douro Valley": { tier: "ultra_luxury", notes: "Douro Valley Portugal, Six Senses/IHG" },
  "Six Senses Zighy Bay": { tier: "ultra_luxury", notes: "Oman, Six Senses/IHG" },
  "Six Senses Yao Noi": { tier: "ultra_luxury", notes: "Phang Nga Bay Thailand, Six Senses/IHG" },
  "Six Senses Con Dao": { tier: "ultra_luxury", notes: "Con Dao Vietnam, Six Senses/IHG" },
  "Six Senses Fiji": { tier: "ultra_luxury", notes: "Malolo Island Fiji, Six Senses/IHG" },
  "Six Senses Ninh Van Bay": { tier: "ultra_luxury", notes: "Nha Trang Vietnam, Six Senses/IHG" },
  "Six Senses Laamu": { tier: "ultra_luxury", notes: "Laamu Atoll Maldives, Six Senses/IHG" },
  "Six Senses Rome": { tier: "ultra_luxury", notes: "Historic center Rome, Six Senses/IHG" },
  "Six Senses Fort Barwara": { tier: "ultra_luxury", notes: "Rajasthan India, 14th century fort, Six Senses/IHG" },

  // ── AMAN RESORTS (FULL PORTFOLIO) ─────────────────────────────────────────
  "Aman New York": { tier: "ultra_luxury", aman: true, notes: "Crown Building NYC, Aman" },
  "Amangani": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Jackson Hole WY, Aman" },
  "Amangiri": { tier: "ultra_luxury", aman: true, tl_gold: true, michelin_keys: 2, notes: "Canyon Point UT, Utah desert, Aman" },
  "Amangani": { tier: "ultra_luxury", aman: true, notes: "Jackson Hole WY, Aman" },
  "Amanpuri": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Phuket Thailand, original Aman 1988" },
  "Amanbagh": { tier: "ultra_luxury", aman: true, notes: "Rajasthan India, Aman" },
  "Amankila": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Bali Indonesia, East Bali, Aman" },
  "Amanemu": { tier: "ultra_luxury", aman: true, notes: "Ise-Shima Japan, Aman" },
  "Amanjiwo": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Borobudur Indonesia, Aman" },
  "Amansara": { tier: "ultra_luxury", aman: true, notes: "Siem Reap Cambodia, Aman" },
  "Amanpulo": { tier: "ultra_luxury", aman: true, notes: "Palawan Philippines, Aman" },
  "Aman Venice": { tier: "ultra_luxury", aman: true, notes: "Grand Canal Venice, Aman" },
  "Amanfayun": { tier: "ultra_luxury", aman: true, notes: "Hangzhou China, Aman" },
  "Aman Summer Palace": { tier: "ultra_luxury", aman: true, notes: "Beijing, Summer Palace grounds, Aman" },
  "Aman at The Summer Palace": { tier: "ultra_luxury", aman: true, notes: "Beijing, Aman" },
  "Amanyara": { tier: "ultra_luxury", aman: true, tl_gold: true, notes: "Turks and Caicos, Aman" },
  "Amanera": { tier: "ultra_luxury", aman: true, notes: "Playa Grande Dominican Republic, Aman" },
  "Amangalla": { tier: "ultra_luxury", aman: true, notes: "Galle Sri Lanka, historic fort, Aman" },
  "Amanwella": { tier: "ultra_luxury", aman: true, notes: "Tangalle Sri Lanka, Aman" },
  "Amantaka": { tier: "ultra_luxury", aman: true, notes: "Luang Prabang Laos, Aman" },
  "Amanemu": { tier: "ultra_luxury", aman: true, notes: "Ise-Shima Japan, onsen, Aman" },
  "Aman Sveti Stefan": { tier: "ultra_luxury", aman: true, notes: "Montenegro, island village, Aman" },
  "Aman Nai Lert Bangkok": { tier: "ultra_luxury", aman: true, notes: "Bangkok Thailand, heritage property, Aman" },

  // ── NOTABLE INDEPENDENTS NOT PREVIOUSLY LISTED ────────────────────────────
  "The Wickaninnish Inn": { tier: "luxury", relais_chateaux: true, tl_gold: true, notes: "Tofino BC Canada, storm-watching, independent" },
  "Clayoquot Wilderness Resort": { tier: "ultra_luxury", relais_chateaux: true, notes: "Tofino BC Canada, tented wilderness camp, independent" },
  "Nimmo Bay Resort": { tier: "ultra_luxury", notes: "British Columbia wilderness, heli-accessed, independent" },
  "The Brando": { tier: "ultra_luxury", tl_gold: true, notes: "Tetiaroa French Polynesia, Marlon Brando's private island, independent" },
  "North Island": { tier: "ultra_luxury", tl_gold: true, notes: "Seychelles, exclusive-use island, independent" },
  "Fregate Island Private": { tier: "ultra_luxury", notes: "Seychelles, exclusive island, independent" },
  "Singita Kruger National Park": { tier: "ultra_luxury", tl_gold: true, notes: "South Africa safari, Singita" },
  "Singita Grumeti": { tier: "ultra_luxury", tl_gold: true, notes: "Serengeti Tanzania safari, Singita" },
  "andBeyond Phinda Private Game Reserve": { tier: "ultra_luxury", notes: "KwaZulu-Natal South Africa, andBeyond" },
  "andBeyond Ngorongoro Crater Lodge": { tier: "ultra_luxury", tl_gold: true, notes: "Ngorongoro Tanzania, andBeyond" },
  "Explora Patagonia": { tier: "ultra_luxury", notes: "Torres del Paine Chile, independent" },
  "Awasi Patagonia": { tier: "ultra_luxury", relais_chateaux: true, notes: "Torres del Paine Chile, independent" },
  "Kamalame Cay": { tier: "ultra_luxury", notes: "Andros Bahamas, private island, independent" },
  "Round Hill Hotel and Villas": { tier: "luxury", tl_gold: true, notes: "Montego Bay Jamaica, independent" },
  "Half Moon": { tier: "luxury", notes: "Montego Bay Jamaica, independent" },
  "Jumby Bay Island": { tier: "ultra_luxury", tl_gold: true, notes: "Antigua, private island, Oetker Collection" },
  "CuisinArt Golf Resort & Spa": { tier: "luxury", notes: "Anguilla, independent" },
  "Malliouhana": { tier: "luxury", notes: "Anguilla, Auberge Resorts" },
  "Belmond Cap Juluca": { tier: "ultra_luxury", notes: "Anguilla, Belmond" },
  "Petit St. Vincent": { tier: "ultra_luxury", notes: "St. Vincent Grenadines, private island, independent" },
  "Mustique Company": { tier: "ultra_luxury", notes: "Mustique island, private villas, independent" },
  "Ladera Resort": { tier: "luxury", notes: "St. Lucia, open-wall suites, Jade Mountain adjacent, independent" },
  "Jade Mountain": { tier: "ultra_luxury", tl_gold: true, notes: "St. Lucia, open sanctuaries, Piton views, independent" },
  "Cotton House": { tier: "ultra_luxury", relais_chateaux: true, notes: "Mustique, Relais & Chateaux" },
  "Montpelier Plantation": { tier: "luxury", notes: "Nevis, historic plantation, independent" },
  "Four Seasons Resort Nevis": { tier: "ultra_luxury", notes: "Nevis Caribbean, independent" },
  "Curtain Bluff": { tier: "luxury", notes: "Antigua, all-inclusive, independent" },
  "Hermitage Bay": { tier: "luxury", relais_chateaux: true, notes: "Antigua, Relais & Chateaux" },
  "Caneel Bay Resort": { tier: "luxury", notes: "St. John USVI, historic Rockefeller resort, reopening" },

  // ── CONDÉ NAST TRAVELER GOLD LIST (US) ────────────────────────────────────
  "Hermitage Bay": { tier: "luxury", cn_gold: true, relais_chateaux: true, notes: "Antigua, CN Gold List, all-inclusive boutique" },
  "The Beverly Hills Hotel": { tier: "luxury", forbes_stars: 5, cn_gold: true, notes: "Beverly Hills CA, Dorchester Collection, Polo Lounge" },
  "Sheldon Chalet": { tier: "ultra_luxury", cn_gold: true, notes: "Denali Alaska, private wilderness chalet, helicopter access only, independent" },
  "The Gasparilla Inn & Club": { tier: "luxury", cn_gold: true, michelin_keys: 1, notes: "Boca Grande FL, historic 1913, independent" },
  "Wickaninnish Inn": { tier: "luxury", cn_gold: true, relais_chateaux: true, tl_gold: true, notes: "Tofino BC, storm-watching, independent" },
  "Coral Sands Inn & Cottages": { tier: "luxury", cn_gold: true, notes: "Harbour Island Bahamas, pink sand beach, independent" },
  "Hotel Le Toiny": { tier: "ultra_luxury", cn_gold: true, notes: "St. Barths, private villas, independent" },
  "Kona Village, a Rosewood Resort": { tier: "ultra_luxury", cn_gold: true, notes: "Kohala Coast Big Island, Rosewood, historic reopening" },
  "The Lodge at Primland": { tier: "luxury", cn_gold: true, notes: "Blue Ridge Mountains VA, Auberge Resorts, golf and stargazing" },
  "The Lowell": { tier: "ultra_luxury", cn_gold: true, notes: "Upper East Side NYC, independent" },
  "The Point": { tier: "ultra_luxury", forbes_stars: 5, cn_gold: true, relais_chateaux: true, notes: "Saranac Lake NY, Adirondacks, all-inclusive, independent" },
  "The Inn at Biltmore Estate": { tier: "luxury", cn_gold: true, notes: "Asheville NC, Biltmore Estate grounds, independent" },
  "Mayfair House Hotel & Garden": { tier: "luxury", cn_gold: true, notes: "Coconut Grove Miami FL, independent" },

  // ── TRAVEL + LEISURE WORLD'S BEST (US PROPERTIES) ─────────────────────────
  "Primland Resort": { tier: "luxury", tl_gold: true, notes: "Blue Ridge Mountains VA, Auberge Resorts, same as Lodge at Primland" },
  "The Inn at Mattei's Tavern": { tier: "luxury", tl_gold: true, notes: "Los Olivos CA, Santa Ynez Valley, Auberge Resorts" },
  "The Norumbega": { tier: "luxury", tl_gold: true, notes: "Camden ME, Victorian castle inn, independent" },
  "Quisisana Resort": { tier: "luxury", tl_gold: true, notes: "Capri Italy, no cars, cliff terrace, independent" },
  "Villa Mara Carmel": { tier: "luxury", tl_gold: true, notes: "Carmel CA, boutique villa, independent" },
  "Triple Creek Ranch": { tier: "ultra_luxury", tl_gold: true, relais_chateaux: true, notes: "Darby MT, all-inclusive luxury ranch, Relais & Chateaux" },
  "Montage Kapalua Bay": { tier: "luxury", tl_gold: true, notes: "Kapalua Maui, Montage Hotels" },
  "Fairmont Kea Lani Maui": { tier: "luxury", tl_gold: true, notes: "Wailea Maui, Fairmont/Accor" },
  "The Jefferson Washington DC": { tier: "luxury", tl_gold: true, notes: "16th Street DC, historic 1923, independent" },
  "Wildflower Farms": { tier: "luxury", tl_gold: true, notes: "Gardiner NY, Hudson Valley, Auberge Resorts" },
  "The Dunlin": { tier: "luxury", tl_gold: true, notes: "Jacksonboro SC, Lowcountry, Auberge Resorts" },
  "Madeline Hotel & Residences": { tier: "luxury", tl_gold: true, notes: "Telluride CO, Auberge Resorts" },
  "Wentworth Mansion": { tier: "luxury", tl_gold: true, notes: "Charleston SC, historic 1886 mansion, independent" },
  "Hotel Hartness": { tier: "luxury", tl_gold: true, notes: "Springfield VT, independent" },
  "The Ranch at Laguna Beach": { tier: "luxury", tl_gold: true, notes: "Laguna Beach CA, canyon setting, independent" },

  // ── FORBES 5-STAR — ARIZONA ────────────────────────────────────────────────
  "Arizona Biltmore": { tier: "luxury", notes: "Phoenix AZ, Frank Lloyd Wright influenced, historic 1929, Marriott" },
  "The Global Ambassador": { tier: "luxury", notes: "Phoenix AZ, independent, newer luxury property" },
  "Royal Palms Resort and Spa": { tier: "luxury", notes: "Phoenix AZ, independent, Mediterranean villa style" },
  "Sheraton Grand at Wild Horse Pass": { tier: "luxury", notes: "Chandler AZ, Gila River tribal land, Marriott Bonvoy" },
  "JW Marriott Phoenix Desert Ridge": { tier: "luxury", notes: "Phoenix AZ, Marriott Bonvoy" },
  "The Canyon Suites at the Phoenician": { tier: "ultra_luxury", forbes_stars: 5, notes: "Scottsdale AZ, adults-only enclave within The Phoenician, Marriott" },
  "The Phoenician": { tier: "luxury", notes: "Scottsdale AZ, Camelback Mountain, Luxury Collection/Marriott" },
  "JW Marriott Scottsdale Camelback Inn": { tier: "luxury", notes: "Scottsdale AZ, historic 1936, Marriott Bonvoy" },
  "Ambiente, A Landscape Hotel": { tier: "ultra_luxury", notes: "Jerome AZ, cantilevered suites over Verde Valley, independent" },
  "Enchantment Resort": { tier: "luxury", notes: "Sedona AZ, Boynton Canyon, independent" },
  "Mii amo": { tier: "ultra_luxury", forbes_stars: 5, notes: "Sedona AZ, all-inclusive destination spa within Enchantment, independent" },
  "L'Auberge de Sedona": { tier: "luxury", notes: "Sedona AZ, Oak Creek, independent" },
  "Hacienda del Sol Guest Ranch Resort": { tier: "luxury", notes: "Tucson AZ, historic 1929, independent" },
  "The Ritz-Carlton Dove Mountain": { tier: "luxury", forbes_stars: 5, notes: "Marana AZ near Tucson, Marriott Bonvoy" },

  // ── FORBES 5-STAR — CALIFORNIA (additions to what we have) ────────────────
  "1 Hotel West Hollywood": { tier: "luxury", notes: "West Hollywood CA, SH Hotels" },
  "Beverly Wilshire": { tier: "ultra_luxury", notes: "Beverly Hills CA, Four Seasons, Pretty Woman hotel" },
  "Cameo Beverly Hills": { tier: "luxury", notes: "Beverly Hills CA, LXR Hotels/Hilton" },
  "Downtown LA Proper Hotel": { tier: "luxury", notes: "Downtown LA, independent" },
  "Fairmont Century Plaza": { tier: "luxury", notes: "Century City LA, Fairmont/Accor" },
  "Fairmont Miramar Hotel & Bungalows": { tier: "luxury", notes: "Santa Monica CA, Fairmont/Accor" },
  "Four Seasons Hotel Westlake Village": { tier: "luxury", notes: "Westlake Village CA, independent" },
  "The Georgian": { tier: "luxury", notes: "Santa Monica CA, independent" },
  "L'Ermitage Beverly Hills": { tier: "ultra_luxury", notes: "Beverly Hills CA, independent" },
  "The Maybourne Beverly Hills": { tier: "ultra_luxury", forbes_stars: 5, notes: "Beverly Hills CA, Maybourne Hotel Group" },
  "Oceana Santa Monica": { tier: "luxury", notes: "Santa Monica CA, LXR Hotels/Hilton" },
  "Regent Santa Monica Beach": { tier: "ultra_luxury", notes: "Santa Monica CA, IHG/Regent" },
  "Nobu Ryokan Malibu": { tier: "ultra_luxury", notes: "Malibu CA, Japanese-influenced, independent" },
  "The Langham Huntington Pasadena": { tier: "luxury", notes: "Pasadena CA, Langham Hotels" },
  "Dream Hollywood": { tier: "luxury", notes: "Hollywood CA, Dream Hotels" },
  "SLS Beverly Hills": { tier: "luxury", notes: "Beverly Hills CA, Luxury Collection/Marriott" },
  "Viceroy Santa Monica": { tier: "luxury", notes: "Santa Monica CA, Viceroy Hotels" },
  "W Hollywood": { tier: "luxury", notes: "Hollywood CA, Marriott Bonvoy" },
  "Fairmont Grand Del Mar": { tier: "ultra_luxury", notes: "Del Mar CA near San Diego, Fairmont/Accor" },
  "The Lodge at Torrey Pines": { tier: "luxury", notes: "La Jolla CA, craftsman style, independent" },
  "Pendry San Diego": { tier: "luxury", notes: "Gaslamp Quarter San Diego, Pendry/Marriott" },
  "Rancho Valencia Resort & Spa": { tier: "luxury", forbes_stars: 5, notes: "Rancho Santa Fe CA, independent" },
  "The US Grant": { tier: "luxury", notes: "Downtown San Diego, Luxury Collection/Marriott, historic 1910" },
  "Estancia La Jolla": { tier: "luxury", notes: "La Jolla CA, independent" },
  "Alila Marea Beach Resort Encinitas": { tier: "luxury", notes: "Encinitas CA, World of Hyatt" },
  "Parker Palm Springs": { tier: "luxury", notes: "Palm Springs CA, independent, Gene Autry's former estate" },
  "Kimpton Rowan Palm Springs": { tier: "luxury", notes: "Palm Springs CA, IHG/Kimpton" },
  "The Ritz-Carlton Rancho Mirage": { tier: "luxury", notes: "Rancho Mirage CA, desert canyon views, Marriott Bonvoy" },
  "Montage Laguna Beach": { tier: "luxury", forbes_stars: 5, michelin_keys: 2, tl_gold: true, notes: "Laguna Beach CA, Montage Hotels" },
  "The Resort at Pelican Hill": { tier: "ultra_luxury", forbes_stars: 5, notes: "Newport Coast CA, Italian Renaissance, independent" },
  "Pendry Newport Beach": { tier: "luxury", notes: "Newport Beach CA, Pendry/Marriott" },
  "Balboa Bay Resort": { tier: "luxury", notes: "Newport Beach CA, independent" },
  "Casa del Mar": { tier: "luxury", michelin_keys: 1, notes: "Santa Monica CA, independent" },
  "Casa Palmero at Pebble Beach": { tier: "ultra_luxury", notes: "Pebble Beach CA, intimate cottage hotel, independent" },
  "The Inn at Spanish Bay": { tier: "luxury", notes: "Pebble Beach CA, links golf, independent" },
  "Monterey Plaza Hotel & Spa": { tier: "premium", notes: "Monterey CA, independent" },
  "The Cliffs Hotel and Spa": { tier: "luxury", notes: "Pismo Beach CA, independent" },
  "Alila Napa Valley": { tier: "luxury", notes: "St. Helena CA, World of Hyatt" },
  "Archer Hotel Napa": { tier: "luxury", notes: "Napa CA, independent" },
  "The Meritage Resort and Spa": { tier: "luxury", notes: "Napa CA, Marriott Bonvoy" },
  "Stanly Ranch": { tier: "ultra_luxury", notes: "Napa CA, Auberge Resorts" },
  "Vintage House at The Estate Yountville": { tier: "luxury", notes: "Yountville CA, independent" },
  "Single Thread Farms": { tier: "ultra_luxury", michelin_stars: 3, notes: "Healdsburg CA, inn above the Michelin 3-star restaurant, independent" },
  "MacArthur Place Hotel & Spa": { tier: "luxury", notes: "Sonoma CA, independent" },
  "Farmhouse Inn": { tier: "luxury", michelin_keys: 1, notes: "Forestville CA, Russian River Valley, independent" },
  "The Ritz-Carlton Lake Tahoe": { tier: "luxury", notes: "Truckee CA, ski-in/ski-out, Northstar, Marriott Bonvoy" },
  "Edgewood Tahoe": { tier: "luxury", notes: "Stateline NV, Lake Tahoe, independent" },
  "Chateau du Sureau": { tier: "ultra_luxury", relais_chateaux: true, notes: "Oakhurst CA, near Yosemite, French castle, independent" },


  // ── CONDÉ NAST HOT LIST 2025 (US) ────────────────────────────────────────
  // Freshness signal — new, noteworthy, generating buzz
  "The Beach Club at Boca Raton": { tier: "luxury", cn_hot_list: true, forbes_stars: 5, notes: "Boca Raton FL, Boca Raton Resort, Hilton Honors" },
  "The Dunlin": { tier: "luxury", cn_hot_list: true, tl_gold: true, notes: "Johns Island SC, Lowcountry, Auberge Resorts" },
  "The Henson": { tier: "luxury", cn_hot_list: true, notes: "Hensonville NY, Catskills, independent — new mountain retreat" },
  "The Manner": { tier: "ultra_luxury", cn_hot_list: true, notes: "SoHo NYC, independent — buzzy new luxury boutique" },
  "The Ranch Hudson Valley": { tier: "luxury", cn_hot_list: true, notes: "Sloatsburg NY, Hudson Valley wellness ranch, independent" },
  "The Surrey": { tier: "ultra_luxury", cn_hot_list: true, notes: "Upper East Side NYC, Corinthia Hotels — restored landmark" },

  // ── FORBES 5-STAR ADDITIONS (states beyond AZ/CA) ──────────────────────────
  "Four Seasons Resort and Residences Napa Valley": { tier: "ultra_luxury", forbes_stars: 5, notes: "Calistoga CA, independent" },
  "The Ritz-Carlton Half Moon Bay": { tier: "luxury", forbes_stars: 5, notes: "Half Moon Bay CA, Marriott Bonvoy" },
  "The St. Regis San Francisco": { tier: "luxury", forbes_stars: 5, michelin_keys: 1, notes: "Union Square SF, Marriott Bonvoy" },
  "The Little Nell": { tier: "ultra_luxury", forbes_stars: 5, notes: "Aspen CO, ski-in/ski-out, independent" },
  "Faena Hotel Miami Beach": { tier: "ultra_luxury", forbes_stars: 5, notes: "Miami Beach FL, independent, Alan Faena's theatrical luxury" },
  "The Ritz-Carlton Orlando Grande Lakes": { tier: "luxury", forbes_stars: 5, notes: "Orlando FL, Marriott Bonvoy" },
  "Four Seasons Resort Palm Beach": { tier: "ultra_luxury", forbes_stars: 5, notes: "Palm Beach FL, independent" },
  "The Cloister at Sea Island": { tier: "ultra_luxury", forbes_stars: 5, notes: "Sea Island GA, independent, historic 1928" },
  "The Lodge at Sea Island": { tier: "ultra_luxury", forbes_stars: 5, notes: "Sea Island GA, independent" },
  "ESPACIO The Jewel of Waikiki": { tier: "ultra_luxury", forbes_stars: 5, notes: "Waikiki Oahu, ultra-exclusive 9-suite boutique, independent" },
  "Trump International Hotel Tower Chicago": { tier: "luxury", forbes_stars: 5, notes: "River North Chicago, independent" },
  "Boston Harbor Hotel": { tier: "luxury", forbes_stars: 5, notes: "Rowes Wharf Boston, independent" },
  "Encore Boston Harbor": { tier: "luxury", forbes_stars: 5, notes: "Everett MA, Wynn Resorts" },
  "Four Seasons Hotel 1 Dalton Street Boston": { tier: "luxury", forbes_stars: 5, notes: "Back Bay Boston, independent" },
  "Wequasett Resort": { tier: "luxury", forbes_stars: 5, notes: "Chatham MA, Cape Cod, independent" },
  "Montage Big Sky": { tier: "luxury", forbes_stars: 5, notes: "Big Sky MT, Montage Hotels" },
  "The Ranch at Rock Creek": { tier: "ultra_luxury", forbes_stars: 5, notes: "Philipsburg MT, all-inclusive luxury ranch, independent" },
  "ARIA Sky Suites": { tier: "ultra_luxury", forbes_stars: 5, notes: "CityCenter Las Vegas, MGM Resorts" },
  "Encore Tower Suites": { tier: "ultra_luxury", forbes_stars: 5, notes: "Las Vegas, Wynn Resorts" },
  "Wynn Tower Suites": { tier: "ultra_luxury", forbes_stars: 5, notes: "Las Vegas, Wynn Resorts" },
  "Baccarat Hotel": { tier: "ultra_luxury", forbes_stars: 5, notes: "Midtown NYC, SH Hotels" },
  "Trump International Hotel Tower New York": { tier: "luxury", forbes_stars: 5, notes: "Columbus Circle NYC" },
  "The Umstead Hotel and Spa": { tier: "luxury", forbes_stars: 5, notes: "Cary NC, independent" },
  "The Chateau at Nemacolin": { tier: "luxury", forbes_stars: 5, notes: "Farmington PA, Nemacolin resort, independent" },
  "Falling Rock at Nemacolin": { tier: "luxury", forbes_stars: 5, notes: "Farmington PA, Frank Lloyd Wright-inspired, Nemacolin" },
  "The Chanler at Cliff Walk": { tier: "ultra_luxury", forbes_stars: 5, notes: "Newport RI, Cliff Walk, independent" },
  "Weekapaug Inn": { tier: "luxury", forbes_stars: 5, notes: "Westerly RI, independent" },
  "The Sanctuary at Kiawah Island": { tier: "ultra_luxury", forbes_stars: 5, notes: "Kiawah Island SC, independent" },
  "Montage Palmetto Bluff": { tier: "luxury", forbes_stars: 5, notes: "Bluffton SC, Montage Hotels" },
  "The Post Oak Hotel at Uptown Houston": { tier: "luxury", forbes_stars: 5, notes: "Uptown Houston TX, independent" },
  "Stein Eriksen Lodge Deer Valley": { tier: "luxury", forbes_stars: 5, notes: "Park City UT, ski-in/ski-out, independent" },
  "The Inn at Little Washington": { tier: "ultra_luxury", forbes_stars: 5, michelin_keys: 3, relais_chateaux: true, notes: "Washington VA, Patrick O'Connell" },
  "Salamander Middleburg": { tier: "luxury", forbes_stars: 5, notes: "Middleburg VA, independent, equestrian resort" },


  // ── FORBES 4-STAR — KEY DESTINATION MARKETS ──────────────────────────────
  // Forbes 4-Star = excellent, above average service and facilities
  // Focused on markets in our restaurant/experience database
  // Seattle
  "Four Seasons Hotel Seattle": { tier: "luxury", forbes_stars: 4, notes: "First Hill Seattle, independent" },
  "The Fairmont Olympic Seattle": { tier: "luxury", forbes_stars: 4, notes: "Downtown Seattle, historic 1924, Fairmont/Accor" },
  "Hotel 1000 Seattle": { tier: "luxury", forbes_stars: 4, notes: "Downtown Seattle, independent" },
  "The Charter Hotel Seattle": { tier: "luxury", forbes_stars: 4, notes: "Belltown Seattle, Curio Collection/Hilton" },
  // San Francisco
  "The Ritz-Carlton San Francisco": { tier: "luxury", forbes_stars: 4, notes: "Nob Hill SF, Marriott Bonvoy" },
  "Cavallo Point Lodge": { tier: "luxury", forbes_stars: 4, notes: "Sausalito CA, Golden Gate views, Aramark" },
  "Hotel Nikko San Francisco": { tier: "luxury", forbes_stars: 4, notes: "Union Square SF, independent" },
  "Palace Hotel San Francisco": { tier: "luxury", forbes_stars: 4, notes: "Market Street SF, Luxury Collection/Marriott, historic 1875" },
  "The St. Regis San Francisco": { tier: "luxury", forbes_stars: 5, notes: "Union Square SF, Marriott Bonvoy" },
  // Napa / Wine Country
  "Milliken Creek Inn": { tier: "luxury", forbes_stars: 4, notes: "Napa CA, riverfront, independent" },
  "The Kenwood Inn and Spa": { tier: "luxury", forbes_stars: 4, relais_chateaux: true, notes: "Kenwood CA, Sonoma Valley, independent" },
  "MacArthur Place Hotel & Spa": { tier: "luxury", forbes_stars: 4, notes: "Sonoma CA, independent" },
  // Los Angeles
  "The Jeremy West Hollywood": { tier: "luxury", forbes_stars: 4, notes: "West Hollywood CA, independent" },
  "Kimpton La Peer Hotel": { tier: "luxury", forbes_stars: 4, notes: "West Hollywood CA, IHG/Kimpton" },
  "The Mr. C Beverly Hills": { tier: "luxury", forbes_stars: 4, notes: "Beverly Hills CA, independent" },
  "Shutters on the Beach": { tier: "luxury", forbes_stars: 4, michelin_keys: 2, notes: "Santa Monica CA, independent" },
  "Hotel Bel-Air": { tier: "ultra_luxury", forbes_stars: 4, michelin_keys: 2, notes: "Bel Air CA, Dorchester Collection" },
  // San Diego
  "Estancia La Jolla Hotel & Spa": { tier: "luxury", forbes_stars: 4, notes: "La Jolla CA, independent" },
  "Hotel del Coronado": { tier: "luxury", forbes_stars: 4, notes: "Coronado CA, historic 1888, Curio Collection/Hilton" },
  "Kimpton Solamar Hotel": { tier: "luxury", forbes_stars: 4, notes: "Gaslamp San Diego, IHG/Kimpton" },
  // Palm Springs
  "La Quinta Resort & Club": { tier: "luxury", forbes_stars: 4, notes: "La Quinta CA, Waldorf Astoria/Hilton, historic 1926" },
  "Hyatt Regency Indian Wells": { tier: "premium", forbes_stars: 4, notes: "Indian Wells CA, World of Hyatt" },
  // Phoenix / Scottsdale
  "The Boulders Resort & Spa": { tier: "luxury", forbes_stars: 4, notes: "Carefree AZ, Waldorf Astoria/Hilton" },
  "Andaz Scottsdale Resort": { tier: "luxury", forbes_stars: 4, notes: "Scottsdale AZ, World of Hyatt" },
  "Sanctuary Camelback Mountain": { tier: "luxury", forbes_stars: 4, notes: "Paradise Valley AZ, independent" },
  "Omni Scottsdale Resort at Montelucia": { tier: "luxury", forbes_stars: 4, notes: "Paradise Valley AZ, Omni Hotels" },
  // New York City
  "The NoMad Hotel New York": { tier: "luxury", forbes_stars: 4, michelin_keys: 1, notes: "NoMad NYC, independent" },
  "The Greenwich Hotel": { tier: "luxury", forbes_stars: 4, michelin_keys: 1, notes: "Tribeca NYC, Robert De Niro, independent" },
  "Crosby Street Hotel": { tier: "luxury", forbes_stars: 4, notes: "SoHo NYC, Firmdale Hotels" },
  "The Whitby Hotel": { tier: "luxury", forbes_stars: 4, notes: "Midtown NYC, Firmdale Hotels" },
  "1 Hotel Brooklyn Bridge": { tier: "premium", forbes_stars: 4, michelin_keys: 1, notes: "Brooklyn NY, SH Hotels" },
  "The William Vale": { tier: "luxury", forbes_stars: 4, notes: "Williamsburg Brooklyn, independent" },
  "Wythe Hotel": { tier: "premium", forbes_stars: 4, michelin_keys: 1, notes: "Williamsburg Brooklyn, independent" },
  // Washington DC
  "The Jefferson Washington DC": { tier: "luxury", forbes_stars: 4, tl_gold: true, notes: "16th Street DC, historic 1923, independent" },
  "Kimpton George Hotel": { tier: "luxury", forbes_stars: 4, notes: "Capitol Hill DC, IHG/Kimpton" },
  "Hotel Zena Washington DC": { tier: "luxury", forbes_stars: 4, notes: "Dupont Circle DC, Vignette Collection/IHG" },
  // Chicago
  "Kimpton Gray Hotel": { tier: "luxury", forbes_stars: 4, notes: "Loop Chicago, IHG/Kimpton" },
  "The Godfrey Hotel Chicago": { tier: "luxury", forbes_stars: 4, notes: "River North Chicago, independent" },
  "Loews Chicago Hotel": { tier: "luxury", forbes_stars: 4, notes: "Streeterville Chicago, Loews Hotels" },
  // New Orleans
  "Hotel Monteleone": { tier: "luxury", forbes_stars: 4, notes: "French Quarter New Orleans, historic 1886, independent — revolving Carousel Bar" },
  "The Ace Hotel New Orleans": { tier: "premium", forbes_stars: 4, notes: "Warehouse District, Ace Hotels" },
  "Audubon Cottages": { tier: "luxury", forbes_stars: 4, notes: "French Quarter New Orleans, independent" },
  // Nashville
  "1 Hotel Nashville": { tier: "luxury", forbes_stars: 4, notes: "SoBro Nashville, SH Hotels" },
  "The Joseph Nashville": { tier: "luxury", forbes_stars: 4, notes: "SoBro Nashville, Autograph Collection/Marriott" },
  "Thompson Nashville": { tier: "luxury", forbes_stars: 4, notes: "The Gulch Nashville, World of Hyatt" },
  // Atlanta
  "Kimpton Sylvan Hotel": { tier: "luxury", forbes_stars: 4, notes: "Buckhead Atlanta, IHG/Kimpton" },
  "Hotel Clermont": { tier: "premium", forbes_stars: 4, notes: "Ponce City Market Atlanta, independent" },
  // Miami
  "The Surf Club Four Seasons": { tier: "ultra_luxury", forbes_stars: 5, notes: "Surfside FL, Four Seasons/Thomas Keller restaurant" },
  "Kimpton Surfcomber Hotel": { tier: "luxury", forbes_stars: 4, notes: "South Beach FL, IHG/Kimpton" },
  "Soho Beach House Miami Beach": { tier: "luxury", forbes_stars: 4, notes: "Mid-Beach FL, Soho House" },
  // Hawaii
  "Andaz Maui at Wailea": { tier: "luxury", forbes_stars: 4, cn_hot_list: true, notes: "Wailea Maui, World of Hyatt" },
  "Montage Kapalua Bay": { tier: "luxury", forbes_stars: 4, tl_gold: true, notes: "Kapalua Maui, Montage Hotels" },
  "Fairmont Kea Lani": { tier: "luxury", forbes_stars: 4, tl_gold: true, notes: "Wailea Maui, Fairmont/Accor" },
  "Hyatt Regency Maui Resort": { tier: "premium", forbes_stars: 4, notes: "Ka'anapali Maui, World of Hyatt" },
  "Grand Hyatt Kauai Resort": { tier: "luxury", forbes_stars: 4, notes: "Poipu Kauai, World of Hyatt" },
  "Turtle Bay Resort": { tier: "premium", forbes_stars: 4, notes: "North Shore Oahu, independent" },
  // Mountain / Ski
  "The Little Nell": { tier: "ultra_luxury", forbes_stars: 5, notes: "Aspen CO, ski-in/ski-out, independent" },
  "Hotel Jerome": { tier: "luxury", forbes_stars: 4, notes: "Aspen CO, Auberge Resorts" },
  "The Sky Hotel Aspen": { tier: "luxury", forbes_stars: 4, notes: "Aspen CO, Autograph Collection/Marriott" },
  "Park Hyatt Beaver Creek": { tier: "luxury", forbes_stars: 4, notes: "Beaver Creek CO, ski-in/ski-out, World of Hyatt" },
  "The Sebastian Vail": { tier: "luxury", forbes_stars: 4, notes: "Vail CO, independent" },
  "Sonnenalp Hotel": { tier: "luxury", forbes_stars: 4, notes: "Vail Village CO, independent, Bavarian style" },
  "Goldener Hirsch Inn": { tier: "luxury", forbes_stars: 4, notes: "Deer Valley UT, Auberge Resorts, ski-in/ski-out" },
  "St. Regis Deer Valley": { tier: "luxury", forbes_stars: 4, notes: "Park City UT, Marriott Bonvoy, ski-in/ski-out" },
  "Amangani": { tier: "ultra_luxury", forbes_stars: 4, aman: true, notes: "Jackson Hole WY, Aman, Teton views" },
  "Snake River Lodge & Spa": { tier: "luxury", forbes_stars: 4, notes: "Teton Village WY, Autograph Collection/Marriott" },


  // ── SMALL LUXURY HOTELS OF THE WORLD — US MEMBERS ────────────────────────
  // SLH properties are bookable on World of Hyatt points — directly relevant
  // for Hyatt Globalist members. SLH signal = quality independent boutique.
  "Appellation Healdsburg": { tier: "luxury", slh: true, notes: "Healdsburg CA, Sonoma wine country, independent boutique, Hyatt bookable" },
  "Camden Harbour Inn": { tier: "luxury", slh: true, relais_chateaux: true, notes: "Camden ME, coastal Maine, independent, Hyatt bookable" },
  "Carneros Resort and Spa": { tier: "luxury", slh: true, forbes_stars: 4, notes: "Napa CA, wine country, independent, Hyatt bookable" },
  "Castle Hot Springs": { tier: "luxury", slh: true, notes: "Morristown AZ, Bradshaw Mountains, historic hot springs resort, Hyatt bookable" },
  "HGU New York": { tier: "luxury", slh: true, notes: "Flatiron NYC, boutique independent, Hyatt bookable" },
  "Hotel Belleclaire": { tier: "premium", slh: true, notes: "Upper West Side NYC, historic 1903, independent, Hyatt bookable" },
  "Hotel Lucia": { tier: "luxury", slh: true, notes: "Downtown Portland OR, independent boutique, Hyatt bookable" },
  "Hotel on Rivington": { tier: "luxury", slh: true, notes: "Lower East Side NYC, independent, Hyatt bookable" },
  "L'Auberge de Sedona": { tier: "luxury", slh: true, forbes_stars: 4, notes: "Sedona AZ, Oak Creek, independent, Hyatt bookable" },
  "Lennox Miami Beach": { tier: "luxury", slh: true, notes: "South Beach FL, Art Deco district, independent, Hyatt bookable" },
  "Longfellow Hotel": { tier: "luxury", slh: true, notes: "Portland ME, independent boutique, Hyatt bookable" },
  "Mirror Lake Inn Resort & Spa": { tier: "luxury", slh: true, notes: "Lake Placid NY, Adirondacks, independent, Hyatt bookable" },
  "Rawah Ranch": { tier: "ultra_luxury", slh: true, notes: "Glendevey CO, remote wilderness dude ranch, all-inclusive, Hyatt bookable" },
  "Refinery Hotel New York": { tier: "luxury", slh: true, notes: "Midtown Manhattan NYC, historic 1912 hat factory, independent, Hyatt bookable" },
  "Rusty Parrot Lodge & Spa": { tier: "luxury", slh: true, notes: "Jackson Hole WY, downtown Jackson, independent boutique, Hyatt bookable" },
  "Seal Cove Inn": { tier: "luxury", slh: true, notes: "Moss Beach CA, Half Moon Bay area, coastal boutique, independent, Hyatt bookable" },
  "Sentinel": { tier: "luxury", slh: true, notes: "Portland OR, historic Elks Lodge, independent, Hyatt bookable" },
  "Sitzmark Vail": { tier: "luxury", slh: true, notes: "Vail Village CO, slope-side boutique, independent, Hyatt bookable" },
  "Snowpine Lodge": { tier: "luxury", slh: true, notes: "Alta UT, ski-in/ski-out, independent, Hyatt bookable" },
  "Southbridge Napa Valley": { tier: "luxury", slh: true, notes: "St. Helena CA, Napa wine country, independent boutique, Hyatt bookable" },
  "Stein Eriksen Residences": { tier: "luxury", slh: true, notes: "Deer Valley UT, Park City, independent, Hyatt bookable" },
  "The Battery": { tier: "ultra_luxury", slh: true, notes: "San Francisco CA, members club hotel, Jackson Square, independent, Hyatt bookable" },
  "The Francis": { tier: "luxury", slh: true, notes: "Portland ME, Victorian mansion, independent boutique, Hyatt bookable" },
  "The Frederick Hotel": { tier: "luxury", slh: true, notes: "Milledgeville GA, historic boutique, independent, Hyatt bookable" },
  "The Grady": { tier: "luxury", slh: true, notes: "Charlotte NC, independent boutique, Hyatt bookable" },
  "The Grayson Miami": { tier: "luxury", slh: true, notes: "Coconut Grove Miami FL, independent boutique, Hyatt bookable" },
  "The Inn at Rancho Santa Fe": { tier: "luxury", slh: true, notes: "Rancho Santa Fe CA, historic 1923 ranch estate, independent, Hyatt bookable" },
  "The Iroquois Hotel": { tier: "luxury", slh: true, notes: "Midtown NYC, historic boutique near Bryant Park, independent, Hyatt bookable" },
  "The Lodge at St Edward Park": { tier: "luxury", slh: true, notes: "Kenmore WA near Seattle, historic 1931 seminary, lake views, independent, Hyatt bookable" },
  "The Mansion at Ocean Edge": { tier: "luxury", slh: true, notes: "Brewster MA, Cape Cod, resort and spa, independent, Hyatt bookable" },
  "Pillars Hotel & Club": { tier: "luxury", slh: true, notes: "Fort Lauderdale FL, waterfront boutique, independent, Hyatt bookable" },
  "The Plymouth South Beach": { tier: "luxury", slh: true, notes: "South Beach Miami FL, Art Deco boutique, independent, Hyatt bookable" },
  "The Quoin Hotel": { tier: "luxury", slh: true, notes: "Wilmington DE, historic boutique, independent, Hyatt bookable" },
  "The Roundtree Amagansett": { tier: "luxury", slh: true, notes: "Amagansett NY, Hamptons, independent boutique, Hyatt bookable" },
  "The Stavrand Russian River Valley": { tier: "luxury", slh: true, notes: "Guerneville CA, Sonoma wine country, independent, Hyatt bookable" },
  "Topping Rose House": { tier: "ultra_luxury", slh: true, notes: "Bridgehampton NY, Hamptons, farm-to-table estate, Jean-Georges restaurant, independent, Hyatt bookable" },
  "Wentworth Mansion": { tier: "luxury", slh: true, tl_gold: true, notes: "Charleston SC, historic 1886 Gilded Age mansion, independent, Hyatt bookable" },
  "Planters Inn": { tier: "luxury", relais_chateaux: true, notes: "Historic District Charleston SC, Relais & Chateaux, Peninsula Grill on premises, one of Charleston's most elegant and intimate small hotels — the R&C book on the bedside table is part of the experience" },
  "WestHouse Hotel New York": { tier: "luxury", slh: true, notes: "Midtown NYC, independent boutique, Hyatt bookable" },
  "Winslow's Bungalows": { tier: "luxury", slh: true, notes: "Palm Springs CA, boutique bungalow resort, independent, Hyatt bookable" },
  "Wylder Hotel Windham": { tier: "luxury", slh: true, notes: "Windham NY, Catskills, independent boutique, Hyatt bookable" },
  "Zelda Dearest": { tier: "luxury", slh: true, notes: "Palm Springs CA, intimate boutique, independent, Hyatt bookable" },


  "Casia Lodge & Ranch": { tier: "luxury", slh: true, notes: "Twisp WA, Methow Valley, North Cascades, independent boutique, excellent Nordic skiing and hiking, Hyatt bookable" },
  "Colton House Hotel": { tier: "luxury", slh: true, notes: "Austin TX, independent boutique, Hyatt bookable" },
  "Cougar Ridge Lodge": { tier: "luxury", slh: true, notes: "Torrey UT, near Capitol Reef National Park, independent, Hyatt bookable" },
  "Ella's Cottages": { tier: "luxury", slh: true, notes: "Key West FL, boutique cottage resort, independent, Hyatt bookable" },
  "Historic Rocky Waters Inn": { tier: "luxury", slh: true, notes: "Gatlinburg TN, Great Smoky Mountains, historic inn, independent, Hyatt bookable" },
  "Lighthouse Hotel": { tier: "luxury", slh: true, notes: "Key West FL, boutique independent, Hyatt bookable" },
  "Maison Twenty Seven": { tier: "luxury", slh: true, notes: "Santa Monica CA, boutique independent, Hyatt bookable" },
  "Ridley House": { tier: "luxury", slh: true, notes: "Key West FL, historic boutique, independent, Hyatt bookable" },
  "RiverView Ranch Retreat & Western Adventures": { tier: "luxury", slh: true, notes: "Alberton MT, Clark Fork River, wilderness ranch, independent, Hyatt bookable" },


  // ── FORBES 5-STAR — CANADA ────────────────────────────────────────────────
  "Fairmont Pacific Rim": { tier: "ultra_luxury", forbes_stars: 5, region: "canada", notes: "Coal Harbour Vancouver BC, Fairmont/Accor" },
  "Four Seasons Hotel Toronto": { tier: "luxury", forbes_stars: 5, region: "canada", notes: "Yorkville Toronto ON, independent" },
  "The Hazelton Hotel": { tier: "ultra_luxury", forbes_stars: 5, region: "canada", notes: "Yorkville Toronto ON, independent" },
  "Shangri-La Hotel Toronto": { tier: "luxury", forbes_stars: 5, region: "canada", notes: "Downtown Toronto ON, Shangri-La Hotels" },
  "The St. Regis Toronto": { tier: "luxury", forbes_stars: 5, region: "canada", notes: "Financial District Toronto ON, Marriott Bonvoy" },

  // ── FORBES 5-STAR — CARIBBEAN ─────────────────────────────────────────────
  "Cap Juluca": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "Maundays Bay Anguilla, Belmond" },
  "Four Seasons Resort and Residences Anguilla": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "West End Anguilla, independent" },
  "Sandy Lane Hotel": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "St. James Barbados, independent, legendary West Indies resort" },
  "Dorado Beach, a Ritz-Carlton Reserve": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "Dorado Puerto Rico, Marriott Bonvoy, Ritz-Carlton Reserve" },
  "Cheval Blanc St-Barth": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "St. Barths, LVMH Cheval Blanc" },
  "Eden Rock St Barths": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "St. Barths, independent, iconic clifftop villa hotel" },
  "Mandarin Oriental Canouan": { tier: "ultra_luxury", forbes_stars: 5, region: "caribbean", notes: "Canouan Island St. Vincent and the Grenadines, Mandarin Oriental" },

  // ── FORBES 5-STAR — MEXICO ────────────────────────────────────────────────
  "Nizuc Resort & Spa": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Cancun Mexico, independent, private peninsula" },
  "Chileno Bay Resort & Residences": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Los Cabos Mexico, Auberge Resorts" },
  "Esperanza": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Cabo San Lucas Mexico, Auberge Resorts" },
  "Las Ventanas al Paraiso": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "San Jose del Cabo Mexico, Rosewood Hotels" },
  "Montage Los Cabos": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Cabo San Lucas Mexico, Montage Hotels" },
  "Waldorf Astoria Los Cabos Pedregal": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Cabo San Lucas Mexico, Hilton Honors" },
  "Zadun, a Ritz-Carlton Reserve": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "San Jose del Cabo Mexico, Marriott Bonvoy, Ritz-Carlton Reserve" },
  "One & Only Palmilla": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "San Jose del Cabo Mexico, One&Only Resorts" },
  "Grand Velas Los Cabos": { tier: "luxury", forbes_stars: 5, region: "mexico", notes: "Cabo San Lucas Mexico, Grand Velas Resorts, all-inclusive" },
  "Hotel Esencia": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Xpu-Ha Quintana Roo Mexico, independent boutique, former Duchess of Windsor estate" },
  "La Casa de la Playa": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Playa del Carmen Mexico, independent" },
  "Rosewood Mayakoba": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Riviera Maya Mexico, Rosewood Hotels" },
  "Maroma, A Belmond Hotel": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Riviera Maya Mexico, Belmond" },
  "Four Seasons Resort Punta Mita": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "Nayarit Mexico, independent" },
  "Rosewood San Miguel de Allende": { tier: "ultra_luxury", forbes_stars: 5, region: "mexico", notes: "San Miguel de Allende Mexico, Rosewood Hotels" },

  // ── FORBES 4-STAR — CANADA ────────────────────────────────────────────────
  "Fairmont Gold at Banff Springs": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Banff Alberta, exclusive floor within Fairmont Banff Springs, Fairmont/Accor" },
  "Fairmont Hotel Vancouver": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Downtown Vancouver BC, historic 1939, Fairmont/Accor" },
  "Paradox Hotel Vancouver": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Downtown Vancouver BC, independent" },
  "Rosewood Hotel Georgia": { tier: "ultra_luxury", forbes_stars: 4, region: "canada", notes: "Downtown Vancouver BC, Rosewood Hotels, historic 1927" },
  "Wickaninnish Inn": { tier: "luxury", forbes_stars: 4, cn_gold: true, relais_chateaux: true, tl_gold: true, region: "canada", notes: "Tofino BC Vancouver Island, storm-watching, independent" },
  "Four Seasons Resort and Residences Whistler": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Whistler Village BC, independent" },
  "Muir Halifax": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Halifax Nova Scotia, Luxury Collection/Marriott" },
  "Park Hyatt Toronto": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Yorkville Toronto ON, World of Hyatt" },
  "The Ritz-Carlton Toronto": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Downtown Toronto ON, Marriott Bonvoy" },
  "The Bruce Hotel": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Stratford ON, independent boutique" },
  "Four Seasons Hotel Montreal": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Golden Square Mile Montreal QC, independent" },
  "The Ritz-Carlton Montreal": { tier: "luxury", forbes_stars: 4, region: "canada", notes: "Sherbrooke Street Montreal QC, Marriott Bonvoy, historic 1912" },

  // ── FORBES 4-STAR — CARIBBEAN ─────────────────────────────────────────────
  "Aurora Anguilla Rendezvous Beach": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Rendezvous Bay Anguilla, independent" },
  "Quintessence Hotel Anguilla": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Anguilla, intimate boutique, independent" },
  "Aurora Anguilla Merrywing Beach": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Merrywing Bay Anguilla, independent" },
  "Jumby Bay Island": { tier: "ultra_luxury", forbes_stars: 4, tl_gold: true, region: "caribbean", notes: "Antigua, private island, Oetker Collection" },
  "Rosewood Little Dix Bay": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Virgin Gorda BVI, Rosewood Hotels" },
  "Kimpton Seafire Resort + Spa": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Grand Cayman, IHG/Kimpton" },
  "Palm Heights": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Grand Cayman, independent boutique, design-forward" },
  "The Ritz-Carlton Grand Cayman": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Grand Cayman, Marriott Bonvoy" },
  "Casa de Campo Resort & Villas": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "La Romana Dominican Republic, independent, world-class polo and golf" },
  "Eden Roc Cap Cana": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Punta Cana Dominican Republic, independent" },
  "Tortuga Bay Puntacana Resort & Club": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Punta Cana Dominican Republic, independent, Oscar de la Renta designed villas" },
  "Cayo Levantado Resort": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Samana Dominican Republic, private island" },
  "Half Moon": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Montego Bay Jamaica, Salamander Collection" },
  "Eclipse at Half Moon": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Montego Bay Jamaica, adults-only enclave within Half Moon, Salamander Collection" },
  "Condado Vanderbilt Hotel": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "San Juan Puerto Rico, independent, historic 1919 Beaux Arts" },
  "Rosewood Le Guanahani St. Barth": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Grand Cul-de-sac St. Barths, Rosewood Hotels" },
  "Le Barthelemy Hotel & Spa": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "St. Barths, independent" },
  "Four Seasons Resort Nevis": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Charlestown Nevis, independent" },
  "Park Hyatt St. Kitts Christophe Harbour": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "St. Kitts, World of Hyatt" },
  "Jade Mountain Resort": { tier: "ultra_luxury", forbes_stars: 4, tl_gold: true, region: "caribbean", notes: "Soufriere St. Lucia, open sanctuaries with Piton views, independent" },
  "Ladera Resort": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Soufriere St. Lucia, open-wall suites, Piton views, independent" },
  "La Samanna": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "St. Martin, Belmond" },
  "Silversands Grenada": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Grand Anse Grenada, independent" },
  "Rosewood Baha Mar": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Nassau Bahamas, Rosewood Hotels" },
  "Wymara Resort": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Providenciales Turks and Caicos, independent" },
  "Wymara Villas": { tier: "ultra_luxury", forbes_stars: 4, region: "caribbean", notes: "Providenciales Turks and Caicos, independent" },
  "Seven Stars Resort and Spa": { tier: "luxury", forbes_stars: 4, region: "caribbean", notes: "Providenciales Turks and Caicos, independent" },

  // ── FORBES 4-STAR — MEXICO ────────────────────────────────────────────────
  "Banyan Tree Cabo Marques": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Acapulco Mexico, Banyan Tree Hotels" },
  "Atelier Playa Mujeres": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Isla Mujeres Cancun Mexico, adults-only all-inclusive" },
  "Le Blanc Spa Resort Cancun": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Cancun Mexico, adults-only all-inclusive" },
  "Kempinski Hotel Cancun": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Cancun Mexico, Kempinski Hotels" },
  "Four Seasons Resort Tamarindo": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "La Manzanilla Jalisco Mexico, independent, secluded jungle and beach" },
  "The Cape Los Cabos": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Cabo San Lucas Mexico, Thompson Hotels/Hyatt" },
  "Hilton Los Cabos Beach & Golf Resort": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Los Cabos Mexico, Hilton Honors" },
  "Solaz Los Cabos": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "San Jose del Cabo Mexico, Luxury Collection/Marriott" },
  "Four Seasons Resort Cabo Del Sol": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Cabo San Lucas Mexico, independent" },
  "Grand Velas Boutique Hotel Los Cabos": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Cabo San Lucas Mexico, Grand Velas" },
  "Le Blanc Spa Resort Los Cabos": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "San Jose del Cabo Mexico, adults-only all-inclusive" },
  "Nobu Hotel Los Cabos": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Cabo San Lucas Mexico, Nobu Hotels" },
  "Four Seasons Hotel Mexico City": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Paseo de la Reforma Mexico City, independent" },
  "Las Alcobas Mexico City": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Polanco Mexico City, Luxury Collection/Marriott" },
  "The St. Regis Mexico City": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Paseo de la Reforma Mexico City, Marriott Bonvoy" },
  "The Ritz-Carlton Mexico City": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Santa Fe Mexico City, Marriott Bonvoy" },
  "Casa Velas": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Puerto Vallarta Mexico, adults-only boutique all-inclusive" },
  "Fairmont Mayakoba": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Riviera Maya Mexico, Fairmont/Accor" },
  "Banyan Tree Mayakoba": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Playa del Carmen Mexico, Banyan Tree Hotels" },
  "Grand Velas Riviera Maya": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Riviera Maya Mexico, Grand Velas, all-inclusive" },
  "Hotel Xcaret Arte": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Playa del Carmen Mexico, adults-only all-inclusive, art and culture focus" },
  "Viceroy Riviera Maya": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Riviera Maya Mexico, Viceroy Hotels" },
  "Waldorf Astoria Riviera Maya": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Riviera Maya Mexico, Hilton Honors" },
  "Hotel Xcaret Mexico": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Playa del Carmen Mexico, all-inclusive" },
  "Conrad Punta de Mita": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Punta de Mita Nayarit Mexico, Hilton Honors" },
  "Grand Velas Riviera Nayarit": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "Nuevo Vallarta Mexico, Grand Velas, all-inclusive" },
  "One&Only Mandarina": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Nayarit Mexico, One&Only Resorts, treehouse villas in 200-year-old jungle canopy and beach villas with access to a 50-meter infinity pool directly on the sand — one of the most extraordinary resort settings in Mexico" },
  "The St. Regis Punta Mita Resort": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Punta Mita Nayarit Mexico, Marriott Bonvoy" },
  "Naviva, A Four Seasons Resort": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "Punta Mita Nayarit Mexico, adults-only tented camp, independent" },
  "Casa de Sierra Nevada": { tier: "ultra_luxury", forbes_stars: 4, region: "mexico", notes: "San Miguel de Allende Mexico, Belmond, historic colonial mansions" },
  "Live Aqua Urban Resort San Miguel de Allende": { tier: "luxury", forbes_stars: 4, region: "mexico", notes: "San Miguel de Allende Mexico, independent" },


  // ── FORBES 4-STAR — UNITED STATES (additional properties) ────────────────
  // Arizona
  "The Phoenician": { tier: "luxury", forbes_stars: 4, notes: "Scottsdale AZ, Camelback Mountain, Luxury Collection/Marriott" },
  "Enchantment Resort": { tier: "luxury", forbes_stars: 4, notes: "Sedona AZ, Boynton Canyon, independent" },
  "L'Auberge de Sedona": { tier: "luxury", forbes_stars: 4, slh: true, notes: "Sedona AZ, Oak Creek, independent" },
  // California
  "Yaamava Resort & Casino": { tier: "luxury", forbes_stars: 4, notes: "Highland CA, San Manuel Band of Mission Indians" },
  "Bernardus Lodge & Spa": { tier: "luxury", forbes_stars: 4, notes: "Carmel Valley CA, independent" },
  "Alila Ventana Big Sur": { tier: "ultra_luxury", forbes_stars: 4, michelin_keys: 3, notes: "Big Sur CA, adults-only, World of Hyatt" },
  "Hotel Californian": { tier: "luxury", forbes_stars: 4, notes: "Santa Barbara CA, independent, Spanish Colonial Revival" },
  "Agua Caliente Resort Casino Spa": { tier: "luxury", forbes_stars: 4, notes: "Rancho Mirage CA, Agua Caliente Band of Cahuilla Indians" },
  "The Ritz-Carlton Marina del Rey": { tier: "luxury", forbes_stars: 4, notes: "Marina del Rey CA, Marriott Bonvoy" },
  "Four Seasons Hotel Silicon Valley": { tier: "luxury", forbes_stars: 4, notes: "East Palo Alto CA, independent" },
  "Hotel Nikko San Francisco": { tier: "luxury", forbes_stars: 4, notes: "Union Square SF, independent" },
  // Colorado
  "St Julien Hotel & Spa": { tier: "luxury", forbes_stars: 4, notes: "Boulder CO, independent" },
  "Four Seasons Hotel Denver": { tier: "luxury", forbes_stars: 4, notes: "Downtown Denver CO, independent" },
  "Four Seasons Resort and Residences Vail": { tier: "ultra_luxury", forbes_stars: 4, notes: "Vail CO, ski-in/ski-out, independent" },
  // DC
  "The Ritz-Carlton Tysons Corner": { tier: "luxury", forbes_stars: 4, notes: "McLean VA near DC, Marriott Bonvoy" },
  // Florida
  "Camp Creek Inn": { tier: "luxury", forbes_stars: 4, notes: "Inlet Beach FL, 30A Panhandle, independent" },
  "The Ritz-Carlton Fort Lauderdale": { tier: "luxury", forbes_stars: 4, notes: "Fort Lauderdale FL, Marriott Bonvoy" },
  "The Ritz-Carlton Bal Harbour": { tier: "luxury", forbes_stars: 4, notes: "Bal Harbour FL, Marriott Bonvoy" },
  "Trump National Doral Miami": { tier: "luxury", forbes_stars: 4, notes: "Doral FL, golf resort" },
  "The Ritz-Carlton Naples Tiburon": { tier: "luxury", forbes_stars: 4, notes: "Naples FL, Tiburon Golf Club, Marriott Bonvoy" },
  "Conrad Orlando": { tier: "luxury", forbes_stars: 4, notes: "Grande Lakes Orlando FL, Hilton Honors" },
  "JW Marriott Orlando Grande Lakes": { tier: "luxury", forbes_stars: 4, notes: "Orlando FL, Marriott Bonvoy" },
  "Tower at The Boca Raton": { tier: "ultra_luxury", forbes_stars: 4, notes: "Boca Raton FL, Forbes 5-Star adjacent, independent" },
  // Georgia
  "The Ritz-Carlton Reynolds Lake Oconee": { tier: "luxury", forbes_stars: 4, notes: "Greensboro GA, Lake Oconee, Marriott Bonvoy" },
  // Hawaii
  "Sensei Lanai, A Four Seasons Resort": { tier: "ultra_luxury", forbes_stars: 4, notes: "Lanai Hawaii, wellness-focused, Larry Ellison ownership, independent" },
  "Halekulani": { tier: "ultra_luxury", forbes_stars: 4, notes: "Waikiki Oahu, independent, the most storied luxury hotel in Hawaii — original building dates to 1907, orchid mosaic pool built around a century-old kiawe tree, House Without A Key bar is one of the great hotel sunset experiences anywhere (live Hawaiian music, Waianae Mountains backdrop). Old Hawaii elegance in a different register from the resort corridor." },
  "The Ritz-Carlton Maui Kapalua": { tier: "luxury", forbes_stars: 4, notes: "Kapalua Maui, Marriott Bonvoy" },
  // Illinois
  "Park Hyatt Chicago": { tier: "luxury", forbes_stars: 4, notes: "Water Tower Chicago, World of Hyatt" },
  "The St. Regis Chicago": { tier: "ultra_luxury", forbes_stars: 4, notes: "Lakeshore Drive Chicago, Marriott Bonvoy" },
  "Waldorf Astoria Chicago": { tier: "luxury", forbes_stars: 4, notes: "Gold Coast Chicago, Hilton Honors" },
  // Louisiana
  "Four Seasons Hotel New Orleans": { tier: "luxury", forbes_stars: 4, notes: "CBD New Orleans, independent" },
  "The Windsor Court": { tier: "luxury", forbes_stars: 4, notes: "CBD New Orleans, independent, English antiques collection" },
  "The Ritz-Carlton New Orleans": { tier: "luxury", forbes_stars: 4, notes: "French Quarter adjacent, Marriott Bonvoy" },
  // Maryland
  "Four Seasons Hotel Baltimore": { tier: "luxury", forbes_stars: 4, notes: "Inner Harbor Baltimore, independent" },
  "Inn at Perry Cabin": { tier: "luxury", forbes_stars: 4, michelin_keys: 1, notes: "St. Michaels MD, Eastern Shore, Pendry/Marriott" },
  // Massachusetts
  "The Inn at Hastings Park": { tier: "luxury", forbes_stars: 4, notes: "Lexington MA, independent boutique" },
  "The Newbury Boston": { tier: "luxury", forbes_stars: 4, notes: "Back Bay Boston, Luxury Collection/Marriott, historic 1927" },
  "The Ritz-Carlton Boston": { tier: "luxury", forbes_stars: 4, notes: "Avery Street Boston, Marriott Bonvoy" },
  "Mirbeau Inn & Spa Plymouth": { tier: "luxury", forbes_stars: 4, notes: "Plymouth MA, independent spa resort" },
  "The Wauwinet": { tier: "luxury", forbes_stars: 4, michelin_keys: 1, relais_chateaux: true, notes: "Nantucket MA, independent" },
  // Missouri
  "The Ritz-Carlton St. Louis": { tier: "luxury", forbes_stars: 4, notes: "Clayton MO, Marriott Bonvoy" },
  // Montana
  "Triple Creek Ranch": { tier: "ultra_luxury", forbes_stars: 4, tl_gold: true, relais_chateaux: true, notes: "Darby MT, all-inclusive luxury ranch, Relais & Chateaux" },
  "GreenO": { tier: "ultra_luxury", forbes_stars: 4, notes: "Greenough MT, adults-only eco-luxury ranch, independent" },
  "Paws Up Montana": { tier: "ultra_luxury", forbes_stars: 4, notes: "Greenough MT, glamping and ranch resort, 37,000 acres, independent" },
  // Nevada
  "The Palazzo at The Venetian": { tier: "luxury", forbes_stars: 4, notes: "Las Vegas Strip, Las Vegas Sands" },
  "THE VILLAS Caesars Palace": { tier: "ultra_luxury", forbes_stars: 4, notes: "Las Vegas, Caesars Entertainment" },
  "Wynn Las Vegas": { tier: "luxury", forbes_stars: 4, notes: "Las Vegas Strip, Wynn Resorts" },
  "The Venetian Resort Las Vegas": { tier: "luxury", forbes_stars: 4, notes: "Las Vegas Strip, Las Vegas Sands" },
  "Encore at Wynn Las Vegas": { tier: "luxury", forbes_stars: 4, notes: "Las Vegas Strip, Wynn Resorts" },
  // New Mexico
  "Four Seasons Resort Rancho Encantado": { tier: "ultra_luxury", forbes_stars: 4, notes: "Santa Fe NM, independent" },
  // New York
  "The Aurora Inn": { tier: "luxury", forbes_stars: 4, notes: "Aurora NY, Finger Lakes, independent" },
  "Mirbeau Inn & Spa Skaneateles": { tier: "luxury", forbes_stars: 4, notes: "Skaneateles NY, Finger Lakes, independent" },
  "Mirbeau Inn & Spa Rhinebeck": { tier: "luxury", forbes_stars: 4, notes: "Rhinebeck NY, Hudson Valley, independent" },
  "Aman New York": { tier: "ultra_luxury", forbes_stars: 4, aman: true, notes: "Crown Building NYC, Aman" },
  "The Dominick": { tier: "luxury", forbes_stars: 4, notes: "SoHo NYC, independent" },
  "Equinox Hotel New York": { tier: "luxury", forbes_stars: 4, notes: "Hudson Yards NYC, independent" },
  "The Langham New York Fifth Avenue": { tier: "luxury", forbes_stars: 4, notes: "Midtown NYC, Langham Hotels" },
  "Pendry Manhattan West": { tier: "luxury", forbes_stars: 4, notes: "Hudson Yards NYC, Pendry/Marriott" },
  "Andaz 5th Avenue": { tier: "luxury", forbes_stars: 4, notes: "Midtown NYC, World of Hyatt" },
  "The Lodge at Turning Stone": { tier: "luxury", forbes_stars: 4, notes: "Verona NY, Oneida Nation resort" },
  "The Plaza Hotel": { tier: "ultra_luxury", forbes_stars: 4, notes: "Fifth Avenue NYC, historic 1907, Fairmont/Accor" },
  // North Carolina
  "The Inn on Biltmore Estate": { tier: "luxury", forbes_stars: 4, cn_gold: true, notes: "Asheville NC, Biltmore Estate grounds, independent" },
  "Old Edwards Inn and Spa": { tier: "luxury", forbes_stars: 4, notes: "Highlands NC, independent" },
  "The Ivey's Hotel": { tier: "luxury", forbes_stars: 4, notes: "Charlotte NC, independent boutique" },
  "The Fearrington House Inn": { tier: "luxury", forbes_stars: 4, relais_chateaux: true, notes: "Pittsboro NC, Relais & Chateaux, country house hotel" },
  // Oregon
  "Tributary Hotel": { tier: "luxury", forbes_stars: 4, notes: "McMinnville OR, Willamette Valley wine country, independent" },
  // Pennsylvania
  "The Grand Lodge at Nemacolin": { tier: "luxury", forbes_stars: 4, notes: "Farmington PA, Nemacolin resort, independent" },
  "Four Seasons Hotel Philadelphia at Comcast Center": { tier: "luxury", forbes_stars: 4, notes: "Center City Philadelphia, independent" },
  "The Rittenhouse": { tier: "luxury", forbes_stars: 4, notes: "Rittenhouse Square Philadelphia, independent" },
  "The Lodge at Glendorn": { tier: "ultra_luxury", forbes_stars: 4, relais_chateaux: true, notes: "Bradford PA, private wilderness estate, Relais & Chateaux" },
  // Rhode Island
  "Castle Hill Inn": { tier: "luxury", forbes_stars: 4, notes: "Newport RI, Newport Harbor, independent" },
  // South Carolina
  "Hotel Bennett": { tier: "luxury", forbes_stars: 4, notes: "Marion Square Charleston SC, independent" },
  "The Charleston Place": { tier: "luxury", forbes_stars: 4, notes: "Historic District Charleston SC, Belmond" },
  "The Inn & Club at Harbour Town": { tier: "luxury", forbes_stars: 4, notes: "Sea Pines Hilton Head SC, Sea Pines Resort" },
  // Tennessee
  "Four Seasons Hotel Nashville": { tier: "luxury", forbes_stars: 4, notes: "SoBro Nashville, independent" },
  "The Joseph Nashville": { tier: "luxury", forbes_stars: 4, notes: "SoBro Nashville, Autograph Collection/Marriott" },
  // Texas
  "Commodore Perry Estate": { tier: "ultra_luxury", forbes_stars: 4, notes: "Austin TX, Auberge Resorts, historic 1928 estate" },
  "Archer Hotel Austin": { tier: "luxury", forbes_stars: 4, notes: "Second Street Austin TX, independent" },
  "Austin Proper Hotel & Residences": { tier: "luxury", forbes_stars: 4, notes: "Second Street Austin TX, independent" },
  "Fairmont Austin": { tier: "luxury", forbes_stars: 4, notes: "Convention Center Austin TX, Fairmont/Accor" },
  "The Houstonian Hotel Club and Spa": { tier: "luxury", forbes_stars: 4, notes: "River Oaks Houston TX, independent" },
  "Hotel Granduca Houston": { tier: "luxury", forbes_stars: 4, notes: "Uptown Houston TX, independent, Italian villa style" },
  "Mokara Hotel & Spa": { tier: "luxury", forbes_stars: 4, notes: "River Walk San Antonio TX, independent" },
  // Utah
  "The Chateaux Deer Valley": { tier: "luxury", forbes_stars: 4, notes: "Park City UT, Deer Valley, independent" },
  // Virginia
  "Nicewonder Farm & Vineyards": { tier: "luxury", forbes_stars: 4, notes: "Bristol VA, farm and vineyard retreat, independent" },
  "Williamsburg Inn": { tier: "luxury", forbes_stars: 4, notes: "Colonial Williamsburg VA, Colonial Williamsburg Foundation" },
  // Washington State
  // Wisconsin
  "The American Club": { tier: "luxury", forbes_stars: 4, notes: "Kohler WI, independent, historic 1918 workers dormitory, Destination Kohler" },
  // Wyoming
  "Four Seasons Resort and Residences Jackson Hole": { tier: "ultra_luxury", forbes_stars: 4, notes: "Teton Village WY, ski-in/ski-out, Teton views, independent" },
  "Rusty Parrot Lodge and Spa": { tier: "luxury", forbes_stars: 4, slh: true, notes: "Jackson WY, downtown Jackson, independent boutique" },


  // ── SLH — MEXICO ──────────────────────────────────────────────────────────
  "Bespoke Tulum": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, boutique, independent, Hyatt bookable" },
  "Brick Hotel Mexico City": { tier: "luxury", slh: true, region: "mexico", notes: "Polanco Mexico City, independent boutique, Hyatt bookable" },
  "Decu Downtown": { tier: "luxury", slh: true, region: "mexico", notes: "Merida Mexico, independent boutique, Hyatt bookable" },
  "Diez Diez Collection": { tier: "luxury", slh: true, region: "mexico", notes: "Merida Mexico, independent, Hyatt bookable" },
  "Hacienda Pena Pobre": { tier: "luxury", slh: true, region: "mexico", notes: "Tlalpan Mexico City, historic hacienda, independent, Hyatt bookable" },
  "Hotel Casa Huamantla": { tier: "luxury", slh: true, region: "mexico", notes: "Huamantla Tlaxcala Mexico, colonial town near Popocatepetl, independent, Hyatt bookable" },
  "Hotel de la Soledad": { tier: "luxury", slh: true, region: "mexico", notes: "Morelia Michoacan Mexico, historic colonial city, independent, Hyatt bookable" },
  "La Casa Que Canta": { tier: "ultra_luxury", slh: true, region: "mexico", notes: "Zihuatanejo Mexico, clifftop boutique over the Pacific, one of Mexico's most romantic hotels, independent, Hyatt bookable" },
  "La Valise Mazunte": { tier: "ultra_luxury", slh: true, region: "mexico", notes: "Mazunte Oaxaca Mexico, remote Pacific coast, adults-only, independent, Hyatt bookable" },
  "La Valise Mexico City": { tier: "luxury", slh: true, region: "mexico", notes: "Roma Norte Mexico City, intimate boutique, independent, Hyatt bookable" },
  "La Valise San Miguel de Allende": { tier: "luxury", slh: true, region: "mexico", notes: "San Miguel de Allende Mexico, boutique, independent, Hyatt bookable" },
  "La Valise Tulum": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, adults-only beachfront boutique, independent, Hyatt bookable" },
  "La Zebra": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, beachfront boutique, independent, Hyatt bookable" },
  "ME Cabo": { tier: "luxury", slh: true, region: "mexico", notes: "Cabo San Lucas Mexico, Melia Hotels" },
  "Mezzanine Tulum": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, boutique hotel and spa, independent, Hyatt bookable" },
  "Mi Amor Tulum": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, adults-only boutique, independent, Hyatt bookable" },
  "Roso Guest House": { tier: "luxury", slh: true, region: "mexico", notes: "Mexico City, intimate boutique, independent, Hyatt bookable" },
  "TAGO Tulum": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, boutique, independent, Hyatt bookable" },
  "Todos Santos Boutique Hotel": { tier: "luxury", slh: true, region: "mexico", notes: "Todos Santos Baja California Sur, historic town near Cabo, independent, Hyatt bookable" },
  "Villa Maria Cristina": { tier: "luxury", slh: true, region: "mexico", notes: "Guanajuato Mexico, UNESCO World Heritage city, colonial boutique, independent, Hyatt bookable" },
  "Villa Santa Cruz": { tier: "luxury", slh: true, region: "mexico", notes: "Todos Santos Baja California Sur, boutique villa, independent, Hyatt bookable" },
  "Villas del Mar San Jose del Cabo": { tier: "luxury", slh: true, region: "mexico", notes: "San Jose del Cabo Mexico, villa resort, independent, Hyatt bookable" },
  "Wakax Hacienda": { tier: "luxury", slh: true, region: "mexico", notes: "Tulum Mexico, cenote and boutique hotel, independent, Hyatt bookable" },

  // ── SLH — CARIBBEAN ───────────────────────────────────────────────────────
  "Barbuda Belle": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "Barbuda, remote and pristine, only small resort on the island, independent, Hyatt bookable" },
  "Bequia Beach Hotel": { tier: "luxury", slh: true, region: "caribbean", notes: "Bequia St. Vincent and the Grenadines, sailing culture, independent, Hyatt bookable" },
  "Bluefields Bay Villas": { tier: "luxury", slh: true, region: "caribbean", notes: "Westmoreland Jamaica, private villas, independent, Hyatt bookable" },
  "Casa Colonial Beach & Spa": { tier: "luxury", slh: true, region: "caribbean", notes: "Puerto Plata Dominican Republic, independent, Hyatt bookable" },
  "Coral Reef Club": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "St. James Barbados, family-run since 1952, gardens and beach, one of Barbados's most beloved intimate hotels, independent, Hyatt bookable" },
  "Goldwynn Resort & Residences": { tier: "luxury", slh: true, region: "caribbean", notes: "Nassau Bahamas, Cable Beach, independent, Hyatt bookable" },
  "Hermitage Bay": { tier: "luxury", slh: true, cn_gold: true, relais_chateaux: true, region: "caribbean", notes: "Antigua, all-inclusive boutique, Relais & Chateaux, CN Gold List, Hyatt bookable" },
  "Hotel El Convento": { tier: "luxury", slh: true, region: "caribbean", notes: "Old San Juan Puerto Rico, 17th century convent, independent, Hyatt bookable" },
  "Malliouhana Resort": { tier: "luxury", slh: true, region: "caribbean", notes: "Meads Bay Anguilla, Auberge Resorts, Hyatt bookable" },
  "O:live Boutique Hotel": { tier: "luxury", slh: true, region: "caribbean", notes: "Condado San Juan Puerto Rico, independent boutique, Hyatt bookable" },
  "ONE GT Grand Cayman": { tier: "luxury", slh: true, region: "caribbean", notes: "George Town Grand Cayman, independent, Hyatt bookable" },
  "Paradise Beach Nevis": { tier: "luxury", slh: true, region: "caribbean", notes: "Nevis, intimate beachfront, independent, Hyatt bookable" },
  "Petit St. Vincent": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "Petit St. Vincent island, private island resort, signal flag system for room service, no phones or TVs in villas, independent, Hyatt bookable" },
  "Point Grace Resort and Spa": { tier: "luxury", slh: true, region: "caribbean", notes: "Grace Bay Providenciales Turks and Caicos, independent, Hyatt bookable" },
  "S Hotel Kingston": { tier: "luxury", slh: true, region: "caribbean", notes: "Kingston Jamaica, independent boutique, Hyatt bookable" },
  "S Hotel Montego Bay": { tier: "luxury", slh: true, region: "caribbean", notes: "Montego Bay Jamaica, independent, Hyatt bookable" },
  "Sailrock South Caicos": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "South Caicos Turks and Caicos, remote private island feel, independent, Hyatt bookable" },
  "South Bank Turks and Caicos": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "Providenciales Turks and Caicos, boutique, independent, Hyatt bookable" },
  "Spice Island Beach Resort": { tier: "luxury", slh: true, region: "caribbean", notes: "Grand Anse Grenada, family-run, one of Grenada's most beloved resorts, independent, Hyatt bookable" },
  "Sublime Samana Hotel & Residences": { tier: "luxury", slh: true, region: "caribbean", notes: "Las Terrenas Samana Dominican Republic, independent boutique, Hyatt bookable" },
  "Sunset Reef St. Kitts": { tier: "luxury", slh: true, region: "caribbean", notes: "St. Kitts, boutique, independent, Hyatt bookable" },
  "Tamarind Hills Resort and Villas": { tier: "luxury", slh: true, region: "caribbean", notes: "Antigua, hillside villas with Antigua Sound views, independent, Hyatt bookable" },
  "The Inn at English Harbour": { tier: "luxury", slh: true, region: "caribbean", notes: "English Harbour Antigua, historic Nelson's Dockyard area, independent, Hyatt bookable" },
  "The Liming Bequia": { tier: "luxury", slh: true, region: "caribbean", notes: "Bequia St. Vincent and the Grenadines, boutique, sailing hub of the Grenadines, independent, Hyatt bookable" },
  "The Sandpiper": { tier: "ultra_luxury", slh: true, region: "caribbean", notes: "St. James Barbados, family-run, one of Barbados's most refined intimate hotels, independent, Hyatt bookable" },
  "The Trident Hotel": { tier: "luxury", slh: true, region: "caribbean", notes: "Port Antonio Jamaica, Errol Flynn Marina area, independent, Hyatt bookable" },
  "West Bay Club": { tier: "luxury", slh: true, region: "caribbean", notes: "Providenciales Turks and Caicos, Grace Bay, boutique, independent, Hyatt bookable" },
  "Yemaya Reefs": { tier: "luxury", slh: true, region: "caribbean", notes: "Little Corn Island Nicaragua, remote dive resort, independent, Hyatt bookable" },

  // ── NATIONAL PARK LODGES — IN-PARK LODGING (distinct signal category) ──────
  // Not luxury hotels — the signal is irreplaceable setting and historic character
  "The Ahwahnee": { tier: "luxury", historic: true, notes: "Yosemite Valley CA, opened 1927, National Historic Landmark, Gilbert Stanley Underwood's granite and concrete Arts and Crafts/Art Deco masterpiece — sequoias outside the windows, 24-foot great hall, massive stone fireplaces. FDR, Churchill, JFK all stayed here. The building IS Yosemite." },
  "Volcano House": { tier: "premium", historic: true, notes: "Hawaii Volcanoes National Park Big Island, only lodging on the rim of Kilauea caldera — lava glow at night, crater views from the dining room, steam vents outside. Remote and extraordinary. Most travelers don't know you can sleep inside the park." },
  "Old Faithful Inn": { tier: "premium", historic: true, notes: "Yellowstone National Park WY, opened 1904, largest log structure in the world, National Historic Landmark — Old Faithful erupts 100 yards from the front porch. The log lobby with its volcanic rock fireplace is one of America's great interior spaces." },
  "El Tovar": { tier: "luxury", historic: true, notes: "South Rim Grand Canyon AZ, opened 1905, National Historic Landmark — perched on the canyon rim, one of the great National Park lodges, rustic elegance with canyon views from the dining room." },
  "Many Glacier Hotel": { tier: "premium", historic: true, notes: "Glacier National Park MT, opened 1915, Swiss chalet on Swiftcurrent Lake — one of the most dramatically situated hotels in America, surrounded by glaciers and wildlife." },
  "Crater Lake Lodge": { tier: "premium", historic: true, notes: "Crater Lake National Park OR, opened 1915, rebuilt 1995 — on the rim of the deepest lake in the US, the bluest water you will ever see. Rooms on the rim side are extraordinary." },
  "Grand Hotel Mackinac Island": { tier: "luxury", historic: true, notes: "Mackinac Island MI, opened 1887, longest porch in the world, no cars on the island — horse-drawn carriages only. National Historic Landmark, genuinely frozen in a different era." },
  "The Grand Hotel Yellowstone": { tier: "premium", historic: true, notes: "Lake Village Yellowstone WY, opened 1891, on Yellowstone Lake — one of the oldest hotels in the park system." },

};

// Get quality tier for a property for a property — try exact match then partial
const getQualitySignal = (propertyName) => {
  if (!propertyName) return null;
  const name = propertyName.trim();
  if (QUALITY_SIGNALS_DB[name]) return QUALITY_SIGNALS_DB[name];
  // Partial match
  const key = Object.keys(QUALITY_SIGNALS_DB).find(k =>
    name.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(name.toLowerCase().split(' ').slice(0,2).join(' ').toLowerCase())
  );
  return key ? QUALITY_SIGNALS_DB[key] : null;
};

// Build quality context string for AI prompt injection
const buildQualityContext = (propertyNames) => {
  if (!propertyNames || !propertyNames.length) return "";
  const signals = propertyNames.map(name => {
    const q = getQualitySignal(name);
    if (!q) return null;
    const markers = [
      q.michelin_keys ? `${q.michelin_keys} Michelin Key${q.michelin_keys > 1 ? 's' : ''}` : null,
      q.michelin_stars ? `${q.michelin_stars} Michelin Star${q.michelin_stars > 1 ? 's' : ''} (restaurant)` : null,
      q.forbes_stars ? `Forbes ${q.forbes_stars}-Star` : null,
      q.relais_chateaux ? "Relais & Châteaux" : null,
      q.tl_gold ? "T&L Gold List" : null,
      q.cn_hot_list ? "Condé Nast Hot List" : null,
    ].filter(Boolean).join(', ');
    return `${name}: ${q.tier.replace('_', ' ')}${markers ? ` (${markers})` : ''}`;
  }).filter(Boolean);
  return signals.join('; ');
};


// ─── RESTAURANT SIGNALS DATABASE ──────────────────────────────────────────────
// Separate from hotel quality signals — used for local discovery queries
// ("I'm in Seattle, where should I eat?") and refinement conversations
// Structure: city → cuisine category → array of restaurant objects
// Axes: trusted_authority | local_authority | freshness | authenticity_value |
//        hospitality | populist | culinary_prestige | value_quality
// Sources: Eater Essential/38, Eater Best New, James Beard, Michelin, Bib Gourmand
// Last updated: March 2026
// ─────────────────────────────────────────────────────────────────────────────

const RESTAURANT_SIGNALS_DB = {

  "Seattle": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Canlis", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "hospitality"], notes: "Seattle institution since 1950, mid-century modern dining room above Lake Union, impeccable service — special occasion and splurge territory ($150-200+/person), not an everyday dinner" },
      { name: "Atoma", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate tasting menu, former Canlis team, one of Seattle's most exciting fine dining rooms" },
      { name: "Surrell", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "New American tasting menu, Capitol Hill, intimate and ambitious" },
      { name: "Marjorie", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Belltown stalwart, creative Pacific Northwest, warm room, beloved by locals" },
      { name: "Corson Building", signals: ["eater_38"], axis: ["hospitality", "local_authority"], notes: "Georgetown, communal farm-to-table dinners in a historic building, unique Seattle experience" },
    ],

    // ── Seafood ──
    seafood: [
      { name: "The Walrus and the Carpenter", signals: ["eater_38", "james_beard"], axis: ["local_authority", "culinary_prestige"], notes: "Renee Erickson's Ballard oyster bar, the definitive Seattle seafood experience, always packed — no water view but the best seafood in the city" },
      { name: "Ray's Boathouse", signals: ["local_knowledge"], axis: ["local_authority", "trusted_authority"], notes: "Ballard, Puget Sound views and ship canal, one of Seattle's most beloved seafood restaurants for decades — upstairs cafe is casual with same views at lower price, downstairs is more formal. Best Seattle combination of quality seafood and genuine water views." },
      { name: "Local Tide", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative seafood, Capitol Hill, inventive preparations beyond the standard fish house — no view, neighborhood spot" },
      { name: "The Boat", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Korean-inflected seafood, SoDo, underrated and excellent" },
      { name: "Good Voyage", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Southeast Asian seafood influences, one of Seattle's most creative new spots" },
      { name: "Ivar's Salmon House", signals: ["local_knowledge"], axis: ["local_authority", "populist"], notes: "Lake Union waterfront, genuine views, alder-smoked salmon, Native American longhouse architecture — more authentic and locally beloved than the tourist-facing Ivar's on the waterfront. Good casual option with a real sense of place." },
    ],

    // ── Asian / Pacific Rim ──
    asian: [
      { name: "Kamonegi", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Handmade soba and Japanese small plates, Fremont, James Beard nominated, one of Seattle's best" },
      { name: "Joule", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Rachel Yang and Seif Chirchi's Korean-French fusion, Wallingford, James Beard nominated" },
      { name: "Ltd Edition Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Omakase sushi, intimate, reservation-only, serious sushi in Seattle" },
      { name: "Paju", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Modern Korean, Capitol Hill, creative and vibrant" },
      { name: "Sophon", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Thai with serious technique, one of Seattle's most exciting newer openings" },
      { name: "Taurus Ox", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Southeast Asian, Columbia City, neighborhood gem with serious cooking" },
      { name: "TOMO", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Japanese-influenced, newer entry, generating real buzz" },
      { name: "Hamdi", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Somali-influenced, Capitol Hill, deeply flavorful and underexplored cuisine" },
      { name: "Ramie", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Korean comfort food elevated, one of the neighborhood's most loved spots" },
    ],

    // ── Italian / Mediterranean ──
    italian: [
      { name: "Cafe Juanita", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Holly Smith's Northern Italian in Kirkland, James Beard winner, one of the best Italian restaurants in the Pacific Northwest" },
      { name: "Spinasse", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Northern Italian pasta, Capitol Hill, handmade and deeply satisfying, long-running local favorite" },
      { name: "Cafe Lago", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Roman-style thin-crust pizza and pasta, Montlake, neighborhood institution, warm and unfussy" },
    ],

    // ── Global / Neighborhood gems ──
    global: [
      { name: "Musang", signals: ["eater_38", "james_beard"], axis: ["local_authority", "authenticity_value"], notes: "Filipino cooking by Melissa Miranda, Beacon Hill, James Beard nominated, community-rooted and delicious" },
      { name: "COMMUNION Restaurant & Bar", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Southern and soul food with Black cultural heritage, Capitol Hill, unique and important Seattle restaurant" },
      { name: "Archipelago", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Filipino tasting menu, Hillman City, James Beard nominated, one of Seattle's most ambitious restaurants" },
      { name: "Café Suliman", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Somali cuisine, excellent value, neighborhood institution" },
      { name: "Delish Ethiopian Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian, Central District, outstanding injera and wats, beloved by locals" },
      { name: "Oriental Mart", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Filipino grocery and prepared foods, Pike Place Market area, cheap and delicious" },
      { name: "Homer", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Greek-influenced, Capitol Hill, one of the city's most talked-about recent openings" },
      { name: "Familyfriend", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Eclectic neighborhood restaurant, West Seattle, warm and inventive" },
      { name: "Lenox", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Neighborhood bistro feel, serious cooking, Capitol Hill" },
    ],

    // ── Casual / Takeout / Value ──
    casual: [
      { name: "Un Bien", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Caribbean rotisserie chicken, Fremont, legendary in Seattle, long lines worth it" },
      { name: "Spice Waala", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Indian street food, Capitol Hill and Fremont, fast-casual, outstanding value and flavor" },
      { name: "Ono Authentic Hawaiian Poke", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Poke done right, straightforward and fresh, one of Seattle's most-loved casual spots" },
      { name: "Lil Red Takeout & Catering", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Soul food and Southern, takeout-focused, exceptional" },
      { name: "El Cabrito", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Mexican, Beacon Hill, no-frills but serious cooking, local favorite" },
      { name: "Off Alley", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Natural wine bar and small plates, Hillman City, unpretentious and excellent" },
    ],

    // ── Neighborhood / Unique experience ──
    experience: [
      { name: "The Wayland Mill", signals: ["eater_38"], axis: ["hospitality", "freshness"], notes: "Historic mill setting, thoughtful cooking, unique atmosphere" },
      { name: "Tivoli", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Nordic-influenced, newer entry, one of Seattle's most interesting dining rooms" },
      { name: "The Little Beast Ballard", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Neighborhood bistro, Ballard, warm and reliable, great for a relaxed dinner" },
    ],

    // ── Filipino spotlight (Seattle has exceptional Filipino food) ──
    filipino: [
      { name: "Musang", signals: ["eater_38", "james_beard"], axis: ["local_authority", "authenticity_value"], notes: "See global listing — Beacon Hill, James Beard nominated" },
      { name: "Archipelago", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige"], notes: "See global listing — tasting menu, Hillman City" },
      { name: "Oriental Mart", signals: ["eater_38"], axis: ["authenticity_value"], notes: "See casual listing — Pike Place, casual Filipino" },
    ],
  },

  "Portland": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Le Pigeon", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Gabriel Rucker's James Beard-winning bistro, East Burnside, inventive French-influenced, one of Portland's most iconic restaurants" },
      { name: "Langbaan", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Hidden Thai tasting menu behind PaaDee, James Beard nominated, one of the most extraordinary Thai restaurants in the US" },
      { name: "Kann", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "freshness"], notes: "Haitian cuisine by Gregory Gourdet, James Beard winner, stunning wood-fired cooking, genuinely important restaurant" },
      { name: "Arden Restaurant Portland", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate tasting menu, seasonal Pacific Northwest ingredients, one of Portland's most ambitious new rooms" },
      { name: "Maurice", signals: ["eater_38"], axis: ["hospitality", "local_authority"], notes: "Lunch counter and pastry shop, downtown, Kristen Murray's vision, beautiful and unique" },
      { name: "Alma", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate, ambitious cooking, one of Portland's most exciting newer tasting menu restaurants" },
      { name: "Astera", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Pacific Northwest fine dining, thoughtful and seasonal, generating strong word of mouth" },
      { name: "Norah", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Creative contemporary, newer entry making waves in Portland's dining scene" },
    ],

    // ── Italian / Mediterranean ──
    italian: [
      { name: "Mucca Osteria", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Roman-style pasta and pizza, Northeast Portland, casual and delicious, neighborhood staple" },
      { name: "Luce", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Italian wine bar and small plates, Southeast Portland, warm neighborhood room, excellent pasta" },
      { name: "Café Olli", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Italian-influenced all-day café, wood-fired cooking, Sabin neighborhood, one of Portland's most beloved" },
      { name: "L'Orange", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "French bistro sensibility, natural wine focus, one of Portland's most stylish newer rooms" },
      { name: "Urdaneta", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Basque pintxos and wine, Northeast Portland, convivial and fun, great for groups" },
    ],

    // ── Asian ──
    asian: [
      { name: "Nong's Khao Man Gai", signals: ["eater_38", "james_beard"], axis: ["authenticity_value", "local_authority"], notes: "Nong Poonsukwattana's famous Thai poached chicken and rice, James Beard nominated, Portland icon" },
      { name: "Xiao Ye", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Han Ly Hwang's Chinese-American cooking, creative and personal, one of Portland's most talked-about restaurants" },
      { name: "Pasar", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Southeast Asian hawker-style cooking, vibrant and affordable, one of Portland's most exciting newer spots" },
      { name: "Kau Kau", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hawaiian plate lunch and local-style food, genuine and satisfying" },
      { name: "Sichuan Taste Chinese Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Legit Sichuan cooking, not dumbed down, one of Portland's best Chinese restaurants" },
      { name: "Excellent Cuisine Chinese Food Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Cantonese and Hong Kong style, serious Chinese cooking beloved by Portland's Chinese community" },
      { name: "Rangoon Bistro", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Burmese cuisine, one of the few good Burmese options in the Pacific Northwest" },
      { name: "Nimblefish", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese-influenced, omakase sensibility, serious fish sourcing" },
      { name: "Kachka", signals: ["eater_38", "james_beard"], axis: ["local_authority", "culinary_prestige"], notes: "Russian cuisine by Bonnie Morales, James Beard nominated, one of Portland's most distinctive restaurants, excellent vodka program" },
    ],

    // ── Mexican / Latin ──
    mexican: [
      { name: "Mole Mole Mexican Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Serious mole and regional Mexican cooking, not Tex-Mex, genuinely authentic" },
      { name: "Javelina", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Tex-Mex and Southwest influenced, fun and casual, great margaritas" },
      { name: "Casa Zoraya", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Peruvian cuisine, Northeast Portland, one of the best Latin American restaurants in the city" },
      { name: "Merendero Estela", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Mexican regional cooking, newer entry, generating strong buzz for authentic preparations" },
    ],

    // ── African / Global ──
    global: [
      { name: "Akadi", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "West African cuisine by Fatou Ouattara, James Beard nominated, one of Portland's most important and delicious restaurants" },
      { name: "Mirisata", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Sri Lankan cuisine, one of very few good Sri Lankan restaurants in the Pacific Northwest" },
      { name: "Magna Kusina", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Filipino cooking, creative and community-rooted, part of Portland's strong Filipino food scene" },
      { name: "Oma's Hideaway", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Indonesian home cooking, small and intimate, one of Portland's hidden gems" },
    ],

    // ── Vietnamese / Southeast Asian ──
    vietnamese: [
      { name: "Memoire Ca Phe", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Vietnamese café, beautiful space, excellent coffee and light food, one of Portland's loveliest spots" },
      { name: "Bình Minh Sandwiches", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Banh mi done right, simple and excellent, local institution" },
      { name: "Rose VL Deli", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese deli and comfort food, Southeast Portland, community institution" },
      { name: "Bun Bo Hue Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Specializes in bun bo hue (spicy beef noodle soup), the real thing" },
    ],

    // ── Casual / Bakery / Takeout ──
    casual: [
      { name: "Lovely's Fifty Fifty", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Wood-fired pizza and ice cream, Mississippi Ave, Sarah Minnick's cult following, seasonal and creative" },
      { name: "OK Omens", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: ["Natural wine bar and snacks, Northeast Portland, one of Portland's best casual wine spots"] },
      { name: "Jacqueline", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar with excellent food, Southeast Portland, convivial and well-curated" },
      { name: "Bake on the Run - Authentic Guyanese Masterful Cuisines", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Guyanese baked goods and food, one of Portland's most unique and underexplored spots" },
    ],
  },

  "Vancouver": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Kissa Tanto", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "hospitality"], notes: "Italian-Japanese fusion, Chinatown, intimate basement room, one of Canada's best restaurants, perpetually booked" },
      { name: "Published on Main", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "freshness"], notes: "Clement Chan's tasting menu, Main Street, James Beard nominated, one of Vancouver's most ambitious kitchens" },
      { name: "Burdock & Co", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Andrea Carlson's seasonal Pacific Northwest tasting menu, Main Street, James Beard nominated, ingredient-obsessed" },
      { name: "Pidgin", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Asian-European fusion, Gastown, inventive and ambitious, excellent cocktail program" },
      { name: "Published on Main", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "See fine dining — Main Street, tasting menu" },
      { name: "Ophelia", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Creative contemporary, one of Vancouver's most stylish newer rooms, strong cocktail and wine focus" },
      { name: "Lila", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Modern Middle Eastern influences, beautifully designed space, one of Vancouver's most exciting recent openings" },
      { name: "Bar Tartare", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "French-inspired raw bar and tartare focus, intimate and serious, one of Vancouver's best wine bars" },
    ],

    // ── Japanese ──
    japanese: [
      { name: "Kissa Tanto", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige"], notes: "See fine dining — Italian-Japanese, Canada's best" },
      { name: "Sashimiya", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Serious omakase sushi, intimate counter, some of Vancouver's finest Japanese fish work" },
      { name: "Dosanko", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hokkaido-style ramen, butter corn, miso broth, authentic regional Japanese style rarely found outside Japan" },
      { name: "Maruhachi Ra-men", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vancouver ramen institution, rich tonkotsu, consistently excellent" },
      { name: "Japadog", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Japanese-style hot dogs, Vancouver original, street food icon — teriyaki and oroshi dogs, fun and delicious" },
      { name: "Dachi", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Japanese comfort food, creative izakaya dishes, Main Street, casual and excellent" },
    ],

    // ── Seafood ──
    seafood: [
      { name: "Blue Water Café", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Yaletown, Vancouver's premier seafood restaurant, exceptional raw bar, wild seafood focus, special occasion standard" },
      { name: "Coast", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Downtown, upscale seafood, broad menu, reliable for business dining, excellent oyster selection" },
      { name: "Golden Paramount Seafood Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Cantonese seafood, Richmond, whole fish and live seafood tanks, what the Chinese community eats for celebrations" },
      { name: "Dynasty Seafood Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Dim sum and Cantonese seafood, downtown, one of Vancouver's best for traditional Chinese seafood banquet style" },
    ],

    // ── Asian / Pacific Rim ──
    asian: [
      { name: "Maenam", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Angus An's refined Thai, Kitsilano, James Beard nominated, one of the best Thai restaurants in North America" },
      { name: "Baan Lao Fine Thai Cuisine", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Lao and Thai fine dining, Richmond, exceptional Southeast Asian cooking in an elegant room" },
      { name: "Phnom Penh", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Cambodian-Vietnamese, Chinatown, Vancouver institution since 1985, butter beef and chicken wings are legendary" },
      { name: "Anh and Chi", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Vietnamese, Main Street, family-run, elevated pho and Vietnamese classics, one of Vancouver's most beloved" },
      { name: "Zabu Chicken", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Korean fried chicken, crispy and excellent, casual and fun" },
      { name: "Miso Taco", signals: ["eater_38"], axis: ["freshness", "authenticity_value"], notes: "Japanese-Mexican fusion done right, creative and delicious, one of Vancouver's more playful spots" },
    ],

    // ── Italian / Mediterranean ──
    italian: [
      { name: "Caffé La Tana", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Italian café and deli, Commercial Drive, genuine Italian products and simple food done beautifully" },
      { name: "Dante Italian Sandwich", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Italian sandwiches, straightforward and excellent, one of Vancouver's best casual lunch spots" },
      { name: "Straight Brooklyn Pizza", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "NY-style pizza, no-frills, genuinely good slice" },
      { name: "La Fabrique St-George", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "French bakery and café, East Vancouver, beautiful pastries and bread, neighborhood gem" },
    ],

    // ── Global / Neighborhood ──
    global: [
      { name: "Vij's", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Vikram Vij's upscale Indian, no reservations, always a wait, one of Canada's most famous restaurants — worth it" },
      { name: "The Acorn", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Vegetarian fine dining, Main Street, one of North America's best vegetarian restaurants, creative and satisfying" },
      { name: "Bao Bei", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Chinese brasserie, Chinatown, Tannis Ling's creative take on Chinese comfort food, excellent cocktails, cool room" },
      { name: "Cómo Taperia", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Spanish tapas and wine, one of Vancouver's best for a convivial group dinner" },
      { name: "Noah's Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian cuisine, neighborhood institution, excellent injera and wats" },
    ],

    // ── Bars / Wine / Casual ──
    casual: [
      { name: "The 515 Bar", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar, Main Street, excellent by-the-glass selection, good snacks" },
      { name: "Breeze Bar", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine and cocktail bar, neighborhood feel, one of Vancouver's more relaxed spots for a drink with good food" },
      { name: "It's Okay", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Natural wine bar and small plates, Chinatown, understated and very good" },
      { name: "Wicked Café", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Neighborhood café, reliable and welcoming, good for a casual meal or coffee" },
      { name: "Pho In Love", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Vietnamese pho, simple and excellent, the kind of pho locals eat on a cold day" },
      { name: "Cafe Medina", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Weekend brunch institution, Belgian waffles and Mediterranean-inspired breakfast, always a line but worth it" },
      { name: "Granville Island Public Market", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Public market under Granville Bridge, fresh BC seafood, produce, artisan food stalls — a genuine Vancouver experience, not just a tourist stop" },
    ],
  },


  "San Francisco": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Quince", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Michael Tusk's Michelin 3-star Italian-Californian, Jackson Square, one of the best restaurants in America, exceptional wine cellar — tasting menu only, $250-350+/person, serious special occasion" },
      { name: "Californios", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "Val Cantu's Michelin 2-star Mexican tasting menu, Mission, James Beard winner, redefines what Mexican fine dining can be" },
      { name: "Lazy Bear", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "hospitality"], notes: "David Barzelay's Michelin 2-star communal dinner party concept, Mission, James Beard winner, inventive and fun — tasting menu $250+/person, special occasion" },
      { name: "The Progress", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Stuart Brioza and Nicole Krasinski's sibling to State Bird Provisions, Divisadero, James Beard winners, outstanding" },
      { name: "Kiln", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Brandon Rice's wood-fired tasting menu, one of SF's most exciting recent openings, serious and ambitious" },
      { name: "The Morris", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Paul Einbund's wine-focused restaurant, Mission, extraordinary wine list, excellent food to match" },
      { name: "Dalida", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Mediterranean and Middle Eastern influences, Presidio, beautiful room, one of SF's most talked-about newer restaurants" },
    ],

    // ── Neighborhood institutions ──
    institutions: [
      { name: "Zuni Café", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Judy Rodgers' legendary SF institution, Market Street, roast chicken for two is a city ritual, always reliable" },
      { name: "House of Prime Rib", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Nob Hill, English-style prime rib carved tableside since 1949, SF institution, reservations weeks out" },
      { name: "Delfina Restaurant", signals: ["eater_38", "james_beard"], axis: ["local_authority", "trusted_authority"], notes: "Mission Italian, Craig Stoll's James Beard-winning neighborhood restaurant, consistently excellent for 25+ years" },
      { name: "Anchor Oyster Bar", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Castro, tiny seafood institution, clam chowder and oysters, cash only, beloved" },
    ],

    // ── Asian ──
    asian: [
      { name: "Rintaro", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Sylvan Mishima Brackett's Japanese izakaya, Mission, James Beard nominated, handmade soba and robata grilling, one of SF's best" },
      { name: "Kin Khao", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Pim Techamuanvivit's Thai, Union Square, James Beard winner, refined yet bold, outstanding" },
      { name: "Turtle Tower", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese pho, Tenderloin, Northern Vietnamese style, SF's most beloved pho institution, cash only" },
      { name: "La Soleil", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, Outer Richmond, family-run, exceptional banh cuon and Vietnamese comfort food" },
      { name: "Thanh Long", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Outer Sunset, Vietnamese seafood since 1971, famous for cracked Dungeness crab and garlic noodles" },
      { name: "Mandalay Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Burmese cuisine, Inner Richmond, one of SF's best and most authentic Burmese restaurants" },
      { name: "Old Mandarin Islamic Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Northern Chinese Muslim cuisine, Outer Sunset, hand-pulled noodles and dumplings, deeply authentic" },
      { name: "Abaca", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Filipino fine dining by Francis Ang, Fisherman's Wharf, one of SF's most important newer restaurants" },
      { name: "Prubechu", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chamorro cuisine from Guam, Mission, one of the only Chamorro restaurants in the US, genuinely unique" },
    ],

    // ── Mexican / Latin ──
    mexican: [
      { name: "Taqueria Cancun", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Mission District taqueria, super burrito institution, the SF burrito experience, cash only" },
      { name: "Besharam", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Heena Patel's bold Indian cooking, Dogpatch, James Beard nominated, vivid and unapologetic flavors" },
      { name: "Beit Rima", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Lebanese, Castro, family recipes, warm and delicious, one of SF's best Middle Eastern spots" },
    ],

    // ── Pizza / Casual ──
    casual: [
      { name: "Golden Boy Pizza", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "North Beach, thick Sicilian-style slices since 1978, SF institution, eat standing on the street" },
      { name: "Outta Sight Pizza", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Creative Californian-style pizza, natural wine, one of SF's most interesting newer pizza spots" },
      { name: "Jules", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "French bistro, Nob Hill, classic execution, one of SF's most reliably good neighborhood restaurants" },
      { name: "Outerlands", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Outer Sunset, beach neighborhood restaurant, excellent brunch, cozy and warm, local institution" },
      { name: "Four Kings", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Bar and small plates, Mission, one of SF's most buzzed-about recent openings for late-night eating" },
      { name: "3rd Cousin", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Natural wine and creative small plates, one of SF's most interesting newer wine bars" },
      { name: "Gumbo Social", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Louisiana comfort food, Bayview, outstanding gumbo and po'boys, Creole cooking done right" },
      { name: "Piglet & Co", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Southeast Asian street food and natural wine, one of SF's more playful newer spots" },
    ],

    // ── Bakeries / Cafés ──
    bakery: [
      { name: "Breadbelly", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Asian-influenced bakery, Inner Richmond, excellent pastries and sandwiches, always a line" },
      { name: "Butter & Crumble", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Cake and pastry shop, one of SF's most beloved newer bakeries" },
      { name: "Cinderella Bakery & Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Russian bakery, Inner Richmond, pirozhki and borscht since 1953, SF institution" },
    ],

    // ── Bars ──
    bars: [
      { name: "True Laurel", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "David Barzelay's (Lazy Bear) cocktail bar, Mission, one of the best cocktail bars in the US, food is excellent too" },
      { name: "Trick Dog", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Mission, James Beard nominated cocktail bar, creative seasonal menus, SF institution" },
      { name: "Lunette", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Natural wine bar, one of SF's most interesting newer wine programs" },
      { name: "Prelude", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Wine bar and small plates, creative and thoughtful, newer entry making waves" },
    ],
  },


  "Sonoma County": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Cyrus", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Douglas Keane's Michelin 2-star comeback, Geyserville, one of the great Wine Country restaurants, exceptional tasting menu and wine pairings from Dry Creek Valley — $250-350+/person, serious special occasion" },
      { name: "Farmhouse Inn Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "hospitality"], notes: "Forestville, on-site inn and restaurant, Michelin-starred, rabbit rabbit rabbit dish is legendary, surrounded by redwoods and vineyards" },
      { name: "The Matheson", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Healdsburg, Dustin Valette's flagship, rooftop bar and main dining room, one of Healdsburg's most ambitious and complete restaurants" },
      { name: "Glen Ellen Star", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Ari Weiswasser's wood-fired Mediterranean in a tiny Glen Ellen storefront, one of Sonoma's most beloved and least pretentious fine dining experiences" },
      { name: "Hazel Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Healdsburg, seasonal and produce-driven, thoughtful wine list from surrounding appellations, one of the valley's most exciting newer rooms" },
    ],

    // ── Wine country casual / neighborhood ──
    wine_country: [
      { name: "Valley Bar and Bottle", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Glen Ellen, natural wine shop and intimate restaurant, one of the best low-key Wine Country dining experiences — locals and wine industry regulars" },
      { name: "Wit and Wisdom", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Healdsburg, wine-focused bar and restaurant, excellent by-the-glass program from Dry Creek and Alexander Valley producers" },
      { name: "Boon Eat + Drink", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Guerneville, Russian River Valley institution, farm-to-table in a relaxed setting, gateway to the redwoods and river" },
      { name: "The Spinster Sisters", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Santa Rosa, neighborhood restaurant done right, excellent brunch and dinner, local ingredients, warm room" },
      { name: "Campanella", signals: ["eater_38"], axis: ["freshness", "culinary_prestige"], notes: "Healdsburg, Italian-influenced, wood-fired cooking, one of the newer additions to Healdsburg's excellent dining scene" },
    ],

    // ── Mexican / Latin ──
    mexican: [
      { name: "El Molino Central", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Boyes Hot Springs, Karen Waikiki's legendary tacos and traditional Mexican cooking, local cult following, cash only, do not miss" },
      { name: "Mitote Food Park", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Santa Rosa, Mexican street food park, multiple vendors, vibrant and authentic, where locals go for tacos" },
    ],

    // ── Asian ──
    asian: [
      { name: "Khom Loi", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Healdsburg, Thai cooking with serious technique and Wine Country ingredient sourcing, one of the most interesting restaurants in the county" },
    ],

    // ── Casual / Pizza / Bakery ──
    casual: [
      { name: "Bijou", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Petaluma, one of the most exciting newer restaurants in the county, seasonal California cooking, excellent natural wine list" },
      { name: "Pizzaleah", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Healdsburg, Leah Scurto's pizza, creative and ingredient-focused, one of Wine Country's best casual meals" },
    ],
  },


  "Napa Valley": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Auro", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Four Seasons Napa, Rogelio Garcia's contemporary Mexican fine dining, one of Napa's most ambitious and exciting newer restaurants, exceptional wine program" },
      { name: "Press Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "St. Helena, wine-country steakhouse at its best, extraordinary Napa Cabernet list curated over decades, wood-fired meats, special occasion standard" },
      { name: "The Restaurant at North Block", signals: ["eater_38"], axis: ["culinary_prestige", "hospitality"], notes: "Yountville, Italian-inspired, beautiful room in the North Block hotel, thoughtful Napa-focused wine list, excellent for a long lunch or dinner" },
      { name: "Bear", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Napa's most talked-about recent openings, farm-to-table with serious technique, generating strong early buzz" },
      { name: "Entrecot Restaurant Napa", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "French bistro sensibility, focused on steak and wine pairings, one of Napa's more refined casual fine dining rooms" },
    ],

    // ── Wine bar / casual fine dining ──
    wine_bar: [
      { name: "Compline", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Napa, wine bar run by Master Sommeliers, extraordinary and accessible wine program, excellent food — where the wine industry drinks on nights off" },
      { name: "Zuzu", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Napa, Spanish tapas and Latin small plates, downtown institution, warm and lively, excellent sherry selection, one of Napa's most reliably fun restaurants" },
      { name: "Violetto", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Wine bar and small plates, Napa, natural wine focus, one of the valley's most interesting newer wine programs" },
      { name: "The Fink", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Downtown Napa, neighborhood bar and kitchen, unpretentious and excellent, locals' refuge from the tasting room circuit" },
    ],

    // ── Casual / Pizza / Tacos ──
    casual: [
      { name: "Croccante Pizza", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Napa, Neapolitan-style pizza done properly, one of the valley's best casual meals, excellent with a glass of local wine" },
      { name: "Mother's Tacos", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Napa, fresh and authentic Mexican tacos, local institution for a quick and excellent lunch" },
      { name: "Charlie's", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Calistoga, neighborhood diner and bar, unpretentious, where locals eat when they're not doing the wine country thing" },
      { name: "Stateline Road Smokehouse", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "American BBQ in Napa Valley — unusual and excellent, proper smoked meats, a welcome change from the tasting menu circuit" },
    ],

    // ── Asian ──
    asian: [
      { name: "Slanted Door", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Charles Phan's Vietnamese, relaunched in Napa after closing its SF Ferry Building location, James Beard winner, refined and excellent" },
    ],
  },


  "Monterey and Carmel": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Chez Noir", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Carmel-by-the-Sea, Jonny Black's intimate fine dining, James Beard nominated, one of the most exciting restaurants on the Central Coast, seasonal and precise" },
      { name: "Foray", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Carmel, creative contemporary, one of the most ambitious newer restaurants in the area, strong local sourcing" },
      { name: "Maligne", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Monterey, one of the most talked-about recent openings on the Peninsula, inventive and serious" },
      { name: "Passionfish", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Pacific Grove, sustainable seafood institution, Ted Walter's commitment to local and sustainable sourcing, one of the Peninsula's most reliable and beloved restaurants" },
      { name: "Edwin's Kaona Carmel", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Carmel, Hawaiian-influenced fine dining, one of the newer entries generating real buzz on the Peninsula" },
    ],

    // ── Wine bar / casual fine dining ──
    wine_bar: [
      { name: "Pearl Hour", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Monterey, intimate wine bar and small plates, excellent by-the-glass program focused on Santa Lucia Highlands and Central Coast producers, where locals drink" },
      { name: "Stationæry", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Monterey, wine bar and café, natural wine focus, one of the Peninsula's most interesting newer spots for a relaxed meal" },
      { name: "Captain and Stoker", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Coffee and cocktails, one of Monterey's most beloved neighborhood spots, excellent all-day" },
    ],

    // ── Asian ──
    asian: [
      { name: "Züm Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Carmel, serious omakase sushi, one of the better sushi options on the Central Coast, fresh local fish" },
      { name: "Jeju Kitchen", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Korean-influenced, one of the Peninsula's more interesting newer Asian restaurants" },
      { name: "Tommy's Wok", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Carmel, Chinese-American institution, locals' go-to for a casual and satisfying meal, longtime neighborhood staple" },
    ],

    // ── Mexican / Latin ──
    mexican: [
      { name: "El Cantaro", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Monterey, authentic Mexican, excellent tacos and regional dishes, local institution, great value" },
      { name: "Cafe Guarani", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "South American influenced, one of the Peninsula's more distinctive casual options" },
    ],

    // ── Casual / Pizza / Bakery ──
    casual: [
      { name: "Gianni's Pizza", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Carmel, pizza institution, straightforward and excellent, beloved by locals for decades" },
      { name: "Alta Bakery and Café", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Monterey, excellent pastries and coffee, one of the Peninsula's best morning stops" },
      { name: "Paprika Café", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Monterey, Middle Eastern and Mediterranean café, excellent hummus and kebabs, casual and reliable" },
      { name: "Alvarado Street Brewery", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Monterey, craft brewery and pub, excellent local beer program, good casual food, lively atmosphere" },
    ],
  },


  "Los Angeles": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Pasjoli", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Dave Beran's French bistro, Santa Monica, James Beard nominated, one of LA's most technically precise and satisfying restaurants, duck press is the signature" },
      { name: "Bavel", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Ori Menashe and Genevieve Gergis's Middle Eastern, Arts District, James Beard nominated, stunning space and food, one of LA's great restaurants" },
      { name: "Chi Spacca", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Nancy Silverton's salumi and meat-focused Italian, Melrose, James Beard nominated, Florentine steak and charcuterie are extraordinary" },
      { name: "Somerville", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of LA's most exciting newer tasting menu restaurants, serious and ambitious, generating strong critical attention" },
      { name: "Firstborn", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative contemporary, one of LA's most talked-about recent openings, inventive and technically accomplished" },
      { name: "Toranj", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Persian-influenced fine dining, one of LA's more distinctive and exciting newer restaurants, beautiful flavors" },
      { name: "Restaurant Ki", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese-influenced tasting menu, intimate and precise, one of LA's strongest newer omakase-style experiences" },
      { name: "Loreto", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mexican fine dining, one of LA's most important newer restaurants elevating regional Mexican cuisine with serious technique" },
    ],

    // ── Asian ──
    asian: [
      { name: "Anajak Thai Cuisine", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Sherman Oaks, Justin Pichetrungsi's Thai, James Beard winner, Sunday omakase is legendary, one of the best Thai restaurants in the US" },
      { name: "Holbox", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Mercado La Paloma, Gilberto Cetina's Yucatecan seafood, James Beard nominated, extraordinary ceviches and seafood tostadas, one of LA's best" },
      { name: "Bistro Na's", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "San Gabriel Valley, imperial Chinese cuisine, Peking duck and elaborate banquet dishes, one of the best Chinese restaurants in North America" },
      { name: "Mori Nozomi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of LA's most serious and refined Japanese restaurants, exceptional fish sourcing" },
      { name: "Hakata Izakaya HERO", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic Hakata-style Japanese izakaya, Torrance, tonkotsu ramen and yakitori, where the Japanese community eats" },
      { name: "Roasted Duck by Pa Ord", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai roasted duck, Hollywood, beloved institution, incredibly rich and satisfying, long lines worth it" },
      { name: "Seong Buk Dong", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean homestyle cooking, Koreatown, the kind of Korean food Korean families make at home, deeply comforting" },
      { name: "K-Team BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean BBQ, Koreatown, excellent quality meat and banchan, one of the better options in LA's extraordinary K-Town BBQ scene" },
      { name: "Pho Ngoon", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese pho, San Gabriel Valley, outstanding broth, one of LA's best Vietnamese restaurants" },
      { name: "A&J Seafood Shack", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Cantonese seafood, San Gabriel Valley, whole fish and live tank seafood, exceptional quality" },
    ],

    // ── Mexican / Latin ──
    mexican: [
      { name: "Taquería Frontera", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "East LA, exceptional tacos, James Beard-adjacent, the real deal for traditional Mexican street food in LA" },
      { name: "Tacos La Carreta", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Taco truck institution, beloved by locals, one of LA's most authentic late-night taco experiences" },
      { name: "Komal Molino", signals: ["eater_38"], axis: ["culinary_prestige", "authenticity_value"], notes: "Masa-focused Mexican, tortillas and tamales made with serious craft, one of LA's most important newer Mexican restaurants" },
      { name: "Carlitos Gardel Argentine Steakhouse", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Melrose, Argentine steakhouse institution, empanadas and asado, warm and convivial, beloved for decades" },
      { name: "Santa Canela", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Mexican, thoughtful and ingredient-focused, one of LA's more interesting newer takes on regional Mexican cuisine" },
      { name: "Si! Mon", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Venezuelan cuisine, West Hollywood, arepas and cachapas done right, one of the few genuinely excellent Venezuelan restaurants in the US" },
    ],

    // ── Italian / Pizza ──
    italian: [
      { name: "Apollonia's Pizzeria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Sicilian-style pizza, one of LA's best slices, busy and casual, neighborhood institution" },
      { name: "Pijja Palace", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Indian-inflected Italian, Silverlake, one of LA's most creative and talked-about restaurants, pasta with Indian spice profiles" },
    ],

    // ── American / Burgers / BBQ ──
    american: [
      { name: "Langer's Delicatessen", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "MacArthur Park, pastrami on rye is considered the best in the world by serious sandwich people, James Beard America's Classics award, cash only, weekdays best" },
      { name: "Howlin' Ray's Hot Chicken", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Chinatown, Nashville hot chicken done right, long lines, genuinely spicy, one of LA's most beloved casual restaurants" },
      { name: "Ray's Texas BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Texas-style BBQ in LA, brisket and ribs smoked properly, one of LA's best BBQ options" },
      { name: "Goldburger Los Feliz", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Smash burger institution, Los Feliz, one of LA's most beloved burger spots, simple and excellent" },
      { name: "Pann's Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Inglewood, 1950s Googie architecture, American diner classics, James Beard America's Classics nominated, a living piece of LA history" },
    ],

    // ── Wine / Cocktail bars ──
    bars: [
      { name: "Vin Folk", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar, one of LA's most interesting wine programs, excellent small plates to accompany" },
      { name: "Oy Bar", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar and small plates, Silver Lake, one of LA's most beloved neighborhood wine spots" },
      { name: "Jones Hollywood", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "West Hollywood, long-running bar and Italian-American food, industry crowd, reliably fun and unpretentious" },
      { name: "Two Hommés", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of LA's newer neighborhood bar concepts generating buzz, excellent cocktails and food" },
    ],

    // ── Vegetarian / Crossover ──
    vegetarian: [
      { name: "Crossroads Los Angeles", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Tal Ronnen's upscale plant-based, West Hollywood, the best argument for vegetarian fine dining in LA, excellent even for non-vegetarians" },
      { name: "Les Sisters'", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chatsworth, soul food and Southern cooking, James Beard America's Classics, beloved institution in the Valley" },
      { name: "Betsy", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "One of LA's newer neighborhood restaurants generating strong word of mouth, warm and ingredient-focused" },
    ],
  },


  "Orange County": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Knife Pleat", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "Tony Esnault's French fine dining, South Coast Plaza, Michelin-starred, one of the best restaurants in Southern California, exceptional wine list — special occasion, $150+/person" },
      { name: "Marche Moderne", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Florent and Amelia Marneau's French bistro, South Coast Plaza, James Beard nominated, one of OC's most reliable and accomplished restaurants" },
      { name: "Vaca", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Amar Santana's Spanish cuisine, Costa Mesa, James Beard nominated, excellent paella and charcuterie, one of OC's most vibrant dining rooms" },
      { name: "A Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Newport Beach institution, classic American fine dining, longtime special occasion standard for OC locals" },
      { name: "Selanne Steak Tavern", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Laguna Beach, Teemu Selanne's steakhouse with serious wine program, ocean-adjacent, one of OC's better upscale dining experiences" },
      { name: "Farmhouse at Roger's Gardens", signals: ["eater_38"], axis: ["culinary_prestige", "hospitality"], notes: "Corona del Mar, Richard Blais's farm-to-table in a stunning garden nursery setting, one of OC's most unique dining environments" },
      { name: "Mayfield", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Corona del Mar, intimate and ambitious, one of OC's most exciting newer fine dining rooms" },
      { name: "Fable & Spirit", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Laguna Beach, creative contemporary with ocean views, one of OC's more interesting newer restaurants" },
    ],

    // ── Asian ──
    asian: [
      { name: "Hana re", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase sushi, Irvine, one of Southern California's finest omakase experiences, exceptional fish sourcing" },
      { name: "Omakase by Gino", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate omakase, one of OC's most serious and exciting newer sushi experiences" },
      { name: "Ohshima", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, Garden Grove, exceptional ramen and izakaya dishes, where the Japanese community eats" },
      { name: "Mo Ran Gak", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean tofu house, Garden Grove, soon dubu jjigae done right, deeply authentic, beloved by the Korean community" },
      { name: "Garlic and Chives", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, Garden Grove, upscale Vietnamese with creative preparations, one of Little Saigon's most accomplished restaurants" },
      { name: "Brodard Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Little Saigon institution, nemesis rolls are legendary, one of the original and best Vietnamese restaurants in OC" },
      { name: "Banh Cuon Luu Luyen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese steamed rice rolls, Westminster, deeply authentic, a Little Saigon staple for decades" },
      { name: "Pho 79", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Garden Grove, one of the original and best pho restaurants in Little Saigon, James Beard America's Classics nominated" },
      { name: "A&J Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Taiwanese breakfast and noodles, Irvine, one of the best Taiwanese casual restaurants in Southern California" },
      { name: "Nep Café", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Vietnamese café and modern Vietnamese food, Fountain Valley, one of OC's most creative Vietnamese restaurants" },
      { name: "Nok's Kitchen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai home cooking, one of OC's most authentic and beloved Thai spots" },
      { name: "Chaak", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Yucatecan-inspired Mexican, one of OC's most interesting newer Mexican restaurants with serious technique" },
    ],

    // ── Middle Eastern / South Asian ──
    middle_eastern: [
      { name: "Khan Saab Desi Craft Kitchen", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Pakistani and South Asian, Anaheim, one of the most exciting South Asian restaurants in Southern California, creative and bold" },
      { name: "Adya", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Indian street food elevated, Anaheim, one of OC's best Indian restaurants, excellent chaat" },
      { name: "Al Baraka Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Halal Middle Eastern, Anaheim, deeply authentic, beloved by the local Middle Eastern community" },
      { name: "Kareem's Falafel", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Lebanese falafel institution, Anaheim, one of the best falafel in Southern California, cash only" },
      { name: "Yigah", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Israeli-influenced, one of OC's more interesting newer Mediterranean restaurants" },
    ],

    // ── Mexican ──
    mexican: [
      { name: "Taco Mesita", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Creative tacos, one of OC's most interesting newer taco concepts, quality ingredients and inventive combinations" },
      { name: "Mariscos El Yaqui", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Baja-style seafood, Anaheim, exceptional aguachile and ceviche, one of OC's best casual Mexican seafood spots" },
      { name: "Alta Baja Market", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Baja California and Alta California food cultures, Santa Ana, one of OC's most distinctive and creative casual spots" },
      { name: "Anepalco", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Mexican-influenced breakfast and brunch, Orange, creative and fresh, one of OC's most beloved daytime restaurants" },
    ],

    // ── BBQ / American ──
    bbq: [
      { name: "Heritage Barbecue", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "San Juan Capistrano, wood-smoked Texas-style BBQ, one of the best BBQ restaurants in Southern California, long lines on weekends" },
      { name: "Smoke Queen Barbecue", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean-influenced BBQ, one of OC's more creative takes on smoked meats" },
      { name: "Fat of the Land", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Whole animal butchery and cooking, one of OC's most ingredient-focused and serious restaurants" },
    ],

    // ── Pizza / Italian / Casual ──
    casual: [
      { name: "Fuoco Pizzeria Napoletana", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Neapolitan pizza, one of OC's best pizzerias, wood-fired and properly made" },
      { name: "Truly Pizza", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative California-style pizza, one of OC's most interesting newer pizza concepts" },
      { name: "Mario's Butcher Shop", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Italian deli and sandwiches, one of OC's best casual Italian spots, excellent charcuterie" },
      { name: "Katella Bakery, Deli & Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Los Alamitos, Jewish-style deli institution, pastrami and matzo ball soup, beloved OC institution for decades" },
      { name: "Hook and Anchor", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Seafood-focused casual, one of OC's better options for straightforward good fish" },
      { name: "The Parlor", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bar and kitchen, one of OC's more interesting neighborhood spots" },
    ],
  },


  "San Diego": {
    // ── Fine dining / special occasion ──
    fine_dining: [
      { name: "Addison Restaurant", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "William Bradley's Michelin 2-star, Del Mar, one of the best restaurants in California, French-California tasting menu, exceptional wine cellar — $300+/person, serious special occasion" },
      { name: "Callie", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Travis Swikard's Eastern Mediterranean, East Village downtown, one of San Diego's most exciting and complete restaurants, beautiful room" },
      { name: "Valle", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Claudette Zepeda's Mexican regional cuisine, Escondido, James Beard nominated, one of the most important restaurants in San Diego — celebrates specific Mexican regional traditions with precision" },
      { name: "Animae", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Asian-influenced contemporary, Little Italy, Brandon Hernández's ambitious cooking, one of SD's most visually stunning and technically accomplished restaurants" },
      { name: "Paradisaea", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate tasting menu, one of San Diego's most exciting newer fine dining rooms, serious and personal" },
      { name: "Kingfisher", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Southeast Asian fine dining, North Park, one of SD's most creative and talked-about newer restaurants" },
      { name: "Fort Oak", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wood-fired contemporary, Mission Hills, one of San Diego's most accomplished and consistent restaurants" },
      { name: "Herb & Wood", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Brian Malarkey's wood-fired Italian-California, Little Italy, beautiful room and reliable excellence" },
    ],

    // ── Seafood ──
    seafood: [
      { name: "George's at the Cove", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "La Jolla Cove, Trey Foshee's California cuisine, James Beard nominated, rooftop terrace has one of the best ocean views in San Diego — upstairs is casual, downstairs is fine dining" },
      { name: "The Fishery", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Pacific Beach, working fish market and restaurant, extremely fresh local seafood, casual and excellent — the real deal for San Diego fish" },
      { name: "Mabel's Gone Fishing", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Seafood-focused, one of SD's most interesting newer approaches to California coastal cooking" },
      { name: "Fish Guts", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Casual seafood, unpretentious and excellent, the kind of spot locals actually eat fish" },
      { name: "Serea Coastal Cuisine", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Ocean Beach, coastal California cooking with ocean views, one of SD's better combinations of setting and food quality" },
    ],

    // ── Japanese / Sushi ──
    japanese: [
      { name: "Soichi Sushi", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Chef Soichi Kadono's omakase, University Heights, James Beard nominated, one of the best sushi restaurants in Southern California, intimate counter experience" },
      { name: "Sushi Tadokoro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase in Ocean Beach, longtime SD sushi institution, exceptional fish sourcing, one of the originals" },
      { name: "Sushi Ichifuji", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Serious omakase, one of SD's finest Japanese experiences, precise and excellent" },
      { name: "Matsu", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese, one of SD's most ambitious and exciting newer Japanese restaurants" },
      { name: "Yakitori Tsuta", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic yakitori, one of SD's best Japanese casual restaurants, skewers done properly" },
    ],

    // ── Asian / Pacific ──
    asian: [
      { name: "Manna", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Korean fine dining, one of SD's most accomplished Korean restaurants, elevated and thoughtful" },
      { name: "Shan Xi Magic Kitchen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Northern Chinese, hand-pulled noodles and Xi'an-style dishes, one of SD's most authentic Chinese restaurants" },
      { name: "Meet Dumpling", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Handmade dumplings, one of SD's best for genuine Chinese dumpling craft" },
      { name: "Yiko Yiko", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "West African and global influences, one of SD's most interesting and distinctive newer restaurants" },
      { name: "Leu Leu", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Southeast Asian influenced, creative and vibrant, one of SD's more exciting newer spots" },
      { name: "Lilo", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Hawaiian-influenced, one of SD's more interesting takes on Pacific cooking" },
    ],

    // ── Mexican ──
    mexican: [
      { name: "Aqui Es Texcoco", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Barbacoa and consomé, National City, deeply authentic Texcoco-style lamb barbacoa, weekend only, one of the most important Mexican restaurants in San Diego" },
      { name: "Bosforo", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Baja-influenced Mexican, one of SD's most interesting casual Mexican spots drawing on cross-border culinary culture" },
    ],

    // ── Italian / Pizza ──
    italian: [
      { name: "Cesarina", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Roman-style pasta and pizza, Ocean Beach, Cesarina Mezzoni's home cooking made restaurant, one of SD's most beloved Italian spots" },
      { name: "Cori Pastificio Trattoria", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Handmade pasta, one of SD's best Italian restaurants, serious pasta craft in a warm neighborhood room" },
      { name: "Tribute Pizza", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "North Park, one of the best pizzas in San Diego, creative toppings on excellent dough" },
      { name: "Izola Bakery", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Italian bakery and café, excellent pastries and bread, one of SD's best morning stops" },
    ],

    // ── Bars / Wine / Cocktails ──
    bars: [
      { name: "Wormwood", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "North Park cocktail bar, one of SD's best and most creative cocktail programs, excellent bar snacks" },
      { name: "Kettner Exchange", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Little Italy, rooftop bar and restaurant, good cocktails and food, popular for a reason" },
      { name: "Mothership", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar, one of SD's most interesting wine programs" },
    ],

    // ── Casual / Bakery / Museum ──
    casual: [
      { name: "Wayfarer Bread & Pastry", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "La Jolla, outstanding sourdough and pastries, one of SD's best bakeries" },
      { name: "Tanner's Prime Burger", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Excellent smash burgers, one of SD's best casual burger spots" },
      { name: "Nine-Ten Restaurant and Bar", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "La Jolla, Jason Knibb's California cuisine, long-running and reliable, excellent for a classic La Jolla dining experience" },
      { name: "Artifact at Mingei", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Inside the Mingei International Museum in Balboa Park, one of SD's most interesting museum restaurants, excellent lunch destination" },
      { name: "Deckman's North at 3131", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Drew Deckman's Baja California cooking brought north, wood-fired and ingredient-driven, outstanding" },
    ],
  },


  "Palm Springs": {
    fine_dining: [
      { name: "Mister Parker's", signals: ["eater_38"], axis: ["culinary_prestige", "hospitality"], notes: "The Parker Palm Springs hotel restaurant, romantic and intimate, classic Palm Springs glamour, excellent cocktail program — special occasion in a mid-century setting" },
      { name: "Norma's", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "The Parker Palm Springs, legendary brunch, over-the-top breakfast dishes, one of the great American hotel brunches — plan to splurge" },
      { name: "Mr. Lyons", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Historic 1956 steakhouse, downtown Palm Springs, Rat Pack era atmosphere preserved, classic American steakhouse done well" },
    ],
    casual: [
      { name: "Cheeky's", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Weekend brunch institution, rotating weekly menu, long lines, the definitive Palm Springs breakfast — go early or wait" },
      { name: "Rooster and the Pig", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Vietnamese-influenced, downtown, one of Palm Springs' most beloved and creative casual restaurants" },
      { name: "Sherman's Deli and Bakery", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Jewish deli institution since 1963, pastrami and matzo ball soup, Palm Springs classic, beloved for decades" },
      { name: "Elmer's Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Casual American diner, longtime local institution, unpretentious and satisfying" },
      { name: "Delicias Mexican Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Traditional Mexican, local institution, one of Palm Springs' most authentic Mexican options" },
      { name: "Babe's Smokehouse and Tavern", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "BBQ and bar, casual and fun, solid smoked meats in a relaxed desert setting" },
      { name: "Blackbook", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar and small plates, one of Palm Springs' more interesting newer spots for an evening drink and snack" },
      { name: "Paul Bar/Food", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bar with serious food, one of Palm Springs' most talked-about newer casual spots" },
      { name: "Gabino's Creperie East", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Crepes and casual French-inspired, neighborhood spot beloved by locals" },
      { name: "Liv's Palm Springs", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "One of Palm Springs' newer neighborhood restaurants generating strong local buzz" },
      { name: "The Heyday", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Mid-century vibes and creative food, captures the retro Palm Springs aesthetic with good cooking" },
      { name: "Boozehounds", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Bar and casual food, dog-friendly patio, very Palm Springs in its laid-back social energy" },
    ],
    bakery: [
      { name: "Cartel Roasting Co.", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Excellent coffee roaster, one of the best morning stops in Palm Springs" },
      { name: "Peninsula Pastries Palm Springs", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "French pastries and café, one of Palm Springs' best bakeries" },
      { name: "Townie Bagels", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hand-rolled bagels, one of Palm Springs' best casual breakfast spots" },
    ],
  },

  "Santa Barbara": {
    fine_dining: [
      { name: "The Lark", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Funk Zone, Jason Paluska's California cuisine, James Beard nominated, anchor restaurant of Santa Barbara's food scene, excellent wine list from Santa Barbara County" },
      { name: "Loquita", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Spanish cuisine, State Street, one of Santa Barbara's most vibrant and accomplished restaurants, outstanding paella and sherry program" },
      { name: "Sama Sama Kitchen", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Indonesian-influenced, one of Santa Barbara's most creative and distinctive restaurants" },
      { name: "Bibi Ji", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Indian cuisine, Funk Zone, creative and bold, one of Santa Barbara's most exciting newer restaurants" },
      { name: "Dusk", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Wine bar and small plates, Funk Zone, excellent Santa Barbara County wine program, one of the better evening spots" },
      { name: "Bar Lou Montecito", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Montecito, upscale neighborhood bar and restaurant, where Montecito locals actually eat — Oprah-adjacent territory" },
      { name: "AMA Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase sushi, one of Santa Barbara's most serious Japanese restaurants" },
    ],
    mexican: [
      { name: "La Super-Rica Taqueria", signals: ["eater_38", "james_beard"], axis: ["authenticity_value", "trusted_authority"], notes: "Julia Child's favorite taco stand, James Beard America's Classics, cash only, line out the door, soft tacos and fresh masa — a genuine Santa Barbara pilgrimage" },
      { name: "Taqueria El Bajio", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic Mexican, beloved by locals, one of the more honest taquerias in town" },
      { name: "East Beach Tacos", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Casual beach tacos, exactly what it sounds like, good for a quick beachside meal" },
      { name: "Flor De Maiz", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Traditional Mexican with masa focus, one of Santa Barbara's more authentic Mexican options" },
      { name: "Lito's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Mexican institution, longtime local favorite, reliable and unpretentious" },
    ],
    casual: [
      { name: "Bettina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Montecito, creative Californian pizza and small plates, one of Santa Barbara's most beloved neighborhood restaurants, excellent natural wine list" },
      { name: "Lucky Penny", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Funk Zone, pizza and wine bar, casual and fun, one of the most popular spots in the Funk Zone" },
      { name: "Buena Onda", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Tacos and natural wine, Funk Zone, José Andrés-connected, one of SB's more creative casual spots" },
      { name: "The Daisy", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "All-day café and wine bar, one of Santa Barbara's most pleasant neighborhood spots" },
      { name: "Jonesy's Fried Chicken", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Fried chicken done right, casual and beloved, one of SB's best for a no-fuss satisfying meal" },
      { name: "Cold Spring Tavern", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Historic 1880s stagecoach stop in the Santa Ynez mountains, weekend tri-tip sandwiches, biker and hiker crowd, one of California's most atmospheric casual dining spots — worth the mountain drive" },
      { name: "Secret Bao", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Taiwanese bao and small plates, one of Santa Barbara's more distinctive Asian casual spots" },
      { name: "Lokum", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Turkish-Mediterranean influences, one of Santa Barbara's more interesting newer casual spots" },
      { name: "Chad's Café", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Neighborhood café, locals' breakfast and lunch, unpretentious and reliable" },
    ],
    bakery: [
      { name: "Alessia Patisserie and Café", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "French pastries, one of Santa Barbara's finest bakeries, beautiful croissants and tarts" },
      { name: "Kin Bakeshop", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Asian-influenced bakery, creative pastries, one of Santa Barbara's most interesting newer bakers" },
      { name: "IV Bagel Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Isla Vista (near UCSB), beloved bagel institution, worth the trip" },
      { name: "Santa Barbara Public Market", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Downtown food hall, multiple vendors, good for a casual lunch or quick bite, local producers" },
    ],
  },

  "Yosemite and Lake Tahoe": {
    // Note: 2023 list — may have some turnover
    lake_tahoe: [
      { name: "Edgewood Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Stateline, Edgewood Tahoe Resort, lake views and mountain setting, one of Lake Tahoe's best fine dining experiences — splurge-worthy for the setting alone" },
      { name: "Boathouse on the Pier", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Tahoe City, lakefront dining on the pier, one of the best combinations of setting and food quality on the North Shore" },
      { name: "Riva Grill on the Lake", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "South Lake Tahoe, waterfront, casual and fun, good for lunch on the water" },
      { name: "Artemis Lakefront Café", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Tahoe City, Greek-influenced, one of the more distinctive casual options on the North Shore" },
      { name: "Base Camp Pizza Co.", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "South Lake Tahoe, après-ski pizza institution, casual and satisfying after a day on the mountain" },
      { name: "Freshies Ohana Restaurant & Bar", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "South Lake Tahoe, Hawaiian-influenced, casual and fun, one of Tahoe's more distinctive casual spots" },
      { name: "Zephyr Cove Resort", signals: ["eater_38"], axis: ["populist", "local_authority"], notes: "South Shore, historic resort, lakefront setting, casual dining and beach access" },
    ],
    tahoe_casual: [
      { name: "The Divided Sky", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Tahoe's more interesting newer restaurants, creative and seasonal" },
      { name: "The Hangar – Taproom & Bottle Shop", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Craft beer and casual food, good selection of local and regional beers" },
      { name: "Coldwater Brewery and Grill", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Brewery and casual food, reliable après-ski or post-hike stop" },
      { name: "Taqueria Jalisco", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic Mexican, beloved by locals, one of Tahoe's better casual Mexican options" },
      { name: "Sprouts Café", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "South Lake Tahoe, healthy and casual, longtime local favorite for breakfast and lunch" },
      { name: "Bert's Café", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Diner-style breakfast, local institution" },
      { name: "Burger Lounge", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Quality burgers, casual, reliable stop" },
      { name: "My Thai Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai, one of Tahoe's better casual Asian options" },
    ],
  },

  "Oakland and East Bay": {
    fine_dining: [
      { name: "Commis", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "James Syhabout's Michelin 2-star, Piedmont Avenue Oakland, one of the best restaurants in Northern California, intimate tasting menu, James Beard winner — $200+/person, serious special occasion" },
      { name: "Burdell", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Tanya Holland-connected, Oakland, one of the most important newer restaurants in the East Bay, celebrating Black American culinary heritage" },
      { name: "Juanita & Maude", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Albany, intimate and accomplished, one of the East Bay's most reliably excellent neighborhood fine dining rooms" },
      { name: "Top Hatters Kitchen and Bar", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Jack London Square, creative and seasonal, one of Oakland's better upscale neighborhood restaurants" },
    ],
    asian: [
      { name: "Ramen Shop", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Rockridge Oakland, exceptional ramen from Chez Panisse alumni, James Beard nominated, one of the best ramen in Northern California" },
      { name: "Great China", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Berkeley, Peking duck and exceptional Cantonese cooking, James Beard nominated, one of the best Chinese restaurants in the Bay Area" },
      { name: "Soba Ichi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "West Oakland, handmade buckwheat soba, one of the most serious and accomplished Japanese restaurants in the East Bay" },
      { name: "Joodooboo", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Korean, one of the East Bay's most exciting newer Korean restaurants, creative and precise" },
      { name: "Good to Eat Dumplings & Modern Taiwanese Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Berkeley, handmade Taiwanese dumplings and noodles, one of the best Taiwanese casual restaurants in the Bay Area" },
      { name: "Gangnam Tofu Korean Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Soon dubu jjigae and Korean comfort food, one of the East Bay's most authentic Korean spots" },
      { name: "Tashi Delek Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Tibetan cuisine, Berkeley, one of the few genuinely good Tibetan restaurants in the Bay Area" },
      { name: "Funky Elephant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai, Berkeley, one of the most authentic and beloved Thai restaurants in the East Bay" },
      { name: "Vientian Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Laotian cuisine, Oakland, one of the few genuinely good Laotian restaurants in Northern California" },
      { name: "Banh Mi Ba Le", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese banh mi institution, Oakland, one of the best banh mi in the Bay Area" },
    ],
    global: [
      { name: "Wahpepah's Kitchen", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Crystal Wahpepah's Indigenous American cuisine, Fruitvale Oakland, James Beard winner, one of the only Indigenous fine dining restaurants in the country — important and delicious" },
      { name: "Café Colucci", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian, Oakland, one of the best Ethiopian restaurants in the Bay Area, injera and wats done beautifully" },
      { name: "Kendejah Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Liberian cuisine, Oakland, one of the only Liberian restaurants in the US, deeply flavored and community-rooted" },
      { name: "De Afghanistan Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Afghan cuisine, Fremont, one of the best Afghan restaurants in Northern California" },
      { name: "CocoBreeze Caribbean Restaurant and Bakery", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Caribbean comfort food and baked goods, one of Oakland's most beloved community restaurants" },
      { name: "Mama", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian, Oakland, family-run, excellent injera and community-rooted cooking" },
    ],
    mexican: [
      { name: "La Selva Taqueria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic Mexican taqueria, one of the East Bay's most reliable and beloved taco spots" },
      { name: "Tamaleria Azteca", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Tamale specialists, Oakland, handmade tamales, one of the best for traditional Mexican corn cooking" },
      { name: "Tacos Oscar", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Creative tacos, one of Oakland's most talked-about taco spots, inventive and delicious" },
      { name: "Taqueria El Paisa", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Fruitvale, authentic Mexican, one of the neighborhood institutions in Oakland's most vibrant Latino district" },
    ],
    casual: [
      { name: "Snail Bar", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar, Oakland, one of the East Bay's best wine programs, excellent snacks" },
      { name: "Standard Fare", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Berkeley, exceptional lunch counter, seasonal and ingredient-focused, one of the East Bay's most beloved daytime spots" },
      { name: "Ok's Deli", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Korean-influenced deli, one of Oakland's most creative and talked-about newer casual spots" },
      { name: "Range Life", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar and casual food, one of Oakland's most pleasant neighborhood spots" },
      { name: "Lulu", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Neighborhood restaurant, one of Oakland's most beloved casual dining rooms" },
      { name: "Rose Pizzeria", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Oakland, excellent pizza, neighborhood institution" },
      { name: "Bull Valley Roadhouse", signals: ["eater_38"], axis: ["local_authority", "hospitality"], notes: "Point Richmond, roadhouse-style bar and restaurant, one of the East Bay's most atmospheric casual spots" },
      { name: "Sailing Goat Restaurant", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Point Richmond waterfront, casual dining with bay views, one of the more scenic casual spots in the East Bay" },
    ],
    bakery: [
      { name: "Bake Sum", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Asian-American bakery, Oakland, one of the most exciting bakeries in the Bay Area, creative and exceptional" },
      { name: "Lovely's", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Pastries and café, one of Oakland's most beloved bakeries" },
      { name: "Saul's Restaurant and Delicatessan", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Berkeley, Jewish deli institution, pastrami and matzo ball soup, one of the Bay Area's best delis" },
      { name: "Babushka Market, Deli & Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Russian deli and café, one of the East Bay's most distinctive casual spots" },
      { name: "Sfizio", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Italian café, one of Oakland's better casual Italian spots" },
    ],
  },


  "Oahu": {
    fine_dining: [
      { name: "The Pig and the Lady", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Andrew Le's Vietnamese-influenced contemporary, Chinatown, James Beard nominated, one of Hawaii's most exciting and creative restaurants" },
      { name: "MW Restaurant", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Michelle Karr-Ueoka and Wade Ueoka's Hawaii regional cuisine, Ala Moana, James Beard nominated, one of Honolulu's most accomplished restaurants" },
      { name: "Mud Hen Water", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Ed Kenney's Kaimuki restaurant, James Beard nominated, celebrates Hawaii's multicultural food heritage with local ingredients" },
      { name: "Fete Hawaii", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Chinatown, one of Honolulu's most ambitious newer restaurants, farm-to-table with serious technique" },
      { name: "Arden Waikiki", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Waikiki, one of Hawaii's most exciting newer fine dining rooms, creative and seasonal" },
      { name: "Restaurant Suntory", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Japanese fine dining institution in Waikiki, one of Honolulu's longest-running and most accomplished Japanese restaurants" },
    ],
    hawaiian: [
      { name: "Helena's Hawaiian Food", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "authenticity_value"], notes: "Kalihi, James Beard America's Classics, traditional Hawaiian plate lunch — pipikaula short ribs and lomi salmon, cash only, closed weekends, a true Oahu pilgrimage" },
      { name: "Waiahole Poi Factory", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Windward side, fresh poi made on-site, laulau and traditional Hawaiian food, the real thing away from tourist Honolulu" },
      { name: "Liliha Bakery", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Local institution since 1950, coco puffs are legendary, local breakfast staples, open 24 hours — a Hawaii institution" },
      { name: "Zippy's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hawaii's beloved local chain, chili and saimin, the comfort food of every Hawaii childhood, open 24 hours — not fancy but deeply local" },
      { name: "Moke's Bread and Breakfast", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Kailua, lilikoi (passion fruit) pancakes are legendary, local breakfast institution, go early" },
    ],
    seafood: [
      { name: "Tanioka's Seafoods & Catering", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Waipahu, poke institution, locals drive across the island for this poke, one of Oahu's most beloved seafood markets" },
      { name: "Maguro Brothers", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Chinatown, bluefin tuna specialists, exceptional quality poke and sashimi, where serious fish people go" },
      { name: "GW Fins", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Actually in New Orleans list — see there" },
      { name: "Kyung's Seafood", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean seafood, beloved local spot, excellent seafood prepared Korean-style" },
      { name: "Da Seafood Cartel", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative seafood, one of Oahu's more interesting newer approaches to Hawaii's extraordinary fish" },
      { name: "Casamento's", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Actually New Orleans — see there" },
    ],
    asian: [
      { name: "Sushi Gyoshin", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase sushi, one of Oahu's finest Japanese experiences, exceptional fish in a serious counter setting" },
      { name: "Izakaya Uosan", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese izakaya, excellent robata and sake program, one of Honolulu's best casual Japanese spots" },
      { name: "Tonkatsu Tamafuji", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Japanese tonkatsu specialist, exceptional breaded pork cutlets, one of Oahu's best for this classic" },
      { name: "Fujiya Hawaii", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Japanese, Pearl City, beloved by the Japanese community, traditional home-style cooking" },
      { name: "Chengdu Taste", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Sichuan cuisine, one of Oahu's most authentic Chinese restaurants, proper mala flavors" },
      { name: "Pho To Chau", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinatown, Vietnamese pho institution, one of Honolulu's most beloved Vietnamese restaurants" },
      { name: "Olay's ahi Lao Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Laotian cuisine, one of the few genuinely good Laotian restaurants in Hawaii" },
      { name: "Tan Dinh", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Actually New Orleans — see there" },
      { name: "Hangang Korean Grill", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean BBQ, Koreana Plaza area, one of Oahu's best for authentic Korean grilling" },
      { name: "Inaba Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Japanese, local institution, home-style Japanese cooking beloved by Hawaii's Japanese community" },
      { name: "8 Fat Fat 8 Bar & Grille", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinese, Chinatown, authentic dim sum and Cantonese dishes, local institution" },
      { name: "Tadka Indian Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "One of Honolulu's better Indian restaurants, serving Hawaii's diverse South Asian community" },
      { name: "Yi Xin Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Taiwanese café and casual dining, one of Oahu's more authentic Taiwanese spots" },
      { name: "Le's Banh Mi", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese banh mi, one of Honolulu's best for a quick and excellent sandwich" },
    ],
    casual: [
      { name: "Turkey and the Wolf", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Actually New Orleans — see there" },
      { name: "Over Easy", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Kaimuki, brunch institution, creative breakfast dishes, long weekend lines, one of Oahu's most popular morning spots" },
      { name: "Morning Glass Coffee", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Manoa, excellent coffee and breakfast, beautiful valley setting, one of Honolulu's best morning experiences" },
      { name: "The Curb Kaimuki", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Kaimuki, neighborhood café and casual food, beloved local spot" },
      { name: "The Local General Store", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Local provisions and casual food, one of Oahu's more interesting neighborhood spots" },
      { name: "Pizza Mamo", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Chinatown, creative pizza with local ingredients, one of Honolulu's most talked-about casual restaurants" },
      { name: "Skull & Crown Trading Co.", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Chinatown bar and food, one of the more atmospheric spots in Honolulu's revitalized Chinatown" },
      { name: "Bar Maze", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Cocktail bar, one of Honolulu's best and most creative cocktail programs" },
      { name: "Bocconcino", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Italian, one of Oahu's better casual Italian spots" },
      { name: "The Lanai at Ala Moana Center", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Ala Moana, creative casual dining, one of the better food options in Hawaii's largest shopping center" },
      { name: "Chillest Shave Ice", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Shave ice done properly, natural flavors, one of Oahu's best for this Hawaii essential" },
      { name: "Ted's Bakery", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Sunset Beach, North Shore institution since 1987, the chocolate haupia cream pie is legendary — layers of chocolate and coconut cream pudding on a pastry crust, sold whole or by the slice. Plate lunches and sandwiches too, but the pie is the reason to come. One of the most beloved food stops on all of Oahu. On the way to or from Pipeline and Sunset Beach." },
    ],
  },

  "Las Vegas": {
    fine_dining: [
      { name: "Joel Robuchon", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "MGM Grand, Michelin 3-star, the late chef's masterwork, one of the finest French restaurants in America — $400+/person tasting menu, extraordinary special occasion" },
      { name: "e by Jose Andres", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "The Cosmopolitan, José Andrés's avant-garde tasting menu, 12 guests per night, one of the most exclusive dining experiences in Las Vegas — special occasion, $300+/person" },
      { name: "Partage", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Off-Strip French tasting menu, one of Las Vegas's most serious and accomplished restaurants away from the casino corridor" },
      { name: "Sparrow + Wolf", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Off-Strip, Brian Howard's globally-inspired tasting menu, James Beard nominated, one of Las Vegas's most creative and beloved local restaurants" },
      { name: "Carbone", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Aria, Mario Carbone's Italian-American, one of the most celebrated NYC imports on the Strip, spicy rigatoni is the dish — reservations essential" },
      { name: "Le Cirque", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "Bellagio, classic French fine dining institution, one of the grand dining rooms of Las Vegas — special occasion, $200+/person" },
      { name: "Wakuda Las Vegas", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Venetian, Tetsuya Wakuda's Japanese fine dining, one of Las Vegas's most exciting recent restaurant openings" },
      { name: "Mother Wolf Las Vegas", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Evan Funke's handmade pasta Roman trattoria, Resorts World, one of the best Italian restaurants on the Strip" },
      { name: "Stubborn Seed", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Off-Strip, Jeremy Ford's tasting menu, Top Chef winner, one of Las Vegas's most creative and personal restaurants" },
      { name: "Esme", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Actually Chicago — see there" },
    ],
    steakhouse: [
      { name: "Golden Steer", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Off-Strip, since 1958, Rat Pack and Sinatra era steakhouse, one of Las Vegas's most atmospheric and historic restaurants — old Vegas glamour intact" },
      { name: "Don's Prime", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Las Vegas's most accomplished newer steakhouses, serious beef program" },
      { name: "SW Steakhouse", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Wynn, lakefront setting, one of the Strip's better steakhouses with a beautiful room" },
      { name: "Bavette's Steakhouse & Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Park MGM, French steakhouse atmosphere, one of Las Vegas's most beloved steakhouse experiences" },
    ],
    casual: [
      { name: "Peppermill Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Off-Strip institution since 1972, 24-hour diner with spectacular retro décor, firepit lounge is iconic, the classic Las Vegas local experience" },
      { name: "Oyster Bar", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Palace Station, pan roast institution, one of Las Vegas's most beloved local seafood spots, locals only know about this one" },
      { name: "Bacchanal Buffet", signals: ["eater_38"], axis: ["trusted_authority", "populist"], notes: "Caesars Palace, the best buffet in Las Vegas, worth the experience once — 500+ dishes, $70+/person" },
      { name: "Howlin' Ray's", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Resorts World, Nashville hot chicken, same quality as the LA original" },
      { name: "Momofuku", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "The Cosmopolitan, David Chang's Las Vegas outpost, fried chicken and buns, one of the Strip's better casual-upscale options" },
      { name: "Sadelle's", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Bellagio, Major Food Group's all-day café, excellent bagels and smoked fish, beautiful room, one of the Strip's best brunch spots" },
      { name: "Bouchon", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "The Venetian, Thomas Keller's French bistro, consistently excellent, one of the most reliable dining experiences on the Strip" },
      { name: "Dominique Ansel Marche", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Dominique Ansel's Las Vegas pastry and café concept, excellent pastries and croissants" },
      { name: "Miznon", signals: ["eater_38"], axis: ["authenticity_value", "freshness"], notes: "Israeli street food, Resorts World, Eyal Shani's pita-focused casual concept, one of the more interesting casual options on the Strip" },
      { name: "Double Zero Pie & Pub", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Off-Strip, one of Las Vegas's better neighborhood pizza spots" },
      { name: "Delilah", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Wynn, supper club atmosphere, excellent food and entertainment, one of Las Vegas's most glamorous dining experiences" },
      { name: "Diner Ross", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Off-Strip diner, soul food and comfort classics, beloved local spot" },
      { name: "VIVA!", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Mexican, one of Las Vegas's more creative and exciting Mexican restaurants" },
      { name: "Casa Playa", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wynn, Mexican cuisine, excellent margaritas and coastal Mexican dishes in a beautiful beach-inspired setting" },
      { name: "Best Friend", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Park MGM, Roy Choi's Korean-American, one of Las Vegas's most creative and personal restaurant concepts" },
      { name: "NoMad Library", signals: ["eater_38"], axis: ["culinary_prestige", "hospitality"], notes: "Park MGM, beautiful library setting, excellent cocktails and food, one of Las Vegas's most atmospheric rooms" },
      { name: "No Pants at Absinthe", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Caesars, connected to the Absinthe show, late-night dining experience with theatrical energy" },
      { name: "Stanton Social Prime Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Resorts World, shared plates concept, one of the Strip's better group dining options" },
      { name: "Pisces Bar and Seafare", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Seafood-focused bar, one of Las Vegas's more interesting casual seafood spots" },
      { name: "Flanker Kitchen + Sports Bar", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Mandalay Bay, upscale sports bar, better food than expected, good for game days" },
      { name: "Jasmine", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Bellagio, Chinese fine dining, one of the most accomplished Chinese restaurants in Las Vegas" },
      { name: "Bar Centro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Cosmopolitan, cocktail bar with excellent small plates, one of Las Vegas's more sophisticated bar experiences" },
      { name: "Balla Italian Soul", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Venetian, Scott Conant's Italian, handmade pasta and soulful Italian cooking" },
      { name: "Chyna Club", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Asian-influenced, one of Las Vegas's newer and more interesting concepts" },
      { name: "Ocean Prime Las Vegas", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Seafood and steakhouse, reliable upscale dining on the Strip" },
    ],
  },

  "New Orleans": {
    fine_dining: [
      { name: "Commander's Palace", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Garden District, the crown jewel of New Orleans fine dining since 1893, where Emeril Lagasse and Paul Prudhomme trained, Saturday jazz brunch is iconic — $100+/person, essential New Orleans experience" },
      { name: "Coquette", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Garden District, Michael Stoltzfus's refined Louisiana cuisine, James Beard nominated, one of New Orleans's most accomplished and beloved restaurants" },
      { name: "Saint-Germain", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Bywater, tasting menu, one of New Orleans's most exciting newer fine dining rooms, serious and personal cooking" },
      { name: "Peche", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Warehouse District, Donald Link's Gulf seafood restaurant, James Beard winner, wood-fired and exceptional, one of the city's most important restaurants" },
      { name: "Brigtsen's Restaurant", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Riverbend, Frank Brigtsen's Creole cottage restaurant, James Beard winner, intimate and deeply personal Louisiana cooking" },
      { name: "Emeril's", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Warehouse District, Emeril Lagasse's flagship, James Beard winner multiple times, New Orleans Creole at its most refined" },
      { name: "Mamou", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of New Orleans's most exciting newer restaurants, creative and vibrant, generating strong buzz" },
      { name: "Dakar NOLA", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Senegalese fine dining, one of New Orleans's most important newer restaurants celebrating West African culinary heritage" },
      { name: "Luvi Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Vietnamese-influenced fine dining, one of New Orleans's most creative and ambitious newer restaurants" },
    ],
    creole_cajun: [
      { name: "Dooky Chase Restaurant", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Tremé, Leah Chase's legendary Creole restaurant, James Beard America's Classics, civil rights history within these walls — fried chicken and red beans are iconic, a New Orleans pilgrimage" },
      { name: "Li'l Dizzy's Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Tremé, soul food and Creole, neighborhood institution, excellent fried chicken and red beans and rice, where locals eat" },
      { name: "Liuzza's by the Track", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Mid-City near the Fair Grounds, po-boys and Creole comfort food, beloved neighborhood institution since 1947" },
      { name: "Casamento's", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Uptown, oyster bar institution since 1919, fried oyster loaf is legendary, tile walls, one of New Orleans's great historic restaurants — closed in summer" },
      { name: "Domilise's Po-Boy & Bar", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Uptown, po-boy institution since 1918, shrimp and roast beef, one of the most beloved sandwich shops in New Orleans history" },
      { name: "Atchafalaya", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Irish Channel, Louisiana cuisine in a beautiful Victorian house, brunch is exceptional, one of the city's most charming dining rooms" },
      { name: "Café Reconcile", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Central City, workforce training restaurant, excellent Creole lunch, meaningful community mission, po-boys and plate lunches" },
    ],
    global: [
      { name: "Turkey and the Wolf", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Irish Channel, Mason Hereford's creative sandwich shop, Bon Appétit Restaurant of the Year, James Beard nominated, collard green melt is legendary — lines out the door, worth every minute" },
      { name: "Fritai", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Haitian cuisine, one of New Orleans's most important restaurants celebrating Caribbean culinary heritage, griot and legumes are outstanding" },
      { name: "Mister Mao", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Uptown, Sophina Uong's globe-trotting creative cuisine, James Beard nominated, one of New Orleans's most fun and inventive restaurants" },
      { name: "Paladar 511", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mid-City, Latin American fine dining, one of New Orleans's most accomplished and underrated restaurants" },
      { name: "Origen Venezuelan Bistro", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Venezuelan, one of the few genuinely excellent Venezuelan restaurants in the Deep South" },
      { name: "Acamaya", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: ["Mexican seafood, one of New Orleans's most exciting newer restaurants, creative and vibrant"] },
      { name: "Afrodisiac", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Afro-Caribbean cuisine, one of New Orleans's most important newer restaurants celebrating the African diaspora's culinary influence on Louisiana cooking" },
      { name: "Queen Trini Lisa", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Trinidadian street food, one of New Orleans's most beloved casual spots for Caribbean cooking, doubles are outstanding" },
      { name: "Addis Nola", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian cuisine, one of New Orleans's best for injera and wats" },
      { name: "Jamila's Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Tunisian cuisine, one of the very few Tunisian restaurants in the US, deeply flavored and community-rooted" },
      { name: "Saffron", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Afghan cuisine, one of New Orleans's more distinctive and authentic global spots" },
      { name: "Wishing Town Restaurant & Bakery", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese bakery and restaurant, Gretna, one of the best Vietnamese spots in the greater New Orleans area" },
      { name: "Tan Dinh", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, Gretna, one of the most beloved Vietnamese restaurants in New Orleans, banh mi and pho done beautifully" },
      { name: "Vyoone's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative contemporary, one of New Orleans's newer fine dining rooms generating strong attention" },
      { name: "Zasu", signals: ["eater_38"], axis: ["freshness", "local_authority"], notes: "Japanese-influenced, one of New Orleans's more interesting newer restaurants" },
      { name: "Mais Arepas", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Venezuelan arepas, Marigny, beloved casual spot, fresh-made arepas with excellent fillings" },
    ],
    casual: [
      { name: "Bacchanal Fine Wine & Spirits", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Bywater, wine shop with outdoor courtyard and live music, rotating chefs make excellent small plates, one of the best casual experiences in New Orleans — go at sunset" },
      { name: "GW Fins", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "French Quarter adjacent, Gulf seafood at its finest, one of New Orleans's most consistently excellent and beloved seafood restaurants" },
      { name: "Stein's Market and Deli", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Uptown, Jewish deli institution, excellent sandwiches and provisions, one of New Orleans's most beloved neighborhood spots" },
      { name: "Munch Factory", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Mid-City, New Orleans comfort food, excellent brunch, beloved neighborhood spot" },
      { name: "Rosedale", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Bywater, neighborhood bar and restaurant, Creole comfort food, one of the most atmospheric casual spots in the city" },
      { name: "Chicken's Kitchen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Soul food and fried chicken, one of New Orleans's most beloved casual spots for Southern cooking" },
    ],
  },

  "Chicago": {
    fine_dining: [
      { name: "Alinea", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Grant Achatz's Michelin 3-star, Lincoln Park, one of the world's great restaurants, avant-garde tasting menu — $400+/person, book months ahead, a genuine once-in-a-lifetime experience" },
      { name: "Smyth", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "West Loop, John and Karen Urie Shields's Michelin 2-star, James Beard winners, farm-driven tasting menu of extraordinary precision and beauty — $250+/person" },
      { name: "Oriole", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "West Loop, Noah Sandoval's Michelin 2-star, James Beard winner, deeply personal tasting menu, one of Chicago's most intimate and accomplished restaurants — $300+/person" },
      { name: "Kasama", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Ukrainian Village, Genie Kwon and Tim Flores's Filipino-inspired bakery by day, tasting menu at night, James Beard winner, one of Chicago's most exciting restaurants" },
      { name: "Kyoten", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Omakase sushi, one of the best sushi restaurants in the Midwest, exceptional Japanese fish sourcing" },
      { name: "Galit", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Lincoln Park, Zach Engel's Middle Eastern, James Beard winner, hummus and wood-fired meats, one of Chicago's most vibrant and delicious restaurants" },
      { name: "Esme", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Intimate tasting menu, one of Chicago's most exciting newer fine dining rooms" },
      { name: "Monteverde", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "West Loop, Sarah Grueneberg's Italian, James Beard winner, handmade pasta of extraordinary quality, one of Chicago's most beloved restaurants" },
      { name: "Frontera Grill", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "River North, Rick Bayless's James Beard multiple winner, regional Mexican that changed American understanding of the cuisine, essential Chicago dining" },
      { name: "The Duck Inn", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Bridgeport, Kevin Hickey's neighborhood tavern elevated, James Beard nominated, duck duck duck cheeseburger is legendary" },
      { name: "HaiSous Vietnamese Kitchen", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Pilsen, Thai Dang's Vietnamese, James Beard nominated, one of Chicago's most accomplished and personal Vietnamese restaurants" },
      { name: "Hermosa Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Hermosa neighborhood, one of Chicago's most exciting newer restaurants, serious and ambitious" },
      { name: "Mirra", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Chicago's most talked-about newer fine dining concepts" },
      { name: "Maxwells Trading", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "West Loop, one of Chicago's most creative and accomplished newer restaurants" },
      { name: "Asador Bastian", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Basque-influenced wood-fired cooking, one of Chicago's most exciting newer restaurants" },
      { name: "Nadu", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "South Indian fine dining, one of Chicago's most important newer restaurants elevating regional Indian cuisine" },
      { name: "Perilla Korean American Steakhouse", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Korean-American steakhouse fusion, one of Chicago's most creative and talked-about newer concepts" },
      { name: "Mi Tocaya Antojeria", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Logan Square, Diana Dávila's regional Mexican antojitos, James Beard nominated, one of Chicago's most vibrant and delicious restaurants" },
      { name: "Rosemary", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Chicago's more interesting newer neighborhood restaurants" },
      { name: "Daisies", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Logan Square, Joe Frillman's vegetable-forward pasta restaurant, James Beard nominated, handmade pasta and excellent wine list" },
      { name: "Lula Café", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Logan Square, Jason Hammel's neighborhood landmark, James Beard nominated, farm-to-table before it was a phrase, beloved institution" },
      { name: "Carino", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Italian-influenced, one of Chicago's newer and more interesting neighborhood restaurants" },
    ],
    bbq_casual: [
      { name: "Calumet Fisheries", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "authenticity_value"], notes: "South Side, smoked fish institution since 1948, James Beard America's Classics, smoked shrimp and catfish from a shack on the Calumet River — a Chicago pilgrimage" },
      { name: "Virtue Restaurant", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Hyde Park, Erick Williams's Southern American, James Beard winner, one of Chicago's most important restaurants celebrating African American culinary heritage" },
      { name: "Harold's Chicken Shack", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "South Side institution, Harold Pierce's fried chicken chain, the definitive Chicago fried chicken experience, a city cultural landmark" },
      { name: "Carnitas Uruapan Restaurant", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "authenticity_value"], notes: "Pilsen, carnitas institution since 1975, James Beard America's Classics, slow-cooked pork sold by weight, cash only, weekend mornings only — a Chicago pilgrimage" },
      { name: "Sanders BBQ Supply Co.", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Chicago's most serious and accomplished BBQ restaurants, excellent smoked meats" },
      { name: "Johnnie's Beef", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Elmwood Park, Italian beef sandwich institution, dipped and sweet peppers, the authentic Chicago beef experience" },
      { name: "Birrieria Zaragoza Uptown", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Birria tacos and consomé, one of Chicago's most beloved Mexican casual spots" },
      { name: "Taqueria Chingon", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Creative tacos, one of Chicago's most talked-about newer taco concepts" },
      { name: "Akahoshi Ramen", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wicker Park, one of the best ramen restaurants in the Midwest, broth-focused and exceptional" },
      { name: "Mann's Cafeteria & Delicatessen", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Jewish deli tradition, one of Chicago's most beloved classic delicatessens" },
      { name: "Redhot Ranch", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chicago hot dog institution, Vienna beef done right, the authentic Chicago dog experience" },
      { name: "Al's #1 Italian Beef", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Taylor Street, the original Italian beef since 1938, dipped and hot giardiniera, a Chicago culinary birthright — one of America's great sandwiches" },
      { name: "Lou Malnati's", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Chicago deep dish institution, butter crust and sausage patty, the local favorite over Giordano's, multiple locations — order ahead, takes 45 minutes" },
      { name: "Portillo's", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Chicago institution, hot dogs and Italian beef, chocolate cake shake is legendary, the quintessential casual Chicago experience — every local goes here" },
      { name: "Gene & Jude's", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "River Grove, hot dog institution since 1946, no ketchup, no seat, depression dog with fries on top — the most authentic Chicago hot dog experience" },
      { name: "Pequod's Pizza", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Lincoln Park, caramelized cheese crust deep dish, arguably better than Lou Malnati's for the crust, long waits on weekends — book ahead" },
    ],
    bakery_casual: [
      { name: "Kasama", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "See fine dining — also exceptional Filipino-influenced pastries during the day" },
      { name: "Loaf Lounge", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Outstanding bread bakery, one of Chicago's most accomplished bakers, sourdough and pastries" },
      { name: "Del Sur Bakery", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Latin American bakery, one of Chicago's best for traditional pastries and bread" },
      { name: "Santa Masa Tamaleria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Handmade tamales, one of Chicago's most beloved for traditional Mexican corn cooking" },
      { name: "Pizz'Amici", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Roman-style pizza, one of Chicago's most accomplished pizzerias, teglia and pinsa done properly" },
      { name: "Brozeville Winery", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bronzeville, urban winery and restaurant, one of Chicago's most interesting neighborhood spots celebrating the South Side's Black cultural heritage" },
    ],
  },


  "Charleston": {
    fine_dining: [
      { name: "Chez Nous", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "French and Spanish rotating menu, no printed menu, intimate dining room, James Beard nominated, one of the most distinctive and excellent restaurants in the South" },
      { name: "The Ordinary", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Mike Lata's seafood hall in a former bank, James Beard winner, raw bar and beautifully prepared coastal seafood, one of Charleston's landmark restaurants" },
      { name: "Chubby Fish", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "James Beard nominated, creative seafood in a tiny space, one of Charleston's most exciting and personal restaurants, exceptional fish sourcing" },
      { name: "Vern's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative contemporary, one of Charleston's most talked-about newer restaurants, seasonal and ambitious" },
      { name: "Kwei Fei", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Sichuan-influenced, innovative and bold, one of Charleston's most exciting restaurants" },
      { name: "Maison", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "French-influenced fine dining, one of Charleston's more elegant newer restaurants" },
      { name: "Renzo", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian-influenced, natural wine focus, one of Charleston's most beloved neighborhood restaurants" },
      { name: "The Obstinate Daughter", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Sullivan's Island, creative coastal cuisine, worth the drive across the bridge, excellent wine list" },
    ],
    bbq_southern: [
      { name: "Rodney Scott's BBQ", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Rodney Scott's whole hog BBQ, James Beard winner Best Chef Southeast, the most important BBQ in South Carolina — slow-cooked over hardwood, the real deal" },
      { name: "King BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative BBQ, one of Charleston's most interesting newer takes on smoked meats" },
      { name: "Hannibal's Kitchen", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "East Side, Gullah-Geechee soul food, rice dishes, James Beard America's Classics nominated, one of the most culturally significant restaurants in Charleston" },
      { name: "Bertha's Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Gullah-Geechee tradition, home cooking, one of Charleston's most beloved neighborhood institutions" },
      { name: "Dave's Carry-Out", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "East Side, beloved neighborhood takeout, Gullah comfort food, the kind of place locals have been going for decades" },
    ],
    seafood: [
      { name: "167 Raw Oyster Bar", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Raw bar institution, rotating selection of East and West Coast oysters, one of Charleston's best for a casual oyster experience" },
      { name: "Marbled & Fin", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Steak and seafood, one of Charleston's more polished casual-upscale dining rooms" },
    ],
    asian: [
      { name: "Shiki", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Charleston's best for serious Japanese cooking" },
      { name: "Bintu Atelier", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "West African influenced, one of Charleston's most exciting and important newer restaurants" },
    ],
    casual: [
      { name: "Da Toscano Porchetta Shop", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Italian porchetta sandwiches, one of Charleston's most beloved casual lunch spots" },
    ],
  },

  "Nashville": {
    fine_dining: [
      { name: "Bastion", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "East Nashville, Josh Habiger's intimate tasting menu bar, James Beard nominated, one of Nashville's most creative and accomplished restaurants" },
      { name: "Folk", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "East Nashville, sourdough pizza and creative cuisine, James Beard nominated, one of Nashville's most beloved restaurants" },
      { name: "City House", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Germantown, Tandy Wilson's Southern Italian, James Beard winner, belly ham pizza is legendary, one of Nashville's landmark restaurants" },
      { name: "Locust", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Tasting menu, one of Nashville's most ambitious and exciting newer fine dining rooms" },
      { name: "Peninsula", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative contemporary, one of Nashville's most talked-about newer restaurants" },
      { name: "Yolan", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian fine dining, 1 Hotel Nashville, one of Nashville's most accomplished and elegant restaurants" },
      { name: "Tailor Nashville", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Vivek Surti's Indian-American tasting menu, James Beard nominated, one of the most personal and extraordinary restaurants in Nashville" },
      { name: "Lockeland Table", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "East Nashville neighborhood restaurant, seasonal and thoughtful, one of Nashville's most beloved community dining rooms" },
      { name: "Noko", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese-influenced, one of Nashville's most exciting newer restaurants" },
      { name: "S.S. Gai", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Thai, one of Nashville's most creative and accomplished Thai restaurants" },
      { name: "Kisser", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Nashville's most interesting newer wine bars with serious food" },
      { name: "Roze Pony", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Creative contemporary, one of Nashville's newer entries generating strong word of mouth" },
    ],
    hot_chicken: [
      { name: "Bolton's Spicy Chick & Fish", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "East Nashville, the most authentic hot chicken in the city, not a tourist operation — Dollywood-hot available, cash only, the real deal" },
      { name: "Shotgun Willie's BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Excellent BBQ, one of Nashville's most beloved casual smoked meat spots" },
    ],
    global: [
      { name: "International Market", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Thai food court institution, Nolensville Pike, multiple vendors, Shuangs Thai Kitchen is legendary, James Beard America's Classics nominated — a Nashville pilgrimage" },
      { name: "Degthai", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Thai, one of Nashville's most accomplished Thai restaurants" },
      { name: "Maiz De La Vida", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Mexican, masa-focused, one of Nashville's most authentic Mexican options" },
      { name: "East Side Banh Mi", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese banh mi, East Nashville, one of the city's most beloved casual Vietnamese spots" },
      { name: "VN Pho & Deli", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, one of Nashville's best for pho and Vietnamese comfort food" },
      { name: "Gojo Ethiopian Café and Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian, one of Nashville's best for injera and wats, community institution" },
      { name: "Riddim n Spice", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Caribbean, one of Nashville's most beloved spots for Caribbean cooking" },
      { name: "Edessa Restaurant Kurdish and Turkish Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Kurdish and Turkish, one of the few genuinely excellent Kurdish restaurants in the US" },
      { name: "King Tut's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Middle Eastern, one of Nashville's most authentic and beloved casual Middle Eastern spots" },
      { name: "Hai Woon Dai", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean BBQ, one of Nashville's best for authentic Korean grilling" },
      { name: "Xiao Bao", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinese, one of Nashville's better casual Chinese options" },
    ],
    casual: [
      { name: "Turkey and the Wolf Icehouse", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mason Hereford's Nashville outpost, same creative sandwich energy as the New Orleans original — collard green melt and other iconic sandwiches" },
      { name: "Big Al's Deli", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Soul food and deli, Nashville institution, excellent Southern comfort food" },
      { name: "Monell's", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Family-style Southern cooking, pass-the-bowl service, one of the most authentic Southern dining experiences in Nashville" },
      { name: "Wendell Smith's Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Soul food institution, Germantown, one of Nashville's most beloved neighborhood restaurants for Southern cooking" },
      { name: "Dino's Bar", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "East Nashville dive bar with excellent burgers, neighborhood institution, very un-touristy Nashville" },
      { name: "Bad Idea", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar and small plates, one of Nashville's more interesting newer wine spots" },
      { name: "Iggy's", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Neighborhood bar and food, one of Nashville's most beloved casual spots" },
      { name: "The Butter Milk Ranch", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative casual, one of Nashville's newer neighborhood favorites" },
    ],
    bakery: [
      { name: "FatBelly Pretzel Bakery & Deli", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Bavarian pretzels and deli sandwiches, one of Nashville's most distinctive casual food spots" },
      { name: "Sho Pizza Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Creative pizza, one of Nashville's most interesting newer pizza concepts" },
      { name: "St. Vito Focacceria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Focaccia sandwiches, one of Nashville's best Italian casual spots" },
      { name: "NY Pie", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "New York-style pizza, one of Nashville's best for a classic slice" },
      { name: "Little Hats Market", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Market and café, one of Nashville's more interesting neighborhood food spots" },
    ],
  },

  "Washington DC": {
    fine_dining: [
      { name: "Bresca", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "trusted_authority"], notes: "Ryan Ratino's Michelin 2-star, Dupont Circle, James Beard nominated, one of DC's most accomplished and creative tasting menu restaurants — $200+/person" },
      { name: "Albi", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Michael Rafidi's Levantine wood-fire restaurant, Wharf, James Beard nominated, one of DC's most exciting and important restaurants celebrating Arab cuisine" },
      { name: "Causa/Amazonia", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Carlos Delgado's Peruvian-Amazon tasting menu, James Beard nominated, one of DC's most adventurous and accomplished restaurants" },
      { name: "Pascual", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Mexican regional fine dining, one of DC's most important newer restaurants, serious and creative" },
      { name: "Imperfecto", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Enrique Limardo's Latin-Mediterranean, West End, creative and vibrant, one of DC's most exciting restaurants" },
      { name: "Moon Rabbit by Kevin Tien", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Vietnamese-American fine dining, Wharf, Kevin Tien's James Beard nominated personal cuisine, one of DC's most accomplished restaurants" },
      { name: "Oyster Oyster", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Plant-based and oyster-focused, Shaw, one of DC's most creative and environmentally thoughtful restaurants" },
      { name: "L'Avant-Garde", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "French fine dining, one of DC's most ambitious and polished newer restaurants" },
      { name: "SER Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Spanish, one of DC's most accomplished and exciting newer Spanish restaurants" },
      { name: "Dogon", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "West African fine dining, one of DC's most important newer restaurants celebrating African culinary heritage" },
      { name: "Ama", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of DC's newer and more talked-about fine dining concepts" },
      { name: "Centrolina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Amy Brandwein's Italian market and restaurant, CityCenterDC, James Beard nominated, handmade pasta and Italian excellence" },
    ],
    asian: [
      { name: "Thip Khao", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Seng Luangrath's Lao cuisine, Columbia Heights, James Beard nominated, the best Lao restaurant in the US, bold and authentic" },
      { name: "Anju", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Korean-American, Dupont Circle, James Beard nominated, creative and accomplished Korean cooking" },
      { name: "Tonari", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese-Italian, Penn Quarter, handmade pasta meets Japanese technique, one of DC's most creative concepts" },
      { name: "Kyojin Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase sushi, one of DC's finest Japanese experiences" },
      { name: "Joon", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Persian-influenced, one of DC's most interesting newer restaurants celebrating Middle Eastern cuisine" },
      { name: "Baan Siam", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Thai, one of DC's most accomplished Thai restaurants" },
      { name: "Mama Chang", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Melissa McCart and Peter Chang's Chinese restaurant, Fairfax VA, James Beard nominated, one of the best Chinese restaurants in the DC area" },
      { name: "Tapori", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Indian street food elevated, one of DC's most creative South Asian restaurants" },
      { name: "Lucky Danger", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinese-American takeout elevated, Penn Quarter, creative and delicious, one of DC's more fun casual concepts" },
    ],
    global: [
      { name: "Purple Patch", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Patrice Cleary's Filipino, Mount Pleasant, James Beard nominated, one of the most accomplished and personal Filipino restaurants in the US" },
      { name: "Elmina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "West African fine dining, one of DC's most important restaurants celebrating the African diaspora's culinary heritage" },
      { name: "Ceibo", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Latin American, one of DC's more exciting newer restaurants with serious technique" },
      { name: "Amparo Fondita", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mexican, one of DC's most accomplished and creative Mexican restaurants" },
      { name: "Cielo Rojo", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Mexican, one of DC's more authentic and beloved casual Mexican spots" },
      { name: "Casa Teresa", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Spanish, one of DC's newer and more interesting Spanish restaurants" },
      { name: "Karravaan", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Afghan cuisine, one of DC's best for Central Asian cooking" },
      { name: "Shia", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of DC's more interesting newer global cuisine restaurants" },
      { name: "Fish Shop", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Casual seafood, one of DC's more interesting neighborhood seafood spots" },
    ],
    bbq_casual: [
      { name: "2Fifty Texas BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Riverdale MD, Texas-style BBQ, brisket smoked properly, one of the best BBQ restaurants in the DC area" },
      { name: "Unconventional Diner", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Shaw, David Deshaies's creative diner concept, James Beard nominated, elevated comfort food in a diner setting" },
      { name: "Perry's Restaurant", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Adams Morgan rooftop, Sunday drag brunch is legendary, one of DC's most beloved brunch traditions" },
      { name: "The Occidental", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Pennsylvania Avenue, historic DC institution steps from the White House, power lunch territory since 1906, walls lined with political portraits" },
      { name: "J. Hollinger's Waterman's Chophouse", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mid-Atlantic seafood and chophouse, one of DC's more accomplished upscale casual spots" },
      { name: "Motorkat", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of DC's more interesting newer neighborhood bar and food concepts" },
      { name: "Aventino Cucina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of DC's more accomplished neighborhood Italian restaurants" },
      { name: "Cucina Morini", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, Wharf, solid handmade pasta in a waterfront setting" },
    ],
  },


  "Atlanta": {
    fine_dining: [
      { name: "Bacchanalia", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Anne Quatrano and Clifford Harrison's landmark, West Midtown, James Beard winners, farm-to-table before the term existed, Atlanta's most enduring fine dining institution — $150+/person" },
      { name: "Staplehouse", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Old Fourth Ward, Ryan Smith's tasting menu, James Beard nominated, proceeds support the Giving Kitchen — one of Atlanta's most accomplished and meaningful restaurants" },
      { name: "Lazy Betty", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Decatur, Ron Hsu's tasting menu, James Beard nominated, one of Atlanta's most creative and technically precise restaurants" },
      { name: "Gunshow", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Kevin Gillespie's roving cart service, Glenwood Park, James Beard nominated, chefs walk through the room offering dishes — one of Atlanta's most fun and accomplished dining experiences" },
      { name: "Miller Union", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Steven Satterfield's vegetable-driven Southern cuisine, West Midtown, James Beard winner, one of Atlanta's most beloved and important restaurants" },
      { name: "Atlas", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "St. Regis Atlanta, impeccable French-inspired fine dining, one of Atlanta's most elegant special occasion restaurants — $150+/person" },
      { name: "Aria", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Buckhead, Gerry Klaskala's long-running fine dining, one of Atlanta's most reliable and accomplished restaurants" },
      { name: "Little Bear", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Summerhill, one of Atlanta's most exciting newer fine dining rooms, creative and seasonal" },
      { name: "Avize", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Natural wine bar and tasting menu, one of Atlanta's most interesting newer concepts" },
      { name: "Mujo", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Omakase, one of Atlanta's most serious and accomplished Japanese fine dining experiences" },
    ],
    southern: [
      { name: "Busy Bee Café", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Soul food institution since 1947, MLK Jr. ate here, fried chicken and collard greens, James Beard America's Classics nominated — one of Atlanta's most historically significant restaurants" },
      { name: "Twisted Soul Cookhouse & Pours", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Kwame Onwuachi-influenced, Deborah VanTrece's globally-inspired soul food, James Beard nominated, one of Atlanta's most important and delicious restaurants" },
      { name: "Tassili's Raw Reality Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "West End, plant-based soul food, community institution in one of Atlanta's most historically significant African American neighborhoods" },
      { name: "Hen Mother Cookhouse", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Atlanta's most beloved neighborhood restaurants for Southern-influenced cooking" },
    ],
    global: [
      { name: "Talat Market", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Ponce City Market, Thai-American, Parnass Savang's creative cuisine, James Beard nominated, one of Atlanta's most exciting and personal restaurants" },
      { name: "Chai Pani", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Decatur, Meherwan Irani's Indian street food, James Beard winner, the most celebrated Indian casual restaurant in the South, bhel puri and dahi batata puri are revelatory" },
      { name: "Kamayan ATL", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Filipino, one of Atlanta's most important newer restaurants celebrating Filipino culinary heritage" },
      { name: "La Semilla", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Plant-based Mexican, one of Atlanta's most creative and accomplished plant-forward restaurants" },
      { name: "Tio Lucho's", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Peruvian, one of Atlanta's most accomplished Latin American restaurants" },
      { name: "Desta Ethiopian Kitchen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Little Ethiopia corridor, one of Atlanta's best Ethiopian restaurants, outstanding injera and wats" },
      { name: "Snackboxe Bistro", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Laotian, Chamblee, one of the best Laotian restaurants in the Southeast" },
      { name: "9292 Korean BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean BBQ, Doraville, one of Atlanta's best in a metropolitan area with an extraordinary Korean food scene" },
      { name: "LanZhou Ramen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hand-pulled Lanzhou beef noodles, one of Atlanta's most authentic Chinese noodle shops" },
      { name: "Delbar Middle Eastern", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Persian-influenced, Ponce City Market, beautiful room and food, one of Atlanta's best Middle Eastern restaurants" },
    ],
    italian: [
      { name: "BoccaLupo", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Bruce Logue's handmade pasta, Inman Park, one of Atlanta's most beloved Italian restaurants, intimate and consistently excellent" },
      { name: "Antico Pizza Napoletana", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Georgia Tech area, Giovanni Di Palma's Neapolitan pizza, one of the best pizzas in the South — communal tables, no reservations, cash preferred" },
    ],
    bars_casual: [
      { name: "Kimball House", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Decatur, oyster bar in a Victorian train depot, one of Atlanta's best for raw bar and cocktails, excellent absinthe program" },
      { name: "Ticonderoga Club", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Krog Street Market, cocktail bar with excellent snacks, one of Atlanta's most beloved neighborhood bars" },
      { name: "Southern Belle", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Grant Park, feminist bar with excellent food, one of Atlanta's most interesting neighborhood spots" },
      { name: "Poor Hendrix", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar and small plates, one of Atlanta's more interesting newer spots" },
      { name: "Park Tavern", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Piedmont Park waterfront, excellent beer garden and views, one of Atlanta's best outdoor bar settings" },
      { name: "Highland Tap", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Virginia-Highland, steakhouse institution, one of Atlanta's most reliable longtime restaurants" },
      { name: "Lucian Books and Wine", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Brookhaven, bookstore and wine bar, one of Atlanta's most charming neighborhood spots" },
      { name: "Minhwa Spirits", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Korean-inspired cocktail bar, one of Atlanta's most creative and distinctive bar experiences" },
      { name: "NFA Burger", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Creative smash burgers, one of Atlanta's most talked-about casual spots" },
      { name: "Daily Chew", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Healthy casual, one of Atlanta's more interesting neighborhood lunch spots" },
      { name: "The Chastain", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Buckhead, gastropub with excellent food, one of Atlanta's more reliable upscale casual spots" },
      { name: "Heirloom Market BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Korean-influenced BBQ, Smyrna, one of the most creative and delicious BBQ restaurants in Atlanta" },
    ],
  },

  "Florida Keys and Key West": {
    fine_dining: [
      { name: "Café Marquesa", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Key West, intimate fine dining, one of the Keys' most accomplished restaurants, beautiful historic building" },
      { name: "Little Pearl", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Key West, one of the most exciting newer fine dining rooms in the Keys, creative and seasonal" },
      { name: "Bagatelle", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Key West, beautiful historic mansion, Caribbean-influenced cuisine, one of Key West's most atmospheric restaurants" },
      { name: "Matt's Stock Island Kitchen & Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Stock Island, the working waterfront away from tourist Key West, excellent seafood and creative cooking in an authentic setting" },
      { name: "Amara at Paraiso", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Actually Miami — see there" },
    ],
    seafood_casual: [
      { name: "B.O.'s Fish Wagon", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Key West institution, ramshackle seafood shack, fried fish sandwiches and conch fritters, exactly what Key West casual should be — cash only" },
      { name: "Eaton Street Seafood Market & Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Key West, fish market with excellent prepared seafood, fresh local fish done simply, one of the best casual seafood spots in the Keys" },
      { name: "Southernmost Beach Café", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Key West beachfront, casual seafood with Atlantic views, the most scenic casual dining spot in Key West" },
      { name: "Garbo's Grill", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Key West food truck turned restaurant, Korean-Mexican fusion tacos, beloved local institution" },
      { name: "Onlywood Grill", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Wood-fired cooking, one of the Keys' more interesting casual spots" },
    ],
    casual: [
      { name: "El Siboney Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Key West, Cuban home cooking, ropa vieja and black beans and rice, one of the most authentic Cuban restaurants in the Keys" },
      { name: "Blue Heaven", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Key West, outdoor dining under the trees, roosters wandering through, brunch is legendary, Hemingway boxing ring still on site — very Key West" },
      { name: "Santiago's Bodega", signals: ["eater_38"], axis: ["local_authority", "authenticity_value"], notes: "Key West, tapas and wine, intimate and casual, one of the more charming spots off the tourist corridor" },
      { name: "Misohappy", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Key West, Japanese, one of the Keys' more interesting Asian casual spots" },
      { name: "Kermit's Key West Key Lime Shoppe", signals: ["eater_38"], axis: ["trusted_authority", "populist"], notes: "Key lime pie on a stick, the iconic Key West souvenir food, worth it — frozen, dipped in chocolate" },
    ],
  },

  "Miami": {
    fine_dining: [
      { name: "Boia De", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Allapattah, Alex Meyer and Luciana Giangrandi's intimate Italian, James Beard nominated, one of Miami's most exciting and beloved restaurants — handmade pasta, natural wine" },
      { name: "Cote", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Miami Beach, Korean steakhouse, Michelin-starred NYC import, one of Miami's finest special occasion restaurants — dry-aged beef and banchan" },
      { name: "Stubborn Seed", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "South Beach, Jeremy Ford's Top Chef-winning tasting menu, James Beard nominated, one of Miami's most accomplished and creative fine dining rooms" },
      { name: "The Surf Club Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Surfside, Thomas Keller's restaurant in a historic 1930s club, one of Miami's most elegant and accomplished dining rooms — special occasion" },
      { name: "Ariete", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Coconut Grove, Michael Beltran's Cuban-American, James Beard nominated, one of Miami's most personal and excellent restaurants" },
      { name: "Maty's", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Allapattah, Michael Beltran's seafood-focused sibling to Ariete, James Beard nominated, one of Miami's best for coastal Latin seafood" },
      { name: "Sushi by Scratch Restaurants: Miami", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Omakase, one of Miami's finest Japanese dining experiences, exceptional fish sourcing" },
      { name: "Makoto", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Bal Harbour, Makoto Okuwa's Japanese, one of Miami's most polished and accomplished Japanese restaurants" },
      { name: "LPM Miami", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Brickell, French Mediterranean, beautiful room and excellent food, one of Miami's most reliable fine dining experiences" },
      { name: "Amara at Paraiso", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Edgewater, Michael Beltran's Cuban-American waterfront restaurant, Biscayne Bay views, one of Miami's most beautiful settings with excellent food" },
      { name: "Mother Wolf Miami", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Evan Funke's handmade pasta Roman trattoria, Miami Beach, same quality as the Las Vegas original" },
    ],
    latin: [
      { name: "Versailles", signals: ["local_knowledge"], axis: ["trusted_authority", "local_authority"], notes: "Little Havana institution since 1971, the living room of the Cuban exile community, Cuban sandwiches and coffee, very much not tourist-facing despite the crowds — essential Miami" },
      { name: "Joe's Stone Crab", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "South Beach, stone crab institution since 1913, James Beard America's Classics, seasonal October-May, no reservations, the definitive Miami dining experience" },
      { name: "Café La Trova", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Little Havana, Miami's cocktail bar of the year, Michelle Bernstein and Julio Cabrera's Cuban-inspired, James Beard nominated, daiquiris and mojitos at their finest" },
      { name: "El Rey De Las Fritas", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Little Havana, Cuban frita burger institution, the most authentic friteras in Miami, cash only" },
      { name: "Caracas Bakery Biscayne", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Venezuelan bakery, excellent pan de jamon and cachitos, one of Miami's best for Venezuelan baked goods" },
      { name: "Clive's Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Jamaican, Little Haiti area, one of Miami's most beloved and authentic Caribbean casual spots" },
      { name: "Recoveco", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Spanish, one of Miami's most interesting newer Spanish restaurants" },
      { name: "Mandolin Aegean Bistro", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Design District, Greek and Turkish, beautiful courtyard, one of Miami's most charming and consistent restaurants" },
      { name: "Osaka Miami", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Nikkei cuisine (Japanese-Peruvian), Brickell, one of Miami's most creative and accomplished fusion restaurants" },
      { name: "Los Felix Miami", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Creative Mexican, one of Miami's most exciting newer Mexican restaurants" },
      { name: "Taquiza", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Blue corn tacos, South Beach, one of Miami's most authentic and beloved taco spots" },
    ],
    global: [
      { name: "Ghee Indian Kitchen", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Roop Mehan's Indian, Coconut Grove, James Beard nominated, one of the best Indian restaurants in Florida, refined and bold" },
      { name: "Niu Kitchen", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Catalan cuisine, Downtown Miami, one of Miami's most accomplished and underrated restaurants" },
      { name: "Zitz Sum", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Modern dim sum, one of Miami's most creative takes on Chinese dumpling culture" },
      { name: "Tam Tam", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Miami's more interesting newer global cuisine restaurants" },
      { name: "Edan Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Israeli-influenced, one of Miami's newer and more talked-about casual fine dining spots" },
      { name: "Motek", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Israeli street food, one of Miami's best for hummus, sabich, and falafel" },
    ],
    casual: [
      { name: "Apocalypse BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Miami's most serious and accomplished BBQ restaurants, excellent smoked meats" },
      { name: "Mignonette", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Edgewater, oyster bar and seafood, one of Miami's best for raw bar and casual upscale seafood" },
      { name: "Macchialina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "South Beach, Italian, one of Miami Beach's most reliable and beloved Italian restaurants" },
      { name: "Luca Osteria", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Miami's more accomplished casual Italian spots" },
      { name: "Bouchon Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Thomas Keller's French bistro at the Breakers, one of Miami's most reliable upscale casual experiences" },
      { name: "Palma", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Coconut Grove, all-day Mediterranean, one of Miami's most pleasant outdoor casual dining spots" },
      { name: "Miami Slice", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "NYC-style pizza, one of Miami's best for a classic slice" },
      { name: "Klaw Miami", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Seafood, one of Miami's more interesting newer casual seafood spots" },
    ],
    bakery: [
      { name: "Zak the Baker", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wynwood, exceptional sourdough and pastries, Jewish deli and bakery, one of Miami's best bakeries" },
      { name: "El Bagel", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Montreal-style boiled bagels, one of Miami's most beloved casual breakfast spots" },
      { name: "OFF SITE Nano Brewery", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Craft brewery, one of Miami's more interesting nano-brewery experiences" },
    ],
  },


  "Phoenix and Scottsdale": {
    fine_dining: [
      { name: "Kai Restaurant", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Gila River Indian Community, Michelin-starred, the only Forbes 5-Star restaurant in Arizona, Native American ingredients and traditions elevated to fine dining — $250+/person, extraordinary and unique" },
      { name: "Christopher's at the Wrigley Mansion", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Historic 1930 Wrigley mansion, Christopher Gross's French-influenced cuisine, sweeping Phoenix views, one of Arizona's most romantic and accomplished fine dining rooms" },
      { name: "Pizzeria Bianco", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Chris Bianco's legendary wood-fired pizza, James Beard winner, considered among the best pizzas in America, Heritage Square — long waits but worth every minute" },
      { name: "FnB Restaurant", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Scottsdale, Charleen Badman's vegetable-forward Arizona cuisine, James Beard winner, one of the most accomplished and beloved restaurants in the Southwest" },
      { name: "Valentine", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Phoenix, one of the most exciting newer fine dining rooms in the city, creative and ambitious" },
      { name: "Course Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Tasting menu, one of Phoenix's most serious and accomplished newer restaurants" },
      { name: "Bacanora", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Sonoran Mexican, wood-fired, one of Phoenix's most important restaurants celebrating border cuisine" },
      { name: "Latha", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Phoenix's most exciting newer restaurants, creative and personal cooking" },
    ],
    mexican: [
      { name: "Tacos Chiwas", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chihuahua-style tacos, one of Phoenix's most authentic and beloved taqueria experiences" },
      { name: "Casa Corazon Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mexican regional, one of Phoenix's more accomplished and creative Mexican restaurants" },
      { name: "Chilte", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Regional Mexican with serious technique, one of Phoenix's most interesting newer Mexican restaurants" },
      { name: "El Caprichoso Hot Dogs", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Sonoran hot dogs wrapped in bacon, a Phoenix and Tucson institution, one of the Southwest's most distinctive street foods" },
      { name: "Mariscos Playa Hermosa", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Sinaloa-style seafood, ceviche and aguachile, one of Phoenix's most authentic Mexican seafood spots" },
      { name: "Huarachis Taqueria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Huaraches and traditional Mexican antojitos, one of Phoenix's most authentic casual Mexican spots" },
      { name: "Pa'la", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Lebanese-influenced, one of Phoenix's most interesting newer casual restaurants" },
    ],
    asian: [
      { name: "Hana Japanese Eatery", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Phoenix's most accomplished and beloved Japanese restaurants, serious fish sourcing" },
      { name: "Glai Baan", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Thai, one of Phoenix's most creative and accomplished Thai restaurants" },
      { name: "Lom Wong", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Thai, one of Phoenix's best for authentic regional Thai cooking" },
      { name: "Pho 43", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese pho, one of Phoenix's most beloved Vietnamese restaurants" },
      { name: "The Stone Tofu House", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean tofu house, soon dubu jjigae, one of Phoenix's best for authentic Korean comfort food" },
      { name: "Ban Chan", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean, one of Phoenix's more authentic Korean casual spots" },
      { name: "Indibar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Indian, one of Phoenix's most accomplished Indian restaurants" },
      { name: "Feringhee Modern Indian Cuisine", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Modern Indian, one of Phoenix's more creative Indian restaurants" },
    ],
    global: [
      { name: "City of Spice", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Phoenix's most interesting newer global cuisine restaurants" },
      { name: "Hai Noon", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Phoenix's more talked-about newer restaurants, creative and vibrant" },
      { name: "Café Lalibela Ethiopian Cuisine", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ethiopian, one of Phoenix's most beloved Ethiopian restaurants" },
      { name: "Haji-Baba", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Middle Eastern market and restaurant, Phoenix institution, excellent hummus and shawarma" },
    ],
    casual: [
      { name: "Little Miss BBQ-University", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Texas-style BBQ, one of the best BBQ restaurants in Arizona, brisket and sausage, long lines on weekends" },
      { name: "Andreoli Italian Grocer", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Scottsdale, Italian grocer and deli, Giovanni Scorzo's imported Italian products and excellent sandwiches, one of the Southwest's best Italian casual spots" },
      { name: "Chula Seafood Uptown", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Seafood market and restaurant, one of Phoenix's best for fresh and well-prepared fish" },
      { name: "Nelson's Meat + Fish", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Butcher and fish counter with restaurant, one of Phoenix's best for quality ingredients and simple preparation" },
      { name: "Kid Sister", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Phoenix's most beloved newer casual spots, creative and fun" },
      { name: "Saint Pasta", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Handmade pasta, one of Phoenix's best for Italian casual dining" },
      { name: "Mister Pio", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Phoenix's newer and more interesting neighborhood restaurants" },
      { name: "DiMaggio's", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Italian-American institution, longtime Phoenix favorite, reliable and beloved" },
      { name: "Bad Jimmy's", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bar and casual food, one of Phoenix's more fun neighborhood spots" },
      { name: "Stoop Kid", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Natural wine bar and small plates, one of Phoenix's more interesting newer wine spots" },
    ],
  },

  "Austin": {
    fine_dining: [
      { name: "Olamaie", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Michael Fojtasek's Southern fine dining, James Beard nominated, one of Austin's most accomplished and elegant restaurants, biscuits are legendary" },
      { name: "Uchiko", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Paul Qui's Japanese-influenced, James Beard winner, one of Austin's most exciting and accomplished restaurants, excellent omakase and à la carte" },
      { name: "Birdie's", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Tracy Malechek-Ezekiel's wine bar and small plates, James Beard nominated, one of Austin's most beloved and creative restaurants" },
      { name: "Foreign & Domestic", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Ned Elliott's neighborhood restaurant, Hyde Park, creative and seasonal, one of Austin's most consistently excellent" },
      { name: "Odd Duck", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Bryce Gilmore's farm-to-table, James Beard nominated, South Lamar, one of Austin's most important and beloved restaurants" },
      { name: "Intero", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, East Austin, handmade pasta, one of Austin's most accomplished Italian restaurants" },
      { name: "Red Ash", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Wood-fired Italian, one of Austin's most interesting newer Italian restaurants" },
      { name: "Canje", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Kevin Fink and Tavel Bristol-Joseph's Caribbean, James Beard nominated, one of Austin's most exciting and culturally important newer restaurants" },
      { name: "Nixta Taqueria", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Edgar Rico's masa-focused tacos, James Beard nominated, one of Austin's most important restaurants for corn and Mexican culinary tradition" },
      { name: "Dai Due", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Jesse Griffiths's hunter-gatherer butcher shop and restaurant, James Beard nominated, wild game and Texas ingredients, one of Austin's most original concepts" },
      { name: "Fabrik", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Tasting menu, one of Austin's more ambitious newer fine dining rooms" },
    ],
    bbq: [
      { name: "La Barbecue", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "East Austin, brisket and beef ribs, LeAnn Mueller's pit, one of Austin's best BBQ spots with shorter lines than Franklin" },
      { name: "LeRoy & Lewis", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Evan LeRoy's creative BBQ, new Texas BBQ tradition, beef cheeks and birria, one of Austin's most innovative BBQ spots" },
      { name: "Distant Relatives", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Damien Brockway's African American BBQ tradition, James Beard nominated, one of the most important newer BBQ restaurants in Austin" },
    ],
    mexican: [
      { name: "Fonda San Miguel", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Interior Mexican cuisine since 1975, North Loop, beautiful hacienda dining room, Sunday brunch buffet is legendary, one of Austin's most beloved restaurants" },
      { name: "Este", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Seafood-focused Mexican, East Austin, one of Austin's most creative and accomplished Mexican restaurants" },
      { name: "Ensenada ATX", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Baja-style seafood, one of Austin's most exciting newer Mexican seafood spots" },
      { name: "Veracruz All Natural", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Breakfast taco food truck institution, migas taco is legendary, the quintessential Austin breakfast experience" },
      { name: "Joe's Bakery & Coffee Shop", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "East Austin, Tex-Mex institution since 1968, breakfast tacos and migas, one of Austin's most beloved neighborhood institutions" },
      { name: "Mercado Sin Nombre", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Mexican market and restaurant, one of Austin's more creative and interesting newer Mexican concepts" },
    ],
    asian: [
      { name: "Kome", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese izakaya, North Loop, one of Austin's most beloved and accomplished Japanese restaurants" },
      { name: "Dee Dee", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Lakana Trubiana's Thai, East Austin, James Beard nominated, one of Austin's most exciting and personal Thai restaurants" },
      { name: "P Thai's Khao Man Gai & Noodles", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai poached chicken and rice, one of Austin's most authentic and beloved Thai casual spots" },
      { name: "Lao'd Bar", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Laotian, one of Austin's most distinctive and beloved global casual restaurants" },
      { name: "KG BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Egyptian-style BBQ, one of Austin's most distinctive and interesting global casual spots" },
      { name: "Korea House", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean, one of Austin's most authentic and beloved Korean restaurants" },
      { name: "House of Three Gorges", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinese, one of Austin's more authentic Chinese restaurants" },
      { name: "Himalaya Kosheli Nepali & Indian", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Nepali and Indian, one of Austin's most distinctive and authentic South Asian restaurants" },
      { name: "Usta Kababgy", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Uzbek cuisine, one of the few genuinely excellent Central Asian restaurants in Texas" },
    ],
    casual: [
      { name: "Bufalina Due", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Neapolitan pizza, one of Austin's best pizzerias, excellent dough and toppings" },
      { name: "Allday Pizza", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative pizza, one of Austin's most interesting newer pizza concepts" },
      { name: "Austin Rotisserie & Sandwicherie", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Rotisserie chicken and sandwiches, one of Austin's best casual lunch spots" },
      { name: "Justine's", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "East Austin, French bistro, late-night institution, beautiful outdoor space, one of Austin's most beloved date night restaurants" },
      { name: "Bouldin Creek Café", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "South Austin vegetarian institution, excellent breakfast and brunch, one of Austin's most authentically local casual spots" },
      { name: "Crown & Anchor Pub", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "UT area, classic Austin dive bar and pub, fish and chips, one of Austin's most beloved unpretentious spots" },
      { name: "Better Half Coffee & Cocktails", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Coffee by day, cocktails by night, one of Austin's most charming all-day spots" },
      { name: "Casa Bianca", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Wine bar and Italian casual, one of Austin's more pleasant neighborhood spots" },
      { name: "Amy's Ice Creams", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Austin institution since 1984, Mexican vanilla is the classic, the quintessential Austin ice cream experience" },
    ],
  },

  "Dallas": {
    fine_dining: [
      { name: "Lucia", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "David Uygur's Italian, Bishop Arts, James Beard nominated, one of Dallas's most beloved and accomplished restaurants, handmade pasta and exceptional wine list" },
      { name: "Gemma Restaurant", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Henderson Ave, Hudson Robb's seasonal American, James Beard nominated, one of Dallas's most thoughtful and accomplished restaurants" },
      { name: "Roots Southern Table", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Farmers Branch, Tiffany Derry's Southern cuisine, James Beard nominated, one of the most important restaurants in North Texas celebrating African American food culture" },
      { name: "Meridian Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Dallas's most exciting newer fine dining rooms, creative and ambitious" },
      { name: "Mirador", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Upscale Mexican, one of Dallas's most accomplished and beautiful Mexican restaurants" },
      { name: "Written by the Seasons", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Tasting menu, one of Dallas's most serious and personally driven newer fine dining rooms" },
      { name: "The Heritage Table", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Dallas's most accomplished farm-to-table restaurants" },
      { name: "Restaurant Beatrice", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Dallas's most exciting newer restaurants, personal and creative" },
      { name: "Quarter Acre", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Dallas's more interesting newer seasonal restaurants" },
      { name: "Harvest at the Masonic", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Historic Masonic Lodge setting, farm-to-table, one of Dallas's most atmospheric and accomplished restaurants" },
    ],
    bbq: [
      { name: "Terry Black's Barbecue", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Dallas outpost of the Austin BBQ family, brisket and ribs done properly, one of Dallas's most reliable BBQ spots" },
    ],
    italian: [
      { name: "61 Osteria", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Dallas's most accomplished and beloved Italian restaurants" },
      { name: "Partenope Ristorante", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Neapolitan cuisine, one of Dallas's most authentic Italian restaurants" },
      { name: "Via Triozzi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Dallas's more interesting newer Italian spots" },
      { name: "Cenzo's Pizza & Deli", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Italian deli and pizza, one of Dallas's best for casual Italian" },
    ],
    asian: [
      { name: "Uchiko Plano", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Plano, Paul Qui's Japanese-influenced, one of the best Japanese restaurants in North Texas" },
      { name: "Tatsu Dallas", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Ramen, one of Dallas's most accomplished and beloved ramen restaurants" },
      { name: "Royal China", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Chinese institution, one of Dallas's most beloved and long-running Chinese restaurants" },
      { name: "Bushi Bushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Dallas's most interesting newer Japanese restaurants" },
      { name: "Ngon Vietnamese Kitchen", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, one of Dallas's most beloved Vietnamese restaurants" },
      { name: "Mot Hai Ba", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Vietnamese fine dining, one of Dallas's most accomplished Vietnamese restaurants" },
      { name: "Nuri Steakhouse", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Korean steakhouse, one of Dallas's most creative Korean restaurants" },
      { name: "Ari Korean BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Korean BBQ, one of Dallas's best for authentic Korean grilling" },
      { name: "Namo", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Asian-influenced, one of Dallas's more interesting newer restaurants" },
    ],
    global: [
      { name: "El Carlos Elegante", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Mexican, one of Dallas's most creative and accomplished Mexican restaurants" },
      { name: "El Come Taco", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Authentic tacos, one of Dallas's most beloved casual Mexican spots" },
      { name: "Taco y Vino", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Tacos and natural wine, one of Dallas's more interesting casual spots" },
      { name: "Sanjh Restaurant & Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Indian, one of Dallas's most accomplished Indian restaurants" },
      { name: "Smoke'N Ash BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "One of Dallas's better casual BBQ spots" },
    ],
    casual: [
      { name: "The Chumley House", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Neighborhood bar and restaurant, one of Dallas's more charming casual spots" },
      { name: "Walloon's Restaurant", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Belgian-inspired, one of Dallas's more distinctive casual spots" },
      { name: "Goodwins", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Neighborhood bar and burgers, one of Dallas's most beloved casual spots" },
      { name: "Tango Room", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bar and small plates, one of Dallas's more interesting neighborhood spots" },
      { name: "Billy Can Can", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Uptown, American brasserie, reliable and well-executed" },
      { name: "Green Point Seafood and Oyster Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Oyster bar, one of Dallas's better casual seafood spots" },
      { name: "Rudy's Chicken", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Fried chicken institution, one of Dallas's most beloved casual spots" },
      { name: "Mike's Chicken", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Fried chicken, one of Dallas's most beloved casual spots" },
      { name: "Starship Bagel", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bagels, one of Dallas's better casual breakfast spots" },
    ],
  },

  "Houston": {
    fine_dining: [
      { name: "March", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Felipe Riccio's Mediterranean tasting menu, one of Houston's most accomplished and extraordinary restaurants, James Beard nominated — $300+/person special occasion" },
      { name: "Theodore Rex", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Justin Yu's creative American, Midtown, James Beard winner, one of Houston's most beloved and personal restaurants" },
      { name: "Ishtia", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Adán Medrano's Tex-Mex and Tejano cuisine, James Beard nominated, one of Houston's most important restaurants celebrating Texas Mexican culinary heritage" },
      { name: "Xochi", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Hugo Ortega's Oaxacan cuisine, James Beard winner, one of the finest Mexican regional restaurants in the US" },
      { name: "Musaafer", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Mayur Subbarao's Indian tasting menu, The Galleria, James Beard nominated, one of the most extraordinary Indian dining experiences in the US" },
      { name: "Navy Blue", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Justin Yu's seafood-focused, James Beard nominated, one of Houston's most accomplished newer restaurants" },
      { name: "Belly of the Beast", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Southeast Asian influenced, one of Houston's most exciting and creative newer restaurants" },
      { name: "Katami", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Houston's most interesting newer fine dining rooms" },
      { name: "Le Jardinier", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Museum of Fine Arts Houston, vegetable-forward fine dining, one of the most beautiful and accomplished museum restaurants in the US" },
      { name: "Squable", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Heights, James Beard nominated, creative and seasonal, one of Houston's most beloved newer restaurants" },
      { name: "Nobie's", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Upper Kirby, creative American, James Beard nominated, one of Houston's most accomplished and personal restaurants" },
      { name: "BCN Taste & Tradition", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Spanish, one of Houston's finest Spanish restaurants, exceptional jamón and wines" },
      { name: "Jun", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese-influenced, one of Houston's most exciting newer restaurants" },
      { name: "Ema", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Houston's newer and more talked-about fine dining concepts" },
      { name: "Baso", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Houston's most interesting newer restaurants, creative and ambitious" },
    ],
    bbq: [
      { name: "Truth BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Leonard Botello IV's Texas BBQ, one of the best BBQ restaurants in Houston, brisket and ribs done exceptionally well" },
      { name: "Feges BBQ Spring Branch", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Patrick Feges's creative BBQ, excellent smoked meats with interesting sides, one of Houston's most accomplished BBQ spots" },
      { name: "Blood Bros. BBQ", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Robin Wong, Quy Hoang, and Robin Wong's multicultural Texas BBQ, James Beard nominated, one of Houston's most important and delicious restaurants" },
    ],
    asian: [
      { name: "Mala Sichuan Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Sichuanese cuisine, one of the best Sichuan restaurants in the US outside California, mapo tofu and dry-fried string beans are outstanding" },
      { name: "Phat Eatery", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Alex Au-Yeung's Malaysian, Katy, James Beard nominated, one of the best Malaysian restaurants in the US" },
      { name: "Hidden Omakase", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Omakase sushi, one of Houston's finest and most intimate Japanese dining experiences" },
      { name: "Street to Kitchen", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Benchawan Jabthong Painter's Thai, James Beard nominated, one of Houston's most personal and accomplished Thai restaurants" },
      { name: "Huynh Restaurant", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, Midtown, one of Houston's most beloved Vietnamese restaurants" },
      { name: "Brisket&Rice", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hong Kong-style BBQ meats, one of Houston's best for char siu and roast duck" },
      { name: "Tiny Champions", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese-influenced sandwich shop, Justin Yu's casual concept, one of Houston's most beloved casual spots" },
      { name: "Kira", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Houston's more accomplished newer Japanese restaurants" },
      { name: "Tatemo", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Houston's most interesting newer Asian-influenced restaurants" },
      { name: "Amrina", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Indian, one of Houston's more creative and accomplished newer Indian restaurants" },
    ],
    global: [
      { name: "Viola & Agnes", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Houston's most interesting newer global cuisine restaurants" },
      { name: "Josephine's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Houston's newer and more compelling neighborhood restaurants" },
      { name: "ChopnBlok", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "West African, one of Houston's most important newer restaurants celebrating African culinary heritage" },
    ],
    casual: [
      { name: "Pappas Bros. Steakhouse", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Houston steakhouse institution, one of the finest steakhouses in Texas, exceptional dry-aged beef and wine list" },
      { name: "Little's Oyster Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Oyster bar, one of Houston's best for raw bar and casual upscale seafood" },
      { name: "The Rado Market", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Market and casual dining, one of Houston's more interesting neighborhood food spots" },
      { name: "Cochinita & co.", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Yucatecan cochinita pibil, one of Houston's most authentic Mexican regional casual spots" },
      { name: "Craft Pita", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Israeli-influenced pita, one of Houston's best for Middle Eastern casual food" },
      { name: "Candente", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Argentine-style grilling, one of Houston's most interesting Latin American casual spots" },
      { name: "Koffeteria", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Coffee and casual food, one of Houston's more interesting neighborhood café spots" },
    ],
  },

  "San Antonio": {
    fine_dining: [
      { name: "Mixtli", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Diego Galicia and Rico Torres's Mexican regional tasting menu, James Beard nominated, one of the most important and extraordinary Mexican fine dining experiences in the US, rotating menu explores different Mexican states" },
      { name: "Biga On The Banks", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Bruce Auden's Riverwalk fine dining, one of San Antonio's most accomplished and long-running restaurants, beautiful setting above the river" },
      { name: "Clementine", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Steve McHugh's neighborhood restaurant, James Beard nominated, one of San Antonio's most beloved and accomplished" },
      { name: "Isidore", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of San Antonio's most exciting newer fine dining rooms" },
      { name: "Leche de Tigre", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Peruvian, ceviche and Nikkei influences, one of San Antonio's most interesting newer restaurants" },
      { name: "Mare e Monte", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of San Antonio's most accomplished Italian restaurants" },
      { name: "Toro Kitchen + Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of San Antonio's better upscale casual restaurants" },
    ],
    mexican: [
      { name: "Henry's Puffy Tacos", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Puffy tacos are a San Antonio original, Henry Lopez's family restaurant is the most beloved, a San Antonio culinary birthright" },
      { name: "El Pastor Es Mi Senor", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Al pastor tacos, one of San Antonio's most authentic and beloved taqueria experiences" },
      { name: "Best Quality Daughter", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Jennifer Hwa Dobbertin's Chinese-American, James Beard nominated, one of San Antonio's most exciting and personal restaurants" },
      { name: "Nicosi", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of San Antonio's more interesting newer restaurants" },
      { name: "Reese Bros Barbecue", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of San Antonio's most accomplished BBQ restaurants" },
    ],
    global: [
      { name: "Curry Boys BBQ", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Indian-influenced BBQ fusion, one of San Antonio's most creative and distinctive restaurants" },
      { name: "The Jerk Shack", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Nicola Blaque's Jamaican, James Beard nominated, jerk chicken and oxtail, one of San Antonio's most important and delicious restaurants" },
      { name: "Madurai Mes", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "South Indian cuisine, one of San Antonio's most authentic Indian restaurants" },
      { name: "Chika", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of San Antonio's more interesting newer global cuisine restaurants" },
      { name: "Shiro Japanese Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of San Antonio's most accomplished Japanese restaurants" },
    ],
    casual: [
      { name: "Ro-Ho Pork & Bread", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Porchetta sandwiches and pork-focused cooking, one of San Antonio's most beloved casual spots" },
      { name: "Outlaw Kitchens", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Texas comfort food, one of San Antonio's more interesting casual spots" },
      { name: "Cullum's Attaboy", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Bar and casual food, one of San Antonio's more fun neighborhood spots" },
      { name: "The Magpie", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Neighborhood café and bar, one of San Antonio's more charming casual spots" },
      { name: "Pumpers", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Burgers, one of San Antonio's most beloved casual spots" },
      { name: "Geno's Deli Stop N Buy", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Italian-American deli, one of San Antonio's most distinctive casual lunch spots" },
    ],
  },


  "New York City": {
    fine_dining: [
      { name: "Le Bernardin", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Eric Ripert's Michelin 3-star seafood temple, Midtown, James Beard winner multiple times, one of the world's great restaurants — $350+/person, essential NYC fine dining pilgrimage" },
      { name: "Restaurant Daniel", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Daniel Boulud's Michelin 2-star Upper East Side institution, James Beard winner, French cuisine at its most accomplished — $250+/person, classic NYC special occasion" },
      { name: "The Four Horsemen", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Williamsburg, James Beard winner, natural wine list of extraordinary depth, creative seasonal food, one of NYC's most important and beloved restaurants" },
      { name: "Claud", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "East Village, Josh Pinsky's French-influenced, one of NYC's most talked-about newer fine dining rooms, excellent wine list" },
      { name: "Via Carota", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "West Village, Rita Sodi and Jody Williams's Italian, James Beard nominated, rustic and perfect, one of NYC's most beloved restaurants — no reservations, expect a wait" },
      { name: "Lilia", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Williamsburg, Missy Robbins's pasta-focused Italian, James Beard nominated, one of NYC's finest Italian restaurants — book weeks ahead" },
      { name: "Café Commerce", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "West Village, one of NYC's most exciting newer neighborhood fine dining rooms, creative and seasonal" },
      { name: "Sailor", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Carroll Gardens Brooklyn, one of NYC's most interesting newer restaurants, natural wine and creative cooking" },
      { name: "Rolo's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Ridgewood Queens, one of NYC's most exciting newer neighborhood restaurants" },
      { name: "Mam", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of NYC's most talked-about newer fine dining concepts, creative and personal" },
      { name: "Sunn's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of NYC's newer and more compelling casual fine dining spots" },
    ],
    french_european: [
      { name: "Le Veau d'Or", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Upper East Side, classic French bistro since 1937, Lee Hanson and Riad Nasr's restoration, one of NYC's most atmospheric and accomplished restaurants — old Paris transported to Lexington Avenue" },
      { name: "Balthazar", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "SoHo, Keith McNally's French brasserie institution since 1997, raw bar, steak frites, the quintessential NYC dining experience, always buzzing" },
      { name: "Txikito", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Chelsea, Alex Raij and Eder Montero's Basque, one of NYC's finest and most personal Spanish restaurants" },
    ],
    seafood: [
      { name: "Grand Central Oyster Bar", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Grand Central Terminal, open since 1913, James Beard America's Classics, pan roast and oyster stew under the vaulted ceiling, one of NYC's great historic dining experiences" },
      { name: "Noz Market", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese seafood market and restaurant, extraordinary fish sourcing, one of NYC's finest for omakase-adjacent Japanese seafood" },
      { name: "Abuqir", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Egyptian seafood, Astoria Queens, whole fish and mezze, one of the best Egyptian restaurants in the US, beloved by the Astoria community" },
    ],
    steakhouse: [
      { name: "Keens Steakhouse", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Murray Hill, since 1885, pipes hanging from the ceiling, mutton chop is the must-order, one of NYC's great historic restaurants — old New York preserved perfectly" },
      { name: "Red Hook Tavern", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Red Hook Brooklyn, Billy Durney's dry-aged beef, one of the finest burgers and steaks in NYC" },
    ],
    pizza: [
      { name: "Una Pizza Napoletana", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Anthony Mangieri's Neapolitan obsession, East Village, James Beard nominated, considered one of the best pizzas in the world — only open Wed-Sat, sells out" },
      { name: "L'Industrie Pizzeria", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Williamsburg, excellent Roman-style slices, one of NYC's most beloved casual pizza spots" },
    ],
    asian: [
      { name: "Ho Foods", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "East Village, Taiwanese beef noodle soup, one of the best single-dish restaurants in NYC, deeply authentic" },
      { name: "Zaab Zaab", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: ["Elmhurst Queens, Isan Thai, one of the most authentic regional Thai restaurants in the US, som tum papaya salad is extraordinary"] },
      { name: "Sky Pavilion", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Flushing Queens, Cantonese seafood, one of the finest Chinese restaurants in NYC's extraordinary Flushing food scene" },
      { name: "Bong", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Korean, one of NYC's most creative and accomplished Korean restaurants" },
      { name: "Nepali Bhanchha Ghar", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Jackson Heights Queens, Nepali home cooking, one of the few genuinely excellent Nepali restaurants in the US" },
      { name: "Hyderabadi Zaiqa", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Jackson Heights Queens, Hyderabadi biryani, one of NYC's most authentic South Indian Muslim restaurants" },
      { name: "Adda", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Long Island City Queens, Chintan Pandya's Indian, James Beard nominated, one of the finest Indian restaurants in the US" },
      { name: "Golden Diner", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Chinatown, Sam Yoo's Asian-American diner, one of NYC's most creative and beloved casual restaurants — scallion pancake pastrami sandwich is legendary" },
    ],
    global: [
      { name: "Chama Mama", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chelsea, Georgian cuisine, one of the few excellent Georgian restaurants in the US, khachapuri and khinkali are extraordinary" },
      { name: "Carnitas Ramirez", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Bushwick Brooklyn, Michoacán-style carnitas, the most authentic carnitas in NYC, weekend only" },
      { name: "La Pirana Lechonera", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Bronx, Puerto Rican lechón (roast pig), one of the most authentic and delicious Puerto Rican restaurants in NYC" },
      { name: "Charles Pan-Fried Chicken", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Harlem, Charles Gabriel's pan-fried chicken, James Beard America's Classics, one of NYC's most beloved and historically significant restaurants" },
      { name: "Kabawa", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "West African, one of NYC's most authentic and important West African restaurants" },
      { name: "Al Badawi", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Bay Ridge Brooklyn, Palestinian and Syrian cuisine, one of NYC's most authentic Middle Eastern restaurants" },
      { name: "A&A Bake Doubles and Roti", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Flatbush Brooklyn, Trinidadian doubles, one of the best and most authentic Caribbean street food spots in NYC" },
    ],
    casual: [
      { name: "Superiority Burger", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "East Village, Brooks Headley's vegetarian burger counter, James Beard winner, one of NYC's most beloved casual spots — the best vegetarian burger in America" },
      { name: "Hamburger America", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "West Village, George Motz's hamburger museum and restaurant, celebrating American regional burgers, one of NYC's most fun and distinctive casual spots" },
    ],
  },


  "Maui": {
    fine_dining: [
      { name: "Mama's Fish House", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Paia, legendary Hawaii institution since 1973, seafood caught by named local fishermen, beautiful oceanfront setting — reservations book out months, worth every effort, $100+/person" },
      { name: "Marlow", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Wailea, one of Maui's most exciting newer fine dining rooms, creative and seasonal with excellent Hawaii ingredient sourcing" },
      { name: "Tikehau Lounge", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Hotel Wailea, intimate and accomplished, one of Maui's most beautiful dining settings" },
      { name: "Mala Ocean Tavern", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Lahaina, oceanfront, Mark Ellman's farm-to-table with Pacific influences, one of Maui's most reliable and beloved restaurants" },
      { name: "Spoon & Key", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Maui's most exciting newer restaurants, creative and ambitious" },
      { name: "Nuka", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Hana, remote and extraordinary, one of the most unique dining experiences in Hawaii — worth planning your Road to Hana around" },
      { name: "Oao", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Maui's most talked-about newer creative restaurants" },
    ],
    japanese: [
      { name: "Takumi Maui", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese izakaya, one of Maui's finest and most beloved Japanese restaurants, excellent fish and sake program" },
      { name: "Star Noodle", signals: ["eater_38"], axis: ["local_authority", "culinary_prestige"], notes: "Lahaina, Sheldon Simeon's ramen and noodles, creative and delicious, one of Maui's most beloved casual restaurants" },
      { name: "Kitoko Maui", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Japanese-influenced, one of Maui's most interesting newer Japanese restaurants" },
      { name: "Shikeda Bento Patisserie", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Japanese bento and pastries, one of Maui's most charming and authentic Japanese casual spots" },
    ],
    local_hawaii: [
      { name: "Tin Roof", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Kahului, Sheldon Simeon's plate lunch concept, James Beard nominated, one of the most important restaurants on Maui celebrating Hawaii's multicultural food heritage" },
      { name: "Ichiban Okazuya", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Japanese-Hawaiian okazuya (deli) tradition, one of Maui's most authentic local food experiences" },
      { name: "Kaohu Store", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Wailuku, neighborhood store and food, genuine Maui local experience away from the resort corridor" },
      { name: "Only Ono BBQ", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hawaiian BBQ plate lunch, one of Maui's most beloved casual local spots" },
      { name: "Aunty Sandy's Banana Bread", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Ke'anae, roadside banana bread stop on the Road to Hana, one of Maui's most beloved traditions — the banana bread is still warm" },
    ],
    casual: [
      { name: "Leoda's Kitchen and Pie Shop", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Olowalu, roadside pie shop and sandwiches, beloved Maui institution, banana cream pie is legendary" },
      { name: "Sale Pepe", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Ka'anapali, Italian, one of Maui's better Italian casual restaurants" },
      { name: "Esters Fair Prospect", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Paia, natural wine bar and small plates, one of Maui's most interesting newer casual spots" },
      { name: "Balai Pata", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Filipino, one of Maui's most accomplished Filipino restaurants celebrating Hawaii's strong Filipino community" },
      { name: "Komo", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Maui's newer neighborhood restaurants generating strong local buzz" },
      { name: "Maui Bees", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Local honey and products, one of Maui's most distinctive food experiences" },
      { name: "Broth at Alive and Well", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Healthy and local, one of Maui's better wellness-oriented casual spots" },
    ],
    bakery_coffee: [
      { name: "Ululani's Hawaiian Shave Ice", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "The best shave ice on Maui, natural flavors and excellent ice texture, multiple locations — a Maui ritual" },
      { name: "Akamai Coffee", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Excellent coffee, one of Maui's best for a morning start" },
    ],
  },

  "Aspen": {
    fine_dining: [
      { name: "Bosq", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Barclay Dodge's intimate tasting menu, James Beard nominated, one of Aspen's most creative and accomplished restaurants, farm-driven and personal" },
      { name: "Acquolina", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian fine dining, one of Aspen's most accomplished and elegant Italian restaurants" },
      { name: "Cache Cache", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "French bistro institution, downtown Aspen, one of the most reliable and beloved restaurants in town for decades" },
      { name: "Sant Ambroeus", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Milanese café institution, Aspen location captures the original's elegance, excellent pastries and Northern Italian cuisine" },
      { name: "Ellina", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Aspen's most exciting newer fine dining rooms, creative and seasonal" },
      { name: "Wayan Aspen", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Indonesian-influenced, one of Aspen's more interesting and creative newer restaurants" },
      { name: "Clark's Oyster Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Raw bar and seafood, one of Aspen's most civilized casual-upscale spots" },
      { name: "Duemani", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Aspen's better Italian casual-upscale options" },
      { name: "Yuki", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Aspen's finest Japanese restaurants, excellent après-ski sushi" },
    ],
    casual: [
      { name: "White House Tavern", signals: ["eater_38"], axis: ["local_authority", "trusted_authority"], notes: "Historic building, excellent cocktails and sandwiches, one of Aspen's most atmospheric casual spots" },
      { name: "Meat & Cheese", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Charcuterie and cheese shop with restaurant, one of Aspen's best for a casual lunch or wine and cheese" },
      { name: "Steakhouse No. 316", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Reliable steakhouse, one of Aspen's better options for a classic steak dinner" },
      { name: "Las Montanas", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Mexican-inspired, one of Aspen's better casual options for margaritas and tacos après-ski" },
      { name: "Aspen Public House", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Neighborhood pub, one of Aspen's more unpretentious and beloved casual spots" },
      { name: "Mawa's Kitchen", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "African and French-influenced, Mawa McQueen's personal cuisine, one of Aspen's most distinctive and culturally important restaurants" },
      { name: "Hickory House", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "BBQ institution since 1980, one of Aspen's most beloved and historic casual restaurants" },
      { name: "Spring Café Aspen", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Healthy and light, one of Aspen's better daytime café options" },
    ],
  },

  "Jackson Hole": {
    fine_dining: [
      { name: "Snake River Grill", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Town Square, James Beard nominated, Rocky Mountain cuisine, one of Jackson's most accomplished and beloved restaurants, beautiful elk antler room — $100+/person" },
      { name: "Westbank Grill at Four Seasons", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Four Seasons Teton Village, mountain views, one of Jackson's finest and most polished dining rooms, Forbes 5-Star caliber" },
      { name: "Il Villaggio Osteria", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Teton Village, Italian, one of Jackson's most accomplished and beloved Italian restaurants" },
      { name: "Palate", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Jackson's more interesting newer creative restaurants" },
      { name: "The Bistro at the Cloudveil Hotel", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Cloudveil Hotel downtown, creative and seasonal, one of Jackson's better newer hotel restaurants" },
      { name: "Café Genevieve", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Historic cabin, Southern-influenced, one of Jackson's most atmospheric and beloved restaurants" },
      { name: "Trio American Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Jackson's most reliable and accomplished neighborhood fine dining rooms" },
    ],
    casual: [
      { name: "Persephone Bakery", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Jackson's beloved bakery, outstanding croissants and bread, one of the best bakeries in Wyoming, morning institution" },
      { name: "Local Restaurant and Bar", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Casual American, one of Jackson's most reliably good neighborhood restaurants" },
      { name: "Roadhouse Brewing Co", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Jackson's craft brewery, excellent beer and casual food, one of the best spots for après-ski" },
      { name: "Hatch Taqueria & Tequila", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Mexican, one of Jackson's most beloved casual spots for tacos and margaritas" },
      { name: "The Handle Bar", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Four Seasons Teton Village, après-ski bar, excellent cocktails and casual food, the best bar scene in Teton Village" },
      { name: "Calico Restaurant", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Teton Village, family-friendly Italian, one of Jackson's most reliable and beloved casual restaurants" },
      { name: "Gun Barrel Steak and Game House", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Wild game steakhouse, elk and bison, one of Jackson's most uniquely Western dining experiences" },
      { name: "Yeah Buddy Pizza", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Pizza institution, one of Jackson's most beloved casual spots" },
      { name: "Silver Dollar Bar at the Worth Hotel", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Historic bar with 2,032 silver dollars inlaid in the counter, one of Jackson's most atmospheric historic spots" },
      { name: "Snake River Brewing", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Jackson's original craft brewery since 1994, one of the best ski town brewpubs in the US" },
      { name: "Gather", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Jackson's newer and more interesting casual neighborhood spots" },
      { name: "Bin22", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wine shop and casual dining, excellent by-the-glass selection, one of Jackson's better spots for wine lovers" },
    ],
  },

  "Vail": {
    fine_dining: [
      { name: "Sweet Basil", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "Vail Village institution since 1977, one of the most accomplished and reliable fine dining rooms in the Rockies — $100+/person, special occasion standard" },
      { name: "Matsuhisa", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Nobu Matsuhisa's Vail outpost, Japanese-Peruvian, one of the finest restaurants in ski country" },
      { name: "La Tour Restaurant & Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "French-influenced, one of Vail's most accomplished and beloved fine dining rooms" },
      { name: "Mountain Standard", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Rocky Mountain seasonal cuisine, one of Vail's most creative and accomplished restaurants" },
      { name: "Tavernetta Vail", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, handmade pasta, one of Vail's most beloved Italian restaurants" },
      { name: "Vintage", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wine bar and fine dining, one of Vail's better wine-focused restaurants" },
      { name: "Fall Line Kitchen and Cocktails", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Vail's more interesting newer restaurants" },
      { name: "Root & Flower", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Vail's most creative newer restaurants" },
    ],
    casual: [
      { name: "The Little Diner", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Vail breakfast institution, hearty mountain breakfast, one of the most beloved morning spots in ski country" },
      { name: "Annapurna", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Nepalese and Indian, one of Vail's most distinctive and authentic casual spots" },
      { name: "Alpenrose", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Austrian-influenced, one of Vail's most atmospheric and charming ski town restaurants" },
      { name: "La Nonna Ristorante Vail", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Italian, one of Vail's more casual and beloved Italian options" },
      { name: "Osaki's", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Vail's better casual sushi options après-ski" },
      { name: "Slope Room", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "On-mountain dining, one of Vail's better ski-in options" },
      { name: "Avanti Vail", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Food hall concept, multiple vendors, one of Vail's best for casual variety" },
      { name: "Chasing Rabbits", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Vail's newer and more interesting casual spots" },
    ],
  },

  "Park City": {
    fine_dining: [
      { name: "Handle", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Briar Handly's farm-to-table, Historic Main Street, James Beard nominated, one of the finest restaurants in Utah, creative and seasonal" },
      { name: "Riverhorse on Main", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "Historic Masonic Hall, one of Park City's most accomplished and atmospheric fine dining rooms, Rocky Mountain cuisine" },
      { name: "Firewood", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wood-fired cooking, one of Park City's most accomplished and beloved newer restaurants" },
      { name: "Tupelo Park City", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Southern-influenced, one of Park City's most creative and accomplished restaurants" },
      { name: "Twisted Fern", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Farm-to-table, one of Park City's better upscale casual restaurants" },
      { name: "Fletcher's", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Park City's newer fine dining rooms generating strong attention" },
      { name: "The Goldener Hirsch Restaurant", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Deer Valley, Austrian-influenced, one of Park City's most elegant ski resort restaurants" },
    ],
    casual: [
      { name: "High West Distillery & Saloon", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Historic Main Street, Utah's first craft distillery, excellent whiskey and food, one of Park City's most essential experiences" },
      { name: "Five5eeds", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Australian-influenced café, one of Park City's most beloved brunch spots" },
      { name: "Harvest", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Farm-to-table casual, one of Park City's better healthy casual options" },
      { name: "Blind Dog Restaurant & Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Seafood and sushi, one of Park City's more accomplished casual seafood spots" },
      { name: "Mumbai House", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Indian, one of Park City's most beloved and authentic Indian restaurants" },
      { name: "Bangkok Thai On Main", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai, one of Park City's better casual Thai spots" },
      { name: "Yuki Yama Sushi", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Sushi, one of Park City's most accomplished Japanese restaurants" },
      { name: "Pine Cone Ridge", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Park City's newer neighborhood restaurants" },
      { name: "Burgers & Bourbon", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Montage Deer Valley, casual upscale burgers and whiskey, excellent après-ski" },
      { name: "Butcher's Chop House & Bar", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Steakhouse, one of Park City's more reliable upscale casual spots" },
      { name: "The Eating Establishment", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Historic Main Street institution since 1972, breakfast and brunch, one of Park City's most beloved morning spots" },
    ],
  },

  "Sun Valley": {
    fine_dining: [
      { name: "Michel's Christiania", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "Sun Valley institution since 1962, Austrian-French fine dining, one of the most storied restaurants in American ski culture — $100+/person" },
      { name: "Grill At Knob Hill", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Knob Hill Inn, one of Sun Valley's most accomplished dining rooms, beautiful mountain views" },
      { name: "The Covey", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Creative contemporary, one of Sun Valley's better fine dining options" },
      { name: "Roundhouse", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "On-mountain at the top of Dollar Mountain, panoramic views, one of the most scenic dining experiences in Idaho ski country" },
      { name: "Enoteca", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wine bar and Italian, one of Sun Valley's better wine-focused casual spots" },
    ],
    casual: [
      { name: "The Casino", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Sun Valley Lodge bar since 1936, Ernest Hemingway's regular haunt — he wrote For Whom the Bell Tolls here in 1939, came back repeatedly until his death in Ketchum in 1961. Gary Cooper, Clark Gable, Marilyn Monroe, Lucille Ball all came through this room. The most historically atmospheric bar in Idaho." },
      { name: "Grumpy's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ketchum dive bar and burgers, the most beloved unpretentious spot in Sun Valley, where locals actually hang out" },
      { name: "Warfield", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Ketchum, one of Sun Valley's more interesting newer casual spots" },
      { name: "Scout Wine and Cheese", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Wine shop and small plates, one of Sun Valley's best for a relaxed wine-focused meal" },
      { name: "Pioneer", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Pioneer Saloon, steakhouse and bar, Ketchum institution, very Sun Valley" },
      { name: "Ramen Cowboy", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Ramen in a ski town, unexpectedly excellent, one of Sun Valley's best casual spots" },
      { name: "Apple's Bar and Grill", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Local institution, casual and beloved, one of Ketchum's most authentic neighborhood spots" },
      { name: "Sawtooth Brewery Public House", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Local craft brewery, excellent beer and pub food, one of Sun Valley's best casual gathering spots" },
      { name: "Rickshaw", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Asian-influenced, one of Sun Valley's more distinctive casual spots" },
      { name: "The Cellar Pub", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Basement bar, classic Sun Valley après-ski" },
      { name: "Konditorei", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Austrian bakery and café, Sun Valley Resort, one of the most charming morning spots in Idaho ski country" },
      { name: "Java", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Coffee institution in Ketchum, where locals start their day" },
      { name: "Cookbook", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Ketchum, one of Sun Valley's more interesting casual spots" },
      { name: "Maude's", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Sun Valley's newer neighborhood restaurants" },
    ],
  },

  "Whistler": {
    fine_dining: [
      { name: "Araxi Restaurant + Oyster Bar", signals: ["eater_38"], axis: ["trusted_authority", "culinary_prestige"], notes: "Whistler Village, the anchor fine dining restaurant, BC seafood and farm-to-table, one of the best ski resort restaurants in North America — $150+CAD/person" },
      { name: "Wild Blue Restaurant + Bar", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Whistler's most exciting newer fine dining rooms, creative and seasonal" },
      { name: "Bearfoot Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Whistler institution, exceptional champagne program, ice room vodka tasting, one of the most extravagant dining experiences in ski country" },
      { name: "Il Caminetto", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Whistler's most accomplished and beloved Italian restaurants" },
      { name: "The Rimrock Café", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Whistler institution, wild game and seafood, panoramic mountain views, one of the most atmospheric restaurants in Whistler" },
      { name: "Lorette Brasserie", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "French brasserie, one of Whistler's most interesting newer restaurants" },
      { name: "Hy's Steakhouse", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Canadian steakhouse institution, Whistler location maintains the classic quality" },
    ],
    casual: [
      { name: "Bar Oso", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Spanish tapas and cocktails, Araxi's casual sibling, one of Whistler's best spots for a relaxed evening" },
      { name: "21 Steps Kitchen and Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "One of Whistler's more accomplished casual restaurants, rooftop views of the village" },
      { name: "Creekbread", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Wood-fired pizza, one of Whistler's most beloved casual spots" },
      { name: "Alta Bistro", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Farm-to-table, one of Whistler's better neighbourhood casual-upscale spots" },
      { name: "Red Door Bistro", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Whistler's better neighbourhood restaurants" },
      { name: "Sushi Village", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Whistler sushi institution, one of the best and most beloved Japanese restaurants in ski country" },
      { name: "Barn Nork", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Thai, one of Whistler's most authentic and beloved casual Asian spots" },
      { name: "Purebread", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Whistler's beloved bakery, outstanding pastries and bread, a morning institution" },
      { name: "Portobello", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Market and casual food, one of Whistler's better spots for fresh ingredients and casual meals" },
      { name: "Bred", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Sandwiches and casual, one of Whistler's newer and more interesting casual spots" },
      { name: "Handlebar", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Après-ski bar, one of Whistler's most lively and beloved casual après spots" },
      { name: "The Fitzsimmons", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Casual pub, one of Whistler's better spots for a laid-back après experience" },
      { name: "Zog's Dogs", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hot dogs, Whistler institution, the classic on-mountain casual experience" },
      { name: "Merlin's Bar and Grill", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Blackcomb base, après-ski classic, one of Whistler's most iconic mountain bar experiences" },
    ],
  },


  "Kauai": {
    fine_dining: [
      { name: "Merriman's", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Poipu, Peter Merriman's Hawaii Regional Cuisine pioneer, one of Kauai's most accomplished restaurants, farm-to-table before the term existed on the islands — $80+/person" },
      { name: "Beach House", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Poipu, oceanfront sunset dining, one of Kauai's most beautiful settings paired with excellent food — reserve the rail for sunset views" },
      { name: "Bar Acuda", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Hanalei, James Mactavish's tapas bar, one of Kauai's most beloved and accomplished casual-upscale spots, excellent wine list" },
      { name: "Tidepools", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Grand Hyatt Kauai, thatched-roof bungalows over a koi pond, one of Kauai's most romantic and distinctive dining settings" },
      { name: "Eating House 1849", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Roy Yamaguchi's Hawaii regional cuisine, Grand Hyatt Kauai, one of Kauai's most reliable fine dining experiences" },
      { name: "Red Salt", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Ko'a Kea Hotel, one of Kauai's more accomplished hotel restaurants" },
      { name: "JO2 Natural Cuisine", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Kauai's more interesting newer restaurants, farm-driven and creative" },
    ],
    casual: [
      { name: "Mark's Place", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Lihue, local plate lunch institution, one of Kauai's most beloved local casual spots away from the tourist corridor" },
      { name: "La Spezia", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian, one of Kauai's better casual Italian restaurants" },
      { name: "Brennecke's Beach Broiler", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Poipu, casual seafood across from the beach, one of Kauai's more reliably pleasant casual spots" },
      { name: "Porky's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Local BBQ, one of Kauai's most beloved casual spots for a quick and excellent meal" },
      { name: "Tip Top", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Lihue, local institution since 1916, macadamia nut pancakes, where Kauai locals have breakfast — very local, not tourist-facing" },
    ],
    coffee_shave_ice: [
      { name: "Little Fish Coffee", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Lihue, excellent coffee, one of Kauai's best for a morning start away from resort coffee" },
      { name: "Dark Horse", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Kauai's newer and more interesting coffee shops" },
      { name: "Ha Coffee", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Kauai coffee roaster, excellent local beans, one of the island's best" },
      { name: "JoJo's Shave Ice", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Waimea, one of Kauai's most beloved shave ice spots, on the way to Waimea Canyon" },
      { name: "Saimin", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Hawaii's signature noodle soup done properly, one of Kauai's authentic local food experiences" },
    ],
  },

  "Big Island": {
    // Note: Big Island dining scene is thinner than other islands — focus is on not going wrong
    // and on the extraordinary experiences the island offers beyond food
    fine_dining: [
      { name: "Merriman's", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Waimea (Kamuela), Peter Merriman's flagship, Hawaii Regional Cuisine pioneer, upcountry ranch setting at 2,600 feet — one of the Big Island's most accomplished restaurants" },
      { name: "Manta", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Mauna Kea Beach Hotel, oceanfront fine dining, one of the Big Island's most accomplished resort restaurants, exceptional sunset views" },
    ],
    local_hawaii: [
      { name: "Da Poke Shack", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Kailua-Kona, one of the Big Island's most beloved and authentic poke stops, fresh and simple" },
      { name: "L&L Hawaiian Barbecue", signals: ["eater_38"], axis: ["authenticity_value", "populist"], notes: "Hawaii's beloved local plate lunch chain, the real local food experience, comfort food for every Hawaii childhood" },
      { name: "Café 100", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "local_authority"], notes: "Hilo, claimed birthplace of the loco moco (rice, hamburger patty, egg, gravy), James Beard America's Classics nominated, Big Island institution since 1946" },
      { name: "Tex Drive In", signals: ["eater_38"], axis: ["trusted_authority", "local_authority"], notes: "Honokaa, malasadas (Portuguese donuts) fresh daily, one of the most beloved roadside stops on the Big Island — essential on any Hamakua Coast drive" },
    ],
    casual: [
      { name: "Lava Lava Beach Club", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Anaeho'omalu Bay, feet in the sand dining, sunset cocktails, one of the Big Island's most pleasant casual experiences" },
      { name: "Huggo's On the Rocks", signals: ["eater_38"], axis: ["local_authority", "populist"], notes: "Kailua-Kona waterfront, tiki bar on the lava rocks, sunset drinks and seafood, one of the Big Island's most atmospheric casual spots" },
      { name: "Hula Hula's", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Kailua-Kona, local bar and grill, unpretentious and beloved, the kind of place locals actually eat" },
    ],
  },

  "Denver": {
    fine_dining: [
      { name: "Frasca Food and Wine", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Boulder (30 min from Denver), Bobby Stuckey and Lachlan Mackinnon-Patterson's Friulian Italian, James Beard winner, one of the finest wine programs in the US — $150+/person, Colorado's most important restaurant" },
      { name: "Beckon", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "RiNo, Duncan Holmes's tasting menu, James Beard nominated, one of Denver's most accomplished and personal fine dining rooms" },
      { name: "The Wolf's Tailor", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Baker neighborhood, Kelly Whitaker's wood-fired Italian-influenced, James Beard nominated, one of Denver's most creative and beloved restaurants" },
      { name: "Tavernetta", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Union Station, Frasca team's Denver outpost, Italian, James Beard nominated, one of Denver's finest Italian restaurants" },
      { name: "Barolo Grill", signals: ["eater_38", "james_beard"], axis: ["trusted_authority", "culinary_prestige"], notes: "Cherry Creek, Italian, James Beard nominated, one of Denver's most accomplished and long-running Italian restaurants, exceptional wine list" },
      { name: "Safta", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "RiNo, Alon Shaya's Israeli, James Beard nominated, one of Denver's most vibrant and accomplished restaurants" },
      { name: "Annette", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Aurora, Caroline Glover's American, James Beard nominated, wood-fired cooking with Colorado ingredients, one of Denver metro's most important restaurants" },
      { name: "Marigold", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Denver's most exciting newer fine dining rooms, creative and seasonal" },
      { name: "Restaurant Olivia", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Denver's newer and most talked-about fine dining concepts" },
      { name: "Somebody People", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Denver's most interesting newer creative restaurants" },
      { name: "Sushi by Scratch", signals: ["eater_38"], axis: ["culinary_prestige", "trusted_authority"], notes: "Omakase, same caliber as the Miami and Austin locations, one of Denver's finest Japanese dining experiences" },
    ],
    global: [
      { name: "Tocabe, An American Indian Eatery", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Native American cuisine, frybread tacos and bison dishes, one of the only Native American fast-casual concepts in the US — culturally significant and delicious" },
      { name: "Hop Alley", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "RiNo, Tommy Lee's Chinese-American, James Beard nominated, one of Denver's most creative and accomplished Asian restaurants" },
      { name: "Kawa Ni", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese-influenced, one of Denver's more accomplished and interesting Japanese casual restaurants" },
      { name: "Kizaki", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Japanese, one of Denver's finest Japanese restaurants" },
      { name: "Dan Da", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Vietnamese, one of Denver's most authentic and beloved Vietnamese restaurants" },
      { name: "sap sua", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "Vietnamese-influenced, one of Denver's most exciting newer Asian restaurants" },
      { name: "Yuan Wonton", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Chinese wontons and dumplings, one of Denver's best for handmade Chinese" },
      { name: "Urban Burma", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Burmese cuisine, one of Denver's most distinctive and authentic global casual spots" },
      { name: "Yemen Grill", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Yemeni cuisine, one of the few excellent Yemeni restaurants in the US, deeply flavored and community-rooted" },
      { name: "African Grill and Bar", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "West African, one of Denver's more authentic African restaurants" },
      { name: "MAKfam", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Filipino, one of Denver's most accomplished Filipino restaurants" },
    ],
    mexican: [
      { name: "Alma Fonda Fina", signals: ["eater_38", "james_beard"], axis: ["culinary_prestige", "local_authority"], notes: "Kelly Whitaker's Mexican, James Beard nominated, one of Denver's most creative and important Mexican restaurants" },
      { name: "Tacos Tequila Whiskey / La Diabla Pozole y Mezcal", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Alex Seidel's Mexican concepts, one of Denver's most accomplished Mexican casual restaurant groups" },
      { name: "La Diabla Pozole y Mezcal", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Pozole and mezcal focus, one of Denver's most creative Mexican restaurants" },
      { name: "Kike's Red Tacos", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Birria tacos, one of Denver's most beloved authentic Mexican taco spots" },
      { name: "Lucina Eatery & Bar", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Latin American, one of Denver's more accomplished casual Latin restaurants" },
      { name: "Xiquita Restaurante y Bar", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Oaxacan cuisine, one of Denver's most authentic regional Mexican restaurants" },
      { name: "Luchador Taco & More", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Creative tacos, one of Denver's more fun and beloved casual Mexican spots" },
      { name: "Carne", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Meat-focused Latin, one of Denver's better upscale casual Latin restaurants" },
    ],
    casual: [
      { name: "Hey Kiddo", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "All-day café and wine bar, one of Denver's most beloved neighborhood spots" },
      { name: "Wildflower", signals: ["eater_38"], axis: ["culinary_prestige", "freshness"], notes: "One of Denver's more interesting newer creative casual restaurants" },
      { name: "The Bindery", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Linda Hampsten Fox's all-day café and market, one of Denver's most beloved community spots" },
      { name: "Odie B's", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Denver's newer neighborhood restaurants generating strong local buzz" },
      { name: "Spuntino", signals: ["eater_38"], axis: ["culinary_prestige", "local_authority"], notes: "Italian-influenced, one of Denver's more accomplished casual Italian spots" },
      { name: "Molotov Kitschen + Cocktails", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "Creative cocktails and food, one of Denver's more interesting neighborhood spots" },
      { name: "Little Arthur's at Out of the Barrel Taproom", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Denver's more distinctive brewery and food combos" },
      { name: "Woody's Wings N Things", signals: ["eater_38"], axis: ["authenticity_value", "local_authority"], notes: "Wings institution, one of Denver's most beloved casual spots for wings" },
      { name: "Odell's Bagel", signals: ["eater_38"], axis: ["local_authority", "freshness"], notes: "One of Denver's better bagel spots" },
    ],
  },

};

// ─── EXPERIENCE SIGNALS DATABASE ──────────────────────────────────────────────
// Activities, neighborhoods, and experiences for local discovery queries
// ─────────────────────────────────────────────────────────────────────────────

const EXPERIENCE_SIGNALS_DB = {

  "Seattle": [
    { name: "Pike Place Market", type: "market", axis: ["local_authority", "populist"], notes: "Essential Seattle, go early morning before crowds, fish throw is touristy but the produce and food stalls are genuinely excellent" },
    { name: "Capitol Hill", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Seattle's most vibrant neighborhood — restaurants, bars, music, independent shops, walkable" },
    { name: "Ballard", type: "neighborhood", axis: ["local_authority"], notes: "Scandinavian heritage, excellent restaurant row on NW Market St, Sunday farmers market April-December" },
    { name: "Fremont", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Self-proclaimed 'Center of the Universe', Sunday market, quirky public art, Un Bien and Kamonegi" },
    { name: "Columbia City", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Southeast Seattle, genuinely diverse neighborhood, underrated dining scene" },
    { name: "Chihuly Garden and Glass", type: "museum", axis: ["trusted_authority"], notes: "Dale Chihuly's studio glass works, Seattle Center, genuinely impressive even for non-art people" },
    { name: "Olympic Sculpture Park", type: "outdoors", axis: ["local_authority"], notes: "Free SAM outdoor sculpture park on the waterfront, great views of the Olympics on clear days" },
    { name: "Kerry Park", type: "outdoors", axis: ["populist", "local_authority"], notes: "Best view of Seattle skyline with Mt. Rainier behind it, Queen Anne, go at golden hour" },
    { name: "Burke-Gilman Trail", type: "outdoors", axis: ["local_authority"], notes: "Paved trail along Lake Union and Lake Washington, biking or walking, very Seattle" },
    { name: "Ferry to Bainbridge Island", type: "day_trip", axis: ["local_authority"], notes: "35 min ferry, charming small town, great views of Seattle skyline from the water, easy half day" },
    { name: "Hiram M. Chittenden Locks", type: "attraction", axis: ["local_authority"], notes: "Ballard Locks — watch boats and salmon migrate, free, surprisingly fascinating" },
  ],

  "Portland": [
    { name: "Powell's City of Books", type: "attraction", axis: ["local_authority", "populist"], notes: "World's largest independent bookstore, Pearl District, a genuine Portland institution — not just a tourist stop" },
    { name: "Mississippi Avenue", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "North Portland, independent shops, bars, restaurants, one of Portland's most vibrant streets" },
    { name: "Division Street", type: "neighborhood", axis: ["local_authority"], notes: "Southeast Portland's restaurant row, incredible density of great dining, walkable" },
    { name: "Alberta Arts District", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Northeast Portland, galleries, independent restaurants and bars, Last Thursday art walk" },
    { name: "Forest Park", type: "outdoors", axis: ["local_authority"], notes: "5,200 acres of urban forest, Wildwood Trail, one of the largest urban forests in the US — genuinely impressive" },
    { name: "Lan Su Chinese Garden", type: "attraction", axis: ["trusted_authority"], notes: "Authentic Ming Dynasty-style garden, Old Town, peaceful and beautiful, underrated" },
    { name: "Portland Waterfront", type: "outdoors", axis: ["local_authority"], notes: "Tom McCall Waterfront Park, walk or bike, great views and people-watching" },
    { name: "Portland Saturday Market", type: "market", axis: ["local_authority", "authenticity_value"], notes: "Largest continuously operating outdoor arts and crafts market in the US, under Burnside Bridge, March-December" },
    { name: "Multnomah Falls", type: "day_trip", axis: ["populist", "trusted_authority"], notes: "620-foot waterfall, 30 min east of Portland, Columbia River Gorge — go early to avoid crowds" },
    { name: "Pearl District", type: "neighborhood", axis: ["local_authority"], notes: "Galleries, Powell's, upscale restaurants, walkable, good base for exploring" },
  ],

  "Vancouver": [
    { name: "Granville Island", type: "market", axis: ["local_authority", "populist"], notes: "Public market, artisan studios, False Creek waterfront — best visited on weekday mornings to avoid weekend crowds" },
    { name: "Stanley Park", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "1,000-acre old-growth forest peninsula, seawall walk with views of mountains and city, totem poles, one of the world's great urban parks" },
    { name: "Gastown", type: "neighborhood", axis: ["local_authority"], notes: "Historic cobblestone district, steam clock, excellent restaurants and cocktail bars, good starting point for exploring" },
    { name: "Chinatown", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "One of North America's most authentic Chinatowns, Dr. Sun Yat-Sen Garden, Phnom Penh, emerging arts scene" },
    { name: "Commercial Drive", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "The Drive — Italian heritage meets bohemian culture, independent cafés, Caffé La Tana, neighborhood feel" },
    { name: "Main Street", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Vancouver's most vibrant dining and bar corridor, Burdock & Co, Anh and Chi, The Acorn, walkable" },
    { name: "Kitsilano Beach", type: "outdoors", axis: ["local_authority"], notes: "West side beach with mountain views, outdoor pool, Kits neighborhood has excellent cafés and restaurants" },
    { name: "Capilano Suspension Bridge", type: "attraction", axis: ["populist"], notes: "Touristy but genuinely impressive — 450-foot suspension bridge through old-growth rainforest, 30 min from downtown" },
    { name: "Seawall Walk", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "22km waterfront path around Stanley Park and False Creek, walk or rent a bike, best views of mountains and city" },
    { name: "North Shore Mountains", type: "day_trip", axis: ["local_authority"], notes: "Grouse Mountain, Cypress, Mount Seymour — skiing in winter, hiking in summer, 30 min from downtown via SeaBus" },
    { name: "Richmond Night Market", type: "market", axis: ["authenticity_value", "local_authority"], notes: "Seasonal (May-Oct), largest night market in North America, exceptional Asian street food, 30 min from downtown" },
    { name: "Ferry to Victoria", type: "day_trip", axis: ["local_authority"], notes: "BC Ferries to Victoria, 90 min, charming British Columbia capital, Butchart Gardens, great day or overnight trip" },
  ],

  "San Francisco": [
    { name: "Mission District", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "SF's most vibrant neighborhood — taquerias, Californios, Lazy Bear, Valencia Street shops, Latin culture and arts, walkable" },
    { name: "North Beach", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Italian-American heritage, City Lights Bookstore, Vesuvio bar, Golden Boy Pizza, Beat Generation history" },
    { name: "Outer Sunset", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Foggy beach neighborhood, Irving Street restaurants, Outerlands, Old Mandarin Islamic, local surfer culture, not tourist" },
    { name: "Inner Richmond", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Clement Street — SF's other Chinatown, Mandalay, Breadbelly, excellent Asian food, very local" },
    { name: "Ferry Building Marketplace", type: "market", axis: ["local_authority", "trusted_authority"], notes: "Saturday farmers market is essential, artisan food producers, Embarcadero waterfront, outstanding Saturday mornings" },
    { name: "Golden Gate Park", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "1,000+ acres, de Young Museum, California Academy of Sciences, Japanese Tea Garden, bison paddock — explore by bike" },
    { name: "Dolores Park", type: "outdoors", axis: ["local_authority", "populist"], notes: "Mission, SF's living room, sunny days bring out the whole city, great views of downtown skyline" },
    { name: "Divisadero Street", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "NoPa corridor, The Progress, excellent bars and restaurants, walkable, less touristy than many SF neighborhoods" },
    { name: "Alcatraz", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Book weeks in advance, night tours are best, genuinely fascinating history — not just a tourist trap" },
    { name: "Marin Headlands", type: "day_trip", axis: ["local_authority"], notes: "30 min across Golden Gate Bridge, dramatic Pacific views, hiking, Point Bonita Lighthouse, best views of the bridge" },
    { name: "Muir Woods", type: "day_trip", axis: ["trusted_authority", "populist"], notes: "Old-growth coastal redwoods, 30 min from SF, shuttle required on weekends, genuinely awe-inspiring" },
    { name: "Tartine Manufactory", type: "bakery", axis: ["local_authority", "trusted_authority"], notes: "Chad Robertson's bread institution, Mission, morning pastries are legendary — arrive early or queue" },
  ],

  "Sonoma County": [
    { name: "Healdsburg", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "The epicenter of Wine Country dining — single square town plaza surrounded by excellent restaurants, tasting rooms, and boutique hotels. Dry Creek Valley and Alexander Valley within minutes." },
    { name: "Dry Creek Valley", type: "wine", axis: ["trusted_authority", "local_authority"], notes: "Zinfandel and Cabernet Sauvignon country, old vine Zin is the signature, Quivira and Ridge Monte Bello nearby, intimate tasting rooms without Napa crowds" },
    { name: "Russian River Valley", type: "wine", axis: ["trusted_authority", "local_authority"], notes: "Pinot Noir and Chardonnay, morning fog, Williams Selyem and Rochioli are the benchmarks, Guerneville as base for redwoods access" },
    { name: "Guerneville and Armstrong Redwoods", type: "outdoors", axis: ["local_authority"], notes: "Russian River resort town, Armstrong Redwoods State Natural Reserve (old-growth), river swimming in summer, very different vibe from Healdsburg" },
    { name: "Bodega Bay", type: "outdoors", axis: ["local_authority"], notes: "Pacific Coast fishing village, 45 min from Healdsburg, Hitchcock's The Birds filming location, excellent Dungeness crab in season, dramatic coast" },
    { name: "Glen Ellen and Sonoma Valley", type: "neighborhood", axis: ["local_authority"], notes: "Jack London State Historic Park, Valley Bar and Bottle, Glen Ellen Star, quieter than Healdsburg, beautiful valley floor" },
    { name: "Sonoma Plaza", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Historic town square, Bear Flag Republic history, excellent tasting rooms around the plaza, more accessible and less expensive than Healdsburg" },
    { name: "Petaluma", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "South Sonoma County, emerging food scene, Bijou, easy access from SF, historic riverfront district" },
    { name: "West Sonoma Coast AVA", type: "wine", axis: ["trusted_authority", "local_authority"], notes: "Cool climate Pinot Noir from Fort Ross-Seaview, extreme terroir, producers like Hirsch and Fort Ross Vineyard, worth seeking out" },
  ],

  "Napa Valley": [
    { name: "Yountville", type: "neighborhood", axis: ["trusted_authority", "culinary_prestige"], notes: "Thomas Keller's domain — French Laundry, Bouchon, Ad Hoc all here. Small town, walkable, highest restaurant density per capita in the US. North Block Hotel is excellent base." },
    { name: "St. Helena", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Mid-valley, Press Restaurant, charming Main Street, Meadowood nearby, quieter than Yountville, excellent for a slower pace" },
    { name: "Calistoga", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Northern end of valley, geothermal activity, mud baths and spa culture, more laid-back than southern Napa, Indian Springs Resort" },
    { name: "Downtown Napa", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Oxbow Public Market, Compline, Zuzu, riverside walkway, most walkable part of the valley, good base without paying Yountville prices" },
    { name: "Oxbow Public Market", type: "market", axis: ["local_authority", "populist"], notes: "Downtown Napa, artisan food vendors, Fatted Calf charcuterie, Model Bakery English muffins, Three Twins ice cream, excellent for lunch" },
    { name: "Stags Leap District", type: "wine", axis: ["trusted_authority"], notes: "Famous for the 1976 Paris Tasting Cabernet that beat Bordeaux, Stag's Leap Wine Cellars and Clos Du Val, structured and elegant Cabs" },
    { name: "Rutherford", type: "wine", axis: ["trusted_authority"], notes: "Rutherford Dust — distinctive mid-valley terroir, Inglenook (Coppola), Beaulieu Vineyard, Rubicon is the benchmark" },
    { name: "Oakville", type: "wine", axis: ["trusted_authority"], notes: "Opus One, Far Niente, Robert Mondavi — the heart of Napa Cabernet, Oakville Grocery is a classic pit stop" },
    { name: "Howell Mountain", type: "wine", axis: ["trusted_authority", "local_authority"], notes: "High elevation AVA, volcanic soils, tannic and structured Cabs that need time, Dunn Vineyards is the benchmark" },
    { name: "Meadowood", type: "experience", axis: ["trusted_authority", "culinary_prestige"], notes: "St. Helena resort, former Michelin 3-star (pre-fire), The Restaurant is rebuilt and worth knowing about for serious Wine Country visitors" },
    { name: "French Laundry", type: "experience", axis: ["trusted_authority", "culinary_prestige"], notes: "Thomas Keller's Yountville landmark, one of the world's great restaurants, book exactly 2 months ahead online at midnight — it's that competitive" },
  ],

  "Monterey and Carmel": [
    { name: "Carmel-by-the-Sea", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Fairy-tale village, no street addresses, art galleries, L'Auberge Carmel and Chez Noir, Ocean Avenue shopping, walk to Carmel Beach — one of California's most distinctive small towns" },
    { name: "Carmel Beach", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "White sand, cypress trees, dogs welcome off-leash, one of the most beautiful beaches in California — sunset here is not to be missed" },
    { name: "17-Mile Drive", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Scenic toll road through Pebble Beach, Ghost Tree, Lone Cypress, Seal Rock — worth the $11.50 toll, allow 2-3 hours to stop properly" },
    { name: "Point Lobos State Reserve", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Called the greatest meeting of land and sea by Ansel Adams, tidepools, sea otters, dramatic rocky coast, reserve parking in advance on weekends" },
    { name: "Monterey Bay Aquarium", type: "attraction", axis: ["trusted_authority", "populist"], notes: "World-class aquarium, open ocean exhibit and kelp forest are stunning, allow half day minimum, buy tickets in advance" },
    { name: "Cannery Row", type: "neighborhood", axis: ["populist"], notes: "Steinbeck's Cannery Row, touristy but the waterfront walk is pleasant, good for a casual stroll and seafood lunch" },
    { name: "Pacific Grove", type: "neighborhood", axis: ["local_authority"], notes: "Butterfly town, Victorian architecture, Passionfish, quieter and more residential than Carmel, excellent coastal walking" },
    { name: "Big Sur", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "45 min south, one of the world's great coastal drives, Bixby Bridge, McWay Falls, Post Ranch Inn — allow a full day, check road conditions" },
    { name: "Pebble Beach Golf Links", type: "experience", axis: ["trusted_authority", "culinary_prestige"], notes: "One of the world's great golf courses, public play available but expensive, 18th hole ocean view is iconic — book months ahead" },
    { name: "Carmel Valley", type: "wine", axis: ["local_authority"], notes: "Inland from Carmel, sunny microclimate, Pinot Noir and Chardonnay, Bernardus Lodge and Winery, far fewer crowds than Napa" },
    { name: "Santa Lucia Highlands", type: "wine", axis: ["trusted_authority", "local_authority"], notes: "High elevation AVA above Salinas Valley, cool climate Pinot Noir and Chardonnay, Pisoni and Roar are benchmarks, underrated relative to quality" },
  ],

  "Los Angeles": [
    { name: "Silver Lake", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "East side hipster heartland, Reservoir, independent coffee shops, Oy Bar, great for walking and people-watching, very LA creative class" },
    { name: "Los Feliz", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Old LA neighborhood, Vermont Avenue restaurants, Goldburger, Hillhurst Ave, Griffith Observatory above, one of LA's most walkable areas" },
    { name: "Arts District", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Downtown LA, Bavel, galleries, converted industrial spaces, excellent cocktail bars, one of LA's most dynamic neighborhoods" },
    { name: "Koreatown", type: "neighborhood", axis: ["authenticity_value", "local_authority"], notes: "24-hour city within a city, best Korean BBQ in the US outside Korea, norebang (karaoke), late night food culture, genuinely vibrant" },
    { name: "San Gabriel Valley", type: "neighborhood", axis: ["authenticity_value", "local_authority"], notes: "Best Chinese food in North America outside Hong Kong and Vancouver, Bistro Na's, Din Tai Fung original US location, SGV is a food pilgrimage" },
    { name: "East LA / Boyle Heights", type: "neighborhood", axis: ["authenticity_value", "local_authority"], notes: "Historic Mexican-American community, Taquería Frontera, authentic taquerias and panaderías, the real LA Mexican food experience" },
    { name: "Venice Beach", type: "outdoors", axis: ["populist", "local_authority"], notes: "Boardwalk, Muscle Beach, Abbot Kinney Boulevard (excellent restaurants and shops), Rose Avenue food scene, sunset walk is essential" },
    { name: "Griffith Observatory", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Free admission to grounds, views of LA and Hollywood Sign, planetarium shows require tickets, go at sunset or after dark for city lights" },
    { name: "Getty Center", type: "attraction", axis: ["trusted_authority"], notes: "Free admission (parking fee), Richard Meier architecture, Impressionist collection, garden is remarkable, views of LA on clear days" },
    { name: "Grand Central Market", type: "market", axis: ["local_authority", "populist"], notes: "Downtown LA, historic food hall since 1917, Holbox, Eggslut, DTLA Cheese, excellent diversity of options, lunch destination" },
    { name: "Abbot Kinney Boulevard", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Venice, the mile, boutique shopping and excellent restaurants, Sunday farmers market, one of LA's most pleasant walking streets" },
    { name: "Malibu", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "30-40 min from Santa Monica, Zuma Beach, Nobu Malibu, Point Dume, Malibu Lagoon, celebrity ranches — drive PCH for the experience" },
    { name: "Chinatown", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Howlin' Ray's, galleries, Philippe the Original (French dip since 1908), interesting for food and a quick wander" },
  ],

  "Orange County": [
    { name: "Laguna Beach", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Artist colony, cliff-side galleries, Pageant of the Masters in summer, dramatic cove beaches, Main Beach is the classic scene — more authentic than Newport" },
    { name: "Newport Beach", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Balboa Peninsula, ferry to Balboa Island, fun zone, Duffy boat rentals, upscale shopping at Fashion Island — classic OC wealth culture" },
    { name: "Corona del Mar", type: "neighborhood", axis: ["local_authority"], notes: "Small beach village between Newport and Laguna, excellent restaurants (Farmhouse, Mayfield), tidepools at Little Corona, one of OC's most pleasant beach towns" },
    { name: "Little Saigon", type: "neighborhood", axis: ["authenticity_value", "local_authority"], notes: "Westminster/Garden Grove, largest Vietnamese community outside Vietnam, Brodard, Pho 79, Banh Cuon — a genuine food pilgrimage destination" },
    { name: "Crystal Cove State Park", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "3.2 miles of beach, historic 1930s beach cottages you can rent, excellent snorkeling, one of the best beach parks in Southern California" },
    { name: "Disneyland Resort", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Anaheim, the original, always crowded — book Lightning Lane passes, go on weekdays, avoid school holidays. California Adventure has better food and drinks." },
    { name: "San Juan Capistrano", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Mission San Juan Capistrano (swallows returning in March), Heritage Barbecue, charming historic downtown, most authentic Mission-era town in SoCal" },
    { name: "Balboa Island", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Ferry from Newport, frozen chocolate bananas are iconic, fun walk around the small island, very classic OC" },
    { name: "Huntington Beach", type: "outdoors", axis: ["populist"], notes: "Surf City USA, US Open of Surfing venue, long flat beach good for walking, more laid-back than Newport" },
  ],

  "San Diego": [
    { name: "La Jolla", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Upscale coastal village, La Jolla Cove (sea lions and snorkeling), George's at the Cove, Addison in Del Mar nearby, Birch Aquarium, one of California's most beautiful coastal settings" },
    { name: "North Park", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "SD's most vibrant food and bar neighborhood, Soichi Sushi, Wormwood, Tribute Pizza, 30th Street corridor, very walkable" },
    { name: "Little Italy", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Waterfront neighborhood, Saturday farmers market (best in SD), Animae, Herb & Wood, Piazza della Famiglia, good for walking and eating" },
    { name: "Balboa Park", type: "attraction", axis: ["trusted_authority", "populist"], notes: "1,200 acres, 17 museums including the San Diego Museum of Art, San Diego Zoo, Mingei International Museum, Artifact restaurant — a full day destination" },
    { name: "San Diego Zoo", type: "attraction", axis: ["trusted_authority", "populist"], notes: "One of the world's great zoos, Balboa Park, Safari Park in Escondido is excellent for African animals — book tickets in advance" },
    { name: "Ocean Beach", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "OB — laid-back beach town, independent shops, Cesarina, The Fishery, Sushi Tadokoro, farmers market Wednesday evenings, very un-touristy" },
    { name: "Coronado Island", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Ferry or bridge from downtown, Hotel del Coronado, wide flat beach, military history, pleasant for a half day or overnight" },
    { name: "Tijuana", type: "day_trip", axis: ["authenticity_value", "local_authority"], notes: "30 min south, Avenida Revolución and Zona Gastronómica, Caesar salad was invented here, extraordinary tacos and seafood, cross at San Ysidro — bring passport" },
    { name: "Gaslamp Quarter", type: "neighborhood", axis: ["populist"], notes: "Downtown entertainment district, Victorian architecture, bars and restaurants — more nightlife than food destination, but good for a walking tour of historic downtown" },
    { name: "Encinitas", type: "neighborhood", axis: ["local_authority"], notes: "North County beach town, surf culture, Self-Realization Fellowship gardens, excellent café scene, Swami's surf break, 30 min from downtown" },
    { name: "Point Loma", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Cabrillo National Monument, whale watching December-March, tide pools, panoramic views of the harbor and downtown skyline" },
  ],

  "Palm Springs": [
    { name: "Palm Canyon Drive", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Main street, mid-century modern architecture, galleries, restaurants, the Rat Pack era well-preserved — walk north to south for the full picture" },
    { name: "Palm Springs Art Museum", type: "attraction", axis: ["trusted_authority"], notes: "Excellent modern and contemporary collection, free Thursday evenings, beautiful building, underrated" },
    { name: "Modernism Week", type: "event", axis: ["trusted_authority", "local_authority"], notes: "February, massive celebration of mid-century modern architecture, home tours, lectures, parties — book 6+ months ahead, the best time to visit" },
    { name: "Indian Canyons", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Agua Caliente Band of Cahuilla Indians tribal land, palm oases and canyon hikes 15 min from downtown, genuinely beautiful and culturally significant" },
    { name: "Aerial Tramway", type: "attraction", axis: ["populist", "local_authority"], notes: "Rotates as it climbs 8,516 feet in 10 minutes from desert floor to San Jacinto mountains, 30-40 degree temperature difference, hiking at the top" },
    { name: "Joshua Tree National Park", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "45 min from Palm Springs, otherworldly boulder formations and Joshua trees, star gazing is extraordinary, go early morning or late afternoon to avoid heat" },
    { name: "Coachella Valley", type: "experience", axis: ["populist"], notes: "April music festivals (Coachella, Stagecoach) bring massive crowds and prices — avoid unless attending. Otherwise Palm Springs is a different, quieter experience." },
    { name: "Sunnylands", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "Annenberg estate, winter White House for presidents, beautiful gardens, free timed entry tickets required, genuinely fascinating history" },
  ],

  "Santa Barbara": [
    { name: "Funk Zone", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Former industrial district near the train station, best urban wine tasting corridor in California, The Lark, Lucky Penny, Bibi Ji, Dusk — walkable and excellent" },
    { name: "State Street", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Main street running from mountains to ocean, Spanish Colonial Revival architecture, La Arcada courtyard, Santa Barbara Museum of Art" },
    { name: "Santa Barbara Courthouse", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "1929 Spanish Colonial Revival masterpiece, free to visit, climb the Sunken Gardens clock tower for the best view of the city and the Channel Islands — essential" },
    { name: "Mission Santa Barbara", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "1786, most beautiful of the California missions, still active parish, rose garden, museum, the Queen of the Missions — genuinely moving" },
    { name: "Stearns Wharf", type: "outdoors", axis: ["populist", "local_authority"], notes: "Historic pier, harbor views, casual seafood, Santa Barbara Channel Company wine tasting with Channel Islands backdrop" },
    { name: "Santa Ynez Valley", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "45 min over the mountains, Sideways country, Los Olivos tasting rooms, Solvang Danish village, Foxen and Zaca Mesa wineries, completely different landscape from coastal SB" },
    { name: "Montecito", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Adjacent to Santa Barbara, one of California's wealthiest enclaves, Oprah and celebrities, Butterfly Beach, San Ysidro Ranch, Bar Lou — the velvet rope version of SB" },
    { name: "Butterfly Beach", type: "outdoors", axis: ["local_authority"], notes: "Montecito, faces west for sunset views, less crowded than State Beach, one of the best sunset spots on the Central Coast — bring a bottle of wine" },
    { name: "Channel Islands National Park", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "Boat from Sea Landing, Santa Cruz Island most accessible, kayaking through sea caves, endemic wildlife, one of California's most undervisited national parks" },
    { name: "Cold Spring Tavern", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "1880s stagecoach stop in the mountains, 20 min from downtown, weekend tri-tip and wild boar chili, bikers and hikers, live music weekends — one of California's most atmospheric roadhouses" },
  ],

  "Yosemite and Lake Tahoe": [
    { name: "Yosemite Valley", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "El Capitan, Half Dome, Bridalveil Fall — book accommodations 6 months ahead, arrive before 7am to avoid crowds, free shuttle within the valley" },
    { name: "The Ahwahnee", type: "experience", axis: ["trusted_authority", "culinary_prestige"], notes: "Historic 1927 hotel inside Yosemite Valley, National Historic Landmark, dining room is spectacular even for non-guests — dinner reservations recommended" },
    { name: "Glacier Point", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Best panoramic view in Yosemite, Half Dome and the high country visible, drive or hike — sunset here is extraordinary" },
    { name: "Tuolumne Meadows", type: "outdoors", axis: ["local_authority"], notes: "High Sierra, 8,600 feet, subalpine meadows, far fewer crowds than the Valley, serious hiking terrain, Tioga Road closes in winter" },
    { name: "North Lake Tahoe", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Clearer water, more upscale, Tahoe City and Kings Beach, better hiking, Squaw Valley (Palisades Tahoe) for skiing — more scenic than South Shore" },
    { name: "South Lake Tahoe", type: "outdoors", axis: ["populist", "local_authority"], notes: "Heavenly ski resort, casinos just across Nevada border, busier and more commercial than North Shore, Emerald Bay is the must-see" },
    { name: "Emerald Bay", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Most photographed spot in Tahoe, Vikingsholm castle on the shore, brilliant turquoise water, boat tours available — go early to avoid parking nightmare" },
    { name: "D.L. Bliss State Park", type: "outdoors", axis: ["local_authority"], notes: "West Shore, beautiful pine forest and lake access, one of Tahoe's best campgrounds, excellent swimming beaches" },
    { name: "Palisades Tahoe", type: "experience", axis: ["trusted_authority", "populist"], notes: "Formerly Squaw Valley, 1960 Winter Olympics site, best skiing on the North Shore, Village has good après-ski" },
  ],

  "Oakland and East Bay": [
    { name: "Temescal", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Oakland's most vibrant food neighborhood, Telegraph Avenue corridor, Bake Sum, Snail Bar, independent coffee shops, one of the Bay Area's best casual dining strips" },
    { name: "Fruitvale", type: "neighborhood", axis: ["authenticity_value", "local_authority"], notes: "Oakland's Latino cultural heart, Day of the Dead celebrations, excellent taquerias and tamalarias, Fruitvale BART station murals, genuinely vibrant community" },
    { name: "Rockridge", type: "neighborhood", axis: ["local_authority"], notes: "College Avenue, Ramen Shop, wine shops, independent bookstores, one of Oakland's most pleasant and walkable neighborhoods, Piedmont Avenue adjacent" },
    { name: "Jack London Square", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Waterfront, ferry to SF, farmers market Sunday, Top Hatters, Sunday market, historic First and Last Chance Saloon that Jack London actually drank in" },
    { name: "Oakland Museum of California", type: "attraction", axis: ["trusted_authority"], notes: "Art, history, and natural science of California, Friday evenings have food trucks and live music — genuinely excellent and undervisited by non-locals" },
    { name: "Lake Merritt", type: "outdoors", axis: ["local_authority"], notes: "Urban saltwater lake, 3.4 mile walk around, Saturday farmers market, gondola rides, beautiful at sunset — the heart of Oakland" },
    { name: "Berkeley", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "UC Berkeley campus (Sather Tower views), Telegraph Avenue, Gourmet Ghetto (Chez Panisse's neighborhood), Great China, Standard Fare, more laid-back than SF" },
    { name: "Chez Panisse", type: "experience", axis: ["trusted_authority", "culinary_prestige"], notes: "Alice Waters' legendary Berkeley restaurant, mother of California cuisine, prix fixe downstairs ($125+) or à la carte café upstairs — book weeks ahead, historically important" },
    { name: "Point Richmond", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Historic refinery town on the bay, Bull Valley Roadhouse, Sailing Goat, quiet and atmospheric, very few tourists" },
  ],

  "Oahu": [
    { name: "Chinatown Honolulu", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "The Pig and the Lady, Fete, Pizza Mamo, Bar Maze — Honolulu's most vibrant dining and arts district, walkable, not touristy" },
    { name: "Kaimuki", type: "neighborhood", axis: ["local_authority"], notes: "Inland Honolulu neighborhood, Mud Hen Water, Over Easy, The Curb — the best local dining neighborhood away from Waikiki" },
    { name: "North Shore", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Pipeline, Sunset Beach, Waimea Bay — world-class surf December-February, shrimp trucks, Turtle Bay, Ted's Bakery chocolate haupia cream pie (Sunset Beach, non-negotiable), the authentic Hawaii that Waikiki isn't. This is where Hawaii locals and serious surfers live — a completely different island from the resort corridor." },
    { name: "Kailua", type: "neighborhood", axis: ["local_authority"], notes: "Windward side, Kailua Beach (one of the world's best), Lanikai, Moke's pancakes, kayaking to the Mokes — 45 min from Waikiki, worth every minute" },
    { name: "Diamond Head", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "1.6 mile round trip hike, 560-foot crater summit, panoramic Honolulu and coastline views — go before 8am, brings water, gets hot" },
    { name: "Pearl Harbor", type: "attraction", axis: ["trusted_authority", "populist"], notes: "USS Arizona Memorial, book boat tour tickets in advance (free but limited), Battleship Missouri, Pacific Aviation Museum — allow full morning" },
    { name: "Waikiki Beach", type: "outdoors", axis: ["populist"], notes: "The famous strip, tourist-facing but the surf lessons and sunset canoe rides are genuinely fun, great people-watching — just avoid the restaurants on Kalakaua Ave" },
    { name: "Hanauma Bay", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Marine sanctuary, best snorkeling on Oahu, mandatory education video before entry, closed Tuesday — book online days in advance" },
    { name: "Manoa Falls", type: "outdoors", axis: ["local_authority"], notes: "Short hike through lush rainforest valley, 150-foot waterfall, 20 min from Waikiki — go early before it gets crowded and muddy" },
    { name: "Ala Moana Beach Park", type: "outdoors", axis: ["local_authority"], notes: "Where Honolulu locals actually swim, protected lagoon, Magic Island, excellent sunset spot — across from Ala Moana Center" },
  ],

  "Las Vegas": [
    { name: "The Strip", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Las Vegas Boulevard, walk it once at night for the spectacle — Bellagio fountains, High Roller observation wheel, Sphere — but eat and drink off-Strip for the best experiences" },
    { name: "Fremont Street", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Downtown Las Vegas, the original casino strip, Fremont Street Experience light show, more local and gritty than the Strip, Golden Steer nearby" },
    { name: "The Arts District", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "18b Arts District, galleries, independent restaurants and bars, First Friday monthly art walk, the most interesting non-casino neighborhood in Las Vegas" },
    { name: "Sphere", type: "attraction", axis: ["trusted_authority", "populist"], notes: "18,000-seat immersive venue, exterior LED display visible for miles, Darren Aronofsky's Postcard from Earth is stunning — book well in advance for any show" },
    { name: "Neon Museum", type: "attraction", axis: ["local_authority", "trusted_authority"], notes: "Outdoor boneyard of historic Las Vegas signs, night tours are spectacular, genuinely moving history of the city's visual culture" },
    { name: "Red Rock Canyon", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "20 min from the Strip, 13-mile scenic drive, excellent hiking, dramatic red sandstone formations — the antidote to the casino environment" },
    { name: "The Mob Museum", type: "attraction", axis: ["local_authority", "populist"], notes: "Downtown, National Museum of Organized Crime and Law Enforcement, surprisingly excellent and well-curated, speakeasy in the basement" },
    { name: "Peppermill Lounge", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "The fireside lounge inside Peppermill Restaurant, retro Vegas at its finest, Scorpion cocktails, 24 hours — one of the last great Vegas experiences" },
  ],

  "New Orleans": [
    { name: "Garden District", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Antebellum mansions, Commander's Palace, Magazine Street shopping, oak-lined streets — take the St. Charles streetcar, most beautiful neighborhood in the city" },
    { name: "Bywater and Marigny", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Creatively vibrant neighborhoods below the French Quarter, Bacchanal, Frenchmen Street live music, more authentic than Bourbon Street, walkable" },
    { name: "Frenchmen Street", type: "experience", axis: ["local_authority", "trusted_authority"], notes: "The real New Orleans live music scene — multiple clubs with different genres spilling onto the street every night, free to walk between venues, better than Bourbon Street" },
    { name: "French Quarter", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Jackson Square, St. Louis Cathedral, Café Du Monde beignets, Royal Street antiques — walk it for the architecture and history but eat elsewhere. Avoid Bourbon Street restaurants." },
    { name: "Tremé", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Oldest African American neighborhood in the US, birthplace of jazz, Dooky Chase, second line parades on Sundays — culturally essential New Orleans" },
    { name: "Café Du Monde", type: "experience", axis: ["trusted_authority", "populist"], notes: "Beignets and café au lait, Jackson Square, 24 hours, tourist but genuinely excellent — powdered sugar everywhere, go for the experience" },
    { name: "St. Charles Streetcar", type: "experience", axis: ["local_authority", "populist"], notes: "Oldest continuously operating streetcar in the world, $1.25, rides through Uptown and Garden District — the best way to see the city's residential neighborhoods" },
    { name: "New Orleans Jazz Museum", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "Old US Mint building, excellent jazz history and instruments, free concerts in the courtyard, understated and excellent" },
    { name: "Swamp Tour", type: "experience", axis: ["populist", "local_authority"], notes: "1 hour from New Orleans, alligators and cypress swamps, Honey Island and Barataria Preserve are best — genuinely wild and memorable" },
    { name: "Magazine Street", type: "neighborhood", axis: ["local_authority"], notes: "6-mile strip through Uptown, antique shops, boutiques, restaurants, the best urban shopping street in New Orleans" },
  ],

  "Chicago": [
    { name: "Logan Square", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Chicago's most vibrant food neighborhood, Lula Café, Mi Tocaya, Daisies, Kasama — The 606 trail runs through it, excellent for a full day of eating and drinking" },
    { name: "West Loop", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Restaurant Row on Randolph Street, Smyth, Oriole, Monteverde, Green Street Smoked Meats — the densest concentration of great restaurants in Chicago" },
    { name: "Pilsen", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Mexican-American cultural heart, HaiSous, Carnitas Uruapan, National Museum of Mexican Art, colorful murals, one of Chicago's most vibrant and authentic neighborhoods" },
    { name: "Hyde Park", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "University of Chicago campus, Museum of Science and Industry, Obama Presidential Center (opening 2025), Virtue Restaurant, bookstores" },
    { name: "The Bean", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Cloud Gate in Millennium Park, free, iconic — go early morning for reflections without crowds, Frank Gehry's Pritzker Pavilion behind it for free summer concerts" },
    { name: "Art Institute of Chicago", type: "attraction", axis: ["trusted_authority"], notes: "One of the world's great art museums, Impressionist collection (Seurat's Sunday on La Grande Jatte), Chagall windows, allow 3+ hours" },
    { name: "Chicago Architecture River Cruise", type: "experience", axis: ["trusted_authority", "populist"], notes: "75-90 minutes on the Chicago River, best way to see the city's extraordinary architectural legacy, Chicago Architecture Center runs excellent tours" },
    { name: "Wicker Park and Bucktown", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Milwaukee and Damen corridors, Akahoshi Ramen, independent boutiques and bars, very walkable, great nightlife" },
    { name: "South Side", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Harold's Chicken, Calumet Fisheries, Virtue, Bronzeville jazz heritage, the authentic Chicago that tourists miss — Bridgeport, Hyde Park, Bronzeville all worth exploring" },
    { name: "Deep Dish Pizza", type: "experience", axis: ["trusted_authority", "populist"], notes: "Lou Malnati's is the local favorite (butter crust, sausage patty), Pequod's has the legendary caramelized crust, Giordano's for stuffed style — allow 45+ min bake time, always order ahead" },
    { name: "Chicago Hot Dog and Italian Beef", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Al's #1 Italian Beef on Taylor Street (the original, dipped, with hot giardiniera), Gene & Jude's for the most authentic hot dog (no ketchup, no seat), Portillo's for both — these are non-negotiable Chicago experiences" },
  ],

  "Charleston": [
    { name: "Historic District", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Rainbow Row, cobblestone streets, antebellum architecture — walk the lower peninsula, best on foot, Battery and White Point Garden for harbor views" },
    { name: "East Side", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Gullah-Geechee cultural heart, Hannibal's Kitchen, Dave's Carry-Out, the authentic African American Charleston that most visitors don't reach" },
    { name: "Sullivan's Island", type: "outdoors", axis: ["local_authority"], notes: "15 min from downtown, beautiful uncrowded beach, The Obstinate Daughter, Fort Moultrie, where Charleston locals go on weekends" },
    { name: "King Street", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Best shopping street in Charleston, excellent restaurants, antique row on Lower King, very walkable" },
    { name: "The Gullah Geechee Corridor", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "African American cultural heritage from slavery through Reconstruction, Middleton Place, McLeod Plantation — essential and sobering context for understanding Charleston" },
    { name: "Folly Beach", type: "outdoors", axis: ["local_authority", "populist"], notes: "Bohemian beach community, surf culture, 20 min from downtown, Edge of America pier for fishing and views" },
    { name: "Magnolia Plantation", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Oldest public garden in America, azaleas in spring are extraordinary, slavery memorial is thoughtful and important" },
    { name: "Husk", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Sean Brock's restaurant has evolved but the concept — celebrating heirloom Southern ingredients — influenced Charleston's entire dining scene. Worth knowing about even if not the current pinnacle." },
  ],

  "Nashville": [
    { name: "East Nashville", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "The Five Points area, Bastion, Folk, Bolton's, Dino's Bar — the most interesting neighborhood in Nashville for food and independent culture" },
    { name: "Germantown", type: "neighborhood", axis: ["local_authority"], notes: "City House, Wendell Smith's, beautiful Victorian architecture, walkable, one of Nashville's most charming neighborhoods" },
    { name: "Broadway Honky Tonks", type: "experience", axis: ["populist", "trusted_authority"], notes: "Lower Broadway, free live country music all day every day, tourist but genuinely fun — Robert's Western World is the most authentic, Tootsie's is the famous one. Skip the bachelorette party bars." },
    { name: "Ryman Auditorium", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "The Mother Church of Country Music, outstanding acoustics, self-guided tours or see a show — one of America's great music venues" },
    { name: "Country Music Hall of Fame", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Excellent museum even for non-country fans, chronicles the history of American popular music, allow 2-3 hours" },
    { name: "Nolensville Pike", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Nashville's International Boulevard, International Market (Thai), Vietnamese, Mexican, Ethiopian — the most diverse and authentic food corridor in Nashville" },
    { name: "12 South", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Walkable neighborhood, Draper James, excellent coffee shops, Instagram-famous I Believe in Nashville mural" },
    { name: "Hot Chicken", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Nashville's signature dish, Prince's Hot Chicken invented it, Bolton's is the most authentic, Hattie B's is the mainstream version — get it at least once, the heat is real" },
    { name: "Belle Meade", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Historic antebellum plantation turned winery, Tennessee whiskey and wine tasting, 20 min from downtown" },
  ],

  "Washington DC": [
    { name: "The Wharf", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Southwest waterfront development, Albi, Moon Rabbit, Cucina Morini, waterfront walks, live music venues, one of DC's most vibrant newer neighborhoods" },
    { name: "Shaw and U Street", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Historic African American cultural corridor, Ben's Chili Bowl, Lincoln Theatre, Oyster Oyster, Unconventional Diner — the most historically significant neighborhood in Black DC" },
    { name: "Adams Morgan", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "International food corridor, Ethiopian restaurants, Perry's rooftop, diverse and vibrant, 18th Street nightlife" },
    { name: "Capitol Hill", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Eastern Market (Saturday farmers market is excellent), independent restaurants and bars, beautiful rowhouses, the most livable neighborhood in DC" },
    { name: "The Mall", type: "attraction", axis: ["trusted_authority", "populist"], notes: "All Smithsonian museums are free — National Museum of African American History and Culture requires timed passes (book months ahead), Natural History and Air & Space are excellent" },
    { name: "Georgetown", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Historic waterfront neighborhood, C&O Canal towpath for walking or biking, good restaurants on M Street and Wisconsin, very walkable" },
    { name: "National Museum of African American History and Culture", type: "attraction", axis: ["trusted_authority"], notes: "The most important museum in America right now, book timed passes months in advance, allow a full day — emotionally powerful and brilliantly curated" },
    { name: "Ben's Chili Bowl", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "U Street institution since 1958, chili half-smoke is the dish, civil rights history on the walls, open late — a DC cultural landmark" },
    { name: "Dupont Circle", type: "neighborhood", axis: ["local_authority"], notes: "Embassy row, excellent independent bookstores, Bresca, Sunday farmers market, one of DC's most walkable and cosmopolitan neighborhoods" },
    { name: "Columbia Heights", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Thip Khao, Latino cultural hub, Mount Pleasant Street, the most diverse and authentic neighborhood in DC for global food" },
  ],

  "Atlanta": [
    { name: "Ponce City Market", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Historic Sears building, Talat Market, Delbar, Ticonderoga Club, rooftop carnival, best food hall in Atlanta — walkable from BeltLine" },
    { name: "The BeltLine", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "22-mile urban trail loop through neighborhoods, Eastside Trail connects Inman Park to Piedmont Park, public art throughout, the connective tissue of modern Atlanta" },
    { name: "Inman Park and Little Five Points", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Victorian neighborhood, BoccaLupo, bohemian shops, best neighborhood for walking in Atlanta, connects to the BeltLine" },
    { name: "Sweet Auburn", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "MLK National Historic Site, Ebenezer Baptist Church, The King Center, the most historically significant African American neighborhood in Atlanta — essential visit" },
    { name: "Virginia-Highland", type: "neighborhood", axis: ["local_authority"], notes: "Excellent walkable restaurant and bar strip, Highland Tap, one of Atlanta's most pleasant neighborhoods for an evening out" },
    { name: "Krog Street Market", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Inman Park, food hall and restaurants, Ticonderoga Club, connects directly to the BeltLine, one of Atlanta's most vibrant food destinations" },
    { name: "Atlanta Beltline Eastside Trail", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Walk or bike from Inman Park through Old Fourth Ward to Piedmont Park, public art, restaurants accessible from the trail, the best way to experience Atlanta's neighborhoods" },
    { name: "Fox Theatre", type: "attraction", axis: ["trusted_authority"], notes: "1929 Moorish-Egyptian movie palace, one of the great American theatrical venues, excellent touring shows, architecture tour available" },
    { name: "Martin Luther King Jr. National Historic Site", type: "attraction", axis: ["trusted_authority"], notes: "Birth home, Ebenezer Baptist Church, The King Center — free, essential American history, allow 2-3 hours" },
    { name: "Little Ethiopia", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Buford Highway corridor, Desta Ethiopian Kitchen and others, one of the best Ethiopian food destinations in the Southeast" },
    { name: "Doraville / Buford Highway", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "The most diverse food corridor in the South, Korean BBQ (9292), Vietnamese, Mexican, Burmese — a genuine food pilgrimage" },
  ],

  "Florida Keys and Key West": [
    { name: "Key West Old Town", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Duval Street, Mallory Square sunset celebration, Hemingway Home, Southernmost Point buoy — walk it, very compact, hot and humid" },
    { name: "Stock Island", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Working waterfront adjacent to Key West, Matt's, fishing boats, artists — the real Keys away from tourist Key West, worth exploring" },
    { name: "Mallory Square Sunset", type: "experience", axis: ["trusted_authority", "populist"], notes: "Every evening, street performers and vendors gather to celebrate sunset — touristy but genuinely festive, the quintessential Key West experience" },
    { name: "Hemingway Home", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Ernest Hemingway's Key West home, polydactyl cats, well-preserved period rooms — 45 min tour, worth it for literary history" },
    { name: "John Pennekamp Coral Reef State Park", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Key Largo, first undersea park in the US, excellent snorkeling and diving, glass-bottom boat tours, the best reef access in the Keys" },
    { name: "Islamorada", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Village of Islands, sportfishing capital of the world, Robbie's Marina (tarpon feeding), Theater of the Sea — the heart of the Upper Keys" },
    { name: "Seven Mile Bridge", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "One of the world's great drives, old bridge is a fishing pier and walking path, dramatic open water views in every direction" },
    { name: "Dry Tortugas National Park", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "70 miles west of Key West by seaplane or ferry, Fort Jefferson in the middle of the ocean, incredible snorkeling, camping on the island — a true bucket list experience" },
  ],

  "Miami": [
    { name: "Wynwood", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Street art mecca, Wynwood Walls, Zak the Baker, galleries, bars — best on weekends, very Instagram but genuinely impressive murals" },
    { name: "Little Havana", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Calle Ocho, Versailles, Café La Trova, domino park, live music — the cultural heart of Cuban Miami, most authentic on weekdays" },
    { name: "Design District", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Luxury shopping, Institute of Contemporary Art (free admission), Mandolin, Palm Court — beautiful architecture and public art installations" },
    { name: "South Beach", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Art Deco Historic District (Ocean Drive at night), Joe's Stone Crab, Stubborn Seed, Miami Slice — Lincoln Road for outdoor dining, avoid the beachfront tourist trap restaurants" },
    { name: "Coconut Grove", type: "neighborhood", axis: ["local_authority"], notes: "Oldest neighborhood in Miami, Ariete, Amara at Paraiso, bayfront park, sailing culture, more relaxed than South Beach" },
    { name: "Allapattah", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Emerging arts and dining neighborhood, Boia De, Maty's, Rubell Museum, one of Miami's most exciting areas for food and culture" },
    { name: "Vizcaya Museum and Gardens", type: "attraction", axis: ["trusted_authority"], notes: "1916 Italian Renaissance villa on Biscayne Bay, one of the most beautiful historic estates in America, 10 acres of formal gardens" },
    { name: "The Pérez Art Museum Miami", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "Herzog & de Meuron building on Biscayne Bay, excellent contemporary collection, free on select days" },
    { name: "Everglades National Park", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "45 min from Miami, airboat tours in the eastern glades, Anhinga Trail for wildlife (herons, alligators, anhinga), Flamingo for kayaking — genuinely wild" },
    { name: "Key Biscayne", type: "day_trip", axis: ["local_authority"], notes: "Bill Baggs Cape Florida State Park, historic lighthouse, beautiful beaches without South Beach crowds, 20 min from downtown" },
    { name: "Coral Gables", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Mediterranean Revival architecture, Miracle Mile, Venetian Pool (public pool carved from coral rock), University of Miami campus" },
  ],

  "Phoenix and Scottsdale": [
    { name: "Old Town Scottsdale", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Western-themed historic district, galleries, upscale restaurants, Fifth Avenue shops — touristy but pleasant for an evening walk and dinner" },
    { name: "Camelback Mountain", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Echo Canyon and Cholla trails, best hiking in the Phoenix metro, challenging summit, stunning views of the Valley — go before 7am in summer" },
    { name: "Heard Museum", type: "attraction", axis: ["trusted_authority"], notes: "Native American art and culture, one of the finest Native American museums in the US, essential context for understanding the Southwest" },
    { name: "Desert Botanical Garden", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Papago Park, 50,000 desert plants, Las Noches de las Luminarias in December, Chihuly glass installations — beautiful at sunset" },
    { name: "Saguaro National Park", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "Actually near Tucson (90 min), giant saguaro cacti forest, one of the most distinctive landscapes in America — worth the drive" },
    { name: "Sedona", type: "day_trip", axis: ["trusted_authority", "populist"], notes: "2 hours north, red rock formations, vortex sites, Cathedral Rock and Bell Rock hikes, excellent spa resorts — one of the American Southwest's most beautiful landscapes" },
    { name: "Salt River Tubing", type: "outdoors", axis: ["local_authority", "populist"], notes: "Float the Salt River in an inner tube, summer only, very Phoenix, bring sunscreen and beer — a genuine local summer tradition" },
    { name: "Taliesin West", type: "attraction", axis: ["trusted_authority"], notes: "Frank Lloyd Wright's winter home and studio, Scottsdale, guided tours, essential American architecture pilgrimage" },
  ],

  "Austin": [
    { name: "East Sixth Street", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "East Austin restaurant and bar corridor, Nixta, Dai Due, Birdie's, Late Night series — the most vibrant dining neighborhood in Austin" },
    { name: "South Congress Avenue", type: "neighborhood", axis: ["local_authority", "populist"], notes: "SoCo, Odd Duck, Amy's Ice Creams, vintage shops, Continental Club, the classic Austin experience — walk it on a weekend morning" },
    { name: "Barton Springs Pool", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Spring-fed pool in Zilker Park, 68 degrees year-round, $5 entry, one of Austin's most beloved local experiences — the true Austin baptism" },
    { name: "6th Street Live Music", type: "experience", axis: ["trusted_authority", "populist"], notes: "Historic and Dirty 6th have different characters — 6th and Guadalupe area is better for real music, avoid Dirty 6th tourist bars" },
    { name: "Franklin Barbecue", type: "experience", axis: ["trusted_authority", "populist"], notes: "Aaron Franklin's legendary BBQ, James Beard winner, expect 2-3 hour lines, arrive by 8am, sells out by noon — the pilgrimage every BBQ lover must make" },
    { name: "Rainey Street", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Bungalow bars and patios, Banger's sausage and beer garden, one of Austin's most pleasant bar crawl streets" },
    { name: "Mueller Neighborhood", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Redeveloped airport site, excellent Sunday farmers market, diverse restaurants, very livable — gives a sense of how Austin locals actually live" },
    { name: "Blanton Museum of Art", type: "attraction", axis: ["trusted_authority"], notes: "UT campus, one of the best university art museums in the US, Ellsworth Kelly chapel is extraordinary" },
    { name: "Texas Hill Country", type: "day_trip", axis: ["local_authority", "trusted_authority"], notes: "Fredericksburg wine country, wildflowers in spring, Enchanted Rock, Luckenbach Texas — 1.5 hours west, one of America's most underrated wine regions" },
    { name: "Gruene Historic District", type: "day_trip", axis: ["local_authority", "trusted_authority"], notes: "New Braunfels, 45 min south, Gruene Hall (oldest dance hall in Texas), Guadalupe River tubing — quintessential Texas Hill Country" },
  ],

  "Dallas": [
    { name: "Bishop Arts District", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Oak Cliff, walkable neighborhood, Lucia, independent shops and restaurants, one of Dallas's most charming and authentic neighborhoods" },
    { name: "Deep Ellum", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Historic arts and music district, live music venues, murals, excellent restaurants — the most culturally vibrant neighborhood in Dallas" },
    { name: "Dallas Arboretum", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "White Rock Lake, 66 acres, Dallas Blooms in spring is spectacular, best public garden in North Texas" },
    { name: "Klyde Warren Park", type: "outdoors", axis: ["local_authority", "populist"], notes: "Deck park over the freeway, food trucks, yoga, chess — the living room of downtown Dallas, connects Arts District to Uptown" },
    { name: "Perot Museum of Nature and Science", type: "attraction", axis: ["trusted_authority", "populist"], notes: "World-class natural history museum, outstanding dinosaur and fossil galleries, Thom Mayne architecture" },
    { name: "Sixth Floor Museum at Dealey Plaza", type: "attraction", axis: ["trusted_authority"], notes: "JFK assassination site and museum, Texas School Book Depository — sobering and excellently curated, essential American history" },
    { name: "Dallas Arts District", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Largest urban arts district in the US, Renzo Piano's Nasher Sculpture Center, AT&T Performing Arts Center, Dallas Museum of Art — walkable and excellent" },
    { name: "Fort Worth", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "30 min west, Sundance Square, Kimbell Art Museum (Louis Kahn masterpiece), Fort Worth Stockyards, world-class cattle drive twice daily" },
  ],

  "Houston": [
    { name: "Montrose", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Houston's most vibrant and diverse neighborhood, excellent restaurants on Westheimer, Menil Collection, independent bars and shops — very walkable for Houston" },
    { name: "The Heights", type: "neighborhood", axis: ["local_authority"], notes: "Victorian bungalows, White Oak Music Hall, 19th Street shops, Squable — one of Houston's most charming neighborhoods for food and exploring" },
    { name: "Menil Collection", type: "attraction", axis: ["trusted_authority"], notes: "Free admission always, Renzo Piano building, Rothko Chapel adjacent, extraordinary collection — one of the world's great small art museums, a Houston treasure" },
    { name: "Museum of Fine Arts Houston", type: "attraction", axis: ["trusted_authority"], notes: "Le Jardinier restaurant, excellent collection, Bayou Bend historic house museum — one of the largest art museums in the US" },
    { name: "Chinatown / Bellaire", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Largest Chinatown in the South, incredible Chinese, Vietnamese, Korean food, Mala Sichuan, Brisket&Rice — one of the best food corridors in the US" },
    { name: "Buffalo Bayou Park", type: "outdoors", axis: ["local_authority"], notes: "Urban park and hike-and-bike trail, downtown skyline views, excellent for morning runs or walks — Houston's answer to Central Park" },
    { name: "Rothko Chapel", type: "attraction", axis: ["trusted_authority"], notes: "Philip Johnson's octagonal chapel housing Mark Rothko's last major works, non-denominational meditation space, Barnett Newman sculpture outside — profound and free" },
    { name: "Space Center Houston", type: "attraction", axis: ["trusted_authority", "populist"], notes: "NASA Johnson Space Center, shuttle Independence on a 747, astronaut training history — allow half day, excellent for all ages" },
  ],

  "San Antonio": [
    { name: "The River Walk", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "15 miles of riverwalk, tourist but genuinely beautiful, Biga On The Banks is the dining standout — stick to the Museum Reach north of downtown for a less touristy experience" },
    { name: "The Alamo", type: "attraction", axis: ["trusted_authority", "populist"], notes: "Free admission, the most visited historic site in Texas, the 1836 battle is deeply complicated Texas history — the museum is excellent, allow 1-2 hours" },
    { name: "Pearl District", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Former Pearl Brewery, Hotel Emma, Saturday farmers market, Mixtli, one of the most successful urban redevelopments in Texas — excellent food and atmosphere" },
    { name: "San Antonio Missions", type: "attraction", axis: ["trusted_authority"], notes: "UNESCO World Heritage Site, four active mission churches besides the Alamo, Mission San José is the most impressive — free, peaceful, genuinely historic" },
    { name: "King William Historic District", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Beautiful Victorian mansions, bed and breakfasts, walking distance to the River Walk, the most architecturally interesting neighborhood in San Antonio" },
    { name: "Brackenridge Park", type: "outdoors", axis: ["local_authority"], notes: "Museum cluster, San Antonio Zoo, Japanese Tea Garden, Sunken Garden Theater — the park heart of San Antonio" },
    { name: "McNay Art Museum", type: "attraction", axis: ["trusted_authority"], notes: "Beautiful Spanish Colonial Revival mansion, first modern art museum in Texas, excellent post-Impressionist collection, free on Sundays" },
  ],

  "New York City": [
    { name: "West Village", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Via Carota, Café Commerce, cobblestone streets, the most charming and walkable neighborhood in Manhattan — worth the visit even just to wander" },
    { name: "Williamsburg", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Four Horsemen, Lilia, L'Industrie, music venues, vintage shops — Brooklyn's most vibrant neighborhood, 10 min from Manhattan on the L train" },
    { name: "Flushing Queens", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Best Chinese food in the US, Sky Pavilion, Nan Xiang Xiaolongbao, Golden Shopping Mall basement — a genuine food pilgrimage, 30 min on the 7 train" },
    { name: "Jackson Heights Queens", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Most diverse neighborhood on earth, Nepali, Bangladeshi, Colombian, Indian — Roosevelt Avenue food crawl is one of NYC's greatest culinary experiences" },
    { name: "The High Line", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Elevated park on former rail line, excellent public art, Hudson Yards views, Chelsea art galleries below — crowded but genuinely excellent, go on weekday mornings" },
    { name: "Central Park", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "843 acres, Reservoir loop for running, Strawberry Fields, Bethesda Fountain, Conservatory Garden (free, stunning in spring), Shakespeare in the Park in summer" },
    { name: "The Metropolitan Museum of Art", type: "attraction", axis: ["trusted_authority"], notes: "The Met, one of the world's great museums, Egyptian Temple of Dendur, Impressionist galleries — suggested admission, allow 3+ hours, rooftop bar in summer" },
    { name: "Brooklyn Heights Promenade", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Best view of the Manhattan skyline, walk the Brooklyn Bridge from Brooklyn side, DUMBO below has excellent coffee and restaurants" },
    { name: "Harlem", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "Charles Pan-Fried Chicken, Apollo Theater, Strivers' Row architecture, Marcus Garvey Park, the most historically significant African American neighborhood in America" },
    { name: "Smorgasburg", type: "market", axis: ["local_authority", "populist"], notes: "Weekend outdoor food market, Williamsburg (Sat) and Prospect Park (Sun), April-October, the best food market in NYC, 100 vendors" },
    { name: "MoMA", type: "attraction", axis: ["trusted_authority"], notes: "Museum of Modern Art, Midtown, Starry Night and Water Lilies, excellent design collection, Friday evenings free after 5:30pm" },
    { name: "The Bronx", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "La Pirana Lechonera, Arthur Avenue Italian Market (better than Little Italy), Bronx Zoo, Yankee Stadium — the most undervisited borough with the most authentic food" },
    { name: "Arthur Avenue", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "The Bronx, real Italian-American neighborhood, better than Little Italy in every way — fresh pasta, butchers, cheese shops, restaurants that haven't sold out" },
  ],

  "Maui": [
    { name: "Road to Hana", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "52 miles of winding road, 600+ curves, waterfalls, black sand beaches, bamboo forests — start before 7am, Aunty Sandy's banana bread at Ke'anae, Nuka restaurant at the end, plan a full day or stay overnight in Hana" },
    { name: "Haleakala National Park", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "10,023-foot dormant volcano, sunrise above the clouds is extraordinary (reserve permits months ahead), stargazing at night, cycling down the crater is a bucket list experience" },
    { name: "Wailea", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "South Maui resort corridor, Andaz Maui and Four Seasons, excellent beaches (Wailea Beach, Polo Beach), Marlow restaurant — polished and beautiful but less local" },
    { name: "Paia", type: "neighborhood", axis: ["local_authority", "authenticity_value"], notes: "North Shore surf town, Mama's Fish House, Esters, hippie culture meets world-class windsurfing, Ho'okipa Beach Park — the most authentic town on Maui" },
    { name: "Ka'anapali", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "West Maui resort area, Whaler's Village, Black Rock snorkeling cliff dive ceremony at Sheraton at sunset — classic Maui resort experience" },
    { name: "Molokini Crater", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Submerged volcanic crater 3 miles offshore, one of the world's best snorkeling sites, 150-foot visibility on calm days — morning boats from Maalaea Harbor" },
    { name: "Iao Valley State Monument", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Central Maui, Iao Needle volcanic formation, historic 1790 battle site, lush tropical valley, free and beautiful — 30 minutes from Kahului" },
    { name: "Lahaina", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Historic whaling town, Mala Ocean Tavern, Front Street — severely impacted by 2023 wildfires, recovery ongoing. The historic district's significance to Hawaiian history and culture remains important." },
  ],

  "Aspen": [
    { name: "Aspen Mountain", type: "outdoors", axis: ["trusted_authority"], notes: "Ajax, expert terrain directly above town, gondola from the base of Main Street, one of the most convenient ski-in/ski-out mountain towns in the world" },
    { name: "Ajax Tavern", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Ski resort lunch at the Little Nell, one of the great American ski resort dining experiences, people-watching and excellent food" },
    { name: "Snowmass", type: "outdoors", axis: ["local_authority"], notes: "12 miles from Aspen, family-friendly, Base Village, more terrain than Ajax, often quieter and better value for families" },
    { name: "Maroon Bells", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "10 miles from Aspen, two 14,000-foot peaks reflected in Maroon Lake, one of the most photographed landscapes in America — shuttle required in summer" },
    { name: "Hunter Creek Trail", type: "outdoors", axis: ["local_authority"], notes: "The locals' hiking trail above Aspen, beautiful mountain meadows, connects to the backcountry, free and accessible from town" },
    { name: "Wheeler Opera House", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "1889 opera house, excellent programming year-round, one of the finest small performance venues in the Mountain West" },
    { name: "Aspen Art Museum", type: "attraction", axis: ["trusted_authority"], notes: "Shigeru Ban building, free admission, strong contemporary programming, one of the best small art museums in the Mountain West" },
  ],

  "Jackson Hole": [
    { name: "Grand Teton National Park", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Cathedral Group peaks rising above the valley floor, no entry fee with Teton Village proximity, Jenny Lake, String Lake swimming, Signal Mountain summit drive — one of America's most dramatic landscapes" },
    { name: "Yellowstone National Park", type: "day_trip", axis: ["trusted_authority", "populist"], notes: "90 min north, Old Faithful, Grand Prismatic Spring, Lamar Valley for wildlife (wolves, bison, bears) — allow 2+ days to do it justice" },
    { name: "Jackson Town Square", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Elk antler arches at each corner, Silver Dollar Bar, Snake River Grill — the classic Western town square, busy in summer and winter" },
    { name: "National Elk Refuge", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "7,000+ elk winter here December-April, sleigh rides through the refuge, one of the world's great wildlife spectacles" },
    { name: "Snake River Float", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Gentle float through the valley with Teton views, excellent wildlife viewing, multiple outfitters — one of the best ways to experience the valley floor" },
    { name: "Jackson Hole Mountain Resort", type: "outdoors", axis: ["trusted_authority"], notes: "4,139 vertical feet, most challenging resort in the US, Corbet's Couloir, Tram to 10,450 feet — serious terrain for serious skiers, stunning views even for non-skiers" },
    { name: "National Museum of Wildlife Art", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "Overlooking the National Elk Refuge, excellent American wildlife art collection, beautiful building — free on some mornings" },
  ],

  "Vail": [
    { name: "Vail Village", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Car-free Austrian-village style, excellent ski access, sweet basil, covered bridges — beautiful in snow, very convenient for ski-in/ski-out" },
    { name: "Vail Mountain", type: "outdoors", axis: ["trusted_authority"], notes: "5,289 skiable acres, Blue Sky Basin for powder, Back Bowls for wide-open terrain — one of the largest ski resorts in the US, excellent for intermediate and advanced skiers" },
    { name: "Beaver Creek", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "15 min from Vail, Alain Prost racing mountain, Zach's Cabin on-mountain lunch, less crowded than Vail, excellent intermediate terrain and extraordinary service" },
    { name: "Gerald R. Ford Amphitheater", type: "attraction", axis: ["local_authority"], notes: "Excellent summer concerts, Bravo! Vail music festival in July, one of the finest outdoor concert venues in the Mountain West" },
    { name: "Eagle Bahn Gondola", type: "outdoors", axis: ["local_authority"], notes: "Free gondola ride in summer to Game Creek, hiking, mountain biking, views — Vail's outdoor summer playground" },
  ],

  "Park City": [
    { name: "Historic Main Street", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Victorian mining town architecture, Handle, High West Distillery, galleries, excellent restaurants — Utah's most charming historic main street" },
    { name: "Park City Mountain Resort", type: "outdoors", axis: ["trusted_authority"], notes: "Largest ski resort in the US after Epic-Vail merger, 7,300 acres, connects to Canyons, Olympic Park nearby — outstanding variety of terrain" },
    { name: "Deer Valley", type: "outdoors", axis: ["trusted_authority", "culinary_prestige"], notes: "Skiers-only resort, impeccable grooming, Goldener Hirsch, Burgers & Bourbon — the most refined ski experience in Utah, strict ski-only policy" },
    { name: "Utah Olympic Park", type: "attraction", axis: ["trusted_authority", "populist"], notes: "2002 Winter Olympics venue, bobsled rides available to the public, ski jumping, luge — one of the most unique visitor experiences in ski country" },
    { name: "High West Distillery", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "World's only ski-in distillery, excellent Utah whiskey, beautiful converted livery stable — one of Park City's essential experiences" },
    { name: "Sundance Film Festival", type: "event", axis: ["trusted_authority"], notes: "January, world's premier independent film festival, Park City is the main venue — book accommodation a year ahead, town transforms completely" },
  ],

  "Sun Valley": [
    { name: "Sun Valley Resort", type: "outdoors", axis: ["trusted_authority"], notes: "America's first destination ski resort (1936), Bald Mountain for experts, Dollar Mountain for families, excellent grooming — historic and uncrowded by major resort standards" },
    { name: "Ketchum", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "The real town adjacent to the resort, Grumpy's, Pioneer Saloon, excellent galleries, Hemingway's grave — more authentic than the Sun Valley resort bubble" },
    { name: "Sawtooth National Recreation Area", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "40 minutes north, one of America's most dramatic mountain landscapes, Idaho Rocky Mountain Ranch, Stanley Basin, 40+ mountain lakes — extraordinary and uncrowded" },
    { name: "Ernest Hemingway Memorial", type: "attraction", axis: ["local_authority", "trusted_authority"], notes: "Trail Creek Cabin area off Sun Valley Road, Hemingway first came to Sun Valley in 1939 as a guest of the resort, wrote For Whom the Bell Tolls here, returned repeatedly, and died by suicide at his Ketchum home in July 1961. He is buried in the Ketchum Cemetery on North Main Street — simple grave, very moving. The memorial bust is near Trail Creek Cabin where he often dined." },
    { name: "Hemingway's Ketchum", type: "experience", axis: ["local_authority", "trusted_authority"], notes: "Self-guided walking history: Hemingway House (private, 400 block of Canyon Run), Ketchum Cemetery grave, The Casino bar at Sun Valley Lodge, Whiskey Jacques bar where locals still toast him. The Community Library has a Hemingway collection. Ketchum was where Hemingway chose to spend his final years — the landscape of the Wood River Valley is in his late writing." },
    { name: "Sun Valley Celebrity History", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Averell Harriman opened Sun Valley in 1936 as the first destination ski resort in America, brought Hollywood immediately — Gary Cooper, Clark Gable, Marilyn Monroe, Lucille Ball, Claudette Colbert all came in the early years. The Sun Valley Lodge photo gallery is extraordinary. Today Arnold Schwarzenegger, Bruce Willis, and others maintain homes in the valley. The resort still has the genteel glamour of its origins." },
    { name: "Galena Lodge", type: "outdoors", axis: ["local_authority"], notes: "Nordic skiing and mountain biking hub, 30 min north toward Stanley, beautiful high country — one of Idaho's best cross-country ski experiences" },
  ],

  "Whistler": [
    { name: "Whistler Blackcomb", type: "outdoors", axis: ["trusted_authority"], notes: "8,171 acres across two mountains, 200+ runs, Peak 2 Peak Gondola connecting the peaks — consistently rated the best ski resort in North America" },
    { name: "Peak 2 Peak Gondola", type: "experience", axis: ["trusted_authority", "populist"], notes: "Connects Whistler and Blackcomb peaks, 4.4km span, 436m above valley floor, glass floor gondola available — one of the world's great mountain gondola experiences" },
    { name: "Whistler Village", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "Car-free pedestrian village, Araxi, Bearfoot Bistro, excellent ski access, lively après scene — one of North America's best ski village designs" },
    { name: "Squamish and Sea-to-Sky Highway", type: "day_trip", axis: ["trusted_authority", "local_authority"], notes: "1.5 hours south to Vancouver, Sea-to-Sky Highway is one of the world's great drives, Shannon Falls, Stawamus Chief climbing, Britannia Mine Museum" },
    { name: "Lost Lake", type: "outdoors", axis: ["local_authority"], notes: "Walk from the village, cross-country skiing in winter, swimming and paddleboarding in summer, one of Whistler's best local escapes" },
    { name: "Audain Art Museum", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "Excellent BC Indigenous and contemporary art collection, beautiful building, one of the finest small art museums in Canada" },
    { name: "Scandinave Spa Whistler", type: "experience", axis: ["local_authority", "trusted_authority"], notes: "Outdoor hydrotherapy in the forest, après-ski essential, one of the finest Nordic spa experiences in North America — book ahead" },
  ],

  "Kauai": [
    { name: "Na Pali Coast", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "16 miles of inaccessible sea cliffs, accessible by boat tour, kayak (summer only), or the Kalalau Trail — one of the world's most dramatic coastlines, the most photographed place in Hawaii" },
    { name: "Waimea Canyon", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "The Grand Canyon of the Pacific, 10 miles long, 3,600 feet deep, red volcanic rock and waterfalls — drive up Highway 550, stop at Pu'u Hinahina lookout for the full view" },
    { name: "Hanalei", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "North Shore, taro fields, Hanalei Bay (one of Hawaii's most beautiful beaches), Bar Acuda, casual surf culture — the authentic Kauai north shore experience" },
    { name: "Poipu", type: "neighborhood", axis: ["trusted_authority", "populist"], notes: "South Shore resort area, consistent sunshine, Poipu Beach Park (monk seals sunbathe here), Grand Hyatt Kauai, Spouting Horn blowhole — the most weather-reliable part of Kauai" },
    { name: "Kalalau Trail", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "11-mile trail along Na Pali Coast to Kalalau Beach — one of the world's great hikes. The first 2 miles to Hanakapi'ai Beach are an accessible day hike. The full trail requires a camping permit (book months ahead at gostateparks.hawaii.gov). Kalalau Beach at the end has a waterfall, sea caves, and wild goats. Honopu Beach just beyond is only reachable by swimming around the rocks from Kalalau — technically off-limits but legendary among those who've been. Camp on Kalalau Beach and you'll have one of the most extraordinary nights in Hawaii." },
    { name: "Wailua River", type: "outdoors", axis: ["local_authority", "populist"], notes: "Only navigable river in Hawaii, kayak to Secret Falls (Uluwehi Falls), Fern Grotto boat tour — the most accessible adventure on Kauai" },
    { name: "Kilauea Lighthouse", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "National Wildlife Refuge, seabirds nesting on the cliffs, red-footed boobies and frigatebirds, one of Kauai's most dramatic coastal viewpoints" },
    { name: "Tunnels Beach", type: "outdoors", axis: ["local_authority", "trusted_authority"], notes: "Haena, North Shore, one of Hawaii's best snorkeling beaches, large reef system, beautiful setting under the mountains — summer only, dangerous in winter" },
  ],

  "Big Island": [
    { name: "Hawaii Volcanoes National Park", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Active volcano, Kilauea and Mauna Loa, lava tube hike (Thurston Lava Tube), Chain of Craters Road to the coast — lava viewing depends on current activity, check NPS website, allow full day" },
    { name: "Volcano House", type: "experience", axis: ["local_authority", "trusted_authority"], notes: "The only lodging inside Hawaii Volcanoes National Park, sitting directly on the rim of Kilauea caldera — at night when Kilauea is active the lava glow reflects off the steam vents from your room. The dining room looks directly into the crater. No Forbes rating, not in the R&C book, but for the traveler who wants something genuinely unforgettable on the Big Island this is the answer the Kohala Coast resorts cannot give you. Most visitors don't know you can sleep inside the park. Book well ahead — there are very few rooms." },
    { name: "Manta Ray Night Snorkel", type: "experience", axis: ["trusted_authority", "local_authority"], notes: "Keauhou Bay or Garden Eel Cove, giant manta rays feeding on plankton, one of the world's great wildlife experiences — multiple operators, go with a reputable company" },
    { name: "Mauna Kea Summit", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "13,796 feet, highest point in Hawaii, world's best stargazing, Visitor Information Station at 9,200 feet for sunset (no 4WD needed), summit requires 4WD and acclimatization" },
    { name: "Hapuna Beach", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Consistently rated one of America's best beaches, long white sand, excellent swimming, Mauna Kea Beach Hotel adjacent — arrive early for parking" },
    { name: "Waipio Valley", type: "outdoors", axis: ["trusted_authority", "local_authority"], notes: "Sacred valley of Hawaiian kings, black sand beach, waterfalls, steep road requires 4WD or tour — view from the lookout is extraordinary even without descending" },
    { name: "South Point", type: "outdoors", axis: ["local_authority"], notes: "Southernmost point in the US, dramatic sea cliffs, cliff jumping into the Pacific, ancient Hawaiian fishing heiau nearby — 45 min from Kona" },
    { name: "Punalu'u Black Sand Beach", type: "outdoors", axis: ["trusted_authority", "populist"], notes: "Black volcanic sand, green sea turtles basking on the beach, one of Hawaii's most dramatic and accessible beaches" },
    { name: "Kohala Coast", type: "neighborhood", axis: ["trusted_authority", "local_authority"], notes: "Four Seasons Hualalai, Mauna Kea Beach Hotel, Hapuna Beach Prince — the luxury resort corridor, best weather on the island, ancient heiau and petroglyph fields" },
  ],

  "Denver": [
    { name: "RiNo (River North Art District)", type: "neighborhood", axis: ["local_authority", "freshness"], notes: "Denver's most vibrant neighborhood, Beckon, Safta, Hop Alley, excellent breweries, murals everywhere — the best eating and drinking neighborhood in Denver" },
    { name: "16th Street Mall", type: "neighborhood", axis: ["populist", "local_authority"], notes: "Pedestrian mall through downtown, free shuttle, Union Station at one end (Tavernetta, excellent food hall) — good for orientation but eat elsewhere" },
    { name: "Union Station", type: "neighborhood", axis: ["local_authority", "trusted_authority"], notes: "Beautifully restored 1914 train station, Tavernetta, Terminal Bar, Crawford Hotel, Great Hall bar — the best public space in Denver" },
    { name: "Denver Art Museum", type: "attraction", axis: ["trusted_authority"], notes: "Daniel Libeskind titanium addition, excellent Native American and Western American art collections, Frederic C. Hamilton Building is architectural landmark" },
    { name: "Red Rocks Amphitheatre", type: "attraction", axis: ["trusted_authority", "local_authority"], notes: "15 miles west, natural rock amphitheater, concerts May-October, morning yoga and hiking when no shows — one of the world's great outdoor music venues, early morning hike is spectacular" },
    { name: "Rocky Mountain National Park", type: "day_trip", axis: ["trusted_authority", "populist"], notes: "90 min northwest, Trail Ridge Road (highest continuous highway in the US), elk viewing, Bear Lake hike — reserve timed entry passes online months ahead in summer" },
    { name: "Coors Field / LoDo", type: "neighborhood", axis: ["local_authority", "populist"], notes: "Lower Downtown, excellent brewpub scene, Larimer Square, walkable historic district — good for bar-hopping, better food in RiNo" },
    { name: "Golden", type: "day_trip", axis: ["local_authority", "populist"], notes: "30 min west, Coors Brewery tour (free), Clear Creek whitewater, excellent mountain town, gateway to I-70 mountain corridor" },
    { name: "Breckenridge or Vail day trip", type: "day_trip", axis: ["local_authority", "trusted_authority"], notes: "90 min on I-70, world-class skiing in winter, mountain biking and hiking in summer — Denver is the ideal base for Front Range ski access" },
  ],

};

// ── Query utilities ───────────────────────────────────────────────────────────

// Get restaurants for a city filtered by axis preference
const getRestaurantSignals = (city, axisPreference = null, cuisine = null) => {
  const cityData = RESTAURANT_SIGNALS_DB[city];
  if (!cityData) return [];
  const allRestaurants = Object.values(cityData).flat();
  // Remove duplicates (Filipino cross-listed)
  const unique = allRestaurants.filter((r, i, arr) => arr.findIndex(x => x.name === r.name) === i);
  if (axisPreference) return unique.filter(r => r.axis.includes(axisPreference));
  if (cuisine) return cityData[cuisine] || [];
  return unique;
};

// Build restaurant context string for AI prompt injection on local discovery queries
const buildRestaurantContext = (city) => {
  const cityData = RESTAURANT_SIGNALS_DB[city];
  if (!cityData) return "";
  const all = Object.entries(cityData).flatMap(([cat, items]) =>
    items.map(r => `${r.name} (${cat.replace(/_/g,' ')}): ${r.notes}`)
  );
  // Remove duplicates
  const unique = [...new Set(all)];
  return unique.join("\n");
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
      cards: (selectedCards || []).map(name => {
        const b = CARD_BENEFITS_DB[name];
        if (b) {
          const mults = b.multipliers ? Object.entries(b.multipliers).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ') : "varies";
          const perks = b.decisionLogic ? [
            b.decisionLogic.loungeAccess ? `Lounge: ${Array.isArray(b.decisionLogic.loungeAccess) ? b.decisionLogic.loungeAccess[0] : b.decisionLogic.loungeAccess}` : null,
            b.decisionLogic.firstCheckedBagFree ? "Free checked bag" : null,
            b.decisionLogic.noForeignTransactionFee ? "No foreign transaction fee" : null,
            b.decisionLogic.fineHotelsResorts ? "Fine Hotels & Resorts" : null,
          ].filter(Boolean).join(', ') : "";
          return { name, network: b.network || "Visa", multipliers: mults, perksNote: perks, annualFee: b.annualFee || 0, transferPartners: b.transferPartners || [] };
        }
        return { name, network: "Visa", multipliers: "varies", perksNote: "" };
      }),
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
                            {hasEarning && <div style={{ color: "#7a7060", fontSize: "10px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "4px" }}>+${opt.pointsValue.toLocaleString()} earned</div>}
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
                    <div style={{ color: "#9a9088", fontSize: "12px", lineHeight: "1.55" }}>{opt.whyThis}</div>
                    {opt.tradeoff && <div style={{ color: "#7a7060", fontSize: "10px", marginTop: "5px", fontStyle: "italic" }}>{opt.tradeoff}</div>}
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

// Format numbers with commas in AI-generated text strings
const fmtNums = (str) => {
  if (!str) return str;
  return String(str).replace(/(\d{4,})/g, n => parseInt(n).toLocaleString());
};

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
  const isCashback = /cashback|cash back|%\)|1\.5%/i.test(pointsStr);
  const isEarning = (/earn|earning|est\./.test(pointsStr) || isCashback) && !isRedemption;

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
            <div style={{ color: "#7a9e9a", fontSize: "11px", marginTop: "2px" }}>{fmtNums(pointsStr)}</div>
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
        <div style={{ color: "#c0b8ae", fontSize: "13px", marginBottom: "6px" }}>{fmtNums(detail)}</div>
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
            {cardReason && <span style={{ color: "#7a7060", fontSize: "10px" }}>· {cardReason}</span>}
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
          {onDismiss && !isExpanded && <button onClick={e => { e.stopPropagation(); onDismiss(option.id); }} title="Not for me — dismiss this option" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#888", fontSize: "11px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>✕</button>}
        </div>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <div style={{ color: "#e8e4dc", fontSize: "15px", fontWeight: "600", lineHeight: "1.3", marginBottom: "3px", fontFamily: "'Playfair Display',Georgia,serif" }}>{option.headline}</div>
        <div style={{ color: "#9a9088", fontSize: "12px", lineHeight: "1.4" }}>{option.subhead}</div>
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
              <div style={{ color: "#b0a898", fontSize: "13px", lineHeight: "1.7" }}>{fmtNums(option.whyThis)}</div>
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


const ItineraryOverlay = ({ option, tripSummary, userProfile, onClose }) => {
  if (!option) return null;
  try {

  const origin = tripSummary?.origin || "Origin";
  const destination = tripSummary?.destination || "Destination";
  const rawDates = tripSummary?.dates || "";

  // Parse start date from trip summary
  const parseStartDate = (dateStr) => {
    try {
      if (!dateStr) return new Date();
      // Try ISO format first (YYYY-MM-DD)
      const isoMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) return new Date(isoMatch[1]);
      // Try "Month Day, Year" or "Month Day Year"
      const fullMatch = dateStr.match(/(\w+ \d+,?\s*\d{4})/);
      if (fullMatch) return new Date(fullMatch[1]);
      // Try "Month Day" — use next occurrence of that date
      const partialMatch = dateStr.match(/(\w+ \d+)/);
      if (partialMatch) {
        const currentYear = new Date().getFullYear();
        const attempt = new Date(partialMatch[1] + ", " + currentYear);
        // If the date has passed, use next year
        if (attempt < new Date()) return new Date(partialMatch[1] + ", " + (currentYear + 1));
        return attempt;
      }
      // Try MM/DD format
      const slashMatch = dateStr.match(/(\d{1,2}\/\d{1,2})/);
      if (slashMatch) {
        const [m, d] = slashMatch[1].split('/');
        const currentYear = new Date().getFullYear();
        const attempt = new Date(currentYear, parseInt(m)-1, parseInt(d));
        if (attempt < new Date()) return new Date(currentYear + 1, parseInt(m)-1, parseInt(d));
        return attempt;
      }
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
        <div style={{ padding: "12px 16px", background: `${option.tagColor}0e`, border: `1px solid ${option.tagColor}22`, borderRadius: "10px", marginBottom: "16px" }}>
          <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Loyalty Highlights</div>
          <div style={{ color: option.tagColor, fontSize: "12px", lineHeight: "1.6" }}>✦ {option.loyaltyHighlight}</div>
        </div>

        {/* Benefits reminders — annual/metered benefits worth checking before travel */}
        {(() => {
          try {
            const reminders = userProfile ? buildItineraryReminders(userProfile, option) : [];
            if (!reminders.length) return null;
            return (
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", marginBottom: "20px" }}>
                <div style={{ color: "#555", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "8px" }}>Before You Travel</div>
                {reminders.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ color: "#7a7060", fontSize: "11px", lineHeight: "1.6", paddingLeft: "10px", borderLeft: "2px solid rgba(201,168,76,0.15)", marginBottom: "4px" }}>
                    {r}
                  </div>
                ))}
              </div>
            );
          } catch(e) { return null; }
        })()}

        {/* Book CTA */}
        <button onClick={() => { mp.track("book_intent", { tag: option.tag, headline: option.headline, total_cost: option.totalCost, destination: option.subhead }); alert("Booking coming soon! We logged your interest in: " + option.headline); }} style={{ width: "100%", padding: "16px", background: option.tagColor, color: "#0a0908", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Playfair Display',Georgia,serif" }}>
          Book This Trip →
        </button>
      </div>
    </div>
  );
  } catch(e) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div style={{ background: "#0e0c0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", padding: "36px", textAlign: "center", color: "#9a8e7a" }}>
          <div style={{ fontSize: "18px", marginBottom: "12px" }}>Unable to load itinerary</div>
          <button onClick={onClose} style={{ padding: "10px 24px", background: "#C9A84C", color: "#0a0908", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Close</button>
        </div>
      </div>
    );
  }
};

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "14px 16px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C", animation: `bounce 1.2s ease ${i * 0.2}s infinite` }} />
    ))}
  </div>
);

const PointsDashboardDrawer = ({ profile, optimizeRecs, optimizeLoading, onOptimizeClick }) => {
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
            {["points", "cards", "optimize"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "optimize" && onOptimizeClick) onOptimizeClick(); }} style={{ padding: "10px 14px", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent", color: activeTab === tab ? "#C9A84C" : "#444", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", cursor: "pointer" }}>
                {tab === "points" ? "Loyalty Points" : tab === "cards" ? "Credit Cards" : "Optimize ✦"}
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
            {activeTab === "optimize" && (
              <div>
                <div style={{ color: "#555", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "10px" }}>
                  Based on your current setup
                </div>
                {optimizeLoading && (
                  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "12px 0" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C9A84C", animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />)}
                    <span style={{ color: "#444", fontSize: "11px", marginLeft: "6px" }}>Analyzing your setup...</span>
                  </div>
                )}
                {!optimizeLoading && optimizeRecs && optimizeRecs.length === 0 && (
                  <div style={{ color: "#555", fontSize: "12px" }}>Your setup looks well optimized for your travel style.</div>
                )}
                {!optimizeLoading && optimizeRecs && optimizeRecs.map((rec, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "9px", padding: "2px 7px", borderRadius: "8px", fontFamily: "serif", letterSpacing: "0.08em",
                        background: rec.type === "remove" ? "rgba(201,76,76,0.12)" : rec.type === "add" ? "rgba(76,154,201,0.12)" : "rgba(201,168,76,0.12)",
                        color: rec.type === "remove" ? "#c94c4c" : rec.type === "add" ? "#4C9AC9" : "#C9A84C",
                        border: `1px solid ${rec.type === "remove" ? "rgba(201,76,76,0.2)" : rec.type === "add" ? "rgba(76,154,201,0.2)" : "rgba(201,168,76,0.2)"}`,
                      }}>
                        {rec.type === "remove" ? "Reconsider" : rec.type === "add" ? "Consider Adding" : "Swap"}
                      </span>
                      <span style={{ color: "#b0a898", fontSize: "12px", fontFamily: "serif" }}>{rec.title}</span>
                    </div>
                    <div style={{ color: "#7a7060", fontSize: "11px", lineHeight: "1.5", marginBottom: "4px" }}>{rec.detail}</div>
                    {rec.saving_or_value && (
                      <div style={{ color: "#C9A84C", fontSize: "10px", fontFamily: "serif" }}>✦ {rec.saving_or_value}</div>
                    )}
                  </div>
                ))}
                {!optimizeLoading && !optimizeRecs && (
                  <div style={{ color: "#555", fontSize: "11px" }}>Click Optimize to analyze your setup.</div>
                )}
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
const CARD_OPTIONS_LIST = ["Chase Sapphire Reserve","Chase Sapphire Preferred","Chase Freedom Unlimited","Chase Ink Business Preferred","Amex Platinum","Amex Gold","Amex Green","Amex Business Platinum","Capital One Venture X","Capital One Venture","Citi AAdvantage Executive","BofA Alaska Airlines Visa","United Explorer Card","Delta SkyMiles Reserve","Delta SkyMiles Platinum","Marriott Bonvoy Boundless","World of Hyatt Card","Southwest Rapid Rewards Priority","Hilton Honors Amex Surpass","Wells Fargo Autograph", "USAA Preferred Cash Rewards Visa", "USAA Rewards Visa"];

const OptimizingForBar = ({ profile, setProfile, optimizeRecs, optimizeLoading, onOptimizeClick }) => {
  const [activePanel, setActivePanel] = useState(null); // "loyalty" | "cards" | "brands" | "optimize"
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
                    const cardName = addCardInput.trim();
                    const cardData = CARD_BENEFITS_DB[cardName];
                    const newCard = cardData ? {
                      name: cardName,
                      network: cardData.network || "Visa",
                      multipliers: cardData.multipliers ? Object.entries(cardData.multipliers).map(([k,v]) => `${v}x ${k.replace(/_/g,' ')}`).join(', ') : "varies",
                      perksNote: [
                        cardData.decisionLogic?.loungeAccess ? `Lounge: ${Array.isArray(cardData.decisionLogic.loungeAccess) ? cardData.decisionLogic.loungeAccess[0] : cardData.decisionLogic.loungeAccess}` : null,
                        cardData.decisionLogic?.firstCheckedBagFree ? "Free checked bag" : null,
                        cardData.decisionLogic?.noForeignTransactionFee ? "No foreign transaction fee" : null,
                      ].filter(Boolean).join(', '),
                      annualFee: cardData.annualFee || 0,
                      transferPartners: cardData.transferPartners || [],
                    } : { name: cardName, multipliers: "" };
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
          {activePanel === "optimize" && (
            <div style={{ padding: "14px 20px 6px" }}>
              <div style={{ color: "#C9A84C", fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "serif", marginBottom: "12px" }}>Optimize Your Setup</div>
              {optimizeLoading && (
                <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "8px 0" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C9A84C", animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />)}
                  <span style={{ color: "#555", fontSize: "11px", marginLeft: "6px" }}>Analyzing your setup...</span>
                </div>
              )}
              {!optimizeLoading && optimizeRecs && optimizeRecs.length === 0 && (
                <div style={{ color: "#555", fontSize: "12px", padding: "4px 0 8px" }}>Your setup looks well optimized.</div>
              )}
              {!optimizeLoading && optimizeRecs && optimizeRecs.map((rec, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < optimizeRecs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", fontFamily: "serif",
                      background: rec.type === "remove" ? "rgba(201,76,76,0.12)" : rec.type === "add" ? "rgba(76,154,201,0.12)" : "rgba(201,168,76,0.12)",
                      color: rec.type === "remove" ? "#c94c4c" : rec.type === "add" ? "#4C9AC9" : "#C9A84C",
                      border: "1px solid " + (rec.type === "remove" ? "rgba(201,76,76,0.2)" : rec.type === "add" ? "rgba(76,154,201,0.2)" : "rgba(201,168,76,0.2)"),
                    }}>{rec.type === "remove" ? "Reconsider" : rec.type === "add" ? "Consider Adding" : "Swap"}</span>
                    <span style={{ color: "#b0a898", fontSize: "12px" }}>{rec.title}</span>
                  </div>
                  <div style={{ color: "#7a7060", fontSize: "11px", lineHeight: "1.5", marginBottom: "2px" }}>{rec.detail}</div>
                  {rec.saving_or_value && <div style={{ color: "#C9A84C", fontSize: "10px", fontFamily: "serif" }}>✦ {rec.saving_or_value}</div>}
                  {rec.type !== "remove" && getSignupLink(rec.title) && (
                    <a href={getSignupLink(rec.title)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "4px", fontSize: "10px", color: "#4C9AC9", textDecoration: "none", fontFamily: "serif", letterSpacing: "0.05em" }}>
                      Learn more →
                    </a>
                  )}
                </div>
              ))}
              {!optimizeLoading && !optimizeRecs && (
                <div style={{ color: "#555", fontSize: "11px", padding: "4px 0 8px" }}>Click to analyze your setup.</div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Bar */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: activePanel ? "none" : "1px solid rgba(255,255,255,0.06)", borderRadius: activePanel ? "0 0 12px 12px" : "12px", padding: "9px 16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ color: "#444", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "serif" }}>Optimizing for:</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button onClick={() => { toggle("optimize"); if (activePanel !== "optimize" && onOptimizeClick) onOptimizeClick(); }} style={{ ...pillStyle(activePanel === "optimize"), borderColor: activePanel === "optimize" ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)", color: activePanel === "optimize" ? "#C9A84C" : "#8a7a5a" }}>
          ✦ Optimize Your Setup
          <span style={{ marginLeft: "5px", fontSize: "9px", opacity: 0.5 }}>{activePanel === "optimize" ? "▴" : "▾"}</span>
            </button>
          </div>
        </div>
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
  const [optimizeRecs, setOptimizeRecs] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(null); // "loyalty" | "cards" | null
  // Pill index — read once on mount, never changes during session
  const [pillIdx] = useState(() => {
    try {
      const idx = parseInt(localStorage.getItem("sojourn_pill_idx") || "0");
      localStorage.setItem("sojourn_pill_idx", String((idx + 1) % 25));
      return idx;
    } catch(e) { return 0; }
  });

  const fetchOptimizeRecs = async () => {
    if (optimizeRecs || optimizeLoading) return;
    setOptimizeLoading(true);
    try {
      const p = userProfile;
      const cardList = (p.cards||[]).map(c => c.name).join(", ");
      const loyaltyList = (p.loyaltyAccounts||[]).map(a => `${a.program} (${a.tier}, ${a.balance})`).join(", ");
      const benefitsSummary = buildTravelerBenefitsSummary(p);
      const optimizeSystem = [
        "You are Sojourn's travel optimization advisor.",
        "Analyze the traveler's card and loyalty setup and provide 2-3 specific honest recommendations.",
        "SCOPE: (1) card additions/swaps/reconsiderations, tier optimization, card-program mismatches, annual fee vs value. (2) Loyalty program gaps — if the traveler has preferred brands (e.g. Andaz, Thompson) that belong to a program they haven't joined, suggest joining that program. (3) Car rental — if they travel frequently, suggest one free-to-join car rental program (National Emerald Club is the strongest for skip-counter + choose-your-own-car). (4) Status tier gaps — if they are close to a meaningful next tier, call it out with the math.",
        "LANGUAGE: for 'remove' type recommendations, never use words like 'drop', 'cancel', 'ditch', 'cut', or 'get rid of'. Use neutral framing: 'this card may not be earning its keep given...' or 'worth reconsidering given your current setup'. The title should be just the card/program name, not an action verb.",
        "OUT OF SCOPE: switching airlines or hotel chains, joining new programs to diversify purely for diversification, changing travel behavior, generic non-travel cashback cards — only recommend travel-specific programs tied to how they actually travel.",
        "RULES: genuinely honest — include both 'reconsider X' AND 'consider adding Y' where relevant. Show math. 2-3 sentences max per rec. ORDERING: always list 'add' and 'swap' recommendations first, 'remove' recommendations last — lead with opportunity, end with reconsideration.",
        "Format: JSON array only, no markdown, no preamble.",
        '[{"type":"add"|"remove"|"swap","title":"short title","detail":"specific rec with math","saving_or_value":"saves $X/yr or worth ~$X/yr"}]'
      ].join(" ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: optimizeSystem,
          messages: [{ role: "user", content: `Cards: ${cardList}. Loyalty: ${loyaltyList}. Preferred hotel/airline brands: ${(p.preferredBrands||p.selectedBrands||[]).slice(0,15).join(", ")||"none set"}. Car rental programs: ${(p.loyaltyAccounts||[]).filter(a=>["National Emerald Club","Hertz Gold Plus Rewards","Avis Preferred","Enterprise Plus"].includes(a.program)).map(a=>a.program).join(", ")||"none"}. Benefits summary: ${benefitsSummary.slice(0,500)}. Provide 2-3 honest optimization recommendations covering cards, loyalty program gaps from preferred brands, and car rental if not already set up.` }],
        })
      });
      const data = await res.json();
      const text = (data.content?.[0]?.text || "[]").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const startIdx = clean.indexOf("[");
      const endIdx = clean.lastIndexOf("]");
      const recs = startIdx > -1 ? JSON.parse(clean.slice(startIdx, endIdx + 1)) : [];
      setOptimizeRecs(recs);
    } catch(e) {
      setOptimizeRecs([]);
    } finally {
      setOptimizeLoading(false);
    }
  };
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
- Airline miles: ${airlineLoyalty||"none"}
EXACT POINTS BALANCES — these are the traveler's actual balances. NEVER suggest a redemption requiring more points than shown here. If insufficient balance exists for a meaningful redemption, say so and use a cash option instead:
${(p.loyaltyAccounts||[]).map(a => `  ${a.program}: ${a.balance} (tier: ${a.tier})`).join("\n")}
STRUCTURED BENEFITS — use these exact values for multipliers, lounge access, tier benefits, free breakfast eligibility, and transfer partners. Do not rely on training knowledge when this data is present:
${buildTravelerBenefitsSummary(p)}
QUALITY SIGNALS — verified tiers and quality markers for known properties. Use these when surfacing or evaluating any of these properties:
${buildQualityContext(Object.keys(QUALITY_SIGNALS_DB).slice(0, 60))}
- Brand-to-program mapping: Marriott Bonvoy covers ${(LOYALTY_BRAND_MAP["Marriott Bonvoy"]||[]).join(", ")}. World of Hyatt covers ${(LOYALTY_BRAND_MAP["World of Hyatt"]||[]).join(", ")} — including Small Luxury Hotels (SLH) since 2023. Hilton Honors covers ${(LOYALTY_BRAND_MAP["Hilton Honors"]||[]).join(", ")}. IHG One Rewards covers ${(LOYALTY_BRAND_MAP["IHG One Rewards"]||[]).join(", ")}. Fairmont, Raffles, Rosewood, Four Seasons, Peninsula, Mandarin Oriental, Aman, Belmond, Montage are independent — no major loyalty program points.${learnedList ? `
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
5. WILD CARD (#9A4CC9) — The aperture-widening option. Can be a surprising property that earns disproportionately well within existing programs, an unexpected routing with better earning, or a boutique/independent property that fits the traveler's profile exceptionally well even if earning is secondary. Lead with what makes the property or experience distinctive for this traveler — never frame around loyalty portfolio strategy or joining new programs.
6. REDEMPTION OPPORTUNITY (#4CC97A) — Tag label should be "Redemption Opportunity". This is a standard points redemption option for THIS SAME TRIP at THIS SAME DESTINATION — not a different destination. Only include this card if the redemption offers genuinely strong value (1.5+ cpp or meaningful cash savings). whyThis must open with a brief acknowledgment of the earning intent before making the case: "You mentioned building points — but this redemption offers strong enough value that it's worth a look." Then show the redemption math as normal: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile." If no strong redemption exists for this destination, generate a Best Points Earned option instead and skip this card. Never show a weak redemption just to fill the slot.

POINTS-LED QUERY DETECTION: Activate this mode when the user's intent is to redeem or use points/miles — even if vaguely stated. Triggers include: explicit balance mention ("I have 64k Delta miles"), redemption intent ("use my miles", "redeem points", "burn my Hyatt points"), or program-specific context established earlier in the conversation. When a single program is clear, anchor all 6 options around it. When multiple programs are mentioned or the user said "open to any", generate options that draw on whichever program offers the best value for each bucket and note why. Do NOT generate options that ignore stated redemption intent.

When a points-led query is detected, map the 6 buckets as follows — destination rules still apply, these redefine how each bucket is expressed:
1. RECOMMENDED (#C9A84C) — Best overall redemption of the stated program. Must achieve at least 1.5 cents per point to qualify — if no destination clears that threshold, pick the highest available and note it. Lead with the redemption story in whyThis, not the experience story. Format: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile — [rating]." Do not lead with hotel amenities or status perks — the miles value is the headline.
2. BEST POINTS REDEMPTION (#4CC97A) — Highest cents-per-point efficiency from the stated program on its NATURAL component (airline miles → flights, hotel points → hotel). Never redirect airline miles to a hotel or hotel points to flights. HEADLINE: frame around the destination and cpp angle — never use the words "maximum value" or "best value" (those belong to the Value bucket). Good headline framing: "destination · property · [X.X]¢ Per Mile" or "destination · property · High-Efficiency Redemption". In whyThis, spell out the redemption clearly: "[X] miles used · estimated value $[Y] · [Z.Z] cents per mile — [excellent/strong/solid] value." For context: 2.0+ cents per mile = excellent, 1.4-2.0 = strong, below 1.4 = marginal. redemption field must be non-null. redemptions array must include one entry with pointsUsed, dollarsValue, centsPerPoint, component.
3. BEST VALUE (#C9C94C) — Stack the stated program on its natural component PLUS secondary programs the traveler holds. RULE: if the stated program is an airline program, it MUST cover the flights (not pay cash for flights while using hotel points). Then layer hotel points on top to cover the accommodation. HEADLINE: frame around the stacking concept — e.g. "destination · property · Miles + Hotel Points Stack" or "destination · property · Combined Redemption". whyThis MUST open with the stacking framing in the first sentence — e.g. "This option combines your [airline] miles for flights and your [hotel] points for the hotel, covering both with redemptions." Then spell out the stack: "[X] miles on flights · estimated value $[Y] · [Z.Z] cents per mile. [A] hotel points · estimated value $[B]. Total cash out of pocket: $[C]." The opening line must immediately distinguish this from the Redemption option above it.
4. QUALITY UPGRADE (#C94C8A) — Use stated miles for premium cabin (business/first) AND layer hotel loyalty points for a luxury property. Stack both programs. Show what each covers and the combined cpp across both.
5. WILD CARD (#9A4CC9) — The aperture-widening option. Can be: (a) a surprisingly high-value redemption with the traveler's existing programs they wouldn't think of, (b) a different program that offers dramatically better value for this trip with the math shown, or (c) an independent or boutique property that fits the traveler's profile exceptionally well even if it earns no loyalty points. Wild Card is led by the property or experience — what makes it surprising, distinctive, or uniquely right for this traveler. NEVER frame Wild Card around loyalty portfolio strategy, program diversification, or "reducing concentration" — those are business-school concepts, not travel recommendations. If suggesting a property outside the traveler's existing programs, lead with why the property is exceptional for them, not with the loyalty angle. If it earns points in a program they don't hold, mention it briefly as context — never as the hook.
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
- Alaska Mileage Plan redeems on: Alaska flights, Hawaiian Airlines flights (post-2024 acquisition), and oneworld partners (American, British Airways, Cathay, Finnair, Qantas, Japan Airlines). NOT Delta, United, or Southwest. Note: HawaiianMiles is being merged into Alaska Mileage Plan — existing HawaiianMiles members are transitioning to Alaska Mileage Plan.
- United MileagePlus redeems on: United flights and Star Alliance partners (Lufthansa, ANA, Singapore, Swiss, Air Canada). NOT Delta or American.
- American AAdvantage redeems on: American flights and oneworld partners. NOT Delta or United.
- Southwest Rapid Rewards: Southwest metal only, no partners.
- JetBlue TrueBlue: JetBlue metal only, limited partners. NOT redeemable with Delta miles.
- NEVER invent a partnership. If a route has no good redemption option on the stated program, say so and suggest the next best option or a cash alternative.
- NEVER invent earning bonuses, spending promotions, or route-specific multipliers that aren't real.
- NEVER suggest a redemption that requires more points than the traveler's stated balance. The traveler's exact balances are in their profile — use them. If their Hyatt balance is 9,800 points, do not suggest a redemption requiring 130,000 points. If the balance is insufficient for a meaningful redemption, say so and suggest a cash option or a different program with sufficient balance instead. This is a hard rule — fabricating a usable balance destroys trust. The only legitimate earning differentiation between routes is (a) higher base fare = more miles on the same multiplier, and (b) confirmed card category bonuses (3x flights, 2x hotels, etc.). Do not claim a specific airport, airline, or route has a "bonus" or "promotion" unless the traveler's profile explicitly includes one.
- MULTI-LEG CLARITY: when miles cover a connecting itinerary, whyThis must specify "X miles cover both legs roundtrip for 2 travelers" not just total miles used. Never leave ambiguity about whether miles cover one leg or the full trip.

INTELLIGENCE RULES:
- Reference traveler's actual loyalty tier: "Your Marriott Gold gets confirmed late checkout and upgrade eligibility"
- Reference specific card multipliers: "Chase Sapphire Reserve 3x on hotels = 2,400 UR points worth ~$48"
- Room configs must use fewest rooms for party size (2 travelers = 1 king room, not adjoining rooms) using the FEWEST rooms possible: 2 people = 1 king room (never "two adjoining rooms" for a couple). Only suggest multiple rooms if party size genuinely requires it (3+ people who need separate sleeping). Never split a couple or 2-person party into adjoining rooms.
- Flight details format: "AA 123 · SEA→MIA · Departs 7:45am → Arrives 4:02pm · 5h 17m nonstop" — duration MUST always be the last segment so it displays prominently next to flight times
- Hotel: ALWAYS use a real, specific named property (e.g. "Mokara Hotel & Spa" not "boutique hotel" or "historic inn"). Never invent placeholder names. If you cannot name a real property in the destination, use a nearby city with real inventory.
- Hotel detail: property name · exact room config matching party size (e.g. "Two adjoining Kings" or "3BR villa sleeps 6") · nights · neighborhood. Never just "suite" — always specify beds and how the party fits.
- Flight detail field MUST use this EXACT format with · separators and spaces: "[Airline] · [ORIGIN-DEST] [nonstop/1-stop] · [departure time range] · [~Xh duration]" e.g. "Alaska Airlines · SEA-LIH nonstop · morning ~8-10am · ~6h30m" or "Delta · SEA-HNL nonstop · afternoon ~1-3pm · ~5h45m". CRITICAL: always put spaces around the · separator. Never concatenate airline and route without a separator (never "DeltaSEA-HNL"). Departure time should be a realistic range, not a specific invented flight number.
- FLIGHT COST RULE: NEVER put $0 on a return flight by claiming the cost is "included in roundtrip." Each leg (Flight and Return Flight) must show its own cash value. For a roundtrip fare of $800 total for 2 people, show Flight value = 400 and Return Flight value = 400 (split evenly). The totalCost must equal the sum of all component values. Never leave Return Flight at $0 unless it is genuinely a free redemption ticket.
- The points field should note ticket count: "2 tickets · est. X miles earned".
- Rental car pricing: use realistic market rates. A full-size SUV in Hawaii runs $150-250/day in peak season, $80-150/day off-peak. A standard sedan runs $60-100/day. Never show rental car costs below $40/day — these are not realistic. Total rental cost = daily rate × number of days. Always show both daily rate and total: "$175/day · 5 days · $875 total".
- Rental car cashback: USAA 1.5% cashback on a $875 rental = $13 — never show cashback exceeding 1.5% of the rental cost. Do not inflate cashback estimates.
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

IDAHO DESTINATION KNOWLEDGE — when query mentions Idaho, use this real inventory:
BOISE AREA: The Riverside Hotel (BW Premier, on Boise River), Hotel 43 (independent boutique downtown), Leku Ona (Basque neighborhood base)
MCCALL (mountain lake town, 2hr from Boise): Shore Lodge (premier lakefront independent resort, Payette Lake), Holiday Inn Express McCall
COEUR D'ALENE (northern Idaho, lake town): The Coeur d'Alene Resort (independent, famous floating golf green, lakefront), SpringHill Suites CDA
SUN VALLEY / KETCHUM: Sun Valley Resort (independent, world-class ski/summer), Limelight Ketchum (independent boutique)
STANLEY / SAWTOOTHS: Idaho Rocky Mountain Ranch (historic guest ranch, Sawtooth Valley), Redfish Lake Lodge (rustic lakefront)
SANDPOINT (Lake Pend Oreille): Schweitzer Mountain Resort, La Quinta Sandpoint
TWIN FALLS: Shoshone Falls area, limited luxury but base for Perrine Bridge and Snake River Canyon
LOYALTY NOTE: Most premier Idaho properties are independent — no major chain loyalty points. Shore Lodge, CDA Resort, Sun Valley Resort all independent. Best earning is via credit card spend (Delta Reserve 1x, USAA 1.5% cashback).
FLIGHT: Boise (BOI) is the main hub — Alaska and Delta serve SEA-BOI direct (~1hr). For McCall/Stanley, fly BOI then drive. For CDA/Sandpoint, fly Spokane (GEG) then drive (~1hr).

SINGLE-DESTINATION TRIPS — when user specifies a destination (e.g. "Carmel, CA"), ALL 6 options must stay within that destination area. NEVER split a single-destination trip across multiple locations within an option. The Quality Upgrade bucket does NOT grant permission to suggest a different destination — it means a premium property at the SAME destination. Geographic proximity is not an excuse: Napa is NOT Carmel, Big Sur is adjacent and acceptable, but wine country is a different trip entirely.

STATE-LEVEL GEOGRAPHY CONSTRAINT:
When a user specifies a state or region, apply this tiered rule:

SMALL CITY AND UNKNOWN MARKET HONESTY (dining/local discovery queries):
- For cities NOT in Sojourn's known restaurant database, acknowledge knowledge limitations directly. Say: "I have limited specific knowledge of [city]'s current restaurant scene — here are a couple I'm more confident about, but I'd recommend checking Google Maps or Yelp for current hours and status."
- NEVER recommend a restaurant in the wrong city. If you cannot find a coffee shop in Ellensburg WA, do not suggest one from Ellensburg CA or any other city.
- NEVER fabricate restaurant details for small markets just to appear helpful. A closed or wrong restaurant destroys trust far more than admitting a knowledge gap.
- For dining in unknown markets: offer 1-2 high-confidence options maximum. Do not pad to 4-5 with low-confidence entries.
- If a restaurant is in our RESTAURANT_SIGNALS_DB for that city, use it with confidence. If it is not, hedge appropriately.

TIER 1 — Options 1-5: Must be within the stated geography. If you cannot confidently name real operating properties for a given destination within the state, use the state's gateway cities and known resort towns rather than substituting a neighboring state. For Idaho: Boise (gateway), McCall, Coeur d'Alene, Sun Valley/Ketchum, Stanley/Sawtooths, Sandpoint are all valid Idaho options. Do NOT substitute Montana, Oregon, or Wyoming for Idaho options.

TIER 2 — Wild Card only: May venture just outside the stated geography IF (a) the property is within ~2 hours of the state border, (b) it genuinely serves the same travel intent, AND (c) you explicitly state the distance and cross-border nature: "Just across the Montana border, 90 min from northern Idaho — Whitefish offers..." Never silently substitute. The distance context is required, not optional.

TIER 3 — Knowledge gap honesty: If you genuinely cannot name 4+ real operating properties within a stated geography that fit the trip type, say so in the concierge turn and ask the user to broaden the geography or specify a different part of the state. Do not fabricate properties or silently substitute neighboring regions.

GATEWAY CITY RULE: Major cities in a state are valid bases even for outdoor/resort queries. Boise is a valid Idaho option as a base for McCall, Sawtooth day trips, and wine country. Denver is valid for Colorado mountain trips. Portland is valid for Oregon coast queries. Always consider whether a gateway city + day trip approach serves the intent.

When a gateway city option is included, the headline and whyThis MUST frame it as a jumping-off point, not just a city stay. The headline should reflect the broader experience: "Boise · Hotel 43 · Gateway to Idaho's Outdoors" not just "Boise · Hotel 43 · Downtown Boutique". The whyThis should bridge explicitly: "Boise puts you 2 hours from McCall's Payette Lake and 3 hours from the Sawtooths — use it as a comfortable base with easy day trips into Idaho's backcountry, with better flight options and lower accommodation costs than the resort towns." The gateway framing makes the option feel intentional and useful rather than a consolation prize.

When asked to regenerate options within a specific state, you MUST output new JSON — a conversational acknowledgment without JSON does nothing.

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
- loyaltyHighlight = a friendly, plain-English reminder of the marginal status perks this traveler unlocks on THIS specific trip. Use the STRUCTURED BENEFITS data injected above — specifically the loyaltyHighlight arrays for each program/tier. Only include benefits that apply every time they use this program at this tier (free breakfast, lounge access tied to status, guaranteed late checkout, upgrade eligibility, free checked bags). Do NOT include annual credits, metered benefits, or anything requiring residual balance knowledge — those go in itinerary reminders, not here. Do NOT repeat points math (covered in components). Keep to 2-4 genuinely relevant perks. Tone: warm, like a knowledgeable friend reminding you of things you might forget to use.
- cardStrategy = which card to use for each cash-paid component and why, based on the highest earning multiplier for that spend category. Format: "Flights: [card] ([Nx] miles) · Hotel: [card] ([Nx] points) · Dining: [card] ([Nx] points)". Only include components where cash is paid — skip components covered by points redemption. This must reflect the traveler's actual cards and their actual category multipliers. Never invent a multiplier. If two cards tie, pick the one that earns the program with the higher cpp value. CASHBACK CARDS: cash back is certain and immediate; points/miles have future redemption risk. For spend categories where no card has a NATIVE bonus multiplier (i.e. a hotel that doesn't match any card's bonus category), prefer the cashback card over a 1x points card — 1.5% certain cash beats 1x miles at an estimated future cpp. Only route to a points card over cashback if the points card has a genuine category bonus (2x or higher) on that spend type.
- whyThis = frame cash figures consistently with what the card shows — if flights are $0 out of pocket, say "flights covered by your miles" not "flights cost $X"
- pointsEarned (top-level) = earning side ONLY — points/miles/cashback this trip generates on cash-paid components. CRITICAL: if a component is covered by a redemption, it earns NO points — do NOT include that program in pointsEarned. Example: if Delta miles cover flights, do NOT include "Delta miles earned" in pointsEarned. Only include programs earned on cash-paid components.
- CASHBACK vs POINTS FORMATTING: USAA Preferred Cash Rewards earns CASH BACK, not points. Always format as "$X cashback" never as "X points" or "X USAA points". In pointsEarned field: "est. 3,200 Delta miles + $48 cashback" — the cashback is a dollar amount with $ sign, not a point count. In component points field: "est. $18 cashback (1.5%)" — always include % rate and $ sign.
- SUMMARY CONSISTENCY: the top-level pointsEarned string must exactly match the sum of all component earning fields. If components show "est. 2,670 Delta miles" on flights and "est. $27 cashback" on hotel, pointsEarned must show "est. 2,670 Delta miles + $27 cashback" — not just "via USAA" or a different number. Never attribute flight mile earning to USAA — Delta miles come from the Delta Reserve card, cashback comes from USAA, and these are distinct programs that must be listed separately.
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
            system: `You are Sojourn, a knowledgeable travel companion — expert in trip planning, local discovery, dining, activities, and getting the most from loyalty programs and credit cards.

Traveler profile: home airport=${tp.homeAirport||"unknown"}, travel types=${(tp.travelTypes||[]).join(", ")}, cards=${(p.cards||[]).map(c=>c.name).join(", ")}.

YOU HAVE TWO MODES:

MODE 1 — LOCAL DISCOVERY (respond conversationally, no cards needed):
Use this when the user is already on a trip or asking about a specific place without trip planning intent. Triggers: "I'm in [city]", "I'm visiting", "already here", "what should I do in", "recommend a restaurant", "good bbq in", "things to do in [city]", "where should I eat". Respond like a knowledgeable local friend — specific recommendations with brief context, warm tone. No READY needed, no cards generated. Just answer helpfully and directly.
PRICE TRANSPARENCY: when recommending a fine dining or special occasion restaurant ($100+/person), always briefly signal this — e.g. "splurge-worthy", "special occasion territory", "$150+/person" — so the traveler isn't surprised. Don't lead with high-end options unless the traveler has signaled they want that. Mix price points naturally unless asked for a specific tier.
AVOID TOURIST TRAPS: never default to obvious tourist-facing restaurants simply because they are well-known or have a view. In Seattle: avoid Ivar's Acres of Clams (waterfront tourist trap), The Crab Pot (gimmick over quality), Elliot's Oyster House (tourist-facing). In San Francisco: avoid Fisherman's Wharf and Pier 39 restaurants. In New Orleans: avoid Bourbon Street and most French Quarter tourist strip restaurants. In NYC: avoid Times Square restaurants. In Chicago: avoid Navy Pier restaurants. In Hawaii: avoid most Waikiki strip restaurants. Prefer locally-beloved spots that happen to have views over tourist-facing spots that lead with their view. If the traveler asks specifically for a view, note which options have views AND are genuinely good — don't sacrifice quality for scenery.
BE HONEST ABOUT LIMITATIONS: if a combination of criteria is genuinely hard to find (e.g. "casual seafood with a view" in Seattle — waterfront dining options are limited and most are tourist-facing), say so directly and helpfully. Example: "Honest answer — Seattle doesn't have many casual seafood spots with great water views that are also genuinely good. Ray's Boathouse in Ballard is the best combination, with the upstairs cafe being casual and affordable. Beyond that, the best seafood in the city (Walrus and the Carpenter, Local Tide) doesn't come with dramatic views." A traveler would rather have an honest answer than a padded list of mediocre options.

LOCAL DISCOVERY DATA — use this verified restaurant and experience data when available, prioritizing it over training knowledge:
${(() => { try {
  const msg = userMessage.toLowerCase();
  const cities = Object.keys(RESTAURANT_SIGNALS_DB);
  const city = cities.find(c => msg.includes(c.toLowerCase()));
  if (city) return "RESTAURANTS IN " + city.toUpperCase() + ":\n" + buildRestaurantContext(city) + "\n\nEXPERIENCES IN " + city.toUpperCase() + ":\n" + (EXPERIENCE_SIGNALS_DB[city]||[]).map(e => e.name + ": " + e.notes).join("\n");
  return "";
} catch(e) { return ""; } })()}

MODE 2 — TRIP PLANNING (generate structured options):
Use this when the user wants to plan a trip. Default to READY. Generate options unless a truly critical piece is missing.
Go READY immediately if you have: any destination or travel theme, any timeframe (even vague like "spring" or "summer"), AND a party size (stated or clearly implied).
Party size MUST be stated or clearly implied — do NOT assume 2. If no party size is mentioned, ask: "How many people are traveling?" as your one clarifying question. Timeframe like "mid-May" or "this summer" is sufficient. Vague destinations like "somewhere warm" are sufficient.

POINTS CLARIFICATION: Only ask if intent is clearly to REDEEM points AND no specific program is named. Do NOT ask if user says "build points", "earn points", "maximize points" — go straight to READY. When clarifying: "Which program are you thinking of — [list only their actual LOYALTY PROGRAMS, never card names]?"

Only ask ONE question total per conversation turn.
NEVER ask about budget, hotel preference, or anything already in the profile.
NEVER refuse a local discovery or dining question — always answer helpfully.

When ready to plan, respond with EXACTLY:
READY: [one sentence reflecting back what you heard] Ready for me to generate your options?

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

STRUCTURED BENEFITS — use these exact values for card multipliers, lounge access, tier benefits, and free breakfast eligibility. Do not rely on training knowledge when this data is available:
${buildTravelerBenefitsSummary(userProfile)}

ORIGINAL TRIP REQUEST: ${(conversationRef.current&&conversationRef.current[0]&&conversationRef.current[0].content) || "unknown"}

HOTEL BRAND ACCURACY (carry through all refinements):
- Never place a hotel in the wrong destination. Jackson Hole options use Jackson Hole/Teton Village hotels only.
- Only redeem loyalty points at hotels that belong to that program. Montage is not Hyatt. Verify before suggesting redemption.
- Do not split trips of 3 nights or fewer across two hotels without explicit user request and clear explanation in whyThis.
- Every flight leg must show a dollar value — never $0 or "included in outbound."

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
- User asks to show options in a specific state or region ("show me Idaho options", "keep it in California") — this ALWAYS requires new JSON, never just a conversational response claiming you've updated
- Geographic constraint changes always require regeneration — if you say "I've updated to Idaho options" you MUST include the full JSON with Idaho properties
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
- SEA-HNL (Honolulu): Alaska and Hawaiian Airlines direct, ~5h45m. NOT Delta — Delta does not fly SEA-HNL nonstop.
- SEA-OGG (Maui Kahului): Alaska direct seasonal, Hawaiian direct, ~6h15m. NOT Delta nonstop.
- SEA-KOA (Kona/Big Island): Alaska direct seasonal, Hawaiian direct, ~6h. NOT Delta nonstop.
- SEA-LIH (Kauai Lihue): Alaska direct seasonal, Hawaiian direct via HNL (short hop ~30min), ~6h30m total. NOT Delta nonstop.
- SEA-ITO (Hilo/Big Island): typically 1 stop via HNL on Hawaiian or Alaska. ~7h total.
- HAWAII ROUTING RULE: For any Hawaii island destination from Seattle, ALWAYS use Alaska or Hawaiian Airlines — Delta does not fly nonstop Seattle to Hawaii. If Delta miles are being redeemed, note they must be used on a SkyTeam partner or Delta metal, which requires connecting through a Delta hub (LAX, SFO, ATL) — this adds significant time vs. Alaska/Hawaiian direct. Be explicit about this tradeoff.
- INTER-ISLAND: Hawaiian Airlines dominates inter-island flying (OGG, KOA, LIH, ITO all connect through HNL on Hawaiian). Alaska also flies some inter-island routes. Budget ~$80-150 per person per inter-island hop.
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

CARD MULTIPLIER ACCURACY — never fabricate or inflate earning rates:
- Delta SkyMiles Reserve earns 3x ONLY on Delta purchases (Delta flights, Delta.com). All other purchases including ferries, trains, hotels, restaurants, taxis earn 1x base. Do not claim 3x on ferry tickets, ground transport, or non-Delta travel.
- Chase Sapphire Reserve earns 3x on travel AND dining. "Travel" includes: flights, hotels, taxis, Lyft, Uber, ferries, trains, parking. This is a broad category.
- Amex Platinum earns 5x on flights booked directly with airlines or via Amex Travel. NOT on hotels, NOT on other travel.
- Amex Gold earns 4x at restaurants and US supermarkets. 3x on flights booked directly. NOT on hotels.
- When in doubt about a specific merchant category, default to the card's base rate (1x or 1.5x depending on the card). NEVER round up or guess a higher rate.

HOTEL BRAND ACCURACY — critical trust rules, never violate:
- NEVER place a hotel in the wrong city or region. If the destination is Jackson Hole, every hotel component must be in Jackson Hole or Teton Village — not Vail, not Aspen, not any other mountain town. If you cannot name a real hotel in the destination, say so rather than substituting one from elsewhere.
- LOYALTY REDEMPTION ACCURACY: Only suggest redeeming points at hotels that ARE part of that loyalty program. Montage is NOT a Hyatt property — do not suggest redeeming World of Hyatt points at Montage. Verify program membership before recommending redemption. Programs and their brands: World of Hyatt includes Hyatt, Park Hyatt, Grand Hyatt, Andaz, Alila, Thompson, Destination by Hyatt, SLH partners; Marriott Bonvoy includes Ritz-Carlton, St. Regis, W, Westin, Sheraton, JW Marriott, Edition, Luxury Collection, Autograph Collection; Hilton Honors includes Conrad, Waldorf Astoria, LXR, Curio, Tapestry; IHG includes InterContinental, Kimpton, Six Senses, Regent, voco.
- MULTI-HOTEL SHORT TRIPS: Do not split a short trip (3 nights or fewer) across two hotels unless the user explicitly asks for it, or unless there is a genuinely compelling reason (e.g. a multi-city itinerary). A 3-night ski weekend should have ONE hotel. If you do split a short trip, you MUST explain the reason clearly in whyThis.
- FLIGHT LEG PRICING: Every flight component must show a dollar value per leg. Return flight must NEVER show $0 or "included in outbound" — split the total evenly across legs if needed. Format: "~$[X] per person" on each leg. Never leave a flight component with ambiguous or missing pricing.

DOMESTIC vs INTERNATIONAL DEFAULT:
- When a user asks to "use my miles" or "best use of my Delta/United/Alaska miles" WITHOUT specifying international travel, DEFAULT to domestic US options. Most travelers asking about miles redemption are thinking about domestic trips first.
- Only suggest international redemptions if: (a) the user explicitly mentions international travel, or (b) the user mentions a specific international destination, or (c) the user says "I want to go somewhere international" or similar.
- For Delta SkyMiles specifically: domestic redemptions on Delta often offer good value (1.0-1.2 cpp). Do not automatically jump to international business class just because that theoretically offers better cpp — the user may not want to travel internationally.
- Always offer at least 2-3 domestic options before introducing international if the query is ambiguous.

SMART OPTION SUPPRESSION — evaluate traveler profile before generating options:
- REDEMPTION OPPORTUNITY: only generate if the traveler has at least one loyalty program with 5,000+ points in a single program. If total redeemable balance is effectively zero, replace this slot with a second Best Value or additional Quality option.
- BEST POINTS EARNED / FUTURE VALUE: only generate if the traveler has at least one loyalty program OR a co-branded travel card. If they have no loyalty programs AND only a cashback card, replace with a second Wild Card or Best Value.
- Never generate a Redemption Opportunity that requires points the traveler doesn't have.

CARD QUALITY RULES (when generating new cards):
- NUMBER FORMATTING: all numbers of 1,000 or more must use comma separators in ALL text fields — pointsEarned, whyThis, detail, tradeoff, loyaltyHighlight, cardStrategy. Examples: "3,200 Delta miles" not "3200 Delta miles", "$1,315" not "$1315", "26,000 Hyatt points" not "26000 Hyatt points", "$2,890" not "$2890". This applies to every number in every field without exception.
- Go deeper, not wider. For any given destination or region, surface the most interesting and fitting properties within that geography before reaching to neighboring regions. A lesser-known gem within the stated area is always preferable to a well-known property just outside it. The Idaho Rocky Mountain Ranch in the Sawtooths is a better Idaho answer than Jackson Hole — even if Jackson Hole is more famous. Depth of knowledge within the query's geography signals intelligence. Breadth across neighboring geographies signals laziness.
- Each option must be genuinely distinct with a clear optimization angle
- whyThis: 2-3 sentences, specific to THIS traveler's loyalty status and THIS trip. For earning-intent queries: show points earned per component (e.g. "3x flights via Delta Reserve = 2,670 miles · Bonvoy Silver earns 4,240 points at St. Regis"), then ONE total estimated value line at the end ("Total est. earning: ~10,000 points worth ~$150"). Do NOT show $ value per individual component — only a single total at the end. Keep the closing sentence focused on the qualitative experience/location fit, not more math.
- tradeoff: one crisp specific sentence — never generic
- Room configs must use fewest rooms for party size (2 travelers = 1 king room, not adjoining rooms)
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
      {itineraryOption && <ItineraryOverlay option={itineraryOption} tripSummary={tripSummary} userProfile={userProfile} onClose={() => setItineraryOption(null)} />}

      {/* Profile Quick-View Modal — Loyalty or Cards */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }} onClick={() => setShowProfileModal(null)}>
          <div style={{ background: "#0e0c0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", width: "100%", maxWidth: "460px", padding: "28px", position: "relative", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", fontFamily: "serif", marginBottom: "4px" }}>Sojourn · Profile</div>
                <div style={{ fontSize: "18px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#e8e4dc" }}>{showProfileModal === "loyalty" ? "Loyalty Programs" : "Credit Cards"}</div>
              </div>
              <button onClick={() => setShowProfileModal(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#666", width: "30px", height: "30px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>✕</button>
            </div>
            {showProfileModal === "loyalty" && (
              <div>
                {(userProfile?.loyaltyAccounts || []).filter(a => a.tier && a.tier !== "None").length === 0
                  ? <div style={{ color: "#555", fontSize: "13px", fontStyle: "italic" }}>No loyalty programs added yet. Add them in your profile.</div>
                  : (userProfile?.loyaltyAccounts || []).filter(a => a.tier && a.tier !== "None").map((a, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ color: "#b0a898", fontSize: "13px" }}>{a.program}</div>
                          <div style={{ color: "#555", fontSize: "11px" }}>{a.tier} · {a.balance || "balance not set"}</div>
                        </div>
                        {a.balance && <div style={{ color: "#C9A84C", fontSize: "12px", fontFamily: "serif" }}>est. ${Math.round((parseInt((a.balance||"0").replace(/,/g,""))||0) * ({
                          "World of Hyatt": 1.7, "Chase Ultimate Rewards": 1.5, "Alaska Mileage Plan": 1.5,
                          "Delta SkyMiles": 1.2, "United MileagePlus": 1.4, "American AAdvantage": 1.3,
                          "Marriott Bonvoy": 0.8, "Hilton Honors": 0.5, "Southwest Rapid Rewards": 1.5,
                        }[a.program] || 1.0) / 100).toLocaleString()}</div>}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            {showProfileModal === "cards" && (
              <div>
                {(userProfile?.cards || []).length === 0
                  ? <div style={{ color: "#555", fontSize: "13px", fontStyle: "italic" }}>No cards added yet.</div>
                  : (userProfile?.cards || []).map((c, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ color: "#b0a898", fontSize: "13px" }}>{c.name}</div>
                      <div style={{ color: "#555", fontSize: "11px" }}>{c.multipliers || "see card details"}</div>
                    </div>
                  ))
                }
              </div>
            )}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ color: "#444", fontSize: "11px", fontStyle: "italic" }}>To update your programs or cards, return to the main query page and use the bottom bar.</div>
            </div>
          </div>
        </div>
      )}

      {/* Optimize Modal */}
      {showOptimizeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }} onClick={() => setShowOptimizeModal(false)}>
          <div style={{ background: "#0e0c0a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "32px", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", fontFamily: "serif", marginBottom: "6px" }}>Sojourn · Optimize</div>
                <div style={{ fontSize: "20px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#e8e4dc" }}>Your Setup</div>
                <div style={{ color: "#555", fontSize: "11px", marginTop: "4px" }}>Honest recommendations based on how you actually travel</div>
              </div>
              <button onClick={() => setShowOptimizeModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#666", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {optimizeLoading && (
              <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "16px 0" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C", animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />)}
                <span style={{ color: "#555", fontSize: "12px", marginLeft: "8px" }}>Analyzing your setup...</span>
              </div>
            )}

            {!optimizeLoading && optimizeRecs && optimizeRecs.length === 0 && (
              <div style={{ color: "#666", fontSize: "13px", fontStyle: "italic", padding: "12px 0" }}>Your setup looks well optimized for your travel style.</div>
            )}

            {!optimizeLoading && optimizeRecs && optimizeRecs.map((rec, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < optimizeRecs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{
                    fontSize: "9px", padding: "3px 8px", borderRadius: "10px", fontFamily: "serif", letterSpacing: "0.08em",
                    background: rec.type === "remove" ? "rgba(201,76,76,0.12)" : rec.type === "add" ? "rgba(76,154,201,0.12)" : "rgba(201,168,76,0.12)",
                    color: rec.type === "remove" ? "#c94c4c" : rec.type === "add" ? "#4C9AC9" : "#C9A84C",
                    border: `1px solid ${rec.type === "remove" ? "rgba(201,76,76,0.25)" : rec.type === "add" ? "rgba(76,154,201,0.25)" : "rgba(201,168,76,0.25)"}`,
                  }}>
                    {rec.type === "remove" ? "Reconsider" : rec.type === "add" ? "Consider Adding" : "Swap"}
                  </span>
                  <span style={{ color: "#e8e4dc", fontSize: "13px", fontFamily: "'Playfair Display',Georgia,serif" }}>{rec.title}</span>
                </div>
                <div style={{ color: "#7a7060", fontSize: "12px", lineHeight: "1.6", marginBottom: "6px" }}>{rec.detail}</div>
                {rec.saving_or_value && (
                  <div style={{ color: "#C9A84C", fontSize: "11px", fontFamily: "serif" }}>✦ {rec.saving_or_value}</div>
                )}
                {rec.type !== "remove" && getSignupLink(rec.title) && (
                  <a href={getSignupLink(rec.title)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "6px", fontSize: "11px", color: "#4C9AC9", textDecoration: "none", fontFamily: "serif", letterSpacing: "0.05em" }}>
                    Learn more →
                  </a>
                )}
              </div>
            ))}

            {!optimizeLoading && !optimizeRecs && (
              <div style={{ color: "#555", fontSize: "12px", padding: "8px 0" }}>Loading recommendations...</div>
            )}
          </div>
        </div>
      )}
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
            
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => { mp.track("new_trip_started"); resetApp(); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>New Trip / Edit Query</button>
          </div>
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
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "3px" }}>
              <div style={{ fontSize: "22px", fontFamily: "'Playfair Display',Georgia,serif" }}>
                {tripOptions.filter(o => !dismissedIds.includes(o.id)).length} option{tripOptions.filter(o => !dismissedIds.includes(o.id)).length !== 1 ? "s" : ""}, optimized for you
              </div>
              <button onClick={() => { mp.track("new_trip_started"); resetApp(); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#555", padding: "3px 10px", borderRadius: "20px", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap", flexShrink: 0 }}>New Trip / Edit Query</button>
            </div>
            <div style={{ color: "#555", fontSize: "12px" }}>{expandedId ? "Viewing details · click back to compare all" : "Click any option for details · dismiss ✕ options to narrow · refine your search below"}</div>
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
                  }}>{msg.role === "assistant" ? (msg.text || "").split(/\s*[\[{](?=\s*"[a-zA-Z])/)[0].trim() || msg.text : msg.text}</div>
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
                <span style={{ color: "#b0a898", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: "600" }}>Continue the conversation</span>
                <span style={{ color: "#3a3530", fontSize: "12px", margin: "0 6px" }}>—</span>
                <span style={{ color: "#7a7060", fontSize: "12px", fontFamily: "'DM Sans',system-ui,sans-serif" }}>Refine your query · dive deeper into current options · generate new ones · explore dining, drinks and activities</span>
              </div>
              {/* Context-aware suggestion pills — regenerate based on conversation state */}
              {(() => {
                const opts = (tripOptions || []).filter(o => !dismissedIds.includes(o.id));
                const rec = opts.find(o => o.id === 1);
                const wildCard = opts.find(o => o.tag === "Wild Card");
                const upgrade = opts.find(o => o.tag === "Quality Upgrade");

                // Detect query intent from original message
                const originalQuery = (conversationRef.current && conversationRef.current[0] && conversationRef.current[0].content || "").toLowerCase();
                const isEarningIntent = /business.?trip|work.?trip|maximize.?point|build.?mile|build.?point|earn.?status|rack.?up|maximize.?earn/i.test(originalQuery);
                const isRedemptionIntent = /i have \d|use my miles|redeem|burn my|best use of my/i.test(originalQuery);
                const isDestinationUncertain = /surprise me|open to|anywhere|somewhere warm|somewhere|don.t know|not sure|ideas/i.test(originalQuery);
                const isOccasion = /anniversary|birthday|honeymoon|proposal|celebration|bachelor|bachelorette/i.test(originalQuery);

                // Build conversation history string to detect what's already been covered
                const conversationText = refineMessages.map(m => m.text || "").join(" ").toLowerCase();
                const askedAboutEarning = /earning rate|earn.*compare|how.*earn|miles.*compare/i.test(conversationText);
                const askedAboutFlights = /flight time|depart|arrival|nonstop|connection/i.test(conversationText);
                const askedAboutDining = /restaurant|dinner|lunch|eat|food|bbq|bar/i.test(conversationText);
                const askedAboutUpgrade = /upgrade.*add|quality upgrade|suite|premium/i.test(conversationText);
                const askedAboutValue = /value per mile|best.*mile|cpp|cents per/i.test(conversationText);
                const askedAboutVibe = /vibe|spirit|feel|character|different from each/i.test(conversationText);
                const focusingOnOption = refineMessages.length > 2 && /i like|leaning toward|going with|prefer the|love the/i.test(conversationText);
                const hasConversation = refineMessages.length > 0;

                // ── Closing-oriented pills — resolve concerns, confirm preferences, move toward yes ──
                // Each pill answers a likely remaining question rather than opening new topics
                const recName = rec ? rec.headline?.split(" · ")[1] || "Recommended" : "Recommended";
                const upgradeName = upgrade ? upgrade.headline?.split(" · ")[1] || "Quality Upgrade" : null;

                const pill1Candidates = [
                  // Resolve the primary decision concern based on query type
                  focusingOnOption ? "Is there anything about this option I should know before booking?" : null,
                  !askedAboutEarning && isEarningIntent ? "Which option actually builds the most points for this trip?" : null,
                  !askedAboutValue && isRedemptionIntent ? "Which redemption gives me the most value for my miles?" : null,
                  isOccasion ? `What makes the ${recName} the right choice for this occasion?` : null,
                  !askedAboutVibe && isDestinationUncertain ? "Which of these would I actually regret not choosing?" : null,
                  hasConversation ? `What's the strongest case for the ${recName} option?` : null,
                  wildCard ? "What makes the Wild Card worth considering over the Recommended?" : null,
                  "Which of these would you book if it were your trip?",
                ].filter(Boolean);

                const pill2Candidates = [
                  // Resolve a likely logistical concern
                  focusingOnOption ? "What's the one tradeoff I should accept going in?" : null,
                  !askedAboutUpgrade && upgrade ? `Is the ${upgradeName || "Quality Upgrade"} worth the price difference?` : null,
                  isEarningIntent && !askedAboutFlights ? "Which option has the best setup for back-to-back meetings?" : null,
                  !askedAboutFlights ? "Are the flight times reasonable or is there a better routing?" : null,
                  askedAboutFlights ? "Is the hotel location actually convenient for what I need?" : null,
                  "What's the easiest of these to book with my programs?",
                ].filter(Boolean);

                const pill3Candidates = [
                  // Move toward commitment — add an experience or confirm readiness
                  focusingOnOption ? "Add a dinner recommendation to my itinerary" : null,
                  !askedAboutDining && rec ? `Any restaurants near the ${recName} worth adding?` : null,
                  !askedAboutDining && isOccasion ? "What experience would make this trip truly memorable?" : null,
                  askedAboutDining ? "I'm ready — walk me through this option" : null,
                  hasConversation ? "I think I've got what I need — let's go with this one" : null,
                  "Add a must-try local experience to my itinerary",
                ].filter(Boolean);

                const pills = [
                  pill1Candidates[0] || "Which of these would you book if it were your trip?",
                  pill2Candidates[0] || "What's the easiest of these to book with my programs?",
                  pill3Candidates[0] || "I'm ready — walk me through this option",
                ];

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
                  onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); handleRefine(); } }}
                  placeholder={`${(conversationRef.current&&conversationRef.current[0]&&conversationRef.current[0].content||"").slice(0,80) || "Continue your search..."}...`}
                  style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "12px", padding: "9px 0", fontFamily: "'DM Sans',system-ui,sans-serif", outline: "none" }}
                />
                {refineLoading ? (
                  <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TypingIndicator />
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRefine(); }} disabled={!refineInput.trim()} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: refineInput.trim() ? "pointer" : "default", background: refineInput.trim() ? "#C9A84C" : "rgba(201,168,76,0.1)", color: refineInput.trim() ? "#0a0908" : "#555", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>&#8593;</button>
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
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", marginBottom: "2px", fontFamily: "serif" }}>Sojourn · AI</div>
        <div className="desktop-only" style={{ color: "#444", fontSize: "11px", letterSpacing: "0.08em" }}>Your travel, optimized.</div>
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
          const stripped = bal.replace(/[^0-9,]/g, "").replace(/^0+/, "");
          const numericVal = parseInt(stripped.replace(/,/g,""));
          if (!stripped || numericVal <= 0) return null;
          // Always format with commas regardless of how user entered it
          return numericVal.toLocaleString();
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
        // ── Queue-rotation pill system ──────────────────────────────────────────
        // Full pool of inspirational pills — mix of trip planning and on-trip discovery
        // Rotates by 1 each session using a persisted index in localStorage
        // so the user never sees the same set twice in a row
        const PILL_POOL = [
          // Trip planning
          `Best long weekend from ${airportCity} I haven't thought of yet`,
          `I need a reset. Somewhere warm, late April — surprise me.`,
          "Anniversary trip — somewhere unforgettable, open budget",
          "First time in Japan — 10 days, two adults, where to start?",
          "Plan a trip that makes the most of my points and credit cards",
          "A week in Italy — where beyond Rome and Florence?",
          "Best beach within 6 hours of Seattle for early June",
          "Safari trip — where to start and how to use points well",
          "Long weekend ski trip — best mountains for spring snow",
          "Family trip with kids under 10 — somewhere that works for everyone",
          "Solo trip — somewhere I can explore freely and meet people",
          "Road trip through the American West — 10 days, two people",
          "Where would my Hyatt points go furthest right now?",
          "A city I've never been to that would genuinely surprise me",
          "Best use of my Alaska miles for a long weekend",
          // On-trip discovery
          "I'm on my business trip in Austin — any must-try BBQ while I'm here?",
          "I'm in NYC for the weekend — what neighborhoods should I explore today?",
          "Just landed in Tokyo — what should I do on my first evening?",
          "I'm in New Orleans — where do locals actually eat?",
          "On a layover in London — what can I do in 4 hours near Heathrow?",
          "I'm in Miami for a conference — any great Cuban food nearby?",
          "In San Francisco this week — best spots for a casual dinner alone?",
          "Visiting Portland OR — what's worth doing beyond Powell's and Voodoo Doughnut?",
          "I'm in Chicago — best deep dish and jazz in the same neighborhood?",
          "In Nashville for work — where do locals go for live music?",
        ];

        // Build final 5 prompts: up to 2 loyalty pills + 3 from rotating pool
        const allPrompts = [];
        // Alternate loyalty pill order each session
        if (pillIdx % 2 === 1) loyaltyPills.reverse();
        loyaltyPills.slice(0, 2).forEach(p => allPrompts.push(p.text));

        // Pull 3 consecutive pills from the pool starting at current index
        for (let i = 0; i < 3; i++) {
          allPrompts.push(PILL_POOL[(pillIdx + i) % PILL_POOL.length]);
        }

        // Trim to 5
        const finalPrompts = allPrompts.slice(0, 5);

        // 2-2-1 prompt layout
        const row1 = finalPrompts.slice(0, 2);
        const row2 = finalPrompts.slice(2, 4);
        const row3 = finalPrompts.slice(4, 5);

        return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px 12px", animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ marginBottom: "24px", textAlign: "center", width: "100%", maxWidth: "860px" }}>
            <div style={{ fontSize: "clamp(22px, 5vw, 34px)", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#e8e4dc", lineHeight: "1.2", marginBottom: "16px" }}>Every great trip begins with a conversation.</div>
            <div style={{ color: "#6a6460", fontSize: "15px", lineHeight: "1.7", maxWidth: "580px", margin: "0 auto" }}>Tell me about your trip — or start with an idea. Explore destinations, discover events and dining, build an itinerary, and book your trip — all in one conversation. Every recommendation shaped by your loyalty programs, credit cards, and travel style — working together.</div>
          </div>
          <div style={{ width: "100%", maxWidth: "860px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.14)", outline: "1px solid rgba(255,255,255,0.05)", outlineOffset: "3px", borderRadius: "20px", padding: "6px 6px 6px 22px", display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "18px", position: "relative" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Where to? e.g. "4 days in Japan in October, two adults" · "surprise me with a long weekend under $1,500" · "best use of my Hyatt points this winter"`}
                rows={4} style={{ flex: 1, background: "transparent", border: "none", color: "#e8e4dc", fontSize: "15px", lineHeight: "1.7", padding: "14px 50px 14px 0", fontFamily: "'DM Sans',system-ui,sans-serif", resize: "none" }} />
              {/* Mic floats top-right inside box */}
              <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening} style={{ position: "absolute", top: "8px", right: "8px", width: "30px", height: "30px", borderRadius: "8px", border: "none", cursor: "pointer", background: listening ? "rgba(201,76,76,0.2)" : "transparent", color: listening ? "#C94C4C" : "#555", fontSize: "14px", animation: listening ? "pulse 1.2s infinite" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>&#127908;</button>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "8px", flexShrink: 0 }}>
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
                <div style={{ color: "#C9A84C", fontSize: "12px", fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", paddingLeft: "4px", animation: "fadeUp 0.4s ease forwards", alignSelf: "flex-start" }}>{loadingMessage}</div>
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
      <OptimizingForBar profile={userProfile} optimizeRecs={optimizeRecs} optimizeLoading={optimizeLoading} onOptimizeClick={fetchOptimizeRecs} setProfile={(updated) => {
        setUserProfile(updated);
        try { localStorage.setItem("sojourn_profile", JSON.stringify(updated)); } catch(e) {}
      }} />
    </div>
  );
}
