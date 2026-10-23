import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ShoppingCart,
  TrendingUp,
  Package,
  Rocket,
  ChevronRight,
  Search,
  Clock,
  MapPin,
  Shield,
  Truck,
  Heart,
  Users,
  Award,
  ArrowRight,
  Bot,
  Store,
  CheckCircle2,
} from 'lucide-react';

interface ScenarioProduct {
  name: string;
  price: number;
  shop: string;
  time: string;
}

interface Scenario {
  id: string;
  label: string;
  query: string;
  aiExplanation: string;
  products: ScenarioProduct[];
}

const AI_SCENARIOS: Scenario[] = [
  {
    id: 'lasagna',
    label: '🍝 Lasagna Dinner',
    query: 'I want to cook a delicious homemade lasagna tonight',
    aiExplanation: 'Found 4 fresh ingredients from 2 top-rated stores within 1.2 km:',
    products: [
      { name: 'Fresh Lasagna Pasta Sheets (500g)', price: 89, shop: 'Bella Bakery & Pantry', time: '14 mins' },
      { name: 'Fresh Mozzarella & Ricotta Combo', price: 175, shop: 'Milkyway Dairy Hub', time: '12 mins' },
      { name: 'Artisan San Marzano Tomato Sauce', price: 110, shop: 'Bella Bakery & Pantry', time: '14 mins' },
      { name: 'Organic Fresh Basil & Oregano', price: 35, shop: 'Greenleaf Organic Store', time: '18 mins' },
    ],
  },
  {
    id: 'cold',
    label: '🤒 Cold & Flu Relief',
    query: 'I have a sore throat, runny nose and mild fever',
    aiExplanation: 'Prioritized curated relief bundle from nearby verified pharmacies:',
    products: [
      { name: 'Paracetamol 650mg (Pack of 15)', price: 42, shop: 'Apollo Care Pharmacy', time: '9 mins' },
      { name: 'Organic Wildflower Honey & Ginger Tea', price: 135, shop: 'Nature Cure Herbal', time: '15 mins' },
      { name: 'Ayurvedic Steam Inhaler Capsules', price: 78, shop: 'Apollo Care Pharmacy', time: '9 mins' },
      { name: 'Vitamin C 1000mg Chewables', price: 95, shop: 'Wellness First Meds', time: '11 mins' },
    ],
  },
  {
    id: 'party',
    label: '🎂 Birthday Party',
    query: 'Organizing a birthday bash for 8 friends with snacks',
    aiExplanation: 'Curated celebration bundle ready for instant neighborhood dispatch:',
    products: [
      { name: 'Dutch Truffle Cake (1 Kg)', price: 599, shop: 'Sweet Tooth Confectionery', time: '20 mins' },
      { name: 'Gourmet Party Nachos & Salsa Dip Duo', price: 199, shop: 'Daily Delights Mart', time: '12 mins' },
      { name: 'Assorted Sparkling Beverage Pack x6', price: 180, shop: 'Metro Cold Storage', time: '15 mins' },
      { name: 'Eco-friendly Party Confetti & Candles', price: 120, shop: 'Celebration Central', time: '10 mins' },
    ],
  },
  {
    id: 'breakfast',
    label: '🥑 Healthy Breakfast',
    query: 'Quick nutritious high-protein breakfast for busy morning',
    aiExplanation: 'Sourced wholesome fresh items ready for 15-minute dispatch:',
    products: [
      { name: 'Hass Avocado Duo (Ripe & Ready)', price: 140, shop: 'Greenleaf Organic Store', time: '10 mins' },
      { name: 'Multi-Grain Sourdough Loaf', price: 95, shop: 'Artisan Crust Bakery', time: '14 mins' },
      { name: 'Farm-Fresh Free Range Eggs (Pack 6)', price: 75, shop: 'FarmToHome Direct', time: '12 mins' },
      { name: 'Greek Plain Yogurt (400g)', price: 110, shop: 'Milkyway Dairy Hub', time: '12 mins' },
    ],
  },
];

