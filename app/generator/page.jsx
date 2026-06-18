import { useState, useMemo } from "react";

const THEMES = [
  {name:"Cinderella (The Glass Slipper)",cat:"Disney / Fairytale",shape:"Almond",prompt:"A macro editorial photo of a luxury princess manicure, long almond shape. Translucent ice-blue jelly polish with a subtle silver glitter gradient mimicking magic dust. One accent nail features an iridescent, shattered glass encapsulated effect. Minimalist 3D silver chrome accents mimicking elegant royal carriage filigree. Hyper-glossy, glass-like finish, professional salon lighting."},
  {name:"Ariel (The Little Mermaid)",cat:"Disney / Fairytale",shape:"Coffin",prompt:"A crisp close-up photo of a mermaid-themed manicure, medium coffin shape. A flawless vertical ombré shifting from vibrant seafoam teal to deep amethyst purple. Intricate textured mermaid scales highlighted with a soft white chrome shimmer. Tiny clusters of real micro-pearls and gold beads at the base. High-gloss finish with 3D clear gel water droplets."},
  {name:"Belle (The Stained Glass Rose)",cat:"Disney / Fairytale",shape:"Oval",prompt:"A detailed macro photo of a luxury fairytale manicure, medium oval shape. Soft cream base with a shifting gold magnetic cat-eye shimmer. The ring finger showcases a highly detailed stained glass window art piece of a red rose, outlined in raised 3D antique gold line-work with jewel-toned translucent fills. Elegant sculpted 3D gel swirls mimicking ballgown drapes. Professional studio lighting."},
  {name:"Maleficent (Mistress of All Evil)",cat:"Disney / Fairytale",shape:"Stiletto",prompt:"A macro editorial photo of a dark villain-themed manicure, long stiletto shape. Bottomless velvet matte black base. Dramatic airbrushed wisps of glossy neon-lime green and royal purple smoke rising from the tips. A sharp sculpted 3D black gel horn structure at the cuticle base. Moody dramatic lighting."},
  {name:"Frozen (The Fractured Ice)",cat:"Disney / Fairytale",shape:"Stiletto",prompt:"A macro photograph of an ice-palace inspired luxury manicure, long stiletto shape. A sheer, ice-blue translucent jelly base with incredible depth, encapsulating jagged silver holographic foil shards that look like fractured glacier ice. The ring finger is adorned with a sharp white-chrome snowflake design and a tiny diamond crystal at the center. High-gloss, glass-like reflection."},
  {name:"Taylor Swift (Midnights Era)",cat:"Taylor Swift Eras",shape:"Coffin",prompt:"An editorial studio photograph of a retro-celestial manicure, long coffin shape. Deep midnight-navy blue base with an intense multi-dimensional blue magnetic cat-eye shimmer. Accent nails feature sharp geometric lines of 24k gold chrome forming a minimalist abstract clock face at midnight. Glamorous, moody lighting."},
  {name:"Taylor Swift (Reputation Era)",cat:"Taylor Swift Eras",shape:"Stiletto",prompt:"A macro editorial photo of an edgy dark-pop gothic manicure, long stiletto shape. Pitch-black velvet matte base. Accent nails feature an incredibly detailed raised 3D snake-skin scale texture buffed in highly reflective sinister gunmetal dark chrome. A razor-thin line of liquid mirror silver on the thumb. Dramatic shadows, high contrast texture."},
  {name:"Taylor Swift (Lover Era)",cat:"Taylor Swift Eras",shape:"Almond",prompt:"A close-up studio photograph of an ethereal pop manicure, long almond shape. A flawless seamless airbrushed vertical ombré blending pastel cotton-candy pink, soft baby blue, and pale sunbeam yellow. Saturated with an all-over micro-fine holographic unicorn shimmer. The ring finger carries a clean precise hand-painted heart outline in vivid pink glitter. Dreamy, bright lighting."},
  {name:"Taylor Swift (Folklore Era)",cat:"Taylor Swift Eras",shape:"Round",prompt:"An editorial photograph of a cozy indie-folk inspired manicure, medium round shape. A beautifully organic palette of matte slate grey, moss green, and oatmeal cream. The grey nails show a soft fabric-like flannel weave texture. The ring finger breaks the pattern with a brilliant hand-placed silver foil mosaic mirrorball reflecting sharp beams of light. Earthy, rustic, high-end look."},
  {name:"Taylor Swift (The Eras Tour Skittle Set)",cat:"Taylor Swift Eras",shape:"Almond",prompt:"A crisp close-up photo of the ultimate stadium fan manicure, medium almond shape. A mismatched skittle set where each nail features a flawless solid coat of a signature era color: teal, sparkling gold, royal purple, crimson red, sky blue, matte black, pastel pink, slate grey, warm amber, and midnight navy. The entire multi-colored set is unified by a brilliant high-gloss micro-fine silver holographic shimmer topcoat."},
  {name:"Sabrina Carpenter (Short n' Sweet)",cat:"Artists & Concerts",shape:"Round",prompt:"A crisp close-up photo of a hyper-feminine pop starlet manicure, short round shape. Alternating solid coats of glossy retro cream-yellow and soft pastel baby blue lacquer. The cream nails are adorned with tiny masterfully grouped ruby-red diamond gems forming perfect miniature hearts. The baby blue nails feature a neat curved row of microscopic white seed pearls. Pristine, Old Hollywood glamour."},
  {name:"Olivia Rodrigo (Guts Pop-Punk)",cat:"Artists & Concerts",shape:"Square",prompt:"A macro photograph of an edgy pop-punk concert manicure, short square shape. Features an intense velvet magnetic royal purple base color. The accent nails break the pattern with a stark matte white base canvas carrying grungy hand-doodled black ink butterflies and razor-thin scratched lines of liquid silver chrome safety pins. High contrast, cool-girl pop aesthetic."},
  {name:"Halloween (Vampire Bleed)",cat:"Holiday & Seasonal",shape:"Almond",prompt:"A macro editorial photo of a dark gothic luxury Halloween manicure, medium almond shape. Clean high-gloss nude beige base coat. The tips feature an asymmetrical dripping French smile design masterfully sculpted in a heavily raised 3D ruby-red translucent jelly gel to mimic wet fresh liquid blood pooling at the edges. High-key studio lighting with stark reflections."},
  {name:"Christmas (Velvet Candy Cane)",cat:"Holiday & Seasonal",shape:"Almond",prompt:"A macro editorial photo of a festive luxury holiday manicure, medium almond shape. Rich forest green base with a fuzzy light-absorbing velvet magnetic cat-eye effect. The accent nails display a striking diagonal candy cane stripe pattern composed of stark matte white and a heavily raised glossy 3D candy-apple red glitter gel. Clean, vibrant contrast, cozy winter aesthetic."},
  {name:"New Year's Eve (Midnight Disco Drop)",cat:"Holiday & Seasonal",shape:"Stiletto",prompt:"A macro photograph of a glamorous celebration manicure, long stiletto shape. Jet-black base entirely saturated with brilliant flash-reactive silver holographic glitter. A liquid-like highly reflective champagne-gold chrome overlay drips elegantly from the cuticles. The ring finger features an intricate hand-placed mosaic grid of tiny silver chrome disco ball mirrors. Searing high-key studio lighting."},
  {name:"Valentine's Day (Puffy Jelly Heart)",cat:"Holiday & Seasonal",shape:"Almond",prompt:"A close-up studio photo of a romantic luxury manicure, long almond shape. Translucent milky porcelain-pink base coat with sharp perfectly curved ruby-red French smile tips. The ring finger features a prominent centered 3D sculpted clear ruby-red jelly heart that looks like an embossed glass gemstone. Ultra-smooth wet high-gloss topcoat."},
  {name:"Outer Space (Pillars of Creation)",cat:"Outer Space & Sci-Fi",shape:"Coffin",prompt:"A macro editorial photo of a breathtaking galaxy-themed manicure, long coffin shape. Pitch-black base layer topped with multi-layered organic ink clouds of translucent magenta, deep indigo, and wisps of chartreuse green mimicking interstellar gas structures. Saturated at the core with dense exploding clusters of silver holographic micro-glitter star clusters. Hyper-glossy topcoat with infinite glass depth."},
  {name:"Outer Space (The Event Horizon)",cat:"Outer Space & Sci-Fi",shape:"Stiletto",prompt:"An editorial studio photograph of an avant-garde cosmic manicure, long stiletto shape. Light-absorbing dry velvet matte black base coat. Centered on each nail is a perfect void circle, bordered by a heavily raised molten 3D ring of hyper-reflective copper-gold mirror chrome that looks like a fiery accretion disk spinning around a black hole. High texturizing contrast."},
  {name:"Outer Space (Alien Aurora Borealis)",cat:"Outer Space & Sci-Fi",shape:"Coffin",prompt:"An editorial studio photograph of a mesmerizing sci-fi manicure, long coffin shape. Sheer black jelly base overlayed with a premium chameleon mirror chrome powder that shifts seamlessly from luminous neon lime-green to deep northern-lights teal and electric violet. Flawless liquid-silk texture with bright fluid-like light reflections."},
  {name:"High-Fashion Wedding (Gilded Rose Quartz)",cat:"Wedding & Bridal",shape:"Almond",prompt:"A close-up studio photo of an elegant wedding-guest manicure, medium almond shape. Multi-layered translucent base beautifully marbled to resemble genuine rose quartz crystal stone. Subtle organic white quartz mineral veins weave through the blush-pink jelly, accented by floating microscopic flakes of 24k gold leaf. Hyper-glossy glass topcoat."},
  {name:"High-Fashion Wedding (Champagne Satin)",cat:"Wedding & Bridal",shape:"Round",prompt:"A macro editorial photograph of a luxury bridesmaid manicure, short round shape. A soft shimmering champagne-gold silk base lacquer treated with a premium satin finish mimicking heavy bridal fabric. The tips feature an incredibly thin razor-sharp minimalist French line executed in high-shine 24k gold mirror chrome. Elegant, understated luxury jewelry campaign lighting."},
  {name:"Punk (Cyber Anarchy Neon)",cat:"Punk & Edgy",shape:"Coffin",prompt:"An editorial studio photograph of an edgy cyberpunk anarchy manicure, long coffin shape. Light-absorbing jet-black matte base. Realistic messy airbrushed splatters of neon magenta and electric green spray-paint graffiti layers. Slashed boldly over the ring finger is a raised 3D mirror-shine liquid silver chrome anarchy emblem. Bold graphic art."},
  {name:"Punk (Studded Leather Goth)",cat:"Punk & Edgy",shape:"Square",prompt:"A crisp close-up photo of a heavy metal goth-punk manicure, short square shape. Matte black base gel meticulously textured to replicate raw pebbled motorcycle jacket leather. Embellished down the center with a flawless geometric line of raised 3D liquid gunmetal chrome cone studs and sharp pyramid rivets. Industrial hardware style."},
  {name:"F1 Racing (Scuderia Ferrari)",cat:"Sports & Teams",shape:"Almond",prompt:"A macro editorial photo of a high-fashion Formula 1 inspired manicure, long almond shape. Flawless hyper-glossy signature Ferrari racing crimson red lacquer. The accent fingers feature an intricate textured matte-black carbon-fiber weave pattern. The ring finger has a pristine white base with a razor-sharp vertical yellow-and-black racing stripe graphic. Sleek paddock-luxe style."},
  {name:"NFL Football (Chiefs Kingdom Glitz)",cat:"Sports & Teams",shape:"Almond",prompt:"A close-up studio photograph of a glamorous football championship manicure, long almond shape. Intensely saturated arrowhead red gel base carrying a subtle sophisticated golden micro-shimmer. The ring finger features a brilliant encapsulated multi-dimensional chunky glitter mix that flashes true gold and high-shine white chrome like stadium confetti. High-gloss wet-look finish."},
  {name:"Basketball Mom (Court Courtyard)",cat:"Sports Mom",shape:"Coffin",prompt:"A macro photograph of a proud sports team mom manicure, medium coffin shape. Flawless high-gloss royal blue gel base coat. The ring finger features a realistic highly textured matte orange basketball grain leather accent nail with precise black seam lines. The middle finger features a crisp white base carrying a geometric basketball hoop net graphic. High contrast stadium lighting."},
  {name:"Soccer Mom (The Midfield Grid)",cat:"Sports Mom",shape:"Almond",prompt:"A crisp studio photo of a soccer mom lifestyle manicure, medium almond shape. Rich matte turf-green base textured lightly to look like a stadium pitch. The accent nails display a sharp vertical split of turf green and ultra-glossy school color blue. The ring finger features a clean white canvas showcasing a precise graphic mosaic of soccer ball pentagons. Pristine lines."},
  {name:"Beach Vibes (Aura Sunset)",cat:"Seasonal Vibes",shape:"Almond",prompt:"A macro editorial photo of a sunset beach inspired manicure, medium almond shape. A flawless seamless airbrushed aura gradient blending warm mango-orange, soft peach, and soft hibiscus-pink gel. Coated in an ultra-fine translucent iridescent glaze that flashes violet in the light. Hyper-glossy glass topcoat catching warm natural golden hour lighting."},
  {name:"Summer Vibes (Neon Dopamine)",cat:"Seasonal Vibes",shape:"Square",prompt:"An editorial studio photo of a bold 90s retro summer manicure, long square shape. Stark high-gloss chalk-white base color. Slicing across the edges are abstract razor-sharp geometric blocking patterns in ultra-matte neon hot pink, electric lime green, and vivid safety orange. High contrast between the glossy white and chalky neon paints."},
  {name:"Fall Vibes (Crushed Velvet Plum)",cat:"Seasonal Vibes",shape:"Coffin",prompt:"An editorial studio photo of an autumn velvet manicure, medium coffin shape. A rich deep plum-magenta base showing off a magnificent crushed velvet magnetic effect that glimmers smoothly from every direction. The finish is flawlessly flat and glossy on top but reveals massive deep fabric-like optical depth underneath. Moody fall lighting."},
  {name:"Spring Vibes (Botanical Pressed Fern)",cat:"Seasonal Vibes",shape:"Almond",prompt:"A close-up photograph of an organic botanical spring manicure, medium almond shape. Semi-sheer porcelain milky white base encapsulating real microscopic green pressed fern leaves and tiny white wildflower petals embedded deep within the clear gel layers. A soft whispering dust of metallic champagne gold leaf traces the natural edges of the nails. Glossy glass finish."},
  {name:"Art & History (Monet's Lily Garden)",cat:"Art & Culture",shape:"Oval",prompt:"A close-up studio photograph of an impressionist fine-art manicure, medium oval shape. Translucent milky white porcelain base layer. Decorated with delicate soft hand-painted watercolor ink strokes blending pastel periwinkle blue, light violet, and whispering sage green. Layered with a glossy glass topcoat containing an ultra-fine shimmering white-gold micro-dust. Soft ethereal lighting."},
  {name:"Art & History (Baroque Imperial Gold)",cat:"Art & Culture",shape:"Coffin",prompt:"A macro editorial photo of an opulent Baroque-inspired manicure, long coffin shape. Light-absorbing velvet matte royal burgundy base color. The accent fingers feature heavily raised masterfully sculpted 3D antique gold mirror chrome ornamental scrollwork and intricate rococo filigree borders reminiscent of a gilded museum frame. High texture contrast, dramatic moody lighting."},
  {name:"Las Vegas (Sin City Strip)",cat:"Destinations & Vibes",shape:"Coffin",prompt:"A macro editorial photo of a luxury Las Vegas nightlife manicure, long coffin shape. Light-absorbing pitch-black velvet matte base. Slicing sharply across the dark surface are razor-sharp geometric lines in heavily raised high-gloss liquid poker-chip red chrome and brilliant 24k gold mirror chrome. The thumb features a microscopic gold spade emblem at the cuticle base. High contrast casino-luxe lighting."},
  {name:"Miami (Vice Paddock Glam)",cat:"Destinations & Vibes",shape:"Almond",prompt:"A crisp close-up studio photograph of a modern Miami lifestyle manicure, medium almond shape. Stark high-gloss porcelain white enamel base. The accent fingers feature a flawless seamless airbrushed aura gradient blending neon flamingo-pink and electric teal gel. The colors are divided by sharp razor-thin vertical lines of liquid platinum-silver mirror chrome. Vibrant sun-drenched coastal lighting."},
  {name:"Animal Textures (Tortoiseshell)",cat:"Animal Textures",shape:"Coffin",prompt:"An editorial studio photo of a high-end tortoiseshell print manicure, medium coffin shape. A rich multi-layered fusion of dark chocolate ink spots and jet-black organic blooms suspended deep within a glowing translucent golden-amber glass jelly base. Coated in a wet-look high-gloss enamel topcoat with pristine fluid light reflections."},
  {name:"Animal Textures (Snow Leopard Velvet)",cat:"Animal Textures",shape:"Almond",prompt:"A stunning close-up photo of a winter animal print manicure, medium almond shape. Sheer milky white base carrying a plush light-absorbing velvet magnetic cat-eye shimmer mimicking soft optical fur. Stenciled precisely over the velvet are irregular stylized snow leopard spot rosettes done in chalky matte charcoal and soft taupe paint. High texture contrast."},
  {name:"Candyland (Glazed Sugar Drop)",cat:"Candy & Whimsy",shape:"Coffin",prompt:"A macro photograph of a whimsical luxury sugar-inspired manicure, medium coffin shape. Pastel cotton-candy pink base buffed to perfection with a premium iridescent chrome powder creating a mirror sheen with a shifting green-and-pink pearl look. The cuticles of the accent nails are framed by a flawless row of microscopic pastel-tinted diamond crystals. Radiant studio lighting."},
  {name:"Candyland (Haute Couture Lollipop)",cat:"Candy & Whimsy",shape:"Almond",prompt:"An editorial studio photograph of an avant-garde candy-inspired manicure, long almond shape. Translucent candy-apple jelly bases in hot magenta and electric blue with immense glass depth. Encapsulating irregular shards of iridescent cellophane sheet that flash violet in the light. Smooth raised 3D clear gel ripples curve gracefully over the surface like hand-spun glass candy. High-gloss wet-look topcoat."},
  {name:"Jet Black (Liquid Obsidian Mirror)",cat:"Solid Color & Minimalist",shape:"Coffin",prompt:"A macro editorial photo of a supreme minimalist dark manicure, long coffin shape. Solid coat of the deepest light-absorbing enamel jet black lacquer. Coated in a heavy wet-look high-gloss glass topcoat reflecting sharp clean distortion-free studio lines like black obsidian mirror glass."},
  {name:"Holographic (Infinite Prism Glass)",cat:"Solid Color & Minimalist",shape:"Coffin",prompt:"An editorial photograph of a show-stopping futuristic clear manicure, long coffin shape. Completely transparent crystal-clear glass extensions exposing natural nail bed architecture. The glass tips encapsulate high-density linear holographic dust particles that explode into vibrant multi-colored rainbow prisms when catching light. Pristine wet-look finish."},
  {name:"Metallic Gold (Molten Gilded Foil)",cat:"Solid Color & Minimalist",shape:"Almond",prompt:"An editorial studio photograph of a dazzling metallic manicure, medium almond shape. Entirely coated in a heavy blindingly reflective 24k gold mirror chrome powder, detailed with micro-fine horizontal etches to simulate raw brushed gold bars. High-contrast metallic glints."},
  {name:"Jane Austen (Regency Romance)",cat:"Art & Culture",shape:"Oval",prompt:"A beautiful close-up photograph of a vintage 19th-century inspired manicure, medium oval shape. Soft milky tea-rose pink and cream bases. Impeccably detailed microscopic hand-painted English rosebuds and sage green ivy vines winding across the surface. The thumb features a classic matte white cameo silhouette of a Victorian woman's profile set against a soft sage background. Romantic, delicate aesthetic."},
  {name:"Desert Vibes (Mojave Gold Geode)",cat:"Destinations & Vibes",shape:"Almond",prompt:"A stunning close-up photo of a luxury mineral desert manicure, medium almond shape. Highly textured matte sand-beige base mimicking the raw grit of desert dunes. The tips feature an irregular heavily raised 3D vein of molten 24k gold nugget gel cutting across the edges like an unpolished crystal geode fracture. High texturizing contrast, warm sun-drenched lighting."},
];

