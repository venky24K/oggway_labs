/**
 * Prompts and Quick Starters Library for The Lenny Growth Assistant
 * Provides curated prompts for onboarding, quick playbook cards, and conversational starters.
 */

export const WELCOME_QUICK_CARDS = [
  {
    id: "elena-verna-plg",
    tag: "Elena Verna • PLG Strategy",
    text: "How does Elena Verna define Product-Led Growth vs Sales-Led Growth?",
    query: "How does Elena Verna define Product-Led Growth vs Sales-Led Growth?",
    options: {}
  },
  {
    id: "brian-chesky-founder-mode",
    tag: "Brian Chesky • Leadership",
    text: "What are Brian Chesky's key principles for 'Founder Mode'?",
    query: "What are Brian Chesky's key principles for 'Founder Mode' and redesigning product reviews?",
    options: {}
  },
  {
    id: "ship30-plg-essay",
    tag: "Ship 30 for 30 • Atomic Essay",
    text: "⚡ Turn PLG retention loops into an ~1,250-word Ship 30 for 30 essay",
    query: "Write a Ship 30 for 30 essay on product-led growth retention loops based on Lenny's Podcast",
    options: { generate_ship30: true }
  },
  {
    id: "interactive-growth-model",
    tag: "Interactive Artifact • Viewer",
    text: "📊 Generate an interactive Growth & Retention Model calculator widget",
    query: "Generate an interactive Growth & Retention Model calculator HTML artifact",
    options: { generate_artifact: true }
  }
];

export const PLAYBOOK_SHORTCUTS = [
  {
    id: "plg-vs-slg",
    title: "Elena Verna: PLG vs SLG",
    icon: "Sparkles",
    color: "var(--accent-primary)",
    query: "What does Elena Verna say about B2B Product-Led Growth vs Sales-Led?",
    options: {}
  },
  {
    id: "founder-mode",
    title: "Brian Chesky: Founder Mode",
    icon: "Sparkles",
    color: "var(--accent-secondary)",
    query: "What are Brian Chesky's key lessons on Founder Mode and product playbooks?",
    options: {}
  },
  {
    id: "ship30-pmf",
    title: "Ship 30 for 30 Essay",
    icon: "BookOpen",
    color: "var(--accent-amber)",
    query: "Write a Ship 30 for 30 essay on finding Product-Market Fit based on Lenny's Podcast",
    options: { generate_ship30: true }
  },
  {
    id: "growth-calculator",
    title: "Interactive Calculator",
    icon: "BarChart2",
    color: "var(--accent-emerald)",
    query: "Generate an interactive Growth & Retention Model calculator HTML artifact",
    options: { generate_artifact: true }
  }
];

export const CONVERSATIONAL_STARTERS = [
  {
    label: "👋 Introduction",
    query: "Hi, who are you and what can you help me with?"
  },
  {
    label: "🛠️ Capabilities",
    query: "What can you do, and how are Lenny's podcast episodes indexed?"
  },
  {
    label: "🎯 Founder Mode",
    query: "Explain Brian Chesky's concept of Founder Mode"
  },
  {
    label: "📈 Growth Model",
    query: "Build an interactive ARR and retention model artifact"
  }
];
