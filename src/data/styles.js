import { CARD_DATA } from "./cards";

export function computeStyle(tagged, likes, skips, reasonCount) {
  const c = { food: 0, views: 0, culture: 0, night: 0, green: 0 };
  const dealt = { queue: 0, budget: 0, slow: 0, morning: 0 };

  CARD_DATA.forEach((card) => {
    const hit = tagged[card.id];
    if (!hit) return;
    if (hit.dir !== "yes") {
      hit.reasons.forEach((r) => {
        const l = r.toLowerCase();
        if (l.includes("queue") || l.includes("busy") || l.includes("crowd")) dealt.queue++;
      });
      return;
    }
    if (card.cat.includes("Food")) c.food++;
    if (card.cat.includes("View")) c.views++;
    if (card.cat.includes("Culture")) c.culture++;
    if (card.cat.includes("Nightlife")) c.night++;
    if (card.cat.includes("Green") || card.cat.includes("Chill")) c.green++;
    hit.reasons.forEach((r) => {
      const l = r.toLowerCase();
      if (l.includes("street food") || l.includes("food")) c.food += 0.5;
      if (l.includes("sunset") || l.includes("view") || l.includes("photo")) c.views += 0.5;
      if (l.includes("slow morning") || l.includes("picnic") || l.includes("calm")) dealt.slow++;
      if (l.includes("free")) dealt.budget++;
    });
  });

  const top = Object.keys(c).sort((a, b) => c[b] - c[a])[0];
  const base =
    top === "food" ? "Street-Food Scout" :
    top === "views" ? "Golden-Hour Hunter" :
    top === "culture" ? "Curious Culture Collector" :
    top === "night" ? "Night-Optimist" : "Balanced Wanderer";

  let prefix = "";
  const traits = [];
  if (dealt.queue >= 2) {
    prefix = "Queue-Avoiding ";
    traits.push(`Flagged 'no queues' on ${dealt.queue} cards — crowds read as your silent dealbreaker.`);
  }
  if (dealt.budget >= 2) {
    traits.push(`Chose ${dealt.budget} free stops to stretch the budget — value is a feature, not a discount.`);
  }
  if (dealt.slow >= 1) {
    traits.push("Picked the slow stops — mornings start late by design.");
  }

  const catLabels = { food: "Foodie", views: "View hunter", culture: "Culture", night: "Nightlife", green: "Chill" };
  if (traits.length < 3) {
    traits.push(`Your dominant lane is ${catLabels[top].toLowerCase()} — ${Math.round(c[top])} of your likes landed there.`);
  }

  const total = c.food + c.views + c.culture + c.night + c.green || 1;
  const bars = [
    { l: "Street food", v: Math.round(c.food / total * 100) },
    { l: "Views & vibes", v: Math.round(c.views / total * 100) },
    { l: "Culture", v: Math.round(c.culture / total * 100) },
    { l: "Nightlife", v: Math.round(c.night / total * 100) },
    { l: "Chill & green", v: Math.round(c.green / total * 100) },
  ];

  const name = prefix + base;

  return { name, bars, traits, likes, skips, reasonCount };
}

export const SATISFACTION = {
  balanced: 84,
  foodfirst: 79,
  slower: 81,
};

export const MEMBER_SATISFACTION = [
  { name: "Alice", base: 91 },
  { name: "Ben", base: 88 },
  { name: "Priya", base: 79 },
  { name: "Marcus", base: 78 },
];