const CATEGORIES = ["All", ...Array.from(new Set(THEMES.map(t => t.cat)))];
const SHAPES = ["Almond","Coffin","Stiletto","Square","Oval","Round"];
const VIBES = ["Elegant & luxurious","Bold & edgy","Cute & playful","Minimal & clean","Dark & moody","Whimsical & romantic"];
const PALETTES = ["Soft nudes & blush","Deep jewel tones","Chrome & metallics","Pastels","Neon & bright","Black & white","Earth tones","Iridescent & shifting"];
const DETAILS = ["Rhinestone accents","3D elements","Gold foil","Glitter","Marble effect","Floral art","French tips","Chrome powder"];

const CAT_COLORS = {
  "Disney / Fairytale": "#E8D5F5",
  "Taylor Swift Eras": "#FFE4F0",
  "Artists & Concerts": "#FFE4D4",
  "Holiday & Seasonal": "#D4EDD4",
  "Outer Space & Sci-Fi": "#D4D4F5",
  "Wedding & Bridal": "#F5F0E8",
  "Punk & Edgy": "#E8E8E8",
  "Sports & Teams": "#D4EAF5",
  "Sports Mom": "#D4EAF5",
  "Seasonal Vibes": "#E8F5D4",
  "Art & Culture": "#F5E8D4",
  "Destinations & Vibes": "#F5D4D4",
  "Animal Textures": "#EDD4C8",
  "Candy & Whimsy": "#FFD4E8",
  "Solid Color & Minimalist": "#E8E8E8",
};

