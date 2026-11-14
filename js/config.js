/* ==========================================================================
   SITE CONFIG — single source of truth
   --------------------------------------------------------------------------
   Everything you are likely to change lives in this file: the site URL, your
   contact details, and the lists of projects, services, process steps and
   testimonials.

   HOW IT WORKS
   - js/main.js reads this object and renders the cards into the page.
   - index.html also contains a plain-HTML copy of this content so the site
     still works (and stays readable to search engines) if JavaScript is off.
     If you change wording here, change the matching text in index.html too,
     or simply keep editing here and accept that the no-JS fallback is older.
   - No frameworks, no build step. Edit, save, upload.
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------------
     1. URL and launch switches
     --------------------------------------------------------------------- */
  SITE_URL: "https://example-portfolio.hostingersite.com", // no trailing slash

  // true  -> pages ask search engines not to index the site (Hostinger demo URL)
  // false -> normal indexing at launch. Also edit robots.txt (see README).
  NOINDEX_UNTIL_LAUNCH: true,

  SHOW_TESTIMONIALS: true, // false hides the whole testimonials section
  SHOW_SAMPLE_BADGE: true, // false hides the "Sample" badge on placeholder quotes

  /* ---------------------------------------------------------------------
     2. Identity and contact details
     --------------------------------------------------------------------- */
  name: "Vaheed Basha",
  title: "Independent Web Developer · Product Builder",
  role: "Independent Web Developer",
  email: "vaheedbasha882@gmail.com",
  phone: "9550926882",
  phoneInternational: "919550926882",
  whatsapp: "919550926882",
  whatsappText: "Hi Vaheed, I'd like to discuss a website project.",
  linkedin: "https://www.linkedin.com/in/vaheed-basha/",
  location: "India",
  availability: "Open for projects · replies within 24h",

  /* ---------------------------------------------------------------------
     3. Projects
     kind:  "featured" -> big image-led cards   | "more" -> compact grid
            "demo"     -> demos & previews row
     type:  "business" | "app"  (used by the All / Business / Web Apps filters)
     --------------------------------------------------------------------- */
  projects: [
    {
      slug: "urban-club",
      kind: "featured",
      type: "business",
      name: "Urban Club Relocation",
      url: "https://urbanclubpackersandmovers.in/",
      category: "Business Website",
      status: "Live",
      description:
        "A relocation company's main website: clear service pages, honest trust signals and an enquiry path that is never more than a tap away on a phone.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "SEO"],
      role: "Design and front-end build, enquiry form, on-page SEO and launch.",
      case: {
        challenge:
          "The business was competing with large aggregators and needed a site that looked credible on a phone, where most of its customers arrive.",
        built:
          "A fast, mobile-first site with dedicated moving and packing service sections, a visible call and WhatsApp action, and an enquiry form that reaches the owner directly.",
        result:
          "The site now works as the company's day-to-day front door for local enquiries, and the owner can point customers to one clear link.",
      },
      imageAlt: "Home page of the Urban Club Relocation website",
    },
    {
      slug: "move-express",
      kind: "featured",
      type: "business",
      name: "Move Express Packers",
      url: "https://movexpresspacker.in/",
      category: "Business Website",
      status: "Live",
      description:
        "A packers and movers site built around the questions customers actually ask: what is covered, how pricing works, and how to book a move quickly.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "SEO"],
      role: "Layout and visual design, responsive build, enquiry handling, basic SEO setup.",
      case: {
        challenge:
          "A newer moving business needed a professional presence that could earn trust against older local competitors.",
        built:
          "A clean single-brand site with service coverage, a simple quote request flow and phone and WhatsApp actions that stay reachable while scrolling.",
        result:
          "Enquiries arrive in one inbox with the customer's details already filled in, so the first reply can go out without back-and-forth.",
      },
      imageAlt: "Home page of the Move Express Packers website",
    },
    {
      slug: "trust-line",
      kind: "featured",
      type: "business",
      name: "Trust Line Cargo",
      url: "https://trustlinecargopackersandmovers.in/",
      category: "Business Website",
      status: "Live",
      description:
        "A cargo and packing business with services spread across household shifting, office moves and transport, presented in one tidy, readable structure.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "SEO"],
      role: "Information structure, design, responsive front-end and form setup.",
      case: {
        challenge:
          "Several different services were being explained in one long page, which made the business look smaller than it is.",
        built:
          "A sectioned site that separates each service, repeats the enquiry actions in sensible places, and keeps the writing short and specific.",
        result:
          "Visitors can find the service they need in a couple of taps, and the owner has a site that is easy to update as services grow.",
      },
      imageAlt: "Home page of the Trust Line Cargo website",
    },
    {
      slug: "cool-logistics",
      kind: "more",
      type: "business",
      name: "Cool Logistics",
      url: "https://coollogisticspackers.in/",
      category: "Business Website",
      status: "Live",
      description: "Packers and movers site focused on quick enquiries and clear service coverage.",
      tags: ["HTML", "CSS", "JavaScript", "PHP"],
      imageAlt: "Home page of the Cool Logistics website",
    },
    {
      slug: "shiftezy",
      kind: "more",
      type: "business",
      name: "ShiftEzy",
      url: "https://shiftezy.in/",
      category: "Business Website",
      status: "Live",
      description: "Relocation brand website with a light, modern feel and a simple quote path.",
      tags: ["HTML", "CSS", "JavaScript", "PHP"],
      imageAlt: "Home page of the ShiftEzy website",
    },
    {
      slug: "shiv-transport",
      kind: "more",
      type: "business",
      name: "Shiv Transport",
      url: "https://www.shivtransportpackers.in/",
      category: "Business Website",
      status: "Live",
      description: "Transport and packing site built for straightforward browsing on mobile.",
      tags: ["HTML", "CSS", "JavaScript", "PHP"],
      imageAlt: "Home page of the Shiv Transport website",
    },
    {
      slug: "coachdesk",
      kind: "demo",
      type: "app",
      name: "CoachDesk",
      url: "https://aqua-louse-772157.hostingersite.com/",
      category: "Web App",
      badge: "Demo build",
      linkLabel: "Open demo",
      description:
        "A coaching and school management application: students, batches, attendance and fee records in one dashboard.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
      imageAlt: "Dashboard screen of the CoachDesk demo application",
    },
    {
      slug: "freshsupply",
      kind: "demo",
      type: "app",
      name: "FreshSupply",
      url: "https://lavenderblush-barracuda-324357.hostingersite.com/",
      category: "Web App",
      badge: "Demo build",
      linkLabel: "Open demo",
      description:
        "An online vegetable ordering website with product listings, a cart and a checkout flow built on PHP and MySQL.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
      imageAlt: "Product listing screen of the FreshSupply demo website",
    },
    {
      slug: "easy-shift",
      kind: "demo",
      type: "business",
      name: "Easy Shift Relocations",
      url: "https://darkred-albatross-330697.hostingersite.com/",
      category: "Business Website",
      badge: "Delivered · launching soon",
      linkLabel: "Preview",
      description:
        "A packers and movers website delivered to the business owner, currently waiting on its own domain before going live.",
      tags: ["HTML", "CSS", "JavaScript", "PHP", "SEO"],
      imageAlt: "Home page preview of the Easy Shift Relocations website",
    },
  ],

  /* ---------------------------------------------------------------------
     4. Services
     --------------------------------------------------------------------- */
  services: [
    {
      icon: "monitor",
      title: "Business Websites",
      description: "A fast, credible website that answers the questions customers ask before they call.",
      bullets: [
        "Responsive, SEO-ready page structure",
        "Service pages written around real enquiries",
        "Hosting, domain and launch handled",
      ],
    },
    {
      icon: "layout",
      title: "UI/UX & Design",
      description: "Clean, familiar interfaces that look good and are easy to use on any screen.",
      bullets: [
        "Mobile-first layouts and readable type",
        "Clear hierarchy, spacing and contrast",
        "A small, reusable style system",
      ],
    },
    {
      icon: "code",
      title: "Web Applications",
      description: "Custom PHP and MySQL tools that replace spreadsheets and repeated manual work.",
      bullets: [
        "Admin dashboards, records and reports",
        "Built around the way your team works",
        "Clean data handling and exports",
      ],
    },
    {
      icon: "wrench",
      title: "Maintenance & Support",
      description: "Updates and fixes after launch, so the site keeps working while you run the business.",
      bullets: [
        "Content changes and bug fixes",
        "Backups and uptime checks",
        "Plain-language help when you need it",
      ],
    },
  ],

  /* ---------------------------------------------------------------------
     5. Process
     --------------------------------------------------------------------- */
  process: [
    { title: "Discuss", text: "We talk through the business, the customers and what the site has to do." },
    { title: "Design", text: "I map the pages and share a clean design for your feedback." },
    { title: "Build", text: "I build it responsive, fast and SEO-ready, then test it on real phones." },
    { title: "Launch", text: "Domain, hosting, forms and search setup are checked before it goes live." },
    { title: "Support", text: "I stay reachable for fixes, updates and small changes after launch." },
  ],

  /* ---------------------------------------------------------------------
     6. Testimonials — PLACEHOLDERS
     ---------------------------------------------------------------------
     Replace these with real quotes (and the client's permission) before you
     promote the site publicly. Every entry below is marked isSample: true and
     shows a "Sample" badge while SHOW_SAMPLE_BADGE is true.
     --------------------------------------------------------------------- */
  testimonials: [
    {
      quote:
        "He understood our moving business before designing anything, and the site says what we actually do. It loads quickly on a phone, which is where almost all our customers find us.",
      author: "Sample Client",
      role: "Owner, Packers & Movers Business",
      isSample: true,
    },
    {
      quote:
        "The work was delivered quickly and the design feels modern without being confusing. Our customers can now send an enquiry in a few taps instead of calling and waiting.",
      author: "Sample Client",
      role: "Owner, Cargo & Logistics Business",
      isSample: true,
    },
    {
      quote:
        "Communication was clear from the first call to the launch. When we asked for small changes, they were done properly instead of half-fixed.",
      author: "Sample Client",
      role: "Manager, Relocation Services",
      isSample: true,
    },
  ],
};
