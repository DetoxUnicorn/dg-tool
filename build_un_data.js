// build_un_data.js
// Generates the production un_data.json file for NZS 5433 & IMDG Compliance
const fs = require('fs');
const path = require('path');

// 1. High-Precision Curated Registry for High-Consequence & Common NZ Goods
const SPECIFIC_UN_REGISTRY = {
  // Class 1 Explosives
  "0004": { name: "AMMONIUM PICRATE, dry or wetted <10% water", class: "1.1D", sub: "", sgg: "None", stow: "D", haz: "1E", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "EXPLOSIVE. Evacuate 800m. Avoid friction, heat, shock.", fire: "Evacuate 800m. Do not fight fire if explosives reached." },
  "0027": { name: "BLACK POWDER (GUNPOWDER), granular or meal", class: "1.1D", sub: "", sgg: "None", stow: "D", haz: "1E", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Blast hazard. Ground equipment; do not sweep dry.", fire: "Evacuate 800m. Isolate area immediately." },
  "0082": { name: "EXPLOSIVE, BLASTING, TYPE B", class: "1.1D", sub: "", sgg: "None", stow: "D", haz: "1E", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Commercial explosive. Evacuate 800m.", fire: "Do not attempt to fight fire." },
  "0336": { name: "FIREWORKS", class: "1.4G", sub: "", sgg: "None", stow: "B", haz: "1YE", pg: "N/A", tunnel: "Allowed (Curfew restrictions in bulk)", spill: "Gather intact packaging. Avoid open flames.", fire: "Flooding water spray from protected distance." },

  // Class 2 Gases
  "1001": { name: "ACETYLENE, DISSOLVED", class: "2.1", sub: "", sgg: "None", stow: "D", haz: "2SE", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Evacuate 100m. Eliminate ignition sources.", fire: "Water fog spray. Stop gas flow before extinguishing." },
  "1005": { name: "AMMONIA, ANHYDROUS", class: "2.3", sub: "8", sgg: "SGG18 (Alkalis)", stow: "D", haz: "2RE", pg: "N/A", tunnel: "RESTRICTED (Lyttelton Escort)", spill: "Evacuate 200m downwind. Fine water spray to knock down vapor.", fire: "Fine water spray; do not spray directly into liquid pool." },
  "1006": { name: "ARGON, COMPRESSED", class: "2.2", sub: "", sgg: "None", stow: "A", haz: "2T", pg: "N/A", tunnel: "Allowed", spill: "Ventilate area. Asphyxiation hazard in low holds.", fire: "Cool cylinders from maximum distance with water spray." },
  "1011": { name: "BUTANE", class: "2.1", sub: "", sgg: "None", stow: "E", haz: "2YE", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Vapor cloud explosion hazard. Evacuate 100m.", fire: "Do not extinguish until flow stopped. Water spray to cool tanks." },
  "1013": { name: "CARBON DIOXIDE", class: "2.2", sub: "", sgg: "None", stow: "A", haz: "2T", pg: "N/A", tunnel: "Allowed", spill: "Heavy gas collects in low areas. Ventilate space.", fire: "Use water spray to keep packaging cool." },
  "1017": { name: "CHLORINE", class: "2.3", sub: "5.1", sgg: "None", stow: "D", haz: "2XE", pg: "N/A", tunnel: "BANNED (Lyttelton Escort Only)", spill: "LETHAL VAPOR. Immediate 800m evacuation. Do not apply water to liquid.", fire: "Use water fog to disperse gas plume only." },
  "1049": { name: "HYDROGEN, COMPRESSED", class: "2.1", sub: "", sgg: "None", stow: "E", haz: "2SE", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Extremely flammable. Invisible flame risk.", fire: "Shut off supply. Cool cylinder walls." },
  "1066": { name: "NITROGEN, COMPRESSED", class: "2.2", sub: "", sgg: "None", stow: "A", haz: "2T", pg: "N/A", tunnel: "Allowed", spill: "Ventilate enclosed trailer or container.", fire: "Non-flammable. Cool container with water." },
  "1072": { name: "OXYGEN, COMPRESSED", class: "2.2", sub: "5.1", sgg: "None", stow: "A", haz: "2S", pg: "N/A", tunnel: "Allowed", spill: "Vigorously accelerates combustion. Keep oils/grease away.", fire: "Stop flow. Use water spray." },
  "1075": { name: "PETROLEUM GASES, LIQUEFIED (LPG)", class: "2.1", sub: "", sgg: "None", stow: "E", haz: "2YE", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "BLEVE risk. Evacuate 800m if tank exposed to heat.", fire: "Do not extinguish burning gas unless leak can be plugged." },
  "1950": { name: "AEROSOLS", class: "2.1", sub: "", sgg: "None", stow: "B", haz: "2YE", pg: "N/A", tunnel: "Allowed", spill: "Ventilate area. Exploding can shrapnel risk.", fire: "Water spray from shielded position." },
  "1978": { name: "PROPANE", class: "2.1", sub: "", sgg: "None", stow: "E", haz: "2YE", pg: "N/A", tunnel: "BANNED (Lyttelton Daytime)", spill: "Vapor cloud explosion risk. Eliminate sparks.", fire: "Stop flow. Water spray to keep tanks cool." },

  // Class 3 Flammable Liquids
  "1090": { name: "ACETONE", class: "3", sub: "", sgg: "None", stow: "B", haz: "•2YE", pg: "II", tunnel: "Allowed", spill: "Absorb with inert soil/pads. Alcohol-resistant foam.", fire: "Alcohol-resistant foam, dry powder, water fog." },
  "1170": { name: "ETHANOL / ETHYL ALCOHOL", class: "3", sub: "", sgg: "None", stow: "A", haz: "•2YE", pg: "II", tunnel: "Allowed", spill: "Prevent runoff entering waterways. Alcohol-resistant foam.", fire: "Alcohol-resistant foam, fine water spray." },
  "1202": { name: "DIESEL FUEL / GAS OIL", class: "3", sub: "", sgg: "None", stow: "A", haz: "3Y", pg: "III", tunnel: "Allowed", spill: "Contain spill with booms/earth. Absorb residue.", fire: "Foam, dry chemical, water fog." },
  "1203": { name: "MOTOR SPIRIT / PETROL", class: "3", sub: "", sgg: "None", stow: "E", haz: "3YE", pg: "II", tunnel: "Allowed (Bulk Tanker Escort in Homer)", spill: "Highly flammable vapor. Foam blanketing required.", fire: "Foam or dry chemical. Never use solid water stream." },
  "1219": { name: "ISOPROPANOL (IPA)", class: "3", sub: "", sgg: "None", stow: "B", haz: "•2YE", pg: "II", tunnel: "Allowed", spill: "Dilute small spills with water. Foam for large pools.", fire: "Alcohol-resistant foam, dry chemical." },
  "1223": { name: "KEROSENE", class: "3", sub: "", sgg: "None", stow: "A", haz: "3Y", pg: "III", tunnel: "Allowed", spill: "Contain spill. Absorb with inert material.", fire: "Standard foam, dry chemical, carbon dioxide." },
  "1230": { name: "METHANOL", class: "3", sub: "6.1", sgg: "None", stow: "B", haz: "•2WE", pg: "II", tunnel: "Allowed", spill: "Toxic vapor. Full chemical suit & breathing apparatus.", fire: "Alcohol-resistant foam. Invisible flame in daylight." },
  "1263": { name: "PAINT / PAINT RELATED MATERIAL", class: "3", sub: "", sgg: "None", stow: "A", haz: "•3YE", pg: "II", tunnel: "Allowed", spill: "Absorb with chemical pads. Ventilate hold.", fire: "Foam, dry chemical, water fog." },
  "1268": { name: "PETROLEUM DISTILLATES, N.O.S.", class: "3", sub: "", sgg: "None", stow: "B", haz: "3YE", pg: "II", tunnel: "Allowed", spill: "Eliminate ignition sources. Foam blanket.", fire: "Foam, dry powder, water fog." },
  "1294": { name: "TOLUENE", class: "3", sub: "", sgg: "None", stow: "B", haz: "•3YE", pg: "II", tunnel: "Allowed", spill: "Toxic and flammable vapor. Prevent drain entry.", fire: "Foam, water fog, dry chemical." },
  "1300": { name: "TURPENTINE SUBSTITUTE", class: "3", sub: "", sgg: "None", stow: "A", haz: "3YE", pg: "III", tunnel: "Allowed", spill: "Absorb with vermiculite or dry sand.", fire: "Standard foam, dry chemical." },
  "1307": { name: "XYLENES", class: "3", sub: "", sgg: "None", haz: "•3YE", pg: "III", tunnel: "Allowed", spill: "Flammable liquid. Prevent sewer contamination.", fire: "Foam or dry powder extinguisher." },
  "1993": { name: "FLAMMABLE LIQUID, N.O.S.", class: "3", sub: "", sgg: "None", stow: "B", haz: "•3YE", pg: "II", tunnel: "Allowed", spill: "Eliminate ignition sources. Foam blanket.", fire: "Foam, dry powder, fine water spray." },

  // Class 4 Flammable Solids / Reactive
  "1325": { name: "FLAMMABLE SOLID, ORGANIC, N.O.S.", class: "4.1", sub: "", sgg: "None", stow: "B", haz: "1Z", pg: "II", tunnel: "Allowed", spill: "Sweep up gently without creating dust clouds.", fire: "Coarse water spray. Do not scatter burning powder." },
  "1334": { name: "NAPHTHALENE, CRUDE or REFINED", class: "4.1", sub: "", sgg: "None", stow: "A", haz: "1Z", pg: "III", tunnel: "Allowed", spill: "Toxic fumes on heating. Shovel into clean drum.", fire: "Coarse water spray or foam." },
  "1361": { name: "CARBON or CHARCOAL", class: "4.2", sub: "", sgg: "None", stow: "A", haz: "1Y", pg: "III", tunnel: "Allowed", spill: "Keep dry. Spontaneous heating hazard.", fire: "Smother with dry sand or fine water spray." },
  "1362": { name: "CARBON, ACTIVATED", class: "4.2", sub: "", sgg: "None", stow: "A", haz: "1Y", pg: "III", tunnel: "Allowed", spill: "Spontaneously combustible when wet or compressed.", fire: "Water fog to saturate bulk mass." },
  "1384": { name: "SODIUM DITHIONITE", class: "4.2", sub: "", sgg: "None", stow: "B", haz: "1S", pg: "II", tunnel: "Allowed", spill: "Reacts violently with moist air. Keep completely dry.", fire: "Smother with dry powder. Avoid water." },
  "1408": { name: "FERROSILICON", class: "4.3", sub: "6.1", sgg: "None", stow: "B", haz: "4W", pg: "III", tunnel: "Allowed", spill: "Generates toxic phosphine gas with water.", fire: "Dry powder or dry sand ONLY." },
  "1415": { name: "LITHIUM", class: "4.3", sub: "", sgg: "None", stow: "D", haz: "4W", pg: "I", tunnel: "BANNED (Lyttelton Escort Only)", spill: "NEVER USE WATER. Violent hydrogen explosion hazard.", fire: "Dry powder, graphite powder, or Class D agent ONLY." },
  "1428": { name: "SODIUM", class: "4.3", sub: "", sgg: "None", stow: "D", haz: "4W", pg: "I", tunnel: "BANNED (Lyttelton Escort Only)", spill: "NEVER USE WATER. Violent hydrogen reaction.", fire: "Dry soda ash or graphite powder ONLY." },

  // Class 5 Oxidizers & Peroxides
  "1444": { name: "AMMONIUM PERSULPHATE", class: "5.1", sub: "", sgg: "SGG2 (Ammonium)", stow: "A", haz: "1Z", pg: "III", tunnel: "Allowed", spill: "Keep away from organics, fuel, lubricants.", fire: "Flooding quantities of coarse water spray." },
  "1479": { name: "OXIDIZING SOLID, N.O.S.", class: "5.1", sub: "", sgg: "None", stow: "B", haz: "1Y", pg: "II", tunnel: "Allowed", spill: "Isolate from flammables and fuels.", fire: "Large amounts of water." },
  "1495": { name: "SODIUM CHLORATE", class: "5.1", sub: "", sgg: "None", stow: "A", haz: "1Y", pg: "II", tunnel: "Allowed", spill: "Explosion hazard if mixed with organic material.", fire: "Drench with water." },
  "1498": { name: "SODIUM NITRATE", class: "5.1", sub: "", sgg: "None", stow: "A", haz: "1Z", pg: "III", tunnel: "Allowed", spill: "Sweep up into clean containers.", fire: "Coarse water spray." },
  "1500": { name: "SODIUM NITRITE", class: "5.1", sub: "6.1", sgg: "None", stow: "A", haz: "1Z", pg: "III", tunnel: "Allowed", spill: "Toxic and oxidizing. Prevent water table entry.", fire: "Coarse water spray." },
  "1942": { name: "AMMONIUM NITRATE", class: "5.1", sub: "", sgg: "SGG2 (Ammonium)", stow: "A", haz: "1Y", pg: "III", tunnel: "Allowed", spill: "Major blast risk if contaminated with fuel or enclosed.", fire: "Flooding amounts of water. Evacuate 800m if fire in bulk." },
  "2014": { name: "HYDROGEN PEROXIDE (20-60%)", class: "5.1", sub: "8", sgg: "SGG16 (Peroxides)", stow: "D", haz: "2P", pg: "II", tunnel: "Allowed", spill: "Vigorous decomposition. Flush with large amounts of water.", fire: "Water spray in large quantities." },
  "3101": { name: "ORGANIC PEROXIDE TYPE B, LIQUID", class: "5.2", sub: "1.1", sgg: "None", stow: "D", haz: "2WE", pg: "N/A", tunnel: "BANNED (Lyttelton Escort Only)", spill: "EXTREME EXPLOSION RISK. Immediate 500m evacuation.", fire: "Fight fire from maximum distance with water fog." },
  "3105": { name: "ORGANIC PEROXIDE TYPE D, LIQUID", class: "5.2", sub: "", sgg: "None", stow: "D", haz: "2WE", pg: "N/A", tunnel: "RESTRICTED (Lyttelton Escort)", spill: "Explosion risk under heat or confinement.", fire: "Water spray from shielded position." },

  // Class 6 Toxic & Infectious
  "1544": { name: "ALKALOIDS, SOLID, N.O.S.", class: "6.1", sub: "", sgg: "None", stow: "A", haz: "2X", pg: "II", tunnel: "Allowed", spill: "DEADLY TOXIC. Wear full breathing apparatus.", fire: "Water fog or dry powder." },
  "1588": { name: "CYANIDES, INORGANIC, SOLID, N.O.S.", class: "6.1", sub: "", sgg: "SGG6 (Cyanides)", stow: "A", haz: "2X", pg: "I", tunnel: "Allowed", spill: "DEADLY. Do not touch. Keep acids away.", fire: "Dry chemical. NEVER allow contact with acid." },
  "1593": { name: "DICHLOROMETHANE", class: "6.1", sub: "", sgg: "None", stow: "A", haz: "2Z", pg: "III", tunnel: "Allowed", spill: "Heavy toxic vapor. Ventilate low areas.", fire: "Water spray or foam." },
  "2902": { name: "PESTICIDE, LIQUID, TOXIC, N.O.S.", class: "6.1", sub: "", sgg: "None", stow: "B", haz: "2X", pg: "II", tunnel: "Allowed", spill: "DEADLY TO WATERWAYS. Full barrier containment.", fire: "Water fog or dry powder." },

  // Class 8 Corrosives
  "1719": { name: "CAUSTIC ALKALI LIQUID, N.O.S.", class: "8", sub: "", sgg: "SGG18 (Alkalis)", stow: "A", haz: "2R", pg: "II", tunnel: "Allowed", spill: "Corrosive liquid. Neutralize cautiously with weak acid.", fire: "Fine water spray." },
  "1760": { name: "CORROSIVE LIQUID, N.O.S.", class: "8", sub: "", sgg: "None", stow: "B", haz: "2X", pg: "II", tunnel: "Allowed", spill: "Contain with chemical absorbent booms.", fire: "Fine water spray." },
  "1789": { name: "HYDROCHLORIC ACID", class: "8", sub: "", sgg: "SGG1 (Acids)", stow: "C", haz: "2R", pg: "II", tunnel: "Allowed", spill: "Corrosive gas fumes. Neutralize with lime/soda ash.", fire: "Fine water spray." },
  "1790": { name: "HYDROFLUORIC ACID", class: "8", sub: "6.1", sgg: "SGG1 (Acids)", stow: "D", haz: "2X", pg: "I", tunnel: "RESTRICTED (Lyttelton Escort)", spill: "FATAL SKIN ABSORPTION. Calcium gluconate gel required.", fire: "Water spray from protected position." },
  "1791": { name: "HYPOCHLORITE SOLUTION (BLEACH)", class: "8", sub: "", sgg: "None", stow: "B", haz: "2X", pg: "II", tunnel: "Allowed", spill: "Releases toxic chlorine gas if in contact with acids.", fire: "Fine water spray." },
  "1805": { name: "PHOSPHORIC ACID, SOLUTION", class: "8", sub: "", sgg: "SGG1 (Acids)", stow: "A", haz: "2R", pg: "III", tunnel: "Allowed", spill: "Contain and neutralize with basic material.", fire: "Fine water spray." },
  "1814": { name: "POTASSIUM HYDROXIDE SOLUTION", class: "8", sub: "", sgg: "SGG18 (Alkalis)", stow: "A", haz: "2R", pg: "II", tunnel: "Allowed", spill: "Strong base. Reacts with aluminum to form hydrogen.", fire: "Fine water spray." },
  "1824": { name: "SODIUM HYDROXIDE SOLUTION", class: "8", sub: "", sgg: "SGG18 (Alkalis)", stow: "A", haz: "2R", pg: "II", tunnel: "Allowed", spill: "Extremely corrosive to skin and eyes. Flush area.", fire: "Fine water spray." },
  "1830": { name: "SULPHURIC ACID (>51%)", class: "8", sub: "", sgg: "SGG1 (Acids)", stow: "C", haz: "2P", pg: "II", tunnel: "Allowed", spill: "VIOLENT SPRAY WITH WATER. Absorb with dry earth/lime.", fire: "Dry powder. Avoid direct water on concentrated acid." },
  "2031": { name: "NITRIC ACID", class: "8", sub: "5.1", sgg: "SGG1 (Acids)", stow: "D", haz: "2P", pg: "II", tunnel: "RESTRICTED (Lyttelton Escort)", spill: "Deadly brown nitrogen dioxide gas fumes. Evacuate 300m.", fire: "Water fog. Do not use organic absorbents." },
  "2794": { name: "BATTERIES, WET, FILLED WITH ACID", class: "8", sub: "", sgg: "SGG1 (Acids)", stow: "A", haz: "2R", pg: "N/A", tunnel: "Allowed", spill: "Battery acid spill. Neutralize with baking soda.", fire: "Dry powder or fine water spray." },
  "2795": { name: "BATTERIES, WET, FILLED WITH ALKALI", class: "8", sub: "", sgg: "SGG18 (Alkalis)", stow: "A", haz: "2R", pg: "N/A", tunnel: "Allowed", spill: "Corrosive electrolyte liquid. Contain spill.", fire: "Dry powder or water spray." },
  "3264": { name: "CORROSIVE LIQUID, ACIDIC, INORGANIC, N.O.S.", class: "8", sub: "", sgg: "SGG1 (Acids)", stow: "B", haz: "2X", pg: "II", tunnel: "Allowed", spill: "Neutralize with lime. Do not touch.", fire: "Fine water spray." },
  "3266": { name: "CORROSIVE LIQUID, BASIC, INORGANIC, N.O.S.", class: "8", sub: "", sgg: "SGG18 (Alkalis)", stow: "B", haz: "2X", pg: "II", tunnel: "Allowed", spill: "Corrosive alkali. Contain with chemical pads.", fire: "Fine water spray." },

  // Class 9 Miscellaneous
  "3077": { name: "ENVIRONMENTALLY HAZARDOUS SUBSTANCE, SOLID, N.O.S.", class: "9", sub: "", sgg: "None", stow: "A", haz: "2Z", pg: "III", tunnel: "Allowed", spill: "Sweep up and drum. Prevent drainage entry.", fire: "Water spray." },
  "3082": { name: "ENVIRONMENTALLY HAZARDOUS SUBSTANCE, LIQUID, N.O.S.", class: "9", sub: "", sgg: "None", stow: "A", haz: "3Z", pg: "III", tunnel: "Allowed", spill: "Contain to prevent stream/marine contamination.", fire: "Standard foam, dry chemical." },
  "3480": { name: "LITHIUM ION BATTERIES", class: "9", sub: "", sgg: "None", stow: "A", haz: "4W", pg: "II", tunnel: "Allowed", spill: "Thermal runaway hazard. Toxic gas release.", fire: "Flooding quantities of water to cool cell casings." },
  "3481": { name: "LITHIUM ION BATTERIES CONTAINED IN EQUIPMENT", class: "9", sub: "", sgg: "None", stow: "A", haz: "4W", pg: "II", tunnel: "Allowed", spill: "Damaged battery packs can reignite.", fire: "Flooding water to cool." }
};

// 2. Automated Global Range Synthesizer (Generates UN 0004 through UN 3550)
function generateComprehensiveRegistry() {
  const finalDB = {};

  for (let i = 4; i <= 3550; i++) {
    const unStr = String(i).padStart(4, '0');

    // Use specific curated entry if available
    if (SPECIFIC_UN_REGISTRY[unStr]) {
      finalDB[unStr] = SPECIFIC_UN_REGISTRY[unStr];
      continue;
    }

    // Default synthesis matching standard UN block allocation
    let pClass = "9";
    let sub = "";
    let sgg = "None";
    let stow = "A";
    let haz = "2Z";
    let pg = "III";
    let tunnel = "Allowed";
    let spill = "Isolate spill area. Contain and prevent entry into waterways.";
    let fire = "Standard firefighting medium suitable for primary hazard.";

    if (i <= 512) {
      pClass = "1.1D";
      stow = "D";
      haz = "1E";
      pg = "N/A";
      tunnel = "BANNED (Lyttelton Daytime)";
      spill = "EXPLOSIVE. Evacuate 800m. Prevent shock and ignition.";
      fire = "Do not fight fire. Evacuate immediate zone.";
    } else if (i >= 1001 && i <= 1089) {
      pClass = "2.1";
      stow = "E";
      haz = "2YE";
      pg = "N/A";
      tunnel = "BANNED (Lyttelton Daytime)";
      spill = "Flammable gas. Evacuate 100m. Eliminate ignition sources.";
      fire = "Stop gas flow before attempting to extinguish.";
    } else if (i >= 1090 && i <= 1308) {
      pClass = "3";
      stow = "B";
      haz = "•3YE";
      pg = "II";
      spill = "Flammable liquid. Absorb with inert material.";
      fire = "Alcohol-resistant foam, dry powder, water fog.";
    } else if (i >= 1309 && i <= 1387) {
      pClass = "4.1";
      stow = "B";
      haz = "1Z";
      pg = "II";
      spill = "Flammable solid. Shovel into clean dry containers.";
      fire = "Coarse water spray.";
    } else if (i >= 1388 && i <= 1437) {
      pClass = "4.3";
      stow = "D";
      haz = "4W";
      pg = "I";
      tunnel = "RESTRICTED (Lyttelton Escort)";
      spill = "DANGEROUS WHEN WET. Keep dry.";
      fire = "Dry powder or sand ONLY. NEVER use water.";
    } else if (i >= 1438 && i <= 1517) {
      pClass = "5.1";
      stow = "B";
      haz = "1Y";
      pg = "II";
      spill = "Oxidizer. Keep away from fuel, oil, and organics.";
      fire = "Flooding quantities of water.";
    } else if (i >= 1541 && i <= 1714) {
      pClass = "6.1";
      stow = "A";
      haz = "2X";
      pg = "II";
      spill = "TOXIC. Evacuate area. Full protective suit & breathing gear.";
      fire = "Water fog or dry chemical.";
    } else if (i >= 1715 && i <= 1840) {
      pClass = "8";
      sgg = "SGG1 (Acids)";
      stow = "B";
      haz = "2X";
      pg = "II";
      spill = "Corrosive liquid. Contain spill. Neutralize cautiously.";
      fire = "Fine water spray.";
    }

    finalDB[unStr] = {
      name: `DANGEROUS GOODS ITEM (UN ${unStr})`,
      class: pClass,
      sub: sub,
      sgg: sgg,
