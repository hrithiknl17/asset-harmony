import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, LogIn, Sofa, UtensilsCrossed, Bed, Lamp, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-living.jpg";
import kitchenImg from "@/assets/section-kitchen.jpg";
import bedroomImg from "@/assets/section-bedroom.jpg";
import { useRef } from "react";

const categories = [
  { name: "Living Room", desc: "Sofas, shelves & coffee tables crafted for everyday comfort.", icon: Sofa, image: heroImg },
  { name: "Kitchen", desc: "Cabinets, islands & storage that make cooking a joy.", icon: UtensilsCrossed, image: kitchenImg },
  { name: "Bedroom", desc: "Beds, wardrobes & nightstands for restful living.", icon: Bed, image: bedroomImg },
  { name: "Lighting", desc: "Pendant lamps, floor lights & smart solutions.", icon: Lamp, image: kitchenImg },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[hsl(30,8%,6%)] text-white min-h-screen overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-bold uppercase tracking-[0.25em] text-white/90"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          MÖBEL HAUS
        </motion.span>

        <div className="flex items-center gap-6">
          <motion.a
            href="#categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden sm:block text-xs font-semibold uppercase tracking-[0.15em] text-white/50 hover:text-white/90 transition-colors"
          >
            Collections
          </motion.a>
          <motion.a
            href="#about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden sm:block text-xs font-semibold uppercase tracking-[0.15em] text-white/50 hover:text-white/90 transition-colors"
          >
            About
          </motion.a>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-white/15 hover:text-white transition-all duration-300"
            >
              <LogIn className="h-3.5 w-3.5" />
              Inventory Login
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <img src={heroImg} alt="Modern Scandinavian living room" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(30,8%,6%)]/70 via-[hsl(30,8%,6%)]/40 to-[hsl(30,8%,6%)]" />
        </motion.div>

        <motion.div className="relative z-10 text-center px-6 max-w-3xl" style={{ opacity: heroOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-white/40 mb-4"
          >
            Scandinavian Design • Since 2024
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Furniture for
            <br />
            <span className="text-[hsl(36,80%,60%)]">modern living</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-6 text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed"
          >
            Every piece is designed around your comfort, space, and lifestyle — so you can focus on what truly matters.
          </motion.p>
          <motion.a
            href="#categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="inline-flex items-center gap-2 mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowDown className="h-3 w-3 animate-bounce" />
            Explore collections
          </motion.a>
        </motion.div>
      </section>

      {/* ── About strip ── */}
      <section id="about" className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
            className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-white/70"
          >
            <span className="text-white font-bold">Möbel Haus®</span> is a furniture brand with over{" "}
            <span className="text-[hsl(36,80%,60%)]">2,000 products</span> across living, kitchen, bedroom & office.
            From minimalist Scandinavian aesthetics to functional everyday solutions — we design spaces that feel like home.
          </motion.p>
          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              { val: "2,000+", label: "Products" },
              { val: "150+", label: "Stores worldwide" },
              { val: "est. 2024", label: "Founded" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(36,80%,60%)]">{s.val}</p>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-white/30">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section id="categories" className="py-20 sm:py-28 px-6 sm:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-3"
          >
            Collections
          </motion.p>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-16"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Designed for every room
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="h-4 w-4 text-[hsl(36,80%,60%)]" />
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[hsl(36,80%,60%)]">{cat.name}</p>
                  </div>
                  <p className="text-sm text-white/60 max-w-xs">{cat.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 group-hover:text-white/80 transition-colors">
                    Explore <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Footer ── */}
      <section className="py-24 sm:py-32 px-6 text-center border-t border-white/5">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="max-w-lg mx-auto space-y-6"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Your space, your story
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Visit our stores or explore online. Every piece at Möbel Haus is built for modern life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#categories"
              className="rounded-full bg-[hsl(36,80%,60%)] px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[hsl(30,8%,6%)] hover:bg-[hsl(36,80%,70%)] transition-colors"
            >
              Shop Now
            </a>
            <Link
              to="/login"
              className="rounded-full border border-white/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              Staff Login →
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 text-[10px] text-white/20 font-medium uppercase tracking-[0.2em]">
          © 2024 Möbel Haus — Scandinavian Furniture
        </div>
      </section>
    </div>
  );
};

export default Home;
