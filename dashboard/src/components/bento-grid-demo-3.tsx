"use client";
import { cn } from "@/lib/cn";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Activity, Terminal, Bot, User, Blocks, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function BentoGridThirdDemo() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-[#cfdbd5]/20 p-2 items-center space-x-2 bg-[#333533]"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#f5cb5c] to-[#4BCE97] shrink-0" />
        <div className="w-full bg-[#242423] h-4 rounded-full" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-[#cfdbd5]/20 p-2 items-center space-x-2 w-3/4 ml-auto bg-[#333533]"
      >
        <div className="w-full bg-[#242423] h-4 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#f5cb5c] to-[#4BCE97] shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-[#cfdbd5]/20 p-2 items-center space-x-2 bg-[#333533]"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#f5cb5c] to-[#4BCE97] shrink-0" />
        <div className="w-full bg-[#242423] h-4 rounded-full" />
      </motion.div>
    </motion.div>
  );
};
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const arr = new Array(6).fill(0);
  const widths = ["65%", "85%", "45%", "90%", "75%", "55%"];
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] flex-col space-y-2"
    >
      {arr.map((_, i) => (
        <motion.div
          key={"skelenton-two" + i}
          variants={variants}
          style={{
            maxWidth: widths[i],
          }}
          className="flex flex-row rounded-full border border-[#cfdbd5]/20 p-2 items-center space-x-2 bg-[#242423] w-full h-4"
        ></motion.div>
      ))}
    </motion.div>
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl flex-col p-5 relative overflow-hidden bg-[#333533] border border-[#cfdbd5]/20 shadow-inner"
    >
      <div className="flex gap-1.5 mb-4 relative z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#F87168]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#F5CD47]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#4BCE97]"></div>
      </div>
      <div className="font-mono text-xs sm:text-xs text-[#cfdbd5] leading-relaxed space-y-1.5 relative z-10">
        <p className="flex items-center gap-2"><span className="text-[#f5cb5c]">➜</span> <span className="text-[#e8eddf]">agent run --incident-id 9821</span></p>
        <p className="opacity-80 pt-1">Initializing LangGraph...</p>
        <p className="text-[#4BCE97] flex items-center gap-1.5"><CheckCircle2 size={12} /> mcp-github attached</p>
        <p className="text-[#4BCE97] flex items-center gap-1.5"><CheckCircle2 size={12} /> mcp-datadog attached</p>
        <p className="mt-3 text-[#e8eddf] animate-pulse pt-1">Synthesizing root cause...</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5cb5c]/5 to-transparent opacity-50 z-0 pointer-events-none"></div>
    </motion.div>
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-[#333533] border border-[#cfdbd5]/20 flex flex-col items-center justify-center p-4"
      >
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10 bg-[#242423]"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-[#cfdbd5] mt-4">
          PagerDuty Trigger
        </p>
        <p className="border border-[#F87168]/30 bg-[#F87168]/10 text-[#F87168] text-xs rounded-full px-2 py-0.5 mt-4">
          Incident
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-[#333533] border border-[#cfdbd5]/20 flex flex-col items-center justify-center p-4">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sreejesh"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10 bg-[#242423]"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-[#e8eddf] mt-4">
          Sreejesh - Lead Architect
        </p>
        <p className="border border-[#4BCE97]/30 bg-[#4BCE97]/10 text-[#4BCE97] text-xs rounded-full px-2 py-0.5 mt-4">
          Developer
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-[#333533] border border-[#cfdbd5]/20 flex flex-col items-center justify-center p-4"
      >
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bot"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10 bg-[#242423]"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-[#cfdbd5] mt-4">
          AI Context Engine
        </p>
        <p className="border border-[#F5CD47]/30 bg-[#F5CD47]/10 text-[#F5CD47] text-xs rounded-full px-2 py-0.5 mt-4">
          Agentic
        </p>
      </motion.div>
    </motion.div>
  );
};
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-[#cfdbd5]/20 p-2 items-start space-x-2 bg-[#333533]"
      >
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10 bg-[#242423]"
        />
        <p className="text-xs text-[#cfdbd5]">
          Manual incident triage wastes an average of 30 minutes gathering context across Datadog, GitHub, and runbooks...
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-[#cfdbd5]/20 p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-[#333533]"
      >
        <p className="text-xs text-[#e8eddf]">Automate it.</p>
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#f5cb5c] to-[#4BCE97] shrink-0" />
      </motion.div>
    </motion.div>
  );
};
const items = [
  {
    title: "ContextOps Scope",
    description: (
      <span className="text-sm">
        Built to autonomously triage and synthesize production outages.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <Activity className="h-4 w-4 text-[#cfdbd5]" />,
  },
  {
    title: "Why Developers Need This",
    description: (
      <span className="text-sm">
        Eliminate the manual toll of context gathering during 3 AM pages.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <Terminal className="h-4 w-4 text-[#cfdbd5]" />,
  },
  {
    title: "How It Operates",
    description: (
      <span className="text-sm">
        Webhooks trigger a LangGraph agent equipped with MCP tools.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <Bot className="h-4 w-4 text-[#cfdbd5]" />,
  },
  {
    title: "Built by Sreejesh",
    description: (
      <span className="text-sm">
        Developed as an advanced AI incident engine demonstrating modern AIOps capabilities.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <User className="h-4 w-4 text-[#cfdbd5]" />,
  },
  {
    title: "Extensible Architecture",
    description: (
      <span className="text-sm">
        Not just GitHub. Plug into Datadog, AWS, and Stripe seamlessly.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <Blocks className="h-4 w-4 text-[#cfdbd5]" />,
  },
];