export default function NewHomePage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // AI Simulator State
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [typedQuery, setTypedQuery] = useState('');
  const [simState, setSimState] = useState<'typing' | 'analyzing' | 'done'>('typing');
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeScenario = AI_SCENARIOS[activeScenarioIdx];

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulator typing loop
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTypedQuery('');
    setSimState('typing');
    setVisibleItemsCount(0);

    let charIdx = 0;
    const query = activeScenario.query;

    const typeNext = () => {
      if (charIdx < query.length) {
        charIdx++;
        setTypedQuery(query.slice(0, charIdx));
        timerRef.current = setTimeout(typeNext, 32);
      } else {
        setSimState('analyzing');
        timerRef.current = setTimeout(() => {
          setSimState('done');
          setVisibleItemsCount(activeScenario.products.length);
        }, 700);
      }
    };

    timerRef.current = setTimeout(typeNext, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeScenarioIdx]);

  const bundleTotal = activeScenario.products.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70 text-gray-900 overflow-x-hidden">
      {/* Subtle Cursor Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.07), transparent 80%)`,
        }}
      />

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* Floating Animated Ambient Blobs */}
      <div className="absolute top-20 left-16 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
      <div className="absolute top-40 right-16 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
      <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000" />

      {/* ─── Hero Section ─── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 pt-16 pb-12 sm:pt-24 sm:pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 bg-white/90 backdrop-blur-md border border-blue-200/80 rounded-full shadow-sm hover:shadow transition-shadow"
            >
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Next-Gen Hyper-Local Commerce • Neo4j Graph Search
              </span>
              <Rocket className="w-4 h-4 text-indigo-600" />
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.94 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-tight">
                <span className="inline-block bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Vicinity
                </span>
                <span className="text-blue-600">.</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto font-medium">
                Shop from your neighborhood merchants with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold underline decoration-blue-300 decoration-wavy decoration-2">
                  AI intent search
                </span>{' '}
                and live delivery routing.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 24 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-2"
            >
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto group relative px-8 sm:px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Start Shopping Now</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-white/90 backdrop-blur-md border border-gray-300/80 text-gray-700 rounded-2xl font-bold text-lg hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all duration-300 hover:shadow-md"
              >
                Sign In to Account
              </button>
            </motion.div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Local Stores</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>15-Minute Avg Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Razorpay Secure Split</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Interactive AI Intent Shopping Simulator ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full text-xs font-semibold text-blue-700 mb-2">
                <Bot className="w-3.5 h-3.5" />
                <span>Live Interactive Demo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Experience Natural Language Shopping
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tell Vicinity your symptoms, recipes, or occasion — our Graph AI bundles optimal products instantly.
              </p>
            </div>

            {/* Prompt Selector Chips */}
            <div className="flex flex-wrap gap-2">
              {AI_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    activeScenarioIdx === idx
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Window */}
          <div className="mt-6 space-y-4">
            {/* Buyer Query Prompt */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                You
              </div>
              <div className="bg-blue-50/80 border border-blue-100/80 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-800 font-medium text-sm sm:text-base max-w-2xl shadow-sm flex items-center gap-1">
                <span>{typedQuery}</span>
                {simState === 'typing' && (
                  <span className="w-2 h-4 bg-blue-600 inline-block animate-pulse ml-0.5" />
                )}
              </div>
            </div>

            {/* AI Assistant State */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-blue-500/20">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1">
                {simState === 'analyzing' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-2xl text-xs sm:text-sm text-gray-600 animate-pulse">
                    <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                    <span>Searching neighborhood graph & analyzing store inventories...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{activeScenario.aiExplanation}</span>
                    </div>

                    {/* Curated Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AnimatePresence>
                        {activeScenario.products.slice(0, visibleItemsCount).map((product, idx) => (
                          <motion.div
                            key={product.name}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.08 }}
                            className="bg-white border border-gray-200/90 rounded-2xl p-3.5 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1 text-gray-600">
                                  <Store className="w-3 h-3 text-blue-500" />
                                  {product.shop}
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                  <Clock className="w-3 h-3" />
                                  {product.time}
                                </span>
                              </div>
                            </div>
                            <div className="text-right pl-3 flex-shrink-0">
                              <span className="text-base font-extrabold text-gray-900">₹{product.price}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Bundle Action Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Bundle Total: <strong className="text-lg text-blue-600 font-black">₹{bundleTotal}</strong>{' '}
                        <span className="text-xs text-gray-400">(Includes split delivery)</span>
                      </div>
                      <button
                        onClick={() => navigate('/signup')}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Order This Bundle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Neighborhood Categories ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Explore Your Neighborhood Stores
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Everything you need, sourced from local shops around you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Fresh Groceries', emoji: '🥦', items: '1,200+ items', color: 'from-green-500 to-emerald-600' },
            { name: 'Pharmacies', emoji: '💊', items: '450+ meds', color: 'from-blue-500 to-cyan-600' },
            { name: 'Artisan Bakery', emoji: '🥐', items: 'Daily bakes', color: 'from-amber-500 to-orange-600' },
            { name: 'Daily Essentials', emoji: '🧴', items: 'Personal care', color: 'from-purple-500 to-indigo-600' },
            { name: 'Meat & Dairy', emoji: '🥩', items: 'Fresh cuts', color: 'from-rose-500 to-red-600' },
          ].map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => navigate('/buyer')}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-5 text-center cursor-pointer shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <h4 className="font-bold text-gray-800 text-sm sm:text-base">{cat.name}</h4>
              <span className="text-xs text-gray-500 font-medium">{cat.items}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Why Choose Vicinity?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            A smarter local economy combining natural language AI with hyperlocal dispatch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: Zap,
              title: 'Lightning Dispatch',
              description: 'Orders routed automatically to the nearest merchant for instant preparation and pickup.',
              color: 'from-amber-400 to-orange-400',
              delay: 0,
            },
            {
              icon: Sparkles,
              title: 'Intent-Based Search',
              description: 'Search symptoms, meal cravings, or household tasks without guessing specific product SKUs.',
              color: 'from-blue-500 to-indigo-500',
              delay: 0.1,
            },
            {
              icon: TrendingUp,
              title: 'Fair Neighborhood Pricing',
              description: 'Transparent merchant rates with multi-vendor cart consolidation and no hidden markups.',
              color: 'from-emerald-400 to-teal-500',
              delay: 0.2,
            },
            {
              icon: MapPin,
              title: 'Live Interactive Maps',
              description: 'Real-time Leaflet delivery visualization with animated courier progress right to your door.',
              color: 'from-cyan-400 to-blue-500',
              delay: 0.3,
            },
            {
              icon: Shield,
              title: 'Split Razorpay Escrow',
              description: 'One single payment automatically divided amongst vendors cleanly with instant settlements.',
              color: 'from-indigo-400 to-purple-500',
              delay: 0.4,
            },
            {
              icon: Heart,
              title: 'Support Local Sellers',
              description: 'Empower neighborhood mom-and-pop storefronts with enterprise-grade digital tools.',
              color: 'from-rose-400 to-pink-500',
              delay: 0.5,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative p-6 sm:p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-md text-white`}>
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── How It Works ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            How Vicinity Works
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            From natural search to doorstep delivery in four effortless steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Search, title: '1. Express Need', desc: 'Type symptoms or recipes in natural everyday language.' },
            { icon: Sparkles, title: '2. AI Bundling', desc: 'Our Neo4j graph matches the nearest stockist inventories.' },
            { icon: ShoppingCart, title: '3. One-Click Cart', desc: 'Multi-shop products unified into a single checkout.' },
            { icon: Truck, title: '4. Live Track', desc: 'Watch real-time doorstep delivery on the live map.' },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/80 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 text-white shadow-lg shadow-blue-500/20">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">{step.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Stats Banner ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16"
      >
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { icon: Users, value: '50K+', label: 'Happy Neighborhood Buyers' },
              { icon: Package, value: '120K+', label: 'Products Cataloged' },
              { icon: Clock, value: '14 min', label: 'Average Dispatch Time' },
              { icon: Award, value: '4.9★', label: 'Storefront Rating' },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-blue-200 opacity-90" />
                <div className="text-3xl sm:text-4xl md:text-5xl font-black">{stat.value}</div>
                <div className="text-xs sm:text-sm text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Final Call To Action ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Empowering Local Neighborhoods
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you want 15-minute essentials or want to launch your own local shop, Vicinity connects you directly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/seller')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-white border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 rounded-2xl font-bold text-lg transition-all"
          >
            Become a Seller
          </button>
        </div>
      </motion.div>

      {/* Animations CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(16px, -40px) scale(1.08); }
          50% { transform: translate(-16px, 16px) scale(0.92); }
          75% { transform: translate(36px, 36px) scale(1.04); }
        }
        .animate-blob {
          animation: blob 18s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
