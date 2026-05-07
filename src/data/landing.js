import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "10K+",
    label: "Active Users",
  },
  {
    value: "$2B+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.7/5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "AI-driven insights to help you visualize and understand your spending patterns",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Instant data extraction from any receipt using high-precision AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Dynamic limits and intelligent recommendations to keep your savings on track",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Consolidate all your bank accounts and cards into one unified dashboard",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Multi-Currency",
    description: "Seamless global spending with real-time conversion and expense tracking",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Proactive alerts and personalized tips to optimize your financial health",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Adriana Martins",
    role: "Product Designer",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "SmartSpend's UI is a breath of fresh air. It’s rare to find a financial tool that balances complex AI analytics with such an intuitive, elegant user experience.",
  },
  {
    name: "James McAvoy",
    role: "Tech Lead @ Innovate",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The automation here is top-tier. Integrating my accounts took seconds, and the real-time insights have completely changed how I approach my monthly savings targets.",
  },
  {
    name: "Sanya Gupta",
    role: "Global Marketing Director",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "Managing finances across multiple currencies used to be a headache. SmartSpend handles everything seamlessly with real-time conversion and incredibly deep analytics.",
  },
];