export default function NailGenerator() {
  const [tab, setTab] = useState("themes");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [promptMode, setPromptMode] = useState("guided");
  const [answers, setAnswers] = useState({ shape: "", vibe: "", palette: "", details: [] });
  const [customText, setCustomText] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [genShape, setGenShape] = useState("Almond");
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultMeta, setResultMeta] = useState("");

  const filtered = selectedCat === "All" ? THEMES : THEMES.filter(t => t.cat === selectedCat);

  const toggleDetail = (d) => {
    setAnswers(prev => ({
      ...prev,
      details: prev.details.includes(d) ? prev.details.filter(x => x !== d) : [...prev.details, d]
    }));
  };

  const buildGuidedPrompt = () => {
    const { shape, vibe, palette, details } = answers;
    if (!shape || !vibe || !palette) return;
    let p = `A macro editorial photo of a luxury nail manicure, ${shape.toLowerCase()} shape. `;
    p += `${palette} color palette. `;
    const vibeMap = {
      "Elegant & luxurious": "Sophisticated, high-end salon aesthetic with flawless execution. ",
      "Bold & edgy": "Striking, high-contrast design with graphic elements. ",
      "Cute & playful": "Charming, fun details with a youthful pop-art energy. ",
      "Minimal & clean": "Clean lines, negative space, understated luxury. ",
      "Dark & moody": "Moody, deep tones with dramatic contrast and texture. ",
      "Whimsical & romantic": "Dreamy, soft, romantic with delicate hand-painted details. ",
    };
    p += vibeMap[vibe] || "";
    if (details.length > 0) p += details.join(", ") + ". ";
    p += "Professional salon lighting, crisp macro photography.";
    setFinalPrompt(p);
    setResultMeta("Custom: " + vibe);
    setGenShape(shape);
    setTab("generate");
  };

  const useTheme = (theme) => {
    setFinalPrompt(theme.prompt);
    setResultMeta(theme.name);
    setGenShape(theme.shape);
    setTab("generate");
  };

  const completedSteps = [answers.shape, answers.vibe, answers.palette].filter(Boolean).length;
  const progress = Math.round((completedSteps / 3) * 100);

  const tabStyle = (t) => ({
    padding: "9px 18px",
    background: "transparent",
    border: "none",
    borderBottom: tab === t ? "2px solid #A855B8" : "2px solid transparent",
    color: tab === t ? "#7C3D8A" : "#888",
    fontWeight: tab === t ? 500 : 400,
    fontSize: 14,
    cursor: "pointer",
    marginBottom: -1,
  });

  const chipStyle = (active) => ({
    padding: "5px 12px",
    borderRadius: 20,
    border: `1px solid ${active ? "#A855B8" : "#ddd"}`,
    background: active ? "#F5E8FA" : "white",
    color: active ? "#7C3D8A" : "#666",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: active ? 500 : 400,
    whiteSpace: "nowrap",
  });

  const qOptStyle = (active) => ({
    padding: "5px 12px",
    borderRadius: 16,
    border: `1px solid ${active ? "#A855B8" : "#e0e0e0"}`,
    background: active ? "#F5E8FA" : "white",
    color: active ? "#7C3D8A" : "#555",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: active ? 500 : 400,
  });

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: "0 4px" }}>
      <div style={{ padding: "1.25rem 0 .75rem", borderBottom: "1px solid #eee", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: "#2a2a2a" }}>✦ Nail Generator</div>
          <div style={{ fontSize: 12, padding: "3px 10px", borderRadius: 12, background: "#F5E8FA", color: "#7C3D8A" }}>200 themes</div>
        </div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>Browse themes or build your own prompt</div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "1.25rem", gap: 2 }}>
        <button style={tabStyle("themes")} onClick={() => setTab("themes")}>Theme library</button>
        <button style={tabStyle("builder")} onClick={() => setTab("builder")}>Prompt builder</button>
        <button style={tabStyle("generate")} onClick={() => setTab("generate")}>Generate</button>
      </div>

      {tab === "themes" && (
        <div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>Filter by category</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.25rem" }}>
            {CATEGORIES.map(c => (
              <button key={c} style={chipStyle(selectedCat === c)} onClick={() => setSelectedCat(c)}>
                {c} <span style={{ opacity: 0.6 }}>({c === "All" ? THEMES.length : THEMES.filter(t => t.cat === c).length})</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 500 }}>
            {filtered.length} themes
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 8, maxHeight: 380, overflowY: "auto", marginBottom: "1rem" }}>
            {filtered.map((t) => (
              <div
                key={t.name}
                onClick={() => setSelectedTheme(selectedTheme?.name === t.name ? null : t)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: selectedTheme?.name === t.name ? "1.5px solid #A855B8" : "1px solid #e8e8e8",
                  cursor: "pointer",
                  background: selectedTheme?.name === t.name ? "#FAF3FC" : "white",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, background: CAT_COLORS[t.cat] || "#eee", marginBottom: 6 }} />
                <div style={{ fontSize: 12, fontWeight: 500, color: "#2a2a2a", lineHeight: 1.3, marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{t.cat}</div>
                <div style={{ marginTop: 6, display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, background: "#f4f4f4", color: "#666" }}>{t.shape}</div>
              </div>
            ))}
          </div>

          {selectedTheme && (
            <div style={{ padding: "14px 16px", background: "#FAF3FC", borderRadius: 10, border: "1px solid #E8D0F0", marginBottom: "1rem" }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "#2a2a2a" }}>{selectedTheme.name}</div>
              <div style={{ fontSize: 12, color: "#7C3D8A", marginBottom: 8 }}>{selectedTheme.cat} · {selectedTheme.shape} shape</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{selectedTheme.prompt.substring(0, 180)}...</div>
              <button
                onClick={() => useTheme(selectedTheme)}
                style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "#7C3D8A", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
              >
                Use this theme →
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "builder" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: "1rem" }}>
            <button style={chipStyle(promptMode === "guided")} onClick={() => setPromptMode("guided")}>Step-by-step guide</button>
            <button style={chipStyle(promptMode === "custom")} onClick={() => setPromptMode("custom")}>Write my own</button>
          </div>

          {promptMode === "guided" && (
            <div>
              <div style={{ height: 4, background: "#f0e8f5", borderRadius: 2, marginBottom: "1rem" }}>
                <div style={{ height: "100%", width: `${Math.max(8, progress)}%`, background: "#A855B8", borderRadius: 2, transition: "width 0.3s" }} />
              </div>

              {[
                { key: "shape", label: "1. What shape are you going for?", options: SHAPES },
                { key: "vibe", label: "2. What vibe are you feeling?", options: VIBES },
                { key: "palette", label: "3. Pick your color palette", options: PALETTES },
              ].map(({ key, label, options }) => (
                <div key={key} style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#2a2a2a" }}>{label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {options.map(o => (
                      <button key={o} style={qOptStyle(answers[key] === o)} onClick={() => setAnswers(prev => ({ ...prev, [key]: o }))}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ background: "#fafafa", borderRadius: 10, padding: "12px 14px", marginBottom: "1rem" }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#2a2a2a" }}>4. Any special details? <span style={{ fontWeight: 400, color: "#aaa" }}>(optional, pick any)</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {DETAILS.map(d => (
                    <button key={d} style={qOptStyle(answers.details.includes(d))} onClick={() => toggleDetail(d)}>{d}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={buildGuidedPrompt}
                disabled={completedSteps < 3}
                style={{
                  width: "100%", padding: 10, borderRadius: 8,
                  border: `1px solid ${completedSteps >= 3 ? "#A855B8" : "#ddd"}`,
                  background: "transparent",
                  color: completedSteps >= 3 ? "#7C3D8A" : "#bbb",
                  fontSize: 14, cursor: completedSteps >= 3 ? "pointer" : "not-allowed", fontWeight: 500,
                }}
              >
                {completedSteps < 3 ? `Answer ${3 - completedSteps} more question${3 - completedSteps > 1 ? "s" : ""} to continue` : "Build my prompt →"}
              </button>
            </div>
          )}

          {promptMode === "custom" && (
            <div>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 10, lineHeight: 1.5 }}>
                Describe exactly what you want. Be specific — shape, color, finish, details, and any special accents.
              </p>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. Long stiletto nails with a deep burgundy velvet magnetic cat-eye finish, accent nail with gold chrome dripping effect from the cuticle, ultra-glossy topcoat, professional salon lighting..."
                style={{ width: "100%", minHeight: 120, padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit" }}
              />
              <button
                onClick={() => { if (customText.trim()) { setFinalPrompt(customText.trim()); setResultMeta("Custom prompt"); setTab("generate"); } }}
                disabled={!customText.trim()}
                style={{ marginTop: 8, width: "100%", padding: 10, borderRadius: 8, border: "1px solid #A855B8", background: "transparent", color: "#7C3D8A", fontSize: 14, cursor: "pointer", fontWeight: 500 }}
              >
                Use this prompt →
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "generate" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontWeight: 500 }}>Your prompt</div>
            <textarea
              value={finalPrompt}
              onChange={e => setFinalPrompt(e.target.value)}
              placeholder="Select a theme or build a prompt first..."
              style={{ width: "100%", minHeight: 180, padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 12, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit" }}
            />

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontWeight: 500 }}>Nail shape</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SHAPES.map(s => (
                  <button key={s} style={chipStyle(genShape === s)} onClick={() => setGenShape(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#bbb", margin: "10px 0 4px" }}>
              <span>Powered by Flux.2 BFL API</span>
              <span>~$0.06–0.08 / image</span>
            </div>

            <button
              onClick={() => {
                if (!finalPrompt.trim()) return;
                setGenerating(true);
                setTimeout(() => { setGenerating(false); setResultUrl("demo"); setResultMeta(resultMeta || "Custom prompt"); }, 2000);
              }}
              disabled={!finalPrompt.trim() || generating}
              style={{
                width: "100%", padding: 12, borderRadius: 8, border: "none",
                background: finalPrompt.trim() ? "#7C3D8A" : "#e0e0e0",
                color: finalPrompt.trim() ? "white" : "#bbb",
                fontSize: 15, fontWeight: 500, cursor: finalPrompt.trim() ? "pointer" : "not-allowed",
              }}
            >
              {generating ? "Generating..." : "Generate design"}
            </button>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontWeight: 500 }}>Result</div>
            <div style={{ borderRadius: 10, border: "1px solid #eee", overflow: "hidden", minHeight: 260, display: "flex", flexDirection: "column" }}>
              {!resultUrl ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#fafafa", minHeight: 260 }}>
                  <div style={{ fontSize: 32, opacity: 0.2 }}>✦</div>
                  <div style={{ fontSize: 13, color: "#bbb" }}>Your design appears here</div>
                </div>
              ) : (
                <div style={{ flex: 1, background: "linear-gradient(135deg, #F5E8FA 0%, #E8D5F5 50%, #F0E8F5 100%)", minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 40 }}>✦</div>
                  <div style={{ fontSize: 12, color: "#7C3D8A", fontWeight: 500 }}>Design generated</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>(Flux.2 result renders here)</div>
                </div>
              )}
              {resultUrl && (
                <div style={{ padding: "10px 12px", borderTop: "1px solid #eee", background: "white" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#2a2a2a", marginBottom: 2 }}>{resultMeta}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>{genShape} shape</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #e0e0e0", background: "white", fontSize: 12, cursor: "pointer", color: "#555" }}>Regenerate</button>
                    <button style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #e0e0e0", background: "white", fontSize: 12, cursor: "pointer", color: "#555" }}>Save</button>
                    <button style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #e0e0e0", background: "white", fontSize: 12, cursor: "pointer", color: "#555" }}>Share</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
